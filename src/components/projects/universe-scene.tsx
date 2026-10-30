"use client";

/* eslint-disable react-hooks/immutability -- three.js objects, camera controls, and shader uniforms are mutated imperatively inside useFrame. */

import { Html, OrbitControls, Stars } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { useEffect, useMemo, useRef, type CSSProperties, type RefObject } from "react";
import * as THREE from "three";
import {
  cameraKeyframes,
  expansionAtPresent,
  phaseIndexAt,
  universeDuration,
} from "@/content/projects-universe";
import { starWorld, type UniverseData } from "./universe-build";
import { cosmosFragmentShader, cosmosVertexShader } from "./universe-shaders";
import {
  cmbTexture,
  createRandom,
  glowTexture,
  ringTexture,
  smoothstep,
} from "./universe-textures";
import styles from "./universe.module.css";
import type { TimelineState, UniverseMode } from "./universe-types";

type Quality = "mobile" | "desktop";

type UniverseSceneProps = {
  data: UniverseData;
  timeline: RefObject<TimelineState>;
  mode: UniverseMode;
  selected: number | null;
  hovered: number | null;
  onHover: (id: number | null) => void;
  onSelect: (id: number) => void;
  onPhase: (index: number) => void;
  onComplete: () => void;
  progressBarRef: RefObject<HTMLSpanElement | null>;
  quality: Quality;
  reducedMotion: boolean;
};

type OrbitControlsLike = {
  enabled: boolean;
  target: THREE.Vector3;
  update: () => void;
};

type FlyState = {
  t: number;
  from: THREE.Vector3;
  to: THREE.Vector3;
  targetFrom: THREE.Vector3;
  targetTo: THREE.Vector3;
};

const NONE = -10;

function sampleCamera(progress: number, position: THREE.Vector3, target: THREE.Vector3) {
  let from: (typeof cameraKeyframes)[number] = cameraKeyframes[0];
  let to: (typeof cameraKeyframes)[number] = cameraKeyframes[cameraKeyframes.length - 1];

  for (let index = 1; index < cameraKeyframes.length; index += 1) {
    if (progress <= cameraKeyframes[index].at) {
      from = cameraKeyframes[index - 1];
      to = cameraKeyframes[index];
      break;
    }
  }

  const span = to.at - from.at;
  const t = smoothstep(0, 1, span === 0 ? 1 : (progress - from.at) / span);
  const radius = from.radius + (to.radius - from.radius) * t;
  const height = from.height + (to.height - from.height) * t;
  const angle = from.angle + (to.angle - from.angle) * t;

  position.set(Math.sin(angle) * radius, height, Math.cos(angle) * radius);
  target.set(
    from.target[0] + (to.target[0] - from.target[0]) * t,
    from.target[1] + (to.target[1] - from.target[1]) * t,
    from.target[2] + (to.target[2] - from.target[2]) * t,
  );

  return from.fov + (to.fov - from.fov) * t;
}

function expansionFor(progress: number) {
  return 1 + (expansionAtPresent - 1) * smoothstep(0.82, 0.92, progress);
}

function Director({
  timeline,
  onPhase,
  onComplete,
  progressBarRef,
}: {
  timeline: RefObject<TimelineState>;
  onPhase: (index: number) => void;
  onComplete: () => void;
  progressBarRef: RefObject<HTMLSpanElement | null>;
}) {
  const currentPhase = useRef(phaseIndexAt(timeline.current?.elapsed ?? 0));

  useFrame((_, delta) => {
    const state = timeline.current;
    if (!state?.started || !state.playing) return;

    state.elapsed = Math.min(universeDuration, state.elapsed + Math.min(delta, 0.1));
    state.progress = state.elapsed / universeDuration;

    if (progressBarRef.current) {
      progressBarRef.current.style.transform = `scaleX(${state.progress})`;
    }

    const phase = phaseIndexAt(state.elapsed);
    if (phase !== currentPhase.current) {
      currentPhase.current = phase;
      onPhase(phase);
    }

    if (state.elapsed >= universeDuration) {
      state.playing = false;
      onComplete();
    }
  });

  return null;
}

