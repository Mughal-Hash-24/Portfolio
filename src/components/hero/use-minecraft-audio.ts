"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  backgroundTracks,
  clickSound,
  defaultBackgroundTrack,
  discTracks,
  type MusicTrack,
} from "@/content/music";

const BACKGROUND_VOLUME = 0.3;
const DISC_VOLUME = 0.5;
const CLICK_VOLUME = 0.35;

const autoPlayTracks = [...backgroundTracks, ...discTracks];

function pickTrack(excludeId?: string) {
  if (autoPlayTracks.length === 0) return null;
  if (autoPlayTracks.length === 1) return autoPlayTracks[0];

  let track = autoPlayTracks[Math.floor(Math.random() * autoPlayTracks.length)];
  while (track.id === excludeId) {
    track = autoPlayTracks[Math.floor(Math.random() * autoPlayTracks.length)];
  }
  return track;
}

export function useMinecraftAudio() {
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const clickRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(defaultBackgroundTrack);
  const [isPlaying, setIsPlaying] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  const playTrack = useCallback((track: MusicTrack) => {
    const audio = musicRef.current;
    if (!audio) return;

    audio.src = track.src;
    audio.volume = track.kind === "disc" ? DISC_VOLUME : BACKGROUND_VOLUME;
    audio.currentTime = 0;
    setCurrentTrack(track);
    void audio
      .play()
      .then(() => setAutoplayBlocked(false))
      .catch((error: unknown) => {
        setIsPlaying(false);

        if (error instanceof DOMException && error.name === "NotAllowedError") {
          setAutoplayBlocked(true);
        }
      });
  }, []);

  const startBackground = useCallback(() => {
    if (!enabled || isPlaying) return;

    const track = currentTrack?.kind === "background" ? currentTrack : pickTrack(currentTrack?.id);
    if (track) playTrack(track);
  }, [currentTrack, enabled, isPlaying, playTrack]);

  const next = useCallback(() => {
    if (!enabled) setEnabled(true);

    const track = pickTrack(currentTrack?.id);
    if (track) playTrack(track);
  }, [currentTrack, enabled, playTrack]);

  const toggle = useCallback(() => {
    if (enabled) {
      setEnabled(false);
      musicRef.current?.pause();
      return;
    }

    setEnabled(true);
    const track = currentTrack ?? defaultBackgroundTrack ?? pickTrack();
    if (track) playTrack(track);
  }, [currentTrack, enabled, playTrack]);

  const playDisc = useCallback(
    (track: MusicTrack) => {
      setEnabled(true);
      playTrack(track);
    },
    [playTrack],
  );

  const playClick = useCallback(() => {
    if (!enabled || !clickSound) return;

    const click = clickRef.current;
    if (!click) return;

    click.currentTime = 0;
    click.volume = CLICK_VOLUME;
    void click.play().catch(() => {});
  }, [enabled]);

  const handleEnded = useCallback(() => {
    if (!enabled) return;

    const track = pickTrack(currentTrack?.id);
    if (track) playTrack(track);
  }, [currentTrack, enabled, playTrack]);

  const handlePlay = useCallback(() => setIsPlaying(true), []);
  const handlePause = useCallback(() => setIsPlaying(false), []);

  useEffect(() => {
    const music = new Audio();
    music.preload = "metadata";
    musicRef.current = music;

    const click = clickSound ? new Audio(clickSound) : null;
    if (click) {
      click.preload = "auto";
      clickRef.current = click;
    }

    return () => {
      music.pause();
      music.src = "";
      musicRef.current = null;

      if (click) {
        click.pause();
        click.src = "";
        clickRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const music = musicRef.current;
    if (!music) return;

    music.onended = handleEnded;
    music.onplay = handlePlay;
    music.onpause = handlePause;

    return () => {
      music.onended = null;
      music.onplay = null;
      music.onpause = null;
    };
  }, [handleEnded, handlePlay, handlePause]);

  return {
    currentTrack,
    isPlaying,
    enabled,
    autoplayBlocked,
    toggle,
    next,
    startBackground,
    playDisc,
    playClick,
  };
}

export type MinecraftAudio = ReturnType<typeof useMinecraftAudio>;
