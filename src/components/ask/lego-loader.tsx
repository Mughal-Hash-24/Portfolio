"use client";

import { MotionConfig, motion } from "motion/react";
import { useEffect, useState, type CSSProperties } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { LEGO_COLORS, LegoFace, brickStyle, type LegoColor } from "./lego-brick";

const PIXEL_GLYPHS: Record<string, string[]> = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
};

type LegoLoaderProps = {
  variant?: "page" | "inline";
  label?: string;
  className?: string;
};

function PixelWord({
  word,
  color,
  startDelay,
}: {
  word: string;
  color: LegoColor;
  startDelay: number;
}) {
  return (
    <div className="lego-pixel-word" aria-hidden>
      {word.split("").map((letter, letterIndex) => (
        <div className="lego-pixel-letter" key={`${letter}-${letterIndex}`}>
          {PIXEL_GLYPHS[letter]?.flatMap((row, rowIndex) =>
            row.split("").map((pixel, colIndex) =>
              pixel === "1" ? (
                <span
                  key={`${rowIndex}-${colIndex}`}
                  className="lego-pixel"
                  style={
                    {
                      gridRow: rowIndex + 1,
                      gridColumn: colIndex + 1,
                      "--pixel-color": LEGO_COLORS[color],
                      "--pixel-delay": `${
                        startDelay + letterIndex * 0.12 + rowIndex * 0.025 + colIndex * 0.012
                      }s`,
                    } as CSSProperties
                  }
                />
              ) : null,
            ),
          )}
        </div>
      ))}
    </div>
  );
}

export function LegoLoader({ variant = "inline", label, className = "" }: LegoLoaderProps) {
  const reduced = useReducedMotion();

  if (variant === "page") {
    return (
      <MotionConfig reducedMotion="user">
        <div
          className={`lego-baseplate lego-loading-page ${className}`}
          role="status"
          aria-live="polite"
          aria-label={label ?? "Loading Ask My AI"}
        >
          <div className="lego-loading-stage">
            <div className="lego-loading-portrait">
              <motion.div
                className="lego-loading-portrait__face"
                initial={reduced ? false : { scale: 0.78, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  delay: 0.3,
                  type: "spring",
                  stiffness: 200,
                  damping: 18,
                }}
              >
                <LegoFace size={180} />
              </motion.div>
            </div>

            <div className="lego-loading-build">
              <p className="lego-kicker">SET 003 · ASSEMBLING</p>
              <div className="lego-pixel-wordmark">
                <PixelWord word="ASK" color="yellow" startDelay={0.05} />
                <PixelWord word="BRICK" color="blue" startDelay={0.35} />
              </div>
              <p className="lego-loading-role">LEGO GUIDE</p>
              <p className="lego-loading-label">{label ?? "Building Ibtasaam's LEGO guide"}</p>
              <div className="lego-loading-progress" aria-hidden>
                {Array.from({ length: 8 }, (_, index) => (
                  <motion.span
                    key={index}
                    initial={reduced ? false : { opacity: 0.2, scaleX: 0.4 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    transition={{
                      delay: 0.7 + index * 0.065,
                      duration: 0.24,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </MotionConfig>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className={`lego-loader-inline ${className}`} role="status" aria-live="polite">
        <span className="lego-loader-inline__bricks" aria-hidden>
          {(["yellow", "red", "blue"] as LegoColor[]).map((color, index) => (
            <motion.span
              key={color}
              className="lego-loader-inline__brick"
              style={{
                ...brickStyle(color),
                background: LEGO_COLORS[color],
              }}
              animate={
                reduced
                  ? undefined
                  : {
                      y: [0, -5, 0],
                      rotate: [0, index % 2 ? 2 : -2, 0],
                    }
              }
              transition={{
                repeat: Infinity,
                duration: 0.9,
                delay: index * 0.12,
                ease: "easeInOut",
              }}
            />
          ))}
        </span>
        <span>{label ?? "Brick is pulling pieces…"}</span>
      </div>
    </MotionConfig>
  );
}

export function LegoBoot() {
  const [phase, setPhase] = useState<"visible" | "leaving" | "hidden">("visible");

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hold = reduced ? 0 : 2000;

    const leaveTimer = window.setTimeout(() => setPhase("leaving"), hold);
    const hideTimer = window.setTimeout(() => setPhase("hidden"), hold + 400);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  if (phase === "hidden") return null;

  return (
    <>
      <noscript>
        <style>{`.lego-boot{display:none!important}`}</style>
      </noscript>
      <div className={phase === "leaving" ? "lego-boot is-leaving" : "lego-boot"}>
        <LegoLoader variant="page" label="Building Ask Brick" />
      </div>
    </>
  );
}
