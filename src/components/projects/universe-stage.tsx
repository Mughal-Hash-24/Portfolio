"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import { UniverseStatic } from "./universe-static";

let webglSupport: boolean | null = null;

function supportsWebGL() {
  if (webglSupport !== null) return webglSupport;

  try {
    const canvas = document.createElement("canvas");
    webglSupport = Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    webglSupport = false;
  }

  return webglSupport;
}

function subscribe() {
  return () => {};
}

const UniverseExperience = dynamic(
  () => import("./universe-experience").then((module) => module.UniverseExperience),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-dvh w-full items-center justify-center bg-[#02030a] font-mono text-[10px] tracking-[0.3em] text-[#8f8a7e] uppercase">
        Charting the universe…
      </div>
    ),
  },
);

export function UniverseStage() {
  const webgl = useSyncExternalStore(subscribe, supportsWebGL, () => true);

  if (!webgl) return <UniverseStatic />;

  return <UniverseExperience />;
}
