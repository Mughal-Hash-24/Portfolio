"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function ChapterFocus() {
  const pathname = usePathname();

  useEffect(() => {
    document.querySelector<HTMLElement>("main h1")?.focus({ preventScroll: true });
  }, [pathname]);

  return null;
}
