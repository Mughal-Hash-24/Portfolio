"use client";

import { Canvas } from "@react-three/fiber";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  explorationPhase,
  projectDomains,
  universeDuration,
  universePhases,
  universeStats,
  type UniverseDomain,
} from "@/content/projects-universe";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { buildUniverse } from "./universe-build";
import { UniverseScene } from "./universe-scene";
import { useUniverseScore } from "./use-universe-score";
import type { TimelineState, UniverseMode } from "./universe-types";
import styles from "./universe.module.css";

type Quality = "mobile" | "desktop";

function SpeakerIcon({ muted }: { muted: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
      <path d="M4 9.5h3.2L12 5.6v12.8L7.2 14.5H4z" fill="currentColor" />
      {muted ? (
        <path
          d="M16 9.2l4.2 5.6M20.2 9.2L16 14.8"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M15.4 8.4a5 5 0 010 7.2M18 6a8.5 8.5 0 010 12"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
        />
      )}
    </svg>
  );
}

function DomainProjects({ domain }: { domain: UniverseDomain }) {
  return (
    <ul className={styles.projectList}>
      {domain.projects.map((project) => (
        <li key={project.id} className={styles.project}>
          <div className={styles.projectHead}>
            <h3 className={styles.projectName}>{project.name}</h3>
            {project.href ? (
              <a
                className={styles.projectLink}
                href={project.href}
                target="_blank"
                rel="noreferrer"
              >
                Repo ↗
              </a>
            ) : (
              <span className={styles.projectPrivate}>Private</span>
            )}
          </div>
          <p className={styles.projectTagline}>{project.tagline}</p>
          <ul className={styles.stack} aria-label={`${project.name} stack`}>
            {project.stack.map((technology) => (
              <li key={technology} className={styles.chip}>
                {technology}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}

export function UniverseExperience() {
  const [quality] = useState<Quality>(() =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 760px)").matches
      ? "mobile"
      : "desktop",
  );
  const reducedMotion = useReducedMotion();
  const data = useMemo(
    () =>
      buildUniverse({
        perGalaxy: quality === "mobile" ? 2600 : 6000,
        dust: quality === "mobile" ? 5600 : 12000,
      }),
    [quality],
  );
  const timeline = useRef<TimelineState>({
    elapsed: 0,
    progress: 0,
    playing: false,
    started: false,
  });
  const progressBar = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [mode, setMode] = useState<UniverseMode>("intro");
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [visible, setVisible] = useState(true);
  const {
    status: scoreStatus,
    muted,
    available: scoreAvailable,
    sync: syncScore,
    pause: pauseScore,
    stop: stopScore,
    toggleMuted,
    retry: retryScore,
  } = useUniverseScore();

  const phase = universePhases[phaseIndex];
  const selectedDomain = selected === null ? null : projectDomains[selected];
  const explore = mode === "explore";

  const setProgressBar = useCallback((progress: number) => {
    if (progressBar.current) {
      progressBar.current.style.transform = `scaleX(${progress})`;
    }
  }, []);

  const begin = useCallback(() => {
    const state = timeline.current;
    state.started = true;
    state.elapsed = reducedMotion ? universeDuration : 0;
    state.progress = reducedMotion ? 1 : 0;
    state.playing = !reducedMotion;

    setStarted(true);
    setSelected(null);
    setPlaying(!reducedMotion);
    setMode(reducedMotion ? "explore" : "intro");
    setPhaseIndex(reducedMotion ? explorationPhase : 0);
    setProgressBar(reducedMotion ? 1 : 0);

    if (!reducedMotion) {
      syncScore(0);
    }
  }, [reducedMotion, setProgressBar, syncScore]);

  const skip = useCallback(() => {
    const state = timeline.current;
    state.started = true;
    state.elapsed = universeDuration;
    state.progress = 1;
    state.playing = false;

    setStarted(true);
    setPlaying(false);
    setMode("explore");
    setPhaseIndex(explorationPhase);
    setSelected(null);
    setProgressBar(1);
    stopScore(600);
  }, [setProgressBar, stopScore]);

  const replay = useCallback(() => {
    const state = timeline.current;
    state.started = true;
    state.elapsed = 0;
    state.progress = 0;
    state.playing = true;

    setStarted(true);
    setPlaying(true);
    setMode("intro");
    setPhaseIndex(0);
    setSelected(null);
    setHovered(null);
    setProgressBar(0);
    syncScore(0);
  }, [setProgressBar, syncScore]);

  const togglePlayback = useCallback(() => {
    if (mode !== "intro") return;

    const next = !timeline.current.playing;
    timeline.current.playing = next;
    setPlaying(next);

    if (next) {
      syncScore(timeline.current.elapsed);
    } else {
      pauseScore();
    }
  }, [mode, pauseScore, syncScore]);

  const seekToPhase = useCallback(
    (index: number) => {
      if (index === explorationPhase) {
        skip();
        return;
      }

      const next = universePhases[index];
      const state = timeline.current;
      state.started = true;
      state.elapsed = next.start;
      state.progress = next.start / universeDuration;
      state.playing = true;

      setStarted(true);
      setPlaying(true);
      setMode("intro");
      setPhaseIndex(index);
      setSelected(null);
      setHovered(null);
      setProgressBar(state.progress);
      syncScore(next.start);
    },
    [setProgressBar, skip, syncScore],
  );

  const complete = useCallback(() => {
    const state = timeline.current;
    state.elapsed = universeDuration;
    state.progress = 1;
    state.playing = false;

    setPlaying(false);
    setMode("explore");
    setPhaseIndex(explorationPhase);
    setProgressBar(1);
  }, [setProgressBar]);

  useEffect(() => {
    if (!started) return;

    if (playing && mode === "intro") {
      syncScore(timeline.current.elapsed);
    } else if (mode === "intro") {
      pauseScore();
    }
  }, [started, mode, playing, phaseIndex, syncScore, pauseScore]);

  useEffect(() => {
    const handleVisibility = () => {
      const hidden = document.hidden;
      setVisible(!hidden);

      if (hidden) {
        pauseScore();
      } else if (started && mode === "intro" && timeline.current.playing) {
        syncScore(timeline.current.elapsed);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [started, mode, pauseScore, syncScore]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelected(null);
        setHovered(null);
        return;
      }

      if (event.code !== "Space" || !started || mode !== "intro") return;

      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;

      if (tag === "BUTTON" || tag === "A" || tag === "INPUT" || tag === "TEXTAREA") {
        return;
      }

      event.preventDefault();
      togglePlayback();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [started, mode, togglePlayback]);

  const handleAudio = useCallback(() => {
    if (!scoreAvailable) return;

    if (scoreStatus === "blocked") {
      retryScore(timeline.current.elapsed);
      return;
    }

    toggleMuted();

    if (muted && started && mode === "intro" && playing) {
      syncScore(timeline.current.elapsed);
    }
  }, [
    muted,
    mode,
    playing,
    retryScore,
    scoreAvailable,
    scoreStatus,
    started,
    syncScore,
    toggleMuted,
  ]);

  const audioLabel = !scoreAvailable
    ? "Score unavailable"
    : scoreStatus === "blocked"
      ? "Enable score"
      : muted
        ? "Score off"
        : "Score on";

  return (
    <main
      className={styles.shell}
      aria-label="Projects universe"
      data-mode={mode}
      data-selected={selectedDomain ? "true" : "false"}
    >
      <h1 className={styles.srOnly}>Projects — A Universe of Work</h1>

      <div className={styles.canvas} aria-hidden="true">
        <Canvas
          camera={{ position: [0, 2, 7], fov: 50, near: 0.1, far: 500 }}
          dpr={quality === "mobile" ? [1, 1.5] : [1, 2]}
          gl={{
            antialias: false,
            alpha: false,
            powerPreference: "high-performance",
          }}
          frameloop={visible ? "always" : "never"}
        >
          <UniverseScene
            data={data}
            timeline={timeline}
            mode={mode}
            selected={selected}
            hovered={hovered}
            onHover={setHovered}
            onSelect={setSelected}
            onPhase={setPhaseIndex}
            onComplete={complete}
            progressBarRef={progressBar}
            quality={quality}
            reducedMotion={reducedMotion}
          />
        </Canvas>
      </div>

      <div className={styles.scrim} aria-hidden="true" />

      <div className={styles.srOnly} role="status" aria-live="polite">
        {explore
          ? `Present day. ${universeStats.domains} project domains.`
          : `${phase.title}. ${phase.era}. ${phase.copy}`}
      </div>

      {started ? (
        <header className={styles.topbar}>
          <Link href="/" prefetch={false} className={styles.backLink}>
            ← Title screen
          </Link>

          <div className={styles.brand}>
            <p className={styles.brandTitle}>Projects</p>
            <p className={styles.brandSubtitle}>A universe of work</p>
          </div>

          <button
            type="button"
            className={styles.audio}
            onClick={handleAudio}
            aria-pressed={!muted}
            aria-label={audioLabel}
            disabled={!scoreAvailable}
            title={
              scoreAvailable
                ? "The score stays silent through the Big Bang."
                : "Add public/audio/_dev/universe/no_time_for_caution.mp3 or set NEXT_PUBLIC_UNIVERSE_SCORE_URL."
            }
            data-muted={muted}
          >
            <SpeakerIcon muted={muted || !scoreAvailable} />
            <span>{audioLabel}</span>
          </button>
        </header>
      ) : null}

      {!started ? (
        <section className={styles.begin} aria-labelledby="universe-begin-title">
          <div className={styles.beginGlow} aria-hidden="true" />
          <div className={styles.beginInner}>
            <p className={styles.beginEyebrow}>Chapter 01 · Projects</p>
            <h2 id="universe-begin-title" className={styles.beginTitle}>
              A Universe
              <br />
              of Work
            </h2>
            <p className={styles.beginCopy}>
              From a single point to eight galaxies of projects. A cinematic timeline of the
              universe, then a world you can explore — every domain of work mapped to a galaxy of
              its own.
            </p>
            <dl className={styles.beginStats}>
              <div>
                <dt>Epochs</dt>
                <dd>{universePhases.length}</dd>
              </div>
              <div>
                <dt>Domains</dt>
                <dd>{universeStats.domains}</dd>
              </div>
              <div>
                <dt>Projects</dt>
                <dd>{universeStats.projects}</dd>
              </div>
            </dl>
            <div className={styles.beginActions}>
              <button type="button" className={styles.primary} onClick={begin}>
                Begin the timeline
              </button>
              <button type="button" className={styles.secondary} onClick={skip}>
                Skip to the present
              </button>
            </div>
            <p className={styles.beginNote}>
              Six seconds of silence first — sound has no medium at the Big Bang.
              {reducedMotion ? " Reduced motion is on; the world opens directly." : ""}
            </p>
            <ol className={styles.beginPhases} aria-label="Timeline preview">
              {universePhases.map((item, index) => (
                <li key={item.id}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {item.title}
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      {started && mode === "intro" ? (
        <section key={phase.id} className={styles.phaseCard} aria-labelledby="phase-title">
          <p className={styles.phaseKicker}>
            Epoch {String(phaseIndex + 1).padStart(2, "0")} /{" "}
            {String(universePhases.length).padStart(2, "0")}
          </p>
          <h2 id="phase-title" className={styles.phaseTitle}>
            {phase.title}
          </h2>
          <p className={styles.phaseEra}>{phase.era}</p>
          <p className={styles.phaseCopy}>{phase.copy}</p>
          <p className={styles.phaseMeta}>
            {phaseIndex === 0
              ? "Silence — no medium for sound"
              : scoreAvailable
                ? muted
                  ? "Score muted"
                  : "Score running"
                : "Score unavailable"}
          </p>
        </section>
      ) : null}

      {started && explore && selectedDomain === null ? (
        <section className={styles.phaseCard} aria-labelledby="present-title">
          <p className={styles.phaseKicker}>Present day · Chapter 01</p>
          <h2 id="present-title" className={styles.phaseTitle}>
            The known universe
          </h2>
          <p className={styles.phaseEra}>
            {universeStats.domains} domains · {universeStats.projects} projects
          </p>
          <p className={styles.phaseCopy}>
            Each galaxy is a domain of work. Pick one to fly in, then open a project to see the
            stack beneath it.
          </p>
          <p className={styles.phaseMeta}>Drag to orbit · Scroll to zoom</p>
        </section>
      ) : null}

      {started && explore && selectedDomain !== null ? (
        <section
          className={`${styles.phaseCard} ${styles.domainCard}`}
          aria-labelledby="domain-title"
        >
          <p className={styles.phaseKicker}>Domain galaxy</p>
          <h2 id="domain-title" className={styles.phaseTitle}>
            {selectedDomain.name}
          </h2>
          <p className={styles.phaseEra}>
            {selectedDomain.projects.length}{" "}
            {selectedDomain.projects.length === 1 ? "project" : "projects"}
          </p>
          <p className={styles.phaseCopy}>{selectedDomain.blurb}</p>
          <button type="button" className={styles.textButton} onClick={() => setSelected(null)}>
            ← Back to the cosmos
          </button>
        </section>
      ) : null}

      {started && mode === "intro" ? (
        <nav className={styles.timeline} aria-label="Universe timeline">
          <div className={styles.railHeader}>
            <span>Timeline</span>
            <span>13.8 Gyr</span>
          </div>
          <div className={styles.railTrack} aria-hidden="true">
            <span ref={progressBar} className={styles.railFill} />
          </div>
          <ol className={styles.railList}>
            {universePhases.map((item, index) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={styles.railButton}
                  data-active={index === phaseIndex}
                  aria-current={index === phaseIndex ? "step" : undefined}
                  onClick={() => seekToPhase(index)}
                >
                  <span className={styles.railIndex}>{String(index + 1).padStart(2, "0")}</span>
                  <span className={styles.railTitle}>{item.title}</span>
                  <span className={styles.railEra}>{item.era}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>
      ) : null}

      {started && explore && selectedDomain === null ? (
        <nav className={styles.domainIndex} aria-label="Project domains">
          <div className={styles.railHeader}>
            <span>Domains</span>
            <span>{universeStats.projects} projects</span>
          </div>
          <ul className={styles.domainList}>
            {projectDomains.map((domain, index) => (
              <li key={domain.id}>
                <button
                  type="button"
                  className={styles.domainButton}
                  onClick={() => setSelected(index)}
                  style={
                    {
                      "--domain-color": domain.palette.mid,
                    } as CSSProperties
                  }
                >
                  <span className={styles.domainDot} aria-hidden="true" />
                  <span>{domain.name}</span>
                  <span className={styles.domainCount}>{domain.projects.length}</span>
                </button>
              </li>
            ))}
          </ul>
          <p className={styles.railFoot}>Select a galaxy to fly in.</p>
        </nav>
      ) : null}

      {started && explore && selectedDomain !== null ? (
        <aside className={styles.projectPanel} aria-label={`${selectedDomain.name} projects`}>
          <div className={styles.railHeader}>
            <span>{selectedDomain.name}</span>
            <span>{selectedDomain.projects.length} projects</span>
          </div>
          <DomainProjects domain={selectedDomain} />
        </aside>
      ) : null}

      {started && mode === "intro" ? (
        <>
          <div className={styles.controls}>
            <button type="button" className={styles.control} onClick={togglePlayback}>
              {playing ? "Pause" : "Resume"}
            </button>
            <button type="button" className={styles.control} onClick={skip}>
              Skip to the present
            </button>
          </div>
          <p className={styles.hint}>Space to pause · Click the timeline to jump</p>
        </>
      ) : null}

      {started && explore && selectedDomain === null ? (
        <>
          <div className={styles.controls}>
            <button type="button" className={styles.control} onClick={replay}>
              Replay the beginning
            </button>
          </div>
          <p className={styles.hint}>Click a galaxy to fly in · Esc returns</p>
        </>
      ) : null}

      {started && explore && selectedDomain !== null ? (
        <>
          <div className={styles.controls}>
            <button type="button" className={styles.control} onClick={() => setSelected(null)}>
              Back to the cosmos
            </button>
          </div>
          <p className={styles.hint}>Drag to orbit · Scroll to zoom · Esc returns</p>
        </>
      ) : null}
    </main>
  );
}
