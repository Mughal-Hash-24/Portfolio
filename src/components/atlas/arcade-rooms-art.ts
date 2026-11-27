import { TILE, type ArcadeRoom } from "./atlas-world";
import { drawArcadeScene } from "./arcade-monuments";

type Ctx = CanvasRenderingContext2D;

const CREAM = "#efe6d2";
const GOLD = "#d9b06a";
const INK = "#15111b";

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

function glow(ctx: Ctx, x: number, y: number, radius: number, color: string, alpha = 0.2) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = gradient;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  ctx.restore();
}

function shadow(ctx: Ctx, x: number, y: number, w: number, h: number) {
  ellipse(ctx, x, y, w, h, "rgba(0,0,0,0.28)");
}

type Palette = {
  floor: string;
  floorAlt: string;
  wall: string;
  wallAlt: string;
  trim: string;
  rug: string;
  light: string;
};

function paletteFor(id: string): Palette {
  switch (id) {
    case "gta-san-andreas":
      return {
        floor: "#6c4c2f",
        floorAlt: "#755335",
        wall: "#44513a",
        wallAlt: "#36432f",
        trim: "#8b7a52",
        rug: "#5b3b2a",
        light: "#ffd9a0",
      };
    case "gta-iii":
      return {
        floor: "#3f2b2e",
        floorAlt: "#493134",
        wall: "#452333",
        wallAlt: "#371b28",
        trim: "#8d5b68",
        rug: "#682d41",
        light: "#ff8fae",
      };
    case "gta-vice-city":
      return {
        floor: "#5b3c4d",
        floorAlt: "#694657",
        wall: "#e0b6c6",
        wallAlt: "#c896ad",
        trim: "#ffe2ec",
        rug: "#7b3552",
        light: "#ff9ac7",
      };
    case "gta-iv":
      return {
        floor: "#5a4434",
        floorAlt: "#654b39",
        wall: "#6d5a45",
        wallAlt: "#5a4938",
        trim: "#a18b6d",
        rug: "#4b3e33",
        light: "#ffcf8a",
      };
    case "gta-v":
      return {
        floor: "#c5c0b3",
        floorAlt: "#d1cabb",
        wall: "#e8e2d5",
        wallAlt: "#d4cdc0",
        trim: "#a29a8b",
        rug: "#827a70",
        light: "#fff0c8",
      };
    case "assassins-creed":
      return {
        floor: "#756a58",
        floorAlt: "#7f7360",
        wall: "#5f5648",
        wallAlt: "#4f473c",
        trim: "#aaa08c",
        rug: "#7a302e",
        light: "#ffe0a6",
      };
    case "watch-dogs":
      return {
        floor: "#26353c",
        floorAlt: "#2b3c44",
        wall: "#1a272e",
        wallAlt: "#142026",
        trim: "#4f6b76",
        rug: "#1a3b45",
        light: "#8ff0ff",
      };
    case "minecraft":
      return {
        floor: "#6e4f2f",
        floorAlt: "#7a5937",
        wall: "#5b4930",
        wallAlt: "#4c3c27",
        trim: "#87704a",
        rug: "#50613c",
        light: "#ffe0a0",
      };
    case "among-us":
      return {
        floor: "#4a515d",
        floorAlt: "#535b68",
        wall: "#5f6a78",
        wallAlt: "#4f5965",
        trim: "#8c99a8",
        rug: "#7a2e3c",
        light: "#bcefff",
      };
    case "mortal-kombat":
      return {
        floor: "#45352c",
        floorAlt: "#4e3c32",
        wall: "#3b2926",
        wallAlt: "#2f201e",
        trim: "#9a6d45",
        rug: "#6f2228",
        light: "#ffcf7a",
      };
    case "call-of-duty":
      return {
        floor: "#4a4844",
        floorAlt: "#53504b",
        wall: "#41403c",
        wallAlt: "#34332f",
        trim: "#6f6b60",
        rug: "#3b3a34",
        light: "#d8e4b0",
      };
    case "igi":
      return {
        floor: "#3f4440",
        floorAlt: "#484d48",
        wall: "#3b403b",
        wallAlt: "#2e332e",
        trim: "#6f776d",
        rug: "#28362e",
        light: "#bde7ef",
      };
    case "tekken":
      return {
        floor: "#5a4530",
        floorAlt: "#644e38",
        wall: "#493c31",
        wallAlt: "#3a3028",
        trim: "#9c7a4f",
        rug: "#5b3f56",
        light: "#ffd9a0",
      };
    case "fifa":
      return {
        floor: "#596b5c",
        floorAlt: "#627568",
        wall: "#6e756b",
        wallAlt: "#5b625a",
        trim: "#d8ded2",
        rug: "#385c43",
        light: "#e8ffe8",
      };
    case "cricket-07":
      return {
        floor: "#756547",
        floorAlt: "#7f6f4f",
        wall: "#e0d6b9",
        wallAlt: "#cbc1a5",
        trim: "#8a7a57",
        rug: "#556e43",
        light: "#fff0c0",
      };
    case "wwe-2k15":
      return {
        floor: "#3c2d31",
        floorAlt: "#47353a",
        wall: "#2f252a",
        wallAlt: "#261d21",
        trim: "#8f5a4b",
        rug: "#7a2730",
        light: "#ffd9a0",
      };
    case "far-cry-3":
      return {
        floor: "#4e3f2b",
        floorAlt: "#5a4830",
        wall: "#3f4a30",
        wallAlt: "#34402a",
        trim: "#8b7445",
        rug: "#4f3826",
        light: "#ffd08a",
      };
    default:
      return {
        floor: "#55493b",
        floorAlt: "#5e5344",
        wall: "#47423d",
        wallAlt: "#393530",
        trim: "#8c8171",
        rug: "#573842",
        light: "#ffd9a0",
      };
  }
}

