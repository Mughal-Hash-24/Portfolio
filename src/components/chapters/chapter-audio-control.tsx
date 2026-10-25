"use client";

import { useAudio } from "@/components/audio/audio-provider";
import {
  NextTrackIcon,
  PlayIcon,
  SpeakerIcon,
  SpeakerOffIcon,
} from "@/components/hero/music-icons";

export function ChapterAudioControl() {
  const audio = useAudio();
  const isAudible = audio.enabled && audio.isPlaying;
  const currentLabel = audio.currentTrack?.title ?? "Music";
  const stateLabel = isAudible
    ? "Now playing"
    : audio.enabled
      ? audio.autoplayBlocked
        ? "Click to play"
        : "Up next"
      : "Audio off";

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

  return (
    <div className="chapter-audio flex max-w-full items-center gap-2">
      <button
        type="button"
        className="chapter-control"
        aria-label={isAudible ? "Mute music" : audio.enabled ? "Play music" : "Enable music"}
        title={isAudible ? "Mute music" : audio.enabled ? "Play music" : "Enable music"}
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

      <button
        type="button"
        className="chapter-control"
        aria-label="Next track"
        title="Next track"
        onClick={() => {
          audio.playClick();
          audio.next();
        }}
      >
        <NextTrackIcon className="h-4 w-4" />
      </button>

      <div className="min-w-0">
        <p className="chapter-audio-state">{stateLabel}</p>
        <p aria-live="polite" className="chapter-audio-track">
          {currentLabel}
        </p>
      </div>
    </div>
  );
}
