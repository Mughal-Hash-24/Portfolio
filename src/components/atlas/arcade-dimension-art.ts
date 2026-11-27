import { TILE, type ArcadeWorld, type ArcadeZoneSpot } from "./atlas-world";
import { paintGameBuilding } from "./arcade-buildings-art";
import { drawArcadeDoorGlow, drawJoystickMonument, paintArcadeExit } from "./atlas-art";

type Ctx = CanvasRenderingContext2D;

const ZONE_LABEL: Record<string, string> = {
  "gta-san-andreas": "GTA: SAN ANDREAS",
  "gta-iii": "GTA III",
  "gta-vice-city": "GTA: VICE CITY",
  "gta-iv": "GTA IV",
  "gta-v": "GTA V",
  "assassins-creed": "ASSASSIN'S CREED",
  "watch-dogs": "WATCH DOGS",
  minecraft: "MINECRAFT",
  "among-us": "AMONG US",
  "mortal-kombat": "MORTAL KOMBAT",
  "call-of-duty": "CALL OF DUTY",
  igi: "PROJECT I.G.I.",
  tekken: "TEKKEN",
  fifa: "FIFA",
  "cricket-07": "CRICKET 07",
  "wwe-2k15": "WWE 2K15",
  "far-cry-3": "FAR CRY 3",
};

const ZONE_COLOR: Record<string, string> = {
  "gta-san-andreas": "#7cc36a",
  "gta-iii": "#ffd166",
  "gta-vice-city": "#ff7ab8",
  "gta-iv": "#e85d5d",
  "gta-v": "#ff9f43",
  "assassins-creed": "#f2ecdd",
  "watch-dogs": "#56e0ff",
  minecraft: "#7cc36a",
  "among-us": "#e85d5d",
  "mortal-kombat": "#ffcf33",
  "call-of-duty": "#9aa46a",
  igi: "#6fa8dc",
  tekken: "#b58cff",
  fifa: "#f2ecdd",
  "cricket-07": "#d9a066",
  "wwe-2k15": "#ffd166",
  "far-cry-3": "#5fd3a6",
};

function px(tile: number) {
  return tile * TILE;
}

function rect(ctx: Ctx, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
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

function line(ctx: Ctx, x0: number, y0: number, x1: number, y1: number, color: string, width = 1) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
}

function hash(x: number, y: number) {
  let value = Math.imul(x, 374761393) + Math.imul(y, 668265263);
  value = Math.imul(value ^ (value >>> 13), 1274126177);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967296;
}

