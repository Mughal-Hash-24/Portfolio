import type { Metadata } from "next";
import { ChapterPage } from "@/components/chapters/chapter-page";
import { chapterContent, site } from "@/content/site";
import { chapterMetadata } from "@/lib/chapter-metadata";

const chapter = chapterContent.contact;

export const metadata: Metadata = chapterMetadata(chapter);

export default function ContactPage() {
  return (
    <ChapterPage chapter={chapter}>
      <div className="flex flex-col gap-8">
        <div>
          <p className="chapter-eyebrow">Email</p>
          <a className="chapter-contact-link" href={`mailto:${site.email}`}>
            {site.email}
          </a>
        </div>

        <div>
          <p className="chapter-eyebrow">Elsewhere</p>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <a className="chapter-social-link" href={site.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a
              className="chapter-social-link"
              href={site.linkedin}
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn
            </a>
          </div>
        </div>

        <p className="chapter-meta">{site.location}</p>
      </div>
    </ChapterPage>
  );
}
