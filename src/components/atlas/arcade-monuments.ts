import { TILE, type ArcadeStatueSpot } from "./atlas-world";

type Ctx = CanvasRenderingContext2D;

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

function line(
  ctx: Ctx,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  color: string,
  width = 1,
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();
}

function glow(ctx: Ctx, x: number, y: number, radius: number, color: string, alpha = 0.3) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

const STONE = "#837a6b";
const STONE_DARK = "#544e44";
const STONE_LIGHT = "#a89d8a";
const CREAM = "#efe6d2";
const GOLD = "#d9b06a";
const RED = "#b53a3a";

const SHORT_LABEL: Record<string, string> = {
  "gta-san-andreas": "GTA SAN ANDREAS",
  "gta-iii": "GTA III",
  "gta-vice-city": "GTA VICE CITY",
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

function drawNiche(ctx: Ctx, x: number, y: number, accent: string, seed: number) {
  const height = 90 + (seed % 8);
  const half = 26;
  const top = y - height;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x - half, y - 2);
  ctx.lineTo(x - half, top + 22);
  ctx.quadraticCurveTo(x - half, top, x - half + 14, top);
  ctx.lineTo(x + half - 14, top);
  ctx.quadraticCurveTo(x + half, top, x + half, top + 22);
  ctx.lineTo(x + half, y - 2);
  ctx.closePath();

  const interior = ctx.createLinearGradient(x, top, x, y);
  interior.addColorStop(0, "#0b0912");
  interior.addColorStop(0.55, "#13101b");
  interior.addColorStop(1, "#191521");
  ctx.fillStyle = interior;
  ctx.fill();
  ctx.clip();

  const wash = ctx.createRadialGradient(x, y - 30, 0, x, y - 30, height * 0.75);
  wash.addColorStop(0, accent);
  wash.addColorStop(0.38, `${accent}22`);
  wash.addColorStop(1, "rgba(0,0,0,0)");
  ctx.globalAlpha = 0.24;
  ctx.fillStyle = wash;
  ctx.fillRect(x - half, top, half * 2, height);

  const spotlight = ctx.createLinearGradient(x, top + 10, x, y);
  spotlight.addColorStop(0, accent);
  spotlight.addColorStop(1, "rgba(0,0,0,0)");
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = spotlight;
  ctx.beginPath();
  ctx.moveTo(x - 2, top + 14);
  ctx.lineTo(x + 2, top + 14);
  ctx.lineTo(x + 20, y);
  ctx.lineTo(x - 20, y);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;

  for (let index = 0; index < 22; index += 1) {
    const sx = x - half + ((seed * 13 + index * 23) % (half * 2));
    const sy = top + 10 + ((index * 37 + seed * 7) % (height - 24));
    ctx.globalAlpha = 0.14 + (index % 4) * 0.04;
    ctx.fillStyle = CREAM;
    ctx.fillRect(sx, sy, 1, 1);
  }

  ctx.globalAlpha = 1;
  ctx.restore();

  ctx.strokeStyle = "#3f3932";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x - half - 2, y - 2);
  ctx.lineTo(x - half - 2, top + 22);
  ctx.quadraticCurveTo(x - half - 2, top - 2, x - half + 12, top - 2);
  ctx.lineTo(x + half - 12, top - 2);
  ctx.quadraticCurveTo(x + half + 2, top - 2, x + half + 2, top + 22);
  ctx.lineTo(x + half + 2, y - 2);
  ctx.stroke();

  ctx.strokeStyle = accent;
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - half + 2, y - 6);
  ctx.lineTo(x - half + 2, top + 22);
  ctx.quadraticCurveTo(x - half + 2, top + 3, x - half + 12, top + 3);
  ctx.lineTo(x + half - 12, top + 3);
  ctx.quadraticCurveTo(x + half - 2, top + 3, x + half - 2, top + 22);
  ctx.lineTo(x + half - 2, y - 6);
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(x - half - 1, y - 6);
  ctx.lineTo(x - half - 1, top + 22);
  ctx.quadraticCurveTo(x - half - 1, top + 1, x - half + 12, top + 1);
  ctx.lineTo(x + half - 12, top + 1);
  ctx.stroke();

  rect(ctx, x - 3, top - 4, 6, 4, STONE_LIGHT);
  rect(ctx, x - 2, top - 3, 4, 1.4, "#d8c9a8");

  const lampX = x;
  const lampY = top + 12;
  line(ctx, lampX, top - 2, lampX, lampY - 5, "#4a3d2b", 1.2);
  poly(
    ctx,
    [
      [lampX - 5, lampY - 5],
      [lampX + 5, lampY - 5],
      [lampX + 3, lampY],
      [lampX - 3, lampY],
    ],
    "#6b5535",
  );
  circle(ctx, lampX, lampY + 1.5, 2.2, "#ffe4a2");
  glow(ctx, lampX, lampY + 2, 18, "rgba(255,217,138,0.9)", 0.2);

  const floorGlow = ctx.createLinearGradient(x, y - 18, x, y);
  floorGlow.addColorStop(0, "rgba(0,0,0,0)");
  floorGlow.addColorStop(1, accent);
  ctx.globalAlpha = 0.24;
  ctx.fillStyle = floorGlow;
  ctx.fillRect(x - half + 3, y - 18, half * 2 - 6, 16);
  ctx.globalAlpha = 1;
}

function drawDais(ctx: Ctx, x: number, y: number, accent: string) {
  ctx.save();
  ctx.globalAlpha = 0.28;
  ctx.fillStyle = "#020207";
  ctx.beginPath();
  ctx.moveTo(x - 16, y + 8);
  ctx.lineTo(x - 50, y + 1);
  ctx.lineTo(x - 42, y + 16);
  ctx.lineTo(x - 4, y + 16);
  ctx.fill();
  ctx.restore();

  ellipse(ctx, x, y + 7, 28, 9.4, "rgba(0,0,0,0.4)");
  ellipse(ctx, x, y + 2, 27, 8.8, "#403a32");
  ellipse(ctx, x, y - 1, 23, 7.2, STONE_DARK);
  ellipse(ctx, x, y - 3, 18, 5.4, "#6b6152");
  ellipse(ctx, x, y - 4, 12, 3.4, STONE_LIGHT);

  for (let index = 0; index < 7; index += 1) {
    const angle = (index / 7) * Math.PI * 2;
    rect(
      ctx,
      x + Math.cos(angle) * 16 - 0.8,
      y - 1 + Math.sin(angle) * 4.4,
      1.6,
      1.6,
      index % 2 === 0 ? accent : GOLD,
    );
  }

  glow(ctx, x, y - 4, 28, accent, 0.16);
}

