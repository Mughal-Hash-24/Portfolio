import Image from "next/image";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

export const LEGO_COLORS = {
  yellow: "#f2cd37",
  red: "#c91a09",
  blue: "#0055bf",
  green: "#00852b",
  orange: "#fe8a18",
  gray: "#d9d4c8",
  paper: "#fffdf6",
} as const;

export type LegoColor = keyof typeof LEGO_COLORS;

const LEGO_INK: Record<LegoColor, string> = {
  yellow: "#1c1b19",
  red: "#fffdf6",
  blue: "#fffdf6",
  green: "#fffdf6",
  orange: "#1c1b19",
  gray: "#1c1b19",
  paper: "#1c1b19",
};

export function brickStyle(color: LegoColor): CSSProperties {
  return {
    "--brick-color": LEGO_COLORS[color],
    "--brick-ink": LEGO_INK[color],
  } as CSSProperties;
}

export function LegoStuds({ count = 4 }: { count?: number }) {
  return (
    <span className="lego-brick__studs" aria-hidden>
      {Array.from({ length: count }, (_, index) => (
        <span key={index} className="lego-brick__stud" />
      ))}
    </span>
  );
}

type LegoBrickProps = {
  color?: LegoColor;
  studs?: number;
  children?: ReactNode;
} & HTMLAttributes<HTMLSpanElement>;

export function LegoBrick({
  color = "yellow",
  studs = 4,
  children,
  className = "",
  style,
  ...props
}: LegoBrickProps) {
  return (
    <span
      {...props}
      className={`lego-brick ${className}`}
      style={{ ...brickStyle(color), ...style }}
    >
      <LegoStuds count={studs} />
      {children}
    </span>
  );
}

export function LegoFace({ size = 48, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={`lego-face ${className}`}
      style={{ "--face-size": `${size}px` } as CSSProperties}
    >
      <Image
        src="/ask/lego-avatar.webp"
        alt=""
        fill
        sizes={`${size}px`}
        className="object-cover object-top"
      />
      <span className="lego-face__stud" />
    </span>
  );
}
