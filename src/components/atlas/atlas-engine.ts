import {
  atlasRegions,
  entryById,
  relicById,
  regionById,
  type AtlasEntry,
  type AtlasRelic,
} from "@/content/atlas";
import {
  guideName,
  guideTitle,
  storyLines,
  type ArcadeStatue,
  type StoryStage,
} from "@/content/atlas-story";
import {
  createWaterGlints,
  drawCampfire,
  drawGuide,
  drawLandmark,
  drawPlayer,
  drawRelic,
  drawSignpost,
  drawArcadeDoorGlow,
  drawTrail,
  drawWaterGlints,
  hourMood,
  paintArcade,
  paintInterior,
  paintLectern,
  paintTerrain,
} from "./atlas-art";
import type { SfxEvent, StepSurface } from "./atlas-sfx";
import {
  TILE,
  Tile,
  WORLD_H,
  WORLD_W,
  buildArcadeDimension,
  buildLibraryInterior,
  buildWorld,
  isSolidTile,
  type ArcadeWorld,
  type Collider,
  type Interior,
  type World,
} from "./atlas-world";

export type Nearby =
  | { kind: "entry"; label: string; hint: string; entryId: string }
  | { kind: "relic"; label: string; hint: string; relicId: string }
  | { kind: "campfire"; label: string; hint: string }
  | { kind: "signpost"; label: string; hint: string }
  | { kind: "libraryDoor"; label: string; hint: string }
  | { kind: "libraryExit"; label: string; hint: string }
  | { kind: "lectern"; label: string; hint: string; relicId: string }
  | { kind: "missionStone"; label: string; hint: string }
  | { kind: "memoryStone"; label: string; hint: string }
  | { kind: "portal"; label: string; hint: string }
  | { kind: "arcadeExit"; label: string; hint: string }
  | { kind: "statue"; label: string; hint: string; statueId: string };

export type AtlasCallbacks = {
  onNearby: (nearby: Nearby | null) => void;
  onOpenEntry: (entry: AtlasEntry) => void;
  onOpenRelic: (relic: AtlasRelic) => void;
  onOpenIndex: () => void;
  onOpenMission: () => void;
  onOpenMemory: () => void;
  onOpenStatue: (statue: ArcadeStatue) => void;
  onTime: (hour: number) => void;
  onFound: (kind: "entry" | "relic" | "statue", id: string) => void;
  onGuide: (line: string | null) => void;
  onStoryStage: (stage: StoryStage) => void;
  onStoryComplete: () => void;
  onScene: (scene: Scene) => void;
  onStep: (surface: StepSurface) => void;
  onSfx: (event: SfxEvent) => void;
};

type EngineOptions = {
  reducedMotion: boolean;
  found: Set<string>;
  initialHour?: number;
  storyComplete?: boolean;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  kind: "note" | "petal" | "page" | "mote" | "firefly" | "leaf";
  color: string;
  phase: number;
};

type Scene = "world" | "library" | "arcade";

const PLAYER_SPEED = 104;
const PLAYER_RADIUS = 5;
const DAY_SECONDS = 720;
const INTERACT_RADIUS = 30;

