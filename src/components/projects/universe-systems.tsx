"use client";

/* eslint-disable react-hooks/immutability -- three.js objects, camera, and shader uniforms are mutated imperatively inside useFrame. */

import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { useMemo, useRef, type CSSProperties } from "react";
import * as THREE from "three";
import type { ResolvedSystem } from "@/content/project-systems";
import {
  BackgroundDust,
  DistantGalaxies,
  DistantSupernovae,
  NebulaBackdrop,
  ShootingStars,
  Starfield,
} from "./universe-background";
import { createRandom, glowTexture, planetTexture } from "./universe-textures";
import styles from "./universe.module.css";
import type { Quality } from "./universe-types";

type PlanetPositions = Map<string, THREE.Vector3>;

const COLUMN_SPACING = 8.4;
const ROW_SPACING = 7;
const STAR_MARKER_RADIUS = 1.05;
const FOCUS_DISTANCE = 6.8;
const PLANET_FOCUS_DISTANCE = 1.5;
const FOCUS_DIRECTION = new THREE.Vector3(0.16, 0.3, 1).normalize();
const PLANET_FOCUS_DIRECTION = new THREE.Vector3(0.05, 0.9, 0.45).normalize();

function layoutSystems(count: number) {
  const columns = Math.max(1, Math.ceil(Math.sqrt(count)));
  const rows = Math.ceil(count / columns);
  const random = createRandom(0x5eed);

  return Array.from({ length: count }, (_, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);

    return new THREE.Vector3(
      (column - (columns - 1) / 2) * COLUMN_SPACING + (random() - 0.5) * 1.4,
      ((rows - 1) / 2 - row) * ROW_SPACING + (random() - 0.5) * 1.2,
      (random() - 0.5) * 3.2,
    );
  });
}

function fitDistance(width: number, height: number, fov: number, aspect: number) {
  const tangent = Math.tan(THREE.MathUtils.degToRad(fov) / 2);
  const vertical = height / 2 / tangent;
  const horizontal = width / 2 / (tangent * Math.max(aspect, 0.35));

  return Math.max(vertical, horizontal) * 1.08 + 6;
}

function orbitRing(radius: number) {
  const segments = 72;
  const positions = new Float32Array(segments * 3);

  for (let index = 0; index < segments; index += 1) {
    const angle = (index / segments) * Math.PI * 2;
    positions[index * 3] = Math.cos(angle) * radius;
    positions[index * 3 + 1] = 0;
    positions[index * 3 + 2] = Math.sin(angle) * radius;
  }

  return positions;
}

function SystemCameraRig({
  systems,
  positions,
  focusedProject,
  focusedPlanet,
  planetPositions,
  extent,
  reducedMotion,
}: {
  systems: ResolvedSystem[];
  positions: THREE.Vector3[];
  focusedProject: string | null;
  focusedPlanet: number | null;
  planetPositions: React.RefObject<PlanetPositions>;
  extent: { width: number; height: number };
  reducedMotion: boolean;
}) {
  const camera = useThree((state) => state.camera) as THREE.PerspectiveCamera;
  const desiredPosition = useRef(new THREE.Vector3());
  const desiredTarget = useRef(new THREE.Vector3());
  const look = useRef(new THREE.Vector3());
  const initialized = useRef(false);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    const overview = fitDistance(extent.width, extent.height, camera.fov, camera.aspect);
    let focusPosition: THREE.Vector3 | null = null;
    let distance = overview;

    if (focusedProject) {
      const index = systems.findIndex((system) => system.projectId === focusedProject);

      if (index >= 0) {
        focusPosition = positions[index];
        distance = FOCUS_DISTANCE;

        if (focusedPlanet !== null) {
          const live = planetPositions.current?.get(`${focusedProject}:${focusedPlanet}`);

          if (live) {
            focusPosition = live;
            distance = PLANET_FOCUS_DISTANCE;
          }
        }
      }
    }

    if (focusPosition) {
      const direction = focusedPlanet !== null ? PLANET_FOCUS_DIRECTION : FOCUS_DIRECTION;
      desiredTarget.current.copy(focusPosition);
      desiredPosition.current.copy(focusPosition).addScaledVector(direction, distance);
    } else {
      desiredTarget.current.set(0, 0, 0);
      desiredPosition.current.set(0, overview * 0.24, overview * 0.97);
    }

    if (!initialized.current) {
      initialized.current = true;
      camera.position.copy(desiredPosition.current).multiplyScalar(2.1);
      camera.position.y += 4;
      look.current.set(0, 0, 0);
      camera.lookAt(look.current);
      return;
    }

    const follow = focusedPlanet !== null ? 10 : 2.5;
    const positionK = reducedMotion ? 1 : 1 - Math.exp(-follow * dt);
    const lookK = reducedMotion ? 1 : 1 - Math.exp(-(follow + 0.9) * dt);
    camera.position.lerp(desiredPosition.current, positionK);
    look.current.lerp(desiredTarget.current, lookK);
    camera.lookAt(look.current);

    if (Math.abs(camera.fov - 50) > 0.01) {
      camera.fov += (50 - camera.fov) * (reducedMotion ? 1 : 1 - Math.exp(-6 * dt));
      camera.updateProjectionMatrix();
    }
  });

  return null;
}