function paintFloor(ctx: Ctx, room: ArcadeRoom, palette: Palette, accent: string) {
  const width = room.w * TILE;
  const floorTop = 48;

  rect(ctx, 0, floorTop, width, room.h * TILE - floorTop, palette.floor);

  if (room.statue.id === "fifa" || room.statue.id === "cricket-07") {
    for (let x = 0; x < width; x += 28) {
      rect(ctx, x, floorTop, 14, room.h * TILE - floorTop, palette.floorAlt);
    }
  } else if (room.statue.id === "among-us" || room.statue.id === "watch-dogs") {
    for (let x = 0; x < width; x += TILE) {
      rect(ctx, x, floorTop, 1, room.h * TILE - floorTop, "rgba(255,255,255,0.035)");
    }
  } else if (room.statue.id === "minecraft") {
    for (let y = floorTop; y < room.h * TILE; y += TILE) {
      for (let x = 0; x < width; x += TILE) {
        const value = (Math.sin((x / TILE) * 12.9898 + (y / TILE) * 78.233) * 43758.5453) % 1;
        rect(ctx, x + 1, y + 1, TILE - 2, TILE - 2, value > 0.5 ? palette.floorAlt : palette.floor);
        rect(ctx, x + 1, y + 1, TILE - 2, 1, "rgba(255,255,255,0.05)");
      }
    }
  } else {
    for (let y = floorTop; y < room.h * TILE; y += 16) {
      rect(ctx, 0, y, width, 1, "rgba(255,255,255,0.045)");
      for (let x = (y / 16) % 2 === 0 ? 0 : 28; x < width; x += 56) {
        rect(ctx, x, y, 1, 16, "rgba(0,0,0,0.12)");
      }
    }
  }

  // Rug under the display.
  rect(ctx, 158, 182, 164, 76, palette.rug);
  rect(ctx, 164, 188, 152, 64, `${palette.rug}`);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 1;
  ctx.strokeRect(166, 190, 148, 60);
  for (let index = 0; index < 7; index += 1) {
    rect(ctx, 170 + index * 22, 194, 9, 1, `${accent}44`);
  }

  // Floor scuffs and dust.
  for (let index = 0; index < 26; index += 1) {
    const x = 34 + ((index * 73) % 412);
    const y = 64 + ((index * 47) % 206);
    rect(ctx, x, y, 1.6, 0.8, "rgba(255,255,255,0.04)");
  }
}

function paintWalls(ctx: Ctx, room: ArcadeRoom, palette: Palette, accent: string) {
  const width = room.w * TILE;
  const height = room.h * TILE;

  rect(ctx, 0, 0, width, 48, palette.wall);
  rect(ctx, 0, 0, width, 3, palette.wallAlt);
  rect(ctx, 0, 0, 28, height, palette.wallAlt);
  rect(ctx, width - 28, 0, 28, height, palette.wallAlt);
  rect(ctx, 0, 48, width, 4, palette.trim);
  rect(ctx, 0, 48, 28, 4, palette.wallAlt);
  rect(ctx, width - 28, 48, 28, 4, palette.wallAlt);

  // Wainscoting and vertical wall texture.
  rect(ctx, 29, 34, width - 58, 2, `${palette.trim}88`);
  for (let x = 30; x < width - 30; x += 42) {
    rect(ctx, x, 6, 1, 41, "rgba(255,255,255,0.035)");
  }
  for (let index = 0; index < 20; index += 1) {
    const x = 32 + ((index * 83) % (width - 64));
    const y = 8 + ((index * 29) % 32);
    rect(ctx, x, y, 2, 1, "rgba(0,0,0,0.08)");
  }

  // A mural wash in the game's accent.
  const wash = ctx.createRadialGradient(width / 2, 20, 0, width / 2, 20, 210);
  wash.addColorStop(0, `${accent}16`);
  wash.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = wash;
  ctx.fillRect(28, 0, width - 56, 48);

  // Wall base and side trims.
  rect(ctx, 28, 52, width - 56, 1, "rgba(255,255,255,0.05)");
  rect(ctx, 28, 4, 1, 44, "rgba(255,255,255,0.04)");
  rect(ctx, width - 29, 4, 1, 44, "rgba(255,255,255,0.04)");
}

function wrapQuote(ctx: Ctx, text: string, maxWidth: number, font: string): string[] {
  ctx.font = font;
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;

    if (ctx.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }

  if (line) lines.push(line);
  return lines.slice(0, 3);
}

function paintQuoteWall(ctx: Ctx, room: ArcadeRoom, accent: string, palette: Palette) {
  const width = room.w * TILE;
  const statue = room.statue;

  // Building name.
  const name = room.building.buildingName.toUpperCase();
  ctx.fillStyle = CREAM;
  ctx.font = '600 4.3px "Geist Mono", ui-monospace, monospace';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(name, width / 2, 8);
  ctx.fillStyle = accent;
  ctx.fillRect(width / 2 - name.length * 1.45, 13, name.length * 2.9, 1);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  // Inscription plaque.
  const plaqueW = 330;
  const plaqueH = 30;
  const plaqueX = width / 2 - plaqueW / 2;
  const plaqueY = 16;
  rect(ctx, plaqueX, plaqueY, plaqueW, plaqueH, "#100d16");
  rect(ctx, plaqueX, plaqueY, plaqueW, 1.4, accent);
  rect(ctx, plaqueX, plaqueY + plaqueH - 1.4, plaqueW, 1.4, "#51475d");
  rect(ctx, plaqueX + 2, plaqueY + 2, plaqueW - 4, 1, `${accent}44`);
  for (const [rx, ry] of [
    [plaqueX + 5, plaqueY + 5],
    [plaqueX + plaqueW - 5, plaqueY + 5],
    [plaqueX + 5, plaqueY + plaqueH - 5],
    [plaqueX + plaqueW - 5, plaqueY + plaqueH - 5],
  ] as Array<[number, number]>) {
    circle(ctx, rx, ry, 1, GOLD);
  }

  const quoteFont = '500 4px "Iowan Old Style", "Palatino Linotype", Georgia, serif';
  const lines = wrapQuote(ctx, statue.quote, plaqueW - 28, quoteFont);
  ctx.fillStyle = "#f5ead3";
  ctx.font = quoteFont;
  ctx.textAlign = "center";
  const lineHeight = 5.2;
  const startY = plaqueY + 8.5;

  for (let index = 0; index < lines.length; index += 1) {
    ctx.fillText(lines[index], width / 2, startY + index * lineHeight);
  }

  ctx.fillStyle = `${accent}cc`;
  ctx.font = '500 2.8px "Geist Mono", ui-monospace, monospace';
  ctx.fillText(
    `${statue.source} · ${statue.year} · ${room.building.setting}`,
    width / 2,
    plaqueY + plaqueH - 4,
  );
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  // Small wall lights around the plaque.
  for (const side of [-1, 1]) {
    const lx = width / 2 + side * 185;
    rect(ctx, lx - 1, 20, 2, 6, "#2c2533");
    rect(ctx, lx - 2.4, 17, 4.8, 4, palette.light);
    glow(ctx, lx, 18, 22, palette.light, 0.13);
  }
}

