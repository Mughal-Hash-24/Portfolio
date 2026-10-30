"use client";

import { Canvas } from "@react-three/fiber";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  explorationPhase,
  projectById,
  projectDomains,
  universeDuration,
  universePhases,
  universeStats,
  type UniverseDomain,
  type UniverseProject,
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
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
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

function PlayIcon({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M8 5.4v13.2L19 12z" fill="currentColor" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path d="M7 5h3.4v14H7zM13.6 5H17v14h-3.4z" fill="currentColor" />
    </svg>
  );
}

function SkipIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path d="M6 5.4v13.2L15 12zM16.5 5.4H19v13.2h-2.5z" fill="currentColor" />
    </svg>
  );
}

function ReplayIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path
        d="M19.2 12a7.2 7.2 0 11-2.1-5.1M19.2 4.5v5h-5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path
        d="M19 12H5M11 6l-6 6 6 6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DomainProjects({ domain }: { domain: UniverseDomain }) {
  const projects = domain.projectIds
    .map((id) => projectById.get(id))
    .filter((project): project is UniverseProject => Boolean(project));

  return (
    <ul className={styles.projectList}>
      {projects.map((project) => (
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
        dust: quality === "mobile" ? 8000 : 18000,
      }),
    [quality],
  );
  const timeline = useRef<TimelineState>({
    elapsed: 0,
    progress: 0,
    playing: false,
    started: false,
  });
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

    if (!reducedMotion) {
      syncScore(0);
    }
  }, [reducedMotion, syncScore]);

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
    stopScore(600);
  }, [stopScore]);

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
    syncScore(0);
  }, [syncScore]);

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

  const complete = useCallback(() => {
    const state = timeline.current;
    state.elapsed = universeDuration;
    state.progress = 1;
    state.playing = false;

    setPlaying(false);
    setMode("explore");
    setPhaseIndex(explorationPhase);
  }, []);

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

  const audioLabel =
    scoreStatus === "blocked" ? "Enable score" : muted ? "Unmute score" : "Mute score";

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
            quality={quality}
            reducedMotion={reducedMotion}
          />
        </Canvas>
      </div>

      <div className={styles.scrim} aria-hidden="true" />

      <div className={styles.srOnly} role="status" aria-live="polite">
        {explore
          ? `Present day. ${universeStats.domains} domains.`
          : `${phase.title}. ${phase.era}. ${phase.copy}`}
      </div>

      <header className={styles.topbar}>
        <Link
          href="/"
          prefetch={false}
          className={styles.iconButton}
          aria-label="Back to title screen"
          title="Back to title screen"
        >
          <ArrowLeftIcon />
        </Link>

        {started && scoreAvailable ? (
          <button
            type="button"
            className={styles.iconButton}
            onClick={handleAudio}
            aria-label={audioLabel}
            title={audioLabel}
            aria-pressed={!muted}
            data-blocked={scoreStatus === "blocked"}
          >
            <SpeakerIcon muted={muted} />
          </button>
        ) : null}
      </header>

      {!started ? (
        <section className={styles.begin} aria-label="Begin the universe timeline">
          <div className={styles.beginGlow} aria-hidden="true" />
          <button
            type="button"
            className={styles.beginButton}
            onClick={begin}
            aria-label="Begin the universe timeline"
            title="Begin"
          >
            <PlayIcon size={30} />
          </button>
        </section>
      ) : null}

      {started && mode === "intro" ? (
        <section key={phase.id} className={styles.eventName}>
          <h2>{phase.title}</h2>
        </section>
      ) : null}

      {started && explore && selectedDomain === null ? (
        <nav className={styles.domainIndex} aria-label="Project domains">
          <div className={styles.panelHeader}>
            <span>Domains</span>
            <span>{universeStats.projects}</span>
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
                  <span className={styles.domainCount}>{domain.projectIds.length}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      {started && explore && selectedDomain !== null ? (
        <aside className={styles.projectPanel} aria-label={`${selectedDomain.name} projects`}>
          <div className={styles.panelHeader}>
            <span>{selectedDomain.name}</span>
            <button
              type="button"
              className={styles.panelClose}
              onClick={() => setSelected(null)}
              aria-label="Back to the cosmos"
              title="Back to the cosmos"
            >
              <CloseIcon />
            </button>
          </div>
          <DomainProjects domain={selectedDomain} />
        </aside>
      ) : null}

      {started && mode === "intro" ? (
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.controlIcon}
            onClick={togglePlayback}
            aria-label={playing ? "Pause" : "Resume"}
            title={playing ? "Pause" : "Resume"}
          >
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button
            type="button"
            className={styles.controlIcon}
            onClick={skip}
            aria-label="Skip to the present"
            title="Skip to the present"
          >
            <SkipIcon />
          </button>
        </div>
      ) : null}

      {started && explore && selectedDomain === null ? (
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.controlIcon}
            onClick={replay}
            aria-label="Replay the beginning"
            title="Replay the beginning"
          >
            <ReplayIcon />
          </button>
        </div>
      ) : null}
    </main>
  );
}
