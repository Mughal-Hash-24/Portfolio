import {
  atlasEntries,
  atlasRegions,
  atlasRelics,
  libraryRelic,
  worldConfig,
  type AtlasRegion,
  type AtlasRegionId,
  type AtlasRelic,
} from "@/content/atlas";
import {
  arcadeDimension,
  arcadeProps,
  arcadeStatues,
  storyWorld,
  type ArcadeStatue,
} from "@/content/atlas-story";

export const TILE = worldConfig.tileSize;
export const WORLD_W = worldConfig.tilesW;
export const WORLD_H = worldConfig.tilesH;

export const Tile = {
  Grass: 0,
  Path: 1,
  Water: 2,
  Shore: 3,
  Plaza: 4,
  Forest: 5,
} as const;

export const InteriorTile = {
  Floor: 0,
  Wall: 1,
  Shelf: 2,
  Rug: 3,
  Table: 4,
  Door: 5,
} as const;

export type TreeKind = "oak" | "autumn" | "blossom" | "pine";

export type Tree = {
  x: number;
  y: number;
  size: number;
  kind: TreeKind;
};

export type FlowerPatch = {
  x: number;
  y: number;
  color: string;
  size: number;
};

export type Decor = {
  x: number;
  y: number;
  size: number;
  kind: "bush" | "rock" | "mushroom" | "reed";
};

export type Lantern = {
  x: number;
  y: number;
};

export type CircleCollider = { x: number; y: number; r: number };
export type RectCollider = { x: number; y: number; w: number; h: number };
export type Collider = CircleCollider | RectCollider;

export type Landmark = {
  entryId: string;
  regionId: AtlasRegionId;
  x: number;
  y: number;
};

export type RelicSpot = {
  relic: AtlasRelic;
  x: number;
  y: number;
};

export type Trail = {
  from: { x: number; y: number };
  to: { x: number; y: number };
  color: string;
};

export type StoryWorld = {
  pond: { x: number; y: number; rx: number; ry: number };
  missionStone: { x: number; y: number };
  shrine: {
    anchor: { x: number; y: number };
    monitor: { x: number; y: number };
    mouse: { x: number; y: number };
    plaque: { x: number; y: number };
  };
  portal: { x: number; y: number };
  guidePath: Array<{ x: number; y: number }>;
  gatePath: Array<{ x: number; y: number }>;
};

export type ArcadeStatueSpot = {
  statue: ArcadeStatue;
  x: number;
  y: number;
};

export type ArcadeWorld = {
  w: number;
  h: number;
  floor: { x: number; y: number; rx: number; ry: number };
  statues: ArcadeStatueSpot[];
  monument: { x: number; y: number };
  portal: { x: number; y: number };
  spawn: { x: number; y: number };
  exit: { x: number; y: number };
  guide: { x: number; y: number };
  colliders: Collider[];
};

export type World = {
  tiles: Uint8Array;
  trees: Tree[];
  flowers: FlowerPatch[];
  decor: Decor[];
  lanterns: Lantern[];
  landmarks: Landmark[];
  relics: RelicSpot[];
  colliders: Collider[];
  trails: Trail[];
  plazas: Array<{ x: number; y: number; r: number }>;
  structures: AtlasRegion[];
  spawn: { x: number; y: number };
  campfire: { x: number; y: number };
  signpost: { x: number; y: number };
  guide: { x: number; y: number };
  lake: { x: number; y: number; rx: number; ry: number };
  story: StoryWorld;
};

export type Interior = {
  name: string;
  w: number;
  h: number;
  tiles: Uint8Array;
  spawn: { x: number; y: number };
  exit: { x: number; y: number };
  relic: { x: number; y: number; relic: AtlasRelic };
  colliders: Collider[];
};

