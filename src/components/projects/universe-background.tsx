"use client";

/* eslint-disable react-hooks/immutability -- three.js objects and shader uniforms are mutated imperatively inside useFrame. */

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import {
  meteorFragmentShader,
  meteorVertexShader,
  starfieldFragmentShader,
  starfieldVertexShader,
} from "./universe-shaders";
import {
  backgroundGalaxyTexture,
  createRandom,
  glowTexture,
  ringTexture,
  smoothstep,
} from "./universe-textures";
import type { Quality } from "./universe-types";

export function NebulaBackdrop() {
  const group = useRef<THREE.Group>(null);

  const clouds = [
    {
      position: [-32, 8, -24] as const,
      scale: 62,
      color: "#4a3cff",
      opacity: 0.06,
    },
    {
      position: [33, -7, -20] as const,
      scale: 52,
      color: "#2ec7c0",
      opacity: 0.055,
    },
    {
      position: [4, 16, -44] as const,
      scale: 72,
      color: "#ffb36b",
      opacity: 0.05,
    },
    {
      position: [0, 0, 0] as const,
      scale: 36,
      color: "#3550b8",
      opacity: 0.03,
    },
    {
      position: [-48, -12, 12] as const,
      scale: 70,
      color: "#7a4bff",
      opacity: 0.03,
    },
    {
      position: [48, 18, 8] as const,
      scale: 60,
      color: "#2ec7c0",
      opacity: 0.028,
    },
    {
      position: [-10, -22, -52] as const,
      scale: 82,
      color: "#ff6b8a",
      opacity: 0.035,
    },
    {
      position: [8, -26, -18] as const,
      scale: 56,
      color: "#4a3cff",
      opacity: 0.04,
    },
    {
      position: [-34, 6, -34] as const,
      scale: 48,
      color: "#ff6b8a",
      opacity: 0.03,
    },
    {
      position: [22, 24, 30] as const,
      scale: 66,
      color: "#b44dff",
      opacity: 0.032,
    },
    {
      position: [-18, -18, 34] as const,
      scale: 58,
      color: "#ff4d9e",
      opacity: 0.03,
    },
    {
      position: [40, 4, 26] as const,
      scale: 54,
      color: "#3550b8",
      opacity: 0.03,
    },
    {
      position: [-6, 26, 10] as const,
      scale: 64,
      color: "#2ec7c0",
      opacity: 0.026,
    },
    {
      position: [14, -8, 42] as const,
      scale: 70,
      color: "#ffb36b",
      opacity: 0.024,
    },
  ];

  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.rotation.y = clock.elapsedTime * 0.004;
    group.current.rotation.x = Math.sin(clock.elapsedTime * 0.003) * 0.015;
  });

  return (
    <group ref={group}>
      {clouds.map((cloud, index) => (
        <sprite
          key={`${cloud.color}-${index}`}
          position={cloud.position}
          scale={[cloud.scale, cloud.scale, 1]}
          frustumCulled={false}
          renderOrder={-2}
        >
          <spriteMaterial
            map={glowTexture()}
            color={cloud.color}
            opacity={cloud.opacity}
            blending={THREE.AdditiveBlending}
            transparent
            depthWrite={false}
            toneMapped={false}
          />
        </sprite>
      ))}
    </group>
  );
}

const STARFIELD_COLORS: Array<[string, number]> = [
  ["#a8c1ff", 0.3],
  ["#f6f4ff", 0.26],
  ["#fff3e0", 0.18],
  ["#ffd9a0", 0.12],
  ["#ffb36b", 0.08],
  ["#ff8a70", 0.06],
];

