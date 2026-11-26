"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ArcadeGame } from "@/content/arcade";
import styles from "./cassette.module.css";

type CassetteDeckProps = {
  open: boolean;
  games: ArcadeGame[];
  activeSlug: string | null;
  onClose: () => void;
  onSelect: (game: ArcadeGame) => void;
};

/**
 * The cassette drawer.
 *
 * One cassette is on the rail at a time: arrow keys, the side buttons and the
 * label strip all move through the collection. The arcade behind is blurred and
 * dimmed so the cassette is the only thing in focus.
 */
export function CassetteDeck({ open, games, activeSlug, onClose, onSelect }: CassetteDeckProps) {
  const [index, setIndex] = useState(0);
  const [entered, setEntered] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  const game = games[index];

  const move = useCallback(
    (delta: number) => {
      setIndex((current) => (current + delta + games.length) % games.length);
    },
    [games.length],
  );

  useEffect(() => {
    if (!open) {
      const reset = window.requestAnimationFrame(() => setEntered(false));

      return () => window.cancelAnimationFrame(reset);
    }

    // Keep the focused cassette visible when the drawer opens on a running one.
    const active = games.findIndex((entry) => entry.slug === activeSlug);
    const frame = window.requestAnimationFrame(() => {
      if (active >= 0) setIndex(active);
      setEntered(true);
    });
    closeRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      } else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        move(1);
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        move(-1);
      } else if (event.key === "Enter" && game) {
        event.preventDefault();
        onSelect(game);
      }
    };

    window.addEventListener("keydown", onKey);

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
      window.cancelAnimationFrame(frame);
    };
  }, [open, activeSlug, games, move, onClose, onSelect, game]);

  if (!open || !game) return null;

  return (
    <div
      className={styles.overlay}
      data-entered={entered}
      role="dialog"
      aria-modal="true"
      aria-label="Cassette deck"
    >
      <button
        type="button"
        className={styles.scrim}
        onClick={onClose}
        aria-label="Close cassette deck"
        tabIndex={-1}
      />

      <div className={styles.rail}>
        <button
          type="button"
          className={styles.arrow}
          onClick={() => move(-1)}
          aria-label="Previous cassette"
        >
          <span aria-hidden="true">‹</span>
        </button>

        <article key={game.slug} className={styles.cassette}>
          {/* shell */}
          <div className={styles.shell} aria-hidden="true">
            <span className={styles.shellTop} />
            <span className={styles.shellBottom} />
            <span className={styles.screw} data-pos="tl" />
            <span className={styles.screw} data-pos="tr" />
            <span className={styles.screw} data-pos="bl" />
            <span className={styles.screw} data-pos="br" />
          </div>

          {/* printed label with the game's own frame */}
          <div className={styles.label}>
            <div className={styles.labelHead}>
              <span className={styles.labelSeries}>Ibtasaam Arcade · {game.year}</span>
              <span className={styles.labelIndex}>
                {String(index + 1).padStart(2, "0")}/{String(games.length).padStart(2, "0")}
              </span>
            </div>

            <div className={styles.labelArt}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/arcade-art/${game.slug}.webp`}
                alt={`${game.title} running in the arcade`}
                width={960}
                height={528}
                loading="eager"
              />
              <span className={styles.labelWash} aria-hidden="true" />
            </div>

            <div className={styles.labelFoot}>
              <h2 className={styles.labelTitle}>{game.title}</h2>
              <p className={styles.labelTagline}>{game.tagline}</p>
              <div className={styles.labelMeta}>
                <span>{game.stack.join(" · ")}</span>
                <span className={styles.labelControls}>{game.controls}</span>
              </div>
            </div>
          </div>

          {/* spools */}
          <div className={styles.spools} aria-hidden="true">
            <span className={styles.spool} />
            <span className={styles.tapeWindow} />
            <span className={styles.spool} />
          </div>
        </article>

        <button
          type="button"
          className={styles.arrow}
          onClick={() => move(1)}
          aria-label="Next cassette"
        >
          <span aria-hidden="true">›</span>
        </button>
      </div>

      <div className={styles.strip} role="tablist" aria-label="Cassettes">
        {games.map((entry, position) => (
          <button
            key={entry.slug}
            type="button"
            role="tab"
            aria-selected={position === index}
            aria-label={entry.title}
            className={styles.tick}
            data-active={position === index}
            onClick={() => setIndex(position)}
          />
        ))}
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.load} onClick={() => onSelect(game)}>
          Load cassette
        </button>
        <a href={game.source} target="_blank" rel="noreferrer" className={styles.source}>
          Source
        </a>
        <button ref={closeRef} type="button" className={styles.close} onClick={onClose}>
          Put back
        </button>
      </div>
    </div>
  );
}
