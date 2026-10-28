"use client";

import { MotionConfig, motion } from "motion/react";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { LEGO_COLORS, brickStyle, type LegoColor } from "./lego-brick";

const COLS = 12;
const ROWS = 8;

const palette: LegoColor[] = ["yellow", "red", "blue", "green", "orange"];

const sizes = [
  { id: "1x1", width: 1, height: 1, label: "1×1" },
  { id: "2x1", width: 2, height: 1, label: "2×1" },
  { id: "2x2", width: 2, height: 2, label: "2×2" },
  { id: "4x2", width: 4, height: 2, label: "4×2" },
] as const;

type SizeId = (typeof sizes)[number]["id"];

type Placement = {
  id: number;
  row: number;
  col: number;
  width: number;
  height: number;
  color: LegoColor;
};

const STARTER_BUILD: Placement[] = [
  { id: 1, row: 6, col: 4, width: 4, height: 2, color: "red" },
  { id: 2, row: 4, col: 4, width: 2, height: 2, color: "yellow" },
  { id: 3, row: 4, col: 6, width: 2, height: 2, color: "green" },
  { id: 4, row: 2, col: 4, width: 4, height: 2, color: "blue" },
];

function canPlaceIn(
  placements: Placement[],
  row: number,
  col: number,
  width: number,
  height: number,
) {
  if (row < 0 || col < 0 || row + height > ROWS || col + width > COLS) {
    return false;
  }

  return !placements.some(
    (placement) =>
      row < placement.row + placement.height &&
      row + height > placement.row &&
      col < placement.col + placement.width &&
      col + width > placement.col,
  );
}

function placementAt(placements: Placement[], row: number, col: number) {
  return placements.find(
    (placement) =>
      row >= placement.row &&
      row < placement.row + placement.height &&
      col >= placement.col &&
      col < placement.col + placement.width,
  );
}

