import type { Metadata } from "next";
import { UniverseStage } from "@/components/projects/universe-stage";
import { UniverseStatic } from "@/components/projects/universe-static";
import { universeDescription } from "@/content/projects-universe";
import { chapterContent } from "@/content/site";
import { chapterMetadata } from "@/lib/chapter-metadata";

const chapter = {
  ...chapterContent.projects,
  description: universeDescription,
};

export const metadata: Metadata = chapterMetadata(chapter);

export default function ProjectsPage() {
  return (
    <>
      <UniverseStage />
      <noscript>
        <UniverseStatic />
      </noscript>
    </>
  );
}