function paintDiorama(ctx: Ctx, room: ArcadeRoom, accent: string) {
  const display = room.display;

  shadow(ctx, display.x, display.y + 24, 57, 7);

  // Pedestal and stage.
  rect(ctx, display.x - 62, display.y + 8, 124, 20, "#25202d");
  rect(ctx, display.x - 62, display.y + 8, 124, 2, accent);
  rect(ctx, display.x - 56, display.y + 12, 112, 14, "#17131f");
  rect(ctx, display.x - 51, display.y + 15, 102, 8, "rgba(255, 255, 255, 0.035)");

  // Plinth plaque.
  rect(ctx, display.x - 31, display.y + 18, 62, 8, "#0e0c13");
  ctx.fillStyle = accent;
  ctx.font = '600 3px "Geist Mono", ui-monospace, monospace';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(
    `${room.statue.game.toUpperCase()} · ${room.statue.year}`,
    display.x,
    display.y + 22,
  );
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  // Spotlight cone.
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const light = ctx.createLinearGradient(display.x, 45, display.x, display.y + 10);
  light.addColorStop(0, `${accent}22`);
  light.addColorStop(0.65, `${accent}09`);
  light.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = light;
  ctx.beginPath();
  ctx.moveTo(display.x - 12, 44);
  ctx.lineTo(display.x + 12, 44);
  ctx.lineTo(display.x + 60, display.y + 6);
  ctx.lineTo(display.x - 60, display.y + 6);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // The game's sculptural scene, shown as a lit installation.
  drawArcadeScene(ctx, room.statue, display.x, display.y, 1.15);

  // Glass corners.
  for (const side of [-1, 1]) {
    rect(ctx, display.x + side * 58, display.y - 46, 1, 56, "rgba(255, 255, 255, 0.08)");
    rect(ctx, display.x + side * 56, display.y + 6, 1.4, 1.4, `${accent}77`);
  }
}

function paintDoor(ctx: Ctx, room: ArcadeRoom, accent: string) {
  const x = room.exit.x;
  const y = room.h * TILE - 1;

  shadow(ctx, x, y + 1, 35, 5);
  rect(ctx, x - 25, y - 31, 50, 31, "#15111b");
  rect(ctx, x - 21, y - 27, 42, 27, "#2b2230");
  rect(ctx, x - 16, y - 24, 32, 24, "#120f16");
  rect(ctx, x - 13, y - 21, 26, 21, "rgba(255, 207, 138, 0.12)");
  glow(ctx, x, y - 12, 26, accent, 0.12);
  rect(ctx, x - 24, y - 4, 48, 4, "#5f4b38");

  ctx.fillStyle = "#efe6d2";
  ctx.font = '600 3.2px "Geist Mono", ui-monospace, monospace';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("ARCADE", x, y - 30);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  // Side plants / bollards make the threshold feel grounded.
  for (const side of [-1, 1]) {
    rect(ctx, x + side * 34, y - 4, 2, 4, "#5a4630");
    circle(ctx, x + side * 34, y - 6, 3, "#6b8d5a");
    circle(ctx, x + side * 33, y - 7, 1.4, "#8fb47a");
  }
}

function paintBench(ctx: Ctx, x: number, y: number, accent: string) {
  shadow(ctx, x, y + 5, 25, 3);
  rect(ctx, x - 24, y - 3, 48, 5, "#60472f");
  rect(ctx, x - 24, y - 3, 48, 1, "#8b6845");
  rect(ctx, x - 20, y + 2, 3, 5, "#3b2c20");
  rect(ctx, x + 17, y + 2, 3, 5, "#3b2c20");
  rect(ctx, x - 10, y - 1, 20, 1, accent);
}

function paintShelf(ctx: Ctx, x: number, y: number, w: number, accent: string) {
  rect(ctx, x, y - 44, w, 48, "#3d2b1d");
  rect(ctx, x + 2, y - 42, w - 4, 2, "#63462c");
  for (let row = 0; row < 3; row += 1) {
    const yy = y - 36 + row * 13;
    rect(ctx, x + 1, yy + 8, w - 2, 2, "#5b3e25");

    for (let index = 0; index < Math.floor(w / 5); index += 1) {
      const colors = [accent, "#c85a45", "#d9b06a", "#7fa58a", "#b7a6d9"];
      rect(ctx, x + 3 + index * 5, yy, 3, 8, colors[(index + row) % colors.length]);
    }
  }
  rect(ctx, x, y - 44, 2, 48, "#251a12");
  rect(ctx, x + w - 2, y - 44, 2, 48, "#251a12");
}

function paintMonitor(ctx: Ctx, x: number, y: number, accent: string, scale = 1) {
  rect(ctx, x - 10 * scale, y - 14 * scale, 20 * scale, 13 * scale, "#17131f");
  rect(ctx, x - 8.5 * scale, y - 12.5 * scale, 17 * scale, 9.5 * scale, "#20313b");
  rect(ctx, x - 8 * scale, y - 12 * scale, 16 * scale, 1, `${accent}88`);

  for (let index = 0; index < 3; index += 1) {
    rect(ctx, x - 6 * scale, y - 10 * scale + index * 2 * scale, 10 * scale, 0.7, `${accent}77`);
  }
  rect(ctx, x - 1 * scale, y - 1 * scale, 2 * scale, 3 * scale, "#2b2533");
  rect(ctx, x - 5 * scale, y + 2 * scale, 10 * scale, 2 * scale, "#2b2533");
  glow(ctx, x, y - 8 * scale, 18 * scale, accent, 0.12);
}

function paintCouch(ctx: Ctx, x: number, y: number, accent: string, color = "#5a4f5d") {
  shadow(ctx, x, y + 7, 31, 4);
  rect(ctx, x - 30, y - 3, 60, 12, color);
  rect(ctx, x - 30, y - 10, 60, 8, color);
  rect(ctx, x - 30, y - 10, 60, 2, "rgba(255,255,255,0.09)");
  rect(ctx, x - 23, y - 8, 20, 5, `${accent}33`);
  rect(ctx, x + 3, y - 8, 20, 5, `${accent}22`);
  rect(ctx, x - 33, y - 8, 4, 14, color);
  rect(ctx, x + 29, y - 8, 4, 14, color);
}

