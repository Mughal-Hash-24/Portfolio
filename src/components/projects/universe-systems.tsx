"use client";

/* eslint-disable react-hooks/immutability -- three.js objects, camera, and shader uniforms are mutated imperatively inside useFrame. */

import { useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
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
import { SparkText } from "./universe-spark-text";
import { createRandom, glowTexture, hashString, planetTexture } from "./universe-textures";
import type { Quality } from "./universe-types";

type PlanetPositions = Map<string, THREE.Vector3>;
type OrbitView = { azimuth: number; polar: number };

const STAR_MARKER_RADIUS = 1.05;
const PLANET_FOCUS_DISTANCE = 1.7;
const FOCUS_ORBIT_SPEED = 0.12;

function systemRadius(system: ResolvedSystem) {
  const maxOrbit = system.planets.reduce((max, planet) => Math.max(max, planet.orbit + 0.4), 0);
  return maxOrbit * system.personality.scale * system.personality.elongation + 0.9;
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

function orbitRing(radius: number, elongation: number) {
  const segments = 72;
  const positions = new Float32Array(segments * 3);

  for (let index = 0; index < segments; index += 1) {
    const angle = (index / segments) * Math.PI * 2;
    positions[index * 3] = Math.cos(angle) * radius * elongation;
    positions[index * 3 + 1] = 0;
    positions[index * 3 + 2] = (Math.sin(angle) * radius) / elongation;
  }

  return positions;
}

type BeltData = {
  kind: "rock" | "ice";
  positions: Float32Array;
  colors: Float32Array;
  opacity: number;
};

const ROCK_COLORS = ["#8c7f6f", "#6f6357", "#a3947f", "#55483e"];
const ICE_COLORS = ["#bfe6ff", "#9fd0ff", "#e8f7ff", "#7fb0d9"];

function buildBelt(system: ResolvedSystem, kind: "rock" | "ice", quality: Quality): BeltData {
  const persona = system.personality;
  const random = createRandom(hashString(`${system.projectId}:belt:${kind}`));
  const count = quality === "mobile" ? 240 : 420;
  const orbits = system.planets.map((planet) => (planet.orbit + 0.4) * persona.scale);
  const outer = Math.max(...orbits);
  const inner = kind === "rock" ? Math.min(orbits[1] ?? outer * 0.6, outer) + 0.35 : outer + 1.1;
  const width = kind === "rock" ? 0.5 : 0.85;
  const palette = kind === "rock" ? ROCK_COLORS : ICE_COLORS;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const tint = new THREE.Color();

  for (let index = 0; index < count; index += 1) {
    const angle = random() * Math.PI * 2;
    const radius = inner + (random() - 0.5) * width;

    positions.set(
      [
        Math.cos(angle) * radius * persona.elongation,
        (random() - 0.5) * (kind === "rock" ? 0.12 : 0.2),
        (Math.sin(angle) * radius) / persona.elongation,
      ],
      index * 3,
    );
    tint.set(palette[Math.floor(random() * palette.length)]);
    const brightness = 0.55 + random() * 0.45;
    colors.set([tint.r * brightness, tint.g * brightness, tint.b * brightness], index * 3);
  }

  return {
    kind,
    positions,
    colors,
    opacity: kind === "rock" ? 0.5 : 0.6,
  };
}

type ProjectAsteroid = {
  radius: number;
  speed: number;
  phase: number;
  height: number;
  size: number;
  color: string;
  spin: THREE.Vector3;
};

function buildAsteroids(system: ResolvedSystem): ProjectAsteroid[] {
  const persona = system.personality;
  const random = createRandom(hashString(`${system.projectId}:asteroids`));
  const outer = Math.max(...system.planets.map((planet) => (planet.orbit + 0.4) * persona.scale));

  return Array.from({ length: 6 }, () => ({
    radius: 0.7 + random() * (outer + 0.9),
    speed: (0.06 + random() * 0.16) * (persona.retrograde ? -1 : 1),
    phase: random() * Math.PI * 2,
    height: (random() - 0.5) * 0.5,
    size: 0.055 + random() * 0.06,
    color: ROCK_COLORS[Math.floor(random() * ROCK_COLORS.length)],
    spin: new THREE.Vector3(random() - 0.5, random() - 0.5, random() - 0.5)
      .normalize()
      .multiplyScalar(0.5 + random() * 0.9),
  }));
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
        distance = systemRadius(systems[index]) + 2.6;

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
  quality,
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
  quality: Quality;
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
  const beltMaterials = useRef<Array<THREE.PointsMaterial | null>>([]);
  const asteroidMeshes = useRef<Array<THREE.Mesh | null>>([]);
  const [hoveredPlanet, setHoveredPlanet] = useState<number | null>(null);
  const localTime = useRef(0);
  const revealStart = useRef<number | null>(null);
  const orbitPosition = useRef(new THREE.Vector3());
  const persona = system.personality;
  const tilt = useMemo(
    () => new THREE.Euler(persona.tiltX, 0, persona.tiltZ),
    [persona.tiltX, persona.tiltZ],
  );
  const tiltMatrix = useMemo(() => new THREE.Matrix4().makeRotationFromEuler(tilt), [tilt]);
  const rings = useMemo(
    () =>
      system.planets.map((planet) =>
        orbitRing((planet.orbit + 0.4) * persona.scale, persona.elongation),
      ),
    [system.planets, persona.scale, persona.elongation],
  );
  const belts = useMemo(
    () => persona.belts.map((kind) => buildBelt(system, kind, quality)),
    [system, persona.belts, quality],
  );
  const asteroids = useMemo(() => buildAsteroids(system), [system]);

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

      const angle = (persona.retrograde ? -1 : 1) * time * planet.speed + planet.phase;
      const radius = (planet.orbit + 0.4) * persona.scale;
      const radial = radius * (1 + persona.eccentricity * Math.cos(angle));

      orbitPosition.current
        .set(
          Math.cos(angle) * radial * persona.elongation,
          Math.sin(angle * 2 + planet.phase) * 0.06 * radial,
          (Math.sin(angle) * radial) / persona.elongation,
        )
        .applyMatrix4(tiltMatrix);
      group.position.copy(orbitPosition.current);

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

    const beltAppear = since < 0 ? 0 : Math.min(since / 0.9, 1);
    const beltEase = beltAppear * beltAppear * (3 - 2 * beltAppear);

    belts.forEach((belt, index) => {
      const material = beltMaterials.current[index];
      if (material) material.opacity = belt.opacity * beltEase;
    });

    asteroids.forEach((asteroid, index) => {
      const mesh = asteroidMeshes.current[index];
      if (!mesh) return;

      const angle = time * asteroid.speed + asteroid.phase;
      mesh.position.set(
        Math.cos(angle) * asteroid.radius * persona.elongation,
        asteroid.height + Math.sin(angle * 2 + asteroid.phase) * 0.12,
        (Math.sin(angle) * asteroid.radius) / persona.elongation,
      );
      mesh.rotation.x += asteroid.spin.x * dt;
      mesh.rotation.y += asteroid.spin.y * dt;
      mesh.rotation.z += asteroid.spin.z * dt;
      mesh.scale.setScalar(Math.max(asteroid.size * beltEase, 0.0001));
      (mesh.material as THREE.MeshBasicMaterial).opacity = beltEase;
    });
  });

  return (
    <group position={position}>
      <sprite scale={3 * system.starScale * persona.scale} frustumCulled={false}>
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
      <sprite scale={0.9 * system.starScale * persona.scale} frustumCulled={false}>
        <spriteMaterial
          map={glowTexture()}
          color="#fff6e8"
          blending={THREE.AdditiveBlending}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </sprite>

      <group rotation={tilt}>
        {belts.map((belt, index) => (
          <points key={`belt-${belt.kind}`} frustumCulled={false}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[belt.positions, 3]} />
              <bufferAttribute attach="attributes-color" args={[belt.colors, 3]} />
            </bufferGeometry>
            <pointsMaterial
              ref={(element) => {
                beltMaterials.current[index] = element;
              }}
              map={glowTexture()}
              size={belt.kind === "rock" ? 0.075 : 0.06}
              vertexColors
              transparent
              opacity={0}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              sizeAttenuation
              toneMapped={false}
            />
          </points>
        ))}
        {asteroids.map((asteroid, index) => (
          <mesh
            key={`asteroid-${index}`}
            ref={(element) => {
              asteroidMeshes.current[index] = element;
            }}
            frustumCulled={false}
          >
            <sphereGeometry args={[1, 7, 5]} />
            <meshBasicMaterial
              map={planetTexture()}
              color={asteroid.color}
              transparent
              opacity={0}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>

      {system.planets.map((planet, index) => (
        <lineLoop key={`ring-${planet.tech}`} frustumCulled={false} rotation={tilt}>
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
              setHoveredPlanet(index);
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={(event) => {
              event.object.scale.setScalar(1);
              setHoveredPlanet((current) => (current === index ? null : current));
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
          <SparkText
            text={planet.tech}
            color={planet.color}
            radius={planet.size * 0.34}
            screenHeight={22}
            active={focusedPlanet === index || hoveredPlanet === index}
            reducedMotion={reducedMotion}
          />
        </group>
      ))}

      <SparkText
        text={system.projectName}
        color={system.starColor}
        radius={systemRadius(system) * 0.82}
        screenHeight={30}
        active={focused || hovered}
        reducedMotion={reducedMotion}
      />
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
  quality,
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
  quality: Quality;
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
          quality={quality}
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
        quality={quality}
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
