import type { Metadata } from "next";
import { ChapterPage } from "@/components/chapters/chapter-page";
import { chapterContent } from "@/content/site";
import { chapterMetadata } from "@/lib/chapter-metadata";

const chapter = chapterContent.about;

export const metadata: Metadata = chapterMetadata(chapter);

export default function AboutPage() {
  return (
    <ChapterPage chapter={chapter}>
      <p className="chapter-note">The story, stack, languages, and honors are being written.</p>
    </ChapterPage>
  );
}
