import type { Metadata } from "next";
import { site } from "@/content/site";

type ChapterMeta = {
  label: string;
  href: string;
  description: string;
};

export function chapterMetadata(chapter: ChapterMeta): Metadata {
  const title = `${chapter.label} — ${site.name}`;

  return {
    title: chapter.label,
    description: chapter.description,
    alternates: {
      canonical: chapter.href,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: chapter.href,
      siteName: site.name,
      title,
      description: chapter.description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: chapter.description,
    },
  };
}
