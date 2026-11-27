import { atlasRegions, type AtlasRegion, type AtlasRegionId } from "@/content/atlas";
import { arcadeProps } from "@/content/atlas-story";
import { drawArcadeMonument } from "./arcade-monuments";
import {
  TILE,
  Tile,
  WORLD_H,
  WORLD_W,
  type ArcadeWorld,
  type Interior,
  type Landmark,
  type Trail,
  type Tree,
  type World,
} from "./atlas-world";

type Ctx = CanvasRenderingContext2D;

const GRASS = ["#5f8a52", "#5a8450", "#669357", "#628e55"];
const FOREST = ["#4a6f45", "#466a42", "#50794b"];
const PATH = ["#b0925f", "#a98a58", "#b99b6b"];
const WATER = ["#31708a", "#2d6b85", "#357692"];
const SHORE = ["#d2b784", "#cdb17c", "#d8bf90"];
const PLAZA = ["#96907f", "#8f8978", "#9c9685"];
const FLOWER_STEMS = "#3f6b3c";

function hash(x: number, y: number) {
  let value = Math.imul(x, 374761393) + Math.imul(y, 668265263);
  value = Math.imul(value ^ (value >>> 13), 1274126177);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967296;
}

function hashStringSafe(seed: string) {
  let value = 2166136261;

  for (let index = 0; index < seed.length; index += 1) {
    value ^= seed.charCodeAt(index);
    value = Math.imul(value, 16777619);
  }

  let state = value >>> 0;

  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(items: T[], value: number) {
  return items[Math.floor(value * items.length) % items.length];
}

function rect(ctx: Ctx, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(
    Math.round(x),
    Math.round(y),
    Math.max(1, Math.round(w)),
    Math.max(1, Math.round(h)),
  );
}

function circle(ctx: Ctx, x: number, y: number, r: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(ctx: Ctx, x: number, y: number, rx: number, ry: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function poly(ctx: Ctx, points: Array<[number, number]>, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);

  for (let index = 1; index < points.length; index += 1) {
    ctx.lineTo(points[index][0], points[index][1]);
  }

  ctx.closePath();
  ctx.fill();
}

function tileAt(world: World, tx: number, ty: number) {
  if (tx < 0 || ty < 0 || tx >= WORLD_W || ty >= WORLD_H) return -1;
  return world.tiles[ty * WORLD_W + tx];
}

function paintGround(world: World, ctx: Ctx) {
  const size = TILE;

  for (let ty = 0; ty < WORLD_H; ty += 1) {
    for (let tx = 0; tx < WORLD_W; tx += 1) {
      const tile = tileAt(world, tx, ty);
      const noise = hash(tx, ty);
      const x = tx * size;
      const y = ty * size;

      if (tile === Tile.Water) {
        rect(ctx, x, y, size, size, pick(WATER, noise));
        continue;
      }

      if (tile === Tile.Shore) {
        rect(ctx, x, y, size, size, pick(SHORE, noise));
        continue;
      }

      if (tile === Tile.Path) {
        rect(ctx, x, y, size, size, pick(PATH, noise));
        continue;
      }

      if (tile === Tile.Plaza) {
        rect(ctx, x, y, size, size, pick(PLAZA, noise));
        continue;
      }

      const palette = tile === Tile.Forest ? FOREST : GRASS;
      rect(ctx, x, y, size, size, pick(palette, noise));
    }
  }

  // Large soft meadow patches to break up the tile checkerboard.
  for (let index = 0; index < 260; index += 1) {
    const x = hash(index, 91) * WORLD_W * TILE;
    const y = hash(index, 57) * WORLD_H * TILE;
    const radius = 18 + hash(index, 13) * 60;
    const tx = Math.floor(x / TILE);
    const ty = Math.floor(y / TILE);
    const tile = tileAt(world, tx, ty);

    if (tile !== Tile.Grass && tile !== Tile.Forest) continue;

    ctx.globalAlpha = 0.05 + hash(index, 31) * 0.05;
    ellipse(ctx, x, y, radius, radius * 0.7, hash(index, 3) > 0.5 ? "#8fbf74" : "#3f6039");
    ctx.globalAlpha = 1;
  }

  for (let ty = 0; ty < WORLD_H; ty += 1) {
    for (let tx = 0; tx < WORLD_W; tx += 1) {
      const tile = tileAt(world, tx, ty);
      const noise = hash(tx, ty);
      const x = tx * size;
      const y = ty * size;

      if (tile === Tile.Grass || tile === Tile.Forest) {
        if (noise > 0.52) {
          const shade = noise > 0.82 ? "#78a764" : "#4c7042";
          rect(ctx, x + 2 + ((noise * 11) % 12), y + 3 + ((noise * 17) % 11), 2, 1, shade);
        }

        if (noise > 0.88) {
          rect(ctx, x + 4 + noise * 7, y + 5, 1, 3, "#55804a");
          rect(ctx, x + 6 + noise * 7, y + 6, 1, 2, "#6b9a5b");
        }

        continue;
      }

      if (tile === Tile.Path) {
        // Ruts and loose stones on the trail.
        if (noise > 0.4) {
          rect(ctx, x + 2 + ((noise * 9) % 10), y + 4 + ((noise * 13) % 8), 2, 2, "#8d7146");
        }

        if (noise > 0.72) {
          rect(ctx, x + 8 + ((noise * 7) % 6), y + 9, 1.6, 1.6, "#c7ab7c");
        }

        if (noise > 0.9) {
          rect(ctx, x + 3, y + 11, 3, 1, "#5f8043");
        }

        // Dither the trail edges into the grass.
        const upPath = tileAt(world, tx, ty - 1) === Tile.Path;
        const downPath = tileAt(world, tx, ty + 1) === Tile.Path;
        const leftPath = tileAt(world, tx - 1, ty) === Tile.Path;
        const rightPath = tileAt(world, tx + 1, ty) === Tile.Path;
        const edgeColor = "#5f8a52";

        if (!upPath) rect(ctx, x + ((noise * 9) | 0), y, 4, 1, edgeColor);
        if (!downPath) rect(ctx, x + ((noise * 7) | 0), y + size - 1, 5, 1, edgeColor);
        if (!leftPath) rect(ctx, x, y + ((noise * 9) | 0), 1, 4, edgeColor);
        if (!rightPath) rect(ctx, x + size - 1, y + ((noise * 7) | 0), 1, 4, edgeColor);
        continue;
      }

      if (tile === Tile.Shore) {
        if (noise > 0.6) {
          rect(ctx, x + 4 + noise * 8, y + 5, 2, 1, "#b59764");
        }

        continue;
      }
    }
  }

  // Cobble rings on the plazas.
  for (const plaza of world.plazas) {
    const rings = Math.ceil(plaza.r / 15);

    for (let ring = rings; ring >= 0; ring -= 1) {
      const radius = (ring / rings) * plaza.r;
      const count = Math.max(7, Math.round((radius / plaza.r) * 30));

      for (let index = 0; index < count; index += 1) {
        const angle = (index / count) * Math.PI * 2 + ring * 0.7;
        const px = plaza.x + Math.cos(angle) * radius;
        const py = plaza.y + Math.sin(angle) * radius * 0.86;
        const noise = hash(index + ring * 13, ring + 3);
        const w = 5 + noise * 4;
        const h = 4 + noise * 3;

        ctx.fillStyle = noise > 0.5 ? "#a39c8b" : "#8c8473";
        ctx.beginPath();
        ctx.roundRect(px - w / 2, py - h / 2, w, h, 2);
        ctx.fill();
      }
    }

    ellipse(ctx, plaza.x, plaza.y, plaza.r, plaza.r * 0.9, "rgba(0,0,0,0.06)");
  }

  // Shore foam where water meets land.
  for (let ty = 0; ty < WORLD_H; ty += 1) {
    for (let tx = 0; tx < WORLD_W; tx += 1) {
      if (tileAt(world, tx, ty) !== Tile.Water) continue;

      const nearLand =
        tileAt(world, tx + 1, ty) === Tile.Shore ||
        tileAt(world, tx - 1, ty) === Tile.Shore ||
        tileAt(world, tx, ty + 1) === Tile.Shore ||
        tileAt(world, tx, ty - 1) === Tile.Shore;

      if (!nearLand) continue;

      const noise = hash(tx + 11, ty + 5);
      rect(
        ctx,
        tx * size + noise * 8,
        ty * size + ((noise * 17) % 12),
        5 + noise * 5,
        1,
        "rgba(220, 240, 245, 0.35)",
      );
    }
  }
}

function paintDecor(ctx: Ctx, world: World) {
  for (const item of world.decor) {
    const { x, y, size, kind } = item;
    const noise = hash(Math.round(x), Math.round(y));

    if (kind === "bush") {
      ellipse(ctx, x + 1, y + 3, size * 1.2, size * 0.5, "rgba(20, 30, 20, 0.25)");
      circle(ctx, x - size * 0.4, y, size * 0.62, "#3f6339");
      circle(ctx, x + size * 0.35, y + 1, size * 0.6, "#456a3e");
      circle(ctx, x, y - size * 0.35, size * 0.62, "#52794a");
      circle(ctx, x - size * 0.2, y - size * 0.45, size * 0.28, "#669158");
      if (noise > 0.6) {
        rect(ctx, x + size * 0.3, y - size * 0.2, 1.4, 1.4, "#f4ead2");
      }
      continue;
    }

    if (kind === "rock") {
      ellipse(ctx, x + 1, y + size * 0.5, size, size * 0.38, "rgba(20, 25, 20, 0.22)");
      ctx.fillStyle = noise > 0.5 ? "#8d8b83" : "#7d7a72";
      ctx.beginPath();
      ctx.roundRect(x - size * 0.8, y - size * 0.55, size * 1.6, size * 1.1, size * 0.45);
      ctx.fill();
      rect(ctx, x - size * 0.55, y - size * 0.4, size * 0.6, size * 0.25, "#a3a096");
      continue;
    }

    if (kind === "mushroom") {
      rect(ctx, x - 0.8, y - 1, 1.6, size * 0.7, "#e8dcc0");
      ctx.fillStyle = noise > 0.5 ? "#c9534a" : "#d9853f";
      ctx.beginPath();
      ctx.ellipse(x, y - 1, size * 0.7, size * 0.38, 0, Math.PI, 0);
      ctx.fill();
      rect(ctx, x - size * 0.25, y - size * 0.42, 1, 1, "#f4ead2");
      continue;
    }

    // Reeds.
    ctx.strokeStyle = noise > 0.5 ? "#5f7a43" : "#6f8a4d";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y + 3);
    ctx.lineTo(x + (noise - 0.5) * 3, y - size);
    ctx.moveTo(x + 2, y + 3);
    ctx.lineTo(x + 2 + (noise - 0.5) * 4, y - size * 0.8);
    ctx.stroke();
  }
}

function paintLantern(ctx: Ctx, x: number, y: number) {
  ellipse(ctx, x + 1, y + 2, 5, 2, "rgba(0,0,0,0.25)");
  rect(ctx, x - 1.2, y - 24, 2.4, 26, "#5a4630");
  rect(ctx, x - 1.2, y - 24, 0.8, 26, "#755c3f");
  rect(ctx, x - 5, y - 27, 10, 2, "#4a3826");
  rect(ctx, x - 3.6, y - 25, 7.2, 7, "#3d2f22");
  rect(ctx, x - 2.4, y - 23.6, 4.8, 4.4, "#ffd98a");
  rect(ctx, x - 1, y - 22.6, 2, 2.4, "#fff1c9");
}

function paintFlowers(world: World, ctx: Ctx) {
  for (const flower of world.flowers) {
    rect(ctx, flower.x - 0.5, flower.y + 1, 1, 2, FLOWER_STEMS);
    rect(
      ctx,
      flower.x - flower.size / 2,
      flower.y - flower.size / 2,
      flower.size,
      flower.size,
      flower.color,
    );
    rect(ctx, flower.x - 1, flower.y - 1, 1.2, 1.2, "rgba(255,255,255,0.7)");
  }
}

function paintTree(ctx: Ctx, tree: Tree) {
  const { x, y, size, kind } = tree;

  ellipse(ctx, x + size * 0.14, y + size * 0.3, size * 0.56, size * 0.22, "rgba(20, 30, 20, 0.3)");
  rect(ctx, x - 2.2, y - size * 0.1, 4.4, size * 0.55, "#5d4128");
  rect(ctx, x - 2.2, y - size * 0.1, 1.4, size * 0.55, "#77543a");
  rect(ctx, x - 3.6, y + size * 0.32, 2, 3, "#4a3422");
  rect(ctx, x + 1.6, y + size * 0.32, 2, 3, "#4a3422");

  if (kind === "pine") {
    const layers = 4;

    for (let layer = 0; layer < layers; layer += 1) {
      const t = layer / layers;
      const w = size * (1.05 - t * 0.26);
      const top = y - size * 0.95 + layer * size * 0.3;
      const base = top + size * 0.52;

      poly(
        ctx,
        [
          [x - w / 2, base],
          [x, top],
          [x + w / 2, base],
        ],
        layer === 0 ? "#2f5137" : layer === 1 ? "#385c3e" : layer === 2 ? "#426a47" : "#4c7750",
      );
      poly(
        ctx,
        [
          [x - w / 2, base],
          [x - w / 4, base - size * 0.2],
          [x, top],
          [x - w / 8, base],
        ],
        "rgba(255,255,255,0.06)",
      );
    }

    return;
  }

  const palettes: Record<string, [string, string, string, string]> = {
    oak: ["#3c6038", "#496f43", "#588350", "#6a9a5e"],
    autumn: ["#7d4d20", "#9c6226", "#c07c30", "#dfa044"],
    blossom: ["#b06a88", "#c77b9a", "#e29ab5", "#f6c4d8"],
  };
  const [dark, mid, light, highlight] = palettes[kind] ?? palettes.oak;

  // Canopy: a clump of blobs with a dark underside and a lit top-left.
  ellipse(ctx, x - size * 0.18, y - size * 0.4, size * 0.52, size * 0.42, dark);
  ellipse(ctx, x + size * 0.22, y - size * 0.34, size * 0.44, size * 0.36, dark);
  ellipse(ctx, x, y - size * 0.6, size * 0.46, size * 0.36, dark);
  ellipse(ctx, x - size * 0.3, y - size * 0.56, size * 0.34, size * 0.3, mid);
  ellipse(ctx, x + size * 0.18, y - size * 0.52, size * 0.32, size * 0.27, mid);
  ellipse(ctx, x - size * 0.02, y - size * 0.74, size * 0.3, size * 0.24, mid);
  ellipse(ctx, x - size * 0.26, y - size * 0.68, size * 0.2, size * 0.15, light);
  ellipse(ctx, x + size * 0.08, y - size * 0.66, size * 0.18, size * 0.14, highlight);
  ellipse(ctx, x + size * 0.34, y - size * 0.44, size * 0.16, size * 0.13, light);
  ellipse(ctx, x + size * 0.02, y - size * 0.28, size * 0.34, size * 0.16, dark);

  // Leaf specks and a soft rim light.
  for (let index = 0; index < 9; index += 1) {
    const angle = hash(x + index, y - index) * Math.PI * 2;
    const radius = size * (0.18 + hash(index, 7) * 0.42);
    const px = x + Math.cos(angle) * radius;
    const py = y - size * 0.48 + Math.sin(angle) * radius * 0.72;

    rect(ctx, px, py, 1.6, 1.6, index % 3 === 0 ? highlight : light);
  }

  ctx.strokeStyle = "rgba(0,0,0,0.18)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.44, size * 0.62, Math.PI * 0.12, Math.PI * 0.8);
  ctx.stroke();
}

function paintBandstand(ctx: Ctx, x: number, y: number) {
  ellipse(ctx, x + 4, y + 10, 42, 13, "rgba(20,30,20,0.28)");
  circle(ctx, x, y, 36, "#5f4530");
  circle(ctx, x, y - 2, 32, "#7c5a3a");

  // Radial plank lines on the platform.
  ctx.strokeStyle = "rgba(60, 40, 25, 0.5)";
  ctx.lineWidth = 1;

  for (let index = 0; index < 10; index += 1) {
    const angle = (index / 10) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(x, y - 2);
    ctx.lineTo(x + Math.cos(angle) * 32, y - 2 + Math.sin(angle) * 26);
    ctx.stroke();
  }

  for (let index = 0; index < 6; index += 1) {
    const angle = (index / 6) * Math.PI * 2;
    const px = x + Math.cos(angle) * 24;
    const py = y - 4 + Math.sin(angle) * 20;

    rect(ctx, px - 2, py - 24, 4, 26, "#553c2a");
    rect(ctx, px - 2, py - 24, 1.4, 26, "#6f5036");
  }

  ctx.strokeStyle = "#4f3826";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y - 12, 26, Math.PI * 1.02, Math.PI * 1.98);
  ctx.stroke();

  // Octagonal canopy with alternating segments.
  const roofRadius = 42;

  for (let index = 0; index < 8; index += 1) {
    const a0 = (index / 8) * Math.PI * 2 - Math.PI / 2;
    const a1 = ((index + 1) / 8) * Math.PI * 2 - Math.PI / 2;
    poly(
      ctx,
      [
        [x, y - 38],
        [x + Math.cos(a0) * roofRadius, y - 38 + Math.sin(a0) * roofRadius * 0.72],
        [x + Math.cos(a1) * roofRadius, y - 38 + Math.sin(a1) * roofRadius * 0.72],
      ],
      index % 2 === 0 ? "#2f6b62" : "#3a7d72",
    );
  }

  ctx.strokeStyle = "#1f4a45";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(x, y - 38, roofRadius, roofRadius * 0.72, 0, 0, Math.PI * 2);
  ctx.stroke();
  circle(ctx, x, y - 38, 9, "#2f6b62");
  circle(ctx, x, y - 41, 5, "#4b8a7c");
  circle(ctx, x, y - 54, 3.4, "#d9c47a");
  circle(ctx, x, y - 56, 1.8, "#ffe9a8");

  // Hanging lanterns at the roof edge.
  for (const side of [-1, 1]) {
    rect(ctx, x + side * 26 - 0.5, y - 34, 1, 10, "#3d2c1e");
    circle(ctx, x + side * 26, y - 23, 2.4, "#ffd98a");
  }
}