export function BrickLab() {
  const [placements, setPlacements] = useState<Placement[]>(STARTER_BUILD);
  const [history, setHistory] = useState<Placement[][]>([]);
  const [color, setColor] = useState<LegoColor>("yellow");
  const [sizeId, setSizeId] = useState<SizeId>("2x2");
  const [rotated, setRotated] = useState(false);
  const [tool, setTool] = useState<"place" | "remove">("place");
  const [cursor, setCursor] = useState({ row: 0, col: 0 });
  const [gridActive, setGridActive] = useState(false);
  const nextId = useRef(5);
  const rootRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const selectedSize = sizes.find((size) => size.id === sizeId) ?? sizes[2];
  const rotatedWidth = rotated ? selectedSize.height : selectedSize.width;
  const rotatedHeight = rotated ? selectedSize.width : selectedSize.height;
  const canRotate = selectedSize.width !== selectedSize.height;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      gsap.from(".lego-lab__head > *, .lego-lab__plate-wrap, .lego-lab__controls", {
        y: 22,
        opacity: 0,
        duration: 0.65,
        stagger: 0.06,
        ease: "power3.out",
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top 88%",
          once: true,
        },
      });
    }, rootRef);

    return () => context.revert();
  }, []);

  function pushHistory(next: Placement[]) {
    setHistory((previous) => [...previous.slice(-19), next]);
  }

  function placeAt(row: number, col: number) {
    if (tool === "remove") {
      const target = placementAt(placements, row, col);
      if (!target) return;

      pushHistory(placements);
      setPlacements((previous) => previous.filter((placement) => placement.id !== target.id));
      return;
    }

    if (!canPlaceIn(placements, row, col, rotatedWidth, rotatedHeight)) {
      return;
    }

    pushHistory(placements);
    setPlacements((previous) => [
      ...previous,
      {
        id: nextId.current++,
        row,
        col,
        width: rotatedWidth,
        height: rotatedHeight,
        color,
      },
    ]);
  }

  function undo() {
    const previous = history[history.length - 1];
    if (!previous) return;

    setPlacements(previous);
    setHistory((entries) => entries.slice(0, -1));
  }

  function clearPlate() {
    if (placements.length === 0) return;

    pushHistory(placements);
    setPlacements([]);
  }

  function surpriseMe() {
    const next: Placement[] = [];

    for (let attempt = 0; attempt < 48 && next.length < 24; attempt++) {
      const size = sizes[Math.floor(Math.random() * sizes.length)];
      const swap = Math.random() > 0.5;
      const width = swap ? size.height : size.width;
      const height = swap ? size.width : size.height;
      const row = Math.floor(Math.random() * (ROWS - height + 1));
      const col = Math.floor(Math.random() * (COLS - width + 1));

      if (!canPlaceIn(next, row, col, width, height)) continue;

      next.push({
        id: nextId.current++,
        row,
        col,
        width,
        height,
        color: palette[Math.floor(Math.random() * palette.length)],
      });
    }

    pushHistory(placements);
    setPlacements(next);
  }

  function handleGridKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setCursor((current) => ({
        ...current,
        row: Math.max(0, current.row - 1),
      }));
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setCursor((current) => ({
        ...current,
        row: Math.min(ROWS - 1, current.row + 1),
      }));
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setCursor((current) => ({
        ...current,
        col: Math.max(0, current.col - 1),
      }));
      return;
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      setCursor((current) => ({
        ...current,
        col: Math.min(COLS - 1, current.col + 1),
      }));
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      placeAt(cursor.row, cursor.col);
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <section ref={rootRef} className="lego-lab lego-band" aria-labelledby="brick-lab-title">
        <div className="lego-lab__head">
          <div>
            <p className="lego-kicker">Intermission · no AI required</p>
            <h2 id="brick-lab-title" className="lego-lab__title">
              The brick lab
            </h2>
            <p className="lego-lab__lede">
              Nothing to prove. Pick a piece, put it on the plate, and make something weird.
            </p>
          </div>
          <div className="lego-lab__head-meta">
            <p className="lego-lab__count" aria-live="polite">
              {placements.length} {placements.length === 1 ? "brick" : "bricks"} placed
            </p>
            <p className="lego-kicker">Your plate, no save</p>
          </div>
        </div>

        <div className="lego-lab__layout">
          <div className="lego-lab__plate-wrap">
            <div
              className="lego-lab__plate"
              style={
                {
                  "--lab-cols": COLS,
                  "--lab-rows": ROWS,
                } as CSSProperties
              }
            >
              {placements.map((placement) => (
                <motion.span
                  key={placement.id}
                  className="lego-lab__placed"
                  style={
                    {
                      ...brickStyle(placement.color),
                      left: `${(placement.col / COLS) * 100}%`,
                      top: `${(placement.row / ROWS) * 100}%`,
                      width: `${(placement.width / COLS) * 100}%`,
                      height: `${(placement.height / ROWS) * 100}%`,
                      "--brick-w": placement.width,
                      "--brick-h": placement.height,
                    } as CSSProperties
                  }
                  initial={reduced ? false : { opacity: 0, scale: 0.82 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 320,
                    damping: 24,
                  }}
                >
                  <span className="lego-lab__placed-studs" aria-hidden />
                </motion.span>
              ))}

              <div
                className="lego-lab__cells"
                role="grid"
                aria-label="Brick assembler baseplate"
                tabIndex={0}
                onKeyDown={handleGridKeyDown}
                onFocus={() => setGridActive(true)}
                onBlur={() => setGridActive(false)}
                onPointerEnter={() => setGridActive(true)}
              >
                {Array.from({ length: COLS * ROWS }, (_, index) => {
                  const row = Math.floor(index / COLS);
                  const col = index % COLS;
                  const placement = placementAt(placements, row, col);
                  const selected = cursor.row === row && cursor.col === col;

                  return (
                    <button
                      key={index}
                      type="button"
                      role="gridcell"
                      tabIndex={-1}
                      aria-label={`Row ${row + 1}, column ${col + 1}, ${
                        placement ? `${placement.color} brick` : "empty"
                      }`}
                      data-selected={(gridActive && selected) || undefined}
                      className="lego-lab__cell"
                      onClick={() => {
                        setCursor({ row, col });
                        placeAt(row, col);
                      }}
                      onPointerEnter={() => setCursor({ row, col })}
                    />
                  );
                })}
              </div>
            </div>
            <p className="lego-lab__plate-hint">
              Pick a colour and a piece, then click the plate. Arrow keys and Enter work too.
            </p>
          </div>

          <aside className="lego-lab__controls" aria-label="Brick controls">
            <div className="lego-lab__group">
              <p className="lego-kicker">Colour</p>
              <div className="lego-lab__swatches">
                {palette.map((swatch) => (
                  <button
                    key={swatch}
                    type="button"
                    data-active={color === swatch || undefined}
                    className="lego-lab__swatch"
                    style={{ background: LEGO_COLORS[swatch] }}
                    aria-label={swatch}
                    aria-pressed={color === swatch}
                    onClick={() => setColor(swatch)}
                  >
                    <span aria-hidden />
                  </button>
                ))}
              </div>
            </div>

            <div className="lego-lab__group">
              <p className="lego-kicker">Piece</p>
              <div className="lego-lab__sizes">
                {sizes.map((size) => (
                  <button
                    key={size.id}
                    type="button"
                    data-active={sizeId === size.id || undefined}
                    className="lego-lab__size"
                    aria-pressed={sizeId === size.id}
                    onClick={() => {
                      setSizeId(size.id);
                      setRotated(false);
                    }}
                  >
                    <span
                      className="lego-lab__size-shape"
                      style={{
                        aspectRatio: `${size.width} / ${size.height}`,
                        background: LEGO_COLORS[color],
                      }}
                      aria-hidden
                    />
                    {size.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="lego-lab__group">
              <p className="lego-kicker">Tool</p>
              <div className="lego-lab__tools">
                <button
                  type="button"
                  data-active={tool === "place" || undefined}
                  className="lego-lab__tool"
                  aria-pressed={tool === "place"}
                  onClick={() => setTool("place")}
                >
                  Place
                </button>
                <button
                  type="button"
                  data-active={tool === "remove" || undefined}
                  className="lego-lab__tool"
                  aria-pressed={tool === "remove"}
                  onClick={() => setTool("remove")}
                >
                  Remove
                </button>
                <button
                  type="button"
                  className="lego-lab__tool"
                  aria-pressed={rotated}
                  disabled={!canRotate}
                  onClick={() => setRotated((value) => !value)}
                >
                  Rotate
                </button>
              </div>
            </div>

            <div className="lego-lab__actions">
              <button
                type="button"
                className="lego-lab__action"
                onClick={undo}
                disabled={history.length === 0}
              >
                Undo
              </button>
              <button
                type="button"
                className="lego-lab__action"
                onClick={clearPlate}
                disabled={placements.length === 0}
              >
                Clear
              </button>
              <button
                type="button"
                className="lego-lab__action lego-lab__action--surprise"
                onClick={surpriseMe}
              >
                Surprise me
              </button>
            </div>
          </aside>
        </div>
      </section>
    </MotionConfig>
  );
}
