"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  atlasEntries,
  atlasRegions,
  atlasRelics,
  entriesByRegion,
  entryById,
  libraryRelic,
  regionById,
  type AtlasEntry,
  type AtlasRelic,
} from "@/content/atlas";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { AtlasEngine, type Nearby } from "./atlas-engine";
import styles from "./atlas.module.css";

const FOUND_KEY = "atlas:found:v1";
const RELIC_TOTAL = atlasRelics.length + 1;
const TOTAL_FINDS = atlasEntries.length + RELIC_TOTAL;

function formatHour(hour: number) {
  const totalMinutes = Math.floor(hour * 60);
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function loadFound(): Set<string> {
  if (typeof window === "undefined") return new Set();

  try {
    const raw = window.localStorage.getItem(FOUND_KEY);

    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);

    if (Array.isArray(parsed)) {
      return new Set(parsed.filter((value): value is string => typeof value === "string"));
    }
  } catch {
    // Ignore storage failures; the world still works without persistence.
  }

  return new Set();
}

function hashEntry(): AtlasEntry | null {
  if (typeof window === "undefined") return null;

  const id = decodeURIComponent(window.location.hash.replace(/^#/, ""));

  return id ? (entryById.get(id) ?? null) : null;
}

function setHash(id: string | null) {
  const base = window.location.pathname + window.location.search;

  window.history.replaceState(null, "", id ? `${base}#${id}` : base);
}

function saveFound(found: Set<string>) {
  try {
    window.localStorage.setItem(FOUND_KEY, JSON.stringify([...found]));
  } catch {
    // Ignore.
  }
}

export function AtlasExperience() {
  const reducedMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<AtlasEngine | null>(null);
  const foundRef = useRef<Set<string>>(new Set());
  const optionsRef = useRef({ reducedMotion: false, found: new Set<string>() });
  const joystickRef = useRef<HTMLDivElement>(null);
  const joystickPointer = useRef<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const [deepEntry] = useState(hashEntry);
  const startedRef = useRef(Boolean(deepEntry));
  const [started, setStarted] = useState(Boolean(deepEntry));
  const [nearby, setNearby] = useState<Nearby | null>(null);
  const [entry, setEntry] = useState<AtlasEntry | null>(deepEntry);
  const [relic, setRelic] = useState<AtlasRelic | null>(null);
  const [indexOpen, setIndexOpen] = useState(false);
  const [hour, setHour] = useState(12);
  const [guideLine, setGuideLine] = useState<string | null>(null);
  const [found, setFound] = useState<Set<string>>(new Set());
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const [mobile, setMobile] = useState(false);

  const foundCount = found.size;
  const night = hour >= 19.5 || hour < 5.5;

  useEffect(() => {
    optionsRef.current.reducedMotion = reducedMotion;
  }, [reducedMotion]);

  useEffect(() => {
    const query = window.matchMedia("(pointer: coarse), (max-width: 760px)");
    const update = () => setMobile(query.matches);

    update();
    query.addEventListener("change", update);

    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const stored = loadFound();
    foundRef.current = stored;
    optionsRef.current.found = stored;
    setFound(new Set(stored));

    const engine = new AtlasEngine(
      canvas,
      {
        onNearby: setNearby,
        onOpenEntry: (opened) => {
          setEntry(opened);
          setIndexOpen(false);
          setRelic(null);
          setHash(opened.id);
        },
        onOpenRelic: (opened) => {
          setRelic(opened);
          setEntry(null);
          setIndexOpen(false);
        },
        onOpenIndex: () => {
          setIndexOpen(true);
          setEntry(null);
          setRelic(null);
        },
        onTime: setHour,
        onFound: (_kind, id) => {
          foundRef.current.add(id);
          setFound(new Set(foundRef.current));
          saveFound(foundRef.current);
        },
        onGuide: setGuideLine,
      },
      optionsRef.current,
    );

    engineRef.current = engine;
    engine.start();

    if (deepEntry) {
      engine.begin();
      engine.focusEntry(deepEntry.id);
      setHash(deepEntry.id);
    }

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [deepEntry]);

  useEffect(() => {
    if (!indexOpen) return;
    closeButtonRef.current?.focus();
  }, [indexOpen]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      if (relic) {
        setRelic(null);
        return;
      }

      if (entry) {
        setEntry(null);
        setHash(null);
        return;
      }

      if (indexOpen) setIndexOpen(false);
    };

    window.addEventListener("keydown", handleKey);

    return () => window.removeEventListener("keydown", handleKey);
  }, [entry, indexOpen, relic]);

  const begin = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    setStarted(true);
    engineRef.current?.begin();
  }, []);

  const openList = useCallback(() => {
    begin();
    setIndexOpen(true);
  }, [begin]);

  const travelTo = useCallback((target: AtlasEntry) => {
    engineRef.current?.focusEntry(target.id);
    setEntry(target);
    setIndexOpen(false);
    setRelic(null);
    setHash(target.id);
  }, []);

  const closePanel = useCallback(() => {
    setEntry(null);
    setHash(null);
    closeButtonRef.current?.blur();
  }, []);

  const handleJoystickPointer = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const base = joystickRef.current;
      const engine = engineRef.current;

      if (!base || !engine) return;

      const rect = base.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const max = rect.width / 2 - 18;
      let dx = event.clientX - centerX;
      let dy = event.clientY - centerY;
      const length = Math.hypot(dx, dy);

      if (length > max) {
        dx = (dx / length) * max;
        dy = (dy / length) * max;
      }

      setKnob({ x: dx, y: dy });
      engine.setJoystick(dx / max, dy / max);
      begin();
    },
    [begin],
  );

  const connectedEntries = useMemo(
    () =>
      (entry?.connections ?? [])
        .map((id) => entryById.get(id))
        .filter((candidate): candidate is AtlasEntry => Boolean(candidate)),
    [entry],
  );

  const entryRegion = entry ? regionById.get(entry.region) : null;
  const region = entry ? regionById.get(entry.region) : null;

  return (
    <main
      className={styles.shell}
      aria-label="The Atlas"
      data-overlay={entry || relic || indexOpen ? "true" : "false"}
    >
      <h1 className={styles.srOnly}>The Atlas — a walkable world of influences</h1>

      <div className={styles.stage} ref={stageRef} aria-hidden="true">
        <canvas ref={canvasRef} />
      </div>

      <div className={styles.srOnly} role="status" aria-live="polite">
        {nearby ? `${nearby.label}. ${nearby.hint}.` : ""}
      </div>

      <header className={styles.hud}>
        <div className={styles.brand}>
          <p className={styles.kicker}>Chapter 04 · The Atlas</p>
          <h2 className={styles.title}>The Atlas</h2>
          <p className={styles.tagline}>A walkable world of the things that shaped me.</p>
        </div>

        <div className={styles.hudActions}>
          <Link
            href="/"
            prefetch={false}
            className={styles.button}
            aria-label="Back to title screen"
          >
            ← Title
          </Link>
          <button
            type="button"
            className={styles.button}
            onClick={() => {
              begin();
              setIndexOpen(true);
            }}
            aria-haspopup="dialog"
          >
            Index
          </button>
          <span className={styles.clock} title="World time">
            <span className={styles.clockIcon} data-night={night} aria-hidden="true" />
            {formatHour(hour)}
          </span>
        </div>
      </header>

      {started && guideLine && !entry && !relic && !indexOpen ? (
        <div className={styles.dialogue} role="status">
          <p className={styles.dialogueSpeaker}>The Guide</p>
          <p className={styles.dialogueLine}>{guideLine}</p>
        </div>
      ) : null}

      {started && nearby && !entry && !relic && !indexOpen ? (
        <div className={styles.prompt}>
          <span className={styles.promptKey}>{mobile ? "Tap" : "E"}</span>
          <span className={styles.promptText}>
            <p className={styles.promptLabel}>{nearby.label}</p>
            <p className={styles.promptHint}>{nearby.hint}</p>
          </span>
        </div>
      ) : null}

      {entry && region ? (
        <aside
          className={styles.panel}
          style={{ "--region-color": region.accent } as CSSProperties}
          role="dialog"
          aria-label={entry.title}
        >
          <div className={styles.panelHead}>
            <div>
              <p className={styles.panelKicker}>{region.name}</p>
              <h2 className={styles.panelTitle}>{entry.title}</h2>
              <p className={styles.panelMeta}>
                {entry.creator}
                {entry.year ? ` · ${entry.year}` : ""}
              </p>
            </div>
            <button
              type="button"
              className={styles.close}
              onClick={closePanel}
              aria-label="Close entry"
              ref={closeButtonRef}
            >
              ✕
            </button>
          </div>

          <p className={styles.panelWhy}>{entry.why}</p>

          {entry.quote ? (
            <blockquote className={styles.quote}>
              <p className={styles.quoteText}>“{entry.quote.text}”</p>
              <p className={styles.quoteAttribution}>{entry.quote.attribution}</p>
            </blockquote>
          ) : null}

          {entry.note ? <p className={styles.panelNote}>{entry.note}</p> : null}

          {connectedEntries.length > 0 ? (
            <div className={styles.trails}>
              <p className={styles.trailsLabel}>Trails</p>
              <ul className={styles.trailList}>
                {connectedEntries.map((connected) => {
                  const connectedRegion = regionById.get(connected.region);

                  return (
                    <li key={connected.id}>
                      <button
                        type="button"
                        className={styles.trailChip}
                        style={{ "--region-color": connectedRegion?.accent } as CSSProperties}
                        onClick={() => travelTo(connected)}
                      >
                        {connected.title}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}

          <div className={styles.panelFoot}>
            <span className={styles.foundBadge}>{found.has(entry.id) ? "Found" : "New"}</span>
            <span>
              {foundCount}/{TOTAL_FINDS} found
            </span>
          </div>
        </aside>
      ) : null}

      {indexOpen ? (
        <aside className={styles.index} role="dialog" aria-label="Atlas index">
          <div className={styles.indexHead}>
            <div>
              <p className={styles.panelKicker}>The Index</p>
              <h2 className={styles.indexTitle}>Every path, written down</h2>
            </div>
            <button
              type="button"
              className={styles.close}
              onClick={() => setIndexOpen(false)}
              aria-label="Close index"
              ref={closeButtonRef}
            >
              ✕
            </button>
          </div>

          <ul className={styles.indexRegions}>
            {atlasRegions.map((atlasRegion) => {
              const regionEntries = entriesByRegion.get(atlasRegion.id) ?? [];

              return (
                <li
                  key={atlasRegion.id}
                  className={styles.indexRegion}
                  style={{ "--region-color": atlasRegion.accent } as CSSProperties}
                >
                  <div className={styles.indexRegionHead}>
                    <span className={styles.indexRegionName}>
                      <span className={styles.indexDot} aria-hidden="true" />
                      {atlasRegion.name}
                    </span>
                    <span>{regionEntries.length} entries</span>
                  </div>
                  <ul className={styles.indexEntries}>
                    {regionEntries.map((regionEntry) => (
                      <li key={regionEntry.id}>
                        <button
                          type="button"
                          className={styles.indexEntry}
                          onClick={() => travelTo(regionEntry)}
                        >
                          <span>{regionEntry.title}</span>
                          <span className={styles.indexFound}>
                            {found.has(regionEntry.id) ? "found" : "unread"}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>

          <p className={styles.indexFoot}>
            {foundCount}/{TOTAL_FINDS} found · choose an entry to travel to its landmark
          </p>
        </aside>
      ) : null}

      {relic ? (
        <div className={styles.relicBackdrop} role="dialog" aria-label={relic.title}>
          <div className={styles.relicCard}>
            <p className={styles.relicKicker}>A relic of the Atlas</p>
            <h2 className={styles.relicTitle}>{relic.title}</h2>
            <p className={styles.relicQuote}>“{relic.quote}”</p>
            <p className={styles.relicAttribution}>{relic.attribution}</p>
            <p className={styles.relicHint}>{relic.hint}</p>
            <button
              type="button"
              className={`${styles.button} ${styles.relicClose}`}
              onClick={() => setRelic(null)}
            >
              Keep walking
            </button>
          </div>
        </div>
      ) : null}

      {!started ? (
        <div className={styles.intro}>
          <div className={styles.introCard}>
            <p className={styles.kicker}>Chapter 04 · The Atlas</p>
            <h2 className={styles.introTitle}>The Atlas</h2>
            <p className={styles.introLine}>
              A walkable world of the songs, films, books, poems, and ideas that shaped how I think.
              Five regions, fifteen influences, and a few sentences hidden in the dark.
            </p>
            <p className={styles.introMeta}>
              Walk the paths, look closer at what glows, and come back at night.
            </p>
            <ul className={styles.introControls}>
              <li>
                <kbd>WASD</kbd> walk
              </li>
              <li>
                <kbd>E</kbd> look closer
              </li>
              <li>
                <kbd>M</kbd> index
              </li>
              <li>
                <kbd>Esc</kbd> close
              </li>
            </ul>
            <button type="button" className={styles.introButton} onClick={begin}>
              Walk in
            </button>
            <button type="button" className={styles.introListLink} onClick={openList}>
              Read it as a list instead
            </button>
          </div>
        </div>
      ) : null}

      {started && !mobile ? (
        <div className={styles.hints} aria-hidden="true">
          <span>
            <kbd>WASD</kbd> walk
          </span>
          <span>
            <kbd>E</kbd> look closer
          </span>
          <span>
            <kbd>M</kbd> index
          </span>
          <span>night hides things</span>
        </div>
      ) : null}

      {started && mobile ? (
        <div className={styles.mobileControls}>
          <div
            ref={joystickRef}
            className={styles.joystick}
            onPointerDown={(event) => {
              joystickPointer.current = event.pointerId;
              event.currentTarget.setPointerCapture(event.pointerId);
              handleJoystickPointer(event);
            }}
            onPointerMove={(event) => {
              if (joystickPointer.current !== event.pointerId) return;
              handleJoystickPointer(event);
            }}
            onPointerUp={(event) => {
              if (joystickPointer.current !== event.pointerId) return;
              joystickPointer.current = null;
              setKnob({ x: 0, y: 0 });
              engineRef.current?.setJoystick(0, 0);
            }}
            onPointerCancel={(event) => {
              if (joystickPointer.current !== event.pointerId) return;
              joystickPointer.current = null;
              setKnob({ x: 0, y: 0 });
              engineRef.current?.setJoystick(0, 0);
            }}
          >
            <span
              className={styles.joystickKnob}
              style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }}
            />
          </div>
          <button
            type="button"
            className={styles.actionButton}
            disabled={!nearby}
            onClick={() => engineRef.current?.interact()}
            aria-label={nearby ? nearby.hint : "Nothing nearby"}
          >
            {nearby ? "Look" : "Walk"}
          </button>
        </div>
      ) : null}

      <p className={styles.srOnly}>
        {entryRegion ? `${entryRegion.name}: ${entry?.title}` : ""} · Library relic:{" "}
        {libraryRelic.title}
        {" · "}Regions: {atlasRegions.map((item) => item.name).join(", ")}
      </p>
    </main>
  );
}