export function Starfield({ quality }: { quality: Quality }) {
  const points = useRef<THREE.Points>(null);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: starfieldVertexShader,
        fragmentShader: starfieldFragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uScale: { value: 800 },
        },
      }),
    [],
  );

  const field = useMemo(() => {
    const count = quality === "mobile" ? 2600 : 5200;
    const random = createRandom(0x57a1);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const twinkle = new Float32Array(count * 2);
    const tint = new THREE.Color();

    for (let index = 0; index < count; index += 1) {
      const direction = new THREE.Vector3(random() * 2 - 1, random() * 2 - 1, random() * 2 - 1);

      if (direction.lengthSq() < 0.0001) direction.set(0, 1, 0);
      direction.normalize();
      const radius = 105 + random() * 60;

      positions.set([direction.x * radius, direction.y * radius, direction.z * radius], index * 3);

      const roll = random();
      let cursor = 0;
      let hex = STARFIELD_COLORS[0][0];

      for (const candidate of STARFIELD_COLORS) {
        cursor += candidate[1];
        if (roll <= cursor) {
          hex = candidate[0];
          break;
        }
      }
      tint.set(hex);
      colors.set([tint.r, tint.g, tint.b], index * 3);

      sizes[index] = 0.3 + Math.pow(random(), 3) * 0.9;
      twinkle[index * 2] = random() * Math.PI * 2;
      twinkle[index * 2 + 1] = 0.4 + random() * 2.2;
    }

    return { positions, colors, sizes, twinkle };
  }, [quality]);

  useFrame(({ clock, size, camera, gl }) => {
    if (points.current) points.current.rotation.y = clock.elapsedTime * 0.0016;

    const fov = (camera as THREE.PerspectiveCamera).fov;
    material.uniforms.uTime.value = clock.elapsedTime;
    material.uniforms.uScale.value =
      (size.height * gl.getPixelRatio()) / (2 * Math.tan(THREE.MathUtils.degToRad(fov) / 2));
  });

  return (
    <points ref={points} frustumCulled={false} renderOrder={-6}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[field.positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[field.colors, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[field.sizes, 1]} />
        <bufferAttribute attach="attributes-aTwinkle" args={[field.twinkle, 2]} />
      </bufferGeometry>
      <primitive object={material} attach="material" />
    </points>
  );
}

const METEOR_COUNT = 3;
const METEOR_TRAIL = 16;
const METEOR_COLORS = ["#cfe4ff", "#ffe9c9", "#bff2ff"];

type Meteor = {
  on: boolean;
  age: number;
  life: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  history: THREE.Vector3[];
};

export function ShootingStars({ active }: { active: boolean }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: meteorVertexShader,
        fragmentShader: meteorFragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uScale: { value: 800 },
        },
      }),
    [],
  );

  const field = useMemo(() => {
    const count = METEOR_COUNT * METEOR_TRAIL;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const fades = new Float32Array(count);
    const tint = new THREE.Color();

    for (let meteor = 0; meteor < METEOR_COUNT; meteor += 1) {
      tint.set(METEOR_COLORS[meteor % METEOR_COLORS.length]);

      for (let step = 0; step < METEOR_TRAIL; step += 1) {
        const index = meteor * METEOR_TRAIL + step;
        colors.set([tint.r, tint.g, tint.b], index * 3);
        sizes[index] = step === 0 ? 1.5 : 1 - (step / METEOR_TRAIL) * 0.55;
      }
    }

    return { positions, colors, sizes, fades };
  }, []);

  const positionAttribute = useRef<THREE.BufferAttribute>(null);
  const sizeAttribute = useRef<THREE.BufferAttribute>(null);
  const fadeAttribute = useRef<THREE.BufferAttribute>(null);
  const meteors = useRef<Meteor[]>(
    Array.from({ length: METEOR_COUNT }, () => ({
      on: false,
      age: 0,
      life: 1.2,
      position: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
      history: Array.from({ length: METEOR_TRAIL }, () => new THREE.Vector3()),
    })),
  );
  const next = useRef(2);

  useFrame(({ size, camera, gl }, delta) => {
    const dt = Math.min(delta, 0.1);
    const fov = (camera as THREE.PerspectiveCamera).fov;
    material.uniforms.uScale.value =
      (size.height * gl.getPixelRatio()) / (2 * Math.tan(THREE.MathUtils.degToRad(fov) / 2));

    next.current -= dt;

    if (active && next.current <= 0) {
      const slot = meteors.current.find((candidate) => !candidate.on);

      if (slot) {
        const direction = new THREE.Vector3(
          Math.random() * 2 - 1,
          Math.random() * 2 - 1,
          Math.random() * 2 - 1,
        );

        if (direction.lengthSq() < 0.0001) direction.set(0, 1, 0);
        direction.normalize();
        slot.position.copy(direction).multiplyScalar(70 + Math.random() * 40);

        const tangent = new THREE.Vector3(
          Math.random() - 0.5,
          Math.random() - 0.5,
          Math.random() - 0.5,
        ).cross(slot.position);

        if (tangent.lengthSq() < 0.001) tangent.set(1, 0, 0);
        tangent.normalize();
        slot.velocity.copy(tangent).multiplyScalar(38 + Math.random() * 22);
        slot.on = true;
        slot.age = 0;
        slot.life = 1 + Math.random() * 0.7;
        slot.history.forEach((point) => point.copy(slot.position));
      }

      next.current = 2.8 + Math.random() * 3.4;
    }

    meteors.current.forEach((meteor, meteorIndex) => {
      if (meteor.on) {
        meteor.age += dt;
        meteor.position.addScaledVector(meteor.velocity, dt);

        for (let step = METEOR_TRAIL - 1; step > 0; step -= 1) {
          meteor.history[step].copy(meteor.history[step - 1]);
        }
        meteor.history[0].copy(meteor.position);

        if (meteor.age >= meteor.life) meteor.on = false;
      }

      const life = Math.min(meteor.age / meteor.life, 1);
      const envelope =
        meteor.on && active ? smoothstep(0, 0.12, life) * (1 - smoothstep(0.55, 1, life)) : 0;

      for (let step = 0; step < METEOR_TRAIL; step += 1) {
        const index = meteorIndex * METEOR_TRAIL + step;
        const point = meteor.history[step];

        field.positions[index * 3] = point.x;
        field.positions[index * 3 + 1] = point.y;
        field.positions[index * 3 + 2] = point.z;
        field.fades[index] = envelope * Math.pow(1 - step / METEOR_TRAIL, 1.5);
        field.sizes[index] = step === 0 ? 1.5 : 1 - (step / METEOR_TRAIL) * 0.55;
      }
    });

    if (positionAttribute.current) positionAttribute.current.needsUpdate = true;
    if (sizeAttribute.current) sizeAttribute.current.needsUpdate = true;
    if (fadeAttribute.current) fadeAttribute.current.needsUpdate = true;
  });

  return (
    <points frustumCulled={false} renderOrder={-3}>
      <bufferGeometry>
        <bufferAttribute
          ref={positionAttribute}
          attach="attributes-position"
          args={[field.positions, 3]}
        />
        <bufferAttribute attach="attributes-color" args={[field.colors, 3]} />
        <bufferAttribute ref={sizeAttribute} attach="attributes-aSize" args={[field.sizes, 1]} />
        <bufferAttribute ref={fadeAttribute} attach="attributes-aFade" args={[field.fades, 1]} />
      </bufferGeometry>
      <primitive object={material} attach="material" />
    </points>
  );
}

