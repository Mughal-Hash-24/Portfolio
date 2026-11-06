"use client";

import { useAudio } from "@/components/audio/audio-provider";
import {
  DiscIcon,
  NextTrackIcon,
  PlayIcon,
  SpeakerIcon,
  SpeakerOffIcon,
} from "@/components/hero/music-icons";
import { discTracks, type MusicTrack } from "@/content/music";
import { useRef, useState, type FocusEvent, type MouseEvent } from "react";
import styles from "./universe.module.css";

type UniverseAudioDockProps = {
  onPrime?: () => void;
};

export function UniverseAudioDock({ onPrime }: UniverseAudioDockProps) {
  const audio = useAudio();
  const [open, setOpen] = useState(false);
  const dockRef = useRef<HTMLDivElement>(null);
  const archiveRef = useRef<HTMLDialogElement>(null);
  const pointerOpenedRef = useRef(false);

  const isAudible = audio.enabled && audio.isPlaying;
  const currentLabel = audio.currentTrack?.title ?? "Deep space static";
  const currentDiscId = audio.currentTrack?.kind === "disc" ? audio.currentTrack.id : null;
  const stateLabel = isAudible
    ? "Now playing"
    : audio.enabled
      ? audio.autoplayBlocked
        ? "Awaiting carrier"
        : "Standby"
      : "Signal muted";
  const playLabel = isAudible
    ? "Mute soundtrack"
    : audio.enabled
      ? "Play soundtrack"
      : "Enable soundtrack";

  function prime() {
    onPrime?.();
  }

  function togglePlayback() {
    audio.playClick();

    if (!audio.enabled) {
      prime();
      audio.toggle();
      return;
    }

    if (audio.isPlaying) {
      audio.toggle();
      return;
    }

    prime();
    audio.startBackground();
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setOpen(false);
    }
  }

  function handlePointerEnter() {
    pointerOpenedRef.current = true;
    setOpen(true);
  }

  function handlePointerLeave() {
    pointerOpenedRef.current = false;
    if (!dockRef.current?.contains(document.activeElement)) {
      setOpen(false);
    }
  }

  function handleTriggerClick(event: MouseEvent<HTMLButtonElement>) {
    if (event.detail === 0) {
      setOpen(true);
      return;
    }

    if (pointerOpenedRef.current) {
      pointerOpenedRef.current = false;
      setOpen(true);
      return;
    }

    setOpen((value) => !value);
  }

  function openArchive() {
    audio.playClick();
    setOpen(true);
    archiveRef.current?.showModal();
  }

  function closeArchive() {
    audio.playClick();
    archiveRef.current?.close();
  }

  function playTransmission(track: MusicTrack) {
    audio.playClick();
    prime();
    audio.playDisc(track);
    archiveRef.current?.close();
  }

  return (
    <div
      ref={dockRef}
      className={styles.audioDock}
      data-open={open}
      data-audible={isAudible}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onFocus={() => setOpen(true)}
      onBlur={handleBlur}
    >
      <button
        type="button"
        className={styles.audioTrigger}
        onClick={handleTriggerClick}
        aria-expanded={open}
        aria-controls="universe-audio-panel"
        aria-label={open ? "Close signal deck" : "Open signal deck"}
        title="Signal deck"
      >
        <span className={styles.audioDisc} aria-hidden="true" />
      </button>

      <div
        id="universe-audio-panel"
        className={styles.audioPanel}
        role="region"
        aria-label="Soundtrack controls"
        aria-hidden={!open}
      >
        <div className={styles.audioHead}>
          <span className={styles.audioKicker}>Signal deck</span>
          <span className={styles.audioState}>{stateLabel}</span>
        </div>
        <p className={styles.audioTrack} aria-live="polite">
          {currentLabel}
        </p>
        <div className={styles.audioWave} aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className={styles.audioControls}>
          <button
            type="button"
            className={styles.audioControl}
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
            className={styles.audioControl}
            onClick={() => {
              audio.playClick();
              prime();
              audio.next();
            }}
            aria-label="Next track"
            title="Next track"
          >
            <NextTrackIcon className="h-3.5 w-3.5" />
            <span>Next</span>
          </button>
          {discTracks.length > 0 ? (
            <button
              type="button"
              className={styles.audioControl}
              onClick={openArchive}
              aria-label="Open the transmission archive"
              aria-haspopup="dialog"
              title="Transmission archive"
            >
              <DiscIcon className="h-3.5 w-3.5" />
              <span>Archive</span>
            </button>
          ) : null}
        </div>
      </div>

      <dialog
        ref={archiveRef}
        className={styles.audioArchive}
        aria-labelledby="universe-archive-title"
      >
        <div className={styles.audioArchivePanel}>
          <header className={styles.audioArchiveHead}>
            <div>
              <p className={styles.audioKicker}>Transmission archive</p>
              <h2 id="universe-archive-title" className={styles.audioArchiveTitle}>
                Golden record
              </h2>
              <p className={styles.audioArchiveState} aria-live="polite">
                {audio.enabled && audio.currentTrack
                  ? `${isAudible ? "Now playing" : "Up next"}: ${currentLabel}`
                  : "Choose a transmission"}
              </p>
            </div>
            <button
              type="button"
              className={styles.audioArchiveClose}
              onClick={closeArchive}
              aria-label="Close the transmission archive"
              title="Close"
            >
              X
            </button>
          </header>

          <div className={styles.audioArchiveGrid}>
            {discTracks.map((track) => (
              <button
                key={track.id}
                type="button"
                className={styles.audioArchiveDisc}
                data-active={currentDiscId === track.id}
                aria-pressed={currentDiscId === track.id}
                onClick={() => playTransmission(track)}
              >
                <DiscIcon className="h-4 w-4 shrink-0" />
                <span>{track.title}</span>
              </button>
            ))}
          </div>

          <p className={styles.audioArchiveNote}>Playback continues when a transmission ends.</p>
        </div>
      </dialog>
    </div>
  );
}