function rng(seed: string) {
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

const LANES = [
  { x: px(20), y: px(10), w: px(6), h: px(44) },
  { x: px(20), y: px(13), w: px(60), h: px(6) },
  { x: px(74), y: px(10), w: px(6), h: px(44) },
  { x: px(20), y: px(54), w: px(60), h: px(6) },
  { x: px(44), y: px(40), w: px(8), h: px(20) },
  { x: px(26), y: px(29), w: px(18), h: px(6) },
  { x: px(58), y: px(29), w: px(16), h: px(6) },
];

function inRect(x: number, y: number, r: { x: number; y: number; w: number; h: number }) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

function inHub(arcade: ArcadeWorld, x: number, y: number, grow = 0) {
  const rx = 12 * TILE + grow;
  const ry = 9 * TILE + grow;
  const dx = (x - arcade.center.x) / rx;
  const dy = (y - arcade.center.y) / ry;

  return dx * dx + dy * dy <= 1;
}

function isIsland(x: number, y: number) {
  return x >= px(4) && x <= px(92) && y >= px(4) && y <= px(60);
}

function isReserved(arcade: ArcadeWorld, x: number, y: number) {
  if (!isIsland(x, y)) return true;
  if (inHub(arcade, x, y, TILE * 1.2)) return true;

  for (const lane of LANES) {
    if (inRect(x, y, lane)) return true;
  }

  for (const zone of arcade.zones) {
    const w = 4.6 * TILE;
    const h = 4.2 * TILE;

    if (Math.abs(x - zone.center.x) < w && Math.abs(y - zone.center.y) < h) return true;
  }

  if (Math.abs(x - arcade.portal.x) < 4 * TILE && Math.abs(y - arcade.portal.y) < 5 * TILE) {
    return true;
  }

  return false;
}

function paintVoid(ctx: Ctx, arcade: ArcadeWorld) {
  const width = arcade.w * TILE;
  const height = arcade.h * TILE;
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#07060f");
  gradient.addColorStop(0.45, "#0b0820");
  gradient.addColorStop(1, "#080612");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  const random = rng("arcade-dimension-void");

  for (let index = 0; index < 520; index += 1) {
    const x = random() * width;
    const y = random() * height;
    const size = 0.6 + random() * 1.9;
    const palette = ["#e8f2ff", "#b9c8ff", "#ffd9a0", "#9fd8ff", "#ffc2da"];
    ctx.globalAlpha = 0.16 + random() * 0.72;
    ctx.fillStyle = palette[Math.floor(random() * palette.length)];
    ctx.fillRect(x, y, size, size);
  }

  ctx.globalAlpha = 1;

  for (const [x, y, radius, color] of [
    [width * 0.16, height * 0.24, 260, "rgba(120, 80, 240, 0.16)"],
    [width * 0.82, height * 0.72, 300, "rgba(46, 199, 192, 0.1)"],
    [width * 0.55, height * 0.16, 210, "rgba(255, 122, 184, 0.08)"],
    [width * 0.3, height * 0.86, 240, "rgba(80, 120, 255, 0.07)"],
  ] as Array<[number, number, number, string]>) {
    const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
    glow.addColorStop(0, color);
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }

  // Distant floating blocks give the void a sense of scale.
  for (let index = 0; index < 14; index += 1) {
    const angle = random() * Math.PI * 2;
    const distance = 0.5 + random() * 0.48;
    const x = width / 2 + Math.cos(angle) * width * distance * 0.55;
    const y = height / 2 + Math.sin(angle) * height * distance * 0.52;
    const size = 6 + random() * 16;
    const accent = ["#56e0ff", "#b9a6ff", "#ff7ab8", "#ffd166"][index % 4];

    ctx.globalAlpha = 0.35 + random() * 0.3;
    poly(
      ctx,
      [
        [x, y - size],
        [x + size, y - size * 0.35],
        [x, y + size * 0.2],
        [x - size, y - size * 0.35],
      ],
      "#1d1830",
    );
    poly(
      ctx,
      [
        [x - size, y - size * 0.35],
        [x, y + size * 0.2],
        [x, y + size],
        [x - size, y + size * 0.4],
      ],
      "#131022",
    );
    poly(
      ctx,
      [
        [x + size, y - size * 0.35],
        [x, y + size * 0.2],
        [x, y + size],
        [x + size, y + size * 0.4],
      ],
      "#0c0a17",
    );
    rect(ctx, x - size * 0.8, y - size * 0.3, size * 0.5, 1, accent);
  }

  ctx.globalAlpha = 1;

  // A distant arcade planet with a ring.
  const planetX = width * 0.82;
  const planetY = height * 0.24;
  const planetGlow = ctx.createRadialGradient(planetX, planetY, 0, planetX, planetY, 120);
  planetGlow.addColorStop(0, "rgba(255, 122, 184, 0.16)");
  planetGlow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = planetGlow;
  ctx.fillRect(planetX - 120, planetY - 120, 240, 240);
  ellipse(ctx, planetX, planetY, 52, 18, "rgba(185, 166, 255, 0.18)");
  circle(ctx, planetX, planetY, 31, "#17102a");
  circle(ctx, planetX - 4, planetY - 4, 25, "#24183a");
  ctx.strokeStyle = "rgba(255, 122, 184, 0.3)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.ellipse(planetX, planetY, 54, 12, -0.2, 0, Math.PI * 2);
  ctx.stroke();
}

function paintIsland(ctx: Ctx, arcade: ArcadeWorld) {
  const island = arcade.island;
  const corner = 3 * TILE;
  const islandPath = () => {
    ctx.beginPath();
    ctx.moveTo(island.x + corner, island.y);
    ctx.lineTo(island.x + island.w - corner, island.y);
    ctx.lineTo(island.x + island.w, island.y + corner);
    ctx.lineTo(island.x + island.w, island.y + island.h - corner);
    ctx.lineTo(island.x + island.w - corner, island.y + island.h);
    ctx.lineTo(island.x + corner, island.y + island.h);
    ctx.lineTo(island.x, island.y + island.h - corner);
    ctx.lineTo(island.x, island.y + corner);
    ctx.closePath();
  };

  // Deep cliff shadow.
  ctx.save();
  ctx.translate(0, 14);
  ctx.globalAlpha = 0.5;
  islandPath();
  ctx.fillStyle = "#020208";
  ctx.fill();
  ctx.restore();

  // Cliff faces.
  ctx.save();
  ctx.translate(0, 20);
  islandPath();
  ctx.fillStyle = "#141022";
  ctx.fill();
  ctx.translate(0, -6);
  islandPath();
  ctx.fillStyle = "#221b33";
  ctx.fill();
  ctx.restore();

  islandPath();
  ctx.fillStyle = "#2a2436";
  ctx.fill();
  ctx.save();
  islandPath();
  ctx.clip();

  // Block grass and stone surface.
  rect(ctx, island.x, island.y, island.w, island.h, "#26403e");
  const random = rng("arcade-island-blocks");

  for (let y = island.y; y < island.y + island.h; y += TILE) {
    for (let x = island.x; x < island.x + island.w; x += TILE) {
      const value = hash(x / TILE, y / TILE);
      ctx.fillStyle =
        value > 0.78 ? "#31514b" : value > 0.46 ? "#2b4a45" : value > 0.2 ? "#27433f" : "#243c39";
      ctx.fillRect(x, y, TILE, TILE);
      rect(ctx, x, y, TILE, 1, "rgba(190, 240, 220, 0.06)");
      rect(ctx, x, y, 1, TILE, "rgba(0, 0, 0, 0.08)");

      if (value > 0.9) {
        rect(ctx, x + 6, y + 4, 2, 2, "rgba(170, 230, 180, 0.32)");
        rect(ctx, x + 4, y + 9, 1, 1, "rgba(170, 230, 180, 0.22)");
      }
    }
  }

  // Darker moss/stone patches.
  for (let index = 0; index < 32; index += 1) {
    const x = island.x + random() * island.w;
    const y = island.y + random() * island.h;
    const radius = 18 + random() * 60;
    const patch = ctx.createRadialGradient(x, y, 0, x, y, radius);
    patch.addColorStop(0, "rgba(12, 26, 28, 0.28)");
    patch.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = patch;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }

  ctx.restore();

  // Lit block rim.
  islandPath();
  ctx.strokeStyle = "#4d5f5a";
  ctx.lineWidth = 4;
  ctx.stroke();
  islandPath();
  ctx.strokeStyle = "rgba(120, 220, 200, 0.15)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Hanging edge blocks and lights.
  for (let index = 0; index < 30; index += 1) {
    const x = island.x + random() * island.w;
    const y = island.y + island.h - random() * 5;
    rect(ctx, x, y, 8 + random() * 12, 3 + random() * 7, "#1c1728");
    rect(ctx, x + 2, y, 3 + random() * 5, 1, "rgba(255, 122, 184, 0.16)");
  }

  for (let index = 0; index < 10; index += 1) {
    const x = island.x + 24 + random() * (island.w - 48);
    const y = island.y + island.h - 3;
    rect(ctx, x, y - 10, 1, 12, "#4d3b4a");
    circle(ctx, x, y - 12, 2.2 + random(), "rgba(255, 215, 140, 0.45)");
  }

  // The underside of the floating island: block strata and lit cracks.
  const bottom = island.y + island.h;

  for (let layer = 0; layer < 4; layer += 1) {
    const inset = 10 + layer * 12;
    const y = bottom + layer * 9;
    rect(
      ctx,
      island.x + inset,
      y,
      island.w - inset * 2,
      9,
      layer % 2 === 0 ? "#171322" : "#201a2d",
    );
    rect(ctx, island.x + inset, y, island.w - inset * 2, 1, "rgba(120, 100, 150, 0.15)");

    for (let index = 0; index < 9; index += 1) {
      const x = island.x + inset + 20 + random() * (island.w - inset * 2 - 40);
      rect(ctx, x, y + 2, 5 + random() * 8, 4 + random() * 5, "#12101c");
      if (index % 3 === 0) {
        rect(ctx, x + 2, y + 3, 2, 2, "rgba(86, 224, 255, 0.2)");
      }
    }
  }

  // Near floating chunks.
  for (let index = 0; index < 9; index += 1) {
    const side = index % 2 === 0 ? -1 : 1;
    const x = island.x + (side < 0 ? 8 : island.w - 8) + side * (12 + random() * 46);
    const y = island.y + 80 + random() * (island.h - 110);
    const size = 7 + random() * 15;
    const accent = index % 3 === 0 ? "#56e0ff" : index % 3 === 1 ? "#ff7ab8" : "#b9a6ff";

    poly(
      ctx,
      [
        [x, y - size],
        [x + size, y - size * 0.3],
        [x, y + size * 0.25],
        [x - size, y - size * 0.3],
      ],
      "#201a30",
    );
    poly(
      ctx,
      [
        [x - size, y - size * 0.3],
        [x, y + size * 0.25],
        [x, y + size],
        [x - size, y + size * 0.4],
      ],
      "#15111f",
    );
    poly(
      ctx,
      [
        [x + size, y - size * 0.3],
        [x, y + size * 0.25],
        [x, y + size],
        [x + size, y + size * 0.4],
      ],
      "#0e0b16",
    );
    rect(ctx, x - size * 0.7, y - size * 0.2, size * 0.6, 1, `${accent}88`);
  }

  // Neon water falling off the island edge.
  for (const [wx, color] of [
    [island.x + 22 * TILE, "#56e0ff"],
    [island.x + 66 * TILE, "#ff7ab8"],
  ] as Array<[number, string]>) {
    const wy = bottom - 6;
    const fall = ctx.createLinearGradient(0, wy, 0, wy + 90);
    fall.addColorStop(0, `${color}99`);
    fall.addColorStop(0.55, `${color}44`);
    fall.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = fall;
    ctx.fillRect(wx - 9, wy, 18, 88);
    rect(ctx, wx - 12, wy - 2, 4, 8, "#233b49");
    rect(ctx, wx + 8, wy - 2, 4, 8, "#233b49");
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = "#d6fbff";

    for (let index = 0; index < 8; index += 1) {
      ctx.fillRect(wx - 7 + (index % 3) * 5, wy + 5 + index * 9, 2, 4);
    }

    ctx.globalAlpha = 1;
    glow2(ctx, wx, wy + 50, 24, color, 0.14);
  }
}

function paintPath(ctx: Ctx, lane: { x: number; y: number; w: number; h: number }, accent: string) {
  rect(ctx, lane.x - 3, lane.y - 3, lane.w + 6, lane.h + 6, "rgba(0,0,0,0.28)");
  rect(ctx, lane.x - 2, lane.y - 2, lane.w + 4, 4, "#53646a");
  rect(ctx, lane.x - 2, lane.y - 2, lane.w + 4, 1, "#7c8f92");
  rect(ctx, lane.x, lane.y, lane.w, lane.h, "#2e2840");
  rect(ctx, lane.x, lane.y, lane.w, 2, "#4f4562");
  rect(ctx, lane.x, lane.y + lane.h - 2, lane.w, 2, "#1b1628");

  for (let x = lane.x + TILE; x < lane.x + lane.w; x += TILE) {
    rect(ctx, x, lane.y, 1, lane.h, "rgba(255,255,255,0.035)");
  }

  for (let y = lane.y + TILE; y < lane.y + lane.h; y += TILE) {
    rect(ctx, lane.x, y, lane.w, 1, "rgba(255,255,255,0.035)");
  }

  ctx.strokeStyle = "rgba(86, 224, 255, 0.3)";
  ctx.lineWidth = 1;
  ctx.strokeRect(lane.x + 4, lane.y + 4, lane.w - 8, lane.h - 8);

  ctx.setLineDash([5, 7]);
  ctx.strokeStyle = "rgba(255, 209, 102, 0.46)";
  ctx.lineWidth = 1.2;

  if (lane.w > lane.h) {
    line(
      ctx,
      lane.x + 12,
      lane.y + lane.h / 2,
      lane.x + lane.w - 12,
      lane.y + lane.h / 2,
      "rgba(255, 209, 102, 0.32)",
      1.2,
    );
  } else {
    line(
      ctx,
      lane.x + lane.w / 2,
      lane.y + 12,
      lane.x + lane.w / 2,
      lane.y + lane.h - 12,
      "rgba(255, 209, 102, 0.32)",
      1.2,
    );
  }

  ctx.setLineDash([]);

  // Block seams and little inlaid tokens.
  for (let index = 0; index < Math.max(2, Math.floor(lane.h / 50)); index += 1) {
    const y = lane.y + 20 + index * 48;

    if (y > lane.y + lane.h - 12) break;

    rect(ctx, lane.x + 6, y, 3, 3, accent);
  }
}

function paintPromenade(ctx: Ctx, arcade: ArcadeWorld) {
  for (const lane of LANES) {
    paintPath(ctx, lane, "#d9b06a");
  }

  // Hub court.
  ellipse(ctx, arcade.center.x, arcade.center.y, 12 * TILE, 9 * TILE, "#181521");
  ellipse(ctx, arcade.center.x, arcade.center.y, 11.4 * TILE, 8.4 * TILE, "#242033");

  for (let ring = 1; ring <= 5; ring += 1) {
    ctx.strokeStyle = ring % 2 === 0 ? "rgba(86, 224, 255, 0.19)" : "rgba(185, 166, 255, 0.14)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.ellipse(
      arcade.center.x,
      arcade.center.y,
      (12 * TILE * ring) / 5.4,
      (9 * TILE * ring) / 5.4,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }

  for (let index = 0; index < 24; index += 1) {
    const angle = (index / 24) * Math.PI * 2;
    const x = arcade.center.x + Math.cos(angle) * 10.4 * TILE;
    const y = arcade.center.y + Math.sin(angle) * 7.8 * TILE;
    rect(ctx, x, y, 2.2, 2.2, index % 2 === 0 ? "#56e0ff" : "#b9a6ff");
  }

  // Red carpet from the street door to the hub.
  const carpetX = arcade.portal.x - 18;
  const carpetTop = arcade.center.y + 7.4 * TILE;

  rect(ctx, carpetX, carpetTop, 36, arcade.portal.y - carpetTop - 12, "#4f1b26");
  rect(ctx, carpetX, carpetTop, 3, arcade.portal.y - carpetTop - 12, "#9a6b3a");
  rect(ctx, carpetX + 33, carpetTop, 3, arcade.portal.y - carpetTop - 12, "#9a6b3a");

  for (let index = 0; index < 8; index += 1) {
    const y = carpetTop + 18 + index * 42;
    rect(ctx, carpetX + 6, y, 24, 1, "rgba(255, 196, 108, 0.14)");
  }
}

function paintBlockTree(ctx: Ctx, x: number, y: number, scale: number, random: () => number) {
  const height = 12 * scale;
  ellipse(ctx, x + 3, y + 2, 8 * scale, 3 * scale, "rgba(0,0,0,0.25)");
  rect(ctx, x - 1.5 * scale, y - height, 3 * scale, height, "#5a4935");

  const green = random() > 0.7 ? "#3e7a62" : random() > 0.45 ? "#356b4c" : "#2f6040";
  for (let level = 0; level < 3; level += 1) {
    const w = (15 - level * 3) * scale;
    const yy = y - height - level * 5 * scale;
    rect(ctx, x - w / 2, yy, w, 5 * scale, green);
    rect(ctx, x - w / 2, yy, w, 1, "rgba(170, 230, 190, 0.2)");
  }

  circle(ctx, x + 3, y - height - 6 * scale, 1.2, "rgba(255, 217, 138, 0.5)");
}

function paintLantern(ctx: Ctx, x: number, y: number, accent = "#ffd98a") {
  circle(ctx, x, y, 2.4, accent);
  circle(ctx, x, y, 1.2, "#fff1c9");
  glow2(ctx, x, y, 14, accent, 0.2);
}

function glow2(ctx: Ctx, x: number, y: number, radius: number, color: string, alpha = 0.25) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = gradient;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  ctx.restore();
}