function paintCinema(ctx: Ctx, x: number, y: number) {
  ellipse(ctx, x + 4, y + 44, 78, 20, "rgba(20,20,30,0.28)");
  rect(ctx, x - 62, y - 40, 124, 82, "#343050");
  rect(ctx, x - 62, y - 40, 124, 6, "#47436a");
  rect(ctx, x - 54, y - 30, 108, 16, "#221f33");

  // Marquee bulbs.
  for (let index = 0; index < 10; index += 1) {
    circle(ctx, x - 48 + index * 10.6, y - 22, 1.8, "#ffe08a");
  }

  // Facade panels and doors.
  rect(ctx, x - 50, y - 8, 34, 34, "#2b2740");
  rect(ctx, x + 16, y - 8, 34, 34, "#2b2740");
  rect(ctx, x - 14, y - 10, 28, 46, "#1b1828");
  rect(ctx, x - 12, y - 8, 10, 42, "#2a2438");
  rect(ctx, x + 2, y - 8, 10, 42, "#2a2438");

  // Poster frames.
  for (const side of [-1, 1]) {
    rect(ctx, x + side * 33 - 10, y + 2, 20, 24, "#5b4a35");
    rect(ctx, x + side * 33 - 8, y + 4, 16, 20, side === -1 ? "#c96b4a" : "#7ee8ff");
    rect(ctx, x + side * 33 - 4, y + 8, 8, 10, "rgba(255,255,255,0.28)");
  }

  // Awning stripes.
  for (let index = 0; index < 8; index += 1) {
    rect(ctx, x - 56 + index * 14, y - 52, 12, 10, index % 2 === 0 ? "#c96b4a" : "#e8d8b8");
  }

  // Film reel emblem above the marquee.
  circle(ctx, x, y - 62, 8, "#1d1a2b");
  circle(ctx, x, y - 62, 5.5, "#cfd6e6");
  circle(ctx, x, y - 62, 1.6, "#1d1a2b");

  for (let index = 0; index < 4; index += 1) {
    const angle = (index / 4) * Math.PI * 2;
    circle(ctx, x + Math.cos(angle) * 3.2, y - 62 + Math.sin(angle) * 3.2, 1.1, "#1d1a2b");
  }
}

function paintLibrary(ctx: Ctx, x: number, y: number) {
  ellipse(ctx, x + 5, y + 46, 66, 20, "rgba(20,25,20,0.3)");
  circle(ctx, x, y - 6, 48, "#6e6a5e");
  circle(ctx, x, y - 10, 44, "#807b6d");
  circle(ctx, x - 10, y - 22, 18, "#918c7d");

  // Battlements.
  for (let index = 0; index < 10; index += 1) {
    const angle = (index / 10) * Math.PI * 2;

    rect(ctx, x + Math.cos(angle) * 38 - 5, y - 10 + Math.sin(angle) * 34 - 4, 10, 9, "#8f8a7a");
    rect(ctx, x + Math.cos(angle) * 38 - 5, y - 10 + Math.sin(angle) * 34 - 4, 10, 2, "#a29c8b");
  }

  // Windows and door.
  for (const [wx, wy] of [
    [-20, -20],
    [18, -18],
    [-6, 12],
    [24, 6],
  ]) {
    rect(ctx, x + wx, y + wy, 7, 11, "#3b3830");
    rect(ctx, x + wx + 1, y + wy + 1, 5, 9, "#ffd98a");
    rect(ctx, x + wx + 3, y + wy + 1, 1, 9, "#3b3830");
  }

  rect(ctx, x - 33, y + 4, 14, 22, "#3b3830");
  rect(ctx, x - 31, y + 6, 10, 20, "#5a3f28");
  circle(ctx, x - 22, y + 16, 1, "#e8c97a");

  // Ivy.
  for (let index = 0; index < 8; index += 1) {
    const angle = Math.PI * 0.6 + index * 0.16;
    circle(ctx, x + Math.cos(angle) * 40, y - 6 + Math.sin(angle) * 36, 2 + (index % 3), "#4f7a45");
  }
}

function paintPergola(ctx: Ctx, x: number, y: number) {
  ellipse(ctx, x, y + 26, 52, 14, "rgba(40,25,30,0.22)");

  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      rect(ctx, x + sx * 38 - 2, y + sy * 28 - 26, 5, 34, "#6d4b2f");
      rect(ctx, x + sx * 38 - 2, y + sy * 28 - 26, 1.6, 34, "#8a6238");
    }
  }

  rect(ctx, x - 44, y - 30, 88, 4, "#7a5533");
  rect(ctx, x - 40, y - 36, 80, 4, "#8a6238");

  for (let index = 0; index < 7; index += 1) {
    const px = x - 36 + index * 12;
    rect(ctx, px, y - 28, 2, 26 + (index % 3) * 4, "#4f7a45");
    circle(ctx, px + 1, y - 2 + (index % 3) * 4, 2.4, "#e59ab8");
    circle(ctx, px + 4, y - 10 + (index % 2) * 4, 2, "#ffd0e2");
  }

  circle(ctx, x, y + 6, 16, "#4f7a45");
  circle(ctx, x, y + 4, 12, "#628f55");

  for (let index = 0; index < 10; index += 1) {
    const angle = (index / 10) * Math.PI * 2;
    circle(
      ctx,
      x + Math.cos(angle) * 10,
      y + 4 + Math.sin(angle) * 8,
      1.8,
      index % 2 ? "#ffd0e2" : "#ff9ec9",
    );
  }
}

function paintStones(ctx: Ctx, x: number, y: number) {
  ellipse(ctx, x + 3, y + 34, 62, 18, "rgba(20,25,35,0.28)");
  ellipse(ctx, x, y + 4, 54, 30, "#7b7f86");
  ellipse(ctx, x, y + 2, 44, 24, "#8b8f96");

  for (let index = 0; index < 6; index += 1) {
    const angle = (index / 6) * Math.PI * 2 + 0.4;
    const px = x + Math.cos(angle) * 42;
    const py = y + Math.sin(angle) * 24;
    const h = 24 + (index % 3) * 6;

    ctx.fillStyle = "#6e727a";
    ctx.beginPath();
    ctx.roundRect(px - 6, py - h / 2 - 4, 12, h, 3);
    ctx.fill();
    rect(ctx, px - 6, py - h / 2 - 4, 4, h, "#7f838b");
    rect(ctx, px - 1, py - 6, 2, 7, "#b9a6ff");
    rect(ctx, px + 2, py - 2, 2, 4, "#b9a6ff");
  }

  rect(ctx, x - 9, y - 2, 18, 12, "#6e727a");
  rect(ctx, x - 7, y - 4, 14, 6, "#8b8f96");
  rect(ctx, x - 2, y - 8, 4, 5, "#b9a6ff");
}

function paintStructure(ctx: Ctx, region: AtlasRegion) {
  const x = region.center.x * TILE + TILE / 2;
  const y = region.center.y * TILE + TILE / 2;

  switch (region.structure) {
    case "bandstand":
      paintBandstand(ctx, x, y);
      break;
    case "cinema":
      paintCinema(ctx, x, y);
      break;
    case "library":
      paintLibrary(ctx, x, y);
      break;
    case "pergola":
      paintPergola(ctx, x, y);
      break;
    case "stones":
      paintStones(ctx, x, y);
      break;
  }
}

