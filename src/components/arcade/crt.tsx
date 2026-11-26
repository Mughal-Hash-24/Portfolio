"use client";

import type { CSSProperties, RefObject } from "react";
import { useEffect, useState } from "react";
import type { ArcadeGame } from "@/content/arcade";
import styles from "./cabinet.module.css";

type Phase = "boot" | "attract" | "booting" | "playing";

type CRTProps = {
  phase: Phase;
  selected: ArcadeGame | null;
  onBooted: () => void;
  onFrameLoad: () => void;
  frameRef: RefObject<HTMLIFrameElement | null>;
};

function ratioValue(aspect: string): string {
  const [w, h] = aspect.split("/").map((part) => Number(part.trim()));
  return w && h ? String(w / h) : "1.6";
}

const BOOT_LINES = [
  "ibtasaam arcade · system ii",
  "video  ......... webgl 2",
  "cpu    ......... wasm32",
  "memory ......... 64 mb",
];

/**
 * The glass. Handles the curve, scanlines and noise, and swaps its contents
 * between the boot log, attract mode, and the running game.
 *
 * The boot log advances on timers so the machine feels like hardware powering
 * up. `prefers-reduced-motion` collapses it to a single settled state.
 */
export function CRT({ phase, selected, onBooted, onFrameLoad, frameRef }: CRTProps) {
  const [bootStep, setBootStep] = useState(0);

  useEffect(() => {
    if (phase !== "boot") return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      onBooted();
      return;
    }

    const timers = BOOT_LINES.map((_, index) =>
      window.setTimeout(() => setBootStep(index + 1), 420 + index * 360),
    );
    const done = window.setTimeout(onBooted, 420 + BOOT_LINES.length * 360 + 700);

    return () => {
      timers.forEach(window.clearTimeout);
      window.clearTimeout(done);
    };
  }, [phase, onBooted]);

  return (
    <div
      className={styles.screen}
      style={
        selected && (phase === "booting" || phase === "playing")
          ? ({
              "--game-aspect": selected.aspect,
              "--game-flex": "0 0 auto",
              "--game-ratio": ratioValue(selected.aspect),
            } as CSSProperties)
          : undefined
      }
    >
      <div className={styles.curved}>
        <div className={styles.vignette} aria-hidden="true" />

        {phase === "boot" ? (
          <div className={styles.boot} role="status" aria-live="polite">
            {BOOT_LINES.slice(0, bootStep).map((line) => (
              <p key={line} className={styles.bootLine}>
                {line}
              </p>
            ))}
            <p className={styles.bootLine} data-tone="dim">
              reading cassette deck
              <span className={styles.bootCursor} aria-hidden="true" />
            </p>
            <div className={styles.bootBar}>
              <span className={styles.bootBarFill} />
            </div>
          </div>
        ) : null}

        {phase === "attract" ? (
          <div className={styles.attract}>
            <p className={styles.attractTitle}>Insert Cassette</p>
            <p className={styles.attractCopy}>
              Fifteen cabinets, each one a real build of the original source — pygame through
              pygbag, C++ and SFML through Emscripten.
            </p>
            <p className={styles.attractHint}>Press choose cassette to begin</p>
          </div>
        ) : null}

        {phase === "booting" ? (
          <div className={styles.booting} role="status" aria-live="polite">
            <p className={styles.bootingLabel}>{selected?.title ?? "Cassette"}</p>
            <p className={styles.bootingHint}>Spinning up · first load takes a moment</p>
          </div>
        ) : null}

        {selected && (phase === "booting" || phase === "playing") ? (
          <iframe
            ref={frameRef}
            key={selected.slug}
            src={`/arcade/${selected.slug}/index.html`}
            title={selected.title}
            className={styles.gameFrame}
            onLoad={onFrameLoad}
            allow="autoplay; fullscreen; gamepad"
          />
        ) : null}

        <div className={styles.scanlines} aria-hidden="true" />
        <div className={styles.refresh} aria-hidden="true" />
        <div className={styles.noise} aria-hidden="true" />
      </div>
    </div>
  );
}