function ProjectSystem({
  system,
  position,
  focused,
  focusedPlanet,
  hovered,
  onHoverProject,
  onSelectProject,
  onSelectPlanet,
  planetPositions,
  reducedMotion,
}: {
  system: ResolvedSystem;
  position: THREE.Vector3;
  focused: boolean;
  focusedPlanet: number | null;
  hovered: boolean;
  onHoverProject: (projectId: string | null) => void;
  onSelectProject: (projectId: string) => void;
  onSelectPlanet: (planetIndex: number) => void;
  planetPositions: React.RefObject<PlanetPositions>;
  reducedMotion: boolean;
}) {
  const planetGroups = useRef<Array<THREE.Group | null>>([]);
  const rings = useMemo(
    () => system.planets.map((planet) => orbitRing(planet.orbit + 0.4)),
    [system.planets],
  );

  useFrame(({ clock }) => {
    const time = reducedMotion ? 0 : clock.elapsedTime;

    system.planets.forEach((planet, index) => {
      const group = planetGroups.current[index];
      if (!group) return;

      const angle = time * planet.speed + planet.phase;
      group.position.set(
        Math.cos(angle) * (planet.orbit + 0.4),
        Math.sin(angle * 2 + planet.phase) * 0.08 * (planet.orbit + 0.4),
        Math.sin(angle) * (planet.orbit + 0.4),
      );

      let registered = planetPositions.current?.get(`${system.projectId}:${index}`);

      if (!registered) {
        registered = new THREE.Vector3();
        planetPositions.current?.set(`${system.projectId}:${index}`, registered);
      }

      registered.copy(group.position).add(position);
    });
  });

  return (
    <group position={position}>
      <sprite scale={3 * system.starScale} frustumCulled={false}>
        <spriteMaterial
          map={glowTexture()}
          color={system.starColor}
          opacity={0.75}
          blending={THREE.AdditiveBlending}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </sprite>
      <sprite scale={0.9 * system.starScale} frustumCulled={false}>
        <spriteMaterial
          map={glowTexture()}
          color="#fff6e8"
          blending={THREE.AdditiveBlending}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </sprite>

      {system.planets.map((planet, index) => (
        <lineLoop key={`ring-${planet.tech}`} frustumCulled={false}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[rings[index], 3]} />
          </bufferGeometry>
          <lineBasicMaterial
            color={planet.color}
            transparent
            opacity={focused ? 0.22 : 0.1}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </lineLoop>
      ))}

      <mesh
        onClick={(event) => {
          if (event.delta > 5) return;
          event.stopPropagation();
          onSelectProject(system.projectId);
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          onHoverProject(system.projectId);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          onHoverProject(null);
          document.body.style.cursor = "auto";
        }}
      >
        <sphereGeometry args={[STAR_MARKER_RADIUS, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>

      {system.planets.map((planet, index) => (
        <group
          key={planet.tech}
          ref={(element) => {
            planetGroups.current[index] = element;
          }}
        >
          <mesh
            onClick={(event) => {
              if (event.delta > 5) return;
              event.stopPropagation();
              onSelectPlanet(index);
            }}
            onPointerOver={(event) => {
              event.stopPropagation();
              event.object.scale.setScalar(1.18);
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={(event) => {
              event.object.scale.setScalar(1);
              document.body.style.cursor = "auto";
            }}
          >
            <sphereGeometry args={[planet.size * 0.32, 20, 20]} />
            <meshBasicMaterial map={planetTexture()} color={planet.color} toneMapped={false} />
          </mesh>
          <sprite scale={planet.size * 1.6} frustumCulled={false}>
            <spriteMaterial
              map={glowTexture()}
              color={planet.color}
              opacity={0.16}
              blending={THREE.AdditiveBlending}
              transparent
              depthWrite={false}
              toneMapped={false}
            />
          </sprite>
          {focused ? (
            <Html
              position={[0, planet.size * 0.32 + 0.18, 0]}
              center
              zIndexRange={[5, 0]}
              style={{ pointerEvents: "none" }}
            >
              <span className={styles.planetLabel} data-active={focusedPlanet === index}>
                {planet.tech}
              </span>
            </Html>
          ) : null}
        </group>
      ))}

      <Html position={[0, -2.6, 0]} center zIndexRange={[5, 0]} style={{ pointerEvents: "none" }}>
        <span
          className={styles.systemLabel}
          data-active={focused || hovered}
          style={{ "--domain-color": system.starColor } as CSSProperties}
        >
          <span className={styles.worldLabelDot} aria-hidden="true" />
          {system.projectName}
        </span>
      </Html>
    </group>
  );
}

function ProjectSystems({
  systems,
  positions,
  focusedProject,
  focusedPlanet,
  hoveredProject,
  onHoverProject,
  onSelectProject,
  onSelectPlanet,
  planetPositions,
  reducedMotion,
}: {
  systems: ResolvedSystem[];
  positions: THREE.Vector3[];
  focusedProject: string | null;
  focusedPlanet: number | null;
  hoveredProject: string | null;
  onHoverProject: (projectId: string | null) => void;
  onSelectProject: (projectId: string) => void;
  onSelectPlanet: (projectId: string, planetIndex: number) => void;
  planetPositions: React.RefObject<PlanetPositions>;
  reducedMotion: boolean;
}) {
  return (
    <group>
      {systems.map((system, index) => (
        <ProjectSystem
          key={system.projectId}
          system={system}
          position={positions[index]}
          focused={focusedProject === system.projectId}
          focusedPlanet={focusedProject === system.projectId ? focusedPlanet : null}
          hovered={hoveredProject === system.projectId}
          onHoverProject={onHoverProject}
          onSelectProject={onSelectProject}
          onSelectPlanet={(planetIndex) => onSelectPlanet(system.projectId, planetIndex)}
          planetPositions={planetPositions}
          reducedMotion={reducedMotion}
        />
      ))}
    </group>
  );
}

export function ProjectSystemScene({
  systems,
  focusedProject,
  focusedPlanet,
  hoveredProject,
  onHoverProject,
  onSelectProject,
  onSelectPlanet,
  quality,
  reducedMotion,
}: {
  systems: ResolvedSystem[];
  focusedProject: string | null;
  focusedPlanet: number | null;
  hoveredProject: string | null;
  onHoverProject: (projectId: string | null) => void;
  onSelectProject: (projectId: string) => void;
  onSelectPlanet: (projectId: string, planetIndex: number) => void;
  quality: Quality;
  reducedMotion: boolean;
}) {
  const positions = useMemo(() => layoutSystems(systems.length), [systems.length]);
  const planetPositions = useRef<PlanetPositions>(new Map());
  const columns = Math.max(1, Math.ceil(Math.sqrt(systems.length)));
  const rows = Math.ceil(systems.length / columns);
  const extent = useMemo(
    () => ({ width: columns * COLUMN_SPACING + 6, height: rows * ROW_SPACING + 6 }),
    [columns, rows],
  );

  return (
    <>
      <color attach="background" args={["#02030a"]} />
      <SystemCameraRig
        systems={systems}
        positions={positions}
        focusedProject={focusedProject}
        focusedPlanet={focusedPlanet}
        planetPositions={planetPositions}
        extent={extent}
        reducedMotion={reducedMotion}
      />
      <DistantGalaxies quality={quality} />
      <BackgroundDust quality={quality} />
      <NebulaBackdrop />
      <Starfield quality={quality} />
      <ShootingStars active={!reducedMotion} />
      <DistantSupernovae active={!reducedMotion} />
      <ProjectSystems
        systems={systems}
        positions={positions}
        focusedProject={focusedProject}
        focusedPlanet={focusedPlanet}
        hoveredProject={hoveredProject}
        onHoverProject={onHoverProject}
        onSelectProject={onSelectProject}
        onSelectPlanet={onSelectPlanet}
        planetPositions={planetPositions}
        reducedMotion={reducedMotion}
      />
      <EffectComposer multisampling={0}>
        <Bloom
          mipmapBlur
          intensity={0.8}
          luminanceThreshold={0.3}
          luminanceSmoothing={0.35}
          radius={0.8}
        />
        <Vignette eskil={false} offset={0.18} darkness={0.72} />
      </EffectComposer>
    </>
  );
}
