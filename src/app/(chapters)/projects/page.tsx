import type { Metadata } from "next";
import { ChapterPage } from "@/components/chapters/chapter-page";
import { chapterContent } from "@/content/site";
import { chapterMetadata } from "@/lib/chapter-metadata";

const chapter = chapterContent.projects;

export const metadata: Metadata = chapterMetadata(chapter);

export default function ProjectsPage() {
  return (
    <ChapterPage chapter={chapter}>
      <p className="chapter-note">
        Selected work, case studies, and process notes are being assembled.
      </p>
    </ChapterPage>
  );
}