function paintGarden(ctx: Ctx, arcade: ArcadeWorld) {
  const random = rng("arcade-garden");
  let placed = 0;
  let attempts = 0;

  while (placed < 92 && attempts < 1400) {
    attempts += 1;
    const x = px(4) + random() * px(88);
    const y = px(4) + random() * px(56);

    if (isReserved(arcade, x, y)) continue;

    const kind = random();
    const scale = 0.7 + random() * 0.7;

    if (kind > 0.62) {
      paintBlockTree(ctx, x, y, scale, random);
    } else if (kind > 0.42) {
      ellipse(ctx, x, y, 7 * scale, 3 * scale, "rgba(0,0,0,0.2)");
      rect(ctx, x - 3, y - 5, 6, 5, "#303a3a");
      rect(ctx, x - 2, y - 7, 4, 3, "#465656");
      rect(ctx, x - 1, y - 8, 2, 2, "#7cc36a");
    } else if (kind > 0.25) {
      circle(ctx, x, y, 2 + random() * 2, random() > 0.5 ? "#6f5d92" : "#4b7c6f");
      circle(ctx, x - 1, y - 1, 1, "rgba(190, 255, 240, 0.3)");
    } else {
      rect(ctx, x, y, 5, 2, "#3a4a45");
      rect(ctx, x + 2, y - 2, 1, 2, "#7cc36a");
    }

    placed += 1;
  }

  // Path lamps.
  for (const [lx, ly] of [
    [27.2, 22],
    [27.2, 34],
    [27.2, 46],
    [68.8, 22],
    [68.8, 34],
    [68.8, 46],
    [34, 17.8],
    [47, 17.8],
    [60, 17.8],
    [47.8, 48],
    [41.4, 52.6],
    [54.6, 52.6],
  ] as Array<[number, number]>) {
    const x = px(lx);
    const y = px(ly);
    ellipse(ctx, x + 2, y + 2, 6, 2.4, "rgba(0,0,0,0.24)");
    rect(ctx, x - 1, y - 24, 2, 24, "#4a3f32");
    circle(ctx, x, y - 26, 3.4, "#ffe6ac");
    circle(ctx, x, y - 26, 1.6, "#fff8d8");
    glow2(ctx, x, y - 26, 22, "#ffd98a", 0.16);
  }

  // Fixed garden clusters and benches.
  for (const [gx, gy] of [
    [31, 22],
    [64, 21],
    [31, 43],
    [64, 43],
    [36, 27],
    [59, 34],
    [40, 47],
    [56, 47],
  ] as Array<[number, number]>) {
    const x = px(gx);
    const y = px(gy);
    paintBlockTree(ctx, x, y, 1.05, () => 0.3);
    rect(ctx, x + 12, y + 2, 2, 6, "#7cc36a");
    circle(ctx, x + 13, y, 2.2, "#ffc2da");
  }

  for (const [bx, by] of [
    [29, 26],
    [67, 26],
    [29, 38],
    [67, 38],
  ] as Array<[number, number]>) {
    const x = px(bx);
    const y = px(by);
    ellipse(ctx, x + 2, y + 4, 14, 4, "rgba(0,0,0,0.24)");
    rect(ctx, x - 12, y - 2, 24, 5, "#6d4b2f");
    rect(ctx, x - 12, y - 2, 24, 1, "#9a6b3f");
    rect(ctx, x - 10, y + 3, 2, 4, "#3b2e23");
    rect(ctx, x + 8, y + 3, 2, 4, "#3b2e23");
  }

  // Small block ponds.
  for (const [pondX, pondY] of [
    [34, 22],
    [62, 41],
  ] as Array<[number, number]>) {
    const x = px(pondX);
    const y = px(pondY);
    ellipse(ctx, x, y, 34, 20, "#1b3040");
    ellipse(ctx, x, y - 2, 30, 16, "#205066");
    rect(ctx, x - 20, y - 6, 8, 1, "rgba(160, 230, 240, 0.2)");
    rect(ctx, x + 8, y + 3, 11, 1, "rgba(160, 230, 240, 0.15)");
    ellipse(ctx, x - 15, y + 6, 7, 3.4, "#4f7a45");
    circle(ctx, x + 14, y - 4, 2.2, "#ffc2da");
    ellipse(ctx, x, y + 8, 36, 3, "#5d564b");
  }
}