function paintPond(ctx: Ctx, world: World) {
  const pond = world.story.pond;

  // Depth ring and a soft highlight inside the water.
  ctx.strokeStyle = "rgba(22, 54, 66, 0.45)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(pond.x, pond.y, pond.rx - 5, pond.ry - 4, 0, 0, Math.PI * 2);
  ctx.stroke();
  ellipse(ctx, pond.x - 7, pond.y - 6, pond.rx * 0.55, pond.ry * 0.4, "rgba(214, 241, 247, 0.07)");

  // Irregular stone rim.
  for (let index = 0; index < 30; index += 1) {
    const angle = (index / 30) * Math.PI * 2;
    const x = pond.x + Math.cos(angle) * (pond.rx + 8);
    const y = pond.y + Math.sin(angle) * (pond.ry + 7);
    const width = 6 + (index % 3) * 1.6;

    ellipse(ctx, x, y, width, width * 0.62, "rgba(0, 0, 0, 0.24)");
    ctx.fillStyle = index % 2 === 0 ? "#8f887a" : "#7c7568";
    ctx.beginPath();
    ctx.ellipse(x, y - 1, width, width * 0.56, 0, 0, Math.PI * 2);
    ctx.fill();
    ellipse(ctx, x - width * 0.25, y - width * 0.3, width * 0.42, width * 0.18, "#a49c8b");
  }

  // A small wooden dock on the south shore.
  const dockX = pond.x + 2;
  const dockTop = pond.y + pond.ry - 8;

  rect(ctx, dockX + 7, dockTop + 22, 3, 12, "#5d3f25");
  rect(ctx, dockX - 16, dockTop + 22, 3, 12, "#5d3f25");

  for (let index = 0; index < 6; index += 1) {
    rect(ctx, dockX - 17, dockTop + index * 5.4, 34, 4.2, index % 2 === 0 ? "#8a6136" : "#7c562f");
    rect(ctx, dockX - 17, dockTop + index * 5.4, 34, 1, "#a8794a");
  }

  for (const side of [-1, 1]) {
    rect(ctx, dockX + side * 16, dockTop - 2, 2.4, 34, "#5d3f25");
    circle(ctx, dockX + side * 16 + 1.2, dockTop - 3, 2.2, "#8f887a");
  }

  // Lilies and flowers.
  for (const [lx, ly, flower] of [
    [-2.2, -0.9, true],
    [1.4, 0.9, true],
    [0.4, -1.4, false],
    [-1.1, 1.3, false],
    [2.3, -0.2, false],
    [-2.6, 0.4, false],
  ] as Array<[number, number, boolean]>) {
    const x = pond.x + lx * pond.ry;
    const y = pond.y + ly * pond.ry;

    ellipse(ctx, x, y, 5.8, 3.4, "#4f7a45");
    rect(ctx, x - 1.2, y - 0.5, 2.4, 1, "#3d6338");

    if (flower) {
      circle(ctx, x + 1.6, y - 1.8, 1.9, "#ffc2da");
      circle(ctx, x + 1.6, y - 1.8, 0.8, "#ffe8f1");
    }
  }

  // Two koi flashes.
  ctx.globalAlpha = 0.75;
  ellipse(ctx, pond.x + 12, pond.y + 6, 4.4, 1.6, "#e88a4a");
  ellipse(ctx, pond.x - 15, pond.y - 8, 3.8, 1.3, "#f2e6c9");
  ctx.globalAlpha = 1;

  // Cattails and reeds along the rim, away from the dock.
  for (let index = 0; index < 16; index += 1) {
    const angle = (index / 16) * Math.PI * 2 + 0.28;

    if (Math.sin(angle) > 0.72) continue;

    const x = pond.x + Math.cos(angle) * (pond.rx + 5);
    const y = pond.y + Math.sin(angle) * (pond.ry + 4);
    const height = 8 + (index % 4) * 2.4;

    ctx.strokeStyle = "#5f7a43";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x, y + 2);
    ctx.quadraticCurveTo(x + 1, y - height * 0.6, x + 2, y - height);
    ctx.stroke();

    if (index % 3 === 0) {
      rect(ctx, x + 1, y - height - 3, 2.2, 4.4, "#7a4a2c");
    }
  }
}

function paintMissionStone(ctx: Ctx, x: number, y: number) {
  ellipse(ctx, x + 1, y + 9, 14, 5, "rgba(0,0,0,0.28)");
  rect(ctx, x - 12, y + 2, 24, 7, "#6e665a");
  rect(ctx, x - 12, y + 2, 24, 1.8, "#8a8172");

  ctx.fillStyle = "#8f8676";
  ctx.beginPath();
  ctx.moveTo(x - 10, y + 4);
  ctx.lineTo(x - 11, y - 30);
  ctx.quadraticCurveTo(x, y - 38, x + 11, y - 30);
  ctx.lineTo(x + 10, y + 4);
  ctx.closePath();
  ctx.fill();
  rect(ctx, x - 8, y - 28, 16, 32, "#a59b89");
  rect(ctx, x - 8, y - 28, 16, 2.2, "#b8ad99");

  // Lotus carving.
  circle(ctx, x, y - 21, 2.2, "#d9b06a");
  for (const [ox, oy] of [
    [-4.4, -1.4],
    [4.4, -1.4],
    [-2.6, -4],
    [2.6, -4],
    [0, -5.4],
  ] as Array<[number, number]>) {
    ellipse(ctx, x + ox, y - 21 + oy, 2.6, 1.4, "#c8a05c");
  }

  for (let index = 0; index < 4; index += 1) {
    rect(ctx, x - 4.6, y - 12 + index * 3.6, index % 2 === 0 ? 9.2 : 6.4, 0.9, "#d9b06a");
  }

  circle(ctx, x, y - 34, 1.8, "#ffd98a");
}

function paintShrine(ctx: Ctx, world: World) {
  const { monitor, mouse, plaque } = world.story.shrine;

  // Plinth and stone keyboard.
  rect(ctx, monitor.x - 44, monitor.y + 20, 88, 12, "#6e665a");
  rect(ctx, monitor.x - 44, monitor.y + 20, 88, 2, "#8a8172");
  rect(ctx, monitor.x - 30, monitor.y + 34, 60, 12, "#7a7264");
  rect(ctx, monitor.x - 30, monitor.y + 34, 60, 2, "#948b7a");

  for (let row = 0; row < 2; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      rect(ctx, monitor.x - 26 + col * 6.6, monitor.y + 37 + row * 4.4, 4.6, 2.8, "#5f584c");
    }
  }

  // CRT body with a browser window.
  ctx.fillStyle = "#5a564e";
  ctx.beginPath();
  ctx.roundRect(monitor.x - 40, monitor.y - 44, 80, 66, 5);
  ctx.fill();
  rect(ctx, monitor.x - 40, monitor.y - 44, 80, 3, "#7a7468");
  rect(ctx, monitor.x - 40, monitor.y - 44, 3, 66, "#6f6a5f");
  rect(ctx, monitor.x - 36, monitor.y - 40, 72, 56, "#23222a");

  // Screen: sky, dune, and the little uphill cart.
  rect(ctx, monitor.x - 32, monitor.y - 36, 64, 34, "#7ec8e8");
  rect(ctx, monitor.x - 32, monitor.y - 22, 64, 20, "#e0a34a");
  ctx.fillStyle = "#f2c56b";
  ctx.beginPath();
  ctx.moveTo(monitor.x - 32, monitor.y - 10);
  ctx.quadraticCurveTo(monitor.x, monitor.y - 28, monitor.x + 32, monitor.y - 6);
  ctx.lineTo(monitor.x + 32, monitor.y - 2);
  ctx.lineTo(monitor.x - 32, monitor.y - 2);
  ctx.closePath();
  ctx.fill();
  rect(ctx, monitor.x - 10, monitor.y - 22, 18, 7, "#c96b4a");
  rect(ctx, monitor.x - 7, monitor.y - 25, 12, 5, "#e8d8b8");
  circle(ctx, monitor.x - 8, monitor.y - 15, 2.4, "#3b2a22");
  circle(ctx, monitor.x + 6, monitor.y - 15, 2.4, "#3b2a22");
  rect(ctx, monitor.x - 26, monitor.y - 33, 20, 1.6, "#f0f6fa");
  rect(ctx, monitor.x - 26, monitor.y - 30, 12, 1.2, "#dcebf2");

  // Browser chrome with three dots and an address line.
  rect(ctx, monitor.x - 36, monitor.y - 40, 72, 6, "#3a3844");
  circle(ctx, monitor.x - 32, monitor.y - 37, 1.2, "#e85d5d");
  circle(ctx, monitor.x - 28, monitor.y - 37, 1.2, "#ffd166");
  circle(ctx, monitor.x - 24, monitor.y - 37, 1.2, "#7cc36a");
  rect(ctx, monitor.x - 18, monitor.y - 38, 34, 2.2, "#23222a");
  rect(ctx, monitor.x - 16, monitor.y - 37.4, 18, 1, "#9aa4b0");

  // Stone mouse with a gold middle button, and a carved cursor beside it.
  ellipse(ctx, mouse.x + 1, mouse.y + 5, 13, 4.4, "rgba(0,0,0,0.25)");
  ctx.fillStyle = "#a49c8b";
  ctx.beginPath();
  ctx.roundRect(mouse.x - 6, mouse.y - 14, 12, 18, 5);
  ctx.fill();
  rect(ctx, mouse.x - 5.2, mouse.y - 13, 2, 14, "rgba(255,255,255,0.14)");
  rect(ctx, mouse.x + 4.4, mouse.y - 12, 1.6, 13, "rgba(0,0,0,0.12)");
  rect(ctx, mouse.x - 6, mouse.y - 7.4, 12, 0.9, "#6e665a");
  rect(ctx, mouse.x - 1.6, mouse.y - 10, 3.2, 4.4, "#d9b06a");
  rect(ctx, mouse.x - 0.8, mouse.y - 9.2, 1.6, 2.8, "#fff1c9");
  circle(ctx, mouse.x, mouse.y - 15, 1.2, "#6e665a");

  ctx.strokeStyle = "#6e665a";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(mouse.x, mouse.y - 15);
  ctx.quadraticCurveTo(mouse.x + 12, mouse.y - 27, monitor.x + 30, monitor.y + 22);
  ctx.stroke();

  // Carved cursor arrow on the ground, pointing at the mouse.
  const cursorX = mouse.x - 17;
  const cursorY = mouse.y + 1;

  ctx.fillStyle = "#b3aa98";
  ctx.beginPath();
  ctx.moveTo(cursorX, cursorY - 6);
  ctx.lineTo(cursorX + 8, cursorY + 5);
  ctx.lineTo(cursorX + 4.6, cursorY + 5);
  ctx.lineTo(cursorX + 6.6, cursorY + 10);
  ctx.lineTo(cursorX + 4, cursorY + 11);
  ctx.lineTo(cursorX + 2, cursorY + 6);
  ctx.lineTo(cursorX - 0.6, cursorY + 8.6);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#6e665a";
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // Plaque: 2011.
  ellipse(ctx, plaque.x + 1, plaque.y + 5, 12, 4, "rgba(0,0,0,0.24)");
  rect(ctx, plaque.x - 13, plaque.y - 4, 26, 10, "#5f584c");
  rect(ctx, plaque.x - 13, plaque.y - 4, 26, 1.6, "#7a7264");
  ctx.fillStyle = "#e8d9a8";
  ctx.font = '600 8px "Geist Mono", ui-monospace, monospace';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("2011", plaque.x, plaque.y + 1.4);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  // Ramp rails.
  for (const [rx, ry] of [
    [58.2, 65.4],
    [59.2, 64.4],
  ]) {
    const x = rx * TILE;
    const y = ry * TILE;

    rect(ctx, x - 1, y - 14, 2, 16, "#6d4b2f");
    circle(ctx, x, y - 15, 2, "#8f887a");
  }
}

const ARCADE_SIGN = {
  halfWidth: 43,
  doorHalf: 17,
  doorTop: -48,
  base: 16,
  marqueeTop: -78,
  marqueeBottom: -50,
};

