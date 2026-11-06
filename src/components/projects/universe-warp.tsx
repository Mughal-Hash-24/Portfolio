"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./universe.module.css";

const DURATION = 4200;
const STAR_COUNT = 420;

type WarpTransitProps = {
  destination: string;
  reducedMotion: boolean;
  onDone: () => void;
};

type WarpStar = {
  x: number;
  y: number;
  z: number;
  warm: boolean;
  weight: number;
};

function smooth(a: number, b: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
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

    const stars: WarpStar[] = Array.from({ length: STAR_COUNT }, () => ({
      x: (Math.random() * 2 - 1) * 1.9,
      y: (Math.random() * 2 - 1) * 1.9,
      z: 0.03 + Math.random() * 0.97,
      warm: Math.random() < 0.24,
      weight: 0.55 + Math.random() * 0.7,
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
        t < 0.56
          ? Math.pow(t / 0.56, 2.1)
          : t < 0.65
            ? 1
            : Math.pow(Math.max(0, 1 - (t - 0.65) / 0.35), 1.5);
      const fade = 1 - smooth(0.8, 1, t);

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.globalCompositeOperation = "destination-out";
      context.fillStyle = `rgba(0, 0, 0, ${0.18 + 0.28 * (1 - speed)})`;
      context.fillRect(0, 0, width, height);
      context.globalCompositeOperation = "lighter";

      const shake = speed * 2.4;
      const cx = width / 2 + (Math.random() - 0.5) * shake;
      const cy = height / 2 + (Math.random() - 0.5) * shake;
      const focal = Math.min(width, height) * 0.42;

      if (speed > 0.04) {
        const glow = context.createRadialGradient(cx, cy, 0, cx, cy, focal * 2.4);
        glow.addColorStop(0, `rgba(214, 236, 255, ${0.2 * speed * fade})`);
        glow.addColorStop(0.4, `rgba(110, 165, 255, ${0.09 * speed * fade})`);
        glow.addColorStop(1, "rgba(0, 0, 0, 0)");
        context.fillStyle = glow;
        context.fillRect(0, 0, width, height);
      }

      for (const star of stars) {
        star.z -= (0.16 + speed * 2.6) * dt;

        if (star.z <= 0.03) {
          star.x = (Math.random() * 2 - 1) * 1.9;
          star.y = (Math.random() * 2 - 1) * 1.9;
          star.z = 1;
          continue;
        }

        const sx = cx + (star.x / star.z) * focal;
        const sy = cy + (star.y / star.z) * focal;
        const tailZ = star.z + 0.05 + speed * 0.55;
        const tx = cx + (star.x / tailZ) * focal;
        const ty = cy + (star.y / tailZ) * focal;

        if (sx < -80 || sx > width + 80 || sy < -80 || sy > height + 80) continue;

        const depth = Math.max(0, 1 - star.z);
        const alpha = Math.min(1, (0.16 + 0.84 * speed) * (0.3 + depth * 0.95)) * fade;

        if (alpha < 0.02) continue;

        context.strokeStyle = star.warm
          ? `rgba(255, 216, 174, ${alpha})`
          : `rgba(188, 222, 255, ${alpha})`;
        context.lineWidth = star.weight * (0.7 + depth * 1.6);
        context.beginPath();
        context.moveTo(tx, ty);
        context.lineTo(sx, sy);
        context.stroke();

        if (speed > 0.45) {
          context.strokeStyle = `rgba(118, 196, 255, ${alpha * 0.3 * speed})`;
          context.lineWidth += 1.3;
          context.stroke();
        }
      }

      if (veilRef.current) {
        veilRef.current.style.opacity = String(1 - smooth(0.08, 0.42, t));
      }

      if (flashRef.current) {
        flashRef.current.style.opacity = String(Math.max(0, 1 - Math.abs(t - 0.6) / 0.1) * 0.7);
      }

      if (now - lastUpdate > 90) {
        lastUpdate = now;
        setTelemetry({
          velocity: 0.08 + 0.9 * speed,
          phase: t < 0.56 ? "Accelerating" : t < 0.65 ? "Near light speed" : "Decelerating",
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
