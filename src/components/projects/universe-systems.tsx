"use client";

/* eslint-disable react-hooks/immutability -- three.js objects, camera, and shader uniforms are mutated imperatively inside useFrame. */

import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { useEffect, useMemo, useRef, type CSSProperties, type MutableRefObject } from "react";
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
type OrbitView = { azimuth: number; polar: number };

const STAR_MARKER_RADIUS = 1.05;
const FOCUS_DISTANCE = 7.8;
const PLANET_FOCUS_DISTANCE = 1.7;
const FOCUS_ORBIT_SPEED = 0.12;

function systemRadius(system: ResolvedSystem) {
  const maxOrbit = system.planets.reduce((max, planet) => Math.max(max, planet.orbit + 0.4), 0);
  return maxOrbit + 0.7;
}

function layoutSystems(systems: ResolvedSystem[]) {
  const random = createRandom(0x5eed + systems.length * 977);
  const radii = systems.map(systemRadius);
  const spreadX = 9 + systems.length * 1.9;
  const spreadY = spreadX * 0.64;
  const positions: THREE.Vector3[] = [];

  for (let index = 0; index < systems.length; index += 1) {
    const position = new THREE.Vector3();

    for (let attempts = 1; attempts < 600; attempts += 1) {
      const angle = random() * Math.PI * 2;
      const scale = 1 + Math.max(0, attempts - 40) / 40;
      const spread = Math.sqrt(random()) * scale;

      position.set(
        Math.cos(angle) * spread * spreadX,
        Math.sin(angle) * spread * spreadY,
        (random() - 0.5) * 5,
      );

      const clear = positions.every((other, otherIndex) => {
        const minimum = radii[index] + radii[otherIndex] + 1.6;
        const dx = other.x - position.x;
        const dy = other.y - position.y;
        return dx * dx + dy * dy >= minimum * minimum;
      });

      if (clear) break;
    }

    positions.push(position);
  }

  return positions;
}

function layoutExtent(systems: ResolvedSystem[], positions: THREE.Vector3[]) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const position of positions) {
    minX = Math.min(minX, position.x);
    maxX = Math.max(maxX, position.x);
    minY = Math.min(minY, position.y);
    maxY = Math.max(maxY, position.y);
  }

  const padding = Math.max(...systems.map(systemRadius)) * 2 + 5;

  return { width: maxX - minX + padding, height: maxY - minY + padding };
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

function SystemOrbit({ view }: { view: MutableRefObject<OrbitView> }) {
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    const element = gl.domElement;
    let lastX = 0;
    let lastY = 0;
    let activePointer: number | null = null;

    const handleDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      activePointer = event.pointerId;
      lastX = event.clientX;
      lastY = event.clientY;
      try {
        element.setPointerCapture(event.pointerId);
      } catch {
        // Synthetic or already-released pointers cannot be captured.
      }
      element.style.cursor = "grabbing";
    };

    const handleMove = (event: PointerEvent) => {
      if (activePointer !== event.pointerId) return;
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      lastX = event.clientX;
      lastY = event.clientY;
      view.current.azimuth -= dx * 0.006;
      view.current.polar = Math.min(1.52, Math.max(0.32, view.current.polar - dy * 0.005));
    };

    const handleUp = (event: PointerEvent) => {
      if (activePointer !== event.pointerId) return;
      activePointer = null;
      element.style.cursor = "grab";
    };

    element.style.cursor = "grab";
    element.addEventListener("pointerdown", handleDown);
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);

    return () => {
      element.style.cursor = "";
      element.removeEventListener("pointerdown", handleDown);
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
    };
  }, [gl, view]);

  return null;
}

