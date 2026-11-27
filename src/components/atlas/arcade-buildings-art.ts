import { TILE, type ArcadeZoneSpot } from "./atlas-world";

type Ctx = CanvasRenderingContext2D;

const CREAM = "#efe6d2";
const GOLD = "#d9b06a";
const INK = "#17131f";

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

function glow(ctx: Ctx, x: number, y: number, radius: number, color: string, alpha = 0.22) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = gradient;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  ctx.restore();
}

function shadow(ctx: Ctx, x: number, y: number, width: number) {
  ellipse(ctx, x, y + 4, width * 0.55, 7, "rgba(0,0,0,0.33)");
  ellipse(ctx, x, y + 3, width * 0.46, 4, "rgba(0,0,0,0.23)");
}

type FacadeOptions = {
  x: number;
  baseY: number;
  width: number;
  height: number;
  wall: string;
  wallDark: string;
  trim: string;
  roof: string;
  accent: string;
  sign: string;
  signColor?: string;
  door?: string;
  windows?: number;
  awning?: boolean;
  roofStyle?: "flat" | "pitched" | "parapet";
  signSide?: "center" | "left";
};

function paintFacade(ctx: Ctx, options: FacadeOptions) {
  const {
    x,
    baseY,
    width,
    height,
    wall,
    wallDark,
    trim,
    roof,
    accent,
    sign,
    signColor = accent,
    door = "#100e17",
    windows = 3,
    awning = false,
    roofStyle = "flat",
  } = options;
  const left = x - width / 2;
  const top = baseY - height;

  shadow(ctx, x, baseY, width + 14);

  // Steps.
  rect(ctx, x - 23, baseY - 2, 46, 7, "#4c4752");
  rect(ctx, x - 23, baseY - 2, 46, 1, "#78717e");
  rect(ctx, x - 19, baseY - 6, 38, 5, "#39343f");

  // Main wall.
  rect(ctx, left, top, width, height, wall);
  rect(ctx, left, top, width, 3, trim);
  rect(ctx, left, top, 3, height, wallDark);
  rect(ctx, left + width - 3, top, 3, height, wallDark);
  rect(ctx, left, baseY - 3, width, 3, "#211b27");

  // Roof.
  if (roofStyle === "pitched") {
    poly(
      ctx,
      [
        [left - 7, top],
        [x, top - 18],
        [left + width + 7, top],
        [left + width + 3, top + 3],
        [x, top - 12],
        [left - 3, top + 3],
      ],
      roof,
    );
    rect(ctx, left - 3, top + 1, width + 6, 3, accent);
  } else {
    rect(ctx, left - 4, top - 7, width + 8, 8, roof);
    rect(ctx, left - 4, top - 7, width + 8, 2, trim);
    rect(ctx, left - 4, top - 1, width + 8, 2, `${accent}66`);
  }

  // Windows.
  const windowY = top + 21;
  const gap = (width - 22) / Math.max(1, windows);
  for (let index = 0; index < windows; index += 1) {
    const wx = left + 13 + index * gap;
    const ww = Math.min(17, gap - 8);

    rect(ctx, wx - 2, windowY - 2, ww + 4, 20, wallDark);
    rect(ctx, wx, windowY, ww, 16, "#151a24");
    rect(ctx, wx, windowY, ww, 7, "rgba(255, 214, 148, 0.13)");
    line(ctx, wx + ww / 2, windowY, wx + ww / 2, windowY + 16, "#4b4450", 1);
    line(ctx, wx, windowY + 8, wx + ww, windowY + 8, "#4b4450", 1);
    rect(ctx, wx + 1, windowY + 9, 2, 6, "rgba(255, 214, 148, 0.18)");
  }

  // Door.
  const doorW = 26;
  const doorX = x - doorW / 2;
  rect(ctx, doorX - 3, baseY - 36, doorW + 6, 36, wallDark);
  rect(ctx, doorX, baseY - 32, doorW, 32, door);
  rect(ctx, doorX + 2, baseY - 30, doorW - 4, 28, "#221d2b");
  rect(ctx, doorX + 4, baseY - 26, doorW - 8, 14, `${accent}33`);
  circle(ctx, doorX + doorW - 6, baseY - 14, 1.2, "#ffe6ac");
  glow(ctx, x, baseY - 20, 34, accent, 0.1);

  // Awning.
  if (awning) {
    for (let index = 0; index < 7; index += 1) {
      rect(
        ctx,
        left + 8 + index * ((width - 16) / 7),
        baseY - 44,
        (width - 16) / 7,
        8,
        index % 2 === 0 ? accent : CREAM,
      );
    }
    rect(ctx, left + 4, baseY - 45, width - 8, 2, "#2b2533");
  }

  // Hanging signboard.
  const signWidth = Math.min(width - 18, sign.length * 6.4 + 22);
  const signX = options.signSide === "left" ? left + 12 : x - signWidth / 2;
  const signY = top + 5;
  rect(ctx, signX, signY, signWidth, 13, INK);
  rect(ctx, signX, signY, signWidth, 1, signColor);
  rect(ctx, signX, signY + 12, signWidth, 1, "#3c3546");
  ctx.fillStyle = signColor;
  ctx.font = `700 ${sign.length > 12 ? 4.4 : 5.4}px "Geist Mono", ui-monospace, monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(sign, signX + signWidth / 2, signY + 7);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  glow(ctx, signX + signWidth / 2, signY + 6, 34, signColor, 0.12);

  // Facade accent + vines/weathering.
  rect(ctx, left + 6, top + 16, 2, 3, `${accent}77`);
  rect(ctx, left + width - 10, top + 16, 2, 3, `${accent}77`);
}

function paintLitWindows(ctx: Ctx, x: number, top: number, width: number) {
  for (let index = 0; index < 4; index += 1) {
    const wx = x - width / 2 + 9 + index * ((width - 18) / 4);
    rect(ctx, wx, top, (width - 18) / 4 - 4, 6, "rgba(255, 211, 132, 0.26)");
  }
}

function paintNeon(ctx: Ctx, x: number, y: number, text: string, color: string, scale = 1) {
  ctx.save();
  ctx.font = `700 ${7 * scale}px "Geist Mono", ui-monospace, monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.globalAlpha = 0.28;
  ctx.fillStyle = color;
  ctx.fillText(text, x + 1.2, y + 1.2);
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#fff4dc";
  ctx.fillText(text, x, y);
  ctx.restore();
  glow(ctx, x, y, 42, color, 0.23);
}

