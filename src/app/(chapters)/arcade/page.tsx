import type { Metadata } from "next";
import { ChapterPage } from "@/components/chapters/chapter-page";
import { chapterContent } from "@/content/site";
import { chapterMetadata } from "@/lib/chapter-metadata";

const chapter = chapterContent.arcade;

export const metadata: Metadata = chapterMetadata(chapter);

export default function ArcadePage() {
  return (
    <ChapterPage chapter={chapter}>
      <p className="chapter-note">The cabinets are warming up. Playable ports are next.</p>
    </ChapterPage>
  );
}
