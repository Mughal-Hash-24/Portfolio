"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { PanoramaSet } from "@/content/panoramas";
import { PanoramaErrorBoundary } from "./panorama-error-boundary";

const PanoramaCanvas = dynamic(() => import("./panorama-canvas"), { ssr: false });

type PanoramaBackgroundProps = {
  set: PanoramaSet | null;
  paused: boolean;
  reducedMotion: boolean;
};

export function PanoramaBackground({ set, paused, reducedMotion }: PanoramaBackgroundProps) {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!set) return;

    let cancelled = false;

    const preload = set.faces.map(
      (src) =>
        new Promise<void>((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve();
          image.onerror = () => reject(new Error(`Failed to load ${src}`));
          image.src = src;
        }),
    );

    Promise.all(preload)
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [set]);

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <div className="panorama-fallback absolute inset-0" />
      {set && ready && !failed ? (
        <PanoramaErrorBoundary fallback={null}>
          <PanoramaCanvas faces={set.faces} paused={paused} reducedMotion={reducedMotion} />
        </PanoramaErrorBoundary>
      ) : null}
    </div>
  );
}