function paintPalm(ctx: Ctx, x: number, y: number, scale = 1) {
  ellipse(ctx, x + 2, y + 2, 9 * scale, 3 * scale, "rgba(0,0,0,0.25)");
  line(ctx, x, y, x - 2 * scale, y - 25 * scale, "#5c4330", 2 * scale);

  for (const [fx, fy] of [
    [-18, -7],
    [-10, -13],
    [5, -15],
    [16, -9],
    [20, 0],
    [-20, 2],
  ] as Array<[number, number]>) {
    line(
      ctx,
      x - 2 * scale,
      y - 25 * scale,
      x + fx * scale,
      y - 25 * scale + fy * scale,
      "#4f8452",
      1.5 * scale,
    );
    for (let index = 1; index < 4; index += 1) {
      const t = index / 4;
      line(
        ctx,
        x - 2 * scale + fx * scale * t,
        y - 25 * scale + fy * scale * t,
        x - 2 * scale + fx * scale * t + (index % 2 ? 5 : -5) * scale,
        y - 25 * scale + fy * scale * t + 4 * scale,
        "#5f9b5a",
        0.7 * scale,
      );
    }
  }
}

function paintTaxi(ctx: Ctx, x: number, y: number, scale = 1) {
  ellipse(ctx, x + 2, y + 2, 17 * scale, 4 * scale, "rgba(0,0,0,0.3)");
  rect(ctx, x - 17 * scale, y - 9 * scale, 34 * scale, 9 * scale, "#d8b23c");
  rect(ctx, x - 12 * scale, y - 14 * scale, 24 * scale, 5 * scale, "#d8b23c");
  rect(ctx, x - 9 * scale, y - 13 * scale, 8 * scale, 4 * scale, "#41586b");
  rect(ctx, x + 2 * scale, y - 13 * scale, 7 * scale, 4 * scale, "#41586b");
  circle(ctx, x - 10 * scale, y + 1 * scale, 2.8 * scale, "#24212a");
  circle(ctx, x + 10 * scale, y + 1 * scale, 2.8 * scale, "#24212a");
  rect(ctx, x - 4 * scale, y - 18 * scale, 8 * scale, 3 * scale, "#fff1c9");
  ctx.fillStyle = "#2b2533";
  ctx.font = `700 ${2.8 * scale}px "Geist Mono", monospace`;
  ctx.textAlign = "center";
  ctx.fillText("TAXI", x, y - 16 * scale);
  ctx.textAlign = "left";
}

function paintLowrider(ctx: Ctx, x: number, y: number, scale = 1) {
  ellipse(ctx, x + 2, y + 2, 18 * scale, 4.5 * scale, "rgba(0,0,0,0.32)");
  rect(ctx, x - 18 * scale, y - 8 * scale, 36 * scale, 8 * scale, "#5b9a55");
  rect(ctx, x - 12 * scale, y - 13 * scale, 23 * scale, 5 * scale, "#5b9a55");
  rect(ctx, x - 8 * scale, y - 12 * scale, 7 * scale, 4 * scale, "#26384a");
  rect(ctx, x + 1 * scale, y - 12 * scale, 8 * scale, 4 * scale, "#26384a");
  rect(ctx, x - 16 * scale, y - 7 * scale, 5 * scale, 1.2 * scale, "#e8d9a8");
  circle(ctx, x - 10 * scale, y + 1 * scale, 3 * scale, "#1c1821");
  circle(ctx, x + 11 * scale, y + 1 * scale, 3 * scale, "#1c1821");
  circle(ctx, x - 10 * scale, y + 1 * scale, 1.2 * scale, "#b9b3c6");
  circle(ctx, x + 11 * scale, y + 1 * scale, 1.2 * scale, "#b9b3c6");
}

function paintCreeper(ctx: Ctx, x: number, y: number, scale = 1) {
  rect(ctx, x - 8 * scale, y - 17 * scale, 16 * scale, 14 * scale, "#79b65f");
  rect(ctx, x - 8 * scale, y - 17 * scale, 16 * scale, 3 * scale, "#8bca6c");
  rect(ctx, x - 5 * scale, y - 11 * scale, 3 * scale, 3 * scale, "#1d2b24");
  rect(ctx, x + 2 * scale, y - 11 * scale, 3 * scale, 3 * scale, "#1d2b24");
  rect(ctx, x - 3 * scale, y - 7 * scale, 6 * scale, 3 * scale, "#1d2b24");
  rect(ctx, x - 5 * scale, y - 3 * scale, 3 * scale, 3 * scale, "#5b8b47");
  rect(ctx, x + 2 * scale, y - 3 * scale, 3 * scale, 3 * scale, "#5b8b47");
}

function paintTikiTorch(ctx: Ctx, x: number, y: number, scale = 1) {
  line(ctx, x, y, x, y - 18 * scale, "#5a4630", 1.4 * scale);
  circle(ctx, x, y - 20 * scale, 2.4 * scale, "#ff9f43");
  circle(ctx, x, y - 21 * scale, 1.2 * scale, "#ffe6ac");
  glow(ctx, x, y - 21 * scale, 12 * scale, "#ff9f43", 0.2);
}

function paintPirateFlag(ctx: Ctx, x: number, y: number, scale = 1) {
  line(ctx, x, y, x, y - 32 * scale, "#3b2e23", 1.2 * scale);
  poly(
    ctx,
    [
      [x, y - 32 * scale],
      [x + 19 * scale, y - 28 * scale],
      [x + 14 * scale, y - 20 * scale],
      [x, y - 22 * scale],
    ],
    "#17131f",
  );
  circle(ctx, x + 8 * scale, y - 26 * scale, 3 * scale, "#efe6d2");
  rect(ctx, x + 6 * scale, y - 23 * scale, 4 * scale, 1, "#17131f");
  circle(ctx, x + 7 * scale, y - 26 * scale, 0.7, "#17131f");
  circle(ctx, x + 9.4 * scale, y - 26 * scale, 0.7, "#17131f");
}