function SystemCameraRig({
  systems,
  positions,
  focusedProject,
  focusedPlanet,
  planetPositions,
  extent,
  reducedMotion,
  view,
}: {
  systems: ResolvedSystem[];
  positions: THREE.Vector3[];
  focusedProject: string | null;
  focusedPlanet: number | null;
  planetPositions: MutableRefObject<PlanetPositions>;
  extent: { width: number; height: number };
  reducedMotion: boolean;
  view: MutableRefObject<OrbitView>;
}) {
  const camera = useThree((state) => state.camera) as THREE.PerspectiveCamera;
  const desiredPosition = useRef(new THREE.Vector3());
  const desiredTarget = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
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
          const live = planetPositions.current.get(`${focusedProject}:${focusedPlanet}`);

          if (live) {
            focusPosition = live;
            distance = PLANET_FOCUS_DISTANCE;
          }
        }
      }
    }

    if (focusPosition) {
      desiredTarget.current.copy(focusPosition);
    } else {
      desiredTarget.current.set(0, 0, 0);
    }

    const { azimuth, polar } = view.current;
    direction.current.set(
      Math.sin(polar) * Math.sin(azimuth),
      Math.cos(polar),
      Math.sin(polar) * Math.cos(azimuth),
    );
    desiredPosition.current
      .copy(desiredTarget.current)
      .addScaledVector(direction.current, distance);

    if (!initialized.current) {
      initialized.current = true;
      camera.position.copy(desiredPosition.current).multiplyScalar(1.9);
      camera.position.y += 4;
      look.current.set(0, 0, 0);
      camera.lookAt(look.current);
      return;
    }

    const positionK = reducedMotion ? 1 : 1 - Math.exp(-5 * dt);
    const lookK = reducedMotion ? 1 : 1 - Math.exp(-6 * dt);
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
  revealed,
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
  revealed: boolean;
  onHoverProject: (projectId: string | null) => void;
  onSelectProject: (projectId: string) => void;
  onSelectPlanet: (planetIndex: number) => void;
  planetPositions: MutableRefObject<PlanetPositions>;
  reducedMotion: boolean;
}) {
  const planetGroups = useRef<Array<THREE.Group | null>>([]);
  const planetMeshes = useRef<Array<THREE.Mesh | null>>([]);
  const planetGlows = useRef<Array<THREE.Sprite | null>>([]);
  const ringMaterials = useRef<Array<THREE.LineBasicMaterial | null>>([]);
  const localTime = useRef(0);
  const revealStart = useRef<number | null>(null);
  const rings = useMemo(
    () => system.planets.map((planet) => orbitRing(planet.orbit + 0.4)),
    [system.planets],
  );

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.1);
    localTime.current += reducedMotion ? 0 : dt * (focused ? FOCUS_ORBIT_SPEED : 1);
    const time = localTime.current;

    if (revealed && revealStart.current === null) {
      revealStart.current = clock.elapsedTime;
    }
    const since = revealStart.current === null ? -1 : clock.elapsedTime - revealStart.current;

    system.planets.forEach((planet, index) => {
      const group = planetGroups.current[index];
      if (!group) return;

      const angle = time * planet.speed + planet.phase;
      group.position.set(
        Math.cos(angle) * (planet.orbit + 0.4),
        Math.sin(angle * 2 + planet.phase) * 0.08 * (planet.orbit + 0.4),
        Math.sin(angle) * (planet.orbit + 0.4),
      );

      let registered = planetPositions.current.get(`${system.projectId}:${index}`);

      if (!registered) {
        registered = new THREE.Vector3();
        planetPositions.current.set(`${system.projectId}:${index}`, registered);
      }

      registered.copy(group.position).add(position);

      const delay = index * 0.09;
      const appear = since < delay ? 0 : Math.min((since - delay) / 0.55, 1);
      const eased = appear * appear * (3 - 2 * appear);

      const mesh = planetMeshes.current[index];
      if (mesh) {
        mesh.scale.setScalar(0.2 + 0.8 * eased);
        (mesh.material as THREE.MeshBasicMaterial).opacity = eased;
      }

      const glow = planetGlows.current[index];
      if (glow) glow.material.opacity = 0.16 * eased;

      const ring = ringMaterials.current[index];
      if (ring) ring.opacity = (focused ? 0.22 : 0.1) * eased;
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
            ref={(element) => {
              ringMaterials.current[index] = element;
            }}
            color={planet.color}
            transparent
            opacity={0}
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
            ref={(element) => {
              planetMeshes.current[index] = element;
            }}
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
            <meshBasicMaterial
              map={planetTexture()}
              color={planet.color}
              transparent
              opacity={0}
              toneMapped={false}
            />
          </mesh>
          <sprite
            ref={(element) => {
              planetGlows.current[index] = element;
            }}
            scale={planet.size * 1.6}
            frustumCulled={false}
          >
            <spriteMaterial
              map={glowTexture()}
              color={planet.color}
              opacity={0}
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
  revealed,
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
  revealed: boolean;
  onHoverProject: (projectId: string | null) => void;
  onSelectProject: (projectId: string) => void;
  onSelectPlanet: (projectId: string, planetIndex: number) => void;
  planetPositions: MutableRefObject<PlanetPositions>;
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
          revealed={revealed}
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
  revealed,
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
  revealed: boolean;
  onHoverProject: (projectId: string | null) => void;
  onSelectProject: (projectId: string) => void;
  onSelectPlanet: (projectId: string, planetIndex: number) => void;
  quality: Quality;
  reducedMotion: boolean;
}) {
  const positions = useMemo(() => layoutSystems(systems), [systems]);
  const extent = useMemo(() => layoutExtent(systems, positions), [systems, positions]);
  const planetPositions = useRef<PlanetPositions>(new Map());
  const view = useRef<OrbitView>({ azimuth: 0.38, polar: 1.16 });

  return (
    <>
      <color attach="background" args={["#02030a"]} />
      <SystemOrbit view={view} />
      <SystemCameraRig
        systems={systems}
        positions={positions}
        focusedProject={focusedProject}
        focusedPlanet={focusedPlanet}
        planetPositions={planetPositions}
        extent={extent}
        reducedMotion={reducedMotion}
        view={view}
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
        revealed={revealed}
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
