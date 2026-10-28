import type { Metadata } from "next";
import { AskChat } from "@/components/ask/ask-chat";
import { BrickDivider } from "@/components/ask/brick-divider";
import { BrickLab } from "@/components/ask/brick-lab";
import { LegoBoot } from "@/components/ask/lego-loader";
import { LegoFaq } from "@/components/ask/lego-faq";
import { LegoHero } from "@/components/ask/lego-hero";
import { ChapterPage } from "@/components/chapters/chapter-page";
import { askFaqs } from "@/content/ask";
import { chapterContent, site } from "@/content/site";
import { chapterMetadata } from "@/lib/chapter-metadata";

const chapter = chapterContent.ask;

const suggestedQuestions = [
  "What are his strongest projects?",
  "What is The Odyssey?",
  "What is his tech stack?",
  "What hackathons has he won?",
];

const fallbackFaqs = askFaqs.slice(0, 10);

export const metadata: Metadata = chapterMetadata(chapter);

export default function AskPage() {
  return (
    <ChapterPage chapter={chapter} wide footerNote={null}>
      <LegoBoot />
      <LegoHero />
      <BrickDivider label="The build table" />
      <AskChat suggestedQuestions={suggestedQuestions} contactEmail={site.email} />
      <BrickDivider label="Intermission" />
      <BrickLab />
      <BrickDivider label="Spare parts" />
      <LegoFaq faqs={fallbackFaqs} />
    </ChapterPage>
  );
}