function CameraRig({
  timeline,
  mode,
  selected,
  data,
  reducedMotion,
}: {
  timeline: RefObject<TimelineState>;
  mode: UniverseMode;
  selected: number | null;
  data: UniverseData;
  reducedMotion: boolean;
}) {
  const camera = useThree((state) => state.camera) as THREE.PerspectiveCamera;
  const controls = useThree((state) => state.controls) as OrbitControlsLike | null;
  const fly = useRef<FlyState | null>(null);
  const look = useRef(new THREE.Vector3(0, 0, 0));
  const desiredPosition = useRef(new THREE.Vector3());
  const desiredTarget = useRef(new THREE.Vector3());
  const explored = useRef(false);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);

    if (mode === "intro") {
      const progress = timeline.current?.progress ?? 0;
      const fov = sampleCamera(progress, desiredPosition.current, desiredTarget.current);
      camera.position.lerp(desiredPosition.current, 1 - Math.exp(-3.1 * dt));
      look.current.lerp(desiredTarget.current, 1 - Math.exp(-4.2 * dt));
      camera.lookAt(look.current);

      if (Math.abs(camera.fov - fov) > 0.01) {
        camera.fov += (fov - camera.fov) * (1 - Math.exp(-5 * dt));
        camera.updateProjectionMatrix();
      }

      return;
    }

    const flight = fly.current;
    if (!flight) return;

    flight.t = Math.min(1, flight.t + dt / 1.6);
    const t = flight.t;
    const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    camera.position.lerpVectors(flight.from, flight.to, eased);
    controls?.target.lerpVectors(flight.targetFrom, flight.targetTo, eased);
    controls?.update();

    if (t >= 1) {
      fly.current = null;
      if (controls) controls.enabled = true;
    }
  });

  useEffect(() => {
    if (!controls) return;

    if (mode !== "explore") {
      controls.enabled = false;
      return;
    }

    if (!explored.current) {
      explored.current = true;
      controls.enabled = true;
      controls.target.set(0, 0, 0);

      const final = cameraKeyframes[cameraKeyframes.length - 1];
      camera.position.set(
        Math.sin(final.angle) * final.radius,
        final.height,
        Math.cos(final.angle) * final.radius,
      );
      camera.lookAt(final.target[0], final.target[1], final.target[2]);
      camera.fov = final.fov;
      camera.updateProjectionMatrix();
      return;
    }

    const final = cameraKeyframes[cameraKeyframes.length - 1];
    const presentTarget = new THREE.Vector3(final.target[0], final.target[1], final.target[2]);
    const presentPosition = new THREE.Vector3(
      Math.sin(final.angle) * final.radius,
      final.height,
      Math.cos(final.angle) * final.radius,
    );
    const galaxy = selected === null ? null : data.galaxies[selected];
    const targetTo = galaxy
      ? galaxy.center.clone().multiplyScalar(expansionAtPresent)
      : presentTarget;
    const distance = galaxy
      ? Math.max(3, galaxy.radius * 3.8)
      : presentPosition.distanceTo(presentTarget);
    let direction: THREE.Vector3;

    if (galaxy) {
      direction = camera.position.clone().sub(targetTo);

      if (direction.lengthSq() < 0.0001) {
        direction.set(0.25, 0.35, 1);
      }

      direction.normalize();
    } else {
      direction = presentPosition.clone().sub(presentTarget).normalize();
    }

    const to = targetTo.clone().addScaledVector(direction, distance);

    if (reducedMotion) {
      camera.position.copy(to);
      controls.target.copy(targetTo);
      controls.update();
      controls.enabled = true;
      fly.current = null;
      return;
    }

    controls.enabled = false;
    fly.current = {
      t: 0,
      from: camera.position.clone(),
      to,
      targetFrom: controls.target.clone(),
      targetTo,
    };
  }, [mode, selected, controls, camera, data.galaxies, reducedMotion]);

  return null;
}