function drawPlate(ctx: Ctx, x: number, y: number, label: string, accent: string, seed: number) {
  const width = 52;
  const top = y + 2;

  rect(ctx, x - width / 2, top, width, 9, "#3d372e");
  rect(ctx, x - width / 2 + 1, top + 1, width - 2, 7, "#5f5443");
  rect(ctx, x - width / 2 + 1, top + 1, width - 2, 1, "#8e7c5b");
  rect(ctx, x - width / 2 + 1, top + 7, width - 2, 1, "#2c271f");

  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(x - width / 2 + 4.5, top + 4.5, 1.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + width / 2 - 4.5, top + 4.5, 1.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#efe4c8";
  const size = label.length > 13 ? 3.1 : label.length > 9 ? 3.7 : 4.4;
  ctx.font = `600 ${size}px "Geist Mono", ui-monospace, monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(0,0,0,0.7)";
  ctx.shadowBlur = 1;
  ctx.fillText(label, x, top + 4.6);
  ctx.shadowBlur = 0;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  if (seed % 3 === 0) {
    rect(ctx, x - 2, top + 1.4, 1.2, 1.2, "#c7b58e");
  }
}

function sunRays(
  ctx: Ctx,
  x: number,
  y: number,
  radius: number,
  color: string,
  count: number,
  alpha = 0.3,
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;

  for (let index = 0; index < count; index += 1) {
    const angle = (index / count) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(angle) * (radius + 3), y + Math.sin(angle) * (radius + 3));
    ctx.lineTo(x + Math.cos(angle) * (radius + 9), y + Math.sin(angle) * (radius + 9));
    ctx.stroke();
  }

  ctx.restore();
}

function lowrider(ctx: Ctx, x: number, b: number, accent: string) {
  const sunY = b - 48;
  circle(ctx, x + 5, sunY, 13, "rgba(244, 196, 94, 0.35)");
  sunRays(ctx, x + 5, sunY, 12, "#f2c56b", 10, 0.25);

  line(ctx, x - 21, b - 6, x - 23, b - 45, "#3f5a34", 2.2);
  for (const [fx, fy] of [
    [-26, -42],
    [-16, -48],
    [-12, -38],
    [-28, -33],
  ] as Array<[number, number]>) {
    line(ctx, x - 23, b - 45, x + fx, b + fy, "#4f7a45", 1.4);
  }

  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = "#050509";
  ctx.beginPath();
  ctx.ellipse(x, b - 2, 25, 4.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  poly(
    ctx,
    [
      [x - 25, b - 6],
      [x - 22, b - 15],
      [x - 9, b - 17],
      [x - 5, b - 23],
      [x + 9, b - 23],
      [x + 15, b - 17],
      [x + 24, b - 15],
      [x + 25, b - 8],
      [x + 20, b - 5],
      [x - 20, b - 5],
    ],
    accent,
  );
  poly(
    ctx,
    [
      [x - 7, b - 18],
      [x - 4, b - 22],
      [x + 8, b - 22],
      [x + 12, b - 18],
    ],
    "#1d2a22",
  );
  rect(ctx, x - 25, b - 12, 50, 1.4, "#f0e6c9");
  rect(ctx, x - 19, b - 16, 38, 1, "#d9b06a");
  rect(ctx, x - 28, b - 10, 4, 1.6, GOLD);
  rect(ctx, x + 24, b - 9, 4, 1.6, GOLD);

  for (const wheelX of [x - 15, x + 15]) {
    circle(ctx, wheelX, b - 5, 5.2, "#18151a");
    circle(ctx, wheelX, b - 5, 2.8, GOLD);
    circle(ctx, wheelX, b - 5, 1.1, "#fff1c9");
  }

  rect(ctx, x - 25, b - 9, 50, 1.2, "#5cbf69");
  rect(ctx, x + 15, b - 22, 1.4, 5, "#3f5a34");
  circle(ctx, x - 20, b - 18, 1.2, "#ffe9b0");
}

function skyline(ctx: Ctx, x: number, b: number, accent: string) {
  for (const [tx, tw, th] of [
    [x - 24, 8, 24],
    [x - 14, 10, 36],
    [x - 2, 7, 28],
    [x + 7, 11, 42],
    [x + 20, 7, 22],
  ] as Array<[number, number, number]>) {
    rect(ctx, tx, b - 10 - th, tw, th, "#211e27");
    rect(ctx, tx, b - 10 - th, tw, 1, "#37323d");

    for (let wy = b - 8 - th; wy < b - 14; wy += 4) {
      for (let wx = tx + 2; wx < tx + tw - 1; wx += 3) {
        if ((wx + wy) % 5 === 0) rect(ctx, wx, wy, 1, 1.4, accent);
        else rect(ctx, wx, wy, 1, 1.4, "rgba(220, 210, 180, 0.16)");
      }
    }
  }

  ctx.fillStyle = accent;
  ctx.font = '700 12px "Geist Mono", ui-monospace, monospace';
  ctx.textAlign = "center";
  ctx.fillText("III", x, b - 56);
  ctx.textAlign = "left";

  ellipse(ctx, x, b - 2, 22, 3.6, "rgba(0,0,0,0.35)");
  rect(ctx, x - 17, b - 12, 34, 9, "#d8a92b");
  rect(ctx, x - 16, b - 19, 32, 8, "#e6b93a");
  poly(
    ctx,
    [
      [x - 12, b - 19],
      [x - 7, b - 23],
      [x + 7, b - 23],
      [x + 12, b - 19],
    ],
    "#e6b93a",
  );
  rect(ctx, x - 11, b - 22, 8, 5, "#2a2a33");
  rect(ctx, x + 2, b - 22, 8, 5, "#2a2a33");
  rect(ctx, x - 1, b - 28, 8, 4, "#f2d77a");
  rect(ctx, x, b - 27, 6, 1, "#3a3020");
  for (let index = 0; index < 6; index += 1) {
    rect(ctx, x - 16 + index * 5.2, b - 15, 2.6, 2.2, index % 2 === 0 ? "#1f1d22" : "#f4ead2");
  }
  rect(ctx, x - 13, b - 10, 5, 2.4, "#fff4c0");
  rect(ctx, x + 8, b - 10, 5, 2.4, "#fff4c0");
  rect(ctx, x - 3, b - 9, 6, 2, "#2a2520");
}

function vicePalm(ctx: Ctx, x: number, b: number) {
  circle(ctx, x, b - 46, 24, "rgba(255, 86, 150, 0.26)");
  for (let index = 0; index < 4; index += 1) {
    rect(
      ctx,
      x - 24,
      b - 40 + index * 5,
      48,
      1,
      index % 2 === 0 ? "rgba(255, 122, 184, 0.35)" : "rgba(86, 224, 255, 0.22)",
    );
  }
  circle(ctx, x, b - 46, 9, "#ffd38a");

  for (const side of [-1, 1]) {
    const px = x + side * 20;
    line(ctx, px, b - 8, px + side * 3, b - 52, "#263a34", 2.4);
    for (const [fx, fy] of [
      [-10, -54],
      [4, -58],
      [12, -46],
      [-14, -42],
    ] as Array<[number, number]>) {
      line(
        ctx,
        px + side * 3,
        b - 52,
        px + fx * side,
        b + fy,
        side < 0 ? "#3e7a68" : "#ff7ab8",
        1.4,
      );
    }
  }

  ellipse(ctx, x, b - 2, 24, 3.6, "rgba(0,0,0,0.35)");
  poly(
    ctx,
    [
      [x - 24, b - 6],
      [x - 20, b - 12],
      [x - 8, b - 14],
      [x - 4, b - 19],
      [x + 8, b - 18],
      [x + 18, b - 13],
      [x + 24, b - 7],
      [x + 18, b - 4],
      [x - 18, b - 4],
    ],
    CREAM,
  );
  poly(
    ctx,
    [
      [x - 6, b - 18],
      [x + 9, b - 18],
      [x + 12, b - 13],
      [x - 8, b - 13],
    ],
    "#2a6f7a",
  );
  rect(ctx, x - 22, b - 9, 44, 1.2, "#56e0ff");
  for (const wheelX of [x - 13, x + 13]) {
    circle(ctx, wheelX, b - 5, 4.2, "#1a181d");
    circle(ctx, wheelX, b - 5, 2, "#c8d7db");
  }
  rect(ctx, x - 20, b - 11, 4, 1.4, "#ff7ab8");
  rect(ctx, x + 16, b - 11, 4, 1.4, "#ff7ab8");
}

function bowling(ctx: Ctx, x: number, b: number, accent: string) {
  ctx.fillStyle = accent;
  ctx.font = '700 12px "Geist Mono", ui-monospace, monospace';
  ctx.textAlign = "center";
  ctx.fillText("IV", x, b - 58);
  ctx.textAlign = "left";

  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.strokeStyle = "#f0e6cf";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, b - 42, 18, 0.15, Math.PI - 0.15);
  ctx.stroke();
  ctx.restore();

  ellipse(ctx, x - 5, b - 2, 12, 3.4, "rgba(0,0,0,0.35)");
  ctx.fillStyle = CREAM;
  ctx.beginPath();
  ctx.moveTo(x - 11, b - 4);
  ctx.quadraticCurveTo(x - 13, b - 18, x - 7, b - 26);
  ctx.quadraticCurveTo(x - 5, b - 32, x - 7, b - 38);
  ctx.quadraticCurveTo(x - 3, b - 42, x + 2, b - 38);
  ctx.quadraticCurveTo(x + 1, b - 32, x + 3, b - 26);
  ctx.quadraticCurveTo(x + 9, b - 18, x + 7, b - 4);
  ctx.closePath();
  ctx.fill();
  rect(ctx, x - 8, b - 32, 12, 2, RED);
  rect(ctx, x - 6, b - 28, 9, 1.4, "#8f2e2e");
  rect(ctx, x - 9, b - 20, 14, 1, "rgba(94, 72, 52, 0.35)");

  circle(ctx, x + 16, b - 7, 7, "#2b2323");
  circle(ctx, x + 15, b - 9, 2, "#5b3a3a");
  circle(ctx, x + 18, b - 6, 2, "#5b3a3a");
  circle(ctx, x + 15, b - 4, 2, "#5b3a3a");
  circle(ctx, x + 16, b - 9.6, 2.6, "#b38a62");
  circle(ctx, x + 17, b - 2.4, 1.2, "#b38a62");
}

function helicopter(ctx: Ctx, x: number, b: number, accent: string) {
  const sunX = x + 12;
  const sunY = b - 48;

  circle(ctx, sunX, sunY, 15, "rgba(255, 159, 67, 0.28)");
  sunRays(ctx, sunX, sunY, 14, accent, 10, 0.3);

  for (const [bx, bw, bh] of [
    [x - 24, 6, 13],
    [x - 16, 7, 20],
    [x - 7, 6, 15],
    [x + 1, 8, 24],
    [x + 11, 6, 12],
  ] as Array<[number, number, number]>) {
    rect(ctx, bx, b - 12 - bh, bw, bh, "#211d28");
    rect(ctx, bx, b - 12 - bh, bw, 1, "#393244");
  }

  ctx.fillStyle = "#ffca6b";
  ctx.font = '700 15px "Geist Mono", ui-monospace, monospace';
  ctx.textAlign = "center";
  ctx.shadowColor = "rgba(255, 159, 67, 0.9)";
  ctx.shadowBlur = 5;
  ctx.fillText("V", x, b - 55);
  ctx.shadowBlur = 0;
  ctx.textAlign = "left";

  ctx.save();
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.moveTo(x - 2, b - 33);
  ctx.lineTo(x + 4, b - 33);
  ctx.lineTo(x + 18, b - 4);
  ctx.lineTo(x - 16, b - 4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ellipse(ctx, x, b - 2, 22, 3.6, "rgba(0,0,0,0.35)");
  ellipse(ctx, x - 4, b - 34, 10, 5.6, "#5f5b68");
  ellipse(ctx, x - 5, b - 35, 8.6, 4.4, "#8a8492");
  rect(ctx, x + 3, b - 36, 13, 2.2, "#5f5b68");
  rect(ctx, x + 14, b - 38, 2, 5, "#5f5b68");
  rect(ctx, x - 2, b - 41, 1.4, 4, "#45414c");
  line(ctx, x - 17, b - 42, x + 8, b - 42, "#d8d3df", 1.6);
  line(ctx, x - 9, b - 43, x - 9, b - 40, "#45414c", 1);
  rect(ctx, x - 11, b - 31, 15, 1, accent);
  circle(ctx, x - 9, b - 33, 1.4, "#ffe9b0");
  rect(ctx, x - 11, b - 29, 1.6, 4, "#45414c");
  rect(ctx, x + 0, b - 29, 1.6, 4, "#45414c");
  rect(ctx, x - 13, b - 25, 15, 1, "#45414c");

  for (const [offset, height, hat] of [
    [-17, 10, false],
    [0, 13, true],
    [17, 11, false],
  ] as Array<[number, number, boolean]>) {
    const px = x + offset;
    const py = b - 5 - height;
    circle(ctx, px, py - 2, 2, "#35303c");
    rect(ctx, px - 2.8, py, 5.6, height, "#4b4552");
    if (hat) rect(ctx, px - 3.2, py - 5, 6.4, 1.4, accent);
    rect(ctx, px - 2.4, py + height - 2, 2, 2, "#2b2630");
    rect(ctx, px + 0.6, py + height - 2, 2, 2, "#2b2630");
  }
}

function hooded(ctx: Ctx, x: number, b: number) {
  ctx.save();
  ctx.globalAlpha = 0.4;
  ctx.strokeStyle = CREAM;
  ctx.fillStyle = CREAM;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, b - 58, 17, 0, Math.PI * 2);
  ctx.stroke();
  poly(
    ctx,
    [
      [x, b - 72],
      [x - 9, b - 56],
      [x - 4, b - 56],
      [x, b - 48],
      [x + 4, b - 56],
      [x + 9, b - 56],
    ],
    CREAM,
  );
  ctx.restore();

  ellipse(ctx, x, b - 2, 14, 3.4, "rgba(0,0,0,0.34)");
  poly(
    ctx,
    [
      [x - 12, b - 4],
      [x - 10, b - 34],
      [x - 4, b - 42],
      [x + 6, b - 42],
      [x + 12, b - 32],
      [x + 13, b - 4],
    ],
    CREAM,
  );
  poly(
    ctx,
    [
      [x - 9, b - 34],
      [x - 5, b - 45],
      [x + 6, b - 44],
      [x + 10, b - 33],
      [x + 6, b - 30],
      [x - 4, b - 30],
    ],
    "#e6dcc6",
  );
  ellipse(ctx, x, b - 33, 5.2, 6, "#28222a");
  rect(ctx, x - 12, b - 22, 25, 2, RED);
  line(ctx, x - 12, b - 20, x + 12, b - 31, RED, 2);
  rect(ctx, x - 10, b - 30, 20, 2, "#d8ceb8");
  rect(ctx, x - 10, b - 5, 20, 1.4, "#c7bca6");

  line(ctx, x - 10, b - 18, x - 23, b - 20, "#d8ceb8", 2.6);
  rect(ctx, x - 27, b - 21, 5, 1.4, "#dfe8ef");
  circle(ctx, x - 28, b - 20.5, 1, "#f4fbff");
  line(ctx, x - 23, b - 20, x - 27, b - 20, "#9fb0ba", 0.8);
}

function signal(ctx: Ctx, x: number, b: number, accent: string) {
  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1.4;

  for (let ring = 0; ring < 3; ring += 1) {
    ctx.beginPath();
    ctx.arc(x, b - 56, 10 + ring * 7, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
  }

  ctx.restore();

  for (let index = 0; index < 4; index += 1) {
    rect(
      ctx,
      x - 22,
      b - 50 + index * 6,
      44,
      1,
      index % 2 === 0 ? `${accent}66` : "rgba(255,255,255,0.08)",
    );
  }

  line(ctx, x + 18, b - 4, x + 18, b - 50, "#403c46", 2.2);
  rect(ctx, x + 12, b - 56, 13, 8, "#302c36");
  rect(ctx, x + 13, b - 55, 5, 4, "#19151d");
  circle(ctx, x + 21, b - 53, 2.2, accent);
  rect(ctx, x + 22, b - 62, 6, 1.4, "#302c36");

  ellipse(ctx, x - 4, b - 2, 14, 3.4, "rgba(0,0,0,0.34)");
  poly(
    ctx,
    [
      [x - 15, b - 4],
      [x - 12, b - 34],
      [x - 3, b - 41],
      [x + 9, b - 35],
      [x + 10, b - 4],
    ],
    "#4c4654",
  );
  poly(
    ctx,
    [
      [x - 12, b - 35],
      [x - 4, b - 45],
      [x + 8, b - 40],
      [x + 7, b - 34],
      [x - 2, b - 30],
    ],
    "#8a8395",
  );
  ellipse(ctx, x - 2, b - 35, 4.2, 4.8, "#161319");
  line(ctx, x + 2, b - 24, x + 13, b - 39, "#3c3742", 3);
  rect(ctx, x + 11, b - 47, 8, 12, "#1b2932");
  rect(ctx, x + 12, b - 46, 6, 9, accent);
  rect(ctx, x + 13.2, b - 44.4, 3.6, 2.4, "#0e1a22");
  circle(ctx, x + 15, b - 38, 0.8, "#d9f8ff");
  glow(ctx, x + 15, b - 41, 10, "rgba(86, 224, 255, 0.8)", 0.26);
  rect(ctx, x - 13, b - 16, 24, 1.4, accent);
}

function block(ctx: Ctx, x: number, b: number, accent: string) {
  rect(ctx, x - 15, b - 62, 30, 30, "#3f6b38");
  rect(ctx, x - 15, b - 62, 30, 3, "#6f9a5c");
  rect(ctx, x - 12, b - 55, 7, 7, "#ffcf33");
  rect(ctx, x + 5, b - 55, 7, 7, "#ffcf33");
  rect(ctx, x - 3, b - 44, 6, 9, "#131a12");
  rect(ctx, x + 4, b - 47, 5, 5, "#131a12");
  circle(ctx, x - 8, b - 56, 2.2, "#131a12");
  circle(ctx, x + 8, b - 56, 2.2, "#131a12");

  poly(
    ctx,
    [
      [x - 19, b - 10],
      [x, b - 21],
      [x + 19, b - 10],
      [x, b + 1],
    ],
    "#74b965",
  );
  poly(
    ctx,
    [
      [x - 19, b - 10],
      [x, b + 1],
      [x, b - 5],
      [x - 19, b - 16],
    ],
    "#8a6a48",
  );
  poly(
    ctx,
    [
      [x + 19, b - 10],
      [x, b + 1],
      [x, b - 5],
      [x + 19, b - 16],
    ],
    "#6f543a",
  );
  for (let index = 0; index < 4; index += 1) {
    rect(ctx, x - 16 + index * 5, b - 12 - (index % 2), 2, 2, "#9b7a55");
  }

  line(ctx, x + 16, b - 8, x + 22, b - 38, "#6e5638", 2);
  poly(
    ctx,
    [
      [x + 21, b - 41],
      [x + 28, b - 36],
      [x + 22, b - 32],
      [x + 18, b - 36],
    ],
    "#7be0e0",
  );
  line(ctx, x - 20, b - 8, x - 20, b - 34, "#6e5638", 2);
  rect(ctx, x - 23, b - 36, 7, 3, "#ffb347");
  circle(ctx, x - 19.5, b - 39, 2.6, "#ffcf33");
  circle(ctx, x - 19.5, b - 39, 1.2, "#fff4c0");
  glow(ctx, x - 19.5, b - 39, 12, "rgba(255, 210, 100, 0.8)", 0.3);

  rect(ctx, x - 15, b - 61, 30, 1, `${accent}88`);
}

function crewmate(ctx: Ctx, x: number, b: number, accent: string) {
  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(x - 22, b - 48, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ellipse(ctx, x + 2, b - 2, 18, 4, "rgba(0,0,0,0.36)");
  rect(ctx, x + 12, b - 38, 7, 30, "#a3283a");
  rect(ctx, x + 12, b - 30, 7, 6, "#8e2032");

  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.roundRect(x - 12, b - 40, 22, 36, 9);
  ctx.fill();
  rect(ctx, x - 17, b - 30, 6, 18, accent);
  rect(ctx, x - 7, b - 10, 7, 8, accent);
  rect(ctx, x + 4, b - 10, 7, 8, accent);
  rect(ctx, x - 9, b - 34, 15, 11, "#d9f6ff");
  rect(ctx, x - 9, b - 34, 11, 7, "#a9e2ff");
  rect(ctx, x - 9, b - 34, 2.4, 11, "#f7fdff");
  rect(ctx, x - 13, b - 22, 8, 3, "#8e2032");
  circle(ctx, x + 26, b - 47, 4.2, "#e85d5d");
  rect(ctx, x + 24, b - 42, 4, 3, "#e85d5d");
  circle(ctx, x + 25.4, b - 48, 1.6, "#cfefff");

  rect(ctx, x - 20, b - 5, 40, 7, "#4a4652");
  for (let index = 0; index < 5; index += 1) {
    rect(ctx, x - 17 + index * 7, b - 4, 4, 4, "#2d2a33");
  }
  poly(
    ctx,
    [
      [x + 20, b - 8],
      [x + 28, b - 12],
      [x + 31, b - 10],
      [x + 23, b - 5],
    ],
    "#cfd6e6",
  );
  rect(ctx, x + 20, b - 8, 3, 4, "#6f5a3a");
}

function dragon(ctx: Ctx, x: number, b: number, accent: string) {
  circle(ctx, x, b - 54, 22, "rgba(255, 161, 60, 0.14)");
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, b - 54, 19, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = `${accent}55`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, b - 54, 15.4, 0, Math.PI * 2);
  ctx.stroke();

  poly(
    ctx,
    [
      [x - 12, b - 48],
      [x - 5, b - 62],
      [x - 2, b - 54],
      [x + 5, b - 67],
      [x + 11, b - 50],
      [x + 2, b - 52],
      [x, b - 42],
      [x - 5, b - 52],
    ],
    accent,
  );
  circle(ctx, x + 9, b - 61, 1.2, "#2b1d1d");
  poly(
    ctx,
    [
      [x - 3, b - 64],
      [x - 6, b - 69],
      [x, b - 66],
    ],
    accent,
  );

  for (const side of [-1, 1]) {
    for (let index = 0; index < 4; index += 1) {
      const angle = (index / 4) * Math.PI * 0.5;
      line(
        ctx,
        x + side * 24,
        b - 42,
        x + side * (28 + Math.cos(angle) * 4),
        b - 42 - Math.sin(angle) * 12,
        "#7a4a2c",
        1.2,
      );
    }
  }

  ellipse(ctx, x, b - 2, 20, 3.6, "rgba(0,0,0,0.35)");
  ellipse(ctx, x, b - 19, 15, 4.4, "#8a6136");
  ellipse(ctx, x, b - 21, 13, 3.4, "#c08a4e");
  circle(ctx, x, b - 20, 8, "#8a5a32");
  circle(ctx, x, b - 20, 5.6, "#b8864e");
  circle(ctx, x, b - 20, 2.2, "#5b3a24");
  for (const side of [-1, 1]) {
    line(ctx, x + side * 18, b - 8, x + side * 22, b - 26, "#5a4630", 1.6);
  }
  rect(ctx, x + 12, b - 12, 16, 1.6, "#5a4630");
  rect(ctx, x + 13, b - 6, 22, 3.4, accent);
  circle(ctx, x + 30, b - 4, 1.8, "#3a2c1c");
}

function soldier(ctx: Ctx, x: number, b: number, accent: string) {
  for (const [bx, bw, bh] of [
    [x - 25, 7, 18],
    [x - 15, 9, 30],
    [x - 3, 7, 22],
    [x + 6, 8, 34],
    [x + 16, 7, 16],
  ] as Array<[number, number, number]>) {
    rect(ctx, bx, b - 44 - bh, bw, bh, "#252a22");
    for (let wy = b - 42 - bh; wy < b - 46; wy += 5) {
      rect(ctx, bx + 2, wy, Math.max(1, bw - 4), 1, "rgba(200, 200, 170, 0.18)");
    }
  }
  for (const [dx, dy] of [
    [0, 0],
    [18, -6],
  ] as Array<[number, number]>) {
    rect(ctx, x - 5 + dx, b - 52 + dy, 10, 1.4, "#4a5140");
    line(ctx, x - 4 + dx, b - 56 + dy, x - 4 + dx, b - 48 + dy, "#4a5140", 1.2);
    line(ctx, x + 4 + dx, b - 56 + dy, x + 4 + dx, b - 48 + dy, "#4a5140", 1.2);
  }

  ctx.save();
  ctx.globalAlpha = 0.28;
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(x, b - 35, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  rect(ctx, x - 14, b - 8, 28, 10, "#3e4636");
  rect(ctx, x - 14, b - 8, 28, 1.6, "#59634b");
  circle(ctx, x, b - 27, 9, STONE);
  ellipse(ctx, x, b - 33, 9.6, 6.2, "#4a5140");
  rect(ctx, x - 10, b - 36, 20, 4.4, "#3a4034");
  circle(ctx, x - 5, b - 27, 2.2, "#6fe36f");
  circle(ctx, x, b - 26.4, 2.2, "#6fe36f");
  circle(ctx, x + 5, b - 27, 2.2, "#6fe36f");
  circle(ctx, x - 5, b - 27.6, 0.8, "#dfffd8");
  circle(ctx, x + 5, b - 27.6, 0.8, "#dfffd8");
  rect(ctx, x - 12, b - 21, 24, 3, "#59634b");
  line(ctx, x - 16, b - 10, x + 16, b - 32, "#2b2620", 2.2);
  line(ctx, x + 12, b - 30, x + 18, b - 33, "#2b2620", 2);
  rect(ctx, x - 15, b - 12, 3, 8, "#2b2620");
  line(ctx, x + 10, b - 16, x + 14, b - 22, GOLD, 1);
  circle(ctx, x + 14, b - 22, 1.2, GOLD);
  glow(ctx, x - 5, b - 27, 8, "rgba(110, 240, 120, 0.6)", 0.2);
}

function scope(ctx: Ctx, x: number, b: number, accent: string) {
  ctx.strokeStyle = "rgba(108, 170, 214, 0.55)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(x, b - 58, 21, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, b - 58, 13, 0, Math.PI * 2);
  ctx.stroke();
  line(ctx, x - 25, b - 58, x + 25, b - 58, "rgba(108, 170, 214, 0.55)");
  line(ctx, x, b - 83, x, b - 33, "rgba(108, 170, 214, 0.55)");
  for (const [tx, ty] of [
    [x - 8, b - 58],
    [x + 8, b - 58],
    [x, b - 66],
    [x, b - 50],
  ] as Array<[number, number]>) {
    line(ctx, tx - 1.6, ty, tx + 1.6, ty, accent, 1);
  }
  circle(ctx, x, b - 58, 1.6, accent);

  ctx.save();
  ctx.globalAlpha = 0.35;
  poly(
    ctx,
    [
      [x - 26, b - 18],
      [x + 22, b - 24],
      [x + 20, b - 6],
      [x - 24, b - 4],
    ],
    "#8e846e",
  );
  ctx.strokeStyle = "#b53a3a";
  ctx.lineWidth = 1;
  for (const [mx, my] of [
    [x - 12, b - 16],
    [x + 6, b - 18],
  ] as Array<[number, number]>) {
    line(ctx, mx - 2, my - 2, mx + 2, my + 2, RED, 1);
    line(ctx, mx + 2, my - 2, mx - 2, my + 2, RED, 1);
  }
  ctx.restore();

  ellipse(ctx, x - 2, b - 2, 18, 3.6, "rgba(0,0,0,0.36)");
  poly(
    ctx,
    [
      [x - 15, b - 4],
      [x - 10, b - 22],
      [x + 1, b - 30],
      [x + 10, b - 22],
      [x + 12, b - 6],
    ],
    "#4c5142",
  );
  circle(ctx, x + 2, b - 29, 5.4, "#6a7056");
  ellipse(ctx, x + 2, b - 32, 6.4, 3.2, "#3d4336");
  rect(ctx, x - 7, b - 24, 15, 1, "#6b7a4e");
  line(ctx, x - 13, b - 20, x + 24, b - 34, "#20241d", 2.4);
  line(ctx, x + 20, b - 33, x + 26, b - 35, "#20241d", 2);
  circle(ctx, x + 25, b - 35, 1.4, "#8a9bb0");
  for (const [gx, gy] of [
    [x - 14, b - 6],
    [x + 12, b - 5],
    [x - 2, b - 7],
  ] as Array<[number, number]>) {
    ellipse(ctx, gx, gy, 4.4, 1.6, "#59634b");
    line(ctx, gx - 2, gy, gx + 1, gy - 3, "#7b875f", 0.8);
  }
}

function fist(ctx: Ctx, x: number, b: number, accent: string) {
  for (const [ax, ay, bx, by] of [
    [x - 20, b - 60, x - 12, b - 38],
    [x + 16, b - 64, x + 8, b - 42],
    [x - 2, b - 76, x + 2, b - 50],
  ] as Array<[number, number, number, number]>) {
    ctx.strokeStyle = `${accent}99`;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo((ax + bx) / 2 + 4, (ay + by) / 2);
    ctx.lineTo(bx, by);
    ctx.lineTo((ax + bx) / 2 - 3, (ay + by) / 2 - 2);
    ctx.stroke();
  }

  ctx.save();
  ctx.globalAlpha = 0.24;
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(x, b - 30, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ellipse(ctx, x, b - 2, 19, 4, "rgba(0,0,0,0.36)");
  rect(ctx, x - 9, b - 20, 18, 18, "#544e44");
  rect(ctx, x - 9, b - 20, 18, 1.4, "#726a5b");
  for (let index = 0; index < 3; index += 1) {
    rect(ctx, x - 9, b - 16 + index * 5, 18, 1.2, "#3d372f");
  }

  rect(ctx, x - 14, b - 42, 28, 24, STONE);
  rect(ctx, x - 14, b - 42, 28, 3, STONE_LIGHT);
  rect(ctx, x - 14, b - 26, 28, 3, "#6b6254");
  for (let index = 0; index < 4; index += 1) {
    const kx = x - 14 + index * 7;
    rect(ctx, kx, b - 47, 6, 7, STONE_LIGHT);
    rect(ctx, kx + 1, b - 46, 4, 4, "#8f8472");
    rect(ctx, kx, b - 47, 6, 1, "#c0b49c");
  }
  rect(ctx, x - 14, b - 43, 2.4, 24, "#9b907d");
  rect(ctx, x - 4, b - 41, 7, 1, "#5f5648");
  circle(ctx, x + 5, b - 39, 1.2, accent);
  circle(ctx, x - 10, b - 47, 1, accent);
  circle(ctx, x + 13, b - 44, 1.4, accent);
}

function football(ctx: Ctx, x: number, b: number, accent: string) {
  ctx.strokeStyle = "#cfd6d4";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(x - 24, b - 62);
  ctx.lineTo(x - 24, b - 6);
  ctx.moveTo(x + 24, b - 62);
  ctx.lineTo(x + 24, b - 6);
  ctx.moveTo(x - 24, b - 62);
  ctx.lineTo(x + 24, b - 62);
  ctx.stroke();

  ctx.save();
  ctx.globalAlpha = 0.35;
  for (let index = 0; index < 6; index += 1) {
    line(ctx, x - 24 + index * 9.6, b - 62, x - 24 + index * 9.6, b - 6, "#b8c4be", 0.6);
  }
  for (let index = 0; index < 7; index += 1) {
    line(ctx, x - 24, b - 58 + index * 8, x + 24, b - 58 + index * 8, "#b8c4be", 0.6);
  }
  ctx.restore();

  for (const [lx, ly] of [
    [x - 18, b - 70],
    [x + 18, b - 70],
  ] as Array<[number, number]>) {
    rect(ctx, lx - 6, ly - 3, 12, 4, "#3c3a3f");
    for (let index = 0; index < 3; index += 1) {
      circle(ctx, lx - 4 + index * 4, ly, 1.2, "#fff6c8");
    }
  }

  rect(ctx, x - 24, b - 8, 48, 4, "#2f5d3c");
  rect(ctx, x - 24, b - 8, 48, 1, "#4d8a5b");
  ellipse(ctx, x, b - 2, 20, 3.4, "rgba(0,0,0,0.36)");
  circle(ctx, x, b - 21, 15, CREAM);
  circle(ctx, x - 2, b - 23, 14, "#f2ead7");
  poly(
    ctx,
    [
      [x, b - 33],
      [x + 5, b - 27],
      [x + 3, b - 21],
      [x - 3, b - 21],
      [x - 5, b - 27],
    ],
    "#2b2a2e",
  );
  circle(ctx, x, b - 18, 3.4, "#2b2a2e");
  circle(ctx, x - 11, b - 20, 3, "#2b2a2e");
  circle(ctx, x + 11, b - 20, 3, "#2b2a2e");
  circle(ctx, x - 8, b - 12, 2.2, "#2b2a2e");
  circle(ctx, x + 8, b - 12, 2.2, "#2b2a2e");
  circle(ctx, x - 13, b - 28, 2, "#2b2a2e");
  circle(ctx, x + 13, b - 28, 2, "#2b2a2e");
  ctx.strokeStyle = "rgba(80, 70, 60, 0.35)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.arc(x - 2, b - 23, 14, 0, Math.PI * 2);
  ctx.stroke();
  glow(ctx, x, b - 21, 18, "rgba(120, 230, 180, 0.45)", 0.16);
  rect(ctx, x - 8, b - 40, 16, 1.4, accent);
}

function cricket(ctx: Ctx, x: number, b: number, accent: string) {
  rect(ctx, x - 20, b - 62, 40, 18, "#2d2924");
  rect(ctx, x - 18, b - 60, 36, 14, "#1b1815");
  ctx.fillStyle = CREAM;
  ctx.font = '700 8px "Geist Mono", ui-monospace, monospace';
  ctx.textAlign = "center";
  ctx.fillText("07", x, b - 50);
  ctx.textAlign = "left";
  rect(ctx, x - 18, b - 58, 36, 0.8, "#6d5a3c");

  ctx.strokeStyle = "#cfd6d4";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x + 2, b - 4, 30, Math.PI * 1.1, Math.PI * 1.9);
  ctx.stroke();

  ellipse(ctx, x, b - 2, 22, 3.6, "rgba(0,0,0,0.36)");

  for (const [sx, sh] of [
    [x - 7, 25],
    [x, 28],
    [x + 7, 25],
  ] as Array<[number, number]>) {
    rect(ctx, sx - 1.6, b - 6 - sh, 3.2, sh, "#e8dcc0");
    rect(ctx, sx - 1.6, b - 6 - sh, 1, sh, "#fff6e0");
    rect(ctx, sx - 1.6, b - 8, 3.2, 2, "#bfae8a");
  }
  rect(ctx, x - 8.4, b - 36, 7.2, 1.4, "#d9b06a");
  rect(ctx, x + 1.2, b - 35, 7.2, 1.4, "#d9b06a");

  ctx.save();
  ctx.translate(x + 16, b - 18);
  ctx.rotate(-0.5);
  rect(ctx, -3, -20, 6, 22, "#a9743e");
  rect(ctx, -3, -20, 2, 22, "#c28e54");
  rect(ctx, -1.4, 2, 2.8, 9, "#38281c");
  ctx.restore();
  circle(ctx, x + 24, b - 6, 3.6, RED);
  ctx.strokeStyle = "#e8d9a8";
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.arc(x + 24, b - 6, 3.6, 0.4, 2.6);
  ctx.stroke();
  rect(ctx, x - 10, b - 4, 20, 1, "#5f5040");
  circle(ctx, x - 24, b - 4, 1.6, accent);
  circle(ctx, x + 27, b - 12, 1.2, accent);
}

function belt(ctx: Ctx, x: number, b: number, accent: string) {
  const top = b - 54;
  ctx.strokeStyle = "#7f2a2a";
  ctx.lineWidth = 1.6;

  for (let index = 0; index < 3; index += 1) {
    ctx.beginPath();
    ctx.moveTo(x - 26, top + index * 12);
    ctx.quadraticCurveTo(x, top + index * 12 + 3, x + 26, top + index * 12);
    ctx.stroke();
  }

  for (const side of [-1, 1]) {
    const px = x + side * 26;
    rect(ctx, px - 2, b - 62, 4, 52, "#6c6254");
    rect(ctx, px - 3, b - 64, 6, 4, GOLD);
    rect(ctx, px - 3, b - 44, 6, 5, "#8a2a2a");
  }

  glow(ctx, x, b - 22, 34, "rgba(255, 215, 138, 0.5)", 0.2);
  line(ctx, x - 25, b - 16, x + 25, b - 22, "#4a3122", 3);
  poly(
    ctx,
    [
      [x - 14, b - 20],
      [x, b - 26],
      [x + 14, b - 20],
      [x + 9, b - 12],
      [x, b - 8],
      [x - 9, b - 12],
    ],
    "#4a3122",
  );
  poly(
    ctx,
    [
      [x - 11, b - 19],
      [x, b - 24],
      [x + 11, b - 19],
      [x + 7, b - 13],
      [x, b - 10],
      [x - 7, b - 13],
    ],
    accent,
  );
  circle(ctx, x, b - 17, 5.4, "#e8d9a8");
  circle(ctx, x, b - 17, 3.2, accent);
  for (const side of [-1, 1]) {
    circle(ctx, x + side * 13, b - 16.5, 3.2, accent);
    circle(ctx, x + side * 13, b - 16.5, 1.8, "#e8d9a8");
  }
  for (let index = 0; index < 5; index += 1) {
    circle(ctx, x - 7 + index * 3.5, b - 25, 0.6, "#fff1c9");
  }
}

function island(ctx: Ctx, x: number, b: number, accent: string) {
  circle(ctx, x + 10, b - 52, 13, "rgba(255, 159, 67, 0.3)");
  sunRays(ctx, x + 10, b - 52, 12, "#ff9f43", 9, 0.3);

  for (const [fx, fy, len] of [
    [-26, -58, 16],
    [-20, -66, 20],
    [22, -60, 18],
    [18, -70, 22],
  ] as Array<[number, number, number]>) {
    line(ctx, x, b - 20, x + fx, b + fy, "#3e6e46", 1.6);
    for (let index = 0; index < 4; index += 1) {
      const t = index / 4;
      line(
        ctx,
        x + fx * t,
        b - 20 + fy * t,
        x + fx + (index % 2 === 0 ? 5 : -5),
        b + fy - len * 0.45 + index * 2,
        "#4f8452",
        0.8,
      );
    }
  }

  ellipse(ctx, x, b - 2, 23, 4, "rgba(0,0,0,0.36)");
  ellipse(ctx, x - 2, b - 7, 20, 7, "#5e8d63");
  ellipse(ctx, x - 2, b - 9, 16, 4.4, "#7aa06a");
  line(ctx, x - 4, b - 10, x - 7, b - 35, "#6d4b2f", 2.2);
  for (const [fx, fy] of [
    [-16, -48],
    [-8, -54],
    [6, -53],
    [13, -46],
  ] as Array<[number, number]>) {
    line(ctx, x - 7, b - 35, x + fx, b + fy, accent, 1.6);
  }

  line(ctx, x + 12, b - 10, x + 12, b - 34, "#5a4630", 1.6);
  circle(ctx, x + 12, b - 37, 4.4, CREAM);
  circle(ctx, x + 11, b - 38, 1, "#332824");
  circle(ctx, x + 13.4, b - 38, 1, "#332824");
  rect(ctx, x + 11.4, b - 36, 1.4, 1.4, "#5a4630");
  line(ctx, x + 8, b - 33, x + 16, b - 33, "#5a4630", 1);

  line(ctx, x - 15, b - 8, x - 20, b - 25, "#c8ccd4", 1.8);
  rect(ctx, x - 22, b - 27, 4, 8, "#5a4630");

  rect(ctx, x + 17, b - 12, 1.6, 8, "#6d4b2f");
  circle(ctx, x + 17.8, b - 14, 3.4, "#ff6b3d");
  circle(ctx, x + 17.8, b - 14, 1.6, "#ffd166");
  glow(ctx, x + 17.8, b - 14, 12, "rgba(255, 140, 70, 0.8)", 0.25);

  for (let index = 0; index < 4; index += 1) {
    ellipse(
      ctx,
      x + 17 + (index % 2) * 3 - 2,
      b - 20 - index * 4,
      2.6 + index,
      1.6,
      `rgba(220, 220, 210, ${0.08 - index * 0.015})`,
    );
  }
}

function drawScene(ctx: Ctx, spot: ArcadeStatueSpot, b: number) {
  const x = spot.x;
  const accent = spot.statue.paint;

  switch (spot.statue.motif) {
    case "lowrider":
      lowrider(ctx, x, b, accent);
      break;
    case "skyline":
      skyline(ctx, x, b, accent);
      break;
    case "palm":
      vicePalm(ctx, x, b);
      break;
    case "bowling":
      bowling(ctx, x, b, accent);
      break;
    case "helicopter":
      helicopter(ctx, x, b, accent);
      break;
    case "hood":
      hooded(ctx, x, b);
      break;
    case "signal":
      signal(ctx, x, b, accent);
      break;
    case "block":
      block(ctx, x, b, accent);
      break;
    case "crewmate":
      crewmate(ctx, x, b, accent);
      break;
    case "dragon":
      dragon(ctx, x, b, accent);
      break;
    case "soldier":
      soldier(ctx, x, b, accent);
      break;
    case "scope":
      scope(ctx, x, b, accent);
      break;
    case "fist":
      fist(ctx, x, b, accent);
      break;
    case "ball":
      football(ctx, x, b, accent);
      break;
    case "cricket":
      cricket(ctx, x, b, accent);
      break;
    case "belt":
      belt(ctx, x, b, accent);
      break;
    case "island":
      island(ctx, x, b, accent);
      break;
  }
}

export function drawArcadeMonument(ctx: Ctx, spot: ArcadeStatueSpot) {
  const { x, y } = spot;
  const accent = spot.statue.paint;
  const seed = Math.abs(
    spot.statue.id.split("").reduce((value, char) => (value * 31 + char.charCodeAt(0)) % 997, 7),
  );

  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = "#030308";
  ctx.beginPath();
  ctx.moveTo(x - 12, y + 8);
  ctx.lineTo(x - 46, y - 2);
  ctx.lineTo(x - 38, y + 16);
  ctx.lineTo(x - 2, y + 16);
  ctx.fill();
  ctx.restore();

  drawNiche(ctx, x, y, accent, seed);
  drawDais(ctx, x, y, accent);
  drawScene(ctx, spot, y - 10);
  drawPlate(ctx, x, y, SHORT_LABEL[spot.statue.id] ?? spot.statue.game.toUpperCase(), accent, seed);

  const tagY = y - (spot.statue.motif === "ball" ? 74 : 78);
  ctx.fillStyle = accent;
  ctx.globalAlpha = 0.55;
  ctx.font = '600 3.2px "Geist Mono", ui-monospace, monospace';
  ctx.textAlign = "center";
  ctx.fillText(spot.statue.year.toString(), x, tagY);
  ctx.textAlign = "left";
  ctx.globalAlpha = 1;

  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.strokeStyle = CREAM;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 25, y - 6);
  ctx.lineTo(x - 25, y - 50);
  ctx.stroke();
  ctx.restore();

  const tileX = Math.round(x / TILE);
  const tileY = Math.round(y / TILE);

  if ((tileX + tileY) % 4 === 0) {
    circle(ctx, x + 22, y + 1, 1.6, "#8ba07a");
    circle(ctx, x - 23, y + 4, 1.2, "#8ba07a");
  }
}
