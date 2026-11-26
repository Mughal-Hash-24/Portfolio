import type { Metadata } from "next";
import { Cabinet } from "@/components/arcade/cabinet";
import { arcadeCount, arcadeGames } from "@/content/arcade";
import { chapterContent } from "@/content/site";
import { chapterMetadata } from "@/lib/chapter-metadata";

const chapter = chapterContent.arcade;

export const metadata: Metadata = chapterMetadata(chapter);

/**
 * The arcade is a machine, not an article. It fills the viewport and skips the
 * chapter title block the other pages use, so the only thing on screen is the
 * cabinet.
 */
export default function ArcadePage() {
  return (
    <div data-chapter={chapter.id} className="chapter-shell flex min-h-dvh flex-col">
      <main className="flex flex-1 flex-col px-4 py-3 sm:px-6">
        <h1 className="sr-only">{chapter.label}</h1>
        <Cabinet
          games={arcadeGames}
          caption={`${arcadeCount} cabinets · original source compiled to WebAssembly`}
        />
      </main>
    </div>
  );
}