function createRandom(seed: number) {
  let state = seed;

  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const tileCenter = (x: number, y: number) => ({
  x: x * TILE + TILE / 2,
  y: y * TILE + TILE / 2,
});

function setTile(tiles: Uint8Array, tx: number, ty: number, value: number) {
  if (tx < 0 || ty < 0 || tx >= WORLD_W || ty >= WORLD_H) return;
  tiles[ty * WORLD_W + tx] = value;
}

function getTile(tiles: Uint8Array, tx: number, ty: number) {
  if (tx < 0 || ty < 0 || tx >= WORLD_W || ty >= WORLD_H) return -1;
  return tiles[ty * WORLD_W + tx];
}

function paintDisc(
  tiles: Uint8Array,
  cx: number,
  cy: number,
  radius: number,
  value: number,
  onlyOver?: number[],
) {
  const minX = Math.floor(cx - radius);
  const maxX = Math.ceil(cx + radius);
  const minY = Math.floor(cy - radius);
  const maxY = Math.ceil(cy + radius);

  for (let ty = minY; ty <= maxY; ty += 1) {
    for (let tx = minX; tx <= maxX; tx += 1) {
      const dx = tx - cx;
      const dy = ty - cy;

      if (dx * dx + dy * dy > radius * radius) continue;
      if (onlyOver && !onlyOver.includes(getTile(tiles, tx, ty))) continue;

      setTile(tiles, tx, ty, value);
    }
  }
}

function paintPath(
  tiles: Uint8Array,
  from: { x: number; y: number },
  to: { x: number; y: number },
  random: () => number,
  width = 1.35,
) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.hypot(dx, dy);
  const bend = (random() - 0.5) * Math.min(18, distance * 0.35);
  const normalX = distance === 0 ? 0 : -dy / distance;
  const normalY = distance === 0 ? 0 : dx / distance;
  const control = {
    x: (from.x + to.x) / 2 + normalX * bend,
    y: (from.y + to.y) / 2 + normalY * bend,
  };
  const steps = Math.ceil(distance * 4);

  for (let index = 0; index <= steps; index += 1) {
    const t = index / steps;
    const inverse = 1 - t;
    const x = inverse * inverse * from.x + 2 * inverse * t * control.x + t * t * to.x;
    const y = inverse * inverse * from.y + 2 * inverse * t * control.y + t * t * to.y;

    paintDisc(tiles, x, y, width + random() * 0.35, Tile.Path, [Tile.Grass, Tile.Forest]);
  }
}

function distanceToPath(tiles: Uint8Array, tx: number, ty: number) {
  for (let oy = -1; oy <= 1; oy += 1) {
    for (let ox = -1; ox <= 1; ox += 1) {
      if (getTile(tiles, tx + ox, ty + oy) === Tile.Path) return true;
    }
  }

  return false;
}

function nearestRegion(x: number, y: number) {
  let best = atlasRegions[0];
  let bestDistance = Infinity;

  for (const region of atlasRegions) {
    const distance = Math.hypot(region.center.x - x, region.center.y - y);

    if (distance < bestDistance) {
      bestDistance = distance;
      best = region;
    }
  }

  return { region: best, distance: bestDistance };
}

export function isSolidTile(tiles: Uint8Array, tx: number, ty: number) {
  const tile = getTile(tiles, tx, ty);

  return tile === -1 || tile === Tile.Water;
}

