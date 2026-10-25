"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { useAudio } from "@/components/audio/audio-provider";
import { availablePanoramas, defaultPanoramaId } from "@/content/panoramas";
import { chapterContent, mainMenuChapters, site } from "@/content/site";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { DownloadIcon, GithubIcon, LinkedinIcon, MailIcon, PhoneIcon } from "./menu-icons";
import { MusicDock } from "./music-dock";
import { PanoramaBackground } from "./panorama-background";

export function TitleScreen() {
  const [panoramaId, setPanoramaId] = useState<string | null>(defaultPanoramaId);
  const [inView, setInView] = useState(true);
  const [exiting, setExiting] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const timers = useRef<number[]>([]);
  const reducedMotion = useReducedMotion();
  const router = useRouter();
  const audio = useAudio();
  const { playClick, startBackground } = audio;
  const startBackgroundRef = useRef(startBackground);

  const selectedPanorama =
    availablePanoramas.find((set) => set.id === panoramaId) ?? availablePanoramas[0] ?? null;

  useEffect(() => {
    startBackgroundRef.current = startBackground;
  }, [startBackground]);

  useEffect(() => {
    const stopListening = () => {
      window.removeEventListener("pointerdown", startOnFirstGesture, { capture: true });
      window.removeEventListener("keydown", startOnFirstGesture, { capture: true });
    };

    function startOnFirstGesture(event: Event) {
      stopListening();

      if (event.target instanceof Element && event.target.closest("[data-music-toggle]")) return;

      startBackgroundRef.current();
    }

    window.addEventListener("pointerdown", startOnFirstGesture, { capture: true });
    window.addEventListener("keydown", startOnFirstGesture, { capture: true });

    return stopListening;
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const frame = requestAnimationFrame(() => setExiting(false));
    window.scrollTo(0, 0);
    root.classList.add("title-locked");

    return () => {
      cancelAnimationFrame(frame);
      root.classList.remove("title-locked");
    };
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
    (event: MouseEvent<HTMLAnchorElement>, href: string) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      event.preventDefault();
      if (exiting) return;

      playClick();
      startBackground();
      setExiting(true);

      const finish = () => {
        document.documentElement.classList.remove("title-locked");
        router.push(href);
        timers.current.push(window.setTimeout(() => setExiting(false), reducedMotion ? 0 : 450));
      };

      if (reducedMotion) {
        finish();
      } else {
        timers.current.push(window.setTimeout(finish, 260));
      }
    },
    [exiting, reducedMotion, playClick, router, startBackground],
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
          <div className="title-screen__inner m-auto flex w-full max-w-[900px] flex-col items-center gap-3 px-6 pt-10 pb-16 sm:pt-14 sm:pb-20">
            <div className="title-logo-frame relative w-full">
              <div className="relative">
                <Image
                  src="/brand/ibtasaam-wordmark.webp"
                  alt="Ibtasaam"
                  width={1800}
                  height={527}
                  priority
                  sizes="(max-width: 768px) 86vw, 660px"
                  className="h-auto w-full"
                />
                <span className="splash absolute right-[-1.5%] bottom-[2%] font-minecraft text-sm whitespace-nowrap text-[#ffff55] sm:text-xl xl:text-2xl">
                  Still mining!
                </span>
              </div>
              <div className="-mt-[3.6%] flex justify-center">
                <Image
                  src="/brand/portfolio-edition.webp"
                  alt="Portfolio Edition"
                  width={1200}
                  height={281}
                  priority
                  sizes="(max-width: 640px) 42vw, 300px"
                  className="w-[45%]"
                />
              </div>
            </div>

            <nav aria-label="Main menu" className="flex w-full max-w-[560px] flex-col gap-2.5">
              {mainMenuChapters.map((chapter) => (
                <Link
                  key={chapter.id}
                  href={chapter.href}
                  onClick={(event) => handleSelect(event, chapter.href)}
                  className="mc-button"
                >
                  {chapter.label}
                </Link>
              ))}
            </nav>

            <a
              href={site.cv}
              download
              className="mc-button max-w-[560px] gap-2 [&_svg]:size-4"
              onClick={() => audio.playClick()}
            >
              <DownloadIcon />
              <span>Download CV</span>
            </a>

            <div className="flex items-center justify-center gap-3">
              <Link
                href={chapterContent.contact.href}
                aria-label="Contact"
                title="Contact"
                className="mc-menu-icon"
                onClick={(event) => handleSelect(event, chapterContent.contact.href)}
              >
                <PhoneIcon />
              </Link>
              <a
                href={`mailto:${site.email}`}
                aria-label="Email"
                title="Email"
                className="mc-menu-icon"
                onClick={() => audio.playClick()}
              >
                <MailIcon />
              </a>
              <a
                href={site.github}
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                title="GitHub"
                className="mc-menu-icon"
                onClick={() => audio.playClick()}
              >
                <GithubIcon />
              </a>
              <a
                href={site.linkedin}
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                title="LinkedIn"
                className="mc-menu-icon"
                onClick={() => audio.playClick()}
              >
                <LinkedinIcon />
              </a>
            </div>

            {availablePanoramas.length > 1 && selectedPanorama ? (
              <div className="flex items-center gap-3 font-minecraft text-[10px] tracking-[0.16em] text-white/80 uppercase sm:gap-4">
                <button
                  type="button"
                  aria-label="Previous panorama"
                  className="mc-icon-button"
                  onClick={() => {
                    audio.playClick();
                    cyclePanorama(-1);
                  }}
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
                  onClick={() => {
                    audio.playClick();
                    cyclePanorama(1);
                  }}
                >
                  {">"}
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <footer className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 font-mono text-[9px] tracking-[0.16em] text-white/55 uppercase sm:px-6 sm:text-[10px]">
          <MusicDock audio={audio} />
          <span className="ml-auto text-center sm:text-right">
            Unofficial fan project · Not affiliated with Mojang
          </span>
        </footer>
      </section>

      <div className="title-transition" data-active={exiting} />
    </>
  );
}
