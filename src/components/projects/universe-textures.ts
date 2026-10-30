import * as THREE from "three";

export function smoothstep(a: number, b: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

export function mix(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function createRandom(seed: number) {
  let state = seed;

  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createGaussian(random: () => number) {
  return () => Math.sqrt(-2 * Math.log(random() + 1e-9)) * Math.cos(6.2831853 * random());
}

export function hashString(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

let glowCache: THREE.CanvasTexture | null = null;
export function glowTexture() {
  if (glowCache) return glowCache;

  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const context = canvas.getContext("2d");

  if (context) {
    const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.18, "rgba(255,255,255,.6)");
    gradient.addColorStop(0.48, "rgba(255,255,255,.14)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);
  }

  glowCache = new THREE.CanvasTexture(canvas);
  return glowCache;
}

let ringCache: THREE.CanvasTexture | null = null;
export function ringTexture() {
  if (ringCache) return ringCache;

  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const context = canvas.getContext("2d");

  if (context) {
    const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, "rgba(255,255,255,0)");
    gradient.addColorStop(0.72, "rgba(255,255,255,0)");
    gradient.addColorStop(0.88, "rgba(255,255,255,.92)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);
  }

  ringCache = new THREE.CanvasTexture(canvas);
  return ringCache;
}

let backgroundGalaxyCache: THREE.CanvasTexture | null = null;

export function backgroundGalaxyTexture() {
  if (backgroundGalaxyCache) return backgroundGalaxyCache;

  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const context = canvas.getContext("2d");

  if (context) {
    const random = createRandom(0x9a1a);
    context.translate(size / 2, size / 2);

    const core = context.createRadialGradient(0, 0, 0, 0, 0, 22);
    core.addColorStop(0, "rgba(255,255,255,0.95)");
    core.addColorStop(0.35, "rgba(255,255,255,0.45)");
    core.addColorStop(1, "rgba(255,255,255,0)");
    context.fillStyle = core;
    context.beginPath();
    context.arc(0, 0, 22, 0, Math.PI * 2);
    context.fill();

    for (let arm = 0; arm < 3; arm += 1) {
      for (let step = 0; step < 54; step += 1) {
        const t = step / 54;
        const angle = (arm * Math.PI * 2) / 3 + t * 4.6;
        const radius = 4 + t * 48;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius * 0.46;
        const alpha = 0.28 * (1 - t * 0.65);
        context.fillStyle = `rgba(255,255,255,${alpha})`;
        context.beginPath();
        context.arc(x, y, 0.9 + (1 - t) * 1.2, 0, Math.PI * 2);
        context.fill();
      }
    }

    for (let index = 0; index < 80; index += 1) {
      const angle = random() * Math.PI * 2;
      const radius = Math.sqrt(random()) * 54;
      context.fillStyle = `rgba(255,255,255,${0.08 + random() * 0.14})`;
      context.fillRect(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.55, 1, 1);
    }

    context.translate(-size / 2, -size / 2);
  }

  backgroundGalaxyCache = new THREE.CanvasTexture(canvas);
  backgroundGalaxyCache.colorSpace = THREE.SRGBColorSpace;
  return backgroundGalaxyCache;
}

let cmbCache: THREE.CanvasTexture | null = null;

export function cmbTexture() {
  if (cmbCache) return cmbCache;

  const width = 1024;
  const height = 512;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (context) {
    const random = createRandom(1989);
    context.fillStyle = "#090d1a";
    context.fillRect(0, 0, width, height);

    const warm = ["#ff6b2a", "#ff9f43", "#ffd166", "#e8451f"];
    const cool = ["#2b4dff", "#3f8cff", "#79d8ff", "#1a2a86"];

    for (let index = 0; index < 2400; index += 1) {
      const x = random() * width;
      const y = random() * height;
      const radius = 3 + random() * 26;
      const palette = random() < 0.58 ? warm : cool;
      const color = palette[Math.floor(random() * palette.length)];
      const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `${color}${random() < 0.5 ? "cc" : "88"}`);
      gradient.addColorStop(1, `${color}00`);
      context.fillStyle = gradient;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    }

    context.globalAlpha = 0.35;
    for (let index = 0; index < 6000; index += 1) {
      const x = random() * width;
      const y = random() * height;
      context.fillStyle = random() < 0.5 ? "#ffd9a0" : "#9fd8ff";
      context.fillRect(x, y, 1.5, 1.5);
    }
    context.globalAlpha = 1;

    const blurred = document.createElement("canvas");
    blurred.width = width;
    blurred.height = height;
    const blurContext = blurred.getContext("2d");

    if (blurContext) {
      blurContext.filter = "blur(3px)";
      blurContext.drawImage(canvas, 0, 0);
      context.clearRect(0, 0, width, height);
      context.drawImage(blurred, 0, 0);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  cmbCache = texture;
  return texture;
}