function BigBangFlash({ timeline }: { timeline: RefObject<TimelineState> }) {
  const sprite = useRef<THREE.Sprite>(null);

  useFrame(() => {
    const progress = timeline.current?.progress ?? 0;
    const current = sprite.current;
    if (!current) return;

    current.visible = progress < 0.09;
    const k = Math.min(progress / 0.06, 1);
    current.scale.setScalar(1 + 8 * (1 - Math.pow(1 - k, 3)));
    current.material.opacity = 0.55 * (1 - smoothstep(0, 0.06, progress));
  });

  return (
    <sprite ref={sprite} frustumCulled={false}>
      <spriteMaterial
        map={glowTexture()}
        color={new THREE.Color(1.4, 1.3, 1.2)}
        blending={THREE.AdditiveBlending}
        transparent
        depthWrite={false}
        depthTest={false}
        toneMapped={false}
      />
    </sprite>
  );
}

function NebulaBackdrop() {
  const clouds = [
    {
      position: [-32, 8, -24] as const,
      scale: 62,
      color: "#4a3cff",
      opacity: 0.045,
    },
    {
      position: [33, -7, -20] as const,
      scale: 52,
      color: "#2ec7c0",
      opacity: 0.04,
    },
    {
      position: [4, 16, -44] as const,
      scale: 72,
      color: "#ffb36b",
      opacity: 0.035,
    },
    {
      position: [0, 0, 0] as const,
      scale: 36,
      color: "#3550b8",
      opacity: 0.03,
    },
  ];

  return (
    <>
      {clouds.map((cloud) => (
        <sprite
          key={cloud.color}
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
    </>
  );
}

function Cosmos({
  data,
  timeline,
  selected,
  hovered,
}: {
  data: UniverseData;
  timeline: RefObject<TimelineState>;
  selected: number | null;
  hovered: number | null;
}) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: cosmosVertexShader,
        fragmentShader: cosmosFragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uProg: { value: 0 },
          uTime: { value: 0 },
          uScale: { value: 800 },
          uSel: { value: NONE },
          uHover: { value: NONE },
          uTwinkle: { value: 0 },
          uExpand: { value: 1 },
          uRedshift: { value: 0 },
        },
      }),
    [],
  );

  useFrame(({ clock, size, camera, gl }) => {
    const progress = timeline.current?.progress ?? 0;
    const uniforms = material.uniforms;
    const fov = (camera as THREE.PerspectiveCamera).fov;

    uniforms.uTime.value = clock.elapsedTime;
    uniforms.uProg.value = progress;
    uniforms.uTwinkle.value = smoothstep(0.92, 1, progress);
    uniforms.uScale.value =
      (size.height * gl.getPixelRatio()) / (2 * Math.tan(THREE.MathUtils.degToRad(fov) / 2));
    uniforms.uSel.value = selected ?? NONE;
    uniforms.uHover.value = hovered ?? NONE;
    uniforms.uExpand.value = expansionFor(progress);
    uniforms.uRedshift.value =
      0.24 * smoothstep(0.84, 0.9, progress) * (1 - smoothstep(0.94, 1, progress));
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data.cloud, 3]} />
        <bufferAttribute attach="attributes-aLocal" args={[data.local, 3]} />
        <bufferAttribute attach="attributes-aAxis" args={[data.axis, 3]} />
        <bufferAttribute attach="attributes-aCenter" args={[data.center, 3]} />
        <bufferAttribute attach="attributes-aColor" args={[data.color, 3]} />
        <bufferAttribute attach="attributes-aData" args={[data.attr, 4]} />
      </bufferGeometry>
      <primitive object={material} attach="material" />
    </points>
  );
}

