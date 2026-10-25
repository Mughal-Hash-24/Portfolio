import type { Metadata } from "next";
import { ChapterPage } from "@/components/chapters/chapter-page";
import { chapterContent } from "@/content/site";
import { chapterMetadata } from "@/lib/chapter-metadata";

const chapter = chapterContent.ask;

export const metadata: Metadata = chapterMetadata(chapter);

export default function AskPage() {
  return (
    <ChapterPage chapter={chapter}>
      <div className="chapter-terminal">
        <p>
          <span className="chapter-prompt">$</span> ask-my-ai --status
        </p>
        <p className="chapter-terminal-output">
          The AI guide is next. The terminal is being wired up.
        </p>
      </div>
    </ChapterPage>
  );
}
