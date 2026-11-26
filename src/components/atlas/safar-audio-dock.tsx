"use client";

import { useAudio } from "@/components/audio/audio-provider";
import {
  DiscIcon,
  NextTrackIcon,
  PlayIcon,
  SpeakerIcon,
  SpeakerOffIcon,
} from "@/components/hero/music-icons";
import { backgroundTracks, discTracks, type MusicTrack } from "@/content/music";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./safar-audio.module.css";

type SafarAudioDockProps = {
  sfxEnabled: boolean;
  onToggleSfx: () => void;
};

type LibraryTab = "records" | "soundtrack";

export function SafarAudioDock({ sfxEnabled, onToggleSfx }: SafarAudioDockProps) {
  const audio = useAudio();
  const [open, setOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [tab, setTab] = useState<LibraryTab>("records");
  const [query, setQuery] = useState("");
  const dockRef = useRef<HTMLDivElement>(null);
  const libraryRef = useRef<HTMLDialogElement>(null);

  const isAudible = audio.enabled && audio.isPlaying;
  const currentLabel = audio.currentTrack?.title ?? "No track selected";
  const currentKind = audio.currentTrack?.kind === "disc" ? "Music disc" : "Soundtrack";
  const playLabel = isAudible ? "Mute music" : audio.enabled ? "Play music" : "Enable music";

  const visibleTracks = useMemo(() => {
    const pool = tab === "records" ? discTracks : backgroundTracks;
    const needle = query.trim().toLowerCase();

    return needle ? pool.filter((track) => track.title.toLowerCase().includes(needle)) : pool;
  }, [query, tab]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (dockRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  function togglePlayback() {
    audio.playClick();

    if (!audio.enabled) {
      audio.toggle();
      return;
    }

    if (audio.isPlaying) {
      audio.toggle();
      return;
    }

    audio.startBackground();
  }

  function openLibrary() {
    audio.playClick();
    setTab("records");
    setQuery("");
    setLibraryOpen(true);
    libraryRef.current?.showModal();
  }

  function closeLibrary() {
    audio.playClick();
    libraryRef.current?.close();
  }

  function chooseTrack(track: MusicTrack) {
    audio.playClick();
    audio.playDisc(track);
    libraryRef.current?.close();
  }

  return (
    <div ref={dockRef} className={styles.wrap}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => {
          audio.playClick();
          setOpen((value) => !value);
        }}
        aria-label={open ? "Close sound controls" : "Open sound controls"}
        aria-expanded={open}
        aria-controls="safar-sound-panel"
        data-playing={isAudible}
      >
        <span className={styles.equalizer} aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span className={styles.triggerText}>{audio.enabled ? "Sound" : "Muted"}</span>
      </button>

      <div
        id="safar-sound-panel"
        className={styles.panel}
        role="region"
        aria-label="Sound controls"
        hidden={!open}
      >
        <div className={styles.panelHead}>
          <div>
            <p className={styles.kicker}>{currentKind}</p>
            <p className={styles.track} aria-live="polite">
              {currentLabel}
            </p>
          </div>
          <span className={styles.state}>{isAudible ? "Playing" : "Paused"}</span>
        </div>

        <div className={styles.controls}>
          <button
            type="button"
            className={styles.control}
            onClick={togglePlayback}
            aria-label={playLabel}
            title={playLabel}
          >
            {isAudible ? (
              <SpeakerIcon className="h-3.5 w-3.5" />
            ) : audio.enabled ? (
              <PlayIcon className="h-3.5 w-3.5" />
            ) : (
              <SpeakerOffIcon className="h-3.5 w-3.5" />
            )}
            <span>{isAudible ? "Mute" : "Play"}</span>
          </button>
          <button
            type="button"
            className={styles.control}
            onClick={() => {
              audio.playClick();
              audio.next();
            }}
            aria-label="Next track"
            title="Next track"
          >
            <NextTrackIcon className="h-3.5 w-3.5" />
            <span>Next</span>
          </button>
          <button
            type="button"
            className={styles.control}
            onClick={openLibrary}
            aria-label="Open the record library"
            aria-haspopup="dialog"
            title="Record library"
          >
            <DiscIcon className="h-3.5 w-3.5" />
            <span>Library</span>
          </button>
        </div>

        <div className={styles.fxRow}>
          <div>
            <p className={styles.fxTitle}>Game sound</p>
            <p className={styles.fxHint}>Footsteps, leaves, water, arcade.</p>
          </div>
          <button
            type="button"
            className={styles.fxToggle}
            role="switch"
            aria-checked={sfxEnabled}
            aria-label="Toggle game sound effects"
            onClick={() => {
              audio.playClick();
              onToggleSfx();
            }}
            data-on={sfxEnabled}
          >
            <span />
          </button>
        </div>
      </div>

      <dialog
        ref={libraryRef}
        className={styles.library}
        aria-labelledby="safar-library-title"
        onClose={() => setLibraryOpen(false)}
        onClick={(event) => {
          if (event.target === libraryRef.current) closeLibrary();
        }}
      >
        {libraryOpen ? (
          <div className={styles.libraryPanel}>
            <header className={styles.libraryHead}>
              <div>
                <p className={styles.kicker}>Music library</p>
                <h2 id="safar-library-title" className={styles.libraryTitle}>
                  Records &amp; soundtrack
                </h2>
              </div>
              <button
                type="button"
                className={styles.close}
                onClick={closeLibrary}
                aria-label="Close the music library"
              >
                ✕
              </button>
            </header>

            <div className={styles.libraryTools}>
              <div className={styles.tabs} role="group" aria-label="Music library section">
                <button
                  type="button"
                  className={styles.tab}
                  data-active={tab === "records"}
                  aria-pressed={tab === "records"}
                  onClick={() => {
                    setTab("records");
                    setQuery("");
                  }}
                >
                  Records <span>{discTracks.length}</span>
                </button>
                <button
                  type="button"
                  className={styles.tab}
                  data-active={tab === "soundtrack"}
                  aria-pressed={tab === "soundtrack"}
                  onClick={() => {
                    setTab("soundtrack");
                    setQuery("");
                  }}
                >
                  Soundtrack <span>{backgroundTracks.length}</span>
                </button>
              </div>
              <input
                type="search"
                className={styles.search}
                placeholder="Find a track"
                aria-label="Find a track"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>

            <div className={styles.trackGrid}>
              {visibleTracks.map((track) => (
                <button
                  key={track.id}
                  type="button"
                  className={styles.trackButton}
                  data-active={audio.currentTrack?.id === track.id}
                  onClick={() => chooseTrack(track)}
                >
                  <DiscIcon className="h-4 w-4 shrink-0" />
                  <span>{track.title}</span>
                  {audio.currentTrack?.id === track.id ? (
                    <span className={styles.trackNow}>{isAudible ? "playing" : "ready"}</span>
                  ) : null}
                </button>
              ))}
              {visibleTracks.length === 0 ? (
                <p className={styles.empty}>No tracks match that name.</p>
              ) : null}
            </div>

            <p className={styles.libraryNote}>
              The soundtrack plays on. Choosing a record or track changes what comes next.
            </p>
          </div>
        ) : null}
      </dialog>
    </div>
  );
}