export function buildWorld(): World {
  const random = createRandom(0xa71a5);
  const tiles = new Uint8Array(WORLD_W * WORLD_H);
  const lake = {
    x: worldConfig.lake.x,
    y: worldConfig.lake.y,
    rx: worldConfig.lake.rx,
    ry: worldConfig.lake.ry,
  };

  // Lake and shore.
  for (let ty = 0; ty < WORLD_H; ty += 1) {
    for (let tx = 0; tx < WORLD_W; tx += 1) {
      const dx = (tx - lake.x) / lake.rx;
      const dy = (ty - lake.y) / lake.ry;
      const distance = dx * dx + dy * dy;

      if (distance < 1) setTile(tiles, tx, ty, Tile.Water);
      else if (distance < 1.24) setTile(tiles, tx, ty, Tile.Shore);
    }
  }

  // Pond of Wisdom.
  const pond = storyWorld.pond;

  for (let ty = 0; ty < WORLD_H; ty += 1) {
    for (let tx = 0; tx < WORLD_W; tx += 1) {
      const dx = (tx - pond.x) / pond.rx;
      const dy = (ty - pond.y) / pond.ry;
      const distance = dx * dx + dy * dy;

      if (distance < 1) setTile(tiles, tx, ty, Tile.Water);
      else if (distance < 1.42) setTile(tiles, tx, ty, Tile.Shore);
    }
  }

  // Spawn plaza.
  paintDisc(tiles, 75, 57, 3.1, Tile.Plaza, [Tile.Grass]);

  // Paths: a star from spawn, plus a loop along the lake between poetry and books.
  const spawnPoint = { x: 75, y: 57 };
  const regionPoint = (region: AtlasRegion) => ({ x: region.center.x, y: region.center.y });

  for (const region of atlasRegions) {
    paintPath(tiles, spawnPoint, regionPoint(region), random);
  }

  paintPath(tiles, regionPoint(atlasRegions[3]), { x: 75, y: 86 }, random);
  paintPath(tiles, { x: 75, y: 86 }, regionPoint(atlasRegions[2]), random);

  // The story path: spawn, then Pond of Wisdom to the 2011 shrine.
  paintPath(tiles, { x: storyWorld.spawn.x, y: storyWorld.spawn.y }, { x: 75, y: 57 }, random);
  paintPath(tiles, { x: storyWorld.spawn.x, y: storyWorld.spawn.y }, storyWorld.path[0], random);
  for (let index = 1; index < storyWorld.path.length; index += 1) {
    paintPath(tiles, storyWorld.path[index - 1], storyWorld.path[index], random, 1.15);
  }

  // Shrine clearing and the gate approach.
  paintDisc(tiles, storyWorld.shrine.anchor.x, storyWorld.shrine.anchor.y, 4.4, Tile.Path, [
    Tile.Grass,
    Tile.Forest,
  ]);
  paintPath(tiles, storyWorld.path[storyWorld.path.length - 1], storyWorld.portal, random, 1.1);
  paintDisc(tiles, storyWorld.portal.x, storyWorld.portal.y + 0.5, 2.5, Tile.Plaza, [
    Tile.Grass,
    Tile.Forest,
    Tile.Path,
  ]);

  // Region plazas (the poem garden keeps its grass).
  const plazas: World["plazas"] = [];

  for (const region of atlasRegions) {
    if (region.id === "poetry") continue;
    paintDisc(tiles, region.center.x, region.center.y, 4.1, Tile.Plaza, [Tile.Grass]);
    plazas.push({ ...tileCenter(region.center.x, region.center.y), r: 4.1 * TILE });
  }

  plazas.push({ ...tileCenter(75, 57), r: 3.1 * TILE });

  // Forest floor under the dense tree ring so the border reads as woodland.
  for (let ty = 0; ty < WORLD_H; ty += 1) {
    for (let tx = 0; tx < WORLD_W; tx += 1) {
      const edge = Math.min(tx, ty, WORLD_W - 1 - tx, WORLD_H - 1 - ty);

      if (edge < 4 && getTile(tiles, tx, ty) === Tile.Grass) {
        setTile(tiles, tx, ty, Tile.Forest);
      }
    }
  }

  // Landmarks: entries map to their region's pedestal slots in order.
  const landmarks: Landmark[] = [];

  for (const region of atlasRegions) {
    const regionEntries = atlasEntries.filter((entry) => entry.region === region.id);

    regionEntries.forEach((entry, index) => {
      const slot = region.slots[index];

      if (!slot) return;

      landmarks.push({
        entryId: entry.id,
        regionId: region.id,
        ...tileCenter(slot.x, slot.y),
      });
    });
  }

  const landmarkAt = (entryId: string) =>
    landmarks.find((landmark) => landmark.entryId === entryId);
  const trails: Trail[] = [];
  const paired = new Set<string>();

  for (const entry of atlasEntries) {
    for (const connectionId of entry.connections ?? []) {
      const key = [entry.id, connectionId].sort().join("::");

      if (paired.has(key)) continue;
      paired.add(key);

      const from = landmarkAt(entry.id);
      const to = landmarkAt(connectionId);
      const region = atlasRegions.find((candidate) => candidate.id === entry.region);

      if (from && to && region) {
        trails.push({ from, to, color: region.accent });
      }
    }
  }

  // Relic spots in the open world (the library relic lives inside).
  const relicTiles: Array<{ relic: AtlasRelic; tx: number; ty: number }> = [
    { relic: atlasRelics[0], tx: 24, ty: 34 },
    { relic: atlasRelics[1], tx: 38, ty: 88 },
    { relic: atlasRelics[2], tx: 80, ty: 12 },
  ];
  const relics: RelicSpot[] = relicTiles.map(({ relic, tx, ty }) => ({
    relic,
    ...tileCenter(tx, ty),
  }));

  // Structures and their colliders.
  const colliders: Collider[] = [];
  const structureFor = (region: AtlasRegion) => tileCenter(region.center.x, region.center.y);

  for (const region of atlasRegions) {
    const center = structureFor(region);

    switch (region.structure) {
      case "bandstand":
        colliders.push({ ...center, r: 2.5 * TILE });
        break;
      case "cinema":
        colliders.push({
          x: center.x,
          y: center.y,
          w: 7.4 * TILE,
          h: 5 * TILE,
        });
        break;
      case "library":
        colliders.push({ ...center, r: 3.3 * TILE });
        break;
      case "pergola": {
        const offsetX = 2.6 * TILE;
        const offsetY = 2 * TILE;

        for (const sx of [-1, 1]) {
          for (const sy of [-1, 1]) {
            colliders.push({
              x: center.x + sx * offsetX,
              y: center.y + sy * offsetY,
              r: 6,
            });
          }
        }
        break;
      }
      case "stones": {
        const count = 6;

        for (let index = 0; index < count; index += 1) {
          const angle = (index / count) * Math.PI * 2;
          colliders.push({
            x: center.x + Math.cos(angle) * 2.6 * TILE,
            y: center.y + Math.sin(angle) * 2.4 * TILE,
            r: 9,
          });
        }
        colliders.push({ ...center, r: 11 });
        break;
      }
    }
  }

  for (const landmark of landmarks) {
    colliders.push({ x: landmark.x, y: landmark.y, r: 6 });
  }

  const campfire = tileCenter(worldConfig.campfireTile.x, worldConfig.campfireTile.y);
  const signpost = tileCenter(worldConfig.signpostTile.x, worldConfig.signpostTile.y);

  colliders.push({ ...campfire, r: 9 });
  colliders.push({ ...signpost, r: 5 });

  const missionStone = tileCenter(storyWorld.missionStone.x, storyWorld.missionStone.y);
  const shrine = {
    monitor: tileCenter(storyWorld.shrine.monitor.x, storyWorld.shrine.monitor.y),
    mouse: tileCenter(storyWorld.shrine.mouse.x, storyWorld.shrine.mouse.y),
    plaque: tileCenter(storyWorld.shrine.plaque.x, storyWorld.shrine.plaque.y),
    anchor: tileCenter(storyWorld.shrine.anchor.x, storyWorld.shrine.anchor.y),
  };
  const portal = tileCenter(storyWorld.portal.x, storyWorld.portal.y);

  colliders.push({ ...missionStone, r: 8 });
  colliders.push({ x: shrine.monitor.x, y: shrine.monitor.y, w: 5.4 * TILE, h: 3.6 * TILE });
  colliders.push({ ...shrine.mouse, r: 9 });
  colliders.push({ x: portal.x - 36, y: portal.y - 4, r: 7 });
  colliders.push({ x: portal.x + 36, y: portal.y - 4, r: 7 });

  // Trees: a dense border, region groves, and meadow clusters.
  const trees: Tree[] = [];
  const treeKinds: TreeKind[] = ["oak", "pine"];
  const tryTree = (tx: number, ty: number, kind: TreeKind, force = false) => {
    const worldX = tx * TILE + TILE / 2;
    const worldY = ty * TILE + TILE / 2;
    const tileX = Math.floor(tx);
    const tileY = Math.floor(ty);
    const tile = getTile(tiles, tileX, tileY);

    if (!force && tile !== Tile.Grass && tile !== Tile.Forest) return false;
    if (!force && (distanceToPath(tiles, tileX, tileY) || tile === Tile.Plaza)) return false;

    for (const collider of colliders) {
      if ("r" in collider) {
        if (Math.hypot(collider.x - worldX, collider.y - worldY) < collider.r + 16) return false;
      } else if (
        Math.abs(collider.x - worldX) < collider.w / 2 + 16 &&
        Math.abs(collider.y - worldY) < collider.h / 2 + 16
      ) {
        return false;
      }
    }

    for (const tree of trees) {
      if (Math.hypot(tree.x - worldX, tree.y - worldY) < 25) return false;
    }

    for (const relic of relics) {
      if (Math.hypot(relic.x - worldX, relic.y - worldY) < 34) return false;
    }

    for (const landmark of landmarks) {
      if (Math.hypot(landmark.x - worldX, landmark.y - worldY) < 36) return false;
    }

    const reserved = [missionStone, shrine.monitor, shrine.mouse, shrine.anchor, portal];

    for (const spot of reserved) {
      const clearance = spot === portal ? 112 : 62;

      if (Math.hypot(spot.x - worldX, spot.y - worldY) < clearance) return false;
    }

    const size = 13 + random() * 13;
    trees.push({ x: worldX, y: worldY, size, kind });
    colliders.push({ x: worldX, y: worldY, r: 5 + size * 0.08 });

    return true;
  };

  // Border woodland.
  for (let ty = 2; ty < WORLD_H - 2; ty += 2) {
    for (let tx = 2; tx < WORLD_W - 2; tx += 2) {
      const edge = Math.min(tx, ty, WORLD_W - 1 - tx, WORLD_H - 1 - ty);

      if (edge > 4) continue;
      if (random() < 0.35) continue;

      tryTree(tx + random(), ty + random(), random() < 0.55 ? "pine" : "oak", true);
    }
  }

  // Region groves and meadow clusters.
  for (const region of atlasRegions) {
    for (let index = 0; index < 26; index += 1) {
      const angle = random() * Math.PI * 2;
      const radius = 6 + random() * 9;
      const tx = region.center.x + Math.cos(angle) * radius;
      const ty = region.center.y + Math.sin(angle) * radius;

      tryTree(tx, ty, region.tree);
    }
  }

  for (let index = 0; index < 520; index += 1) {
    const tx = 5 + random() * (WORLD_W - 10);
    const ty = 5 + random() * (WORLD_H - 10);
    const nearest = nearestRegion(tx, ty);

    tryTree(
      tx,
      ty,
      nearest.distance < 16 ? nearest.region.tree : treeKinds[Math.floor(random() * 2)],
    );
  }

  // A grove framing the spawn meadow.
  for (let index = 0; index < 48; index += 1) {
    const angle = random() * Math.PI * 2;
    const radius = 4.8 + random() * 6;
    const tx = 75 + Math.cos(angle) * radius;
    const ty = 57 + Math.sin(angle) * radius * 0.9;

    tryTree(tx, ty, random() < 0.28 ? "autumn" : "oak");
  }

  // Flowers.
  const flowers: FlowerPatch[] = [];

  for (let index = 0; index < 520; index += 1) {
    const tx = 4 + random() * (WORLD_W - 8);
    const ty = 4 + random() * (WORLD_H - 8);
    const tile = getTile(tiles, Math.floor(tx), Math.floor(ty));

    if (tile !== Tile.Grass && tile !== Tile.Forest) continue;

    const nearest = nearestRegion(tx, ty);
    const palette =
      nearest.distance < 18
        ? [nearest.region.soft, nearest.region.accent, "#f4ead2"]
        : ["#f4ead2", "#ffd27a", "#cfe4ff"];

    flowers.push({
      x: tx * TILE + TILE / 2,
      y: ty * TILE + TILE / 2,
      color: palette[Math.floor(random() * palette.length)],
      size: 1 + random() * 1.6,
    });
  }

  // A flower field around the spawn meadow.
  for (let index = 0; index < 200; index += 1) {
    const angle = random() * Math.PI * 2;
    const radius = (3.4 + random() * 8.5) * TILE;
    const x = 75 * TILE + TILE / 2 + Math.cos(angle) * radius;
    const y = 57 * TILE + TILE / 2 + Math.sin(angle) * radius * 0.85;
    const tile = getTile(tiles, Math.floor(x / TILE), Math.floor(y / TILE));

    if (tile !== Tile.Grass && tile !== Tile.Forest) continue;

    const palette = ["#f4ead2", "#ffd27a", "#cfe4ff", "#ffd0e4"];

    flowers.push({
      x,
      y,
      color: palette[Math.floor(random() * palette.length)],
      size: 1 + random() * 1.5,
    });
  }

  // Decor: bushes, rocks, mushrooms, and reeds.
  const decor: Decor[] = [];

  for (let index = 0; index < 220; index += 1) {
    const tx = 4 + random() * (WORLD_W - 8);
    const ty = 4 + random() * (WORLD_H - 8);
    const tile = getTile(tiles, Math.floor(tx), Math.floor(ty));

    if (tile !== Tile.Grass && tile !== Tile.Forest) continue;

    const roll = random();
    const kind: Decor["kind"] = roll < 0.32 ? "bush" : roll < 0.66 ? "rock" : "mushroom";

    decor.push({
      x: tx * TILE + TILE / 2,
      y: ty * TILE + TILE / 2,
      size: 3 + random() * 5,
      kind,
    });
  }

  // Bushes and stones around the spawn meadow.
  for (let index = 0; index < 70; index += 1) {
    const angle = random() * Math.PI * 2;
    const radius = (3.6 + random() * 9) * TILE;
    const x = 75 * TILE + TILE / 2 + Math.cos(angle) * radius;
    const y = 57 * TILE + TILE / 2 + Math.sin(angle) * radius * 0.85;
    const tile = getTile(tiles, Math.floor(x / TILE), Math.floor(y / TILE));

    if (tile !== Tile.Grass && tile !== Tile.Forest) continue;

    const roll = random();
    const kind: Decor["kind"] = roll < 0.45 ? "bush" : roll < 0.8 ? "rock" : "mushroom";

    decor.push({ x, y, size: 3 + random() * 5, kind });
  }

  // Reeds along the lake shore.
  for (let index = 0; index < 140; index += 1) {
    const angle = random() * Math.PI * 2;
    const rx = (lake.rx + 0.5 + random() * 0.6) * TILE;
    const ry = (lake.ry + 0.5 + random() * 0.6) * TILE;
    const x = lake.x * TILE + Math.cos(angle) * rx;
    const y = lake.y * TILE + Math.sin(angle) * ry;

    decor.push({ x, y, size: 4 + random() * 4, kind: "reed" });
  }

  // Lantern posts around the plazas and along the lake trail.
  const lanterns: Lantern[] = [];
  const lanternSpots: Array<[number, number]> = [
    [71.6, 57],
    [78.4, 57],
    [75, 60.4],
    [66.2, 55.2],
    [72.4, 58.4],
    [62.2, 60.6],
    [59.4, 63.6],
    [26.5, 40],
    [33.5, 40],
    [114.6, 40],
    [121.4, 40],
    [114.6, 80],
    [121.4, 80],
    [71.6, 16],
    [78.4, 16],
    [75, 86],
  ];

  for (const [tx, ty] of lanternSpots) {
    lanterns.push(tileCenter(tx, ty));
  }

  return {
    tiles,
    trees,
    flowers,
    decor,
    lanterns,
    landmarks,
    relics,
    colliders,
    trails,
    plazas,
    structures: atlasRegions,
    spawn: tileCenter(storyWorld.spawn.x, storyWorld.spawn.y),
    campfire,
    signpost,
    guide: tileCenter(storyWorld.guide.x, storyWorld.guide.y),
    lake,
    story: {
      pond: { ...tileCenter(pond.x, pond.y), rx: pond.rx * TILE, ry: pond.ry * TILE },
      missionStone,
      shrine: {
        anchor: shrine.anchor,
        monitor: shrine.monitor,
        mouse: shrine.mouse,
        plaque: shrine.plaque,
      },
      portal,
      guidePath: storyWorld.guidePath.map((point) => tileCenter(point.x, point.y)),
      gatePath: storyWorld.gatePath.map((point) => tileCenter(point.x, point.y)),
    },
  };
}