function PrimordialSoup({
  timeline,
  quality,
}: {
  timeline: RefObject<TimelineState>;
  quality: Quality;
}) {
  const points = useRef<THREE.Points>(null);

  const soup = useMemo(() => {
    const count = quality === "mobile" ? 1600 : 3200;
    const random = createRandom(0xba6b00);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const palette = [
      new THREE.Color(1, 0.88, 0.58),
      new THREE.Color(0.55, 0.88, 1),
      new THREE.Color(1, 0.45, 0.78),
      new THREE.Color(1, 0.98, 0.92),
    ];

    for (let index = 0; index < count; index += 1) {
      const direction = new THREE.Vector3(random() * 2 - 1, random() * 2 - 1, random() * 2 - 1);

      if (direction.lengthSq() < 0.0001) direction.set(0, 1, 0);
      direction.normalize();

      const radius = Math.cbrt(random()) * 2.7;
      const color = palette[Math.floor(random() * palette.length)];

      positions.set([direction.x * radius, direction.y * radius, direction.z * radius], index * 3);
      colors.set([color.r, color.g, color.b], index * 3);
    }

    return { positions, colors };
  }, [quality]);

  useFrame(({ clock }) => {
    const current = points.current;
    if (!current) return;

    const progress = timeline.current?.progress ?? 0;
    const opacity = smoothstep(0.16, 0.21, progress) * (1 - smoothstep(0.29, 0.36, progress));
    const material = current.material as THREE.PointsMaterial;

    material.opacity = opacity * 0.9;
    current.visible = opacity > 0.004;
    current.rotation.y = clock.elapsedTime * 0.06;
    current.rotation.x = Math.sin(clock.elapsedTime * 0.11) * 0.15;
    current.scale.setScalar(0.62 + 0.58 * smoothstep(0.17, 0.3, progress));
  });

  return (
    <points ref={points} frustumCulled={false} visible={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[soup.positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[soup.colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={glowTexture()}
        size={0.085}
        vertexColors
        transparent
        opacity={0}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </points>
  );
}

function Nuclei({ timeline }: { timeline: RefObject<TimelineState> }) {
  const group = useRef<THREE.Group>(null);
  const sprites = useRef<Array<THREE.Sprite | null>>([]);

  const nuclei = useMemo(() => {
    const random = createRandom(0x51e11);
    const palette = ["#ffd27a", "#9fd8ff", "#ff8ad8", "#ffffff"];

    return Array.from({ length: 28 }, (_, index) => {
      const direction = new THREE.Vector3(random() * 2 - 1, random() * 2 - 1, random() * 2 - 1);

      if (direction.lengthSq() < 0.0001) direction.set(0, 1, 0);
      direction.normalize();
      const radius = 0.25 + Math.sqrt(random()) * 1.9;

      return {
        position: [direction.x * radius, direction.y * radius * 0.72, direction.z * radius] as [
          number,
          number,
          number,
        ],
        color: palette[index % palette.length],
        size: 0.14 + random() * 0.24,
        phase: random() * Math.PI * 2,
      };
    });
  }, []);

  useFrame(({ clock }, delta) => {
    const progress = timeline.current?.progress ?? 0;
    const power = smoothstep(0.2, 0.24, progress) * (1 - smoothstep(0.29, 0.35, progress));

    if (group.current) {
      group.current.rotation.y = clock.elapsedTime * 0.16;
      group.current.rotation.x = Math.sin(clock.elapsedTime * 0.12) * 0.12;
    }

    nuclei.forEach((nucleus, index) => {
      const sprite = sprites.current[index];
      if (!sprite) return;

      const target = power * (0.7 + 0.3 * Math.sin(clock.elapsedTime * 2 + nucleus.phase));
      const material = sprite.material;

      material.opacity += (target - material.opacity) * Math.min(1, delta * 4);
      sprite.visible = material.opacity > 0.005;
      sprite.scale.setScalar(
        nucleus.size * (1 + 0.14 * Math.sin(clock.elapsedTime * 1.4 + nucleus.phase)),
      );
    });
  });

  return (
    <group ref={group}>
      {nuclei.map((nucleus, index) => (
        <sprite
          key={index}
          ref={(element) => {
            sprites.current[index] = element;
          }}
          position={nucleus.position}
          visible={false}
          frustumCulled={false}
        >
          <spriteMaterial
            map={glowTexture()}
            color={nucleus.color}
            blending={THREE.AdditiveBlending}
            transparent
            opacity={0}
            depthWrite={false}
            toneMapped={false}
          />
        </sprite>
      ))}
    </group>
  );
}

function CMBShell({ timeline }: { timeline: RefObject<TimelineState> }) {
  const shell = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const current = shell.current;
    if (!current) return;

    const progress = timeline.current?.progress ?? 0;
    const opacity = smoothstep(0.3, 0.325, progress) * (1 - smoothstep(0.38, 0.415, progress));

    current.visible = opacity > 0.004;
    current.rotation.y = clock.elapsedTime * 0.012;
    current.scale.setScalar(1 + 0.04 * smoothstep(0.32, 0.42, progress));
    (current.material as THREE.MeshBasicMaterial).opacity = opacity * 0.45;
  });

  return (
    <mesh ref={shell} visible={false} frustumCulled={false}>
      <sphereGeometry args={[9, 64, 64]} />
      <meshBasicMaterial
        map={cmbTexture()}
        transparent
        opacity={0}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

function CosmicWeb({ data, timeline }: { data: UniverseData; timeline: RefObject<TimelineState> }) {
  const web = useRef<THREE.LineSegments>(null);
  const material = useRef<THREE.LineBasicMaterial>(null);

  useFrame(() => {
    const progress = timeline.current?.progress ?? 0;
    const current = web.current;
    if (!current || !material.current) return;

    const base = smoothstep(0.36, 0.5, progress) * (1 - 0.35 * smoothstep(0.75, 1, progress));
    material.current.opacity = base * 0.2;
    current.visible = base > 0.004;
    current.scale.setScalar(expansionFor(progress));
  });

  return (
    <lineSegments ref={web} frustumCulled={false} visible={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data.filamentPositions, 3]} />
      </bufferGeometry>
      <lineBasicMaterial
        ref={material}
        color="#3b5bb5"
        transparent
        opacity={0}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </lineSegments>
  );
}

function FirstStars({
  data,
  timeline,
}: {
  data: UniverseData;
  timeline: RefObject<TimelineState>;
}) {
  const sprites = useRef<Array<THREE.Sprite | null>>([]);
  const stars = useMemo(
    () =>
      data.galaxies.flatMap((galaxy, galaxyIndex) => {
        const random = createRandom(0x1f1a + galaxyIndex);

        return [0, 1, 2, 3, 4, 5].map((starIndex) => ({
          key: `${galaxy.id}-${starIndex}`,
          galaxy,
          offset:
            starIndex === 0
              ? new THREE.Vector3(0, 0, 0)
              : new THREE.Vector3(
                  (random() - 0.5) * galaxy.radius * 2.2,
                  (random() - 0.5) * galaxy.radius * 1.1,
                  (random() - 0.5) * galaxy.radius * 2.2,
                ),
          size: starIndex === 0 ? 2.2 : 0.95 + random() * 1.1,
          phase: random() * Math.PI * 2,
        }));
      }),
    [data.galaxies],
  );

  useFrame(({ clock }, delta) => {
    const progress = timeline.current?.progress ?? 0;
    const power = smoothstep(0.53, 0.59, progress) * (1 - smoothstep(0.72, 0.8, progress));
    const expand = expansionFor(progress);

    stars.forEach((star, index) => {
      const sprite = sprites.current[index];
      if (!sprite) return;

      const twinkle = 0.82 + 0.18 * Math.sin(clock.elapsedTime * 2.4 + star.phase);
      const target = Math.min(1, power * twinkle * 1.25);
      const material = sprite.material;

      material.opacity += (target - material.opacity) * Math.min(1, delta * 5);
      sprite.visible = material.opacity > 0.006;
      sprite.position.set(
        (star.galaxy.center.x + star.offset.x) * expand,
        (star.galaxy.center.y + star.offset.y) * expand,
        (star.galaxy.center.z + star.offset.z) * expand,
      );
      sprite.scale.setScalar(star.size * (1 + 0.15 * Math.sin(clock.elapsedTime + star.phase)));
    });
  });

  return (
    <>
      {stars.map((star, index) => (
        <sprite
          key={star.key}
          ref={(element) => {
            sprites.current[index] = element;
          }}
          frustumCulled={false}
          visible={false}
        >
          <spriteMaterial
            map={glowTexture()}
            color="#d6ecff"
            blending={THREE.AdditiveBlending}
            transparent
            opacity={0}
            depthWrite={false}
            toneMapped={false}
          />
        </sprite>
      ))}
    </>
  );
}

function GalaxyCores({
  data,
  timeline,
  selected,
  hovered,
  mode,
}: {
  data: UniverseData;
  timeline: RefObject<TimelineState>;
  selected: number | null;
  hovered: number | null;
  mode: UniverseMode;
}) {
  const sprites = useRef<Array<THREE.Sprite | null>>([]);

  useFrame(({ clock }, delta) => {
    const progress = timeline.current?.progress ?? 0;
    const reveal = smoothstep(0.55, 0.72, progress);
    const expand = expansionFor(progress);
    const focus = mode === "explore" && selected !== null;

    data.galaxies.forEach((galaxy, index) => {
      const sprite = sprites.current[index];
      if (!sprite) return;

      const isSelected = selected === galaxy.id;
      const isHovered = hovered === galaxy.id;
      const target = reveal * (focus ? (isSelected ? 0.5 : 0.035) : isHovered ? 0.42 : 0.16);
      const material = sprite.material;

      material.opacity += (target - material.opacity) * Math.min(1, delta * 3.4);
      sprite.visible = material.opacity > 0.006;
      sprite.position.set(
        galaxy.center.x * expand,
        galaxy.center.y * expand,
        galaxy.center.z * expand,
      );
      const pulse = 1 + 0.035 * Math.sin(clock.elapsedTime * 1.1 + index * 1.7);
      sprite.scale.setScalar(galaxy.radius * 2.5 * pulse);
    });
  });

  return (
    <>
      {data.galaxies.map((galaxy, index) => (
        <sprite
          key={galaxy.id}
          ref={(element) => {
            sprites.current[index] = element;
          }}
          frustumCulled={false}
          visible={false}
        >
          <spriteMaterial
            map={glowTexture()}
            color={galaxy.domain.palette.halo}
            blending={THREE.AdditiveBlending}
            transparent
            opacity={0}
            depthWrite={false}
            depthTest={false}
            toneMapped={false}
          />
        </sprite>
      ))}
    </>
  );
}

function GalaxyLabels({
  data,
  mode,
  selected,
  hovered,
}: {
  data: UniverseData;
  mode: UniverseMode;
  selected: number | null;
  hovered: number | null;
}) {
  if (mode !== "explore") return null;

  return (
    <>
      {data.galaxies.map((galaxy) => {
        const active = selected === galaxy.id || hovered === galaxy.id;
        const dimmed = selected !== null && selected !== galaxy.id;

        return (
          <Html
            key={galaxy.id}
            position={[
              galaxy.center.x * expansionAtPresent,
              galaxy.center.y * expansionAtPresent + galaxy.radius * 1.35,
              galaxy.center.z * expansionAtPresent,
            ]}
            center
            zIndexRange={[5, 0]}
            style={{ pointerEvents: "none" }}
          >
            <span
              className={styles.worldLabel}
              data-active={active}
              data-dim={dimmed}
              style={
                {
                  "--domain-color": galaxy.domain.palette.mid,
                } as CSSProperties
              }
            >
              <span className={styles.worldLabelDot} aria-hidden="true" />
              {galaxy.domain.label}
            </span>
          </Html>
        );
      })}
    </>
  );
}

function Markers({
  data,
  onHover,
  onSelect,
}: {
  data: UniverseData;
  onHover: (id: number | null) => void;
  onSelect: (id: number) => void;
}) {
  return (
    <>
      {data.galaxies.map((galaxy) => (
        <mesh
          key={galaxy.id}
          position={[
            galaxy.center.x * expansionAtPresent,
            galaxy.center.y * expansionAtPresent,
            galaxy.center.z * expansionAtPresent,
          ]}
          onPointerOver={(event) => {
            event.stopPropagation();
            onHover(galaxy.id);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            onHover(null);
            document.body.style.cursor = "auto";
          }}
          onClick={(event) => {
            if (event.delta > 5) return;
            event.stopPropagation();
            onSelect(galaxy.id);
          }}
        >
          <sphereGeometry args={[Math.max(1.05, galaxy.radius * 0.95), 16, 16]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
        </mesh>
      ))}
    </>
  );
}

const FLASH_COLOR = new THREE.Color(3, 3.2, 4);
const SHOCK_COLOR = new THREE.Color(0.9, 1.3, 2.2);
const SLOT_COUNT = 7;

function Supernovae({
  data,
  active,
  selected,
}: {
  data: UniverseData;
  active: boolean;
  selected: number | null;
}) {
  const slots = useRef(
    Array.from({ length: SLOT_COUNT }, () => ({
      on: false,
      age: 0,
      star: 0,
      life: 4,
    })),
  );
  const flashes = useRef<Array<THREE.Sprite | null>>([]);
  const rings = useRef<Array<THREE.Sprite | null>>([]);
  const next = useRef(1.4);
  const position = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }, delta) => {
    if (!active) {
      for (let index = 0; index < SLOT_COUNT; index += 1) {
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
        const galaxy = selected ?? Math.floor(Math.random() * data.galaxies.length);
        slot.on = true;
        slot.age = 0;
        slot.life = 3.4 + Math.random() * 2;
        slot.star = galaxy * data.perGalaxy + Math.floor(Math.random() * data.perGalaxy);
      }

      next.current = selected !== null ? 0.7 + Math.random() * 1.4 : 1.7 + Math.random() * 3;
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

      starWorld(data, slot.star, clock.elapsedTime, position);
      flash.visible = true;
      ring.visible = true;
      flash.position.copy(position);
      ring.position.copy(position);

      flash.scale.setScalar(0.28 + 0.75 * (1 - Math.pow(1 - Math.min(life * 2.5, 1), 3)));
      flash.material.opacity = Math.min(life / 0.06, 1) * Math.pow(1 - life, 2.2);

      ring.scale.setScalar(0.14 + 2.3 * (1 - Math.pow(1 - life, 3)));
      ring.material.opacity = 0.68 * Math.pow(1 - life, 1.5);
    });
  });

  return (
    <>
      {Array.from({ length: SLOT_COUNT }, (_, index) => (
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
              color={FLASH_COLOR}
              blending={THREE.AdditiveBlending}
              transparent
              depthWrite={false}
              depthTest={false}
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
              color={SHOCK_COLOR}
              blending={THREE.AdditiveBlending}
              transparent
              depthWrite={false}
              depthTest={false}
              toneMapped={false}
            />
          </sprite>
        </group>
      ))}
    </>
  );
}

