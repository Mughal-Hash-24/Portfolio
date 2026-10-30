"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { scorePhaseStart, scoreStartOffset } from "@/content/projects-universe";

export type ScoreStatus = "idle" | "ready" | "playing" | "paused" | "blocked" | "unavailable";

const scoreSource =
  process.env.NEXT_PUBLIC_UNIVERSE_SCORE_URL ||
  (process.env.NODE_ENV === "development" ? "/audio/_dev/universe/no_time_for_caution.mp3" : "");

const targetVolume = 0.52;

function desiredTime(elapsed: number) {
  if (elapsed < scorePhaseStart) {
    return scoreStartOffset - (scorePhaseStart - elapsed);
  }

  return scoreStartOffset + (elapsed - scorePhaseStart);
}

function isAudible(elapsed: number) {
  return elapsed >= scorePhaseStart;
}

export function useUniverseScore() {
  const audio = useRef<HTMLAudioElement | null>(null);
  const fadeTimer = useRef<number | null>(null);
  const stopTimer = useRef<number | null>(null);
  const failed = useRef(false);
  const mutedRef = useRef(false);
  const mounted = useRef(true);
  const [status, setStatus] = useState<ScoreStatus>(scoreSource ? "idle" : "unavailable");
  const [muted, setMuted] = useState(false);
  const [exists, setExists] = useState<boolean | null>(null);

  useEffect(() => {
    mounted.current = true;

    if (!scoreSource) {
      return () => {
        mounted.current = false;
      };
    }

    const element = new Audio();
    element.preload = "metadata";
    element.volume = 0;
    element.src = scoreSource;

    const handleReady = () => {
      if (!mounted.current || failed.current) return;
      if (!Number.isFinite(element.duration) || element.duration <= 0) return;

      setStatus((current) =>
        current === "unavailable" ? current : current === "idle" ? "ready" : current,
      );
    };
    const handleError = () => {
      if (!mounted.current) return;
      failed.current = true;
      setStatus("unavailable");
    };

    element.addEventListener("canplay", handleReady);
    element.addEventListener("loadedmetadata", handleReady);
    element.addEventListener("error", handleError);
    audio.current = element;

    void fetch(scoreSource, { method: "HEAD", cache: "no-store" })
      .then((response) => {
        if (!mounted.current) return;

        const reachable = response.ok || response.status === 405;
        setExists(reachable);

        if (!reachable) {
          failed.current = true;
          setStatus("unavailable");
        }
      })
      .catch(() => {
        // Playback may still work without a readable HEAD response.
      });

    return () => {
      mounted.current = false;

      if (fadeTimer.current !== null) {
        window.clearInterval(fadeTimer.current);
        fadeTimer.current = null;
      }

      if (stopTimer.current !== null) {
        window.clearTimeout(stopTimer.current);
        stopTimer.current = null;
      }

      element.removeEventListener("canplay", handleReady);
      element.removeEventListener("loadedmetadata", handleReady);
      element.removeEventListener("error", handleError);
      element.pause();
      element.src = "";
      audio.current = null;
    };
  }, []);

  const fadeTo = useCallback((to: number, duration = 900) => {
    const element = audio.current;
    if (!element) return;

    if (fadeTimer.current !== null) {
      window.clearInterval(fadeTimer.current);
      fadeTimer.current = null;
    }

    const from = element.volume;
    const started = performance.now();

    fadeTimer.current = window.setInterval(() => {
      const elementNow = audio.current;
      if (!elementNow) return;

      const t = Math.min(1, (performance.now() - started) / duration);
      elementNow.volume = from + (to - from) * t;

      if (t >= 1) {
        if (fadeTimer.current !== null) {
          window.clearInterval(fadeTimer.current);
          fadeTimer.current = null;
        }
      }
    }, 40);
  }, []);

  const sync = useCallback(
    (elapsed: number) => {
      const element = audio.current;
      if (!element || !scoreSource) return;

      if (failed.current || element.error) {
        failed.current = true;
        setStatus("unavailable");
        return;
      }

      if (!isAudible(elapsed)) {
        if (!element.paused) {
          element.pause();
          setStatus("paused");
        }

        element.volume = 0;
        return;
      }

      if (stopTimer.current !== null) {
        window.clearTimeout(stopTimer.current);
        stopTimer.current = null;
      }

      const start = () => {
        try {
          if (Number.isFinite(element.duration) && element.duration > 0) {
            element.currentTime = Math.min(
              desiredTime(elapsed),
              Math.max(0, element.duration - 0.35),
            );
          }
        } catch {
          element.currentTime = 0;
        }

        element.volume = 0;
        void element
          .play()
          .then(() => {
            if (!mounted.current) return;

            if (
              failed.current ||
              element.error ||
              !Number.isFinite(element.duration) ||
              element.duration <= 0
            ) {
              failed.current = true;
              setStatus("unavailable");
              return;
            }

            setStatus("playing");
            fadeTo(mutedRef.current ? 0 : targetVolume);
          })
          .catch((error: unknown) => {
            if (!mounted.current) return;

            if (error instanceof DOMException && error.name === "NotAllowedError") {
              setStatus("blocked");
            } else {
              failed.current = true;
              setStatus("unavailable");
            }
          });
      };

      if (element.readyState === 0) {
        element.addEventListener("loadedmetadata", start, { once: true });
        return;
      }

      if (element.paused) {
        start();
      } else {
        setStatus("playing");
        fadeTo(mutedRef.current ? 0 : targetVolume, 500);
      }
    },
    [fadeTo],
  );

  const pause = useCallback(() => {
    const element = audio.current;
    if (!element) return;
    element.pause();
    setStatus("paused");
  }, []);

  const stop = useCallback(
    (fadeDuration = 900) => {
      const element = audio.current;
      if (!element) return;
      fadeTo(0, fadeDuration);

      if (stopTimer.current !== null) {
        window.clearTimeout(stopTimer.current);
      }

      stopTimer.current = window.setTimeout(() => {
        stopTimer.current = null;
        if (!mounted.current) return;
        audio.current?.pause();
        setStatus("ready");
      }, fadeDuration);
    },
    [fadeTo],
  );

  const toggleMuted = useCallback(() => {
    const next = !mutedRef.current;
    mutedRef.current = next;
    setMuted(next);

    const element = audio.current;
    if (!element) return;

    if (next) {
      fadeTo(0, 250);
    } else if (!element.paused) {
      fadeTo(targetVolume);
    }
  }, [fadeTo]);

  const retry = useCallback(
    (elapsed: number) => {
      sync(elapsed);
    },
    [sync],
  );

  return {
    status,
    muted,
    available: scoreSource.length > 0 && exists === true && status !== "unavailable",
    sync,
    pause,
    stop,
    toggleMuted,
    retry,
  };
}