function paintLocker(ctx: Ctx, x: number, y: number, w: number, h: number, accent: string) {
  rect(ctx, x, y - h, w, h, "#373d44");
  rect(ctx, x, y - h, w, 2, "#5e6871");
  const count = Math.max(1, Math.floor(w / 18));
  for (let index = 0; index < count; index += 1) {
    const lx = x + index * (w / count);
    rect(ctx, lx, y - h + 3, 1, h - 4, "#252b31");
    rect(ctx, lx + 4, y - h + 7, w / count - 8, 1, `${accent}55`);
    rect(ctx, lx + 4, y - h + 9, w / count - 8, 1, "#4a535b");
    circle(ctx, lx + w / count - 4, y - h / 2, 1, "#a9b2b8");
  }
}

function paintSportsLocker(ctx: Ctx, x: number, y: number, accent: string, number: string) {
  rect(ctx, x, y - 56, 52, 56, "#4a565a");
  rect(ctx, x, y - 56, 52, 2, "#738489");
  rect(ctx, x + 4, y - 52, 20, 36, "#2e3a3e");
  rect(ctx, x + 27, y - 40, 21, 2, "#8b999c");
  ctx.fillStyle = accent;
  ctx.font = '700 8px "Geist Mono", monospace';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(number, x + 14, y - 34);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
}

function paintCrates(ctx: Ctx, x: number, y: number, count: number, accent: string) {
  for (let index = 0; index < count; index += 1) {
    const cx = x + (index % 2) * 17;
    const cy = y - Math.floor(index / 2) * 15;
    rect(ctx, cx - 12, cy - 12, 22, 12, "#6b5437");
    rect(ctx, cx - 12, cy - 12, 22, 2, "#90744b");
    rect(ctx, cx - 9, cy - 9, 16, 1, `${accent}44`);
    line(ctx, cx - 12, cy - 12, cx + 10, cy, "#4f3e2a", 1);
  }
}

function paintServerRack(ctx: Ctx, x: number, y: number, accent: string, h = 62) {
  rect(ctx, x - 14, y - h, 28, h, "#1a2228");
  rect(ctx, x - 14, y - h, 28, 2, "#35454e");

  for (let row = 0; row < 7; row += 1) {
    rect(ctx, x - 11, y - h + 5 + row * 8, 22, 5, "#242f36");
    rect(ctx, x - 9, y - h + 6 + row * 8, 1.4, 1.4, `${accent}aa`);
    rect(ctx, x - 5, y - h + 6 + row * 8, 11, 1, "#3d4c54");
  }
  glow(ctx, x, y - h / 2, 22, accent, 0.1);
}

function paintPlant(ctx: Ctx, x: number, y: number, scale = 1) {
  rect(ctx, x - 7 * scale, y - 11 * scale, 14 * scale, 11 * scale, "#6b4b36");
  rect(ctx, x - 7 * scale, y - 11 * scale, 14 * scale, 2 * scale, "#8b6546");

  for (let index = 0; index < 5; index += 1) {
    const angle = -Math.PI / 2 + (index - 2) * 0.42;
    line(
      ctx,
      x,
      y - 11 * scale,
      x + Math.cos(angle) * 20 * scale,
      y - 11 * scale + Math.sin(angle) * 20 * scale,
      "#4f8452",
      1.6 * scale,
    );
    ellipse(
      ctx,
      x + Math.cos(angle) * 20 * scale,
      y - 11 * scale + Math.sin(angle) * 20 * scale,
      4 * scale,
      2 * scale,
      "#5f9b5a",
    );
  }
}