export function buildArcadeDimension(): ArcadeWorld {
  const config = arcadeDimension;
  const center = { x: config.center.x * TILE, y: config.center.y * TILE };
  const statues: ArcadeStatueSpot[] = arcadeStatues.map((statue, index) => {
    const angle = ((120 + (index / (arcadeStatues.length - 1)) * 300) * Math.PI) / 180;

    return {
      statue,
      x: center.x + Math.cos(angle) * config.ringX * TILE,
      y: center.y + Math.sin(angle) * config.ringY * TILE,
    };
  });

  const colliders: Collider[] = statues.map((spot) => ({
    x: spot.x,
    y: spot.y,
    r: 15,
  }));

  colliders.push({ x: center.x, y: center.y, r: 2.5 * TILE });

  for (const prop of arcadeProps) {
    if (!["blocks", "bowling", "crate", "palm"].includes(prop.kind)) continue;

    colliders.push({
      x: prop.x * TILE,
      y: prop.y * TILE,
      r: prop.kind === "bowling" ? 7 : 10,
    });
  }

  const portal = { x: config.exit.x * TILE, y: config.exit.y * TILE };
  colliders.push({ x: portal.x - 24, y: portal.y, r: 7 });
  colliders.push({ x: portal.x + 24, y: portal.y, r: 7 });

  return {
    w: config.w,
    h: config.h,
    floor: {
      x: center.x,
      y: center.y,
      rx: config.radiusX * TILE,
      ry: config.radiusY * TILE,
    },
    statues,
    monument: center,
    portal,
    spawn: { x: config.spawn.x * TILE, y: config.spawn.y * TILE },
    exit: portal,
    guide: { x: config.guide.x * TILE, y: config.guide.y * TILE },
    colliders,
  };
}