type DistantGalaxyGroup = {
  count: number;
  inner: number;
  outer: number;
  size: number;
  color: string;
  opacity: number;
};

const distantGalaxyGroups: DistantGalaxyGroup[] = [
  {
    count: 60,
    inner: 42,
    outer: 72,
    size: 1.9,
    color: "#8fb4ff",
    opacity: 0.34,
  },
  {
    count: 84,
    inner: 58,
    outer: 105,
    size: 2.2,
    color: "#7d94ff",
    opacity: 0.34,
  },
  {
    count: 66,
    inner: 78,
    outer: 132,
    size: 2.7,
    color: "#ffb36b",
    opacity: 0.27,
  },
  {
    count: 54,
    inner: 100,
    outer: 165,
    size: 3.2,
    color: "#a97bff",
    opacity: 0.22,
  },
  {
    count: 96,
    inner: 130,
    outer: 195,
    size: 1.35,
    color: "#b8d4ff",
    opacity: 0.15,
  },
];

export function DistantGalaxies({ quality }: { quality: Quality }) {
  const group = useRef<THREE.Group>(null);
  const galaxies = useMemo(
    () =>
      distantGalaxyGroups.map((definition, groupIndex) => {
        const count = quality === "mobile" ? Math.floor(definition.count * 0.55) : definition.count;
        const random = createRandom(0x1000 + groupIndex * 977);
        const positions = new Float32Array(count * 3);

        for (let index = 0; index < count; index += 1) {
          const direction = new THREE.Vector3(random() * 2 - 1, random() * 2 - 1, random() * 2 - 1);

          if (direction.lengthSq() < 0.0001) direction.set(0, 1, 0);
          direction.normalize();
          const radius = definition.inner + random() * (definition.outer - definition.inner);

          positions.set(
            [direction.x * radius, direction.y * radius * 0.62, direction.z * radius],
            index * 3,
          );
        }

        return { ...definition, count, positions };
      }),
    [quality],
  );

  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.rotation.y = clock.elapsedTime * 0.0035;
    group.current.rotation.x = Math.sin(clock.elapsedTime * 0.0025) * 0.02;
  });

  return (
    <group ref={group}>
      {galaxies.map((galaxy, index) => (
        <points key={index} frustumCulled={false} renderOrder={-5}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[galaxy.positions, 3]} />
          </bufferGeometry>
          <pointsMaterial
            map={backgroundGalaxyTexture()}
            size={galaxy.size}
            color={galaxy.color}
            transparent
            opacity={galaxy.opacity}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            sizeAttenuation
            toneMapped={false}
          />
        </points>
      ))}
    </group>
  );
}