function paintRoomDecor(ctx: Ctx, room: ArcadeRoom, accent: string) {
  const id = room.statue.id;
  switch (id) {
    case "gta-san-andreas": {
      paintShelf(ctx, 38, 128, 62, accent);
      paintCouch(ctx, 86, 206, accent, "#5f5a42");
      paintMonitor(ctx, 392, 198, "#9fd8ff", 1.2);
      rect(ctx, 374, 204, 37, 14, "#4c3320");
      rect(ctx, 378, 207, 29, 7, "#7a5533");
      // Kitchen block.
      rect(ctx, 350, 88, 92, 28, "#5a4630");
      rect(ctx, 350, 88, 92, 3, "#8a6a48");
      rect(ctx, 356, 95, 18, 14, "#2b3038");
      rect(ctx, 380, 95, 18, 14, "#2b3038");
      rect(ctx, 356, 95, 18, 1, "#7c8790");
      paintPlant(ctx, 54, 246, 1.1);
      // Grove Street sign and green banner.
      rect(ctx, 48, 160, 46, 13, "#21351f");
      rect(ctx, 48, 160, 46, 1, accent);
      ctx.fillStyle = CREAM;
      ctx.font = '600 3.2px "Geist Mono", monospace';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("GROVE ST.", 71, 167);
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      break;
    }
    case "gta-iii": {
      // Bar.
      rect(ctx, 34, 166, 112, 16, "#40242d");
      rect(ctx, 34, 166, 112, 3, "#7d4a58");
      rect(ctx, 38, 172, 104, 8, "#221820");
      for (let index = 0; index < 6; index += 1) {
        circle(ctx, 47 + index * 17, 185, 4.6, "#5d3c34");
        rect(ctx, 45 + index * 17, 185, 4, 12, "#3c2d27");
      }
      for (let index = 0; index < 5; index += 1) {
        rect(ctx, 41 + index * 21, 154, 2, 12, index % 2 ? "#d9b06a" : "#b7a6d9");
        rect(ctx, 39 + index * 21, 152, 6, 3, "#e8d9a8");
      }
      paintShelf(ctx, 354, 148, 74, accent);
      // Neon.
      ctx.fillStyle = "#ff8fae";
      ctx.font = '700 6px "Geist Mono", monospace';
      ctx.textAlign = "center";
      ctx.fillText("LUIGI'S", 391, 128);
      ctx.textAlign = "left";
      glow(ctx, 391, 124, 38, "#ff8fae", 0.16);
      // Payphone and booth.
      rect(ctx, 326, 190, 24, 44, "#2b2330");
      rect(ctx, 330, 196, 16, 20, "#442e3c");
      rect(ctx, 332, 200, 12, 3, "#ffcf7a");
      break;
    }
    case "gta-vice-city": {
      // Dance floor strips.
      for (let index = 0; index < 8; index += 1) {
        rect(ctx, 40, 70 + index * 13, 90, 2, index % 2 ? "#ff7ab8" : "#5fb3a1");
      }
      // Bar.
      rect(ctx, 338, 154, 104, 17, "#4a2b40");
      rect(ctx, 338, 154, 104, 3, "#ffd9e4");
      for (let index = 0; index < 5; index += 1) {
        rect(ctx, 348 + index * 18, 145, 3, 9, "#e8d9a8");
        circle(ctx, 349.5 + index * 18, 143, 1.5, "#ff9ac7");
      }
      paintPlant(ctx, 63, 230, 1.3);
      paintPlant(ctx, 414, 228, 1.2);
      // Neon palm.
      ctx.strokeStyle = "#ff7ab8";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(84, 196);
      ctx.quadraticCurveTo(67, 166, 84, 136);
      ctx.quadraticCurveTo(104, 154, 112, 132);
      ctx.stroke();
      glow(ctx, 87, 160, 34, "#ff7ab8", 0.12);
      break;
    }
    case "gta-iv": {
      // Dispatch desk.
      rect(ctx, 38, 158, 110, 38, "#4f3828");
      rect(ctx, 38, 158, 110, 3, "#836344");
      paintMonitor(ctx, 68, 150, "#ffcf8a", 1.1);
      paintMonitor(ctx, 105, 150, "#ffcf8a", 0.9);
      for (let index = 0; index < 4; index += 1) {
        rect(ctx, 44 + index * 24, 168, 18, 2, "#8a6a48");
      }
      paintShelf(ctx, 340, 138, 98, accent);
      // Map board.
      rect(ctx, 352, 154, 74, 44, "#26372f");
      rect(ctx, 355, 157, 68, 38, "#3f5a4a");
      for (let index = 0; index < 5; index += 1) {
        line(ctx, 358 + index * 13, 160, 358 + index * 13, 192, "#729a7d", 0.8);
      }
      line(ctx, 358, 170, 420, 182, "#e8d9a8", 1);
      circle(ctx, 394, 174, 2, "#e85d5d");
      // Bowling pins.
      for (let index = 0; index < 3; index += 1) {
        const px = 380 + index * 8;
        rect(ctx, px - 2, 208, 4, 10, CREAM);
        circle(ctx, px, 206, 2.4, CREAM);
      }
      paintCouch(ctx, 86, 238, accent, "#4c3a34");
      break;
    }
    case "gta-v": {
      paintCouch(ctx, 86, 206, accent, "#b8b2a5");
      paintMonitor(ctx, 386, 192, "#9fd8ff", 1.35);
      rect(ctx, 366, 198, 40, 15, "#3b3731");
      // Glass table.
      ellipse(ctx, 240, 236, 35, 11, "#9bb6ba");
      ellipse(ctx, 240, 233, 31, 8, "#c8dcde");
      for (const side of [-1, 1]) {
        rect(ctx, 240 + side * 28, 234, 2, 10, "#6e7c7d");
      }
      paintPlant(ctx, 58, 236, 1.2);
      paintPlant(ctx, 420, 230, 1.1);
      // Trophy shelf.
      rect(ctx, 334, 104, 102, 12, "#c7c0b2");
      rect(ctx, 336, 107, 98, 2, "#a59c8c");
      for (let index = 0; index < 3; index += 1) {
        circle(ctx, 360 + index * 24, 100, 4, "#d9b06a");
        rect(ctx, 358 + index * 24, 100, 4, 3, "#a58a4b");
      }
      break;
    }
    case "assassins-creed": {
      paintShelf(ctx, 36, 152, 92, accent);
      // Banners.
      for (const x of [350, 414]) {
        rect(ctx, x, 76, 3, 84, "#3e2e24");
        poly(
          ctx,
          [
            [x + 3, 80],
            [x + 35, 84],
            [x + 30, 112],
            [x + 3, 108],
          ],
          "#e8e0cf",
        );
        poly(
          ctx,
          [
            [x + 12, 88],
            [x + 28, 90],
            [x + 24, 104],
            [x + 12, 102],
          ],
          "#8f2f2f",
        );
      }
      paintHay(ctx, 82, 242);
      paintChest(ctx, 385, 232, accent);
      // Hidden blade display.
      rect(ctx, 348, 170, 42, 8, "#2f2620");
      rect(ctx, 350, 172, 38, 4, "#7e7668");
      line(ctx, 354, 174, 384, 174, "#c8c3b8", 1);
      break;
    }
    case "watch-dogs": {
      paintServerRack(ctx, 48, 174, accent, 72);
      paintServerRack(ctx, 92, 174, accent, 58);
      paintServerRack(ctx, 394, 178, accent, 76);
      paintMonitor(ctx, 407, 106, accent, 1.2);
      paintMonitor(ctx, 352, 104, accent, 0.85);
      // Camera.
      line(ctx, 324, 236, 324, 188, "#566771", 1.6);
      rect(ctx, 318, 184, 14, 7, "#27343b");
      circle(ctx, 326, 188, 2, accent);
      glow(ctx, 326, 188, 18, accent, 0.14);
      // Cable runs.
      ctx.strokeStyle = `${accent}44`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(36, 190);
      ctx.bezierCurveTo(100, 160, 140, 240, 196, 196);
      ctx.stroke();
      break;
    }
    case "minecraft": {
      // Crafting table, furnace, chest.
      rect(ctx, 50, 196, 24, 22, "#7a5533");
      rect(ctx, 50, 196, 24, 3, "#a57945");
      rect(ctx, 53, 202, 18, 12, "#4b341f");
      rect(ctx, 53, 203, 6, 6, "#9a7550");
      rect(ctx, 61, 203, 6, 6, "#9a7550");
      rect(ctx, 53, 210, 6, 6, "#9a7550");
      rect(ctx, 61, 210, 6, 6, "#9a7550");
      rect(ctx, 92, 198, 22, 20, "#4c4a4a");
      rect(ctx, 92, 198, 22, 3, "#74716e");
      rect(ctx, 96, 202, 14, 7, "#252422");
      rect(ctx, 98, 204, 10, 3, "#ff9f43");
      rect(ctx, 88, 226, 22, 14, "#6b4a2b");
      rect(ctx, 88, 226, 22, 2, "#a5753f");
      rect(ctx, 391, 198, 44, 42, "#3b2b1d");
      rect(ctx, 394, 201, 38, 16, "#75502e");
      for (let index = 0; index < 3; index += 1) {
        rect(ctx, 397 + index * 12, 204, 8, 9, index % 2 ? "#4f7a3c" : "#b7a6d9");
      }
      paintCreeperRoom(ctx, 350, 246);
      paintBlockTree(ctx, 410, 238, 0.9);
      paintTorch(ctx, 62, 236);
      paintTorch(ctx, 416, 166);
      break;
    }
    case "among-us": {
      // Cafeteria table.
      rect(ctx, 44, 174, 88, 12, "#77838f");
      rect(ctx, 44, 174, 88, 2, "#a5b4bf");
      for (const side of [-1, 1]) {
        rect(ctx, 62, 186, 3, 16, "#5a6672");
        rect(ctx, 107, 186, 3, 16, "#5a6672");
        rect(ctx, 52, 186 + side * 5, 72, 3, "#5a6672");
      }
      // Vents and wires.
      for (const x of [344, 398]) {
        rect(ctx, x, 208, 28, 15, "#3d4650");
        for (let index = 0; index < 4; index += 1) {
          rect(ctx, x + 3, 211 + index * 3, 22, 1, "#65727e");
        }
        circle(ctx, x + 24, 214, 1, accent);
      }
      ctx.strokeStyle = "#b23c45";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(324, 92);
      ctx.lineTo(324, 160);
      ctx.lineTo(348, 176);
      ctx.lineTo(348, 220);
      ctx.stroke();
      // Star window.
      rect(ctx, 378, 82, 56, 28, "#111827");
      rect(ctx, 381, 85, 50, 22, "#1b2a44");
      for (let index = 0; index < 16; index += 1) {
        const sx = 383 + ((index * 37) % 46);
        const sy = 87 + ((index * 13) % 18);
        rect(ctx, sx, sy, 1, 1, "#dceaff");
      }
      paintCrewmate(ctx, 88, 246, 1);
      break;
    }
    case "mortal-kombat": {
      // Braziers.
      for (const x of [56, 424]) {
        rect(ctx, x - 3, 188, 6, 18, "#5a4a3b");
        rect(ctx, x - 8, 182, 16, 6, "#7a5c40");
        circle(ctx, x, 178, 4, "#ff9f43");
        circle(ctx, x, 176, 2, "#ffe6ac");
        glow(ctx, x, 176, 22, "#ff9f43", 0.17);
      }
      // Gong.
      circle(ctx, 388, 138, 19, "#5f4a2f");
      circle(ctx, 388, 138, 16, "#a37a3f");
      circle(ctx, 388, 138, 11, "#6f542e");
      line(ctx, 388, 156, 388, 224, "#3f3223", 2);
      rect(ctx, 384, 224, 8, 3, "#3f3223");
      // Throne.
      rect(ctx, 54, 112, 30, 54, "#3a211e");
      rect(ctx, 58, 118, 22, 44, "#6f2428");
      rect(ctx, 62, 124, 14, 10, "#d9b06a");
      paintDragonRoom(ctx, 360, 210, accent);
      break;
    }
    case "call-of-duty": {
      // Broken window.
      rect(ctx, 34, 78, 56, 40, "#1c1e20");
      rect(ctx, 37, 81, 50, 34, "#5f6c70");
      poly(
        ctx,
        [
          [37, 81],
          [57, 92],
          [52, 115],
          [37, 108],
        ],
        "#252627",
      );
      for (let index = 0; index < 4; index += 1) {
        line(ctx, 41 + index * 12, 81, 47 + index * 10, 115, "#7e8990", 0.7);
      }
      // Sandbags and crates.
      for (let index = 0; index < 4; index += 1) {
        rect(ctx, 40 + index * 13, 218, 22, 7, "#5e5a40");
        rect(ctx, 44 + index * 11, 211, 20, 6, "#6a6549");
      }
      paintCrates(ctx, 392, 238, 2, accent);
      // Radiation sign.
      circle(ctx, 409, 158, 10, "#b8a64b");
      circle(ctx, 409, 158, 3, "#26251e");
      for (let index = 0; index < 3; index += 1) {
        const angle = (index / 3) * Math.PI * 2;
        line(
          ctx,
          409 + Math.cos(angle) * 5,
          158 + Math.sin(angle) * 5,
          409 + Math.cos(angle) * 9,
          158 + Math.sin(angle) * 9,
          "#26251e",
          1.8,
        );
      }
      // Gas mask on the wall.
      ellipse(ctx, 340, 130, 9, 10, "#2b2b27");
      circle(ctx, 336, 128, 3, "#6b8d7a");
      circle(ctx, 344, 128, 3, "#6b8d7a");
      break;
    }
    case "igi": {
      // Map table.
      rect(ctx, 40, 166, 102, 32, "#4d4e45");
      rect(ctx, 40, 166, 102, 2, "#74766b");
      rect(ctx, 46, 172, 90, 18, "#3c5146");
      for (let index = 0; index < 6; index += 1) {
        line(ctx, 50 + index * 15, 174, 54 + index * 12, 188, "#7a9d7f", 0.7);
      }
      circle(ctx, 100, 180, 2, "#e85d5d");
      // Screens.
      paintMonitor(ctx, 374, 138, accent, 1.1);
      paintMonitor(ctx, 414, 136, accent, 0.9);
      rect(ctx, 342, 146, 96, 27, "#3b403b");
      rect(ctx, 346, 149, 88, 20, "#262e2a");
      for (let index = 0; index < 7; index += 1) {
        rect(ctx, 350 + index * 12, 152, 7, 1, "rgba(189, 231, 239, 0.3)");
      }
      paintCrates(ctx, 72, 238, 3, accent);
      // Radio.
      rect(ctx, 386, 206, 28, 18, "#3b403a");
      rect(ctx, 390, 210, 20, 8, "#1d241f");
      rect(ctx, 392, 212, 16, 1, accent);
      line(ctx, 414, 207, 414, 224, "#5a6158", 1.2);
      break;
    }
    case "tekken": {
      // Dojo mats.
      for (let index = 0; index < 5; index += 1) {
        rect(ctx, 36, 68 + index * 15, 74, 1, "#8a6f4c");
        rect(ctx, 370, 68 + index * 15, 74, 1, "#8a6f4c");
      }
      // Lanterns.
      for (const x of [60, 420]) {
        line(ctx, x, 48, x, 100, "#3c2d20", 1);
        ellipse(ctx, x, 108, 8, 12, "#e8d9a8");
        ellipse(ctx, x, 108, 5, 9, "#ffcf7a");
        glow(ctx, x, 108, 24, "#ffcf9a", 0.15);
      }
      // Training dummy.
      line(ctx, 84, 224, 84, 158, "#5a4630", 2);
      line(ctx, 66, 188, 102, 188, "#5a4630", 2);
      circle(ctx, 84, 154, 7, "#7a5533");
      rect(ctx, 76, 178, 16, 24, "#7a5533");
      // Gong.
      circle(ctx, 402, 174, 17, "#6f4d31");
      circle(ctx, 402, 174, 13, "#b68a4d");
      line(ctx, 402, 190, 402, 240, "#3f2d20", 2);
      break;
    }
    case "fifa": {
      paintSportsLocker(ctx, 36, 196, accent, "9");
      paintSportsLocker(ctx, 402, 196, accent, "10");
      // Bench.
      paintBench(ctx, 240, 224, accent);
      // Tactics board.
      rect(ctx, 334, 72, 72, 43, "#2b3a2d");
      rect(ctx, 337, 75, 66, 37, "#497a4f");
      line(ctx, 370, 75, 370, 112, "#dfe8df", 1);
      circle(ctx, 370, 94, 9, "#dfe8df");
      for (const [dx, dy] of [
        [-18, -8],
        [18, -8],
        [-10, 9],
        [12, 9],
      ] as Array<[number, number]>) {
        circle(ctx, 370 + dx, 94 + dy, 2, "#e8d9a8");
      }
      // Ball.
      circle(ctx, 322, 238, 8, CREAM);
      circle(ctx, 322, 238, 3, "#2b2533");
      for (let index = 0; index < 5; index += 1) {
        const angle = (index / 5) * Math.PI * 2;
        circle(ctx, 322 + Math.cos(angle) * 5, 238 + Math.sin(angle) * 5, 1.4, "#2b2533");
      }
      // Jerseys hanging.
      for (let index = 0; index < 3; index += 1) {
        rect(ctx, 138 + index * 16, 76, 12, 15, index % 2 ? "#d9d4c5" : accent);
        rect(ctx, 136 + index * 16, 76, 16, 3, "#2b353a");
        rect(ctx, 141 + index * 16, 78, 6, 2, "#2b2533");
      }
      break;
    }
    case "cricket-07": {
      // Scoreboard.
      rect(ctx, 34, 78, 88, 48, "#2c2b23");
      rect(ctx, 37, 81, 82, 38, "#33382b");
      ctx.fillStyle = "#dfe8cf";
      ctx.font = '700 8px "Geist Mono", monospace';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("07", 80, 94);
      ctx.fillStyle = "#d9a066";
      ctx.font = '500 3px "Geist Mono", monospace';
      ctx.fillText("CRICKET 2007", 80, 108);
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      // Bats and stumps.
      for (let index = 0; index < 3; index += 1) {
        line(ctx, 354 + index * 11, 224, 362 + index * 11, 172, "#c8a66a", 2.2);
        rect(ctx, 360 + index * 11, 220, 5, 8, "#6b4b2f");
      }
      for (let index = 0; index < 3; index += 1) {
        rect(ctx, 406 + index * 6, 190, 2, 24, "#e8e1cc");
        circle(ctx, 407 + index * 6, 188, 1.5, "#d9a066");
      }
      // Commentary mic.
      rect(ctx, 74, 164, 2, 18, "#3b3327");
      rect(ctx, 67, 156, 16, 9, "#31323a");
      rect(ctx, 69, 158, 12, 5, "#60646e");
      // Boundary rope.
      ctx.strokeStyle = "#e8e1cc";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(40, 252);
      ctx.quadraticCurveTo(240, 232, 440, 252);
      ctx.stroke();
      break;
    }
    case "wwe-2k15": {
      paintLocker(ctx, 34, 220, 94, 112, accent);
      paintLocker(ctx, 352, 220, 94, 112, accent);
      paintBench(ctx, 240, 222, accent);
      // Title belt in a case.
      rect(ctx, 142, 80, 58, 38, "#241d27");
      rect(ctx, 145, 83, 52, 32, "#3a2732");
      rect(ctx, 154, 94, 34, 12, "#d9b06a");
      rect(ctx, 160, 97, 22, 6, "#3a2b1f");
      circle(ctx, 171, 100, 3, "#ffd166");
      rect(ctx, 154, 90, 8, 5, "#8a2f3a");
      rect(ctx, 180, 90, 8, 5, "#8a2f3a");
      rect(ctx, 168, 88, 8, 2, "#8a2f3a");
      glow(ctx, 171, 100, 22, accent, 0.14);
      // Steel chair.
      poly(
        ctx,
        [
          [304, 246],
          [324, 246],
          [324, 214],
          [320, 210],
          [320, 238],
          [304, 238],
        ],
        "#8f8d82",
      );
      rect(ctx, 304, 236, 20, 2, "#b8b5a8");
      break;
    }
    case "far-cry-3": {
      // Tiki bar.
      rect(ctx, 36, 166, 92, 16, "#5a4028");
      rect(ctx, 36, 166, 92, 3, "#8b633a");
      for (let index = 0; index < 5; index += 1) {
        rect(ctx, 44 + index * 17, 156, 3, 10, "#d9b06a");
        circle(ctx, 45.5 + index * 17, 154, 2, "#ff6b3d");
      }
      // Skulls.
      for (const [x, y] of [
        [360, 132],
        [390, 146],
        [408, 120],
      ] as Array<[number, number]>) {
        circle(ctx, x, y, 6, "#d8d2bd");
        circle(ctx, x - 2.2, y - 1, 1.4, "#2b241d");
        circle(ctx, x + 2.2, y - 1, 1.4, "#2b241d");
        rect(ctx, x - 2, y + 3, 4, 1, "#2b241d");
      }
      // Radio and chair.
      rect(ctx, 330, 206, 26, 16, "#3b3a2f");
      rect(ctx, 333, 209, 20, 7, "#1f211b");
      rect(ctx, 336, 211, 14, 1, accent);
      line(ctx, 356, 206, 366, 194, "#5a5a4a", 1);
      rect(ctx, 72, 222, 34, 5, "#5a4028");
      rect(ctx, 78, 227, 4, 16, "#3b2c1d");
      rect(ctx, 96, 227, 4, 16, "#3b2c1d");
      paintPlant(ctx, 414, 244, 1.3);
      paintTorch(ctx, 54, 244);
      paintTorch(ctx, 424, 176);
      break;
    }
  }
}

