"use client";

import { useRef, useState, type FocusEvent, type MouseEvent } from "react";
import { useAudio } from "@/components/audio/audio-provider";
import { discTracks } from "@/content/music";
import {
  DiscIcon,
  NextTrackIcon,
  PlayIcon,
  SpeakerIcon,
  SpeakerOffIcon,
} from "@/components/hero/music-icons";
import { LegoStuds, brickStyle } from "./lego-brick";

export function LegoAudioDock() {
  const audio = useAudio();
  const [open, setOpen] = useState(false);
  const dockRef = useRef<HTMLDivElement>(null);
  const discDialogRef = useRef<HTMLDialogElement>(null);
  const pointerOpenedRef = useRef(false);

  const isAudible = audio.enabled && audio.isPlaying;
  const currentLabel = audio.currentTrack?.title ?? "Brick soundtrack";
  const currentDiscId = audio.currentTrack?.kind === "disc" ? audio.currentTrack.id : null;
  const stateLabel = isAudible
    ? "Now playing"
    : audio.enabled
      ? audio.autoplayBlocked
        ? "Tap to play"
        : "Up next"
      : "Music off";

  const playLabel = isAudible ? "Mute music" : audio.enabled ? "Play music" : "Enable music";

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

  function openDiscs() {
    audio.playClick();
    setOpen(true);
    discDialogRef.current?.showModal();
  }

  function closeDiscs() {
    audio.playClick();
    discDialogRef.current?.close();
  }

  return (
    <div
      ref={dockRef}
      className="lego-audio"
      data-open={open}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onFocus={() => setOpen(true)}
      onBlur={handleBlur}
    >
      <button
        type="button"
        className="lego-brick lego-audio__trigger"
        style={brickStyle("yellow")}
        onClick={handleTriggerClick}
        aria-expanded={open}
        aria-controls="lego-audio-panel"
        aria-label={open ? "Close soundtrack controls" : "Open soundtrack controls"}
      >
        <LegoStuds count={2} />
        <span className="lego-audio__icon" aria-hidden>
          {isAudible ? (
            <SpeakerIcon className="h-4 w-4" />
          ) : audio.enabled ? (
            <PlayIcon className="h-4 w-4" />
          ) : (
            <SpeakerOffIcon className="h-4 w-4" />
          )}
        </span>
        <span className="lego-audio__trigger-label">Music</span>
      </button>

      <div
        id="lego-audio-panel"
        className="lego-audio__panel"
        role="region"
        aria-label="Brick soundtrack"
        aria-hidden={!open}
      >
        <div className="lego-audio__head">
          <span className="lego-kicker">Brick soundtrack</span>
          <span className="lego-audio__state">{stateLabel}</span>
        </div>
        <p className="lego-audio__track" aria-live="polite">
          {currentLabel}
        </p>
        <div className="lego-audio__controls">
          <button
            type="button"
            className="lego-brick lego-audio__button"
            style={brickStyle("yellow")}
            onClick={togglePlayback}
            aria-label={playLabel}
            title={playLabel}
          >
            <LegoStuds count={1} />
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
            className="lego-brick lego-audio__button"
            style={brickStyle("blue")}
            onClick={() => {
              audio.playClick();
              audio.next();
            }}
            aria-label="Next track"
            title="Next track"
          >
            <LegoStuds count={1} />
            <NextTrackIcon className="h-3.5 w-3.5" />
            <span>Next</span>
          </button>
          {discTracks.length > 0 ? (
            <button
              type="button"
              className="lego-brick lego-audio__button"
              style={brickStyle("green")}
              onClick={openDiscs}
              aria-label="Choose a disc"
              aria-haspopup="dialog"
              title="Choose a disc"
            >
              <LegoStuds count={1} />
              <DiscIcon className="h-3.5 w-3.5" />
              <span>Discs</span>
            </button>
          ) : null}
        </div>
      </div>

      <dialog ref={discDialogRef} className="lego-discs" aria-labelledby="lego-discs-title">
        <div className="lego-discs__panel">
          <header className="lego-discs__head">
            <DiscIcon className="lego-discs__head-icon" />
            <div>
              <h2 id="lego-discs-title" className="lego-discs__title">
                Brick jukebox
              </h2>
              <p className="lego-discs__state" aria-live="polite">
                {audio.enabled && audio.currentTrack
                  ? `${isAudible ? "Now playing" : "Up next"}: ${currentLabel}`
                  : "Choose a disc"}
              </p>
            </div>
            <button
              type="button"
              className="lego-brick lego-discs__close"
              style={brickStyle("red")}
              onClick={closeDiscs}
              aria-label="Close jukebox"
            >
              <LegoStuds count={2} />
              <span>Close</span>
            </button>
          </header>

          <div className="lego-discs__grid">
            {discTracks.map((track) => (
              <button
                key={track.id}
                type="button"
                className="lego-brick lego-discs__disc"
                data-active={currentDiscId === track.id}
                aria-pressed={currentDiscId === track.id}
                onClick={() => {
                  audio.playClick();
                  audio.playDisc(track);
                  discDialogRef.current?.close();
                }}
              >
                <LegoStuds count={1} />
                <DiscIcon className="lego-discs__disc-icon" />
                <span>{track.title}</span>
              </button>
            ))}
          </div>

          <p className="lego-discs__note">Playback continues when the disc ends.</p>
        </div>
      </dialog>
    </div>
  );
}
