"use client";

import { MotionConfig, motion } from "motion/react";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import type { AskMessage } from "@/lib/ask/messages";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { LegoBrick, LegoFace, LegoStuds, brickStyle, type LegoColor } from "./lego-brick";
import { LegoLoader } from "./lego-loader";

type ChatMessage = AskMessage & { id: number };
type ChatStatus = "idle" | "streaming";

type AskChatProps = {
  suggestedQuestions: string[];
  contactEmail: string;
};

const rowColors: LegoColor[] = ["yellow", "blue", "green", "red"];
const starterColors: LegoColor[] = ["blue", "red", "yellow", "green"];

const knowledgeBricks: Array<{
  label: string;
  count: string;
  color: LegoColor;
  prompt: string;
}> = [
  {
    label: "Projects",
    count: "21",
    color: "blue",
    prompt: "Tell me about his strongest projects.",
  },
  {
    label: "Experience",
    count: "7",
    color: "green",
    prompt: "What is his work experience?",
  },
  {
    label: "Skills",
    count: "7",
    color: "yellow",
    prompt: "What is his tech stack?",
  },
  {
    label: "Honors",
    count: "11",
    color: "red",
    prompt: "What hackathons has he won?",
  },
];

function errorMessageFrom(payload: unknown): string {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "error" in payload &&
    typeof (payload as { error?: unknown }).error === "string"
  ) {
    return (payload as { error: string }).error;
  }

  return "Brick is unavailable right now.";
}

function cleanAssistantText(content: string): string {
  return content
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*([^*\n]+)\*/g, "$1")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, "$1 ($2)")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*]\s*/gm, "• ")
    .replace(/\*\*/g, "")
    .trim();
}

function renderTextWithLinks(text: string): ReactNode[] {
  return text.split(/(https?:\/\/[^\s)]+)/g).map((part, index) =>
    part.startsWith("http") ? (
      <a
        key={index}
        href={part}
        target="_blank"
        rel="noreferrer"
        className="underline decoration-2 underline-offset-2"
      >
        {part}
      </a>
    ) : (
      part
    ),
  );
}

function splitLongClause(text: string): string[] {
  if (text.length <= 180) return [text];

  return text
    .split(/\s*;\s*/)
    .flatMap((part) => (part.length > 220 ? part.split(/\s+—\s+/) : [part]))
    .map((part) => part.trim())
    .filter(Boolean);
}

function splitIntoBrickRows(content: string): string[] {
  const trimmed = content.trim();
  if (!trimmed) return [];

  const rows = trimmed
    .split(/\n+/)
    .flatMap((line) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return [];

      // Keep numbered list items together; "1." is not a sentence end.
      if (/^\d+\.\s/.test(trimmedLine)) {
        return [trimmedLine];
      }

      return trimmedLine
        .split(/(?<=[.!?])\s+/)
        .flatMap((row) => splitLongClause(row.trim()))
        .filter(Boolean);
    })
    .filter(Boolean);

  return rows.length > 0 ? rows : [trimmed];
}

