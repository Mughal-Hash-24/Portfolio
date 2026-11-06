"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./universe.module.css";

const DURATION = 3600;

type WarpTransitProps = {
  destination: string;
  reducedMotion: boolean;
  onDone: () => void;
};

type Star = {
  angle: number;
  radius: number;
  speed: number;
  warm: boolean;
  width: number;
};

function smooth(a: number, b: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

function easeOutQuad(t: number) {
  return 1 - (1 - t) * (1 - t);
}

function easeInQuad(t: number) {
  return t * t;
}

export function WarpTransit({ destination, reducedMotion, onDone }: WarpTransitProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const [telemetry, setTelemetry] = useState({ velocity: 0.08, phase: "Accelerating" });
  const done = useRef(false);

  useEffect(() => {
    const finish = () => {
      if (done.current) return;
      done.current = true;
      onDone();
    };

    if (reducedMotion) {
      const timer = window.setTimeout(finish, 700);
      return () => window.clearTimeout(timer);
    }

    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      finish();
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
    };

    resize();
    window.addEventListener("resize", resize);

    const stars: Star[] = Array.from({ length: 280 }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: 0.06 + Math.random() * 0.94,
      speed: 0.6 + Math.random() * 0.8,
      warm: Math.random() < 0.22,
      width: Math.random() < 0.16 ? 1.6 : 0.9,
    }));

    const start = performance.now();
    let previous = start;
    let lastUpdate = 0;
    let raf = 0;

    const frame = (now: number) => {
      const dt = Math.min((now - previous) / 1000, 0.05);
      previous = now;
      const t = Math.min((now - start) / DURATION, 1);

      const speed =
        easeOutQuad(Math.min(t / 0.52, 1)) * (t < 0.58 ? 1 : 1 - easeInQuad((t - 0.58) / 0.42));
      const fade = 1 - smooth(0.72, 1, t);

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const maxRadius = Math.hypot(width, height) * 0.52;

      for (const star of stars) {
        star.radius -= (0.1 + 0.9 * speed) * star.speed * dt;

        if (star.radius <= 0.03) {
          star.radius = 1;
          star.angle = Math.random() * Math.PI * 2;
        }

        const radius = star.radius * maxRadius;
        const x = cx + Math.cos(star.angle) * radius;
        const y = cy + Math.sin(star.angle) * radius;
        const tail = Math.min(radius, (8 + 210 * speed) * (1.05 - star.radius * 0.5) * star.speed);
        const tailX = cx + Math.cos(star.angle) * (radius - tail);
        const tailY = cy + Math.sin(star.angle) * (radius - tail);
        const alpha = Math.min(1, (0.18 + 0.82 * speed) * (1 - star.radius * 0.45)) * fade;

        context.strokeStyle = star.warm
          ? `rgba(255, 214, 170, ${alpha})`
          : `rgba(186, 220, 255, ${alpha})`;
        context.lineWidth = star.width;
        context.beginPath();
        context.moveTo(tailX, tailY);
        context.lineTo(x, y);
        context.stroke();
      }

      if (veilRef.current) {
        veilRef.current.style.opacity = String(1 - smooth(0.06, 0.4, t));
      }

      if (flashRef.current) {
        flashRef.current.style.opacity = String(Math.max(0, 1 - Math.abs(t - 0.56) / 0.1) * 0.6);
      }

      if (now - lastUpdate > 90) {
        lastUpdate = now;
        setTelemetry({
          velocity: 0.08 + 0.86 * speed,
          phase: t < 0.58 ? "Accelerating" : "Decelerating",
        });
      }

      if (t >= 1) {
        finish();
        return;
      }

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [reducedMotion, onDone]);

  return (
    <div className={styles.warp} aria-hidden="true">
      <div ref={veilRef} className={styles.warpVeil} />
      <canvas ref={canvasRef} className={styles.warpCanvas} />
      <div ref={flashRef} className={styles.warpFlash} />
      <div className={styles.warpTelemetry}>
        <p className={styles.warpDestination}>Transit to {destination}</p>
        <p className={styles.warpVelocity} data-phase={telemetry.phase}>
          {telemetry.phase} · {telemetry.velocity.toFixed(2)} c
        </p>
      </div>
    </div>
  );
}
