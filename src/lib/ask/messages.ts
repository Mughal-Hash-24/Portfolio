export type AskMessage = {
  role: "user" | "assistant";
  content: string;
};

export const ASK_LIMITS = {
  maxMessages: 8,
  maxMessageChars: 1_000,
  maxTotalChars: 5_000,
} as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseAskMessages(value: unknown): AskMessage[] | null {
  if (!isRecord(value)) return null;

  const rawMessages = value.messages;
  if (
    !Array.isArray(rawMessages) ||
    rawMessages.length === 0 ||
    rawMessages.length > ASK_LIMITS.maxMessages
  ) {
    return null;
  }

  let totalChars = 0;
  const messages: AskMessage[] = [];

  for (const rawMessage of rawMessages) {
    if (!isRecord(rawMessage)) return null;

    const { role, content } = rawMessage;
    if (role !== "user" && role !== "assistant") return null;
    if (typeof content !== "string") return null;

    const trimmed = content.trim();
    if (!trimmed || trimmed.length > ASK_LIMITS.maxMessageChars) return null;

    totalChars += trimmed.length;
    if (totalChars > ASK_LIMITS.maxTotalChars) return null;

    messages.push({ role, content: trimmed });
  }

  return messages[messages.length - 1]?.role === "user" ? messages : null;
}
