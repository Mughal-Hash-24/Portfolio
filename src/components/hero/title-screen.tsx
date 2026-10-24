"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { availablePanoramas, defaultPanoramaId } from "@/content/panoramas";
import { chapters, site } from "@/content/site";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { PanoramaBackground } from "./panorama-background";

export function TitleScreen() {
  const [panoramaId, setPanoramaId] = useState<string | null>(defaultPanoramaId);
  const [inView, setInView] = useState(true);
  const [exiting, setExiting] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const timers = useRef<number[]>([]);
  const reducedMotion = useReducedMotion();

  const selectedPanorama =
    availablePanoramas.find((set) => set.id === panoramaId) ?? availablePanoramas[0] ?? null;

  useEffect(() => {
    const id = window.location.hash.slice(1);
    const root = document.documentElement;

    if (id) {
      root.classList.remove("title-locked");
      const target = document.getElementById(id);
      if (target) {
        requestAnimationFrame(() => target.scrollIntoView({ block: "start" }));
      }
    } else {
      window.scrollTo(0, 0);
      root.classList.add("title-locked");
    }

    return () => root.classList.remove("title-locked");
  }, []);

  useEffect(() => {
    let frame = 0;

    try {
      const stored = window.localStorage.getItem("ibtasaam:panorama");
      if (stored && availablePanoramas.some((set) => set.id === stored)) {
        // Defer the stored choice until after hydration.
        frame = requestAnimationFrame(() => setPanoramaId(stored));
      }
    } catch {
      return;
    }

    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.15,
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const timeouts = timers.current;

    return () => {
      for (const timer of timeouts) {
        window.clearTimeout(timer);
      }
    };
  }, []);

  const handleSelect = useCallback(
    (event: MouseEvent<HTMLAnchorElement>, id: string) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      event.preventDefault();
      if (exiting) return;

      setExiting(true);

      const finish = () => {
        document.documentElement.classList.remove("title-locked");
        window.history.pushState(null, "", `#${id}`);

        const target = document.getElementById(id);
        target?.scrollIntoView({
          behavior: reducedMotion ? "auto" : "smooth",
          block: "start",
        });
        target?.querySelector<HTMLElement>("h2")?.focus({ preventScroll: true });

        timers.current.push(window.setTimeout(() => setExiting(false), reducedMotion ? 0 : 450));
      };

      if (reducedMotion) {
        finish();
      } else {
        timers.current.push(window.setTimeout(finish, 260));
      }
    },
    [exiting, reducedMotion],
  );

  const cyclePanorama = useCallback((direction: -1 | 1) => {
    setPanoramaId((current) => {
      if (availablePanoramas.length < 2) return current;

      const index = availablePanoramas.findIndex((set) => set.id === current);
      const next =
        availablePanoramas[
          (index + direction + availablePanoramas.length) % availablePanoramas.length
        ];

      try {
        window.localStorage.setItem("ibtasaam:panorama", next.id);
      } catch {
        return next.id;
      }

      return next.id;
    });
  }, []);

  return (
    <>
      <section
        ref={sectionRef}
        id="top"
        className="title-screen relative flex h-dvh flex-col overflow-hidden"
      >
        <h1 className="sr-only">
          {site.name} — {site.role}
        </h1>

        <PanoramaBackground
          key={selectedPanorama?.id ?? "fallback"}
          set={selectedPanorama}
          paused={!inView || exiting}
          reducedMotion={reducedMotion}
        />
        <div className="title-scrim absolute inset-0" />

        <div className="title-screen__content relative z-10 flex h-full w-full overflow-x-hidden overflow-y-auto overscroll-contain">
          <div className="title-screen__inner m-auto flex w-full max-w-[900px] flex-col items-center gap-6 px-6 pt-10 pb-16 sm:gap-10 sm:pt-14 sm:pb-20">
            <div className="title-logo-frame relative w-full">
              <Image
                src="/brand/ibtasaam-wordmark.webp"
                alt="Ibtasaam"
                width={1800}
                height={527}
                priority
                sizes="(max-width: 768px) 86vw, 900px"
                className="h-auto w-full"
              />
              <div className="mt-1 text-right">
                <span className="splash inline-block font-minecraft text-xs whitespace-nowrap text-[#ffff55] sm:text-sm lg:text-base">
                  5th semester, still mining!
                </span>
              </div>
            </div>

            <nav
              aria-label="Main menu"
              className="flex w-full max-w-[420px] flex-col gap-2 sm:gap-3"
            >
              {chapters.map((chapter) => (
                <a
                  key={chapter.id}
                  href={`#${chapter.id}`}
                  onClick={(event) => handleSelect(event, chapter.id)}
                  className="mc-button"
                >
                  {chapter.label}
                </a>
              ))}
            </nav>

            {availablePanoramas.length > 1 && selectedPanorama ? (
              <div className="flex items-center gap-3 font-minecraft text-[10px] tracking-[0.16em] text-white/80 uppercase sm:gap-4">
                <button
                  type="button"
                  aria-label="Previous panorama"
                  className="mc-icon-button"
                  onClick={() => cyclePanorama(-1)}
                >
                  {"<"}
                </button>
                <span aria-live="polite" className="min-w-[9.5rem] text-center sm:min-w-[11rem]">
                  {selectedPanorama.label}
                </span>
                <button
                  type="button"
                  aria-label="Next panorama"
                  className="mc-icon-button"
                  onClick={() => cyclePanorama(1)}
                >
                  {">"}
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <footer className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center gap-4 px-4 py-3 font-mono text-[9px] tracking-[0.16em] text-white/55 uppercase sm:justify-between sm:px-6 sm:text-[10px]">
          <span className="hidden sm:inline">Portfolio Edition 1.0</span>
          <span className="text-center sm:text-right">
            Unofficial fan project · Not affiliated with Mojang
          </span>
        </footer>
      </section>

      <div className="title-transition" data-active={exiting} />
    </>
  );
}
