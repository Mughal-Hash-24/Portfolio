"use client";

import { useRef } from "react";
import { backgroundTracks, discTracks } from "@/content/music";
import { DiscIcon, NextTrackIcon, PlayIcon, SpeakerIcon, SpeakerOffIcon } from "./music-icons";
import type { MinecraftAudio } from "./use-minecraft-audio";

type MusicDockProps = {
  audio: MinecraftAudio;
};

export function MusicDock({ audio }: MusicDockProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  if (backgroundTracks.length === 0 && discTracks.length === 0) return null;

  const isAudible = audio.enabled && audio.isPlaying;
  const currentLabel = audio.currentTrack?.title ?? "Music";
  const currentDiscId = audio.currentTrack?.kind === "disc" ? audio.currentTrack.id : null;
  const stateLabel = isAudible ? "Now playing" : audio.enabled ? "Up next" : "Audio off";

  const togglePlayback = () => {
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
  };

  const openJukebox = () => {
    audio.playClick();
    dialogRef.current?.showModal();
  };

  const closeJukebox = () => {
    audio.playClick();
    dialogRef.current?.close();
  };

  return (
    <>
      <div className="pointer-events-auto flex max-w-full items-center gap-2 border border-white/15 bg-black/55 p-1.5 shadow-[0_0_0_1px_rgb(0_0_0/0.4)] backdrop-blur-sm">
        <button
          type="button"
          className="mc-icon-button"
          aria-label={isAudible ? "Mute music" : "Play music"}
          title={isAudible ? "Mute music" : "Play music"}
          onClick={togglePlayback}
        >
          {isAudible ? (
            <SpeakerIcon className="h-4 w-4" />
          ) : audio.enabled ? (
            <PlayIcon className="h-4 w-4" />
          ) : (
            <SpeakerOffIcon className="h-4 w-4" />
          )}
        </button>

        <div className="min-w-0">
          <p className="hidden font-mono text-[8px] leading-none tracking-[0.24em] text-white/45 uppercase sm:block">
            {stateLabel}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className="jukebox-bars" data-active={isAudible} aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span
              aria-live="polite"
              className="max-w-[10rem] truncate font-minecraft text-[10px] leading-none text-white/85 normal-case sm:max-w-[12rem] sm:text-xs"
            >
              {currentLabel}
            </span>
          </div>
        </div>

        <div className="ml-1 flex items-center gap-1">
          <button
            type="button"
            className="mc-icon-button"
            aria-label="Next track"
            title="Next track"
            onClick={() => {
              audio.playClick();
              audio.next();
            }}
          >
            <NextTrackIcon className="h-4 w-4" />
          </button>

          {discTracks.length > 0 ? (
            <button
              type="button"
              className="mc-icon-button"
              aria-label="Open jukebox"
              aria-haspopup="dialog"
              title="Jukebox"
              onClick={openJukebox}
            >
              <DiscIcon className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      <dialog ref={dialogRef} className="mc-dialog" aria-labelledby="jukebox-title">
        <div className="mc-dialog__panel">
          <div className="sticky top-0 z-10 flex items-start justify-between gap-4 bg-[#1a1a1e] pb-3">
            <div className="flex items-center gap-2.5">
              <DiscIcon className="h-7 w-7 shrink-0 text-accent" />
              <div>
                <h2
                  id="jukebox-title"
                  className="font-minecraft text-lg tracking-[0.08em] text-white uppercase"
                >
                  Jukebox
                </h2>
                <p
                  aria-live="polite"
                  className="mt-0.5 font-mono text-[9px] tracking-[0.14em] text-white/50 uppercase"
                >
                  {audio.enabled && audio.currentTrack
                    ? `${isAudible ? "Now playing" : "Up next"}: ${currentLabel}`
                    : "Choose a disc"}
                </p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Close jukebox"
              className="mc-icon-button shrink-0"
              onClick={closeJukebox}
            >
              X
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {discTracks.map((track) => (
              <button
                key={track.id}
                type="button"
                className="mc-button mc-disc-button gap-2"
                data-active={currentDiscId === track.id}
                aria-pressed={currentDiscId === track.id}
                onClick={() => {
                  audio.playClick();
                  audio.playDisc(track);
                  dialogRef.current?.close();
                }}
              >
                <DiscIcon className="h-4 w-4 shrink-0" />
                <span>{track.title}</span>
              </button>
            ))}
          </div>

          <p className="font-mono text-[9px] leading-4 tracking-[0.14em] text-white/45 uppercase">
            Playback continues when the disc ends.
          </p>
        </div>
      </dialog>
    </>
  );
}