export function UniverseScene({
  data,
  timeline,
  mode,
  selected,
  hovered,
  onHover,
  onSelect,
  onPhase,
  onComplete,
  progressBarRef,
  quality,
  reducedMotion,
}: UniverseSceneProps) {
  const explore = mode === "explore";

  return (
    <>
      <color attach="background" args={["#02030a"]} />
      <Director
        timeline={timeline}
        onPhase={onPhase}
        onComplete={onComplete}
        progressBarRef={progressBarRef}
      />
      <CameraRig
        timeline={timeline}
        mode={mode}
        selected={selected}
        data={data}
        reducedMotion={reducedMotion}
      />
      <BigBangFlash timeline={timeline} />
      <NebulaBackdrop />
      <Cosmos data={data} timeline={timeline} selected={selected} hovered={hovered} />
      <PrimordialSoup timeline={timeline} quality={quality} />
      <Nuclei timeline={timeline} />
      <CMBShell timeline={timeline} />
      <CosmicWeb data={data} timeline={timeline} />
      <FirstStars data={data} timeline={timeline} />
      <GalaxyCores
        data={data}
        timeline={timeline}
        selected={selected}
        hovered={hovered}
        mode={mode}
      />
      <GalaxyLabels data={data} mode={mode} selected={selected} hovered={hovered} />
      {explore ? <Markers data={data} onHover={onHover} onSelect={onSelect} /> : null}
      <Supernovae data={data} active={explore && !reducedMotion} selected={selected} />
      <Stars
        radius={120}
        depth={55}
        count={quality === "mobile" ? 1600 : 3200}
        factor={4}
        fade
        speed={reducedMotion ? 0 : 0.6}
      />
      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.06}
        minDistance={1.2}
        maxDistance={70}
        autoRotate={explore && selected !== null && !reducedMotion}
        autoRotateSpeed={0.55}
      />
      <EffectComposer multisampling={0}>
        <Bloom
          mipmapBlur
          intensity={0.95}
          luminanceThreshold={0.24}
          luminanceSmoothing={0.4}
          radius={0.8}
        />
        <Vignette eskil={false} offset={0.18} darkness={0.72} />
      </EffectComposer>
    </>
  );
}
