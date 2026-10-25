import type { MetadataRoute } from "next";
import { chapters, site } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: site.url,
      changeFrequency: "monthly",
      priority: 1,
    },
    ...chapters.map((chapter) => ({
      url: `${site.url}${chapter.href}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