function paintCreeperRoom(ctx: Ctx, x: number, y: number) {
  rect(ctx, x - 9, y - 19, 18, 16, "#79b65f");
  rect(ctx, x - 9, y - 19, 18, 3, "#8bca6c");
  rect(ctx, x - 5, y - 12, 3, 3, "#1d2b24");
  rect(ctx, x + 2, y - 12, 3, 3, "#1d2b24");
  rect(ctx, x - 3, y - 8, 6, 3, "#1d2b24");
  rect(ctx, x - 5, y - 3, 3, 3, "#5b8b47");
  rect(ctx, x + 2, y - 3, 3, 3, "#5b8b47");
}

function paintBlockTree(ctx: Ctx, x: number, y: number, scale: number) {
  rect(ctx, x - 1.5 * scale, y - 16 * scale, 3 * scale, 16 * scale, "#5a4630");
  for (let level = 0; level < 3; level += 1) {
    const w = (15 - level * 3) * scale;
    rect(
      ctx,
      x - w / 2,
      y - 16 * scale - level * 5 * scale,
      w,
      5 * scale,
      level % 2 ? "#3e7a62" : "#356b4c",
    );
    rect(ctx, x - w / 2, y - 16 * scale - level * 5 * scale, w, 1, "rgba(170, 230, 190, 0.2)");
  }
}

