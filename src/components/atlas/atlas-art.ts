import { atlasRegions, type AtlasRegion, type AtlasRegionId } from "@/content/atlas";
import {
  TILE,
  Tile,
  WORLD_H,
  WORLD_W,
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

export function paintTerrain(world: World): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = WORLD_W * TILE;
  canvas.height = WORLD_H * TILE;
  const ctx = canvas.getContext("2d");

  if (!ctx) return canvas;

  paintGround(world, ctx);
  paintDecor(ctx, world);
  paintFlowers(world, ctx);

  for (const lantern of world.lanterns) {
    paintLantern(ctx, lantern.x, lantern.y);
  }

  for (const region of atlasRegions) {
    paintStructure(ctx, region);
  }

  const sortedTrees = [...world.trees].sort((a, b) => a.y - b.y);

  for (const tree of sortedTrees) {
    paintTree(ctx, tree);
  }

  // Campfire ring and signpost base are painted dynamically; their shadows live here.
  ellipse(ctx, world.campfire.x + 2, world.campfire.y + 6, 16, 6, "rgba(20,20,15,0.25)");

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
