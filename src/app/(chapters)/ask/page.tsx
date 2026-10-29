import type { Metadata } from "next";
import { AskHeader } from "@/components/ask/ask-header";
import { BrickDivider } from "@/components/ask/brick-divider";
import { BrickLab } from "@/components/ask/brick-lab";
import { ChatExperience } from "@/components/ask/chat-experience";
import { LegoAudioDock } from "@/components/ask/lego-audio-dock";
import { LegoBoot } from "@/components/ask/lego-loader";
import { LegoFaq } from "@/components/ask/lego-faq";
import { LegoHero } from "@/components/ask/lego-hero";
import { LegoScrollCue } from "@/components/ask/lego-scroll-cue";
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
    <ChapterPage
      chapter={chapter}
      wide
      header={<AskHeader />}
      footerNote={null}
      audioControl={false}
    >
      <LegoBoot />
      <LegoAudioDock />
      <div className="ask-landing">
        <LegoHero />
        <LegoScrollCue />
      </div>
      <ChatExperience suggestedQuestions={suggestedQuestions} contactEmail={site.email} />
      <BrickDivider label="Intermission" />
      <BrickLab />
      <BrickDivider label="Spare parts" />
      <LegoFaq faqs={fallbackFaqs} />
    </ChapterPage>
  );
}