function paintCabinet(ctx: Ctx, x: number, y: number, accent: string, scale = 1) {
  ellipse(ctx, x + 2 * scale, y + 3 * scale, 10 * scale, 3.5 * scale, "rgba(0,0,0,0.3)");
  rect(ctx, x - 9 * scale, y - 17 * scale, 18 * scale, 23 * scale, "#1a1623");
  rect(ctx, x - 9 * scale, y - 17 * scale, 18 * scale, 2 * scale, "#3f354d");
  rect(ctx, x - 7 * scale, y - 14 * scale, 14 * scale, 10 * scale, "#08070f");
  const screen = ctx.createLinearGradient(x, y - 14 * scale, x, y - 3 * scale);
  screen.addColorStop(0, accent);
  screen.addColorStop(1, "rgba(0,0,0,0)");
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = screen;
  ctx.fillRect(x - 7 * scale, y - 14 * scale, 14 * scale, 10 * scale);
  ctx.globalAlpha = 1;
  rect(ctx, x - 7 * scale, y - 2 * scale, 14 * scale, 3 * scale, "#2a2536");
  circle(ctx, x - 2.5 * scale, y + 4 * scale, 1.4 * scale, accent);
  circle(ctx, x + 3 * scale, y + 4 * scale, 1.4 * scale, "#e8dcc0");
  rect(ctx, x - 7 * scale, y + 7 * scale, 14 * scale, 1, "#3f354d");
  glow2(ctx, x, y - 9 * scale, 16 * scale, accent, 0.13);
}

