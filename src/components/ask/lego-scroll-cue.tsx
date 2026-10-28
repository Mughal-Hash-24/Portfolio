"use client";

import { scrollToChatBuild } from "@/lib/ask/scroll-to-build";
import { LegoStuds, brickStyle } from "./lego-brick";

export function LegoScrollCue() {
  return (
    <button
      type="button"
      className="lego-scroll-cue"
      onClick={scrollToChatBuild}
      aria-label="Scroll to assemble Brick, the guide"
    >
      <span className="lego-scroll-cue__bricks" aria-hidden>
        {(["yellow", "red", "blue"] as const).map((color, index) => (
          <span
            key={color}
            className="lego-scroll-cue__brick"
            style={{
              ...brickStyle(color),
              animationDelay: `${index * 120}ms`,
            }}
          >
            <LegoStuds count={2} />
          </span>
        ))}
      </span>

      <span className="lego-scroll-cue__copy">
        <span className="lego-kicker">The guide is below</span>
        <span className="lego-scroll-cue__title">Scroll to assemble Brick</span>
      </span>

      <span className="lego-scroll-cue__arrow" aria-hidden>
        ↓
      </span>
    </button>
  );
}