function paintArcadeFrontage(ctx: Ctx, x: number, y: number) {
  const sign = ARCADE_SIGN;

  // Stone step and the apron.
  ellipse(ctx, x + 2, y + 25, 52, 12, "rgba(0,0,0,0.32)");
  rect(ctx, x - 48, y + 14, 96, 11, "#5b5348");
  rect(ctx, x - 48, y + 14, 96, 2.4, "#7f7565");
  rect(ctx, x - 45, y + 25, 90, 4, "#433d35");

  // Red carpet runner into the arcade.
  rect(ctx, x - 17, y + 18, 34, 30, "#571a22");
  rect(ctx, x - 17, y + 18, 2, 30, "#8a6438");
  rect(ctx, x + 15, y + 18, 2, 30, "#8a6438");
  rect(ctx, x - 12, y + 22, 24, 1, "#6e2630");
  rect(ctx, x - 12, y + 30, 24, 1, "#431217");
  circle(ctx, x + 26, y + 39, 3, "#d9b06a");
  circle(ctx, x + 24, y + 44, 2.4, "#a87d3e");

  // Facade body and pillars.
  rect(ctx, x - sign.halfWidth, y - 50, sign.halfWidth * 2, 68, "#2a1a1f");
  rect(ctx, x - sign.halfWidth, y - 50, sign.halfWidth * 2, 3, "#4e2b2d");
  rect(ctx, x - sign.halfWidth, y - 10, 10, 28, "#3a2428");
  rect(ctx, x + sign.halfWidth - 10, y - 10, 10, 28, "#3a2428");
  rect(ctx, x - sign.halfWidth + 2, y - 8, 2, 24, "#7a3a3a");
  rect(ctx, x + sign.halfWidth - 4, y - 8, 2, 24, "#7a3a3a");

  // Marquee with a gold frame.
  rect(ctx, x - 46, y + sign.marqueeTop, 92, 28, "#421b26");
  rect(ctx, x - 46, y + sign.marqueeTop, 92, 3, "#b9854e");
  rect(ctx, x - 46, y + sign.marqueeTop + 25, 92, 3, "#7a4a2e");
  rect(ctx, x - 42, y + sign.marqueeTop + 5, 84, 18, "#2a1119");
  ctx.fillStyle = "#ffe6ac";
  ctx.font = '700 8px "Geist Mono", ui-monospace, monospace';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(255, 196, 108, 0.9)";
  ctx.shadowBlur = 5;

  const signLetters = "ARCADE".split("");
  const signStep = 9.4;
  const signStart = x - ((signLetters.length - 1) * signStep) / 2;

  for (let index = 0; index < signLetters.length; index += 1) {
    ctx.fillText(signLetters[index], signStart + index * signStep, y + sign.marqueeTop + 14);
  }

  ctx.shadowBlur = 0;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  // Marquee bulbs.
  for (let index = 0; index < 11; index += 1) {
    circle(ctx, x - 40 + index * 8, y + sign.marqueeTop - 3, 1.3, "#ffd98a");
  }

  for (let index = 0; index < 4; index += 1) {
    circle(ctx, x - 47, y - 72 + index * 6, 1.3, "#ffd98a");
    circle(ctx, x + 47, y - 72 + index * 6, 1.3, "#ffd98a");
  }

  // Doorway into the arcade.
  rect(ctx, x - sign.doorHalf - 3, y + sign.doorTop - 3, sign.doorHalf * 2 + 6, 67, "#6b4f39");
  rect(ctx, x - sign.doorHalf, y + sign.doorTop, sign.doorHalf * 2, 64, "#0d0913");
  rect(ctx, x - sign.doorHalf + 1, y + sign.doorTop + 1, 3, 62, "rgba(86, 224, 255, 0.26)");
  rect(ctx, x + sign.doorHalf - 4, y + sign.doorTop + 1, 3, 62, "rgba(255, 122, 184, 0.22)");

  // A glimpse of the arcade floor and lights inside.
  rect(ctx, x - sign.doorHalf + 4, y - 8, sign.doorHalf * 2 - 8, 22, "#1a1230");
  rect(ctx, x - sign.doorHalf + 4, y + 2, sign.doorHalf * 2 - 8, 1, "rgba(86, 224, 255, 0.55)");
  rect(ctx, x - sign.doorHalf + 4, y + 8, sign.doorHalf * 2 - 8, 1, "rgba(185, 166, 255, 0.35)");
  rect(ctx, x - 8, y - 12, 16, 1, "rgba(255, 217, 138, 0.5)");
  circle(ctx, x, y - 30, 2.8, "#e8b96a");

  // OPEN sign inside the top of the door.
  ctx.fillStyle = "#9fe7c4";
  ctx.font = '600 5px "Geist Mono", ui-monospace, monospace';
  ctx.textAlign = "center";
  ctx.fillText("OPEN", x, y - 38);
  ctx.textAlign = "left";

  // Posters on the pillars.
  for (const side of [-1, 1]) {
    const px = x + side * 30;

    rect(ctx, px - 8, y - 34, 16, 22, "#1b141a");
    rect(ctx, px - 7, y - 33, 14, 20, side < 0 ? "#233b3b" : "#3b2130");

    if (side < 0) {
      for (let row = 0; row < 3; row += 1) {
        for (let col = 0; col < 4; col += 1) {
          if ((row + col) % 2 === 0) {
            rect(ctx, px - 6 + col * 3, y - 31 + row * 3, 2, 2, "#8fe0d0");
          }
        }
      }
    } else {
      rect(ctx, px - 5, y - 30, 6, 6, "#7cc36a");
      rect(ctx, px + 2, y - 25, 7, 8, "#d9a066");
      circle(ctx, px, y - 21, 2.2, "#ff7ab8");
    }

    rect(ctx, px - 8, y - 34, 16, 1, "#b9854e");
  }

  // Coin/token pedestal and queue rope.
  rect(ctx, x + 50, y + 2, 12, 18, "#3a2a26");
  rect(ctx, x + 50, y + 2, 12, 2, "#7a5a42");
  rect(ctx, x + 54, y + 8, 4, 1.4, "#ffd98a");
  circle(ctx, x + 56, y + 12, 1.8, "#ffd98a");

  for (const px of [x - 55, x - 71]) {
    rect(ctx, px - 1, y + 4, 2, 20, "#5a4630");
    circle(ctx, px, y + 3, 2.2, "#c8a05c");
  }

  ctx.strokeStyle = "#8a2f3a";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x - 55, y + 6);
  ctx.quadraticCurveTo(x - 63, y + 20, x - 71, y + 6);
  ctx.stroke();
}

export function drawJoystickMonument(ctx: Ctx, x: number, y: number) {
  ellipse(ctx, x + 2, y + 10, 40, 14, "rgba(0,0,0,0.4)");
  ellipse(ctx, x, y, 36, 13, "#4a443b");
  ellipse(ctx, x, y - 2, 31, 10.6, "#6e665a");

  for (let index = 0; index < 12; index += 1) {
    const angle = (index / 12) * Math.PI * 2;
    rect(
      ctx,
      x + Math.cos(angle) * 23 - 0.9,
      y - 2 + Math.sin(angle) * 8,
      1.8,
      1.8,
      index % 2 === 0 ? "#56e0ff" : "#b9a6ff",
    );
  }

  rect(ctx, x - 5, y - 40, 10, 38, "#5d564b");
  rect(ctx, x - 5, y - 40, 3, 38, "#7a7264");
  circle(ctx, x, y - 46, 14, "#8f887a");
  circle(ctx, x - 3, y - 50, 10, "#b03a3a");
  circle(ctx, x - 6, y - 53, 3.4, "#e87474");
  circle(ctx, x, y - 46, 14, "rgba(0,0,0,0)");
  ctx.strokeStyle = "#3a332d";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y - 46, 14, 0, Math.PI * 2);
  ctx.stroke();

  circle(ctx, x - 18, y + 4, 3.4, "#b03a3a");
  circle(ctx, x - 18.8, y + 3.2, 1.2, "#e87474");
  circle(ctx, x + 18, y + 4, 3.4, "#2b2633");
  circle(ctx, x + 17.2, y + 3.2, 1.2, "#4a4652");
}

function paintArcadeVoid(ctx: Ctx, arcade: ArcadeWorld) {
  const width = arcade.w * TILE;
  const height = arcade.h * TILE;
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#07060f");
  gradient.addColorStop(0.55, "#0c0920");
  gradient.addColorStop(1, "#0a0716");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  const random = hashStringSafe("arcade-void");

  for (let index = 0; index < 260; index += 1) {
    const x = random() * width;
    const y = random() * height;
    const size = 0.6 + random() * 1.6;
    const palette = ["#e8f2ff", "#b9c8ff", "#ffd9a0", "#9fd8ff"];
    ctx.globalAlpha = 0.25 + random() * 0.65;
    ctx.fillStyle = palette[Math.floor(random() * palette.length)];
    ctx.fillRect(x, y, size, size);
  }

  ctx.globalAlpha = 1;

  for (const [x, y, radius, color] of [
    [width * 0.22, height * 0.28, 180, "rgba(120, 80, 240, 0.14)"],
    [width * 0.8, height * 0.68, 200, "rgba(46, 199, 192, 0.1)"],
    [width * 0.55, height * 0.18, 150, "rgba(255, 122, 184, 0.08)"],
  ] as Array<[number, number, number, string]>) {
    const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
    glow.addColorStop(0, color);
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }

  // Floating stones at the edge of the dimension.
  for (let index = 0; index < 16; index += 1) {
    const angle = (index / 16) * Math.PI * 2 + 0.3;
    const x = arcade.floor.x + Math.cos(angle) * (arcade.floor.rx + 40 + random() * 40);
    const y = arcade.floor.y + Math.sin(angle) * (arcade.floor.ry + 26 + random() * 30);
    const size = 4 + random() * 8;

    ctx.fillStyle = "#2a2638";
    ctx.beginPath();
    ctx.roundRect(x - size / 2, y - size / 3, size, size * 0.66, 2);
    ctx.fill();
    rect(ctx, x - size / 2, y - size / 3, size * 0.4, 1, "rgba(255,255,255,0.12)");
  }
}

