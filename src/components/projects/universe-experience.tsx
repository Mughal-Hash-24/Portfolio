"use client";

import { Canvas } from "@react-three/fiber";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useAudio } from "@/components/audio/audio-provider";
import {
  explorationPhase,
  projectDomains,
  universeDuration,
  universePhases,
  universeStats,
} from "@/content/projects-universe";
import { resolveProjectSystems } from "@/content/project-systems";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { buildUniverse } from "./universe-build";
import { UniverseScene } from "./universe-scene";
import { ProjectSystemScene } from "./universe-systems";
import { WarpTransit } from "./universe-warp";
import { UniverseAudioDock } from "./universe-audio-dock";
import { useUniverseScore } from "./use-universe-score";
import type { Quality, TimelineState, UniverseMode, UniverseStage } from "./universe-types";
import styles from "./universe.module.css";

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
  const [stage, setStage] = useState<UniverseStage>("map");
  const [transit, setTransit] = useState(false);
  const [focusedProject, setFocusedProject] = useState<string | null>(null);
  const [focusedPlanet, setFocusedPlanet] = useState<number | null>(null);
  const [hoveredSystem, setHoveredSystem] = useState<string | null>(null);
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
  const audio = useAudio();

  const phase = universePhases[phaseIndex];
  const selectedDomain = selected === null ? null : projectDomains[selected];
  const explore = mode === "explore";
  const inSystem = stage === "system";
  const systems = useMemo(
    () => (selectedDomain ? resolveProjectSystems(selectedDomain) : []),
    [selectedDomain],
  );
  const focusedSystem =
    focusedProject === null
      ? null
      : (systems.find((system) => system.projectId === focusedProject) ?? null);
  const focusedPlanetInfo =
    focusedSystem && focusedPlanet !== null ? (focusedSystem.planets[focusedPlanet] ?? null) : null;

  const enterSystem = useCallback((index: number) => {
    setSelected(index);
    setHovered(null);
    setHoveredSystem(null);
    setFocusedProject(null);
    setFocusedPlanet(null);
    setStage("system");
    setTransit(true);
  }, []);

  const exitSystem = useCallback(() => {
    setStage("map");
    setSelected(null);
    setFocusedProject(null);
    setFocusedPlanet(null);
    setHoveredSystem(null);
    setTransit(false);
  }, []);

  const focusProject = useCallback((projectId: string) => {
    setFocusedProject(projectId);
    setFocusedPlanet(null);
  }, []);

  const selectPlanet = useCallback((projectId: string, planetIndex: number) => {
    setFocusedProject(projectId);
    setFocusedPlanet(planetIndex);
  }, []);

  const resetSystem = useCallback(() => {
    setStage("map");
    setFocusedProject(null);
    setFocusedPlanet(null);
    setTransit(false);
  }, []);

  const begin = useCallback(() => {
    if (audio.isPlaying) audio.toggle();

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
    resetSystem();

    if (!reducedMotion) {
      syncScore(0);
    }
  }, [audio, reducedMotion, syncScore, resetSystem]);

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
    resetSystem();
    stopScore(600);
  }, [resetSystem, stopScore]);

  const replay = useCallback(() => {
    if (audio.isPlaying) audio.toggle();

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
    resetSystem();
    syncScore(0);
  }, [audio, resetSystem, syncScore]);

  const yieldScore = useCallback(() => {
    if (scoreStatus === "playing") {
      stopScore(250);
    }
  }, [scoreStatus, stopScore]);

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
    stopScore(1800);
  }, [stopScore]);

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
        if (stage === "system") {
          if (focusedPlanet !== null) {
            setFocusedPlanet(null);
          } else if (focusedProject !== null) {
            setFocusedProject(null);
          } else {
            exitSystem();
          }
        } else {
          setSelected(null);
          setHovered(null);
        }
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
  }, [started, mode, togglePlayback, stage, focusedProject, focusedPlanet, exitSystem]);

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
          onPointerMissed={() => {
            if (stage === "system") {
              setFocusedPlanet(null);
              setFocusedProject(null);
            }
          }}
        >
          {stage === "map" ? (
            <UniverseScene
              data={data}
              timeline={timeline}
              mode={mode}
              selected={selected}
              hovered={hovered}
              onHover={setHovered}
              onSelect={enterSystem}
              onPhase={setPhaseIndex}
              onComplete={complete}
              quality={quality}
              reducedMotion={reducedMotion}
            />
          ) : (
            <ProjectSystemScene
              systems={systems}
              focusedProject={focusedProject}
              focusedPlanet={focusedPlanet}
              hoveredProject={hoveredSystem}
              revealed={!transit}
              onHoverProject={setHoveredSystem}
              onSelectProject={focusProject}
              onSelectPlanet={selectPlanet}
              quality={quality}
              reducedMotion={reducedMotion}
            />
          )}
        </Canvas>
      </div>

      {transit && selectedDomain ? (
        <WarpTransit
          destination={selectedDomain.inspiration}
          reducedMotion={reducedMotion}
          onDone={() => setTransit(false)}
        />
      ) : null}

      <div className={styles.scrim} aria-hidden="true" />

      <div className={styles.srOnly} role="status" aria-live="polite">
        {inSystem && selectedDomain
          ? focusedPlanetInfo
            ? `${focusedPlanetInfo.tech}, modeled on ${focusedPlanetInfo.inspiration}. ${focusedPlanetInfo.note}`
            : focusedSystem
              ? `${focusedSystem.projectName} star system, modeled on ${focusedSystem.inspiration}. ${focusedSystem.planets.length} planets.`
              : `${selectedDomain.name}. ${systems.length} project star systems.`
          : explore
            ? `Present day. ${universeStats.domains} domains.`
            : `${phase.title}. ${phase.era}. ${phase.copy}`}
      </div>

      <header className={styles.topbar}>
        <div className={styles.topbarCluster}>
          <Link
            href="/"
            prefetch={false}
            className={styles.iconButton}
            aria-label="Back to title screen"
            title="Back to title screen"
          >
            <ArrowLeftIcon />
          </Link>

          {started && inSystem && !transit ? (
            <button
              type="button"
              className={styles.mapButton}
              onClick={exitSystem}
              aria-label="Back to the galaxy map"
              title="Back to the galaxy map"
            >
              Galaxy map
            </button>
          ) : null}
        </div>

        {started && scoreAvailable && mode === "intro" ? (
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

      {started && explore && stage === "map" && selected === null ? (
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
                  onClick={() => enterSystem(index)}
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

      {started && inSystem && !transit && selectedDomain ? (
        <>
          <section className={styles.systemHead}>
            <p className={styles.systemKicker}>Star field</p>
            <h2 className={styles.systemName}>{selectedDomain.name}</h2>
            <p className={styles.systemNote}>
              Modeled on {selectedDomain.inspiration} · {systems.length} systems · Drag to orbit
            </p>
          </section>

          {focusedSystem === null ? (
            <nav className={styles.domainIndex} aria-label="Project star systems">
              <div className={styles.panelHeader}>
                <span>Systems</span>
                <span>{systems.length}</span>
              </div>
              <ul className={styles.domainList}>
                {systems.map((system) => (
                  <li key={system.projectId}>
                    <button
                      type="button"
                      className={styles.domainButton}
                      onClick={() => focusProject(system.projectId)}
                      style={
                        {
                          "--domain-color": system.starColor,
                        } as CSSProperties
                      }
                    >
                      <span className={styles.domainDot} aria-hidden="true" />
                      <span>{system.projectName}</span>
                      <span className={styles.domainCount}>{system.planets.length}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}

          {focusedSystem !== null && focusedPlanetInfo === null ? (
            <aside
              className={styles.projectPanel}
              aria-label={`${focusedSystem.projectName} star system`}
            >
              <div className={styles.panelHeader}>
                <span>Star system</span>
                <button
                  type="button"
                  className={styles.panelClose}
                  onClick={() => setFocusedProject(null)}
                  aria-label="Back to the star field"
                  title="Back to the star field"
                >
                  <CloseIcon />
                </button>
              </div>
              <h3 className={styles.projectName}>{focusedSystem.projectName}</h3>
              <p className={styles.panelInspiration}>Modeled on {focusedSystem.inspiration}</p>
              <p className={styles.systemInspirationNote}>{focusedSystem.inspirationNote}</p>
              <p className={styles.projectTagline}>{focusedSystem.tagline}</p>
              <ul className={styles.stack} aria-label={`${focusedSystem.projectName} stack`}>
                {focusedSystem.planets.map((planet, index) => (
                  <li key={planet.tech}>
                    <button
                      type="button"
                      className={styles.chipButton}
                      onClick={() => setFocusedPlanet(index)}
                      style={
                        {
                          "--planet-color": planet.color,
                        } as CSSProperties
                      }
                    >
                      <span className={styles.chipDot} aria-hidden="true" />
                      {planet.tech}
                    </button>
                  </li>
                ))}
              </ul>
              {focusedSystem.href ? (
                <a
                  className={styles.projectLink}
                  href={focusedSystem.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open repository ↗
                </a>
              ) : (
                <span className={styles.projectPrivate}>Private project</span>
              )}
            </aside>
          ) : null}

          {focusedSystem !== null && focusedPlanetInfo !== null ? (
            <aside
              className={styles.projectPanel}
              aria-label={`${focusedPlanetInfo.tech} planet dossier`}
            >
              <div className={styles.panelHeader}>
                <span>Planet dossier</span>
                <button
                  type="button"
                  className={styles.panelClose}
                  onClick={() => setFocusedPlanet(null)}
                  aria-label="Back to the star system"
                  title="Back to the star system"
                >
                  <CloseIcon />
                </button>
              </div>
              <h3 className={styles.projectName}>{focusedPlanetInfo.tech}</h3>
              <p className={styles.panelInspiration}>Modeled on {focusedPlanetInfo.inspiration}</p>
              <p className={styles.systemInspirationNote}>{focusedPlanetInfo.inspirationNote}</p>
              <p className={styles.planetNote}>{focusedPlanetInfo.note}</p>
              <p className={styles.projectTagline}>
                Orbit {focusedPlanet === null ? 1 : focusedPlanet + 1} of{" "}
                {focusedSystem.planets.length} · {focusedSystem.projectName}
              </p>
            </aside>
          ) : null}
        </>
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

      {started ? <UniverseAudioDock onPrime={yieldScore} /> : null}
    </main>
  );
}