function paintHub(ctx: Ctx, arcade: ArcadeWorld) {
  const cx = arcade.center.x;
  const cy = arcade.center.y;

  // Reflected joystick on the polished court.
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx, cy, 11.2 * TILE, 8.2 * TILE, 0, 0, Math.PI * 2);
  ctx.clip();
  ctx.globalAlpha = 0.16;
  ctx.translate(0, cy * 2 + 6);
  ctx.scale(1, -1);
  ctx.translate(0, 0);
  drawJoystickMonument(ctx, cx, cy);
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx, cy, 11.2 * TILE, 8.2 * TILE, 0, 0, Math.PI * 2);
  ctx.clip();

  for (let y = cy + 4; y < cy + 9 * TILE; y += 4) {
    ctx.fillStyle = "rgba(6, 5, 14, 0.22)";
    ctx.fillRect(cx - 11 * TILE, y, 22 * TILE, 1);
  }

  ctx.restore();

  // Central dais and joystick.
  glow2(ctx, cx, cy - 38, 120, "#ff5fae", 0.1);
  glow2(ctx, cx, cy - 20, 150, "#56e0ff", 0.08);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(2.45, 2.45);
  drawJoystickMonument(ctx, 0, 0);
  ctx.restore();

  // Arcade cabinets around the pavilion.
  for (const [angle, accent] of [
    [Math.PI * 0.08, "#56e0ff"],
    [Math.PI * 0.26, "#ff7ab8"],
    [Math.PI * 0.44, "#ffd166"],
    [Math.PI * 0.62, "#b9a6ff"],
    [Math.PI * 0.86, "#7cc36a"],
    [Math.PI * 1.06, "#ff9f43"],
    [Math.PI * 1.28, "#56e0ff"],
  ] as Array<[number, string]>) {
    const x = cx + Math.cos(angle) * 9.4 * TILE;
    const y = cy + Math.sin(angle) * 6.9 * TILE;
    paintCabinet(ctx, x, y, accent, 1.65);
  }

  // Token fountain.
  const fx = cx;
  const fy = cy + 6.4 * TILE;
  ellipse(ctx, fx, fy + 10, 32, 10, "rgba(0,0,0,0.35)");
  ellipse(ctx, fx, fy + 2, 30, 10, "#4a4036");
  ellipse(ctx, fx, fy - 3, 26, 8, "#75634c");
  ellipse(ctx, fx, fy - 6, 19, 5.6, "#2a5c70");
  circle(ctx, fx, fy - 16, 5, "#d9b06a");
  for (let index = 0; index < 12; index += 1) {
    const angle = (index / 12) * Math.PI * 2;
    ellipse(
      ctx,
      fx + Math.cos(angle) * (15 + (index % 3) * 3),
      fy + Math.sin(angle) * (6 + (index % 2) * 2),
      2.3,
      1,
      "#ffd98a",
    );
  }
  glow2(ctx, fx, fy - 6, 30, "#ffd98a", 0.18);

  // String lights across the hub.
  for (const [x0, y0, x1, y1] of [
    [cx - 9.6 * TILE, cy - 6.8 * TILE, cx + 9.6 * TILE, cy - 6.8 * TILE],
    [cx - 11 * TILE, cy - 1 * TILE, cx + 11 * TILE, cy - 1 * TILE],
  ] as Array<[number, number, number, number]>) {
    ctx.strokeStyle = "rgba(120, 100, 150, 0.5)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.quadraticCurveTo(cx, y0 + 14, x1, y1);
    ctx.stroke();

    for (let index = 0; index < 9; index += 1) {
      const t = index / 8;
      const x = x0 + (x1 - x0) * t;
      const y = y0 + 14 * Math.sin(Math.PI * t);
      circle(ctx, x, y, 1.4, "#ffe6ac");
      glow2(ctx, x, y, 8, "#ffd98a", 0.12);
    }
  }

  // Benches and planters.
  for (const side of [-1, 1]) {
    const bx = cx + side * 10.8 * TILE;
    const by = cy + 1.5 * TILE;
    ellipse(ctx, bx, by + 4, 15, 4, "rgba(0,0,0,0.25)");
    rect(ctx, bx - 13, by - 2, 26, 5, "#6d4b2f");
    rect(ctx, bx - 13, by - 2, 26, 1, "#9a6b3f");
    rect(ctx, bx - 11, by + 3, 2, 4, "#423327");
    rect(ctx, bx + 9, by + 3, 2, 4, "#423327");
  }
}

function plotBounds(zone: ArcadeZoneSpot) {
  return {
    x: zone.center.x - 4 * TILE,
    y: zone.center.y - 3.5 * TILE,
    w: 8 * TILE,
    h: 7 * TILE,
  };
}

function paintZoneGround(ctx: Ctx, zone: ArcadeZoneSpot, theme: string, accent: string) {
  const plot = plotBounds(zone);
  const inner = { x: plot.x + TILE, y: plot.y + TILE, w: plot.w - TILE * 2, h: plot.h - TILE * 2 };

  ellipse(ctx, plot.x + plot.w / 2, plot.y + plot.h + 7, plot.w * 0.5, 14, "rgba(0,0,0,0.34)");
  rect(ctx, plot.x - 2, plot.y + plot.h, plot.w + 4, 5, "#3f4f52");
  rect(ctx, plot.x - 2, plot.y + plot.h, plot.w + 4, 1, "#6f8484");
  rect(ctx, plot.x, plot.y, plot.w, plot.h, "#332e40");
  rect(ctx, plot.x, plot.y, plot.w, 3, "#6b5f78");
  rect(ctx, plot.x, plot.y, plot.w, 1, "#907f9f");
  rect(ctx, plot.x, plot.y + plot.h - 3, plot.w, 3, "#1b1624");
  rect(ctx, plot.x, plot.y, 2, plot.h, "#4a4054");
  rect(ctx, plot.x + plot.w - 2, plot.y, 2, plot.h, "#4a4054");

  const palettes: Record<string, [string, string, string]> = {
    road: ["#3d3d46", "#4a4a54", "#d9b06a"],
    liberty: ["#5b5a56", "#6e6c65", "#ffd166"],
    neon: ["#4d2c55", "#633b5f", "#ff7ab8"],
    brick: ["#5d4540", "#70524a", "#e85d5d"],
    sunset: ["#7b5e43", "#8b6a48", "#ff9f43"],
    creed: ["#6a645b", "#797166", "#f2ecdd"],
    ctos: ["#244756", "#2d5a6a", "#56e0ff"],
    blocks: ["#4f7a45", "#5d8e51", "#7cc36a"],
    ship: ["#3b414d", "#4a5260", "#e85d5d"],
    temple: ["#5e4f3e", "#706049", "#ffcf33"],
    war: ["#5b563d", "#6d6848", "#9aa46a"],
    snow: ["#b5c5ca", "#9fadb5", "#6fa8dc"],
    dojo: ["#684e37", "#7b5e44", "#b58cff"],
    pitch: ["#3b6f4b", "#45895b", "#e8f2f2"],
    crease: ["#a28556", "#b79862", "#d9a066"],
    ring: ["#4e343d", "#5f4049", "#ffd166"],
    jungle: ["#3c6149", "#487558", "#5fd3a6"],
  };
  const [base, alt] = palettes[theme] ?? ["#2f2c35", "#39353e", accent];

  rect(ctx, inner.x, inner.y, inner.w, inner.h, base);

  for (let y = inner.y; y < inner.y + inner.h; y += TILE) {
    for (let x = inner.x; x < inner.x + inner.w; x += TILE) {
      const value = hash(x / TILE + 17, y / TILE + 9);
      ctx.fillStyle = value > 0.72 ? alt : base;
      ctx.fillRect(x, y, TILE, TILE);
      rect(ctx, x, y, TILE, 1, "rgba(255,255,255,0.035)");
    }
  }

  // Curb blocks.
  for (let x = plot.x; x < plot.x + plot.w; x += TILE) {
    rect(ctx, x, plot.y, TILE - 1, 3, "#3b3643");
    rect(ctx, x, plot.y + plot.h - 3, TILE - 1, 3, "#241f2b");
  }

  // Theme-specific ground cues.
  if (theme === "road") {
    for (let index = 0; index < 3; index += 1) {
      rect(ctx, inner.x + 10 + index * 30, inner.y + 18 + index * 14, 18, 2, "#d9b06a");
    }
  } else if (theme === "pitch" || theme === "crease") {
    for (let index = 0; index < 4; index += 1) {
      rect(ctx, inner.x + 6, inner.y + 4 + index * 10, inner.w - 12, 1, "rgba(240,255,240,0.1)");
    }

    if (theme === "crease") {
      rect(ctx, inner.x + inner.w / 2 - 5, inner.y + 3, 10, inner.h - 6, "#c7a873");
    }
  } else if (theme === "ctos" || theme === "ship") {
    for (let index = 0; index < 7; index += 1) {
      rect(ctx, inner.x + 7 + index * 12, inner.y + 5, 1, inner.h - 10, "rgba(86, 224, 255, 0.14)");
    }
  } else if (theme === "neon") {
    for (let index = 0; index < 4; index += 1) {
      rect(ctx, inner.x, inner.y + 8 + index * 13, inner.w, 1, "rgba(255, 122, 184, 0.15)");
    }
  } else if (theme === "temple" || theme === "dojo") {
    for (let index = 0; index < 6; index += 1) {
      rect(ctx, inner.x, inner.y + 6 + index * 10, inner.w, 1, "rgba(255, 209, 102, 0.08)");
    }
  } else if (theme === "blocks") {
    for (let index = 0; index < 9; index += 1) {
      const x = inner.x + 6 + (index % 3) * 18;
      const y = inner.y + 8 + Math.floor(index / 3) * 14;
      rect(ctx, x, y, 8, 8, "rgba(124, 195, 106, 0.18)");
    }
  } else if (theme === "war" || theme === "snow") {
    for (let index = 0; index < 4; index += 1) {
      rect(ctx, inner.x + 5 + index * 20, inner.y + 6, 12, 1, "rgba(255,255,255,0.12)");
    }
  }

  // A floor-light strip at the front.
  const frontX = zone.front.x;
  const frontY = zone.front.y;
  rect(ctx, frontX - 26, frontY - 3, 52, 2, `${accent}66`);
  rect(ctx, frontX - 18, frontY - 5, 36, 1, `${accent}33`);
  glow2(ctx, frontX, frontY, 28, accent, 0.12);
}

