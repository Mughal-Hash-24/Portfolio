import type { Metadata } from "next";
import { AtlasStage } from "@/components/atlas/atlas-stage";
import { AtlasStatic } from "@/components/atlas/atlas-static";
import { atlasDescription } from "@/content/atlas";
import { chapterContent } from "@/content/site";
import { chapterMetadata } from "@/lib/chapter-metadata";

const chapter = {
  ...chapterContent.safar,
  description: atlasDescription,
};

export const metadata: Metadata = chapterMetadata(chapter);

export default function AtlasPage() {
  return (
    <>
      <AtlasStage />
      <noscript>
        <AtlasStatic />
      </noscript>
    </>
  );
}
