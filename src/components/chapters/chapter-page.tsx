import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { chapterContent } from "@/content/site";
import { ChapterAudioControl } from "./chapter-audio-control";
import { ChapterFocus } from "./chapter-focus";

type Chapter = (typeof chapterContent)[keyof typeof chapterContent];

type ChapterPageProps = {
  chapter: Chapter;
  children?: ReactNode;
};

export function ChapterPage({ chapter, children }: ChapterPageProps) {
  return (
    <div data-chapter={chapter.id} className="chapter-shell flex min-h-dvh flex-col">
      <ChapterFocus />

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-6">
        <Image
          src="/brand/ibtasaam-wordmark.webp"
          alt="Ibtasaam"
          width={1800}
          height={527}
          priority
          sizes="(min-width: 640px) 144px, 112px"
          className="h-auto w-28 sm:w-36"
        />
        <Link href="/" prefetch={false} className="chapter-back">
          ← Title screen
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-16 sm:py-24">
        <p className="chapter-eyebrow">Chapter {chapter.number}</p>
        <h1 tabIndex={-1} className="chapter-title">
          {chapter.label}
        </h1>
        <p className="chapter-description">{chapter.description}</p>
        <div className="mt-12">{children}</div>
      </main>

      <footer className="chapter-footer mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 border-t px-6 py-4">
        <ChapterAudioControl />
        <span className="chapter-meta">Unofficial fan project · Not affiliated with Mojang</span>
      </footer>
    </div>
  );
}
