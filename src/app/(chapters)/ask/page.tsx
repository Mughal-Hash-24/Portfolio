import type { Metadata } from "next";
import { AskChat } from "@/components/ask/ask-chat";
import { ChapterPage } from "@/components/chapters/chapter-page";
import { askFaqs } from "@/content/ask";
import { chapterContent, site } from "@/content/site";
import { chapterMetadata } from "@/lib/chapter-metadata";

const chapter = chapterContent.ask;

const suggestedQuestions = [
  "What are his strongest projects?",
  "What is The Odyssey?",
  "What is his tech stack?",
  "Is he available for an internship?",
];

const fallbackFaqs = askFaqs.slice(0, 10);

export const metadata: Metadata = chapterMetadata(chapter);

export default function AskPage() {
  return (
    <ChapterPage chapter={chapter}>
      <AskChat suggestedQuestions={suggestedQuestions} contactEmail={site.email} />

      <section id="faq" aria-labelledby="ask-faq-heading" className="mt-12 max-w-[40rem]">
        <h2 id="ask-faq-heading" className="chapter-eyebrow">
          Common questions
        </h2>
        <p className="mt-2 text-sm text-[var(--chapter-muted)]">
          The AI guide may be unavailable or rate-limited. These answers are always available.
        </p>
        <div className="mt-4 space-y-3">
          {fallbackFaqs.map((faq) => (
            <details key={faq.id} className="border border-[var(--chapter-line)] p-4">
              <summary className="cursor-pointer font-mono text-sm text-[var(--chapter-accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--chapter-accent)]">
                {faq.question}
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-[var(--chapter-muted)]">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>
    </ChapterPage>
  );
}
