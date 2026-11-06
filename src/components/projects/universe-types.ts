export type Quality = "mobile" | "desktop";

export type TimelineState = {
  elapsed: number;
  progress: number;
  playing: boolean;
  started: boolean;
};

export type UniverseMode = "intro" | "explore";

export type UniverseStage = "map" | "system";