function paintAmericanFlag(ctx: Ctx, x: number, y: number) {
  line(ctx, x, y, x, y - 26, "#5a4630", 1.2);
  rect(ctx, x, y - 26, 17, 10, "#d9d4c5");
  rect(ctx, x, y - 26, 8, 5, "#3f4f7a");
  for (let index = 0; index < 3; index += 1) {
    rect(ctx, x, y - 23 + index * 3, 17, 1, "#b53a3a");
  }
  for (let index = 0; index < 4; index += 1) {
    circle(ctx, x + 2 + index * 1.8, y - 24, 0.32, "#efe6d2");
  }
}

function paintDragon(ctx: Ctx, x: number, y: number, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.strokeStyle = "#e8c46b";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-14, 6);
  ctx.bezierCurveTo(-2, 18, 14, 7, 8, -8);
  ctx.bezierCurveTo(3, -19, -11, -13, -8, -3);
  ctx.stroke();
  circle(ctx, 8, -8, 2.6, "#e8c46b");
  for (const [dx, dy] of [
    [-10, 2],
    [-5, 8],
    [1, 11],
    [7, 9],
  ] as Array<[number, number]>) {
    line(ctx, dx, dy, dx + 5, dy - 2, "#e8c46b", 1);
  }
  ctx.restore();
}

function paintStadium(ctx: Ctx, x: number, baseY: number, accent: string, sign: string) {
  shadow(ctx, x, baseY, 120);
  rect(ctx, x - 57, baseY - 64, 114, 64, "#27383a");
  rect(ctx, x - 57, baseY - 64, 114, 8, "#4e6a5d");
  rect(ctx, x - 52, baseY - 53, 104, 17, "#182c2b");
  rect(ctx, x - 52, baseY - 51, 104, 13, "#2f5b45");

  for (let index = 0; index < 12; index += 1) {
    rect(ctx, x - 50 + index * 8.5, baseY - 50, 6, 10, index % 2 ? "#477a5a" : "#3a6a4d");
  }

  // Seats and floodlights.
  for (const side of [-1, 1]) {
    poly(
      ctx,
      [
        [x + side * 57, baseY - 64],
        [x + side * 40, baseY - 77],
        [x + side * 26, baseY - 64],
      ],
      "#3a3a44",
    );
    line(ctx, x + side * 49, baseY - 64, x + side * 49, baseY - 87, "#5a5760", 2);
    for (let index = 0; index < 3; index += 1) {
      rect(ctx, x + side * 49 - 6, baseY - 89 + index * 2, 12, 1.5, "#ffe6ac");
    }
    glow(ctx, x + side * 49, baseY - 86, 35, "#ffe6ac", 0.13);
  }

  rect(ctx, x - 25, baseY - 36, 50, 28, "#1e2930");
  rect(ctx, x - 20, baseY - 32, 40, 20, "#2f5961");
  rect(ctx, x - 20, baseY - 32, 40, 2, accent);
  ctx.fillStyle = sign;
  ctx.font = '700 6px "Geist Mono", monospace';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(sign, x, baseY - 27);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  for (let index = 0; index < 4; index += 1) {
    rect(ctx, x - 18 + index * 10, baseY - 6, 7, 6, "#26343b");
    circle(ctx, x - 14.5 + index * 10, baseY - 9, 2.4, "#d8b23c");
  }

  paintPalm(ctx, x - 54, baseY - 4, 0.7);
  circle(ctx, x + 44, baseY - 5, 5, CREAM);
  circle(ctx, x + 43, baseY - 6, 1.4, "#2b2533");
  circle(ctx, x + 46, baseY - 6, 1.4, "#2b2533");
}

