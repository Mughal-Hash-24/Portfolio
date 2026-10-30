import * as THREE from "three";
import {
  expansionAtPresent,
  projectDomains,
  type GalaxyTemplate,
  type UniverseDomain,
} from "@/content/projects-universe";
import { createGaussian, createRandom, hashString } from "./universe-textures";

const SPIN = 0.45;
const UP = new THREE.Vector3(0, 1, 0);

export type GalaxyRuntime = {
  id: number;
  domain: UniverseDomain;
  center: THREE.Vector3;
  axis: THREE.Vector3;
  radius: number;
  spin: number;
  perGalaxy: number;
};

export type UniverseData = {
  galaxies: GalaxyRuntime[];
  perGalaxy: number;
  count: number;
  cloud: Float32Array;
  local: Float32Array;
  axis: Float32Array;
  center: Float32Array;
  color: Float32Array;
  attr: Float32Array;
  filamentPositions: Float32Array;
};

type TemplateConfig = {
  radius: number;
  spin: number;
};

const templateConfig: Record<GalaxyTemplate, TemplateConfig> = {
  "grand-design": { radius: 2.4, spin: 1 },
  flocculent: { radius: 2.15, spin: 0.86 },
  interacting: { radius: 2.3, spin: 1.14 },
  ring: { radius: 2.1, spin: 0.92 },
  elliptical: { radius: 2, spin: 0.54 },
  "edge-on": { radius: 2.45, spin: 1.32 },
  barred: { radius: 2.25, spin: 1.06 },
  irregular: { radius: 2, spin: 0.7 },
};

type StarSample = {
  x: number;
  y: number;
  z: number;
  radius: number;
  color: THREE.Color;
  size: number;
};

type DomainPalette = {
  core: THREE.Color;
  mid: THREE.Color;
  rim: THREE.Color;
};

