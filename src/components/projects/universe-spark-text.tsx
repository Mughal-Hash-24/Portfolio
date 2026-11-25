"use client";

/* eslint-disable react-hooks/immutability -- three.js geometry and shader uniforms are mutated imperatively inside useFrame. */

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { sparkFragmentShader, sparkVertexShader } from "./universe-shaders";
import { createRandom, hashString } from "./universe-textures";

const SERIF_STACK = '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif';
const MAX_POINTS = 1500;

type SparkTextProps = {
  text: string;
  color: string;
  position?: [number, number, number];
  radius?: number;
  screenHeight?: number;
  active: boolean;
  reducedMotion?: boolean;
};

function buildGeometry(text: string): THREE.BufferGeometry | null {
  if (typeof document === "undefined") return null;

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) return null;

  const fontSize = 88;
  const font = `600 ${fontSize}px ${SERIF_STACK}`;
  context.font = font;
  const metrics = context.measureText(text);
  const width = Math.max(2, Math.ceil(metrics.width + fontSize * 0.6));
  const height = Math.max(2, Math.ceil(fontSize * 1.5));
  canvas.width = width;
  canvas.height = height;

  context.font = font;
  context.fillStyle = "#ffffff";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, width / 2, height / 2);

  const data = context.getImageData(0, 0, width, height).data;
  const random = createRandom(hashString(text) || 1);
  const collected: number[] = [];
  let step = 3;

  for (;;) {
    collected.length = 0;

    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        if (data[(y * width + x) * 4 + 3] > 150) collected.push(x, y);
      }
    }

    if (collected.length / 2 <= MAX_POINTS || step >= 6) break;
    step += 1;
  }

  const count = collected.length / 2;
  if (count === 0) return null;

  const positions = new Float32Array(count * 3);
  const scatter = new Float32Array(count * 3);
  const seeds = new Float32Array(count);

  for (let index = 0; index < count; index += 1) {
    const x = (collected[index * 2] - width / 2) / height;
    const y = (height / 2 - collected[index * 2 + 1]) / height;
    const angle = random() * Math.PI * 2;
    const spread = 0.35 + random() * 0.9;

    positions.set([x, y, 0], index * 3);
    scatter.set(
      [Math.cos(angle) * spread, Math.sin(angle) * spread * 0.45, (random() - 0.5) * 0.7],
      index * 3,
    );
    seeds[index] = random();
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aScatter", new THREE.BufferAttribute(scatter, 3));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
  return geometry;
}

export function SparkText({
  text,
  color,
  position = [0, 0, 0],
  radius = 0,
  screenHeight = 34,
  active,
  reducedMotion = false,
}: SparkTextProps) {
  const group = useRef<THREE.Group>(null);
  const points = useRef<THREE.Points>(null);
  const geometry = useRef<THREE.BufferGeometry | null>(null);
  const progress = useRef(0);
  const worldPosition = useRef(new THREE.Vector3());
  const base = useMemo(() => new THREE.Vector3(position[0], position[1], position[2]), [position]);
  const tint = useMemo(() => new THREE.Color(color), [color]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: sparkVertexShader,
        fragmentShader: sparkFragmentShader,
        uniforms: {
          uProgress: { value: 0 },
          uTime: { value: 0 },
          uPointSize: { value: 2.2 },
          uMotion: { value: reducedMotion ? 0 : 1 },
          uColor: { value: tint },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [tint, reducedMotion],
  );

  useFrame(({ clock, camera, size, gl }, delta) => {
    const node = group.current;
    if (!node) return;

    if (active && !geometry.current) {
      geometry.current = buildGeometry(text);
      if (points.current && geometry.current) points.current.geometry = geometry.current;
    }

    const goal = active ? 1 : 0;
    const speed = reducedMotion ? 24 : 3.4;
    progress.current += (goal - progress.current) * Math.min(1, delta * speed);

    if (Math.abs(goal - progress.current) < 0.004) progress.current = goal;

    material.uniforms.uProgress.value = progress.current;
    material.uniforms.uTime.value = clock.elapsedTime;
    material.uniforms.uMotion.value = reducedMotion ? 0 : 1;
    material.uniforms.uPointSize.value = 2.4 * gl.getPixelRatio();

    const visible = progress.current > 0.004 && geometry.current !== null;
    node.visible = visible;
    if (!visible) return;

    node.updateWorldMatrix(true, false);
    node.getWorldPosition(worldPosition.current);

    const fov = (camera as THREE.PerspectiveCamera).fov;
    const distance = camera.position.distanceTo(worldPosition.current);
    const height =
      (2 * Math.tan(THREE.MathUtils.degToRad(fov) / 2) * distance * screenHeight) /
      Math.max(size.height, 1);

    node.scale.setScalar(height);
    node.quaternion.copy(camera.quaternion);
    node.position.set(base.x, base.y + radius + height * 0.62, base.z);
  });

  return (
    <group ref={group} visible={false}>
      <points ref={points} frustumCulled={false}>
        <primitive object={material} attach="material" />
      </points>
    </group>
  );
}
