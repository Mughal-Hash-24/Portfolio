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
  wide?: boolean;
  header?: ReactNode;
  footerNote?: ReactNode | null;
};

const DEFAULT_FOOTER_NOTE = "Unofficial fan project · Not affiliated with Mojang";

export function ChapterPage({
  chapter,
  children,
  wide = false,
  header,
  footerNote,
}: ChapterPageProps) {
  const note = footerNote === undefined ? DEFAULT_FOOTER_NOTE : footerNote;
  const chromeWidth = wide ? "max-w-[1720px]" : "max-w-6xl";

  return (
    <div data-chapter={chapter.id} className="chapter-shell flex min-h-dvh flex-col">
      <ChapterFocus />

      {header ?? (
        <header
          className={`mx-auto flex w-full ${chromeWidth} items-center justify-between gap-4 px-6 py-6`}
        >
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
      )}

      <main
        className={`mx-auto flex w-full flex-1 flex-col px-6 ${
          wide
            ? "max-w-[1720px] justify-start pt-5 pb-16 sm:pt-6"
            : "max-w-5xl justify-center py-16 sm:py-24"
        }`}
      >
        {wide ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,26rem)] lg:items-end">
            <div>
              <p className="chapter-eyebrow">Chapter {chapter.number}</p>
              <h1 tabIndex={-1} className="chapter-title">
                {chapter.label}
              </h1>
            </div>
            <p className="chapter-description">{chapter.description}</p>
          </div>
        ) : (
          <>
            <p className="chapter-eyebrow">Chapter {chapter.number}</p>
            <h1 tabIndex={-1} className="chapter-title">
              {chapter.label}
            </h1>
            <p className="chapter-description">{chapter.description}</p>
          </>
        )}

        <div className={wide ? "mt-5" : "mt-12"}>{children}</div>
      </main>

      <footer
        className={`chapter-footer mx-auto flex w-full ${chromeWidth} flex-wrap items-center justify-between gap-4 border-t px-6 py-4`}
      >
        <ChapterAudioControl />
        {note ? <span className="chapter-meta">{note}</span> : null}
      </footer>
    </div>
  );
}