function paintZoneProps(ctx: Ctx, zone: ArcadeZoneSpot, theme: string, accent: string) {
  const plot = plotBounds(zone);
  const left = plot.x + 10;
  const right = plot.x + plot.w - 10;
  const top = plot.y + 10;
  const bottom = plot.y + plot.h - 10;

  switch (theme) {
    case "road":
      paintBlockTree(ctx, left + 2, bottom - 2, 0.8, () => 0.3);
      rect(ctx, right - 20, top + 6, 15, 4, "#ffcf33");
      rect(ctx, right - 18, top + 3, 2, 4, "#5a4630");
      circle(ctx, right - 11, top + 13, 3, "#ff6b3d");
      break;
    case "liberty":
      rect(ctx, left, top + 8, 18, 6, "#33363d");
      rect(ctx, left + 2, top + 4, 14, 4, "#d8a92b");
      rect(ctx, left + 4, top + 2, 10, 2, "#f2d77a");
      paintLantern(ctx, right - 4, bottom - 12, "#ffd166");
      break;
    case "neon":
      for (const [x, flip] of [
        [left + 4, -1],
        [right - 4, 1],
      ] as Array<[number, number]>) {
        line(ctx, x, bottom - 2, x + flip * 4, top + 6, "#6d4b2f", 2);
        for (const [fx, fy] of [
          [-7, -2],
          [4, -4],
          [8, 3],
        ] as Array<[number, number]>) {
          line(ctx, x + flip * 4, top + 6, x + fx * flip, top + 6 + fy, "#ff7ab8", 1.3);
        }
      }
      break;
    case "brick":
      rect(ctx, left, bottom - 14, 14, 9, "#263c33");
      rect(ctx, left + 2, bottom - 12, 10, 2, "#3f5a48");
      circle(ctx, right - 6, top + 10, 4, "#efe6d2");
      circle(ctx, right - 4, top + 8, 1, "#b03a3a");
      break;
    case "sunset":
      rect(ctx, left, bottom - 14, 22, 2, "#b7b0a0");
      rect(ctx, left + 4, bottom - 18, 2, 6, "#5a4630");
      rect(ctx, right - 20, top + 4, 17, 10, "#3a2d2a");
      rect(ctx, right - 18, top + 6, 13, 5, "#ff9f43");
      break;
    case "creed":
      for (const x of [left + 3, right - 3]) {
        rect(ctx, x - 1, top + 2, 2, bottom - top - 4, "#4a3d2e");
        poly(
          ctx,
          [
            [x - 5, top + 3],
            [x + 5, top + 3],
            [x + 3, top + 11],
            [x - 4, top + 10],
          ],
          "#f2ecdd",
        );
        rect(ctx, x - 2, top + 5, 4, 2, "#b03a3a");
      }
      break;
    case "ctos":
      rect(ctx, right - 7, top + 2, 2, bottom - top - 4, "#3a4952");
      rect(ctx, right - 10, top + 2, 8, 5, "#222a30");
      circle(ctx, right - 5, top + 4, 1.8, "#56e0ff");
      rect(ctx, left, bottom - 12, 12, 9, "#1d2a33");
      rect(ctx, left + 2, bottom - 10, 3, 1, "#56e0ff");
      rect(ctx, left + 2, bottom - 7, 6, 1, "#56e0ff");
      break;
    case "blocks":
      paintBlockTree(ctx, right - 1, bottom - 2, 1.1, () => 0.3);
      rect(ctx, left, top + 4, 8, 8, "#7cc36a");
      rect(ctx, left, top + 10, 8, 5, "#6f543a");
      rect(ctx, left + 5, bottom - 12, 2, 7, "#5a4630");
      circle(ctx, left + 6, bottom - 14, 2, "#ffcf33");
      break;
    case "ship":
      rect(ctx, left, top + 5, 16, 7, "#252a31");
      for (let index = 0; index < 4; index += 1) {
        rect(ctx, left + 2 + index * 3.4, top + 7, 2, 3, "#4c5560");
      }
      for (const [x, y] of [
        [right - 5, top + 8],
        [right - 3, top + 9],
        [right - 6, top + 12],
      ] as Array<[number, number]>) {
        line(ctx, x - 5, y - 5, x, y, "#e85d5d", 1.2);
        circle(ctx, x, y, 1.4, "#e85d5d");
      }
      break;
    case "temple":
      for (const x of [left + 2, right - 2]) {
        rect(ctx, x - 2, bottom - 13, 4, 10, "#5a4a37");
        rect(ctx, x - 4, bottom - 15, 8, 3, "#8a6a48");
        circle(ctx, x, bottom - 17, 2.6, "#ff9f43");
        glow2(ctx, x, bottom - 17, 12, "#ff9f43", 0.15);
      }
      break;
    case "war":
      for (let index = 0; index < 3; index += 1) {
        rect(ctx, left - 2 + index * 5, bottom - 10 - index * 3, 12, 5, "#4c5138");
        rect(ctx, left - 2 + index * 5, bottom - 10 - index * 3, 12, 1, "#6b7050");
      }
      rect(ctx, right - 16, top + 3, 11, 6, "#3f4432");
      circle(ctx, right - 10, top + 6, 3.4, "#20251d");
      line(ctx, right - 10, top + 2, right - 5, top - 3, "#6fe36f", 1);
      break;
    case "snow":
      for (let index = 0; index < 3; index += 1) {
        rect(ctx, left, top + 5 + index * 9, 15, 7, "#6b7b82");
        rect(ctx, left + 1, top + 6 + index * 9, 13, 1.6, "#9eb2b8");
      }
      circle(ctx, right - 5, top + 5, 3, "#dceaf0");
      paintLantern(ctx, right - 4, bottom - 12, "#9fd8ff");
      break;
    case "dojo":
      rect(ctx, left, top + 4, 14, 2, "#2f2117");
      rect(ctx, left, bottom - 8, 14, 2, "#2f2117");
      for (let index = 0; index < 3; index += 1) {
        circle(ctx, right - 5, top + 6 + index * 6, 2.2, "#ffcf33");
        glow2(ctx, right - 5, top + 6 + index * 6, 9, "#ffcf33", 0.1);
      }
      break;
    case "pitch":
      for (const x of [left + 2, right - 2]) {
        rect(ctx, x, top + 4, 1.4, 12, "#e8f2f2");
        rect(ctx, x - 3, top + 4, 7, 3, "#56e0ff");
      }
      circle(ctx, right - 8, bottom - 8, 4, "#e8f2f2");
      circle(ctx, right - 8, bottom - 8, 1.4, "#2b2620");
      break;
    case "crease":
      ctx.strokeStyle = "#e8dcc0";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(left + 4, bottom - 4, 22, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
      for (let index = 0; index < 3; index += 1) {
        rect(ctx, right - 10 + index * 4, top + 4, 2, 12, "#e8dcc0");
      }
      break;
    case "ring":
      rect(ctx, left, top + 4, 22, 3, "#8a2f3a");
      rect(ctx, left, top + 18, 22, 3, "#8a2f3a");
      rect(ctx, left + 3, top + 2, 3, 22, "#5a4630");
      rect(ctx, left + 16, top + 2, 3, 22, "#5a4630");
      poly(
        ctx,
        [
          [right - 12, bottom - 3],
          [right - 5, bottom - 3],
          [right - 5, bottom - 15],
          [right - 8, bottom - 18],
          [right - 8, bottom - 12],
          [right - 12, bottom - 12],
        ],
        "#8f887a",
      );
      break;
    case "jungle":
      paintBlockTree(ctx, left + 1, bottom - 4, 0.9, () => 0.2);
      for (let index = 0; index < 3; index += 1) {
        rect(ctx, right - 10 + index * 4, top + 4, 2.4, 13, "#5a4630");
        circle(ctx, right - 8.8 + index * 4, top + 3, 2.2, "#ff6b3d");
        glow2(ctx, right - 8.8 + index * 4, top + 3, 9, "#ff6b3d", 0.12);
      }
      break;
  }

  // A subtle accent light across the plot.
  rect(ctx, plot.x + 2, plot.y + 2, plot.w - 4, 1, `${accent}44`);
}

function paintZoneSign(
  ctx: Ctx,
  zone: ArcadeZoneSpot,
  label: string,
  accent: string,
  index: number,
) {
  let x = zone.tourStop.x;
  let y = zone.tourStop.y - 2.8 * TILE;

  if (zone.zone.side === "left") {
    x = zone.tourStop.x + 2.6 * TILE;
  } else if (zone.zone.side === "right") {
    x = zone.tourStop.x - 2.6 * TILE;
  } else {
    x = zone.tourStop.x - 3.4 * TILE;
    y = zone.tourStop.y + 2.4 * TILE;
  }
  const width = 76;
  const height = 20;
  const top = y - 38;

  ellipse(ctx, x + 2, y + 2, width * 0.48, 4, "rgba(0,0,0,0.3)");
  rect(ctx, x - width / 2 + 5, top + height, 3, 22, "#5b4a39");
  rect(ctx, x + width / 2 - 8, top + height, 3, 22, "#5b4a39");
  rect(ctx, x - width / 2, top, width, height, "#17131f");
  rect(ctx, x - width / 2, top, width, 2, accent);
  rect(ctx, x - width / 2, top + height - 2, width, 2, "#574b65");

  for (let bulb = 0; bulb < 7; bulb += 1) {
    circle(ctx, x - width / 2 + 7 + bulb * 10.4, top - 3, 1.2, "#ffe6ac");
  }

  ctx.fillStyle = "#f2ecdd";
  const size = label.length > 15 ? 3.7 : label.length > 9 ? 4.3 : 4.9;
  ctx.font = `600 ${size}px "Geist Mono", ui-monospace, monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, x, top + 10);
  ctx.fillStyle = accent;
  ctx.fillRect(x - 14, top + 15, 28, 1);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  glow2(ctx, x, top + 8, 36, accent, 0.12);

  // Number token on the promenade at the tour stop.
  const tx = zone.tourStop.x;
  const ty = zone.tourStop.y + 11.5;
  circle(ctx, tx, ty, 7.2, "#16121f");
  circle(ctx, tx, ty, 6.4, accent);
  circle(ctx, tx, ty, 5.2, "#1b1725");
  ctx.fillStyle = "#f2ecdd";
  ctx.font = '700 5.4px "Geist Mono", ui-monospace, monospace';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(index + 1), tx, ty + 0.5);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
}

function paintZone(ctx: Ctx, zone: ArcadeZoneSpot, index: number) {
  const theme = zone.zone.theme;
  const accent = ZONE_COLOR[zone.statue.id] ?? zone.statue.paint;
  const label = ZONE_LABEL[zone.statue.id] ?? zone.statue.game.toUpperCase();

  paintZoneGround(ctx, zone, theme, accent);
  paintZoneProps(ctx, zone, theme, accent);

  // The game building itself, upright and facing the promenade.
  glow2(ctx, zone.center.x, zone.center.y - 10, 72, accent, 0.1);
  paintGameBuilding(ctx, zone);

  paintZoneSign(ctx, zone, label, accent, index);

  // A little apron and threshold at the front door.
  ellipse(ctx, zone.front.x, zone.front.y + 7, 24, 6, "rgba(0,0,0,0.26)");
  rect(ctx, zone.front.x - 16, zone.front.y + 2, 32, 2, `${accent}66`);
  circle(ctx, zone.door.x - 12, zone.door.y - 4, 1.4, `${accent}aa`);
  circle(ctx, zone.door.x + 12, zone.door.y - 4, 1.4, `${accent}aa`);
}

function paintEntrance(ctx: Ctx, arcade: ArcadeWorld) {
  const x = arcade.portal.x;
  const y = arcade.portal.y;

  // Carpet and queue rail.
  rect(ctx, x - 28, y - 86, 56, 84, "#4f1b26");
  rect(ctx, x - 28, y - 86, 3, 84, "#9a6b3a");
  rect(ctx, x + 25, y - 86, 3, 84, "#9a6b3a");

  for (let index = 0; index < 4; index += 1) {
    rect(ctx, x - 20, y - 70 + index * 20, 40, 1, "rgba(255, 196, 108, 0.16)");
  }

  paintArcadeExit(ctx, x, y);
  drawArcadeDoorGlow(ctx, x, y, 0.8, 0.55, "exit");

  // Ticket booth.
  const bx = x - 92;
  const by = y - 42;

  rect(ctx, bx - 24, by - 28, 48, 42, "#2a2230");
  rect(ctx, bx - 34, by - 66, 68, 14, "#17131f");
  rect(ctx, bx - 34, by - 66, 68, 2, "#56e0ff");
  rect(ctx, bx - 34, by - 54, 68, 1, "#574b65");
  ctx.fillStyle = "#efe6d2";
  ctx.font = '600 4.2px "Geist Mono", ui-monospace, monospace';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("MEMORY TOUR", bx, by - 59);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  rect(ctx, bx - 28, by - 34, 56, 10, "#4b2433");
  rect(ctx, bx - 28, by - 34, 56, 2, "#b9854e");

  for (let index = 0; index < 7; index += 1) {
    rect(ctx, bx - 26 + index * 7.4, by - 32, 4, 7, index % 2 === 0 ? "#c8a05c" : "#e8d9a8");
  }

  rect(ctx, bx - 17, by - 18, 34, 15, "#0e1220");
  rect(ctx, bx - 15, by - 16, 30, 11, "#27364a");
  ctx.fillStyle = "#ffd98a";
  ctx.font = '600 4px "Geist Mono", ui-monospace, monospace';
  ctx.textAlign = "center";
  ctx.fillText("TOKENS", bx, by - 10);
  ctx.textAlign = "left";
  rect(ctx, bx - 20, by + 2, 40, 8, "#1c1a22");
  rect(ctx, bx - 14, by + 4, 28, 1, "#ffd98a");

  for (const side of [-1, 1]) {
    rect(ctx, x + side * 34, y - 46, 2, 38, "#5a4630");
    circle(ctx, x + side * 34, y - 48, 2.6, "#c8a05c");
  }
}

function paintZoneLights(ctx: Ctx, arcade: ArcadeWorld) {
  for (const zone of arcade.zones) {
    const accent = ZONE_COLOR[zone.statue.id] ?? zone.statue.paint;
    const x = zone.front.x;
    const y = zone.front.y;

    const pool = ctx.createRadialGradient(x, y, 0, x, y, 72);
    pool.addColorStop(0, `${accent}2c`);
    pool.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = pool;
    ctx.fillRect(x - 72, y - 72, 144, 144);

    // Short reflection of the zone light on the promenade.
    ctx.globalAlpha = 0.14;
    ctx.fillStyle = accent;

    for (let index = 0; index < 4; index += 1) {
      ctx.fillRect(x - 14 + index * 8, y + 10 + index * 2, 3, 8);
    }

    ctx.globalAlpha = 1;
  }
}

function paintAtmosphere(ctx: Ctx, arcade: ArcadeWorld) {
  const width = arcade.w * TILE;
  const height = arcade.h * TILE;
  const island = arcade.island;

  // A broad ambient wash makes the block palette readable while keeping the void dark.
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const islandWash = ctx.createRadialGradient(
    arcade.center.x,
    arcade.center.y - 40,
    60,
    arcade.center.x,
    arcade.center.y,
    520,
  );
  islandWash.addColorStop(0, "rgba(86, 224, 255, 0.055)");
  islandWash.addColorStop(0.5, "rgba(185, 166, 255, 0.03)");
  islandWash.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = islandWash;
  ctx.fillRect(island.x, island.y, island.w, island.h);
  ctx.restore();

  // Light shafts from above the island.
  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  for (const [x, widthPx, color] of [
    [island.x + 170, 120, "rgba(94, 196, 222, 0.045)"],
    [island.x + 530, 150, "rgba(180, 150, 255, 0.04)"],
    [island.x + 900, 130, "rgba(255, 122, 184, 0.035)"],
  ] as Array<[number, number, string]>) {
    const gradient = ctx.createLinearGradient(0, island.y, 0, island.y + island.h);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.8, "rgba(0,0,0,0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(x, island.y);
    ctx.lineTo(x + widthPx, island.y);
    ctx.lineTo(x + widthPx * 1.6, island.y + island.h);
    ctx.lineTo(x + widthPx * 0.2, island.y + island.h);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();

  // Edge vignette baked around the island.
  const edge = ctx.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) * 0.4,
    width / 2,
    height / 2,
    Math.max(width, height) * 0.72,
  );
  edge.addColorStop(0, "rgba(0,0,0,0)");
  edge.addColorStop(1, "rgba(2, 2, 8, 0.45)");
  ctx.fillStyle = edge;
  ctx.fillRect(0, 0, width, height);
}

export function paintArcadeDimension(arcade: ArcadeWorld): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = arcade.w * TILE;
  canvas.height = arcade.h * TILE;
  const ctx = canvas.getContext("2d");

  if (!ctx) return canvas;

  paintVoid(ctx, arcade);
  paintIsland(ctx, arcade);
  paintPromenade(ctx, arcade);
  paintGarden(ctx, arcade);
  paintHub(ctx, arcade);

  for (let index = 0; index < arcade.zones.length; index += 1) {
    paintZone(ctx, arcade.zones[index], index);
  }

  paintEntrance(ctx, arcade);
  paintZoneLights(ctx, arcade);
  paintAtmosphere(ctx, arcade);

  return canvas;
}