const INTERIOR_W = 34;
const INTERIOR_H = 24;

export function buildLibraryInterior(): Interior {
  const tiles = new Uint8Array(INTERIOR_W * INTERIOR_H);

  for (let ty = 0; ty < INTERIOR_H; ty += 1) {
    for (let tx = 0; tx < INTERIOR_W; tx += 1) {
      const edge = tx === 0 || ty === 0 || tx === INTERIOR_W - 1 || ty === INTERIOR_H - 1;

      tiles[ty * INTERIOR_W + tx] = edge ? InteriorTile.Wall : InteriorTile.Floor;
    }
  }

  const put = (tx: number, ty: number, value: number) => {
    tiles[ty * INTERIOR_W + tx] = value;
  };

  // Shelves along the top wall, split by an alcove for the lectern.
  for (let tx = 1; tx < INTERIOR_W - 1; tx += 1) {
    if (tx === 16 || tx === 17) continue;
    put(tx, 1, InteriorTile.Shelf);
  }

  // Side walls of shelves down to the reading level.
  for (let ty = 3; ty < 15; ty += 1) {
    for (const tx of [1, 2, INTERIOR_W - 2, INTERIOR_W - 3]) {
      if (ty >= 7 && ty <= 9 && (tx === 1 || tx === INTERIOR_W - 2)) continue;
      put(tx, ty, InteriorTile.Shelf);
    }
  }

  // Free-standing shelf islands.
  for (const [sx, sy] of [
    [6, 7],
    [7, 7],
    [26, 7],
    [27, 7],
    [6, 15],
    [7, 15],
    [26, 15],
    [27, 15],
  ]) {
    put(sx, sy, InteriorTile.Shelf);
  }

  // Central rug and reading tables.
  for (let ty = 9; ty < 18; ty += 1) {
    for (let tx = 9; tx < 25; tx += 1) {
      put(tx, ty, InteriorTile.Rug);
    }
  }

  for (const [tx, ty] of [
    [12, 11],
    [13, 11],
    [12, 12],
    [13, 12],
    [20, 11],
    [21, 11],
    [20, 12],
    [21, 12],
    [16, 12],
    [17, 12],
  ]) {
    put(tx, ty, InteriorTile.Table);
  }

  // Door in the south wall.
  put(16, INTERIOR_H - 1, InteriorTile.Door);
  put(17, INTERIOR_H - 1, InteriorTile.Door);

  const colliders: Collider[] = [];

  for (let ty = 0; ty < INTERIOR_H; ty += 1) {
    for (let tx = 0; tx < INTERIOR_W; tx += 1) {
      const tile = tiles[ty * INTERIOR_W + tx];

      if (
        tile === InteriorTile.Wall ||
        tile === InteriorTile.Shelf ||
        tile === InteriorTile.Table
      ) {
        colliders.push({
          x: tx * TILE + TILE / 2,
          y: ty * TILE + TILE / 2,
          w: TILE,
          h: TILE,
        });
      }
    }
  }

  return {
    name: "The Long Library",
    w: INTERIOR_W,
    h: INTERIOR_H,
    tiles,
    spawn: { x: 16.5 * TILE, y: 21.6 * TILE },
    exit: { x: 16.5 * TILE, y: 22.4 * TILE },
    relic: { x: 16.5 * TILE, y: 4.6 * TILE, relic: libraryRelic },
    colliders,
  };
}
