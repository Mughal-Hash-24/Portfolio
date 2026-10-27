"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import type { AskMessage } from "@/lib/ask/messages";

type ChatMessage = AskMessage & { id: number };
type ChatStatus = "idle" | "streaming";

type AskChatProps = {
  suggestedQuestions: string[];
  contactEmail: string;
};

function errorMessageFrom(payload: unknown): string {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "error" in payload &&
    typeof (payload as { error?: unknown }).error === "string"
  ) {
    return (payload as { error: string }).error;
  }

  return "The AI guide is unavailable right now.";
}

export function AskChat({ suggestedQuestions, contactEmail }: AskChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<ChatStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const nextId = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const streamingRef = useRef(false);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  function appendAssistant(id: number, chunk: string) {
    setMessages((previous) =>
      previous.map((message) =>
        message.id === id ? { ...message, content: message.content + chunk } : message,
      ),
    );
  }

  async function send(text: string) {
    const question = text.trim();
    if (!question || streamingRef.current) return;

    streamingRef.current = true;
    setError(null);

    const userMessage: ChatMessage = {
      id: nextId.current++,
      role: "user",
      content: question,
    };
    const assistantId = nextId.current++;
    const history = [...messages, userMessage]
      .slice(-8)
      .map(({ role, content }) => ({ role, content }));

    setMessages((previous) => [
      ...previous,
      userMessage,
      { id: assistantId, role: "assistant", content: "" },
    ]);
    setInput("");
    setStatus("streaming");

    const controller = new AbortController();
    abortRef.current = controller;
    let received = "";

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const payload: unknown = await response.json().catch(() => null);
        setError(errorMessageFrom(payload));
        setMessages((previous) => previous.filter((message) => message.id !== assistantId));
        return;
      }

      if (!response.body) {
        throw new Error("No response stream");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        if (chunk) {
          received += chunk;
          appendAssistant(assistantId, chunk);
        }
      }

      const tail = decoder.decode();
      if (tail) {
        received += tail;
        appendAssistant(assistantId, tail);
      }

      if (!received) {
        setError("No answer came back. Try again or use the FAQ below.");
        setMessages((previous) => previous.filter((message) => message.id !== assistantId));
      }
    } catch {
      if (controller.signal.aborted) return;

      setError("The connection dropped. Try again or use the FAQ below.");
      setMessages((previous) =>
        previous.filter((message) => message.id !== assistantId || message.content.length > 0),
      );
    } finally {
      streamingRef.current = false;
      setStatus("idle");
      abortRef.current = null;
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void send(input);
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void send(input);
    }
  }

  function stop() {
    abortRef.current?.abort();
  }

  const isStreaming = status === "streaming";

  return (
    <div className="chapter-terminal">
      <p>
        <span className="chapter-prompt">$</span> ask-my-ai
      </p>

      <div
        role="log"
        aria-live="polite"
        aria-relevant="additions text"
        aria-busy={isStreaming}
        className="mt-4 space-y-4"
      >
        {messages.length === 0 ? (
          <p className="chapter-terminal-output">
            Ask about Ibtasaam&apos;s work, projects, skills, education, or experience.
          </p>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={message.role === "user" ? "text-right" : ""}>
              <p className="text-xs tracking-[0.2em] text-[var(--chapter-muted)] uppercase">
                {message.role === "user" ? "you" : "ask-my-ai"}
              </p>
              <p
                className={`mt-1 text-sm break-words whitespace-pre-wrap ${
                  message.role === "user"
                    ? "text-[var(--chapter-accent)]"
                    : "text-[var(--chapter-fg)]"
                }`}
              >
                {message.content || (message.role === "assistant" && isStreaming ? "…" : "")}
              </p>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {suggestedQuestions.map((question) => (
          <button
            key={question}
            type="button"
            onClick={() => void send(question)}
            disabled={isStreaming}
            className="border border-[var(--chapter-line)] px-2 py-1 text-left font-mono text-xs text-[var(--chapter-muted)] transition-colors hover:border-[var(--chapter-accent)] hover:text-[var(--chapter-accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--chapter-accent)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {question}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <label htmlFor="ask-input" className="sr-only">
          Ask a question
        </label>
        <textarea
          id="ask-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={1000}
          rows={2}
          placeholder="Ask about Ibtasaam…"
          className="min-h-11 flex-1 resize-none border border-[var(--chapter-line)] bg-transparent px-3 py-2 font-mono text-sm text-[var(--chapter-fg)] placeholder:text-[var(--chapter-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--chapter-accent)]"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isStreaming || !input.trim()}
            className="border border-[var(--chapter-line)] px-4 py-2 font-mono text-sm text-[var(--chapter-accent)] transition-colors hover:border-[var(--chapter-accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--chapter-accent)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
          {isStreaming ? (
            <button
              type="button"
              onClick={stop}
              className="border border-[var(--chapter-line)] px-4 py-2 font-mono text-sm text-[var(--chapter-muted)] transition-colors hover:border-[var(--chapter-accent)] hover:text-[var(--chapter-accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--chapter-accent)]"
            >
              Stop
            </button>
          ) : null}
        </div>
      </form>

      {error ? (
        <p
          role="alert"
          className="mt-4 border border-[var(--chapter-line)] p-3 text-sm text-[var(--chapter-fg)]"
        >
          {error}{" "}
          <a href="#faq" className="underline">
            Browse the FAQ
          </a>{" "}
          or email{" "}
          <a href={`mailto:${contactEmail}`} className="underline">
            {contactEmail}
          </a>
          .
        </p>
      ) : null}

      <p className="mt-4 text-xs leading-relaxed text-[var(--chapter-muted)]">
        AI guide. Answers come from a curated knowledge base and may make mistakes. For anything
        important, email{" "}
        <a href={`mailto:${contactEmail}`} className="underline">
          {contactEmail}
        </a>
        .
      </p>
    </div>
  );
}