export function BackgroundDust({ quality }: { quality: Quality }) {
  const dust = useRef<THREE.Points>(null);
  const field = useMemo(() => {
    const count = quality === "mobile" ? 2500 : 6000;
    const random = createRandom(0xd057);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let index = 0; index < count; index += 1) {
      const direction = new THREE.Vector3(random() * 2 - 1, random() * 2 - 1, random() * 2 - 1);

      if (direction.lengthSq() < 0.0001) direction.set(0, 1, 0);
      direction.normalize();
      const radius = 20 + random() * 45;
      const warm = random() < 0.3;

      positions.set(
        [direction.x * radius, direction.y * radius * 0.7, direction.z * radius],
        index * 3,
      );
      colors.set(
        warm
          ? [0.28 + random() * 0.12, 0.2 + random() * 0.08, 0.14]
          : [0.12 + random() * 0.08, 0.16 + random() * 0.08, 0.3 + random() * 0.1],
        index * 3,
      );
    }

    return { positions, colors };
  }, [quality]);

  useFrame(({ clock }) => {
    if (dust.current) dust.current.rotation.y = clock.elapsedTime * 0.004;
  });

  return (
    <points ref={dust} frustumCulled={false} renderOrder={-4}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[field.positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[field.colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={glowTexture()}
        size={quality === "mobile" ? 0.18 : 0.14}
        vertexColors
        transparent
        opacity={0.42}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
        toneMapped={false}
      />
    </points>
  );
}

export function DistantSupernovae({ active }: { active: boolean }) {
  const SLOTS = 4;
  const slots = useRef(
    Array.from({ length: SLOTS }, () => ({
      on: false,
      age: 0,
      life: 3,
      position: new THREE.Vector3(),
    })),
  );
  const flashes = useRef<Array<THREE.Sprite | null>>([]);
  const rings = useRef<Array<THREE.Sprite | null>>([]);
  const next = useRef(4);

  useFrame((_, delta) => {
    if (!active) {
      for (let index = 0; index < SLOTS; index += 1) {
        const flash = flashes.current[index];
        const ring = rings.current[index];
        if (flash) flash.visible = false;
        if (ring) ring.visible = false;
      }
      return;
    }

    next.current -= delta;

    if (next.current <= 0) {
      const slot = slots.current.find((candidate) => !candidate.on);

      if (slot) {
        const direction = new THREE.Vector3(
          Math.random() * 2 - 1,
          Math.random() * 2 - 1,
          Math.random() * 2 - 1,
        )
          .normalize()
          .multiplyScalar(22 + Math.random() * 22);
        slot.on = true;
        slot.age = 0;
        slot.life = 2.4 + Math.random() * 2.2;
        slot.position.set(direction.x, direction.y * 0.7, direction.z);
      }

      next.current = 6 + Math.random() * 8;
    }

    slots.current.forEach((slot, index) => {
      const flash = flashes.current[index];
      const ring = rings.current[index];
      if (!flash || !ring) return;

      if (!slot.on) {
        flash.visible = false;
        ring.visible = false;
        return;
      }

      slot.age += delta;
      const life = slot.age / slot.life;

      if (life >= 1) {
        slot.on = false;
        flash.visible = false;
        ring.visible = false;
        return;
      }

      flash.visible = true;
      ring.visible = true;
      flash.position.copy(slot.position);
      ring.position.copy(slot.position);
      flash.scale.setScalar(0.5 + 1.1 * Math.min(life * 3, 1));
      flash.material.opacity = 0.32 * Math.min(life / 0.08, 1) * Math.pow(1 - life, 2.2);
      ring.scale.setScalar(0.8 + 2.4 * Math.min(life * 1.5, 1));
      ring.material.opacity = 0.28 * Math.pow(1 - life, 1.6);
    });
  });

  return (
    <>
      {Array.from({ length: SLOTS }, (_, index) => (
        <group key={index}>
          <sprite
            ref={(element) => {
              flashes.current[index] = element;
            }}
            visible={false}
            frustumCulled={false}
          >
            <spriteMaterial
              map={glowTexture()}
              color={new THREE.Color(1.4, 1.6, 2)}
              blending={THREE.AdditiveBlending}
              transparent
              depthWrite={false}
              toneMapped={false}
            />
          </sprite>
          <sprite
            ref={(element) => {
              rings.current[index] = element;
            }}
            visible={false}
            frustumCulled={false}
          >
            <spriteMaterial
              map={ringTexture()}
              color={new THREE.Color(0.8, 1.1, 1.6)}
              blending={THREE.AdditiveBlending}
              transparent
              depthWrite={false}
              toneMapped={false}
            />
          </sprite>
        </group>
      ))}
    </>
  );
}