function paintPavilion(ctx: Ctx, x: number, baseY: number, accent: string, sign: string) {
  shadow(ctx, x, baseY, 116);
  rect(ctx, x - 52, baseY - 58, 104, 58, "#e0ded2");
  rect(ctx, x - 52, baseY - 58, 104, 3, "#a3a79b");
  poly(
    ctx,
    [
      [x - 60, baseY - 58],
      [x, baseY - 76],
      [x + 60, baseY - 58],
    ],
    "#3e5c49",
  );
  rect(ctx, x - 60, baseY - 58, 120, 3, "#d9b06a");

  for (let index = 0; index < 5; index += 1) {
    rect(ctx, x - 44 + index * 22, baseY - 49, 14, 15, "#7c9c8a");
    rect(ctx, x - 44 + index * 22, baseY - 49, 14, 1, "#b8c8b8");
  }

  rect(ctx, x - 23, baseY - 30, 46, 24, "#f0e8d4");
  rect(ctx, x - 20, baseY - 27, 40, 18, "#454f48");
  ctx.fillStyle = accent;
  ctx.font = `700 5px "Geist Mono", monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(sign, x, baseY - 18);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  // Sightscreen and boundary rope.
  rect(ctx, x - 56, baseY - 25, 18, 25, "#e8e1cc");
  rect(ctx, x - 54, baseY - 22, 14, 17, "#b8b49f");
  line(ctx, x - 48, baseY - 2, x + 50, baseY - 2, "#e8e1cc", 1);
  for (const rx of [-38, -14, 10, 34]) {
    rect(ctx, rx + x, baseY - 6, 2, 5, "#e8e1cc");
  }
  for (let index = 0; index < 3; index += 1) {
    rect(ctx, x + 34 + index * 4, baseY - 19, 2, 12, "#d9b06a");
  }
  circle(ctx, x + 41, baseY - 14, 2.4, "#b53a3a");
}

function paintMishima(ctx: Ctx, x: number, baseY: number, accent: string, sign: string) {
  shadow(ctx, x, baseY, 118);
  rect(ctx, x - 52, baseY - 52, 104, 52, "#4c3829");
  rect(ctx, x - 52, baseY - 52, 104, 2, "#806345");
  rect(ctx, x - 55, baseY - 66, 110, 15, "#211d22");
  poly(
    ctx,
    [
      [x - 62, baseY - 66],
      [x, baseY - 80],
      [x + 62, baseY - 66],
    ],
    "#2c2521",
  );
  rect(ctx, x - 62, baseY - 66, 124, 3, "#8a6948");

  for (let index = 0; index < 4; index += 1) {
    rect(ctx, x - 43 + index * 23, baseY - 45, 15, 18, "#d9c7a5");
    rect(ctx, x - 42 + index * 23, baseY - 44, 13, 15, "#5d4934");
    rect(ctx, x - 42 + index * 23, baseY - 40, 13, 1, "#8c6f4b");
  }

  rect(ctx, x - 22, baseY - 32, 44, 32, "#2b211a");
  rect(ctx, x - 17, baseY - 27, 34, 27, "#17130f");
  rect(ctx, x - 15, baseY - 24, 30, 16, `${accent}33`);
  ctx.fillStyle = accent;
  ctx.font = '700 5px "Geist Mono", monospace';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(sign, x, baseY - 16);

  for (const side of [-1, 1]) {
    line(ctx, x + side * 34, baseY - 26, x + side * 34, baseY - 52, "#3d2d20", 1.4);
    circle(ctx, x + side * 34, baseY - 55, 4, "#ff9f43");
    circle(ctx, x + side * 34, baseY - 56, 2, "#ffe6ac");
    glow(ctx, x + side * 34, baseY - 55, 16, "#ff9f43", 0.18);
  }

  // Fist medallion.
  circle(ctx, x, baseY - 57, 7, "#8a6948");
  circle(ctx, x, baseY - 57, 5.4, "#2b211a");
  rect(ctx, x - 2.5, baseY - 60, 5, 5, accent);
  rect(ctx, x - 4, baseY - 58, 8, 2, accent);
}

function paintWweArena(ctx: Ctx, x: number, baseY: number, accent: string, sign: string) {
  shadow(ctx, x, baseY, 122);
  rect(ctx, x - 58, baseY - 58, 116, 58, "#29212d");
  rect(ctx, x - 58, baseY - 58, 116, 3, "#5e394c");
  rect(ctx, x - 62, baseY - 70, 124, 12, "#17131f");
  rect(ctx, x - 62, baseY - 70, 124, 2, accent);
  paintNeon(ctx, x, baseY - 64, sign, accent, 0.9);

  for (const side of [-1, 1]) {
    line(ctx, x + side * 44, baseY - 58, x + side * 44, baseY - 78, "#4b4552", 1.5);
    for (let index = 0; index < 3; index += 1) {
      circle(ctx, x + side * 44 + (index - 1) * 3, baseY - 80 - index * 2, 2.2, "#ffe6ac");
    }
    glow(ctx, x + side * 44, baseY - 78, 30, "#ffe6ac", 0.13);
  }

  rect(ctx, x - 28, baseY - 38, 56, 30, "#1d1822");
  rect(ctx, x - 24, baseY - 34, 48, 20, "#4b2433");
  rect(ctx, x - 24, baseY - 34, 48, 1, accent);
  for (let index = 0; index < 3; index += 1) {
    rect(ctx, x - 15 + index * 13, baseY - 28, 8, 8, "#8a2f3a");
    rect(ctx, x - 15 + index * 13, baseY - 28, 8, 1, GOLD);
  }
  rect(ctx, x - 37, baseY - 6, 74, 6, "#6e222c");
  rect(ctx, x - 37, baseY - 6, 74, 1, GOLD);

  // Spotlight cones.
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (const side of [-1, 1]) {
    const gradient = ctx.createLinearGradient(x + side * 44, baseY - 76, x + side * 18, baseY);
    gradient.addColorStop(0, "rgba(255, 224, 160, 0.16)");
    gradient.addColorStop(1, "rgba(255, 224, 160, 0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(x + side * 40, baseY - 76);
    ctx.lineTo(x + side * 52, baseY - 76);
    ctx.lineTo(x + side * 28, baseY);
    ctx.lineTo(x + side * 6, baseY);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function paintVaasCamp(ctx: Ctx, x: number, baseY: number, accent: string, sign: string) {
  shadow(ctx, x, baseY, 118);
  rect(ctx, x - 50, baseY - 42, 100, 42, "#4b3826");
  rect(ctx, x - 50, baseY - 42, 100, 2, "#7d5c36");
  poly(
    ctx,
    [
      [x - 62, baseY - 42],
      [x - 34, baseY - 66],
      [x, baseY - 54],
      [x + 34, baseY - 68],
      [x + 62, baseY - 42],
    ],
    "#7b6335",
  );
  for (let index = 0; index < 12; index += 1) {
    line(ctx, x - 58 + index * 10, baseY - 43, x - 44 + index * 8, baseY - 58, "#5b4828", 1);
  }
  rect(ctx, x - 62, baseY - 42, 124, 3, "#9a804a");

  for (let index = 0; index < 4; index += 1) {
    rect(ctx, x - 43 + index * 23, baseY - 32, 14, 12, "#2b2418");
    rect(ctx, x - 42 + index * 23, baseY - 31, 12, 9, "#d9a066");
  }

  rect(ctx, x - 20, baseY - 29, 40, 29, "#191510");
  rect(ctx, x - 15, baseY - 25, 30, 21, "#2b2114");
  rect(ctx, x - 12, baseY - 22, 24, 12, `${accent}22`);
  ctx.fillStyle = accent;
  ctx.font = '700 6px "Geist Mono", monospace';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(sign, x, baseY - 16);

  paintPirateFlag(ctx, x - 50, baseY - 2, 1);
  paintTikiTorch(ctx, x + 42, baseY - 2, 1);
  paintTikiTorch(ctx, x - 36, baseY - 2, 0.85);

  for (const [sx, sy] of [
    [-27, -10],
    [24, -8],
    [30, -14],
  ] as Array<[number, number]>) {
    rect(ctx, x + sx - 4, baseY + sy, 9, 7, "#6f5b3e");
    rect(ctx, x + sx - 2, baseY + sy + 3, 5, 5, "#241f18");
  }

  // Jungle leaves at the edges.
  for (let index = 0; index < 5; index += 1) {
    line(
      ctx,
      x - 56 + index * 2,
      baseY - 4,
      x - 70 + index * 3,
      baseY - 20 - index * 2,
      "#3f7148",
      1.4,
    );
    line(
      ctx,
      x + 52 - index * 2,
      baseY - 4,
      x + 68 - index * 3,
      baseY - 18 - index * 2,
      "#3f7148",
      1.4,
    );
  }
}

function paintPripyat(ctx: Ctx, x: number, baseY: number, accent: string, sign: string) {
  shadow(ctx, x, baseY, 122);

  // Distant ferris wheel.
  ctx.save();
  ctx.globalAlpha = 0.25;
  circle(ctx, x + 50, baseY - 58, 20, "#4b4650");
  for (let index = 0; index < 8; index += 1) {
    const angle = (index / 8) * Math.PI * 2;
    line(
      ctx,
      x + 50,
      baseY - 58,
      x + 50 + Math.cos(angle) * 20,
      baseY - 58 + Math.sin(angle) * 20,
      "#6f6977",
      0.8,
    );
    circle(ctx, x + 50 + Math.cos(angle) * 20, baseY - 58 + Math.sin(angle) * 20, 2, "#3d3945");
  }
  line(ctx, x + 50, baseY - 58, x + 44, baseY - 14, "#4b4650", 1.4);
  line(ctx, x + 50, baseY - 58, x + 57, baseY - 14, "#4b4650", 1.4);
  ctx.restore();

  rect(ctx, x - 56, baseY - 62, 108, 62, "#4e4b4b");
  rect(ctx, x - 56, baseY - 62, 108, 3, "#6f6a66");
  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      const wx = x - 47 + col * 24;
      const wy = baseY - 53 + row * 15;
      rect(ctx, wx, wy, 14, 9, "#242327");
      rect(ctx, wx + 1, wy + 1, 12, 7, "rgba(20, 21, 24, 0.75)");

      if ((row + col) % 3 === 0) {
        line(ctx, wx + 2, wy + 1, wx + 10, wy + 7, "#615a5b", 0.8);
        line(ctx, wx + 4, wy + 8, wx + 12, wy + 2, "#615a5b", 0.8);
      }
    }
  }

  // Gap in the wall and rubble.
  poly(
    ctx,
    [
      [x - 12, baseY - 62],
      [x + 14, baseY - 62],
      [x + 10, baseY - 30],
      [x - 7, baseY - 26],
    ],
    "#242224",
  );
  rect(ctx, x - 26, baseY - 30, 58, 30, "#3d3b3b");
  rect(ctx, x - 20, baseY - 28, 44, 20, "#1d1d20");
  ctx.fillStyle = accent;
  ctx.font = '700 5px "Geist Mono", monospace';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(sign, x, baseY - 20);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  // Sandbags and radiation.
  for (let index = 0; index < 3; index += 1) {
    rect(ctx, x - 55 + index * 5, baseY - 7 - index * 2, 20, 6, "#5b563f");
    rect(ctx, x + 35 + index * 3, baseY - 8 - index * 2, 16, 6, "#5b563f");
  }
  circle(ctx, x + 43, baseY - 25, 5, "#b8a64b");
  circle(ctx, x + 43, baseY - 25, 1.6, "#2b2a1f");
  for (let index = 0; index < 3; index += 1) {
    const angle = (index / 3) * Math.PI * 2;
    line(
      ctx,
      x + 43 + Math.cos(angle) * 3,
      baseY - 25 + Math.sin(angle) * 3,
      x + 43 + Math.cos(angle) * 5,
      baseY - 25 + Math.sin(angle) * 5,
      "#2b2a1f",
      1.1,
    );
  }
}

function paintSkeld(ctx: Ctx, x: number, baseY: number, accent: string, sign: string) {
  shadow(ctx, x, baseY, 120);
  poly(
    ctx,
    [
      [x - 56, baseY - 10],
      [x - 40, baseY - 46],
      [x + 38, baseY - 50],
      [x + 56, baseY - 14],
      [x + 42, baseY - 2],
      [x - 42, baseY - 2],
    ],
    "#d7dbe0",
  );
  poly(
    ctx,
    [
      [x - 40, baseY - 46],
      [x + 38, baseY - 50],
      [x + 32, baseY - 36],
      [x - 32, baseY - 32],
    ],
    "#aeb7c2",
  );
  rect(ctx, x - 56, baseY - 18, 112, 12, "#b23c45");
  rect(ctx, x - 56, baseY - 18, 112, 2, "#e8a3a7");

  for (let index = 0; index < 5; index += 1) {
    const wx = x - 42 + index * 19;
    circle(ctx, wx, baseY - 27, 5.5, "#1b2534");
    circle(ctx, wx, baseY - 27, 4.4, "#4a8da8");
    rect(ctx, wx - 3, baseY - 29, 6, 1.4, "#cdebf4");
  }

  rect(ctx, x - 24, baseY - 30, 48, 26, "#2b2d35");
  rect(ctx, x - 20, baseY - 27, 40, 22, "#46505d");
  rect(ctx, x - 20, baseY - 27, 40, 2, accent);
  ctx.fillStyle = "#efe6d2";
  ctx.font = '700 5px "Geist Mono", monospace';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(sign, x, baseY - 16);

  for (let index = 0; index < 4; index += 1) {
    rect(ctx, x - 48 + index * 25, baseY - 12, 15, 4, "#7d8792");
  }

  paintCrewmate(ctx, x + 40, baseY - 12, 0.9);
  paintCrewmate(ctx, x - 42, baseY - 12, 0.7);
}

function paintCrewmate(ctx: Ctx, x: number, y: number, scale: number) {
  ellipse(ctx, x, y + 2, 8 * scale, 2.5 * scale, "rgba(0,0,0,0.28)");
  rect(ctx, x - 5 * scale, y - 13 * scale, 10 * scale, 13 * scale, "#e84a5f");
  rect(ctx, x - 3 * scale, y - 15 * scale, 7 * scale, 4 * scale, "#e84a5f");
  rect(ctx, x - 2 * scale, y - 11 * scale, 6 * scale, 4 * scale, "#bfe9f5");
  rect(ctx, x + 1 * scale, y - 10 * scale, 2 * scale, 3 * scale, "#1a2230");
  rect(ctx, x - 5 * scale, y - 2 * scale, 3 * scale, 4 * scale, "#9b2f40");
  rect(ctx, x + 2 * scale, y - 2 * scale, 3 * scale, 4 * scale, "#9b2f40");
}

function paintRadarBunker(ctx: Ctx, x: number, baseY: number, accent: string, sign: string) {
  shadow(ctx, x, baseY, 118);
  rect(ctx, x - 56, baseY - 44, 112, 44, "#4a4d4a");
  rect(ctx, x - 56, baseY - 44, 112, 3, "#737772");
  rect(ctx, x - 56, baseY - 18, 112, 3, "#30332f");

  // Radar dish.
  line(ctx, x + 34, baseY - 43, x + 34, baseY - 67, "#5f6460", 2);
  ctx.save();
  ctx.translate(x + 34, baseY - 70);
  ctx.rotate(-0.35);
  ellipse(ctx, 0, 0, 16, 5, "#8d938d");
  ellipse(ctx, 0, -1, 13, 3.4, "#c5cbc3");
  line(ctx, -14, 0, 14, 0, "#6f756f", 1);
  circle(ctx, 0, -2, 2, "#3a3f3a");
  ctx.restore();

  rect(ctx, x - 27, baseY - 34, 54, 34, "#2f332f");
  rect(ctx, x - 23, baseY - 30, 46, 27, "#5f655f");
  rect(ctx, x - 23, baseY - 30, 46, 2, accent);
  ctx.fillStyle = accent;
  ctx.font = '700 5px "Geist Mono", monospace';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(sign, x, baseY - 22);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  for (const [wx, wy] of [
    [x - 48, baseY - 38],
    [x + 44, baseY - 38],
    [x - 48, baseY - 26],
    [x + 44, baseY - 26],
  ] as Array<[number, number]>) {
    rect(ctx, wx, wy, 8, 5, "#1e2624");
    rect(ctx, wx + 1, wy + 1, 6, 1, "rgba(86, 224, 255, 0.25)");
  }

  for (let index = 0; index < 4; index += 1) {
    rect(ctx, x - 53 + index * 7, baseY - 4, 10, 4, "#54594f");
  }
  for (let index = 0; index < 3; index += 1) {
    line(ctx, x - 58 + index * 6, baseY, x - 52 + index * 6, baseY - 24, "#3d423a", 1.5);
  }
}

function paintBuilding(ctx: Ctx, zone: ArcadeZoneSpot) {
  const x = zone.center.x;
  const baseY = zone.center.y + 3.05 * TILE;
  const accent = zone.statue.paint;
  const sign = zone.building.facadeSign;
  const id = zone.statue.id;

  switch (id) {
    case "gta-san-andreas": {
      paintFacade(ctx, {
        x,
        baseY,
        width: 108,
        height: 64,
        wall: "#d3c5a1",
        wallDark: "#a89b79",
        trim: "#efe6d2",
        roof: "#38583e",
        accent,
        sign,
        windows: 2,
        roofStyle: "pitched",
      });
      // Garage.
      rect(ctx, x - 50, baseY - 31, 29, 31, "#7f8b79");
      for (let index = 0; index < 4; index += 1) {
        rect(ctx, x - 48, baseY - 29 + index * 7, 25, 1, "#556356");
      }
      paintLowrider(ctx, x - 57, baseY + 1, 0.8);
      paintPalm(ctx, x + 52, baseY - 2, 0.85);
      paintAmericanFlag(ctx, x - 42, baseY - 61);
      break;
    }
    case "gta-iii": {
      paintFacade(ctx, {
        x,
        baseY,
        width: 112,
        height: 68,
        wall: "#402e3c",
        wallDark: "#2c1f2a",
        trim: "#725263",
        roof: "#1d1620",
        accent,
        sign: "",
        windows: 3,
      });
      paintNeon(ctx, x, baseY - 54, sign, accent, 1.1);
      // Red awning and rope.
      for (let index = 0; index < 6; index += 1) {
        rect(ctx, x - 41 + index * 14, baseY - 38, 10, 6, index % 2 ? "#8a2f3a" : "#d9d4c5");
      }
      rect(ctx, x - 44, baseY - 39, 88, 2, "#2b211a");
      for (const side of [-1, 1]) {
        rect(ctx, x + side * 33, baseY - 6, 2, 6, "#d9b06a");
        circle(ctx, x + side * 33, baseY - 7, 2, "#d9b06a");
      }
      paintTaxi(ctx, x + 55, baseY + 1, 0.72);
      break;
    }
    case "gta-vice-city": {
      paintFacade(ctx, {
        x,
        baseY,
        width: 112,
        height: 70,
        wall: "#e5b4c4",
        wallDark: "#b7788d",
        trim: "#ffd9e4",
        roof: "#4d2b44",
        accent,
        sign: "",
        windows: 3,
        roofStyle: "parapet",
      });
      paintNeon(ctx, x, baseY - 57, sign, accent, 1.15);
      // Deco chevrons and awning.
      for (let index = 0; index < 4; index += 1) {
        poly(
          ctx,
          [
            [x - 38 + index * 21, baseY - 33],
            [x - 25 + index * 21, baseY - 33],
            [x - 29 + index * 21, baseY - 26],
            [x - 42 + index * 21, baseY - 26],
          ],
          index % 2 ? "#5fb3a1" : "#ff7ab8",
        );
      }
      rect(ctx, x - 45, baseY - 38, 90, 2, "#ffd9e4");
      paintPalm(ctx, x - 51, baseY - 1, 0.9);
      paintPalm(ctx, x + 50, baseY - 1, 0.7);
      paintFlamingo(ctx, x + 41, baseY - 5);
      break;
    }
    case "gta-iv": {
      paintFacade(ctx, {
        x,
        baseY,
        width: 112,
        height: 62,
        wall: "#7f5b42",
        wallDark: "#60422f",
        trim: "#a27a58",
        roof: "#2b211a",
        accent,
        sign,
        windows: 3,
      });
      // Roll-up door.
      rect(ctx, x - 49, baseY - 27, 31, 27, "#3a3b38");
      for (let index = 0; index < 7; index += 1) {
        rect(ctx, x - 47, baseY - 25 + index * 3.6, 27, 1, "#5f6059");
      }
      paintTaxi(ctx, x + 51, baseY + 1, 0.8);
      rect(ctx, x + 29, baseY - 18, 15, 8, "#d8b23c");
      rect(ctx, x + 31, baseY - 16, 11, 4, "#24212a");
      circle(ctx, x + 36.5, baseY - 14, 1.7, "#efe6d2");
      break;
    }
    case "gta-v": {
      paintFacade(ctx, {
        x,
        baseY,
        width: 116,
        height: 72,
        wall: "#d9d6ce",
        wallDark: "#a9a59c",
        trim: "#f3efe5",
        roof: "#47454a",
        accent,
        sign,
        windows: 4,
        roofStyle: "flat",
      });
      // Glass wall and pool.
      rect(ctx, x + 24, baseY - 49, 29, 32, "#2c3f4a");
      rect(ctx, x + 27, baseY - 46, 23, 26, "#4d7482");
      for (let index = 0; index < 4; index += 1) {
        rect(ctx, x + 27, baseY - 45 + index * 7, 23, 1, "#a8d5dc");
      }
      ellipse(ctx, x, baseY + 1, 50, 8, "#2b5667");
      ellipse(ctx, x, baseY - 1, 46, 5.5, "#3f7f93");
      rect(ctx, x - 24, baseY - 2, 16, 1, "rgba(190, 240, 245, 0.23)");
      // Helicopter silhouette on the roof.
      ctx.save();
      ctx.translate(x - 27, baseY - 75);
      rect(ctx, -12, -3, 17, 5, "#34343a");
      rect(ctx, 4, -2, 8, 1.4, "#34343a");
      line(ctx, -6, -9, 4, -9, "#34343a", 1);
      line(ctx, -2, -3, -2, -9, "#34343a", 1);
      ctx.restore();
      paintPalm(ctx, x + 54, baseY - 8, 0.8);
      break;
    }
    case "assassins-creed": {
      // Auditore tower.
      rect(ctx, x - 24, baseY - 90, 48, 90, "#8c8173");
      rect(ctx, x - 24, baseY - 90, 48, 2, "#c7bda8");
      for (let index = 0; index < 4; index += 1) {
        rect(ctx, x - 22 + index * 12, baseY - 97, 7, 8, "#756b5d");
      }
      for (let row = 0; row < 3; row += 1) {
        rect(ctx, x - 16, baseY - 76 + row * 21, 9, 12, "#2d2a27");
        rect(ctx, x + 7, baseY - 76 + row * 21, 9, 12, "#2d2a27");
      }
      rect(ctx, x - 30, baseY - 48, 60, 48, "#6f6659");
      rect(ctx, x - 30, baseY - 48, 60, 2, "#a29784");
      rect(ctx, x - 18, baseY - 34, 36, 34, "#2e2923");
      rect(ctx, x - 14, baseY - 31, 28, 27, "#554a3b");
      rect(ctx, x - 9, baseY - 17, 18, 14, accent);
      rect(ctx, x - 9, baseY - 17, 18, 14, "rgba(242, 236, 221, 0.6)");
      for (const side of [-1, 1]) {
        rect(ctx, x + side * 26, baseY - 45, 2, 30, "#3d3328");
        poly(
          ctx,
          [
            [x + side * 26, baseY - 45],
            [x + side * 39, baseY - 43],
            [x + side * 36, baseY - 30],
            [x + side * 26, baseY - 31],
          ],
          "#f2ecdd",
        );
        rect(ctx, x + side * 30, baseY - 40, 3, 7, "#b53a3a");
      }
      paintCypress(ctx, x - 49, baseY - 1, 1);
      paintCypress(ctx, x + 49, baseY - 1, 0.8);
      paintHay(ctx, x - 42, baseY - 2);
      break;
    }
    case "watch-dogs": {
      paintFacade(ctx, {
        x,
        baseY,
        width: 112,
        height: 76,
        wall: "#1e3039",
        wallDark: "#14222a",
        trim: "#3f6472",
        roof: "#0d161c",
        accent,
        sign: "",
        windows: 4,
        roofStyle: "flat",
      });
      for (let index = 0; index < 5; index += 1) {
        rect(ctx, x - 45 + index * 20, baseY - 53, 13, 28, "#162d38");
        rect(ctx, x - 45 + index * 20, baseY - 53, 13, 1, `${accent}66`);
        for (let row = 0; row < 4; row += 1) {
          rect(ctx, x - 44 + index * 20, baseY - 51 + row * 6, 11, 1, "rgba(86, 224, 255, 0.16)");
        }
      }
      paintNeon(ctx, x, baseY - 68, sign, accent, 1);
      rect(ctx, x - 20, baseY - 20, 40, 20, "#0e1b22");
      rect(ctx, x - 16, baseY - 18, 32, 14, "#1c3a45");
      rect(ctx, x - 16, baseY - 18, 32, 1, accent);
      // Camera on a pole.
      line(ctx, x + 45, baseY - 2, x + 45, baseY - 36, "#5a6870", 1.4);
      rect(ctx, x + 41, baseY - 39, 10, 5, "#27363e");
      circle(ctx, x + 47, baseY - 36.5, 1.6, accent);
      break;
    }
    case "minecraft": {
      // Blocky cottage.
      rect(ctx, x - 47, baseY - 60, 94, 60, "#98724a");
      for (let row = 0; row < 5; row += 1) {
        rect(ctx, x - 47, baseY - 60 + row * 12, 94, 1, "#765636");
      }
      rect(ctx, x - 52, baseY - 70, 104, 12, "#5c4630");
      poly(
        ctx,
        [
          [x - 60, baseY - 70],
          [x - 30, baseY - 84],
          [x + 30, baseY - 84],
          [x + 60, baseY - 70],
        ],
        "#4c7a3c",
      );
      for (let index = 0; index < 6; index += 1) {
        rect(ctx, x - 52 + index * 18, baseY - 69, 14, 4, index % 2 ? "#5f8f49" : "#573f2b");
      }
      for (const wx of [x - 35, x + 21]) {
        rect(ctx, wx, baseY - 50, 16, 16, "#3b2b1e");
        rect(ctx, wx + 2, baseY - 48, 12, 12, "#90c8d4");
        rect(ctx, wx + 2, baseY - 48, 12, 5, "#b9e0e0");
      }
      rect(ctx, x - 14, baseY - 30, 28, 30, "#4a321f");
      rect(ctx, x - 10, baseY - 26, 20, 26, "#2a1b10");
      rect(ctx, x - 8, baseY - 24, 16, 16, "#5b3d24");
      // Torch, tree, creeper.
      line(ctx, x + 58, baseY - 2, x + 58, baseY - 18, "#5a4630", 1.2);
      circle(ctx, x + 58, baseY - 20, 2.6, "#ffcf33");
      glow(ctx, x + 58, baseY - 20, 14, "#ffcf33", 0.17);
      paintBlockTree(ctx, x - 58, baseY - 2, 0.9);
      paintCreeper(ctx, x + 45, baseY - 4, 0.8);
      break;
    }
    case "among-us": {
      paintSkeld(ctx, x, baseY, accent, sign);
      break;
    }
    case "mortal-kombat": {
      // Wu Shi pagoda.
      rect(ctx, x - 48, baseY - 56, 96, 56, "#5a2e2e");
      rect(ctx, x - 52, baseY - 70, 104, 15, "#21171a");
      poly(
        ctx,
        [
          [x - 62, baseY - 70],
          [x - 44, baseY - 82],
          [x + 44, baseY - 82],
          [x + 62, baseY - 70],
        ],
        "#8a3f36",
      );
      rect(ctx, x - 62, baseY - 70, 124, 3, "#d9b06a");
      for (let index = 0; index < 3; index += 1) {
        rect(ctx, x - 38 + index * 33, baseY - 52, 23, 21, "#3b2321");
        rect(ctx, x - 36 + index * 33, baseY - 50, 19, 16, "#c49a55");
        rect(ctx, x - 34 + index * 33, baseY - 48, 15, 12, "#2b1c1c");
      }
      rect(ctx, x - 20, baseY - 28, 40, 28, "#21171a");
      rect(ctx, x - 15, baseY - 24, 30, 24, "#4b241f");
      rect(ctx, x - 12, baseY - 20, 24, 15, `${accent}22`);
      ctx.fillStyle = accent;
      ctx.font = '700 5.4px "Geist Mono", monospace';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(sign, x, baseY - 13);
      paintDragon(ctx, x, baseY - 77, 0.8);
      for (const side of [-1, 1]) {
        circle(ctx, x + side * 44, baseY - 50, 4, "#ff9f43");
        glow(ctx, x + side * 44, baseY - 50, 14, "#ff9f43", 0.18);
        rect(ctx, x + side * 44 - 1, baseY - 50, 2, 8, "#5b2d26");
      }
      break;
    }
    case "call-of-duty": {
      paintPripyat(ctx, x, baseY, accent, sign);
      break;
    }
    case "igi": {
      paintRadarBunker(ctx, x, baseY, accent, sign);
      break;
    }
    case "tekken": {
      paintMishima(ctx, x, baseY, accent, sign);
      break;
    }
    case "fifa": {
      paintStadium(ctx, x, baseY, accent, sign);
      break;
    }
    case "cricket-07": {
      paintPavilion(ctx, x, baseY, accent, sign);
      break;
    }
    case "wwe-2k15": {
      paintWweArena(ctx, x, baseY, accent, sign);
      break;
    }
    case "far-cry-3": {
      paintVaasCamp(ctx, x, baseY, accent, sign);
      break;
    }
    default: {
      paintFacade(ctx, {
        x,
        baseY,
        width: 108,
        height: 62,
        wall: "#4e4a52",
        wallDark: "#39353e",
        trim: "#716b76",
        roof: "#26222b",
        accent,
        sign,
        windows: 3,
      });
    }
  }

  // Door light and step shadow shared by all buildings.
  glow(ctx, x, baseY - 15, 30, accent, 0.11);
  for (let index = 0; index < 3; index += 1) {
    circle(ctx, x - 15 + index * 15, baseY - 3, 1.1, `${accent}88`);
  }
  paintLitWindows(ctx, x, baseY - 45, 76);
}

function paintCypress(ctx: Ctx, x: number, y: number, scale: number) {
  ellipse(ctx, x + 2, y + 2, 7 * scale, 2.4 * scale, "rgba(0,0,0,0.25)");
  rect(ctx, x - 1, y - 5 * scale, 2, 5 * scale, "#5a4630");
  for (let index = 0; index < 3; index += 1) {
    ellipse(
      ctx,
      x,
      y - (8 + index * 8) * scale,
      (6 - index) * scale,
      (8 - index) * scale,
      "#33513f",
    );
  }
}

function paintHay(ctx: Ctx, x: number, y: number) {
  ellipse(ctx, x, y + 2, 9, 3, "rgba(0,0,0,0.22)");
  rect(ctx, x - 9, y - 9, 18, 11, "#b3924f");
  rect(ctx, x - 9, y - 9, 18, 2, "#d8b66b");
  for (let index = 0; index < 3; index += 1) {
    line(ctx, x - 7, y - 8 + index * 3, x + 8, y - 8 + index * 3, "#8a6d36", 0.9);
  }
  circle(ctx, x + 7, y - 10, 3, "#e0c075");
}

function paintFlamingo(ctx: Ctx, x: number, y: number) {
  line(ctx, x, y, x, y - 16, "#ff7ab8", 1.4);
  polygonFlamingoBody(ctx, x, y - 18);
  line(ctx, x, y - 16, x + 3, y - 7, "#ff7ab8", 1);
  line(ctx, x, y - 16, x - 3, y - 7, "#ff7ab8", 1);
  circle(ctx, x - 1, y - 18, 2.8, "#ff9fcb");
  circle(ctx, x - 1.7, y - 18.5, 0.7, "#2b2533");
  glow(ctx, x, y - 15, 15, "#ff7ab8", 0.13);
}

function polygonFlamingoBody(ctx: Ctx, x: number, y: number) {
  ellipse(ctx, x + 2, y - 2, 5, 3, "#ff7ab8");
  circle(ctx, x - 2, y - 2, 2.2, "#ff9fcb");
}

function paintBlockTree(ctx: Ctx, x: number, y: number, scale: number) {
  ellipse(ctx, x + 2, y + 2, 8 * scale, 2.4 * scale, "rgba(0,0,0,0.22)");
  rect(ctx, x - 1.5 * scale, y - 15 * scale, 3 * scale, 15 * scale, "#5a4630");
  for (let level = 0; level < 3; level += 1) {
    const w = (15 - level * 3) * scale;
    rect(
      ctx,
      x - w / 2,
      y - 15 * scale - level * 5 * scale,
      w,
      5 * scale,
      level % 2 ? "#3e7a62" : "#356b4c",
    );
    rect(ctx, x - w / 2, y - 15 * scale - level * 5 * scale, w, 1, "rgba(170, 230, 190, 0.2)");
  }
}

export function paintGameBuilding(ctx: Ctx, zone: ArcadeZoneSpot) {
  ctx.save();
  paintBuilding(ctx, zone);
  ctx.restore();
}
