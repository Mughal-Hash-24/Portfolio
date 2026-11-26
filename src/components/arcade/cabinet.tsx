"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ArcadeGame } from "@/content/arcade";
import styles from "./cabinet.module.css";
import { CassetteDeck } from "./cassette-deck";
import { CRT } from "./crt";

type CabinetProps = {
  games: ArcadeGame[];
  caption?: string;
};

type Phase = "boot" | "attract" | "booting" | "playing";

/**
 * The arcade machine.
 *
 * A cabinet is always in one of four states: it is booting itself, idling in
 * attract mode, loading a cassette, or running one. The screen and the control
 * deck both read from that single state so they can never disagree.
 */
export function Cabinet({ games, caption }: CabinetProps) {
  const [phase, setPhase] = useState<Phase>("boot");
  const [selected, setSelected] = useState<ArcadeGame | null>(null);
  const [deckOpen, setDeckOpen] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);

  // The machine only boots once per mount; afterwards it returns to attract.
  const finishBoot = useCallback(() => setPhase("attract"), []);

  const loadCassette = useCallback((game: ArcadeGame) => {
    setSelected(game);
    setDeckOpen(false);
    setPhase("booting");
  }, []);

  const eject = useCallback(() => {
    setPhase("attract");
    setSelected(null);
  }, []);

  useEffect(() => {
    if (phase !== "playing" && phase !== "booting") return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") eject();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, eject]);

  const status = useMemo(() => {
    if (phase === "boot") return "Powering on";
    if (phase === "booting") return `Loading ${selected?.title ?? "cassette"}`;
    if (phase === "playing") return `${selected?.title ?? "Running"} · Esc to eject`;
    return `${games.length} cassettes ready`;
  }, [phase, selected, games.length]);

  const ledState = phase === "playing" ? "on" : phase === "attract" ? "off" : "busy";
  const tagline = caption ?? `${games.length} cassettes ready`;
  const running = phase === "playing" || phase === "booting";

  return (
    <div className={styles.stage}>
      <div className={styles.machine}>
        <div className={styles.marquee}>
          <span className={styles.marqueeTitle}>Ibtasaam Arcade</span>
          <span className={styles.marqueeMeta}>Model II · WebAssembly</span>
        </div>

        <CRT
          phase={phase}
          selected={selected}
          onBooted={finishBoot}
          onFrameLoad={() => setPhase("playing")}
          frameRef={frameRef}
        />

        <div className={styles.deck}>
          <div className={styles.deckLeft}>
            <span className={styles.led} data-state={ledState} aria-hidden="true" />
            <span className={styles.deckStatus}>{status}</span>
          </div>

          <div className={styles.deckActions}>
            {running ? (
              <button type="button" className={styles.key} onClick={eject}>
                Eject
              </button>
            ) : (
              <button
                type="button"
                className={styles.key}
                data-primary="true"
                onClick={() => setDeckOpen(true)}
                disabled={phase === "boot"}
              >
                Choose cassette
              </button>
            )}
          </div>
        </div>
      </div>

      {tagline ? <p className={styles.caption}>{tagline}</p> : null}

      <CassetteDeck
        open={deckOpen}
        games={games}
        activeSlug={selected?.slug ?? null}
        onClose={() => setDeckOpen(false)}
        onSelect={loadCassette}
      />
    </div>
  );
}
