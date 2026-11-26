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
import {
  arcadeStatues,
  guideName,
  missionStatement,
  type ArcadeStatue,
  type StoryStage,
} from "@/content/atlas-story";
import { useAudio } from "@/components/audio/audio-provider";
import { SafarSfx } from "./atlas-sfx";
import { SafarAudioDock } from "./safar-audio-dock";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { AtlasEngine, type Nearby } from "./atlas-engine";
import styles from "./atlas.module.css";

const FOUND_KEY = "atlas:found:v1";
const STORY_KEY = "atlas:story:v1";
const SFX_KEY = "safar:sfx:v1";
const RELIC_TOTAL = atlasRelics.length + 1;
const TOTAL_FINDS = atlasEntries.length + RELIC_TOTAL + arcadeStatues.length;

const memory = {
  kicker: "2011 · The First Question",
  title: "The Middle Button",
  line: "You wanted to play Uphill Rush. You pressed the middle mouse button, and nothing happened.",
  note: "You did not know it then, but that question — why is nothing happening? — was the first line of code you ever wrote.",
};

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

function loadStoryComplete() {
  if (typeof window === "undefined") return false;

  try {
    return window.localStorage.getItem(STORY_KEY) === "done";
  } catch {
    return false;
  }
}

function saveFound(found: Set<string>) {
  try {
    window.localStorage.setItem(FOUND_KEY, JSON.stringify([...found]));
  } catch {
    // Ignore.
  }
}

function saveStoryComplete() {
  try {
    window.localStorage.setItem(STORY_KEY, "done");
  } catch {
    // Ignore.
  }
}

function loadSfxEnabled() {
  if (typeof window === "undefined") return true;

  try {
    return window.localStorage.getItem(SFX_KEY) !== "off";
  } catch {
    return true;
  }
}