function paintArcadeFloor(ctx: Ctx, arcade: ArcadeWorld) {
  const { x, y, rx, ry } = arcade.floor;

  ctx.save();
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.clip();
  rect(ctx, x - rx, y - ry, rx * 2, ry * 2, "#15112a");

  for (let gx = x - rx; gx <= x + rx; gx += TILE) {
    const strong = Math.round((gx - x) / TILE) % 4 === 0;
    rect(
      ctx,
      gx,
      y - ry,
      1,
      ry * 2,
      strong ? "rgba(120, 220, 255, 0.2)" : "rgba(120, 110, 255, 0.1)",
    );
  }

  for (let gy = y - ry; gy <= y + ry; gy += TILE) {
    const strong = Math.round((gy - y) / TILE) % 4 === 0;
    rect(
      ctx,
      x - rx,
      gy,
      rx * 2,
      1,
      strong ? "rgba(120, 220, 255, 0.2)" : "rgba(120, 110, 255, 0.1)",
    );
  }

  for (let ring = 1; ring <= 5; ring += 1) {
    ctx.strokeStyle = `rgba(185, 166, 255, ${0.14 - ring * 0.018})`;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.ellipse(x, y, (rx / 5) * ring, (ry / 5) * ring, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();

  ctx.strokeStyle = "rgba(86, 224, 255, 0.55)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "rgba(86, 224, 255, 0.14)";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.ellipse(x, y, rx + 5, ry + 4, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Central dais.
  circle(ctx, x, y, 3.4 * TILE, "#1d1733");
  circle(ctx, x, y, 3.4 * TILE, "rgba(0,0,0,0)");
  ctx.strokeStyle = "rgba(185, 166, 255, 0.35)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, 3.2 * TILE, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "rgba(86, 224, 255, 0.2)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(x, y, 2.2 * TILE, 0, Math.PI * 2);
  ctx.stroke();
}

export function paintArcadeExit(ctx: Ctx, x: number, y: number) {
  ellipse(ctx, x + 2, y + 26, 40, 10, "rgba(0,0,0,0.4)");
  rect(ctx, x - 34, y + 15, 68, 10, "#403a32");
  rect(ctx, x - 34, y + 15, 68, 2, "#665c4c");
  rect(ctx, x - 38, y - 48, 76, 66, "#23191d");
  rect(ctx, x - 40, y - 64, 80, 20, "#381923");
  rect(ctx, x - 40, y - 64, 80, 2, "#a97446");
  rect(ctx, x - 34, y - 59, 68, 12, "#1a0f15");

  ctx.fillStyle = "#ffdf9f";
  ctx.font = '700 8px "Geist Mono", ui-monospace, monospace';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(255, 190, 96, 0.85)";
  ctx.shadowBlur = 4;
  ctx.fillText("E X I T", x, y - 52);
  ctx.shadowBlur = 0;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  for (let index = 0; index < 8; index += 1) {
    circle(ctx, x - 32 + index * 9.2, y - 66, 1.2, "#ffd98a");
  }

  rect(ctx, x - 15, y - 40, 30, 54, "#0d0913");
  rect(ctx, x - 13, y - 38, 2.4, 52, "rgba(86, 224, 255, 0.24)");
  rect(ctx, x + 10.6, y - 38, 2.4, 52, "rgba(255, 122, 184, 0.2)");
  rect(ctx, x - 12, y + 4, 24, 8, "#171127");
  rect(ctx, x - 12, y + 6, 24, 0.8, "rgba(86, 224, 255, 0.5)");
  rect(ctx, x - 12, y + 10, 24, 0.8, "rgba(185, 166, 255, 0.3)");
  circle(ctx, x, y - 18, 2.2, "#e8b96a");

  for (const px of [x - 46, x + 46]) {
    rect(ctx, px - 1, y + 2, 2, 20, "#4a3a2a");
    circle(ctx, px, y + 1, 2, "#c8a05c");
  }
}

function paintArcadeProps(ctx: Ctx) {
  for (const prop of arcadeProps) {
    const x = prop.x * TILE;
    const y = prop.y * TILE;

    switch (prop.kind) {
      case "blocks":
        for (let index = 0; index < 3; index += 1) {
          const bx = x + (index - 1) * 13;
          const by = y - index * 2;
          poly(
            ctx,
            [
              [bx - 6, by - 8],
              [bx, by - 12],
              [bx + 6, by - 8],
              [bx, by - 4],
            ],
            "#7cc36a",
          );
          poly(
            ctx,
            [
              [bx - 6, by - 8],
              [bx, by - 4],
              [bx, by + 2],
              [bx - 6, by - 2],
            ],
            "#8a6a48",
          );
          poly(
            ctx,
            [
              [bx + 6, by - 8],
              [bx, by - 4],
              [bx, by + 2],
              [bx + 6, by - 2],
            ],
            "#6f543a",
          );
        }
        break;
      case "bowling":
        ellipse(ctx, x + 1, y + 4, 11, 3.6, "rgba(0,0,0,0.3)");
        ctx.fillStyle = "#efe6d2";
        ctx.beginPath();
        ctx.roundRect(x - 4, y - 14, 7, 16, 3);
        ctx.fill();
        circle(ctx, x - 0.5, y - 16, 3.2, "#efe6d2");
        circle(ctx, x - 1.6, y - 17, 0.8, "#b03a3a");
        circle(ctx, x + 0.8, y - 17, 0.8, "#b03a3a");
        circle(ctx, x + 9, y + 1, 5.4, "#b03a3a");
        circle(ctx, x + 7.4, y - 1, 0.8, "#2b1d1d");
        circle(ctx, x + 10.4, y - 1, 0.8, "#2b1d1d");
        circle(ctx, x + 8.8, y + 2.4, 0.8, "#2b1d1d");
        break;
      case "crate":
        ellipse(ctx, x + 1, y + 4, 13, 4, "rgba(0,0,0,0.3)");
        rect(ctx, x - 11, y - 8, 22, 12, "#5c6647");
        rect(ctx, x - 11, y - 8, 22, 2, "#74805b");
        rect(ctx, x - 11, y - 1, 22, 1.4, "#414a33");
        rect(ctx, x - 12, y - 9, 3, 14, "#3a4230");
        rect(ctx, x + 9, y - 9, 3, 14, "#3a4230");
        rect(ctx, x - 3, y - 11, 6, 2, "#9aa46a");
        break;
      case "football":
        ellipse(ctx, x + 1, y + 4, 9, 3, "rgba(0,0,0,0.3)");
        circle(ctx, x, y, 7, "#e8f2f2");
        ctx.strokeStyle = "#2b2620";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.stroke();
        for (const [px, py] of [
          [0, -3.4],
          [-4, 0.8],
          [4, 0.8],
        ] as Array<[number, number]>) {
          circle(ctx, x + px, y + py, 2.2, "#2b2620");
        }
        break;
      case "cricket":
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(-0.42);
        rect(ctx, -3, -13, 6, 18, "#d9a066");
        rect(ctx, -1.4, 5, 2.8, 8, "#2b2620");
        ctx.restore();
        circle(ctx, x + 8, y + 5, 3.6, "#b03a3a");
        ctx.strokeStyle = "#e8d9a8";
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.arc(x + 8, y + 5, 3.6, 0.5, 2.6);
        ctx.stroke();
        break;
      case "palm":
        ellipse(ctx, x, y + 2, 12, 4.4, "#4a443b");
        ellipse(ctx, x, y, 10, 3.6, "#6e665a");
        ctx.strokeStyle = "#6d4b2f";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(x, y - 2);
        ctx.quadraticCurveTo(x - 4, y - 16, x + 1, y - 26);
        ctx.stroke();
        ctx.strokeStyle = "#ff7ab8";
        ctx.lineWidth = 1.8;

        for (const [fx, fy] of [
          [-12, -26],
          [-5, -32],
          [4, -32],
          [11, -26],
          [13, -18],
        ] as Array<[number, number]>) {
          ctx.beginPath();
          ctx.moveTo(x + 1, y - 26);
          ctx.quadraticCurveTo(x + fx * 0.5, y + fy - 2, x + fx, y + fy);
          ctx.stroke();
        }

        break;
      case "dragon":
        circle(ctx, x, y, 17, "rgba(20, 16, 30, 0.5)");
        ctx.strokeStyle = "#ffcf33";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(x, y, 14, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = "rgba(255, 207, 51, 0.45)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.stroke();
        poly(
          ctx,
          [
            [x - 8, y + 2],
            [x - 3, y - 6],
            [x, y - 1],
            [x + 4, y - 9],
            [x + 8, y + 2],
            [x + 2, y],
            [x, y + 6],
            [x - 3, y],
          ],
          "#ffcf33",
        );
        circle(ctx, x + 4.6, y - 6.4, 0.8, "#2b1d1d");
        break;
      case "tokens":
        for (let index = 0; index < 9; index += 1) {
          const angle = index * 2.4;
          const tx = x + Math.cos(angle) * (6 + index * 1.8);
          const ty = y + Math.sin(angle) * (3 + index * 0.9);

          ellipse(ctx, tx, ty, 3.4, 1.4, "rgba(0,0,0,0.28)");
          ellipse(ctx, tx, ty - 0.6, 3, 1.2, "#d9b06a");
          ellipse(ctx, tx, ty - 0.8, 2, 0.7, "#ffd98a");
        }
        break;
    }
  }
}

function paintArcadeShafts(ctx: Ctx, arcade: ArcadeWorld) {
  const floor = arcade.floor;

  ctx.save();
  ctx.beginPath();
  ctx.ellipse(floor.x, floor.y, floor.rx, floor.ry, 0, 0, Math.PI * 2);
  ctx.clip();
  ctx.globalCompositeOperation = "lighter";

  const beams = [
    { x: floor.x - 250, width: 96, color: "rgba(94, 196, 222, 0.07)" },
    { x: floor.x - 90, width: 130, color: "rgba(180, 150, 255, 0.055)" },
    { x: floor.x + 70, width: 110, color: "rgba(255, 122, 184, 0.045)" },
    { x: floor.x + 220, width: 80, color: "rgba(94, 196, 222, 0.06)" },
  ];

  for (const beam of beams) {
    const gradient = ctx.createLinearGradient(0, floor.y - floor.ry, 0, floor.y + floor.ry * 0.4);
    gradient.addColorStop(0, beam.color);
    gradient.addColorStop(0.75, beam.color.replace(/0\.\d+\)/, "0.02)"));
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(beam.x, floor.y - floor.ry);
    ctx.lineTo(beam.x + beam.width, floor.y - floor.ry);
    ctx.lineTo(beam.x + beam.width * 1.8, floor.y + floor.ry);
    ctx.lineTo(beam.x + beam.width * 0.7, floor.y + floor.ry);
    ctx.closePath();
    ctx.fill();
  }

  for (let index = 0; index < 80; index += 1) {
    const x = floor.x + Math.sin(index * 1.7) * floor.rx * 0.85;
    const y = floor.y + Math.cos(index * 2.3) * floor.ry * 0.8;
    ctx.globalAlpha = 0.06 + (index % 5) * 0.012;
    ctx.fillStyle = index % 3 === 0 ? "#9fe8ff" : "#ffe8b0";
    ctx.fillRect(x, y, 0.8, 0.8);
  }

  ctx.restore();
}

function paintArcadeFloorSheen(ctx: Ctx, arcade: ArcadeWorld) {
  const floor = arcade.floor;

  ctx.save();
  ctx.beginPath();
  ctx.ellipse(floor.x, floor.y, floor.rx, floor.ry, 0, 0, Math.PI * 2);
  ctx.clip();

  const sheen = ctx.createLinearGradient(
    floor.x - floor.rx,
    floor.y - floor.ry,
    floor.x + floor.rx,
    floor.y + floor.ry,
  );
  sheen.addColorStop(0, "rgba(255,255,255,0.055)");
  sheen.addColorStop(0.22, "rgba(185,166,255,0.018)");
  sheen.addColorStop(0.5, "rgba(0,0,0,0)");
  sheen.addColorStop(0.72, "rgba(86,224,255,0.02)");
  sheen.addColorStop(1, "rgba(255,255,255,0.035)");
  ctx.fillStyle = sheen;
  ctx.fillRect(floor.x - floor.rx, floor.y - floor.ry, floor.rx * 2, floor.ry * 2);

  ctx.globalAlpha = 0.1;
  ctx.fillStyle = "#9fe8ff";
  ctx.fillRect(floor.x - floor.rx * 0.62, floor.y - 8, floor.rx * 1.24, 1);
  ctx.fillRect(floor.x - floor.rx * 0.4, floor.y + 24, floor.rx * 0.8, 0.8);
  ctx.globalAlpha = 1;

  const edge = ctx.createRadialGradient(
    floor.x,
    floor.y,
    floor.rx * 0.55,
    floor.x,
    floor.y,
    floor.rx,
  );
  edge.addColorStop(0, "rgba(0,0,0,0)");
  edge.addColorStop(1, "rgba(2,2,8,0.5)");
  ctx.fillStyle = edge;
  ctx.fillRect(floor.x - floor.rx, floor.y - floor.ry, floor.rx * 2, floor.ry * 2);
  ctx.restore();
}

function paintArcadeCabinets(ctx: Ctx, arcade: ArcadeWorld) {
  const cabinets = [
    { angle: 2.36, color: "#56e0ff" },
    { angle: 3.36, color: "#ff7ab8" },
    { angle: 4.36, color: "#ffd166" },
    { angle: 5.36, color: "#b9a6ff" },
    { angle: 0.82, color: "#7cc36a" },
    { angle: 5.92, color: "#ff9f43" },
  ];

  for (const cabinet of cabinets) {
    const x = arcade.floor.x + Math.cos(cabinet.angle) * (arcade.floor.rx + 26);
    const y = arcade.floor.y + Math.sin(cabinet.angle) * (arcade.floor.ry + 24);

    ctx.save();
    ctx.globalAlpha = 0.55;
    ellipse(ctx, x, y + 9, 14, 4, "rgba(0,0,0,0.5)");
    rect(ctx, x - 9, y - 16, 18, 26, "#1d1a24");
    rect(ctx, x - 9, y - 16, 18, 2, "#3a3545");
    rect(ctx, x - 7, y - 13, 14, 10, "#0b0a10");
    const screen = ctx.createLinearGradient(x, y - 13, x, y - 3);
    screen.addColorStop(0, cabinet.color);
    screen.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha = 0.32;
    ctx.fillStyle = screen;
    ctx.fillRect(x - 7, y - 13, 14, 10);
    ctx.globalAlpha = 0.7;
    rect(ctx, x - 6, y - 1, 12, 3, "#2a2633");
    circle(ctx, x - 2, y + 4, 1.4, cabinet.color);
    circle(ctx, x + 2.4, y + 4, 1.4, "#e8dcc0");
    rect(ctx, x - 7, y + 7, 14, 1, "#3a3545");
    ctx.restore();
  }
}

function paintArcadeReflections(ctx: Ctx, arcade: ArcadeWorld) {
  const floor = arcade.floor;
  const width = arcade.w * TILE;
  const height = arcade.h * TILE;
  const layer = document.createElement("canvas");
  layer.width = width;
  layer.height = height;
  const reflect = layer.getContext("2d");

  if (!reflect) return;

  reflect.save();
  reflect.beginPath();
  reflect.ellipse(floor.x, floor.y, floor.rx - 5, floor.ry - 5, 0, 0, Math.PI * 2);
  reflect.clip();
  reflect.globalAlpha = 0.55;

  reflect.save();
  reflect.translate(0, (arcade.monument.y + 8) * 2);
  reflect.scale(1, -1);
  drawJoystickMonument(reflect, arcade.monument.x, arcade.monument.y);
  reflect.restore();

  reflect.save();
  reflect.translate(0, (arcade.portal.y + 6) * 2);
  reflect.scale(1, -1);
  paintArcadeExit(reflect, arcade.portal.x, arcade.portal.y);
  reflect.restore();
  reflect.restore();

  reflect.globalCompositeOperation = "destination-in";
  const mask = reflect.createRadialGradient(floor.x, floor.y, 0, floor.x, floor.y, floor.rx * 0.62);
  mask.addColorStop(0, "rgba(255,255,255,0.75)");
  mask.addColorStop(0.5, "rgba(255,255,255,0.3)");
  mask.addColorStop(1, "rgba(255,255,255,0)");
  reflect.fillStyle = mask;
  reflect.fillRect(0, 0, width, height);

  reflect.globalCompositeOperation = "destination-out";
  reflect.fillStyle = "rgba(0,0,0,0.34)";

  for (let scan = 0; scan < height; scan += 3) {
    reflect.fillRect(0, scan, width, 1);
  }

  reflect.globalCompositeOperation = "source-over";
  ctx.save();
  ctx.globalAlpha = 0.55;
  ctx.drawImage(layer, 0, 0);
  ctx.restore();
}

function paintArcadeRim(ctx: Ctx, arcade: ArcadeWorld) {
  const floor = arcade.floor;

  const haze = ctx.createRadialGradient(
    floor.x,
    floor.y,
    floor.rx * 0.7,
    floor.x,
    floor.y,
    floor.rx * 1.25,
  );
  haze.addColorStop(0, "rgba(0,0,0,0)");
  haze.addColorStop(0.72, "rgba(70, 40, 110, 0.12)");
  haze.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = haze;
  ctx.fillRect(floor.x - floor.rx * 1.3, floor.y - floor.ry * 1.6, floor.rx * 2.6, floor.ry * 3.2);

  for (let index = 0; index < 30; index += 1) {
    const angle = (index / 30) * Math.PI * 2;
    const x = floor.x + Math.cos(angle) * (floor.rx + 4);
    const y = floor.y + Math.sin(angle) * (floor.ry + 4);

    ctx.globalAlpha = 0.12 + (index % 3) * 0.05;
    ctx.fillStyle = index % 2 === 0 ? "#56e0ff" : "#b9a6ff";
    ctx.fillRect(x, y, 1.4, 1.4);
  }

  ctx.globalAlpha = 1;
}

export function paintArcade(arcade: ArcadeWorld): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = arcade.w * TILE;
  canvas.height = arcade.h * TILE;
  const ctx = canvas.getContext("2d");

  if (!ctx) return canvas;

  paintArcadeVoid(ctx, arcade);
  paintArcadeRim(ctx, arcade);
  paintArcadeFloor(ctx, arcade);
  paintArcadeShafts(ctx, arcade);
  paintArcadeCabinets(ctx, arcade);
  paintArcadeReflections(ctx, arcade);
  paintArcadeFloorSheen(ctx, arcade);
  paintArcadeProps(ctx);

  for (const spot of arcade.statues) {
    const pool = ctx.createRadialGradient(spot.x, spot.y - 6, 0, spot.x, spot.y - 6, 30);
    pool.addColorStop(0, `${spot.statue.paint}33`);
    pool.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = pool;
    ctx.fillRect(spot.x - 30, spot.y - 36, 60, 60);
    drawArcadeMonument(ctx, spot);
  }

  const monumentGlow = ctx.createRadialGradient(
    arcade.monument.x,
    arcade.monument.y - 40,
    0,
    arcade.monument.x,
    arcade.monument.y - 40,
    110,
  );
  monumentGlow.addColorStop(0, "rgba(255, 122, 184, 0.16)");
  monumentGlow.addColorStop(0.45, "rgba(86, 224, 255, 0.07)");
  monumentGlow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = monumentGlow;
  ctx.fillRect(arcade.monument.x - 110, arcade.monument.y - 150, 220, 220);
  drawJoystickMonument(ctx, arcade.monument.x, arcade.monument.y);
  paintArcadeExit(ctx, arcade.portal.x, arcade.portal.y);

  return canvas;
}

export function drawArcadeDoorGlow(
  ctx: Ctx,
  x: number,
  y: number,
  time: number,
  strength = 1,
  variant: "arcade" | "exit" = "arcade",
) {
  const exit = variant === "exit";
  const doorHalf = exit ? 15 : ARCADE_SIGN.doorHalf;
  const doorTop = exit ? -40 : ARCADE_SIGN.doorTop;
  const signY = exit ? -52 : ARCADE_SIGN.marqueeTop + 14;
  const signHalf = exit ? 34 : 42;
  const pulse = 0.82 + Math.sin(time * 2.1) * 0.18;

  const halo = ctx.createRadialGradient(x, y + signY, 0, x, y + signY, 56);
  halo.addColorStop(0, `rgba(255, 190, 96, ${0.34 * strength})`);
  halo.addColorStop(0.45, `rgba(255, 122, 72, ${0.1 * strength})`);
  halo.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = halo;
  ctx.fillRect(x - 62, y + signY - 40, 124, 100);

  const doorway = ctx.createLinearGradient(x, y + doorTop, x, y + 18);
  doorway.addColorStop(0, `rgba(185, 166, 255, ${0.28 * strength})`);
  doorway.addColorStop(0.5, `rgba(86, 224, 255, ${0.12 * strength})`);
  doorway.addColorStop(1, `rgba(255, 122, 184, ${0.05 * strength})`);
  ctx.fillStyle = doorway;
  ctx.fillRect(x - doorHalf + 1, y + doorTop + 1, doorHalf * 2 - 2, 63);

  for (let index = 0; index < 12; index += 1) {
    const bx = x - signHalf + index * ((signHalf * 2) / 11);
    const flicker = 0.45 + 0.4 * Math.abs(Math.sin(time * 2.4 + index * 1.7));
    const glow = ctx.createRadialGradient(bx, y + signY - 9, 0, bx, y + signY - 9, 5);
    glow.addColorStop(0, `rgba(255, 226, 160, ${flicker * strength})`);
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(bx - 5, y + signY - 14, 10, 10);
  }

  const spill = ctx.createRadialGradient(x, y + 26, 0, x, y + 26, 52);
  spill.addColorStop(0, `rgba(128, 210, 235, ${0.16 * pulse * strength})`);
  spill.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = spill;
  ctx.beginPath();
  ctx.ellipse(x, y + 26, 50, 15, 0, 0, Math.PI * 2);
  ctx.fill();

  for (let index = 0; index < 5; index += 1) {
    const alpha = (0.2 + 0.3 * Math.sin(time * 1.4 + index * 2.1)) * strength;

    if (alpha <= 0.02) continue;

    ctx.fillStyle = `rgba(210, 245, 255, ${alpha})`;
    ctx.fillRect(
      x - 10 + ((index * 7 + Math.sin(time + index) * 3) % 20),
      y - 34 + index * 8,
      1.4,
      1.4,
    );
  }

  ctx.strokeStyle = `rgba(255, 215, 140, ${0.2 * pulse * strength})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - signHalf, y + signY - 12);
  ctx.lineTo(x + signHalf, y + signY - 12);
  ctx.stroke();
}

function paintCastShadows(ctx: Ctx, world: World) {
  const shadowColor = "rgba(9, 16, 14, 0.5)";

  ctx.save();
  ctx.fillStyle = shadowColor;

  for (const tree of world.trees) {
    const size = tree.size;
    const sway = tree.kind === "pine" ? 0.7 : 1;

    ctx.globalAlpha = 0.14;
    ctx.beginPath();
    ctx.ellipse(tree.x - 6 * size, tree.y + 4, 13 * size, 5 * size, 0.12, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.08 * sway;
    ctx.beginPath();
    ctx.moveTo(tree.x - 4 * size, tree.y + 1);
    ctx.lineTo(tree.x - 20 * size, tree.y + 12 * size);
    ctx.lineTo(tree.x - 30 * size, tree.y + 9 * size);
    ctx.lineTo(tree.x - 8 * size, tree.y - 2);
    ctx.closePath();
    ctx.fill();
  }

  for (const decor of world.decor) {
    if (decor.kind === "mushroom") continue;

    ctx.globalAlpha = 0.18;
    ctx.beginPath();
    ctx.ellipse(
      decor.x - decor.size * 2,
      decor.y + decor.size * 0.8,
      decor.size * 3.4,
      decor.size * 1.2,
      0.1,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  for (const lantern of world.lanterns) {
    ctx.globalAlpha = 0.16;
    ctx.beginPath();
    ctx.ellipse(lantern.x + 2, lantern.y + 2, 7, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.1;
    ctx.beginPath();
    ctx.moveTo(lantern.x, lantern.y);
    ctx.lineTo(lantern.x - 26, lantern.y + 10);
    ctx.lineTo(lantern.x - 24, lantern.y + 12);
    ctx.lineTo(lantern.x + 1, lantern.y + 3);
    ctx.closePath();
    ctx.fill();
  }

  for (const landmark of world.landmarks) {
    ctx.globalAlpha = 0.17;
    ctx.beginPath();
    ctx.ellipse(landmark.x - 2, landmark.y + 3, 16, 6, 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.08;
    ctx.beginPath();
    ctx.moveTo(landmark.x - 4, landmark.y);
    ctx.lineTo(landmark.x - 30, landmark.y + 12);
    ctx.lineTo(landmark.x - 26, landmark.y + 14);
    ctx.lineTo(landmark.x + 2, landmark.y + 4);
    ctx.closePath();
    ctx.fill();
  }

  for (const region of atlasRegions) {
    const x = region.center.x * TILE + TILE / 2;
    const y = region.center.y * TILE + TILE / 2;

    ctx.globalAlpha = 0.15;
    ctx.beginPath();
    ctx.ellipse(x + 4, y + 10, 40, 14, 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.07;
    ctx.beginPath();
    ctx.moveTo(x - 10, y + 4);
    ctx.lineTo(x - 54, y + 24);
    ctx.lineTo(x - 48, y + 28);
    ctx.lineTo(x + 8, y + 8);
    ctx.closePath();
    ctx.fill();
  }

  const signpost = world.signpost;

  ctx.globalAlpha = 0.2;
  ctx.beginPath();
  ctx.ellipse(signpost.x + 1, signpost.y + 2, 6, 2.4, 0, 0, Math.PI * 2);
  ctx.fill();

  const mission = world.story.missionStone;

  ctx.globalAlpha = 0.2;
  ctx.beginPath();
  ctx.ellipse(mission.x + 2, mission.y + 6, 14, 4.4, 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.1;
  ctx.beginPath();
  ctx.moveTo(mission.x - 8, mission.y);
  ctx.lineTo(mission.x - 40, mission.y + 18);
  ctx.lineTo(mission.x - 36, mission.y + 21);
  ctx.lineTo(mission.x + 4, mission.y + 5);
  ctx.closePath();
  ctx.fill();

  const shrine = world.story.shrine;

  ctx.globalAlpha = 0.17;
  ctx.beginPath();
  ctx.ellipse(shrine.monitor.x + 2, shrine.monitor.y + 28, 48, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.1;
  ctx.beginPath();
  ctx.moveTo(shrine.monitor.x - 42, shrine.monitor.y + 29);
  ctx.lineTo(shrine.monitor.x - 82, shrine.monitor.y + 49);
  ctx.lineTo(shrine.monitor.x - 76, shrine.monitor.y + 53);
  ctx.lineTo(shrine.monitor.x - 30, shrine.monitor.y + 33);
  ctx.closePath();
  ctx.fill();

  for (const part of [shrine.mouse, shrine.plaque]) {
    ctx.globalAlpha = 0.18;
    ctx.beginPath();
    ctx.ellipse(part.x, part.y + 4, 7, 2.6, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  const frontage = world.story.portal;

  ctx.globalAlpha = 0.2;
  ctx.beginPath();
  ctx.ellipse(frontage.x + 2, frontage.y + 26, 48, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.12;
  ctx.beginPath();
  ctx.moveTo(frontage.x - 42, frontage.y + 16);
  ctx.lineTo(frontage.x - 96, frontage.y + 34);
  ctx.lineTo(frontage.x - 88, frontage.y + 40);
  ctx.lineTo(frontage.x - 30, frontage.y + 20);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function paintPondFinish(ctx: Ctx, world: World) {
  const pond = world.story.pond;
  const pondLeft = pond.x - pond.rx;
  const pondTop = pond.y - pond.ry;

  ctx.save();
  ctx.beginPath();
  ctx.ellipse(pond.x, pond.y, pond.rx - 1, pond.ry - 1, 0, 0, Math.PI * 2);
  ctx.clip();

  const depth = ctx.createRadialGradient(pond.x, pond.y, 0, pond.x, pond.y, pond.rx);
  depth.addColorStop(0, "rgba(9, 32, 48, 0.3)");
  depth.addColorStop(0.55, "rgba(9, 32, 48, 0.08)");
  depth.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = depth;
  ctx.fillRect(pondLeft, pondTop, pond.rx * 2, pond.ry * 2);

  ctx.translate(pond.x, pond.y);

  const reflected = [
    { x: 3.2 * TILE, y: -1.7 * TILE, color: "rgba(238, 210, 150, 0.18)", width: 3 },
    { x: -2.1 * TILE, y: 1.3 * TILE, color: "rgba(79, 122, 69, 0.25)", width: 6 },
    { x: 1.8 * TILE, y: 1.9 * TILE, color: "rgba(110, 75, 47, 0.22)", width: 4 },
    { x: -1.2 * TILE, y: -2.2 * TILE, color: "rgba(255, 210, 140, 0.12)", width: 2 },
  ];

  for (const reflection of reflected) {
    ctx.fillStyle = reflection.color;

    for (let band = 0; band < 6; band += 1) {
      const offset = Math.sin(band * 1.7 + reflection.x) * 2.4;
      ctx.fillRect(
        reflection.x + offset - reflection.width / 2,
        reflection.y + band * 5,
        reflection.width,
        3.4,
      );
    }
  }

  ctx.strokeStyle = "rgba(196, 232, 240, 0.09)";
  ctx.lineWidth = 0.8;

  for (let index = 0; index < 6; index += 1) {
    ctx.beginPath();
    ctx.ellipse(0, 0, pond.rx * (0.22 + index * 0.12), pond.ry * 0.18, 0, 0.2, Math.PI - 0.2);
    ctx.stroke();
  }

  ctx.globalAlpha = 0.18;
  ctx.fillStyle = "rgba(200, 238, 245, 0.5)";

  for (let index = 0; index < 14; index += 1) {
    const rx = Math.sin(index * 2.1) * pond.rx * 0.62;
    const ry = Math.cos(index * 1.4) * pond.ry * 0.55;
    ctx.fillRect(rx, ry, 2.4 + (index % 3), 0.7);
  }

  ctx.globalAlpha = 1;
  ctx.restore();

  ctx.strokeStyle = "rgba(20, 44, 44, 0.22)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(pond.x, pond.y, pond.rx - 2, pond.ry - 2, 0, 0, Math.PI * 2);
  ctx.stroke();
}

function paintWorldFinish(ctx: Ctx, world: World) {
  const width = WORLD_W * TILE;
  const height = WORLD_H * TILE;
  const wash = ctx.createLinearGradient(width, 0, 0, height);
  wash.addColorStop(0, "rgba(255, 214, 150, 0.035)");
  wash.addColorStop(0.45, "rgba(0,0,0,0)");
  wash.addColorStop(1, "rgba(32, 60, 96, 0.035)");
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, width, height);

  const random = hashStringSafe("safar-grass-detail");

  for (let index = 0; index < 700; index += 1) {
    const x = random() * width;
    const y = random() * height;
    const tx = Math.floor(x / TILE);
    const ty = Math.floor(y / TILE);
    const tile = world.tiles[ty * WORLD_W + tx];

    if (tile !== Tile.Grass && tile !== Tile.Forest) continue;

    ctx.globalAlpha = 0.22 + random() * 0.2;
    ctx.fillStyle = tile === Tile.Forest ? "#3e5f3b" : "#476f3e";
    ctx.fillRect(x, y, 1, 1);

    if (index % 3 === 0) {
      ctx.fillStyle = "#6c9155";
      ctx.fillRect(x, y - 1, 1, 1);
      ctx.fillRect(x + 1, y, 1, 1);
    }

    if (index % 7 === 0) {
      ctx.fillStyle = "#c9b37a";
      ctx.fillRect(x + 1, y + 1, 1.4, 0.8);
    }
  }

  ctx.globalAlpha = 1;
  paintPondFinish(ctx, world);

  const edge = ctx.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) * 0.36,
    width / 2,
    height / 2,
    Math.max(width, height) * 0.72,
  );
  edge.addColorStop(0, "rgba(0,0,0,0)");
  edge.addColorStop(1, "rgba(3, 7, 10, 0.26)");
  ctx.fillStyle = edge;
  ctx.fillRect(0, 0, width, height);
}

export function paintTerrain(world: World): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = WORLD_W * TILE;
  canvas.height = WORLD_H * TILE;
  const ctx = canvas.getContext("2d");

  if (!ctx) return canvas;

  paintGround(world, ctx);
  paintDecor(ctx, world);
  paintFlowers(world, ctx);
  paintCastShadows(ctx, world);

  for (const lantern of world.lanterns) {
    paintLantern(ctx, lantern.x, lantern.y);
  }

  paintPond(ctx, world);
  paintMissionStone(ctx, world.story.missionStone.x, world.story.missionStone.y);
  paintShrine(ctx, world);
  paintArcadeFrontage(ctx, world.story.portal.x, world.story.portal.y);

  for (const region of atlasRegions) {
    paintStructure(ctx, region);
  }

  const sortedTrees = [...world.trees].sort((a, b) => a.y - b.y);

  for (const tree of sortedTrees) {
    paintTree(ctx, tree);
  }

  ellipse(ctx, world.campfire.x + 2, world.campfire.y + 6, 16, 6, "rgba(20,20,15,0.25)");
  paintWorldFinish(ctx, world);

  return canvas;
}

export function paintInterior(interior: Interior): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = interior.w * TILE;
  canvas.height = interior.h * TILE;
  const ctx = canvas.getContext("2d");

  if (!ctx) return canvas;

  for (let ty = 0; ty < interior.h; ty += 1) {
    for (let tx = 0; tx < interior.w; tx += 1) {
      const tile = interior.tiles[ty * interior.w + tx];
      const x = tx * TILE;
      const y = ty * TILE;
      const noise = hash(tx, ty);

      if (
        tile === 0 /* floor */ ||
        tile === 3 /* rug */ ||
        tile === 4 /* table */ ||
        tile === 5 /* door */
      ) {
        rect(ctx, x, y, TILE, TILE, noise > 0.5 ? "#6f4e31" : "#765334");
        rect(ctx, x, y + TILE - 2, TILE, 2, "#5d3f27");
        rect(ctx, x + 2 + noise * 8, y + 4, 1, 8, "rgba(255,255,255,0.05)");
      } else if (tile === 1 /* wall */) {
        rect(ctx, x, y, TILE, TILE, noise > 0.5 ? "#474450" : "#413e49");
        rect(ctx, x, y, TILE, 2, "#56525f");
        rect(ctx, x + (tx % 2) * 6, y + 8, 8, 1, "#3a3742");
      } else if (tile === 2 /* shelf */) {
        rect(ctx, x, y, TILE, TILE, "#3a2a1d");
        rect(ctx, x + 1, y + 2, TILE - 2, 5, "#503a28");
        rect(ctx, x + 1, y + 9, TILE - 2, 5, "#503a28");

        for (let index = 0; index < 4; index += 1) {
          const colors = ["#c96b4a", "#7ee8ff", "#c3e08a", "#ffcf6b", "#b9a6ff"];
          rect(
            ctx,
            x + 2 + index * 3,
            y + 2,
            2,
            5,
            colors[Math.floor(hash(tx + index, ty) * colors.length) % colors.length],
          );
          rect(
            ctx,
            x + 2 + index * 3,
            y + 9,
            2,
            5,
            colors[Math.floor(hash(tx, ty + index) * colors.length) % colors.length],
          );
        }
      }
    }
  }

  // Reading tables with open books.
  for (let ty = 0; ty < interior.h; ty += 1) {
    for (let tx = 0; tx < interior.w; tx += 1) {
      if (interior.tiles[ty * interior.w + tx] !== 4) continue;
      const x = tx * TILE;
      const y = ty * TILE;

      rect(ctx, x, y + 3, TILE, TILE - 5, "#5b3e28");
      rect(ctx, x + 1, y + 1, TILE - 2, TILE - 4, "#7a5533");
      rect(ctx, x + 1, y + 1, TILE - 2, 2, "#8f6a45");
      rect(ctx, x + 3, y + 4, 4.5, 7, "#f0e6cf");
      rect(ctx, x + 8.5, y + 4, 4.5, 7, "#e6d9bc");
      rect(ctx, x + 7.7, y + 4, 1.2, 7, "#b9a98a");
      rect(ctx, x + 2, y + 11, 1.4, 3, "#4a3422");
      rect(ctx, x + 12.6, y + 11, 1.4, 3, "#4a3422");
    }
  }

  // Door: a warm way out.
  for (let ty = 0; ty < interior.h; ty += 1) {
    for (let tx = 0; tx < interior.w; tx += 1) {
      if (interior.tiles[ty * interior.w + tx] !== 5) continue;
      const x = tx * TILE;
      const y = ty * TILE;

      rect(ctx, x, y - 6, TILE, TILE + 6, "#241f19");
      rect(ctx, x + 1, y - 4, 2.2, TILE + 4, "#3a2f23");
      rect(ctx, x + TILE - 3.2, y - 4, 2.2, TILE + 4, "#3a2f23");
      rect(ctx, x + 3, y - 3, TILE - 6, TILE + 3, "#ffcf8a");
      rect(ctx, x + 5, y - 1, TILE - 10, TILE, "#ffe6b8");
    }
  }

  // Woven rug: one continuous piece instead of a tile checkerboard.
  let rugMinX = Infinity;
  let rugMaxX = -Infinity;
  let rugMinY = Infinity;
  let rugMaxY = -Infinity;

  for (let ty = 0; ty < interior.h; ty += 1) {
    for (let tx = 0; tx < interior.w; tx += 1) {
      if (interior.tiles[ty * interior.w + tx] !== 3) continue;
      rugMinX = Math.min(rugMinX, tx);
      rugMaxX = Math.max(rugMaxX, tx);
      rugMinY = Math.min(rugMinY, ty);
      rugMaxY = Math.max(rugMaxY, ty);
    }
  }

  if (Number.isFinite(rugMinX)) {
    const x = rugMinX * TILE;
    const y = rugMinY * TILE;
    const w = (rugMaxX - rugMinX + 1) * TILE;
    const h = (rugMaxY - rugMinY + 1) * TILE;

    rect(ctx, x, y, w, h, "#5c2f3a");
    rect(ctx, x + 4, y + 4, w - 8, h - 8, "#7a4050");
    rect(ctx, x + 8, y + 8, w - 16, h - 16, "#8a4a58");

    // Woven diagonal texture.
    ctx.globalAlpha = 0.16;
    ctx.strokeStyle = "#d9b06a";
    ctx.lineWidth = 1;

    for (let offset = -h; offset < w; offset += 14) {
      ctx.beginPath();
      ctx.moveTo(x + offset, y + h);
      ctx.lineTo(x + offset + h, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Border and central medallion.
    ctx.strokeStyle = "#d9b06a";
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 6, y + 6, w - 12, h - 12);
    circle(ctx, x + w / 2, y + h / 2, Math.min(w, h) * 0.22, "#8a4a58");
    ctx.strokeStyle = "#d9b06a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2, Math.min(w, h) * 0.16, 0, Math.PI * 2);
    ctx.stroke();

    for (let index = 0; index < 8; index += 1) {
      const angle = (index / 8) * Math.PI * 2;
      circle(
        ctx,
        x + w / 2 + Math.cos(angle) * Math.min(w, h) * 0.16,
        y + h / 2 + Math.sin(angle) * Math.min(w, h) * 0.16,
        1.6,
        "#d9b06a",
      );
    }
  }

  // Wall sconces with baked warm light.
  const sconcePositions: Array<[number, number]> = [
    [1.4, 4.5],
    [1.4, 11.5],
    [1.4, 18.5],
    [interior.w - 1.4, 4.5],
    [interior.w - 1.4, 11.5],
    [interior.w - 1.4, 18.5],
    [interior.w / 2 - 4.5, 1.6],
    [interior.w / 2 + 4.5, 1.6],
  ];

  for (const [tx, ty] of sconcePositions) {
    const x = tx * TILE;
    const y = ty * TILE;
    const glow = ctx.createRadialGradient(x, y, 0, x, y, 42);
    glow.addColorStop(0, "rgba(255, 200, 110, 0.3)");
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(x - 42, y - 42, 84, 84);
    rect(ctx, x - 1, y - 2, 2, 6, "#2e2620");
    rect(ctx, x - 2.4, y - 5, 4.8, 4, "#ffd98a");
    rect(ctx, x - 1, y - 6.4, 2, 1.6, "#fff1c9");
  }

  // Dark edges for mood.
  const gradient = ctx.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    canvas.height * 0.3,
    canvas.width / 2,
    canvas.height / 2,
    canvas.height * 0.85,
  );
  gradient.addColorStop(0, "rgba(0,0,0,0)");
  gradient.addColorStop(1, "rgba(10,8,14,0.55)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  return canvas;
}

export function paintLectern(ctx: Ctx, x: number, y: number) {
  rect(ctx, x - 6, y - 2, 12, 14, "#4f3826");
  rect(ctx, x - 8, y - 6, 16, 6, "#6d4b2f");
  rect(ctx, x - 6, y - 10, 12, 4, "#f0e6cf");
  rect(ctx, x, y - 10, 1, 4, "#b9a98a");
  circle(ctx, x, y - 14, 3, "rgba(255, 217, 138, 0.9)");
}

export function drawLandmark(
  ctx: Ctx,
  landmark: Landmark,
  region: AtlasRegion,
  time: number,
  found: boolean,
) {
  const { x, y } = landmark;
  const bob = Math.sin(time * 1.6 + x * 0.05) * 1.6;

  ellipse(ctx, x + 1, y + 6, 9, 3.4, "rgba(0,0,0,0.28)");
  rect(ctx, x - 7, y - 1, 14, 7, "#8d8678");
  rect(ctx, x - 7, y - 1, 14, 2, "#b0a794");
  rect(ctx, x - 5, y + 2, 10, 4, "#7c7568");

  ctx.save();
  ctx.translate(x, y - 9 + bob);
  drawEntryIcon(ctx, region.id, region.accent, found);
  ctx.restore();
}

function drawEntryIcon(ctx: Ctx, regionId: AtlasRegionId, accent: string, found: boolean) {
  const glow = found ? 1 : 0.55;

  ctx.globalAlpha = glow;

  switch (regionId) {
    case "music":
      circle(ctx, 0, 0, 5.4, "#14141c");
      circle(ctx, 0, 0, 4.4, "#262633");
      circle(ctx, 0, 0, 1.5, accent);
      rect(ctx, -3.5, -3.6, 1, 1, "rgba(255,255,255,0.55)");
      break;
    case "film":
      circle(ctx, 0, 0, 5, "#cfd6e6");
      circle(ctx, 0, 0, 1.3, "#23202e");

      for (let index = 0; index < 4; index += 1) {
        const angle = (index / 4) * Math.PI * 2;
        circle(ctx, Math.cos(angle) * 2.8, Math.sin(angle) * 2.8, 1.2, accent);
      }
      break;
    case "books":
      rect(ctx, -4.5, -4, 9, 8, accent);
      rect(ctx, -3.5, -4, 3, 8, "#f0e6cf");
      rect(ctx, 0.8, -4, 1, 8, "rgba(0,0,0,0.35)");
      break;
    case "poetry":
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(-3, 4);
      ctx.quadraticCurveTo(2, 0, 4, -5);
      ctx.stroke();
      rect(ctx, -3.4, 3.2, 2, 1.4, "#f0e6cf");
      break;
    case "philosophy":
      rect(ctx, -3.5, 1.5, 7, 4, "#6e727a");
      rect(ctx, -2.5, 0.8, 5, 1.4, "#8b8f96");
      poly(
        ctx,
        [
          [-2.4, 0.6],
          [0, -6],
          [2.4, 0.6],
          [0, -1.6],
        ],
        accent,
      );
      poly(
        ctx,
        [
          [-1.1, 0.4],
          [0, -3.6],
          [1.1, 0.4],
        ],
        "#f0e6cf",
      );
      break;
  }

  ctx.globalAlpha = 1;
}

export function drawPlayer(
  ctx: Ctx,
  x: number,
  y: number,
  direction: number,
  walk: number,
  tint: string,
) {
  const bob = Math.abs(Math.sin(walk * Math.PI * 2)) * 1.2;
  const legSwing = Math.sin(walk * Math.PI * 2) * 1.6;

  ellipse(ctx, x + 1, y + 7, 6.5, 2.6, "rgba(0,0,0,0.32)");

  // Legs.
  rect(ctx, x - 3.4, y + 1 - legSwing, 2.6, 5, "#3a2f2b");
  rect(ctx, x + 0.8, y + 1 + legSwing, 2.6, 5, "#3a2f2b");

  // Cloak.
  ctx.fillStyle = tint;
  ctx.beginPath();
  ctx.roundRect(x - 5, y - 8 - bob, 10, 10, 3);
  ctx.fill();
  rect(ctx, x - 5, y - 2 - bob, 10, 3, "rgba(0,0,0,0.18)");

  // Head and hood.
  circle(ctx, x, y - 11 - bob, 4, tint);
  circle(ctx, x, y - 10.5 - bob, 3.1, direction === 3 ? tint : "#e8c9a0");

  if (direction !== 3) {
    rect(ctx, x - 1.7, y - 11.6 - bob, 1, 1, "#2c2320");
    rect(ctx, x + 0.7, y - 11.6 - bob, 1, 1, "#2c2320");
  }

  rect(ctx, x - 4.4, y - 9.6 - bob, 2, 4, "rgba(255,255,255,0.16)");
}

export function drawGuide(ctx: Ctx, x: number, y: number, walk: number) {
  const bob = Math.abs(Math.sin(walk * Math.PI * 2)) * 1;
  const legSwing = Math.sin(walk * Math.PI * 2) * 1.2;

  ellipse(ctx, x + 1, y + 7, 6.5, 2.6, "rgba(0,0,0,0.3)");
  rect(ctx, x - 3, y + 1 - legSwing, 2.4, 5, "#5a5347");
  rect(ctx, x + 0.6, y + 1 + legSwing, 2.4, 5, "#5a5347");

  ctx.fillStyle = "#e6ddc4";
  ctx.beginPath();
  ctx.roundRect(x - 5.5, y - 9 - bob, 11, 10, 4);
  ctx.fill();
  circle(ctx, x, y - 12 - bob, 4, "#e6ddc4");
  circle(ctx, x, y - 11.4 - bob, 2.8, "#d8cba8");
  rect(ctx, x - 1.6, y - 12.2 - bob, 1, 1, "#3a332a");
  rect(ctx, x + 0.8, y - 12.2 - bob, 1, 1, "#3a332a");
  rect(ctx, x + 6, y - 16 - bob, 1.4, 18, "#7a5533");
  circle(ctx, x + 6.7, y - 17 - bob, 2, "#ffd98a");
}

export function drawCampfire(ctx: Ctx, x: number, y: number, time: number) {
  ellipse(ctx, x + 1, y + 4, 16, 6, "rgba(0,0,0,0.25)");

  for (let index = 0; index < 9; index += 1) {
    const angle = (index / 9) * Math.PI * 2;
    circle(ctx, x + Math.cos(angle) * 13, y + Math.sin(angle) * 7 + 2, 3, "#6e6a5e");
  }

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.35);
  rect(ctx, -8, -2, 16, 3.4, "#5a3d27");
  ctx.rotate(0.7);
  rect(ctx, -8, -2, 16, 3.4, "#6d4b2f");
  ctx.restore();

  const flicker = 0.85 + Math.sin(time * 9.2) * 0.1 + Math.sin(time * 13.7) * 0.05;

  ctx.globalAlpha = 0.9;
  poly(
    ctx,
    [
      [-5 * flicker, 1],
      [0, -10 * flicker],
      [5 * flicker, 1],
    ],
    "#ff8a3d",
  );
  poly(
    ctx,
    [
      [-2.6 * flicker, 1],
      [0, -6 * flicker],
      [2.6 * flicker, 1],
    ],
    "#ffd166",
  );
  poly(
    ctx,
    [
      [-1, 1],
      [0, -3.4],
      [1, 1],
    ],
    "#fff1c9",
  );
  ctx.globalAlpha = 1;
}

export function drawSignpost(ctx: Ctx, x: number, y: number) {
  ellipse(ctx, x + 1, y + 8, 5, 2, "rgba(0,0,0,0.25)");
  rect(ctx, x - 1.4, y - 18, 3, 26, "#6d4b2f");
  rect(ctx, x - 1.4, y - 18, 1, 26, "#8a6238");

  const boards: Array<[number, number, number, string]> = [
    [-4, -16, -1, "#7ee8ff"],
    [-3, -11, 1, "#ffcf6b"],
    [-5, -6, -1, "#c3e08a"],
  ];

  for (const [offset, offsetY, dir, color] of boards) {
    rect(ctx, x + offset * 4 - (dir < 0 ? 10 : 0), y + offsetY, 14, 3.4, "#a98a5f");
    rect(ctx, x + offset * 4 - (dir < 0 ? 10 : 12), y + offsetY, 2, 3.4, color);
  }
}

export function drawRelic(ctx: Ctx, x: number, y: number, time: number, discovered: boolean) {
  const pulse = 0.6 + Math.sin(time * 2.4) * 0.25;
  const size = discovered ? 3.4 : 2.6 + Math.sin(time * 3.1) * 0.6;

  ctx.globalAlpha = discovered ? 0.9 : pulse;
  poly(
    ctx,
    [
      [x, y - size * 1.8],
      [x + size * 0.5, y - size * 0.4],
      [x, y + size * 0.6],
      [x - size * 0.5, y - size * 0.4],
    ],
    "#fff1c9",
  );
  circle(ctx, x, y - 1, size * 0.5, "#ffd98a");
  ctx.globalAlpha = 1;
}

export function drawTrail(ctx: Ctx, trail: Trail, time: number) {
  const midX = (trail.from.x + trail.to.x) / 2;
  const midY = (trail.from.y + trail.to.y) / 2;
  const dx = trail.to.x - trail.from.x;
  const dy = trail.to.y - trail.from.y;
  const length = Math.hypot(dx, dy) || 1;
  const bend = Math.min(90, length * 0.18);
  const controlX = midX - (dy / length) * bend;
  const controlY = midY + (dx / length) * bend;
  const steps = Math.max(12, Math.floor(length / 22));

  ctx.globalAlpha = 0.32 + Math.sin(time * 1.4) * 0.06;
  ctx.fillStyle = trail.color;

  for (let index = 1; index < steps; index += 1) {
    if (index % 3 === 0) continue;

    const t = index / steps;
    const inverse = 1 - t;
    const x = inverse * inverse * trail.from.x + 2 * inverse * t * controlX + t * t * trail.to.x;
    const y = inverse * inverse * trail.from.y + 2 * inverse * t * controlY + t * t * trail.to.y;

    rect(ctx, x - 1, y - 1, 2, 2, trail.color);
  }

  ctx.globalAlpha = 1;
}

export type WaterGlint = { x: number; y: number; phase: number };

export function createWaterGlints(world: World): WaterGlint[] {
  const glints: WaterGlint[] = [];
  const lake = world.lake;

  for (let index = 0; index < 90; index += 1) {
    const angle = hash(index, 11) * Math.PI * 2;
    const radius = Math.sqrt(hash(index, 29));
    const x = lake.x + Math.cos(angle) * radius * lake.rx * 0.92;
    const y = lake.y + Math.sin(angle) * radius * lake.ry * 0.9;

    glints.push({ x: x * TILE, y: y * TILE, phase: hash(index, 47) * Math.PI * 2 });
  }

  return glints;
}

export function drawWaterGlints(ctx: Ctx, glints: WaterGlint[], time: number) {
  ctx.globalAlpha = 1;

  for (const glint of glints) {
    const shimmer = Math.sin(time * 1.1 + glint.phase);
    const alpha = 0.06 + Math.max(0, shimmer) * 0.14;

    if (alpha <= 0.02) continue;

    ctx.fillStyle = `rgba(190, 232, 240, ${alpha})`;
    ctx.fillRect(
      Math.round(glint.x),
      Math.round(glint.y),
      5 + Math.round(Math.max(0, shimmer) * 6),
      1.4,
    );
  }
}

export function hourMood(hour: number) {
  const stops: Array<{
    hour: number;
    color: [number, number, number];
    alpha: number;
    night: number;
  }> = [
    { hour: 0, color: [10, 18, 48], alpha: 0.58, night: 1 },
    { hour: 5, color: [12, 20, 52], alpha: 0.52, night: 0.9 },
    { hour: 6.6, color: [255, 154, 107], alpha: 0.18, night: 0.25 },
    { hour: 8.2, color: [255, 220, 180], alpha: 0, night: 0 },
    { hour: 16.6, color: [255, 220, 180], alpha: 0, night: 0 },
    { hour: 18.6, color: [255, 122, 61], alpha: 0.24, night: 0.2 },
    { hour: 20.2, color: [42, 26, 74], alpha: 0.42, night: 0.7 },
    { hour: 22, color: [10, 18, 48], alpha: 0.56, night: 1 },
    { hour: 24, color: [10, 18, 48], alpha: 0.58, night: 1 },
  ];

  let from = stops[0];
  let to = stops[stops.length - 1];

  for (let index = 1; index < stops.length; index += 1) {
    if (hour <= stops[index].hour) {
      from = stops[index - 1];
      to = stops[index];
      break;
    }
  }

  const span = to.hour - from.hour || 1;
  const t = Math.min(1, Math.max(0, (hour - from.hour) / span));
  const color = from.color.map((channel, index) =>
    Math.round(channel + (to.color[index] - channel) * t),
  );

  return {
    color: `rgb(${color[0]}, ${color[1]}, ${color[2]})`,
    alpha: from.alpha + (to.alpha - from.alpha) * t,
    night: from.night + (to.night - from.night) * t,
  };
}

export function isNight(hour: number) {
  return hourMood(hour).night > 0.5;
}
