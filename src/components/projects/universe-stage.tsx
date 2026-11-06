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
    loading: () => <div className="h-dvh w-full bg-[#02030a]" aria-label="Loading the universe" />,
  },
);

export function UniverseStage() {
  const webgl = useSyncExternalStore(subscribe, supportsWebGL, () => true);

  if (!webgl) return <UniverseStatic />;

  return <UniverseExperience />;
}
