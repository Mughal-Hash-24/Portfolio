"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import { AtlasStatic } from "./atlas-static";

let canvasSupport: boolean | null = null;

function supportsCanvas() {
  if (canvasSupport !== null) return canvasSupport;

  try {
    const canvas = document.createElement("canvas");
    canvasSupport = Boolean(canvas.getContext("2d"));
  } catch {
    canvasSupport = false;
  }

  return canvasSupport;
}

function subscribe() {
  return () => {};
}

const AtlasExperience = dynamic(
  () => import("./atlas-experience").then((module) => module.AtlasExperience),
  {
    ssr: false,
    loading: () => <div className="h-dvh w-full bg-[#0a120d]" aria-label="Loading the Atlas" />,
  },
);

export function AtlasStage() {
  const supported = useSyncExternalStore(subscribe, supportsCanvas, () => true);

  if (!supported) return <AtlasStatic />;

  return <AtlasExperience />;
}