export function AskChat({ suggestedQuestions, contactEmail }: AskChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<ChatStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const nextId = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const streamingRef = useRef(false);
  const logRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    const log = logRef.current;
    if (!log) return;
    log.scrollTop = log.scrollHeight;
  }, [messages, status]);

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
    <MotionConfig reducedMotion="user">
      <section id="ask-brick" className="lego-chat lego-band" aria-labelledby="brick-chat-title">
        <header className="lego-chat__header">
          <div className="lego-chat__identity">
            <LegoFace size={44} />
            <div>
              <h2 id="brick-chat-title" className="lego-chat__name">
                <span className="sr-only">Ask </span>BRICK
              </h2>
              <p className="lego-kicker">PUBLIC KNOWLEDGE</p>
            </div>
          </div>
        </header>

        <div className="lego-chat__body">
          <div className="lego-chat__main">
            <form className="lego-dock" onSubmit={handleSubmit} aria-busy={isStreaming}>
              <div className="lego-dock__studs" aria-hidden>
                {Array.from({ length: 6 }, (_, index) => (
                  <span key={index} className="lego-dock__stud" />
                ))}
              </div>

              <div className="lego-dock__label">
                <label htmlFor="ask-input">Ask Brick about Ibtasaam</label>
              </div>

              <div className="lego-dock__form">
                <textarea
                  id="ask-input"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleKeyDown}
                  maxLength={1000}
                  rows={2}
                  placeholder="What do you want to build?"
                  aria-describedby="ask-input-hint"
                  className="lego-dock__input"
                />

                <div className="lego-dock__actions">
                  <motion.button
                    type="submit"
                    className="lego-brick lego-dock__build"
                    style={brickStyle("yellow")}
                    disabled={isStreaming || !input.trim()}
                    whileHover={reduced ? undefined : { y: -2 }}
                    whileTap={reduced ? undefined : { y: 2 }}
                    transition={{ type: "spring", stiffness: 320, damping: 22 }}
                  >
                    <LegoStuds count={2} />
                    <span>Build</span>
                  </motion.button>

                  {isStreaming ? (
                    <motion.button
                      type="button"
                      className="lego-brick lego-dock__stop"
                      style={brickStyle("red")}
                      onClick={stop}
                      whileTap={reduced ? undefined : { y: 2 }}
                    >
                      Stop
                    </motion.button>
                  ) : null}
                </div>
              </div>

              <p id="ask-input-hint" className="lego-dock__hint">
                Enter to build · Shift + Enter for a new line
              </p>
            </form>

            {error ? (
              <div role="alert" className="lego-error">
                <p className="lego-error__label">Missing piece</p>
                <p className="lego-error__text">
                  {error} <a href="#faq">Read the manual</a> or email{" "}
                  <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
                </p>
              </div>
            ) : null}

            <div
              ref={logRef}
              role="log"
              aria-live="polite"
              aria-relevant="additions text"
              aria-busy={isStreaming}
              className="lego-chat__log"
            >
              {messages.length === 0 ? (
                <div className="lego-empty">
                  <div className="lego-empty__intro">
                    <LegoBrick color="yellow" studs={2} className="lego-empty__mark" aria-hidden>
                      ?
                    </LegoBrick>
                    <p className="lego-kicker">Loose bricks</p>
                    <h3 className="lego-empty__title">Pick a piece to start.</h3>
                    <p className="lego-empty__lede">
                      Ask Brick about Ibtasaam&apos;s work, projects, skills, education, or
                      experience.
                    </p>
                  </div>
                  <div className="lego-empty__starters">
                    <p className="lego-kicker lego-empty__starters-label">Starter bricks</p>
                    {suggestedQuestions.map((question, index) => (
                      <motion.button
                        key={question}
                        type="button"
                        className="lego-starter"
                        style={brickStyle(starterColors[index % starterColors.length])}
                        onClick={() => void send(question)}
                        disabled={isStreaming}
                        whileHover={reduced ? undefined : { y: -2, rotate: -0.4 }}
                        whileTap={reduced ? undefined : { y: 1 }}
                      >
                        <LegoStuds count={2} />
                        <span>{question}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((message, messageIndex) => {
                  const isActiveAssistant =
                    isStreaming &&
                    messageIndex === messages.length - 1 &&
                    message.role === "assistant";

                  if (message.role === "user") {
                    return (
                      <motion.div
                        key={message.id}
                        className="lego-message lego-message--user"
                        initial={reduced ? false : { opacity: 0, x: 14 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 280,
                          damping: 24,
                        }}
                      >
                        <div className="lego-user-brick" style={brickStyle("red")}>
                          <LegoStuds count={3} />
                          <span className="lego-user-brick__label">YOU</span>
                          <p className="lego-user-brick__text">{message.content}</p>
                        </div>
                      </motion.div>
                    );
                  }

                  const rows = splitIntoBrickRows(cleanAssistantText(message.content));

                  return (
                    <div key={message.id} className="lego-message lego-message--assistant">
                      <div className="lego-message__meta">
                        <LegoFace size={38} />
                        <span className="lego-message__name">BRICK</span>
                        <span className="lego-message__role">LEGO GUIDE</span>
                        {isActiveAssistant ? (
                          <span className="lego-message__live">BUILDING</span>
                        ) : null}
                      </div>

                      {rows.length === 0 && isActiveAssistant ? (
                        <LegoLoader variant="inline" />
                      ) : (
                        <div className="lego-response">
                          {rows.map((row, rowIndex) => {
                            const color = rowColors[rowIndex % rowColors.length];
                            const isLast = rowIndex === rows.length - 1;

                            return (
                              <motion.div
                                key={`${message.id}-${rowIndex}`}
                                className={`lego-response-brick lego-response-brick--${color}`}
                                initial={reduced ? false : { opacity: 0, y: 10, rotate: -0.5 }}
                                animate={{ opacity: 1, y: 0, rotate: 0 }}
                                transition={
                                  reduced
                                    ? { duration: 0 }
                                    : {
                                        type: "spring",
                                        stiffness: 260,
                                        damping: 24,
                                        delay: Math.min(rowIndex * 0.04, 0.16),
                                      }
                                }
                              >
                                <span className="lego-response-brick__stud" aria-hidden />
                                <p className="lego-response-brick__text">
                                  {renderTextWithLinks(row)}
                                  {isActiveAssistant && isLast ? (
                                    <span className="lego-cursor" aria-hidden />
                                  ) : null}
                                </p>
                              </motion.div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <p className="lego-disclaimer">
              Brick is an AI guide. Answers come from Ibtasaam&apos;s public knowledge and may make
              mistakes. For anything important, email{" "}
              <a href={`mailto:${contactEmail}`}>{contactEmail}</a>. LEGO-style fan project; not
              affiliated with the LEGO Group.
            </p>
          </div>

          <aside className="lego-tray" aria-label="Knowledge brick bin">
            <p className="lego-kicker lego-tray__title">Brick bin</p>
            {knowledgeBricks.map((brick) => (
              <motion.button
                key={brick.label}
                type="button"
                className="lego-tray__brick"
                style={brickStyle(brick.color)}
                onClick={() => void send(brick.prompt)}
                disabled={isStreaming}
                whileHover={reduced ? undefined : { y: -3, rotate: -0.6 }}
                whileTap={reduced ? undefined : { y: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
              >
                <LegoStuds count={3} />
                <span className="lego-tray__label">{brick.label}</span>
                <span className="lego-tray__count">{brick.count}</span>
              </motion.button>
            ))}
            <p className="lego-tray__hint">Tap a piece to ask.</p>
          </aside>
        </div>
      </section>
    </MotionConfig>
  );
}
