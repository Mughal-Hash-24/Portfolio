"use client";

import { useRef } from "react";
import { backgroundTracks, discTracks } from "@/content/music";
import type { MinecraftAudio } from "./use-minecraft-audio";

type MusicDockProps = {
  audio: MinecraftAudio;
};

export function MusicDock({ audio }: MusicDockProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  if (backgroundTracks.length === 0 && discTracks.length === 0) return null;

  const currentLabel = audio.currentTrack
    ? audio.currentTrack.kind === "disc"
      ? `Disc: ${audio.currentTrack.title}`
      : audio.currentTrack.title
    : "Music";

  const closeDiscs = () => {
    audio.playClick();
    dialogRef.current?.close();
  };

  return (
    <>
      <div className="pointer-events-auto flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="mc-small-button"
          onClick={() => {
            audio.playClick();
            audio.toggle();
          }}
        >
          {audio.enabled ? "Audio on" : "Audio off"}
        </button>

        <span
          aria-live="polite"
          className="hidden max-w-[12rem] truncate font-mono text-[9px] tracking-[0.12em] sm:inline"
        >
          {audio.enabled ? currentLabel : "Muted"}
        </span>

        {backgroundTracks.length + discTracks.length > 0 ? (
          <button
            type="button"
            aria-label="Next track"
            className="mc-icon-button"
            onClick={() => {
              audio.playClick();
              audio.next();
            }}
          >
            {">"}
          </button>
        ) : null}

        {discTracks.length > 0 ? (
          <button
            type="button"
            className="mc-small-button"
            onClick={() => {
              audio.playClick();
              dialogRef.current?.showModal();
            }}
          >
            Discs
          </button>
        ) : null}
      </div>

      <dialog ref={dialogRef} className="mc-dialog" aria-labelledby="jukebox-title">
        <div className="mc-dialog__panel">
          <div className="sticky top-0 z-10 flex items-center justify-between gap-4 bg-[#1a1a1e] pb-3">
            <h2
              id="jukebox-title"
              className="font-minecraft text-lg tracking-[0.08em] text-white uppercase"
            >
              Jukebox
            </h2>
            <button
              type="button"
              aria-label="Close jukebox"
              className="mc-icon-button"
              onClick={closeDiscs}
            >
              X
            </button>
          </div>

          <p className="font-mono text-[10px] tracking-[0.16em] text-white/55 uppercase">
            Pick a disc. Ambient music resumes when it ends.
          </p>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {discTracks.map((track) => (
              <button
                key={track.id}
                type="button"
                className="mc-button mc-disc-button"
                onClick={() => {
                  audio.playClick();
                  audio.playDisc(track);
                  dialogRef.current?.close();
                }}
              >
                {track.title}
              </button>
            ))}
          </div>
        </div>
      </dialog>
    </>
  );
}