function sampleStar(
  domain: UniverseDomain,
  palette: DomainPalette,
  random: () => number,
  gaussian: () => number,
  galaxyRadius: number,
  out: THREE.Color,
): StarSample {
  const R = galaxyRadius;
  const { core, mid, rim } = palette;
  let x = 0;
  let y = 0;
  let z = 0;
  let radius = 0;

  switch (domain.template) {
    case "grand-design": {
      if (random() < 0.22) {
        x = gaussian() * 0.18 * R;
        y = gaussian() * 0.12 * R;
        z = gaussian() * 0.18 * R;
        out.copy(core).lerp(mid, random() * 0.25);
      } else {
        const t = Math.pow(random(), 0.68);
        const rr = t * R;
        const arm = Math.floor(random() * 2);
        const angle = arm * Math.PI + t * 4.6 + gaussian() * 0.24 * (1.12 - 0.55 * t);
        x = Math.cos(angle) * rr;
        z = Math.sin(angle) * rr;
        y = gaussian() * 0.035 * R * (1.15 - t);
        out.copy(t < 0.45 ? core : mid).lerp(rim, Math.max(0, (t - 0.35) / 0.65));
      }
      radius = Math.hypot(x, z);
      break;
    }
    case "flocculent": {
      if (random() < 0.18) {
        x = gaussian() * 0.16 * R;
        y = gaussian() * 0.11 * R;
        z = gaussian() * 0.16 * R;
        out.copy(core).lerp(mid, random() * 0.3);
      } else {
        const t = Math.pow(random(), 0.6);
        const rr = t * R;
        const arm = Math.floor(random() * 4);
        const angle = (arm * Math.PI) / 2 + t * 2.7 + gaussian() * 0.42 * (1.1 - 0.4 * t);
        x = Math.cos(angle) * rr;
        z = Math.sin(angle) * rr;
        y = gaussian() * 0.05 * R * (1.1 - t);
        out
          .copy(mid)
          .lerp(rim, t)
          .lerp(core, random() * 0.25 * (1 - t));
      }
      radius = Math.hypot(x, z);
      break;
    }
    case "interacting": {
      const roll = random();
      if (roll < 0.56) {
        const t = Math.pow(random(), 0.65);
        const rr = t * R;
        const arm = Math.floor(random() * 2);
        const angle = arm * Math.PI + t * 4.1 + gaussian() * 0.28 * (1.1 - 0.5 * t);
        x = Math.cos(angle) * rr;
        z = Math.sin(angle) * rr;
        y = gaussian() * 0.04 * R;
        out
          .copy(core)
          .lerp(mid, t)
          .lerp(rim, Math.max(0, (t - 0.5) * 2));
      } else if (roll < 0.76) {
        x = R * 0.95 + gaussian() * 0.18 * R;
        y = R * 0.2 + gaussian() * 0.1 * R;
        z = R * 0.35 + gaussian() * 0.17 * R;
        out.copy(rim).lerp(core, random() * 0.5);
      } else if (roll < 0.88) {
        const t = random();
        x = t * R * 0.95 + gaussian() * 0.07 * R;
        y = t * R * 0.2 + gaussian() * 0.05 * R;
        z = t * R * 0.35 + gaussian() * 0.07 * R;
        out.copy(mid).lerp(rim, t);
      } else {
        const direction = new THREE.Vector3(gaussian(), gaussian(), gaussian()).normalize();
        const rr = Math.sqrt(random()) * R * 1.35;
        x = direction.x * rr;
        y = direction.y * rr * 0.55;
        z = direction.z * rr;
        out.copy(rim).multiplyScalar(0.8 + random() * 0.4);
      }
      radius = Math.hypot(x, z);
      break;
    }
    case "ring": {
      if (random() < 0.18) {
        x = gaussian() * 0.14 * R;
        y = gaussian() * 0.1 * R;
        z = gaussian() * 0.14 * R;
        out.copy(core).lerp(mid, random() * 0.4);
      } else if (random() < 0.88) {
        const angle = random() * Math.PI * 2;
        const rr = R * 0.76 + gaussian() * 0.055 * R;
        x = Math.cos(angle) * rr;
        z = Math.sin(angle) * rr;
        y = gaussian() * 0.025 * R;
        out
          .copy(mid)
          .lerp(rim, random() * 0.7)
          .lerp(core, 0.15);
      } else {
        const direction = new THREE.Vector3(gaussian(), gaussian() * 0.4, gaussian()).normalize();
        const rr = R * (0.4 + random() * 0.7);
        x = direction.x * rr;
        y = direction.y * rr;
        z = direction.z * rr;
        out.copy(rim).multiplyScalar(0.75 + random() * 0.5);
      }
      radius = Math.hypot(x, z);
      break;
    }
    case "elliptical": {
      const scale = Math.pow(random(), 0.55);
      x = gaussian() * 0.6 * R * (0.35 + scale * 0.65);
      y = gaussian() * 0.36 * R * (0.35 + scale * 0.65);
      z = gaussian() * 0.48 * R * (0.35 + scale * 0.65);
      const warmth = Math.min(1, Math.hypot(x, y, z) / R);
      out
        .copy(core)
        .lerp(mid, warmth * 0.7)
        .lerp(rim, warmth * 0.35);
      radius = Math.hypot(x, z);
      break;
    }
    case "edge-on": {
      if (random() < 0.17) {
        x = gaussian() * 0.17 * R;
        y = gaussian() * 0.09 * R;
        z = gaussian() * 0.17 * R;
        out.copy(core).lerp(mid, random() * 0.35);
      } else {
        const angle = random() * Math.PI * 2;
        const rr = Math.sqrt(random()) * R;
        x = Math.cos(angle) * rr;
        z = Math.sin(angle) * rr;
        y = gaussian() * 0.014 * R + Math.sin(angle * 2) * 0.018 * R;
        const lane = 1 - Math.min(1, Math.abs(y) / (0.05 * R));
        out
          .copy(mid)
          .lerp(rim, Math.pow(rr / R, 1.4))
          .lerp(core, lane * 0.4);
      }
      radius = Math.hypot(x, z);
      break;
    }
    case "barred": {
      if (random() < 0.22) {
        x = gaussian() * 0.15 * R;
        y = gaussian() * 0.1 * R;
        z = gaussian() * 0.15 * R;
        out.copy(core).lerp(mid, random() * 0.3);
      } else if (random() < 0.5) {
        x = (random() * 2 - 1) * R * 0.62;
        y = gaussian() * 0.03 * R;
        z = gaussian() * 0.07 * R;
        out.copy(core).lerp(mid, Math.abs(x) / (R * 0.62));
      } else {
        const t = Math.pow(random(), 0.62);
        const rr = t * R;
        const arm = Math.floor(random() * 2);
        const angle = arm * Math.PI + t * 3.8 + gaussian() * 0.26 * (1.1 - 0.5 * t);
        x = Math.cos(angle) * rr;
        z = Math.sin(angle) * rr;
        y = gaussian() * 0.045 * R * (1.1 - t);
        out
          .copy(mid)
          .lerp(rim, t)
          .lerp(core, random() * 0.2 * (1 - t));
      }
      radius = Math.hypot(x, z);
      break;
    }
    case "irregular": {
      const clumps = [
        [0.3, 0.1, 0.2],
        [-0.35, -0.15, 0.3],
        [0.1, 0.25, -0.42],
        [-0.2, -0.3, -0.25],
      ];
      const clump = clumps[Math.floor(random() * clumps.length)];
      const spread = random() < 0.18 ? R * 0.9 : R * 0.24;
      x =
        clump[0] * R + gaussian() * spread * 0.55 + (random() < 0.08 ? (random() * 2 - 1) * R : 0);
      y = clump[1] * R + gaussian() * spread * 0.35;
      z = clump[2] * R + gaussian() * spread * 0.55;
      out
        .copy(mid)
        .lerp(rim, random())
        .lerp(core, random() * 0.35);
      radius = Math.hypot(x, z);
      break;
    }
  }

  return {
    x,
    y,
    z,
    radius,
    color: out,
    size: 0.04 + 0.1 * Math.pow(random(), 4),
  };
}