export class AtlasEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private callbacks: AtlasCallbacks;
  private options: EngineOptions;
  private world: World;
  private interior: Interior;
  private interiorCanvas: HTMLCanvasElement | null = null;
  private arcade: ArcadeWorld;
  private arcadeCanvas: HTMLCanvasElement | null = null;
  private terrain: HTMLCanvasElement;
  private glints: ReturnType<typeof createWaterGlints>;
  private scene: Scene = "world";
  private storyStage: StoryStage = "pond";
  private storyComplete = false;
  private portalActive = false;
  private storyQueue: string[] = [];
  private storyTimer: number | null = null;
  private storyOnDone: (() => void) | null = null;
  private guideFollowing = false;
  private guideWaypoint = 1;
  private introSpoken = false;
  private nudgeTimer = 0;
  private guideHome = { x: 0, y: 0 };
  private stepTimer = 0;
  private shadowSprite: HTMLCanvasElement | null = null;
  private doorGlowSprites: Partial<Record<"arcade" | "exit", HTMLCanvasElement>> = {};
  private glowSprites = new Map<string, HTMLCanvasElement>();
  private arcadeIdle: number | null = null;
  private player = { x: 0, y: 0, dir: 0, walk: 0, moving: false };
  private camera = { x: 0, y: 0 };
  private guideState = { x: 0, y: 0, targetX: 0, targetY: 0, walk: 0, moving: false };
  private keys = new Set<string>();
  private joystick = { x: 0, y: 0 };
  private hour: number;
  private nearby: Nearby | null = null;
  private nearbyKey = "";
  private guideTimer = 0;
  private guideIndex = 0;
  private guideVisible = false;
  private lastTimeReport = -1;
  private restFade = 0;
  private restTarget: number | null = null;
  private particles: Particle[] = [];
  private birds: Array<{ x: number; y: number; speed: number; flap: number }> = [];
  private time = 0;
  private raf = 0;
  private lastFrame = 0;
  private running = false;
  private inputEnabled = false;
  private destroyed = false;
  private resizeObserver: ResizeObserver | null = null;
  private intersectionObserver: IntersectionObserver | null = null;
  private visible = true;
  private found: Set<string>;

  constructor(canvas: HTMLCanvasElement, callbacks: AtlasCallbacks, options: EngineOptions) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");

    if (!ctx) throw new Error("Canvas 2D is not available");

    this.ctx = ctx;
    this.callbacks = callbacks;
    this.options = options;
    this.found = options.found;
    this.world = buildWorld();
    this.interior = buildLibraryInterior();
    this.arcade = buildArcadeDimension();
    this.terrain = paintTerrain(this.world);
    this.glints = createWaterGlints(this.world);
    this.player = {
      x: this.world.spawn.x,
      y: this.world.spawn.y,
      dir: 3,
      walk: 0,
      moving: false,
    };
    this.guideState = {
      x: this.world.guide.x,
      y: this.world.guide.y,
      targetX: this.world.guide.x,
      targetY: this.world.guide.y,
      walk: 0,
      moving: false,
    };
    this.guideHome = { x: this.world.guide.x, y: this.world.guide.y };
    this.storyComplete = options.storyComplete ?? false;
    this.storyStage = this.storyComplete ? "done" : "pond";
    this.portalActive = this.storyComplete;
    this.camera = { x: this.player.x, y: this.player.y };
    this.hour = options.initialHour ?? (new Date().getHours() + new Date().getMinutes() / 60) % 24;

    if (options.reducedMotion) this.hour = 18.4;
    this.spawnParticles();
    this.bind();

    const idle = (
      window as Window & {
        requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
      }
    ).requestIdleCallback;

    if (idle) {
      this.arcadeIdle = idle(
        () => {
          this.arcadeIdle = null;
          this.prepareArcade();
        },
        { timeout: 2500 },
      );
    } else {
      this.arcadeIdle = window.setTimeout(() => {
        this.arcadeIdle = null;
        this.prepareArcade();
      }, 700);
    }
  }

  private prepareArcade() {
    if (this.destroyed || this.arcadeCanvas) return;

    this.arcadeCanvas = paintArcade(this.arcade);
  }

  private get zoom() {
    return this.canvas.clientWidth < 720 ? 1.7 : 2.2;
  }

  private get viewWidth() {
    return this.canvas.clientWidth / this.zoom;
  }

  private get viewHeight() {
    return this.canvas.clientHeight / this.zoom;
  }

  private bind() {
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
    document.addEventListener("visibilitychange", this.handleVisibility);
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.canvas);
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        this.visible = entries.some((entry) => entry.isIntersecting);
        this.updateRunning();
      },
      { threshold: 0.05 },
    );
    this.intersectionObserver.observe(this.canvas);
    this.resize();
  }

  private handleVisibility = () => {
    this.visible = !document.hidden;
    this.updateRunning();
  };

  private updateRunning() {
    if (this.destroyed) return;

    if (this.visible) this.start();
    else this.stop();
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    const target = event.target as HTMLElement | null;

    if (
      target &&
      (target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable ||
        document.querySelector("dialog[open]"))
    ) {
      return;
    }

    const key = event.key.toLowerCase();

    if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(key)) {
      if (!this.inputEnabled) return;
      event.preventDefault();
      this.keys.add(key);
      return;
    }

    if (key === "e" || key === "enter") {
      if (!this.inputEnabled) return;
      event.preventDefault();
      this.interact();
      return;
    }

    if (key === "j" || key === "m") {
      if (!this.inputEnabled) return;
      event.preventDefault();
      this.callbacks.onOpenIndex();
    }
  };

  private handleKeyUp = (event: KeyboardEvent) => {
    this.keys.delete(event.key.toLowerCase());
  };

  private resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;

    if (width === 0 || height === 0) return;
    if (
      this.canvas.width !== Math.round(width * dpr) ||
      this.canvas.height !== Math.round(height * dpr)
    ) {
      this.canvas.width = Math.round(width * dpr);
      this.canvas.height = Math.round(height * dpr);
    }

    this.ctx.imageSmoothingEnabled = false;
  }

  start() {
    if (this.running || this.destroyed) return;
    this.running = true;
    this.lastFrame = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  stop() {
    this.running = false;

    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  begin() {
    this.inputEnabled = true;
    this.callbacks.onTime(this.hour);
    this.callbacks.onStoryStage(this.storyStage);
    this.callbacks.onScene(this.scene);
  }

  setInputEnabled(enabled: boolean) {
    this.inputEnabled = enabled;

    if (!enabled) this.keys.clear();
  }

  setReducedMotion(enabled: boolean) {
    this.options.reducedMotion = enabled;

    if (!enabled) return;

    this.hour = 18.4;
    this.lastTimeReport = -1;
    this.callbacks.onTime(this.hour);
  }

  startStory() {
    if (this.storyComplete) {
      this.setStoryStage("done");
      this.portalActive = true;
      return;
    }

    if (this.storyStage !== "pond") return;

    this.setStoryStage("introduce");
    this.introSpoken = false;
  }

  enableFreeRoam() {
    this.setStoryStage("done");
    this.portalActive = true;
    this.guideHome = { x: this.world.guide.x, y: this.world.guide.y };
    this.guideState.x = this.world.guide.x;
    this.guideState.y = this.world.guide.y;
  }

  advanceDialogue() {
    if (this.storyTimer === null && this.storyQueue.length === 0) return;
    this.clearStoryTimer();
    this.nextStoryLine();
  }

  skipStory() {
    this.clearStoryTimer();
    this.storyQueue = [];
    this.storyOnDone = null;
    this.callbacks.onGuide(null);
    this.portalActive = true;
    this.setStoryStage("done");

    if (!this.storyComplete) {
      this.storyComplete = true;
      this.callbacks.onStoryComplete();
    }

    this.guideHome = { x: this.player.x - 30, y: this.player.y + 10 };
    this.guideState.targetX = this.guideHome.x;
    this.guideState.targetY = this.guideHome.y;
  }

  private setStoryStage(stage: StoryStage) {
    this.storyStage = stage;
    this.callbacks.onStoryStage(stage);
  }

  private clearStoryTimer() {
    if (this.storyTimer !== null) {
      window.clearTimeout(this.storyTimer);
      this.storyTimer = null;
    }
  }

  private queueStoryLines(lines: readonly string[], onDone?: () => void) {
    this.clearStoryTimer();
    this.storyQueue = [...lines];
    this.storyOnDone = onDone ?? null;
    this.guideVisible = true;
    this.nextStoryLine();
  }

  private nextStoryLine() {
    this.clearStoryTimer();
    const line = this.storyQueue.shift();

    if (line === undefined) {
      const done = this.storyOnDone;
      this.storyOnDone = null;
      this.callbacks.onGuide(null);
      done?.();
      return;
    }

    this.callbacks.onGuide(line);
    const duration = Math.min(7200, 2800 + line.length * 24);
    this.storyTimer = window.setTimeout(() => {
      this.storyTimer = null;
      this.nextStoryLine();
    }, duration);
  }

  private startFollow() {
    this.guideFollowing = true;
    this.guideWaypoint = 1;
    this.setStoryStage("follow");
    this.queueStoryLines(storyLines.followStart);
  }

  private arriveAtShrine() {
    this.guideFollowing = false;
    this.guideHome = { x: this.guideState.x, y: this.guideState.y };
    this.setStoryStage("memory");
    this.queueStoryLines(storyLines.memory, () => this.beginGateWalk());
  }

  private beginGateWalk() {
    this.setStoryStage("gate");
    this.guideFollowing = true;
    this.guideWaypoint = 1;
    this.guideHome = { x: this.guideState.x, y: this.guideState.y };
  }

  private arriveAtGate() {
    this.guideFollowing = false;
    this.guideHome = { x: this.guideState.x, y: this.guideState.y };
    this.portalActive = true;
    this.setStoryStage("portal");
    this.queueStoryLines(storyLines.portal);
  }

  enterArcade() {
    this.scene = "arcade";
    this.callbacks.onScene("arcade");
    this.player.x = this.arcade.spawn.x;
    this.player.y = this.arcade.spawn.y;
    this.player.dir = 3;
    this.camera.x = this.player.x;
    this.camera.y = this.player.y;
    this.guideState.x = this.arcade.guide.x;
    this.guideState.y = this.arcade.guide.y;
    this.guideHome = { ...this.arcade.guide };
    this.guideState.targetX = this.guideHome.x;
    this.guideState.targetY = this.guideHome.y;
    this.callbacks.onSfx("gate");
    this.setStoryStage("arcade");
    this.queueStoryLines(storyLines.arcade);
    this.updateNearby();
  }

  exitArcade() {
    this.scene = "world";
    this.callbacks.onScene("world");
    const portal = this.world.story.portal;
    const spot = this.freeSpotNear(portal.x, portal.y + 46);
    this.player.x = spot.x;
    this.player.y = spot.y;
    this.player.dir = 0;
    this.camera.x = this.player.x;
    this.camera.y = this.player.y;
    this.guideState.x = spot.x - 28;
    this.guideState.y = spot.y + 8;
    this.guideHome = { x: this.guideState.x, y: this.guideState.y };
    this.portalActive = true;
    this.callbacks.onSfx("gate");
    this.setStoryStage("done");

    if (!this.storyComplete) {
      this.storyComplete = true;
      this.callbacks.onStoryComplete();
    }

    this.queueStoryLines(storyLines.returnWorld);
    this.updateNearby();
  }

  focusStatue(statueId: string) {
    const spot = this.arcade.statues.find((candidate) => candidate.statue.id === statueId);

    if (!spot) return;
    this.scene = "arcade";
    this.callbacks.onScene("arcade");
    const free = this.freeSpotNear(spot.x, spot.y + 30, this.arcade.colliders);
    this.player.x = free.x;
    this.player.y = free.y;
    this.player.dir = 3;
    this.camera.x = this.player.x;
    this.camera.y = this.player.y;
    this.updateNearby();
  }

  pause() {
    this.stop();
  }

  resume() {
    this.updateRunning();
  }

  setJoystick(x: number, y: number) {
    this.joystick.x = x;
    this.joystick.y = y;
  }

  interact() {
    const nearby = this.nearby;

    if (!nearby) return;

    switch (nearby.kind) {
      case "entry": {
        const entry = entryById.get(nearby.entryId);

        if (!entry) return;
        this.markFound("entry", entry.id);
        this.callbacks.onSfx("relic");
        this.callbacks.onOpenEntry(entry);
        break;
      }
      case "relic":
      case "lectern": {
        const relic = relicById.get(nearby.relicId);

        if (!relic) return;
        this.markFound("relic", relic.id);
        this.callbacks.onSfx("relic");
        this.callbacks.onOpenRelic(relic);
        break;
      }
      case "campfire":
        this.callbacks.onSfx("rest");
        this.rest();
        break;
      case "signpost":
        this.callbacks.onSfx("door");
        this.callbacks.onOpenIndex();
        break;
      case "libraryDoor":
        this.callbacks.onSfx("door");
        this.enterLibrary();
        break;
      case "libraryExit":
        this.callbacks.onSfx("door");
        this.exitLibrary();
        break;
      case "missionStone":
        this.callbacks.onSfx("mission");
        this.callbacks.onOpenMission();
        break;
      case "memoryStone":
        this.callbacks.onSfx("inscription");
        this.callbacks.onOpenMemory();
        break;
      case "portal":
        this.enterArcade();
        break;
      case "arcadeExit":
        this.exitArcade();
        break;
      case "statue": {
        const spot = this.arcade.statues.find(
          (candidate) => candidate.statue.id === nearby.statueId,
        );

        if (!spot) return;
        this.markFound("statue", spot.statue.id);
        this.callbacks.onSfx("inscription");
        this.callbacks.onOpenStatue(spot.statue);
        break;
      }
    }
  }

  focusEntry(entryId: string) {
    const landmark = this.world.landmarks.find((candidate) => candidate.entryId === entryId);

    if (!landmark) return;
    this.scene = "world";
    this.callbacks.onScene("world");
    const spot = this.freeSpotNear(landmark.x, landmark.y);
    this.player.x = spot.x;
    this.player.y = spot.y;
    this.player.dir = 3;
    this.camera.x = this.player.x;
    this.camera.y = this.player.y;
    this.updateNearby();
  }

  private freeSpotNear(x: number, y: number, colliders: Collider[] = this.world.colliders) {
    const offsets: Array<[number, number]> = [
      [0, 36],
      [22, 32],
      [-22, 32],
      [0, -36],
      [36, 0],
      [-36, 0],
      [30, 30],
      [-30, 30],
      [30, -30],
      [-30, -30],
      [0, 48],
      [48, 0],
      [-48, 0],
      [0, -48],
    ];

    for (const [offsetX, offsetY] of offsets) {
      if (!this.collides(x + offsetX, y + offsetY, colliders)) {
        return { x: x + offsetX, y: y + offsetY };
      }
    }

    return { x, y: y + 36 };
  }

  private markFound(kind: "entry" | "relic" | "statue", id: string) {
    this.found.add(id);
    this.callbacks.onFound(kind, id);
  }

  private rest() {
    if (this.restTarget !== null) return;

    this.restTarget = (this.hour + 6) % 24;
  }

  private enterLibrary() {
    this.scene = "library";
    this.callbacks.onScene("library");
    this.player.x = this.interior.spawn.x;
    this.player.y = this.interior.spawn.y;
    this.player.dir = 3;
    this.camera.x = this.interior.spawn.x;
    this.camera.y = this.interior.spawn.y;
    this.updateNearby();
  }

  private exitLibrary() {
    const library = regionById.get("books");

    if (!library) return;

    this.scene = "world";
    this.callbacks.onScene("world");
    this.player.x = library.center.x * TILE + TILE / 2 - 32;
    this.player.y = library.center.y * TILE + TILE / 2 + 44;
    this.player.dir = 0;
    this.camera.x = this.player.x;
    this.camera.y = this.player.y;
    this.updateNearby();
  }

  private spawnParticles() {
    this.particles = [];

    for (let index = 0; index < 28; index += 1) {
      this.particles.push(this.makeParticle("leaf"));
    }

    for (let index = 0; index < 34; index += 1) {
      this.particles.push(this.makeParticle("firefly"));
    }

    this.birds = Array.from({ length: 2 }, (_, index) => ({
      x: 200 + index * 400,
      y: 120 + index * 90,
      speed: 18 + index * 6,
      flap: index * 2,
    }));
  }

  private makeParticle(kind: Particle["kind"]): Particle {
    const angle = Math.random() * Math.PI * 2;
    const radius = 60 + Math.random() * 340;
    const life = 4 + Math.random() * 8;

    return {
      x: this.player.x + Math.cos(angle) * radius,
      y: this.player.y + Math.sin(angle) * radius,
      vx: (Math.random() - 0.5) * 10,
      vy: kind === "firefly" ? (Math.random() - 0.5) * 8 : 6 + Math.random() * 10,
      life,
      maxLife: life,
      kind,
      color: "#fff1c9",
      phase: Math.random() * Math.PI * 2,
    };
  }

  private nearbyForWorld(): Nearby | null {
    let best: Nearby | null = null;
    let bestDistance = INTERACT_RADIUS;

    const consider = (nearby: Nearby, x: number, y: number, radius = INTERACT_RADIUS) => {
      const distance = Math.hypot(this.player.x - x, this.player.y - y);

      if (distance < Math.min(radius, bestDistance)) {
        best = nearby;
        bestDistance = distance;
      }
    };

    for (const landmark of this.world.landmarks) {
      const entry = entryById.get(landmark.entryId);

      if (!entry) continue;
      consider(
        { kind: "entry", entryId: entry.id, label: entry.title, hint: "Look closer" },
        landmark.x,
        landmark.y,
      );
    }

    const night = hourMood(this.hour).night > 0.5;

    for (const spot of this.world.relics) {
      if (spot.relic.night && !night) continue;
      consider(
        {
          kind: "relic",
          relicId: spot.relic.id,
          label: spot.relic.title,
          hint: "Pick up the glint",
        },
        spot.x,
        spot.y,
        26,
      );
    }

    consider(
      { kind: "campfire", label: "Campfire", hint: "Rest and change the hour" },
      this.world.campfire.x,
      this.world.campfire.y,
      38,
    );
    consider(
      { kind: "signpost", label: "Signpost", hint: "Read the index" },
      this.world.signpost.x,
      this.world.signpost.y,
    );

    const library = regionById.get("books");

    if (library) {
      consider(
        { kind: "libraryDoor", label: "The Long Library", hint: "Step inside" },
        library.center.x * TILE + TILE / 2 - 26,
        library.center.y * TILE + TILE / 2 + 40,
        46,
      );
    }

    consider(
      { kind: "missionStone", label: "The Inscription", hint: "Read your mission" },
      this.world.story.missionStone.x,
      this.world.story.missionStone.y + 12,
      40,
    );
    consider(
      { kind: "memoryStone", label: "The Middle Button", hint: "Remember 2011" },
      this.world.story.shrine.mouse.x,
      this.world.story.shrine.mouse.y,
      42,
    );

    if (this.portalActive) {
      consider(
        { kind: "portal", label: "The Arcade", hint: "Step inside" },
        this.world.story.portal.x,
        this.world.story.portal.y + 10,
        50,
      );
    }

    return best;
  }

  private nearbyForLibrary(): Nearby | null {
    const distance = Math.hypot(
      this.player.x - this.interior.relic.x,
      this.player.y - this.interior.relic.y,
    );

    if (distance < 34) {
      return {
        kind: "lectern",
        relicId: this.interior.relic.relic.id,
        label: this.interior.relic.relic.title,
        hint: "Read the lectern",
      };
    }

    const exitDistance = Math.hypot(
      this.player.x - this.interior.exit.x,
      this.player.y - (this.interior.exit.y + 10),
    );

    if (exitDistance < 40) {
      return { kind: "libraryExit", label: "The door", hint: "Step outside" };
    }

    return null;
  }

  private nearbyForArcade(): Nearby | null {
    let best: Nearby | null = null;
    let bestDistance = 46;

    for (const spot of this.arcade.statues) {
      const distance = Math.hypot(this.player.x - spot.x, this.player.y - spot.y);

      if (distance < bestDistance) {
        best = {
          kind: "statue",
          statueId: spot.statue.id,
          label: spot.statue.game,
          hint: "Read the plaque",
        };
        bestDistance = distance;
      }
    }

    const exitDistance = Math.hypot(
      this.player.x - this.arcade.exit.x,
      this.player.y - (this.arcade.exit.y + 10),
    );

    if (exitDistance < 46) {
      return { kind: "arcadeExit", label: "The street door", hint: "Leave the arcade" };
    }

    return best;
  }

  private updateNearby() {
    const nearby =
      this.scene === "world"
        ? this.nearbyForWorld()
        : this.scene === "library"
          ? this.nearbyForLibrary()
          : this.nearbyForArcade();
    const key = nearby
      ? `${nearby.kind}:${"entryId" in nearby ? nearby.entryId : ""}${"relicId" in nearby ? nearby.relicId : ""}${"statueId" in nearby ? nearby.statueId : ""}`
      : "";

    if (key !== this.nearbyKey) {
      this.nearbyKey = key;
      this.nearby = nearby;
      this.callbacks.onNearby(nearby);
    }
  }

  private movePlayer(dt: number) {
    const keys = this.keys;
    let dx = 0;
    let dy = 0;

    if (keys.has("w") || keys.has("arrowup")) dy -= 1;
    if (keys.has("s") || keys.has("arrowdown")) dy += 1;
    if (keys.has("a") || keys.has("arrowleft")) dx -= 1;
    if (keys.has("d") || keys.has("arrowright")) dx += 1;

    dx += this.joystick.x;
    dy += this.joystick.y;

    const length = Math.hypot(dx, dy);
    this.player.moving = length > 0.12;

    if (!this.player.moving) return;

    dx /= length || 1;
    dy /= length || 1;

    if (Math.abs(dx) > Math.abs(dy)) {
      this.player.dir = dx > 0 ? 2 : 1;
    } else {
      this.player.dir = dy > 0 ? 0 : 3;
    }

    const step = PLAYER_SPEED * dt;
    const colliders =
      this.scene === "world"
        ? this.world.colliders
        : this.scene === "library"
          ? this.interior.colliders
          : this.arcade.colliders;
    const startX = this.player.x;
    const startY = this.player.y;
    const nextX = this.player.x + dx * step;
    const nextY = this.player.y + dy * step;

    if (!this.collides(nextX, this.player.y, colliders)) this.player.x = nextX;
    if (!this.collides(this.player.x, nextY, colliders)) this.player.y = nextY;

    const travelled = Math.hypot(this.player.x - startX, this.player.y - startY);

    this.player.walk = (this.player.walk + dt * 2.4) % 1;

    if (travelled > 0.05) {
      this.stepTimer += dt;

      if (this.stepTimer >= 0.33) {
        this.stepTimer = 0;
        this.callbacks.onStep(this.currentStepSurface());
      }
    } else {
      this.stepTimer = 0;
    }
  }

  private collides(x: number, y: number, colliders: Collider[]) {
    const radius = PLAYER_RADIUS;
    const tiles = this.scene === "world" ? this.world.tiles : null;

    if (tiles) {
      for (const [ox, oy] of [
        [-radius, -radius],
        [radius, -radius],
        [-radius, radius],
        [radius, radius],
        [0, radius],
        [0, -radius],
      ]) {
        const tx = Math.floor((x + ox) / TILE);
        const ty = Math.floor((y + oy) / TILE);

        if (isSolidTile(tiles, tx, ty)) return true;
      }
    }

    for (const collider of colliders) {
      if ("r" in collider) {
        if (Math.hypot(collider.x - x, collider.y - y) < collider.r + radius) return true;
      } else {
        const halfW = collider.w / 2 + radius;
        const halfH = collider.h / 2 + radius;

        if (Math.abs(collider.x - x) < halfW && Math.abs(collider.y - y) < halfH) return true;
      }
    }

    return false;
  }

  private currentStepSurface(): StepSurface {
    if (this.scene === "arcade") return "arcade";
    if (this.scene === "library") return "wood";

    const pond = this.world.story.pond;
    const dockX = pond.x + 2;

    if (
      Math.abs(this.player.x - dockX) < 18 &&
      this.player.y > pond.y + pond.ry - 14 &&
      this.player.y < pond.y + pond.ry + 30
    ) {
      return "wood";
    }

    const tx = Math.floor(this.player.x / TILE);
    const ty = Math.floor(this.player.y / TILE);

    if (tx < 0 || ty < 0 || tx >= WORLD_W || ty >= WORLD_H) return "grass";

    switch (this.world.tiles[ty * WORLD_W + tx]) {
      case Tile.Water:
        return "water";
      case Tile.Path:
      case Tile.Shore:
        return "path";
      case Tile.Plaza:
        return "stone";
      default:
        return "grass";
    }
  }

  private updateGuide(dt: number) {
    const guide = this.guideState;
    const playerDistance = Math.hypot(this.player.x - guide.x, this.player.y - guide.y);

    if (this.scene === "world" && this.storyStage === "introduce" && !this.introSpoken) {
      const targetX = this.player.x - 30;
      const targetY = this.player.y + 14;
      const dx = targetX - guide.x;
      const dy = targetY - guide.y;
      const distance = Math.hypot(dx, dy);

      guide.moving = distance > 2;

      if (guide.moving) {
        const step = Math.min(distance, 78 * dt);
        guide.x += (dx / distance) * step;
        guide.y += (dy / distance) * step;
        guide.walk = (guide.walk + dt * 1.8) % 1;
      }

      if (playerDistance < 58) {
        this.introSpoken = true;
        guide.targetX = guide.x;
        guide.targetY = guide.y;
        this.guideHome = { x: guide.x, y: guide.y };
        this.queueStoryLines(storyLines.intro, () => this.startFollow());
      }

      return;
    }

    if (this.scene === "world" && this.storyStage === "introduce") {
      return;
    }

    if (this.scene === "world" && (this.storyStage === "memory" || this.storyStage === "portal")) {
      return;
    }

    if (
      this.scene === "world" &&
      (this.storyStage === "follow" || this.storyStage === "gate") &&
      this.guideFollowing
    ) {
      const gateStage = this.storyStage === "gate";
      const waypoint = (gateStage ? this.world.story.gatePath : this.world.story.guidePath)[
        this.guideWaypoint
      ];

      if (!waypoint) {
        if (gateStage) this.arriveAtGate();
        else this.arriveAtShrine();
        return;
      }

      if (playerDistance > 150) {
        this.nudgeTimer -= dt;

        if (this.nudgeTimer <= 0) {
          this.nudgeTimer = 8;
          this.callbacks.onGuide(
            storyLines.followNudge[Math.floor(Math.random() * storyLines.followNudge.length)],
          );
          window.setTimeout(() => {
            if (this.storyStage === "follow") this.callbacks.onGuide(null);
          }, 2600);
        }

        guide.moving = false;
        return;
      }

      const dx = waypoint.x - guide.x;
      const dy = waypoint.y - guide.y;
      const distance = Math.hypot(dx, dy);

      guide.moving = distance > 2;

      if (guide.moving) {
        const step = Math.min(distance, 62 * dt);
        guide.x += (dx / distance) * step;
        guide.y += (dy / distance) * step;
        guide.walk = (guide.walk + dt * 1.6) % 1;
      }

      if (distance < 6) {
        this.guideWaypoint += 1;

        const path = gateStage ? this.world.story.gatePath : this.world.story.guidePath;

        if (this.guideWaypoint >= path.length) {
          if (gateStage) this.arriveAtGate();
          else this.arriveAtShrine();
        }
      }

      return;
    }

    // Free-roam: drift around his home, turn toward the player when close.
    const nearPlayer = playerDistance < 120;

    if (nearPlayer) {
      const angle = Math.atan2(this.player.y - guide.y, this.player.x - guide.x);
      guide.targetX = this.guideHome.x - Math.cos(angle) * 26;
      guide.targetY = this.guideHome.y - Math.sin(angle) * 20;
    }

    this.guideTimer -= dt;

    if (this.guideTimer <= 0 && !nearPlayer) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 8 + Math.random() * 30;
      guide.targetX = this.guideHome.x + Math.cos(angle) * radius;
      guide.targetY = this.guideHome.y + Math.sin(angle) * radius * 0.7;
      this.guideTimer = 4 + Math.random() * 5;
    }

    const dx = guide.targetX - guide.x;
    const dy = guide.targetY - guide.y;
    const distance = Math.hypot(dx, dy);

    guide.moving = distance > 2;

    if (guide.moving) {
      const step = Math.min(distance, 26 * dt);
      guide.x += (dx / distance) * step;
      guide.y += (dy / distance) * step;
      guide.walk = (guide.walk + dt * 1.6) % 1;
    }

    if (this.storyStage !== "done" || this.storyTimer !== null || this.storyQueue.length > 0) {
      return;
    }

    if (playerDistance < 96 && !this.guideVisible) {
      this.guideVisible = true;
      this.callbacks.onGuide(storyLines.freeRoam[this.guideIndex % storyLines.freeRoam.length]);
      this.guideIndex += 1;
    } else if (playerDistance > 150 && this.guideVisible) {
      this.guideVisible = false;
      this.callbacks.onGuide(null);
    }
  }

  private updateParticles(dt: number) {
    if (this.options.reducedMotion || this.scene !== "world") return;

    const region = this.nearestRegion();
    const ambientKind: Particle["kind"] =
      region === "music"
        ? "note"
        : region === "poetry"
          ? "petal"
          : region === "books"
            ? "page"
            : region === "film"
              ? "mote"
              : "mote";

    for (const particle of this.particles) {
      particle.life -= dt;

      if (particle.kind === "firefly") {
        particle.x += Math.sin(this.time * 0.7 + particle.phase) * 14 * dt;
        particle.y += Math.cos(this.time * 0.5 + particle.phase) * 10 * dt;

        if (
          Math.hypot(particle.x - this.player.x, particle.y - this.player.y) > 420 ||
          particle.life <= 0
        ) {
          Object.assign(particle, this.makeParticle("firefly"));
          particle.kind = "firefly";
        }

        continue;
      }

      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;

      if (
        particle.life <= 0 ||
        Math.hypot(particle.x - this.player.x, particle.y - this.player.y) > 420
      ) {
        Object.assign(particle, this.makeParticle(ambientKind));
        particle.kind = ambientKind;
      }
    }
  }

  private nearestRegion() {
    let nearest: { id: "music" | "film" | "books" | "poetry" | "philosophy"; distance: number } = {
      id: "music",
      distance: Infinity,
    };

    for (const region of atlasRegions) {
      const distance = Math.hypot(
        this.player.x - (region.center.x * TILE + TILE / 2),
        this.player.y - (region.center.y * TILE + TILE / 2),
      );

      if (distance < nearest.distance) {
        nearest = { id: region.id, distance };
      }
    }

    return nearest.id;
  }

  private frame = (now: number) => {
    if (!this.running || this.destroyed) return;

    const dt = Math.min((now - this.lastFrame) / 1000, 0.05);
    this.lastFrame = now;
    this.time += dt;

    if (this.inputEnabled) {
      this.movePlayer(dt);
      if (this.scene !== "library") this.updateGuide(dt);
    }

    if (!this.options.reducedMotion) {
      this.hour = (this.hour + dt * (24 / DAY_SECONDS)) % 24;
    }

    const roundedTime = Math.round(this.hour * 60) / 60;

    if (roundedTime !== this.lastTimeReport) {
      this.lastTimeReport = roundedTime;
      this.callbacks.onTime(this.hour);
    }

    if (this.restTarget !== null) {
      this.restFade = Math.min(1, this.restFade + dt * 3);

      if (this.restFade >= 1) {
        this.hour = this.restTarget;
        this.restTarget = null;
        this.lastTimeReport = -1;
      }
    } else if (this.restFade > 0) {
      this.restFade = Math.max(0, this.restFade - dt * 1.6);
    }

    this.updateParticles(dt);
    this.updateNearby();
    this.updateCamera(dt);
    this.render();

    this.raf = requestAnimationFrame(this.frame);
  };

  private updateCamera(dt: number) {
    const targetX = this.player.x;
    const targetY = this.player.y - (this.scene === "arcade" ? 40 : 0);

    if (this.options.reducedMotion) {
      this.camera.x = targetX;
      this.camera.y = targetY;
      return;
    }

    const follow = 1 - Math.exp(-6 * dt);
    this.camera.x += (targetX - this.camera.x) * follow;
    this.camera.y += (targetY - this.camera.y) * follow;
  }

  private render() {
    const { ctx, canvas } = this;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const zoom = this.zoom;
    const mood = hourMood(this.hour);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    if (this.scene === "library") {
      this.renderLibrary(
        width,
        height,
        this.coverZoom(this.interior.w, this.interior.h, width, height),
      );
      return;
    }

    if (this.scene === "arcade") {
      this.renderArcade(width, height, this.coverZoom(this.arcade.w, this.arcade.h, width, height));
      return;
    }

    const worldWidth = WORLD_W * TILE;
    const worldHeight = WORLD_H * TILE;
    const viewWidth = width / zoom;
    const viewHeight = height / zoom;
    const camX = Math.max(0, Math.min(worldWidth - viewWidth, this.camera.x - viewWidth / 2));
    const camY = Math.max(0, Math.min(worldHeight - viewHeight, this.camera.y - viewHeight / 2));

    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate(-camX, -camY);

    ctx.drawImage(this.terrain, 0, 0);
    drawWaterGlints(ctx, this.glints, this.time);

    for (const trail of this.world.trails) {
      drawTrail(ctx, trail, this.time);
    }

    this.drawDynamicWorld(ctx);

    ctx.restore();

    if (mood.alpha > 0.01) {
      ctx.fillStyle = mood.color;
      ctx.globalAlpha = mood.alpha;
      ctx.fillRect(0, 0, width, height);
      ctx.globalAlpha = 1;
    }

    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate(-camX, -camY);
    ctx.globalCompositeOperation = "lighter";
    this.drawGlows(ctx, mood.night);
    ctx.globalCompositeOperation = "source-over";
    ctx.restore();

    this.drawScreenEffects(width, height, mood.night);
    this.drawSceneTags(width, height, zoom, camX, camY);
  }

  private getShadowSprite() {
    if (this.shadowSprite) return this.shadowSprite;

    const canvas = document.createElement("canvas");
    canvas.width = 48;
    canvas.height = 22;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      const gradient = ctx.createRadialGradient(24, 11, 0, 24, 11, 22);
      gradient.addColorStop(0, "rgba(3, 6, 7, 0.5)");
      gradient.addColorStop(0.55, "rgba(3, 6, 7, 0.24)");
      gradient.addColorStop(1, "rgba(3, 6, 7, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.ellipse(24, 11, 23, 10, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    this.shadowSprite = canvas;

    return canvas;
  }

  private drawActorShadow(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.drawImage(this.getShadowSprite(), x - 20, y - 6, 40, 18);
  }

  private getGlowSprite(color: string) {
    const cached = this.glowSprites.get(color);

    if (cached) return cached;

    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 63);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 128, 128);
    }

    this.glowSprites.set(color, canvas);

    return canvas;
  }

  private getDoorGlow(variant: "arcade" | "exit") {
    const cached = this.doorGlowSprites[variant];

    if (cached) return cached;

    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext("2d");

    if (ctx) drawArcadeDoorGlow(ctx, 100, 100, 0.6, 1, variant);
    this.doorGlowSprites[variant] = canvas;

    return canvas;
  }

  private drawDynamicWorld(ctx: CanvasRenderingContext2D) {
    drawCampfire(ctx, this.world.campfire.x, this.world.campfire.y, this.time);
    drawSignpost(ctx, this.world.signpost.x, this.world.signpost.y);

    const night = hourMood(this.hour).night > 0.5;

    for (const spot of this.world.relics) {
      if (spot.relic.night && !night) continue;
      drawRelic(ctx, spot.x, spot.y, this.time, this.found.has(spot.relic.id));
    }

    for (const landmark of this.world.landmarks) {
      const region = regionById.get(landmark.regionId);

      if (!region) continue;
      drawLandmark(ctx, landmark, region, this.time, this.found.has(landmark.entryId));
    }

    this.drawActorShadow(ctx, this.guideState.x, this.guideState.y);
    this.drawActorShadow(ctx, this.player.x, this.player.y);
    drawGuide(ctx, this.guideState.x, this.guideState.y, this.guideState.walk);

    for (const particle of this.particles) {
      if (particle.kind === "firefly") continue;

      const alpha = Math.max(0, Math.min(1, particle.life / particle.maxLife)) * 0.7;

      if (alpha <= 0.02) continue;

      ctx.globalAlpha = alpha;
      ctx.fillStyle =
        particle.kind === "petal"
          ? "#ffd0e2"
          : particle.kind === "page"
            ? "#f0e6cf"
            : particle.kind === "note"
              ? "#b8f4ff"
              : "#e8dfc0";
      ctx.fillRect(Math.round(particle.x), Math.round(particle.y), 2, 2);
      ctx.globalAlpha = 1;
    }

    drawPlayer(ctx, this.player.x, this.player.y, this.player.dir, this.player.walk, "#b85c43");
  }

  private drawGlows(ctx: CanvasRenderingContext2D, night: number) {
    const glow = (x: number, y: number, radius: number, color: string, strength: number) => {
      ctx.globalAlpha = strength;
      ctx.drawImage(this.getGlowSprite(color), x - radius, y - radius, radius * 2, radius * 2);
      ctx.globalAlpha = 1;
    };

    const stone = this.world.story.missionStone;

    glow(stone.x, stone.y - 22, 20, "rgba(255, 217, 138, 0.35)", 0.7);
    const mouse = this.world.story.shrine.mouse;

    glow(mouse.x, mouse.y - 7, 12, "rgba(255, 217, 138, 0.4)", 0.6);

    const worldGlow = this.getDoorGlow("arcade");
    ctx.save();
    ctx.globalAlpha = this.portalActive ? 0.72 : 0.35;
    ctx.globalCompositeOperation = "lighter";
    ctx.drawImage(worldGlow, this.world.story.portal.x - 100, this.world.story.portal.y - 100);
    ctx.restore();

    if (night < 0.05) return;

    glow(this.world.campfire.x, this.world.campfire.y, 90, "rgba(255, 154, 61, 0.45)", night);
    glow(this.world.campfire.x, this.world.campfire.y, 34, "rgba(255, 217, 138, 0.55)", night);

    for (const lantern of this.world.lanterns) {
      glow(lantern.x, lantern.y - 21, 26, "rgba(255, 200, 110, 0.32)", night * 0.8);
      glow(lantern.x, lantern.y - 21, 7, "rgba(255, 235, 190, 0.5)", night * 0.9);
    }

    const library = regionById.get("books");

    if (library) {
      const x = library.center.x * TILE + TILE / 2;
      const y = library.center.y * TILE + TILE / 2;

      glow(x - 20, y - 14, 30, "rgba(255, 207, 113, 0.4)", night);
      glow(x + 20, y - 12, 30, "rgba(255, 207, 113, 0.4)", night);
      glow(x - 26, y + 16, 18, "rgba(255, 207, 113, 0.35)", night);
    }

    for (const landmark of this.world.landmarks) {
      const region = regionById.get(landmark.regionId);

      if (!region) continue;
      glow(landmark.x, landmark.y - 10, 16, `${region.accent}88`, night * 0.7);
    }

    for (const particle of this.particles) {
      if (particle.kind !== "firefly" || particle.life <= 0) continue;

      const alpha = Math.min(1, particle.life / particle.maxLife);
      glow(particle.x, particle.y, 9, "rgba(255, 236, 150, 0.5)", night * 0.8 * alpha);
    }
  }

  private coverZoom(w: number, h: number, width: number, height: number) {
    const roomW = w * TILE;
    const roomH = h * TILE;
    const zoom = Math.max(width / roomW, height / roomH) * 0.94;

    return Math.max(1.85, Math.min(4.2, zoom));
  }

  private drawTag(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    title: string,
    subtitle: string | null,
    accent: string,
  ) {
    ctx.save();
    ctx.font = '600 9px "Geist Mono", ui-monospace, monospace';
    const titleWidth = ctx.measureText(title).width;
    ctx.font = '500 7px "Geist Mono", ui-monospace, monospace';
    const subtitleWidth = subtitle ? ctx.measureText(subtitle).width : 0;
    const width = Math.max(titleWidth, subtitleWidth) + 18;
    const height = subtitle ? 30 : 20;
    const clampedX = Math.max(width / 2 + 4, Math.min(ctx.canvas.clientWidth - width / 2 - 4, x));
    const left = clampedX - width / 2;
    const top = y - height;

    ctx.fillStyle = "rgba(8, 10, 15, 0.82)";
    ctx.beginPath();
    ctx.roundRect(left, top, width, height, 6);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.16)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.roundRect(left + 5, top + 3, width - 10, 1.4, 1);
    ctx.fill();

    ctx.fillStyle = "#f2ecdd";
    ctx.font = '600 9px "Geist Mono", ui-monospace, monospace';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(title, clampedX, top + (subtitle ? 12 : 11));

    if (subtitle) {
      ctx.fillStyle = "rgba(242, 236, 221, 0.52)";
      ctx.font = '500 7px "Geist Mono", ui-monospace, monospace';
      ctx.fillText(subtitle, clampedX, top + 22);
    }

    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.restore();
  }

  private drawSceneTags(width: number, height: number, zoom: number, camX: number, camY: number) {
    const ctx = this.ctx;
    const guide = this.guideState;
    const guideDistance = Math.hypot(this.player.x - guide.x, this.player.y - guide.y);
    const gx = (guide.x - camX) * zoom;
    const gy = (guide.y - camY) * zoom;

    if (guideDistance < 280 && gx > -90 && gx < width + 90 && gy > -50 && gy < height + 90) {
      this.drawTag(ctx, gx, gy - 22, guideName, guideTitle, "#d8e8a8");
    }

    if (this.scene !== "arcade") return;

    let nearest: { x: number; y: number; game: string; year: number; paint: string } | null = null;
    let best = 150;

    for (const spot of this.arcade.statues) {
      const distance = Math.hypot(this.player.x - spot.x, this.player.y - spot.y);

      if (distance < best) {
        best = distance;
        nearest = {
          x: spot.x,
          y: spot.y,
          game: spot.statue.game,
          year: spot.statue.year,
          paint: spot.statue.paint,
        };
      }
    }

    if (nearest) {
      const sx = (nearest.x - camX) * zoom;
      const sy = (nearest.y - camY) * zoom;

      if (sx > -120 && sx < width + 120 && sy > -60 && sy < height + 120) {
        this.drawTag(
          ctx,
          sx,
          sy - 60,
          nearest.game,
          `${nearest.year} · stone inscription`,
          nearest.paint,
        );
      }
    }
  }

  private renderArcade(width: number, height: number, zoom: number) {
    const { ctx } = this;
    const arcade = this.arcade;

    if (!this.arcadeCanvas) this.prepareArcade();

    const arcadeCanvas = this.arcadeCanvas;

    if (!arcadeCanvas) return;

    const worldWidth = arcade.w * TILE;
    const worldHeight = arcade.h * TILE;
    const viewWidth = width / zoom;
    const viewHeight = height / zoom;
    const camX = Math.max(0, Math.min(worldWidth - viewWidth, this.camera.x - viewWidth / 2));
    const camY = Math.max(0, Math.min(worldHeight - viewHeight, this.camera.y - viewHeight / 2));

    ctx.fillStyle = "#07060f";
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate(-camX, -camY);
    ctx.drawImage(arcadeCanvas, 0, 0);

    if (!this.options.reducedMotion) {
      for (let index = 0; index < 44; index += 1) {
        const phase = index * 1.7;
        const x = arcade.floor.x + Math.sin(this.time * 0.26 + phase) * (arcade.floor.rx * 0.82);
        const y =
          arcade.floor.y +
          arcade.floor.ry -
          ((this.time * 13 + index * 41) % (arcade.floor.ry * 2));
        const alpha = 0.18 + 0.28 * (0.5 + 0.5 * Math.sin(this.time * 1.4 + phase));

        ctx.globalAlpha = alpha;
        ctx.fillStyle = index % 3 === 0 ? "#b9a6ff" : "#ffd166";
        ctx.fillRect(x, y, 1.6, 1.6);
      }

      ctx.globalAlpha = 1;
    }

    ctx.save();
    ctx.globalAlpha = 0.13;
    ctx.translate(0, (this.player.y + 1) * 2);
    ctx.scale(1, -1);
    drawPlayer(ctx, this.player.x, this.player.y, this.player.dir, this.player.walk, "#b85c43");
    drawGuide(ctx, this.guideState.x, this.guideState.y, this.guideState.walk);
    ctx.restore();

    this.drawActorShadow(ctx, this.guideState.x, this.guideState.y);
    this.drawActorShadow(ctx, this.player.x, this.player.y);
    drawGuide(ctx, this.guideState.x, this.guideState.y, this.guideState.walk);
    drawPlayer(ctx, this.player.x, this.player.y, this.player.dir, this.player.walk, "#b85c43");

    const exitGlow = this.getDoorGlow("exit");
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.7;
    ctx.drawImage(exitGlow, arcade.portal.x - 100, arcade.portal.y - 100);
    ctx.restore();
    ctx.restore();

    const vignette = ctx.createRadialGradient(
      width * 0.5,
      height * 0.52,
      Math.min(width, height) * 0.32,
      width * 0.5,
      height * 0.52,
      Math.max(width, height) * 0.78,
    );
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(1, "rgba(3, 3, 10, 0.62)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    this.drawSceneTags(width, height, zoom, camX, camY);
  }

  private renderLibrary(width: number, height: number, zoom: number) {
    const { ctx } = this;
    const interior = this.interior;

    if (!this.interiorCanvas) this.interiorCanvas = paintInterior(interior);

    const worldWidth = interior.w * TILE;
    const worldHeight = interior.h * TILE;
    const viewWidth = width / zoom;
    const viewHeight = height / zoom;
    const camX = Math.max(0, Math.min(worldWidth - viewWidth, this.camera.x - viewWidth / 2));
    const camY = Math.max(0, Math.min(worldHeight - viewHeight, this.camera.y - viewHeight / 2));

    ctx.fillStyle = "#171319";
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate(-camX, -camY);
    ctx.drawImage(this.interiorCanvas, 0, 0);
    paintLectern(ctx, interior.relic.x, interior.relic.y + 26);
    drawRelic(
      ctx,
      interior.relic.x,
      interior.relic.y,
      this.time,
      this.found.has(interior.relic.relic.id),
    );
    this.drawActorShadow(ctx, this.player.x, this.player.y);
    drawPlayer(ctx, this.player.x, this.player.y, this.player.dir, this.player.walk, "#b85c43");
    ctx.restore();

    const mood = hourMood(this.hour);
    const gradient = ctx.createRadialGradient(
      width * 0.5,
      height * 0.45,
      Math.min(width, height) * 0.2,
      width * 0.5,
      height * 0.5,
      Math.max(width, height) * 0.75,
    );
    gradient.addColorStop(0, "rgba(255, 200, 120, 0.08)");
    gradient.addColorStop(1, `rgba(8, 6, 12, ${0.55 + mood.night * 0.2})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate(-camX, -camY);
    ctx.globalCompositeOperation = "lighter";
    const gradient2 = ctx.createRadialGradient(
      interior.relic.x,
      interior.relic.y,
      0,
      interior.relic.x,
      interior.relic.y,
      70,
    );
    gradient2.addColorStop(0, "rgba(255, 217, 138, 0.35)");
    gradient2.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gradient2;
    ctx.beginPath();
    ctx.arc(interior.relic.x, interior.relic.y, 70, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
    ctx.restore();
  }

  private drawScreenEffects(width: number, height: number, night: number) {
    const { ctx } = this;
    const vignette = ctx.createRadialGradient(
      width * 0.5,
      height * 0.52,
      Math.min(width, height) * 0.35,
      width * 0.5,
      height * 0.52,
      Math.max(width, height) * 0.78,
    );
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(1, `rgba(4, 6, 14, ${0.3 + night * 0.3})`);
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    const top = ctx.createLinearGradient(0, 0, 0, height * 0.18);
    top.addColorStop(0, "rgba(3, 5, 12, 0.4)");
    top.addColorStop(1, "rgba(3, 5, 12, 0)");
    ctx.fillStyle = top;
    ctx.fillRect(0, 0, width, height * 0.18);

    if (this.restFade > 0) {
      ctx.fillStyle = "rgba(4, 4, 10, 1)";
      ctx.globalAlpha = this.restFade;
      ctx.fillRect(0, 0, width, height);
      ctx.globalAlpha = 1;
    }

    // Daytime birds, drawn in screen space so they read at any zoom.
    if (!this.options.reducedMotion && hourMood(this.hour).night < 0.25) {
      for (const bird of this.birds) {
        if (bird.x > width + 40) {
          bird.x = -40;
          bird.y = 60 + Math.random() * height * 0.3;
        }

        bird.x += bird.speed * 0.016;
        bird.flap += 0.016 * 6;

        const flap = Math.sin(bird.flap) * 2;

        ctx.strokeStyle = "rgba(30, 36, 44, 0.55)";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(bird.x - 4, bird.y + flap);
        ctx.lineTo(bird.x, bird.y);
        ctx.lineTo(bird.x + 4, bird.y + flap);
        ctx.stroke();
      }
    }
  }

  destroy() {
    this.destroyed = true;
    this.clearStoryTimer();
    this.stop();

    if (this.arcadeIdle !== null) {
      const cancel = (window as Window & { cancelIdleCallback?: (handle: number) => void })
        .cancelIdleCallback;

      if (cancel) cancel(this.arcadeIdle);
      else window.clearTimeout(this.arcadeIdle);
      this.arcadeIdle = null;
    }
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
    document.removeEventListener("visibilitychange", this.handleVisibility);
    this.resizeObserver?.disconnect();
    this.intersectionObserver?.disconnect();
  }
}