function paintTorch(ctx: Ctx, x: number, y: number) {
  rect(ctx, x - 0.8, y - 15, 1.6, 15, "#5a4630");
  circle(ctx, x, y - 17, 2.6, "#ffcf33");
  circle(ctx, x, y - 18, 1.2, "#fff1c9");
  glow(ctx, x, y - 17, 15, "#ffcf33", 0.18);
}

function paintCrewmate(ctx: Ctx, x: number, y: number, scale: number) {
  ellipse(ctx, x, y + 2, 9 * scale, 3 * scale, "rgba(0,0,0,0.25)");
  rect(ctx, x - 5 * scale, y - 14 * scale, 10 * scale, 14 * scale, "#e84a5f");
  rect(ctx, x - 3 * scale, y - 16 * scale, 7 * scale, 4 * scale, "#e84a5f");
  rect(ctx, x - 2 * scale, y - 12 * scale, 6 * scale, 4 * scale, "#bfe9f5");
  rect(ctx, x + 1 * scale, y - 11 * scale, 2 * scale, 3 * scale, "#1a2230");
  rect(ctx, x - 5 * scale, y - 2 * scale, 3 * scale, 4 * scale, "#9b2f40");
  rect(ctx, x + 2 * scale, y - 2 * scale, 3 * scale, 4 * scale, "#9b2f40");
}

