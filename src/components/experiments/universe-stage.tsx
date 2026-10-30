"use client";

import dynamic from "next/dynamic";

const UniverseSimulation = dynamic(() => import("./universe-simulation"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center bg-black text-sm text-neutral-400">
      Loading the universe…
    </div>
  ),
});

export function UniverseStage() {
  return <UniverseSimulation />;
}