function galaxyAxis(domain: UniverseDomain, random: () => number) {
  if (domain.template === "edge-on") {
    return new THREE.Vector3(0.98, 0.08, 0.18).normalize();
  }

  const y = 0.15 + random() * 0.45;
  return new THREE.Vector3(random() * 2 - 1, y, random() * 2 - 1).normalize();
}

export function buildUniverse(options: { perGalaxy: number; dust: number }): UniverseData {
  const galaxies: GalaxyRuntime[] = projectDomains.map((domain, index) => {
    const random = createRandom(hashString(domain.id));
    const angle = (index / projectDomains.length) * Math.PI * 2 + 0.32;
    const ring = 15 + (index % 2 === 0 ? 0.9 : -0.5);
    const center = new THREE.Vector3(
      Math.cos(angle) * ring,
      ((index % 4) - 1.5) * 2.7 + (random() - 0.5) * 0.8,
      Math.sin(angle) * ring,
    );
    const config = templateConfig[domain.template];

    return {
      id: index,
      domain,
      center,
      axis: galaxyAxis(domain, random),
      radius: config.radius * (0.94 + random() * 0.14),
      spin: config.spin * (0.93 + random() * 0.14),
      perGalaxy: options.perGalaxy,
    };
  });

  const galaxyCount = galaxies.length;
  const particleCount = galaxyCount * options.perGalaxy + options.dust;
  const cloud = new Float32Array(particleCount * 3);
  const local = new Float32Array(particleCount * 3);
  const axis = new Float32Array(particleCount * 3);
  const center = new Float32Array(particleCount * 3);
  const color = new Float32Array(particleCount * 3);
  const attr = new Float32Array(particleCount * 4);
  const colorScratch = new THREE.Color();
  const direction = new THREE.Vector3();
  const quaternion = new THREE.Quaternion();
  const rotated = new THREE.Vector3();
  const localVector = new THREE.Vector3();
  const palettes = new Map(
    projectDomains.map((domain) => [
      domain.id,
      {
        core: new THREE.Color(domain.palette.core),
        mid: new THREE.Color(domain.palette.mid),
        rim: new THREE.Color(domain.palette.rim),
      },
    ]),
  );

  for (let index = 0; index < galaxyCount * options.perGalaxy; index += 1) {
    const galaxyIndex = Math.floor(index / options.perGalaxy);
    const galaxy = galaxies[galaxyIndex];
    const random = createRandom(hashString(galaxy.domain.id) + (index % options.perGalaxy) * 7919);
    const gaussian = createGaussian(random);
    const palette = palettes.get(galaxy.domain.id) as DomainPalette;
    const sample = sampleStar(
      galaxy.domain,
      palette,
      random,
      gaussian,
      galaxy.radius,
      colorScratch,
    );
    localVector.set(sample.x, sample.y, sample.z);
    quaternion.setFromUnitVectors(UP, galaxy.axis);
    rotated.copy(localVector).applyQuaternion(quaternion);

    const offset = index * 3;
    local[offset] = rotated.x;
    local[offset + 1] = rotated.y;
    local[offset + 2] = rotated.z;
    axis[offset] = galaxy.axis.x;
    axis[offset + 1] = galaxy.axis.y;
    axis[offset + 2] = galaxy.axis.z;
    center[offset] = galaxy.center.x;
    center[offset + 1] = galaxy.center.y;
    center[offset + 2] = galaxy.center.z;

    direction
      .set(gaussian(), gaussian(), gaussian())
      .normalize()
      .multiplyScalar(Math.sqrt(random()) * 4.4);
    cloud[offset] = galaxy.center.x + direction.x;
    cloud[offset + 1] = galaxy.center.y + direction.y;
    cloud[offset + 2] = galaxy.center.z + direction.z;

    const brightness = 0.62 + random() * 0.72;
    color[offset] = sample.color.r * brightness;
    color[offset + 1] = sample.color.g * brightness;
    color[offset + 2] = sample.color.b * brightness;

    const isBright = random() < 0.07;
    attr[index * 4] = random();
    attr[index * 4 + 1] = sample.radius;
    attr[index * 4 + 2] = galaxyIndex;
    attr[index * 4 + 3] = isBright ? 0.13 + random() * 0.14 : sample.size;
  }

  const segments: Array<[number, number]> = [];
  const seen = new Set<string>();

  for (const galaxy of galaxies) {
    const nearest = galaxies
      .filter((candidate) => candidate.id !== galaxy.id)
      .sort((a, b) => a.center.distanceTo(galaxy.center) - b.center.distanceTo(galaxy.center))
      .slice(0, 2);

    for (const neighbor of nearest) {
      const key = [galaxy.id, neighbor.id].sort((a, b) => a - b).join(":");
      if (seen.has(key)) continue;
      seen.add(key);
      segments.push([galaxy.id, neighbor.id]);
    }
  }

  const filamentPositions = new Float32Array(segments.length * 6);
  segments.forEach(([a, b], index) => {
    const from = galaxies[a].center;
    const to = galaxies[b].center;
    filamentPositions.set([from.x, from.y, from.z, to.x, to.y, to.z], index * 6);
  });

  for (let dustIndex = 0; dustIndex < options.dust; dustIndex += 1) {
    const index = galaxyCount * options.perGalaxy + dustIndex;
    const offset = index * 3;
    const random = createRandom(0x51f15e + dustIndex * 2654435761);
    direction.set(random() * 2 - 1, random() * 2 - 1, random() * 2 - 1);

    if (direction.lengthSq() < 0.0001) direction.set(0, 1, 0);
    direction.normalize();

    if (segments.length > 0 && random() < 0.34) {
      const [a, b] = segments[Math.floor(random() * segments.length)];
      const t = random();
      const from = galaxies[a].center;
      const to = galaxies[b].center;
      const scatter = 0.35 + random() * 0.8;
      local[offset] = from.x + (to.x - from.x) * t + (random() * 2 - 1) * scatter;
      local[offset + 1] = from.y + (to.y - from.y) * t + (random() * 2 - 1) * scatter;
      local[offset + 2] = from.z + (to.z - from.z) * t + (random() * 2 - 1) * scatter;
      color[offset] = 0.11 + random() * 0.06;
      color[offset + 1] = 0.15 + random() * 0.07;
      color[offset + 2] = 0.3 + random() * 0.12;
    } else {
      const distance = 17 * Math.cbrt(random());
      local[offset] = direction.x * distance;
      local[offset + 1] = direction.y * distance * 0.7;
      local[offset + 2] = direction.z * distance;
      color[offset] = 0.08 + random() * 0.05;
      color[offset + 1] = 0.11 + random() * 0.06;
      color[offset + 2] = 0.24 + random() * 0.12;
    }

    cloud[offset] = local[offset];
    cloud[offset + 1] = local[offset + 1];
    cloud[offset + 2] = local[offset + 2];
    axis[offset] = 0;
    axis[offset + 1] = 1;
    axis[offset + 2] = 0;
    center[offset] = 0;
    center[offset + 1] = 0;
    center[offset + 2] = 0;
    attr[index * 4] = random();
    attr[index * 4 + 1] = 0;
    attr[index * 4 + 2] = -1;
    attr[index * 4 + 3] = 0.02 + 0.035 * random();
  }

  return {
    galaxies,
    perGalaxy: options.perGalaxy,
    count: particleCount,
    cloud,
    local,
    axis,
    center,
    color,
    attr,
    filamentPositions,
  };
}

export function spinRate(radius: number, galaxyId: number) {
  const variation = 0.82 + 0.12 * (galaxyId % 3);
  return (SPIN / (0.4 + radius)) * variation;
}

const starAxis = new THREE.Vector3();

export function starWorld(data: UniverseData, index: number, time: number, out: THREE.Vector3) {
  const offset = index * 3;
  const galaxyId = data.attr[index * 4 + 2];
  const radius = data.attr[index * 4 + 1];
  out.set(data.local[offset], data.local[offset + 1], data.local[offset + 2]);
  starAxis.set(data.axis[offset], data.axis[offset + 1], data.axis[offset + 2]);
  out.applyAxisAngle(starAxis, time * spinRate(radius, galaxyId));
  out.x += data.center[offset] * expansionAtPresent;
  out.y += data.center[offset + 1] * expansionAtPresent;
  out.z += data.center[offset + 2] * expansionAtPresent;
  return out;
}