function paintHay(ctx: Ctx, x: number, y: number) {
  ellipse(ctx, x, y + 2, 11, 3.4, "rgba(0,0,0,0.22)");
  rect(ctx, x - 10, y - 10, 20, 12, "#b3924f");
  rect(ctx, x - 10, y - 10, 20, 2, "#d8b66b");
  for (let index = 0; index < 3; index += 1) {
    line(ctx, x - 8, y - 8 + index * 3, x + 8, y - 8 + index * 3, "#8a6d36", 0.9);
  }
}

function paintChest(ctx: Ctx, x: number, y: number, accent: string) {
  rect(ctx, x - 12, y - 10, 24, 10, "#6b4a2b");
  rect(ctx, x - 12, y - 16, 24, 7, "#7c5732");
  rect(ctx, x - 12, y - 10, 24, 2, "#3d2a18");
  rect(ctx, x - 2, y - 12, 4, 5, accent);
  circle(ctx, x, y - 9, 1.2, "#2b2119");
}

function paintDragonRoom(ctx: Ctx, x: number, y: number, accent: string) {
  ctx.save();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(x - 25, y + 9);
  ctx.bezierCurveTo(x - 5, y + 28, x + 24, y + 12, x + 14, y - 10);
  ctx.bezierCurveTo(x + 5, y - 27, x - 17, y - 20, x - 12, y - 2);
  ctx.stroke();
  circle(ctx, x + 14, y - 10, 3, accent);
  for (let index = 0; index < 4; index += 1) {
    line(
      ctx,
      x - 16 + index * 9,
      y - 2 + index * 4,
      x - 8 + index * 9,
      y - 6 + index * 4,
      accent,
      1,
    );
  }
  ctx.restore();
}

export function paintArcadeRoom(room: ArcadeRoom): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const width = room.w * TILE;
  const height = room.h * TILE;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) return canvas;

  const accent = room.statue.paint;
  const palette = paletteFor(room.statue.id);

  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, width, height);

  paintFloor(ctx, room, palette, accent);
  paintWalls(ctx, room, palette, accent);
  paintRoomDecor(ctx, room, accent);
  paintQuoteWall(ctx, room, accent, palette);
  paintDiorama(ctx, room, accent);
  paintDoor(ctx, room, accent);

  // Ceiling lights.
  for (const x of [110, 240, 370]) {
    rect(ctx, x - 18, 0, 36, 2, "#24202e");
    rect(ctx, x - 15, 2, 30, 3, palette.light);
    glow(ctx, x, 4, 45, palette.light, 0.1);
  }

  // Side shadows and vignette.
  const side = ctx.createLinearGradient(0, 0, 60, 0);
  side.addColorStop(0, "rgba(3, 3, 6, 0.5)");
  side.addColorStop(1, "rgba(3, 3, 6, 0)");
  ctx.fillStyle = side;
  ctx.fillRect(0, 48, 60, height - 48);
  ctx.save();
  ctx.translate(width, 0);
  ctx.scale(-1, 1);
  ctx.fillStyle = side;
  ctx.fillRect(0, 48, 60, height - 48);
  ctx.restore();

  const bottom = ctx.createLinearGradient(0, height - 40, 0, height);
  bottom.addColorStop(0, "rgba(3, 3, 6, 0)");
  bottom.addColorStop(1, "rgba(3, 3, 6, 0.32)");
  ctx.fillStyle = bottom;
  ctx.fillRect(0, height - 40, width, 40);

  return canvas;
}