function saveSfxEnabled(enabled: boolean) {
  try {
    window.localStorage.setItem(SFX_KEY, enabled ? "on" : "off");
  } catch {
    // Ignore.
  }
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

export function AtlasExperience() {
  const reducedMotion = useReducedMotion();
  const audio = useAudio();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<AtlasEngine | null>(null);
  const foundRef = useRef<Set<string>>(new Set());
  const optionsRef = useRef({
    reducedMotion: false,
    found: new Set<string>(),
    storyComplete: false,
  });
  const joystickRef = useRef<HTMLDivElement>(null);
  const joystickPointer = useRef<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const missionButtonRef = useRef<HTMLButtonElement>(null);
  const sfxRef = useRef<SafarSfx | null>(null);
  const sceneRef = useRef<"world" | "library" | "arcade">("world");
  const hourRef = useRef(12);

  const [deepEntry] = useState(hashEntry);
  const startedRef = useRef(Boolean(deepEntry));
  const [started, setStarted] = useState(Boolean(deepEntry));
  const [nearby, setNearby] = useState<Nearby | null>(null);
  const [entry, setEntry] = useState<AtlasEntry | null>(deepEntry);
  const [relic, setRelic] = useState<AtlasRelic | null>(null);
  const [statue, setStatue] = useState<ArcadeStatue | null>(null);
  const [missionOpen, setMissionOpen] = useState(false);
  const [memoryOpen, setMemoryOpen] = useState(false);
  const [indexOpen, setIndexOpen] = useState(false);
  const [hour, setHour] = useState(12);
  const [guideLine, setGuideLine] = useState<string | null>(null);
  const [storyStage, setStoryStage] = useState<StoryStage>("pond");
  const [storyComplete, setStoryComplete] = useState(false);
  const [storyReady, setStoryReady] = useState(false);
  const [scene, setScene] = useState<"world" | "library" | "arcade">("world");
  const [sfxEnabled, setSfxEnabled] = useState(loadSfxEnabled);
  const [found, setFound] = useState<Set<string>>(new Set());
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const [mobile, setMobile] = useState(false);

  const foundCount = found.size;
  const night = hour >= 19.5 || hour < 5.5;
  const overlayOpen = Boolean(entry || relic || statue || missionOpen || memoryOpen || indexOpen);
  const storyActive = storyStage !== "done";

  const location =
    scene === "arcade" ? "The Arcade" : scene === "library" ? "The Long Library" : "The Meadow";

  useEffect(() => {
    optionsRef.current.reducedMotion = reducedMotion;
    engineRef.current?.setReducedMotion(reducedMotion);
  }, [reducedMotion]);

  useEffect(() => {
    const query = window.matchMedia("(pointer: coarse), (max-width: 760px)");
    const update = () => setMobile(query.matches);

    update();
    query.addEventListener("change", update);

    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const sfx = new SafarSfx();
    sfxRef.current = sfx;
    sfx.setEnabled(loadSfxEnabled());
    sfx.setRoom(sceneRef.current === "arcade" ? "arcade" : "none");

    return () => {
      sfx.dispose();
      sfxRef.current = null;
    };
  }, []);

  useEffect(() => {
    saveSfxEnabled(sfxEnabled);
    sfxRef.current?.setEnabled(sfxEnabled);
  }, [sfxEnabled]);

  useEffect(() => {
    sceneRef.current = scene;
    sfxRef.current?.setRoom(scene === "arcade" ? "arcade" : "none");
  }, [scene]);

  useEffect(() => {
    hourRef.current = hour;
  }, [hour]);

  useEffect(() => {
    if (!started) return;

    const first = window.setTimeout(() => {
      const sfx = sfxRef.current;
      if (!sfx || document.hidden) return;
      if (sceneRef.current === "arcade") sfx.arcadeBuzz();
      else if (hourRef.current >= 19.5 || hourRef.current < 5.5) sfx.crickets();
      else sfx.birds();
    }, 3500);

    let timer = 0;

    const schedule = () => {
      timer = window.setTimeout(
        () => {
          const sfx = sfxRef.current;

          if (sfx && !document.hidden && sfxEnabled) {
            if (sceneRef.current === "arcade") {
              if (Math.random() < 0.55) sfx.arcadeBuzz();
              else sfx.coin();
            } else if (hourRef.current >= 19.5 || hourRef.current < 5.5) {
              sfx.crickets();
            } else {
              sfx.birds();
            }
          }

          schedule();
        },
        6500 + Math.random() * 7500,
      );
    };

    const starter = window.setTimeout(schedule, 5000);

    return () => {
      window.clearTimeout(first);
      window.clearTimeout(starter);
      window.clearTimeout(timer);
    };
  }, [started, sfxEnabled]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const stored = loadFound();
    foundRef.current = stored;
    optionsRef.current.found = stored;
    setFound(new Set(stored));

    const storyDone = loadStoryComplete();
    optionsRef.current.storyComplete = storyDone;
    setStoryComplete(storyDone);

    const engine = new AtlasEngine(
      canvas,
      {
        onNearby: setNearby,
        onOpenEntry: (opened) => {
          setEntry(opened);
          setIndexOpen(false);
          setRelic(null);
          setStatue(null);
          setHash(opened.id);
        },
        onOpenRelic: (opened) => {
          setRelic(opened);
          setEntry(null);
          setIndexOpen(false);
          setStatue(null);
        },
        onOpenStatue: (opened) => {
          setStatue(opened);
          setEntry(null);
          setRelic(null);
          setIndexOpen(false);
        },
        onOpenIndex: () => {
          setIndexOpen(true);
          setEntry(null);
          setRelic(null);
          setStatue(null);
        },
        onOpenMission: () => setMissionOpen(true),
        onOpenMemory: () => setMemoryOpen(true),
        onTime: setHour,
        onFound: (_kind, id) => {
          foundRef.current.add(id);
          setFound(new Set(foundRef.current));
          saveFound(foundRef.current);
        },
        onGuide: setGuideLine,
        onStoryStage: (stage) => {
          setStoryStage(stage);
          setStoryReady(true);
        },
        onStoryComplete: () => {
          saveStoryComplete();
          setStoryComplete(true);
        },
        onScene: setScene,
        onStep: (surface) => sfxRef.current?.step(surface),
        onSfx: (event) => sfxRef.current?.play(event),
      },
      optionsRef.current,
    );

    engineRef.current = engine;
    engine.start();

    if (deepEntry) {
      engine.begin();
      engine.focusEntry(deepEntry.id);
      engine.enableFreeRoam();
      setHash(deepEntry.id);
    }

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [deepEntry]);

  useEffect(() => {
    if (missionOpen || memoryOpen) {
      missionButtonRef.current?.focus();
      return;
    }

    if (!(indexOpen || statue)) return;
    closeButtonRef.current?.focus();
  }, [indexOpen, missionOpen, memoryOpen, statue]);

  useEffect(() => {
    const handleHash = () => {
      const target = hashEntry();

      if (!target) return;

      const engine = engineRef.current;

      if (!startedRef.current) {
        startedRef.current = true;
        setStarted(true);
        engine?.begin();
        engine?.enableFreeRoam();
      }

      engine?.focusEntry(target.id);
      setEntry(target);
      setRelic(null);
      setStatue(null);
      setMissionOpen(false);
      setMemoryOpen(false);
      setIndexOpen(false);
      setHash(target.id);
    };

    window.addEventListener("hashchange", handleHash);

    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const dismissOverlays = useCallback(() => {
    if (memoryOpen) {
      setMemoryOpen(false);
      return true;
    }

    if (missionOpen) {
      setMissionOpen(false);
      engineRef.current?.setInputEnabled(true);
      if (storyStage === "pond" && !storyComplete) engineRef.current?.startStory();
      return true;
    }

    if (relic) {
      setRelic(null);
      return true;
    }

    if (statue) {
      setStatue(null);
      return true;
    }

    if (entry) {
      setEntry(null);
      setHash(null);
      return true;
    }

    if (indexOpen) {
      setIndexOpen(false);
      return true;
    }

    return false;
  }, [entry, indexOpen, memoryOpen, missionOpen, relic, statue, storyComplete, storyStage]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (document.querySelector("dialog[open]")) return;

      if (event.key === "Escape") {
        dismissOverlays();
        return;
      }

      if (event.code !== "Space" || !guideLine) return;

      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;

      if (tag === "BUTTON" || tag === "A" || tag === "INPUT" || tag === "TEXTAREA") return;

      event.preventDefault();
      engineRef.current?.advanceDialogue();
    };

    window.addEventListener("keydown", handleKey);

    return () => window.removeEventListener("keydown", handleKey);
  }, [dismissOverlays, guideLine]);

  const begin = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    setStarted(true);
    audio.playClick();
    void sfxRef.current?.resume();
    audio.startBackground();
    engineRef.current?.begin();

    if (loadStoryComplete()) {
      setStoryComplete(true);
      engineRef.current?.startStory();
      return;
    }

    setMissionOpen(true);
    engineRef.current?.setInputEnabled(false);
  }, [audio]);

  const closeMission = useCallback(() => {
    setMissionOpen(false);
    engineRef.current?.setInputEnabled(true);
    if (storyStage === "pond" && !storyComplete) engineRef.current?.startStory();
  }, [storyComplete, storyStage]);

  const openList = useCallback(() => {
    begin();
    setMissionOpen(false);
    engineRef.current?.setInputEnabled(true);
    if (storyStage === "pond" && !storyComplete) engineRef.current?.startStory();
    setIndexOpen(true);
  }, [begin, storyComplete, storyStage]);

  const travelTo = useCallback((target: AtlasEntry) => {
    engineRef.current?.focusEntry(target.id);
    setEntry(target);
    setIndexOpen(false);
    setRelic(null);
    setStatue(null);
    setHash(target.id);
  }, []);

  const travelToStatue = useCallback((target: ArcadeStatue) => {
    engineRef.current?.focusStatue(target.id);
    setStatue(target);
    setEntry(null);
    setRelic(null);
    setIndexOpen(false);
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

  const region = entry ? regionById.get(entry.region) : null;

  return (
    <main className={styles.shell} aria-label="Safar" data-overlay={overlayOpen ? "true" : "false"}>
      <h1 className={styles.srOnly}>Safar — a walk through the things that shaped me</h1>

      <div className={styles.stage} ref={stageRef} aria-hidden="true">
        <canvas ref={canvasRef} />
      </div>
      <div
        className={styles.screenFx}
        data-scene={scene}
        data-night={night ? "true" : "false"}
        aria-hidden="true"
      />

      <div className={styles.srOnly} role="status" aria-live="polite">
        {nearby ? `${nearby.label}. ${nearby.hint}.` : ""}
      </div>

      {started ? (
        <header className={styles.hud}>
          <div className={styles.brand}>
            <p className={styles.wordmark}>Safar</p>
            <p className={styles.location}>{location}</p>
          </div>

          <div className={styles.hudActions}>
            <Link
              href="/"
              prefetch={false}
              className={styles.button}
              aria-label="Back to title screen"
              onClick={() => audio.playClick()}
            >
              ← Home
            </Link>
            <SafarAudioDock
              sfxEnabled={sfxEnabled}
              onToggleSfx={() => setSfxEnabled((value) => !value)}
            />
            <button
              type="button"
              className={styles.button}
              onClick={() => {
                audio.playClick();
                openList();
              }}
              aria-haspopup="dialog"
            >
              Journal
            </button>
            {scene === "world" ? (
              <span className={styles.clock} title="World time">
                <span className={styles.clockIcon} data-night={night} aria-hidden="true" />
                {formatHour(hour)}
              </span>
            ) : null}
          </div>
        </header>
      ) : null}

      {started && guideLine && !overlayOpen ? (
        <section className={styles.dialogue} aria-label={`${guideName} speaks`}>
          <p className={styles.dialogueSpeaker}>{guideName}</p>
          <p className={styles.dialogueLine}>{guideLine}</p>
          <div className={styles.dialogueActions}>
            <button
              type="button"
              className={styles.dialogueContinue}
              onClick={() => {
                audio.playClick();
                engineRef.current?.advanceDialogue();
              }}
            >
              Continue{mobile ? "" : " · Space"}
            </button>
            {storyActive || scene === "arcade" ? (
              <button
                type="button"
                className={styles.dialogueSkip}
                onClick={() => {
                  engineRef.current?.skipStory();
                  setIndexOpen(false);
                }}
              >
                Skip the journey
              </button>
            ) : null}
          </div>
        </section>
      ) : null}

      {started && nearby && !overlayOpen && !guideLine ? (
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

      {statue ? (
        <div
          className={styles.plaqueLayer}
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) {
              audio.playClick();
              setStatue(null);
            }
          }}
        >
          <section
            className={styles.plaque}
            style={{ "--game-accent": statue.paint } as CSSProperties}
            role="dialog"
            aria-modal="true"
            aria-label={`${statue.game} inscription`}
          >
            <span className={styles.plaqueRivet} data-corner="tl" aria-hidden="true" />
            <span className={styles.plaqueRivet} data-corner="tr" aria-hidden="true" />
            <span className={styles.plaqueRivet} data-corner="bl" aria-hidden="true" />
            <span className={styles.plaqueRivet} data-corner="br" aria-hidden="true" />

            <header className={styles.plaqueHead}>
              <div>
                <p className={styles.plaqueGame}>{statue.game}</p>
                <p className={styles.plaqueSource}>{statue.source}</p>
              </div>
              <span className={styles.plaqueYear}>{statue.year}</span>
            </header>

            <blockquote className={styles.plaqueQuote}>“{statue.quote}”</blockquote>

            <footer className={styles.plaqueFoot}>
              <span className={styles.plaqueMark}>{statue.game}</span>
              <span className={styles.plaqueCloseHint}>
                {found.has(statue.id) ? "read" : "new"} · {mobile ? "tap outside" : "E / Esc"}
              </span>
            </footer>

            <button
              type="button"
              className={styles.plaqueClose}
              onClick={() => {
                audio.playClick();
                setStatue(null);
              }}
              aria-label="Close inscription"
              ref={closeButtonRef}
            >
              ✕
            </button>
          </section>
        </div>
      ) : null}

      {indexOpen ? (
        <aside className={styles.index} role="dialog" aria-label="Safar journal">
          <div className={styles.indexHead}>
            <div>
              <p className={styles.panelKicker}>Safar</p>
              <h2 className={styles.indexTitle}>Journal</h2>
            </div>
            <button
              type="button"
              className={styles.close}
              onClick={() => setIndexOpen(false)}
              aria-label="Close journal"
              onClickCapture={() => audio.playClick()}
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

            <li
              className={styles.indexRegion}
              style={{ "--region-color": "#ff7ab8" } as CSSProperties}
            >
              <div className={styles.indexRegionHead}>
                <span className={styles.indexRegionName}>
                  <span className={styles.indexDot} aria-hidden="true" />
                  The Arcade
                </span>
                <span>{arcadeStatues.length} statues</span>
              </div>
              <ul className={styles.indexEntries}>
                {arcadeStatues.map((arcadeStatue) => (
                  <li key={arcadeStatue.id}>
                    <button
                      type="button"
                      className={styles.indexEntry}
                      onClick={() => travelToStatue(arcadeStatue)}
                    >
                      <span>{arcadeStatue.game}</span>
                      <span className={styles.indexFound}>
                        {found.has(arcadeStatue.id) ? "read" : "unread"}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          </ul>

          <div className={styles.indexFoot}>
            <p>
              {foundCount}/{TOTAL_FINDS} found · choose an entry to travel to its landmark
            </p>
            <button
              type="button"
              className={styles.indexMission}
              onClick={() => {
                setIndexOpen(false);
                setMissionOpen(true);
              }}
            >
              Read the pond inscription
            </button>
          </div>
        </aside>
      ) : null}

      {missionOpen ? (
        <div className={styles.missionBackdrop} role="dialog" aria-label="The mission statement">
          <div className={styles.missionCard}>
            <p className={styles.missionKicker}>The Pond of Wisdom</p>
            <h2 className={styles.missionTitle}>The Inscription</h2>
            <blockquote className={styles.missionQuote}>
              <p>“{missionStatement.quote}”</p>
              <p className={styles.missionAttribution}>{missionStatement.attribution}</p>
            </blockquote>
            <p className={styles.missionNote}>{missionStatement.note}</p>
            <button
              type="button"
              className={styles.missionButton}
              onClick={() => {
                audio.playClick();
                closeMission();
              }}
              ref={missionButtonRef}
            >
              Continue the journey
            </button>
          </div>
        </div>
      ) : null}

      {memoryOpen ? (
        <div className={styles.missionBackdrop} role="dialog" aria-label={memory.title}>
          <div className={styles.missionCard}>
            <p className={styles.missionKicker}>{memory.kicker}</p>
            <h2 className={styles.missionTitle}>{memory.title}</h2>
            <p className={styles.memoryLine}>{memory.line}</p>
            <p className={styles.missionNote}>{memory.note}</p>
            <button
              type="button"
              className={styles.missionButton}
              onClick={() => setMemoryOpen(false)}
              ref={missionButtonRef}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}

      {relic ? (
        <div className={styles.relicBackdrop} role="dialog" aria-label={relic.title}>
          <div className={styles.relicCard}>
            <p className={styles.relicKicker}>A relic from the road</p>
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
          <div className={styles.introPanel}>
            <p className={styles.introKicker}>
              <span lang="ur" dir="rtl">
                سفر
              </span>
              <span>the journey</span>
            </p>
            <h2 className={styles.introTitle}>Safar</h2>
            <p className={styles.introLine}>
              A walk through the songs, films, books, and games that made me.
            </p>
            <p className={styles.introMeta}>Pir-e-Iqbal is waiting at the pond.</p>
            <div className={styles.introMenu}>
              <button type="button" className={styles.introPrimary} onClick={begin}>
                <span>Walk in</span>
                <span aria-hidden="true">→</span>
              </button>
              <button
                type="button"
                className={styles.introSecondary}
                onClick={() => {
                  audio.playClick();
                  openList();
                }}
              >
                <span>Open the journal</span>
                <span aria-hidden="true">↗</span>
              </button>
            </div>
            <ul className={styles.introControls}>
              <li>
                <kbd>WASD</kbd> walk
              </li>
              <li>
                <kbd>E</kbd> look
              </li>
              <li>
                <kbd>Space</kbd> talk
              </li>
              <li>
                <kbd>J</kbd> journal
              </li>
            </ul>
          </div>
        </div>
      ) : null}

      {started && !mobile && !overlayOpen && !guideLine ? (
        <div className={styles.hints} aria-hidden="true">
          <span>
            <kbd>WASD</kbd> walk
          </span>
          <span>
            <kbd>E</kbd> look closer
          </span>
          <span>
            <kbd>Space</kbd> talk
          </span>
          <span>
            <kbd>J</kbd> journal
          </span>
        </div>
      ) : null}

      {started && mobile && !overlayOpen && !guideLine ? (
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
            disabled={!nearby && !guideLine}
            onClick={() => {
              if (nearby) engineRef.current?.interact();
              else engineRef.current?.advanceDialogue();
            }}
            aria-label={nearby ? nearby.hint : "Continue the dialogue"}
          >
            {nearby ? "Look" : guideLine ? "Talk" : "Walk"}
          </button>
        </div>
      ) : null}

      <p className={styles.srOnly}>
        {region ? `${region.name}: ${entry?.title}` : ""} · Guide: {guideName} · Story: {storyStage}{" "}
        · Regions: {atlasRegions.map((item) => item.name).join(", ")} · Library relic:{" "}
        {libraryRelic.title} · Statues: {arcadeStatues.length} · Story complete:{" "}
        {storyComplete ? "yes" : "no"} · Story ready: {storyReady ? "yes" : "no"}
      </p>
    </main>
  );
}
