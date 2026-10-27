import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { askSystemPrompt, buildAskContext } from "@/content/ask";
import { parseAskMessages } from "@/lib/ask/messages";
import { checkAskRateLimit } from "@/lib/ask/rate-limit";

export const maxDuration = 30;

const MAX_BODY_BYTES = 20_000;

function errorResponse(message: string, status: number, headers?: Record<string, string>) {
  return Response.json(
    { error: message, fallback: true },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
        ...headers,
      },
    },
  );
}

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return errorResponse("Send the conversation as JSON.", 415);
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return errorResponse("That conversation is too long.", 413);
  }

  const rateLimit = await checkAskRateLimit(request);
  if (!rateLimit.allowed) {
    const isBurst = rateLimit.reason === "minute" || rateLimit.reason === "global-minute";
    return errorResponse(
      isBurst
        ? "The AI guide is handling a lot right now. Give it a moment and try again."
        : "The AI guide has reached its limit for today. Use the FAQ below or email Ibtasaam.",
      429,
      rateLimit.headers,
    );
  }

  const body: unknown = await request.json().catch(() => null);
  const messages = parseAskMessages(body);
  if (!messages) {
    return errorResponse("Send 1–8 messages, ending with a user question.", 400, rateLimit.headers);
  }

  const apiKey = process.env.AI_API_KEY?.trim();
  const modelId = process.env.AI_MODEL?.trim();
  if (!apiKey || !modelId) {
    return errorResponse(
      "The AI guide is not configured yet. Use the FAQ below or email Ibtasaam.",
      503,
      rateLimit.headers,
    );
  }

  const question = messages[messages.length - 1]?.content ?? "";
  const { context } = buildAskContext(question);
  const provider = createOpenAI({
    apiKey,
    baseURL: process.env.AI_BASE_URL?.trim() || undefined,
  });

  try {
    const result = streamText({
      model: provider.chat(modelId),
      instructions: `${askSystemPrompt}\n\n--- BEGIN KNOWLEDGE ---\n${context}\n--- END KNOWLEDGE ---`,
      messages,
      maxOutputTokens: 300,
      temperature: 0.5,
      maxRetries: 0,
      timeout: 30_000,
      abortSignal: request.signal,
      providerOptions: {
        openai: {
          reasoningEffort: "low",
        },
      },
      onError: ({ error }) => {
        console.error("[ask] stream error", error instanceof Error ? error.message : error);
      },
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of result.textStream) {
            controller.enqueue(encoder.encode(chunk));
          }
        } catch (error) {
          console.error("[ask] upstream error", error instanceof Error ? error.message : error);
          try {
            controller.enqueue(
              encoder.encode(
                "The AI guide is busy right now. Please try again in a minute, or use the FAQ below.",
              ),
            );
          } catch {
            // The client disconnected before the fallback could be sent.
          }
        } finally {
          try {
            controller.close();
          } catch {
            // The stream is already closed.
          }
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
        ...rateLimit.headers,
      },
    });
  } catch (error) {
    console.error("[ask] request error", error instanceof Error ? error.message : error);
    return errorResponse(
      "The AI guide is unavailable right now. Use the FAQ below or email Ibtasaam.",
      502,
      rateLimit.headers,
    );
  }
}
