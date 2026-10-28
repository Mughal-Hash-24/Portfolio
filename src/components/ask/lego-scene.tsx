"use client";

import { RoundedBox } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import type { Group } from "three";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { LEGO_COLORS } from "./lego-brick";

type Brick3DProps = {
  color: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
};

function Brick3D({ color, position, rotation = [0, 0, 0], scale = 1 }: Brick3DProps) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <RoundedBox args={[2.2, 0.8, 1.1]} radius={0.06} smoothness={4}>
        <meshStandardMaterial color={color} roughness={0.36} metalness={0.03} />
      </RoundedBox>

      {Array.from({ length: 6 }, (_, index) => {
        const x = (index % 3) - 1;
        const z = Math.floor(index / 3) - 0.5;

        return (
          <mesh key={index} position={[x * 0.7, 0.47, z * 0.5]}>
            <cylinderGeometry args={[0.14, 0.14, 0.14, 20]} />
            <meshStandardMaterial color={color} roughness={0.36} metalness={0.03} />
          </mesh>
        );
      })}
    </group>
  );
}

function FloatingBrick({
  reduced,
  speed,
  ...brick
}: Brick3DProps & { reduced: boolean; speed: number }) {
  const ref = useRef<Group>(null);

  useFrame((state) => {
    if (reduced || !ref.current) return;

    const time = state.clock.elapsedTime;
    ref.current.position.y = Math.sin(time * speed) * 0.18;
    ref.current.rotation.z = Math.sin(time * speed * 0.7) * 0.03;
    ref.current.rotation.x = Math.cos(time * speed * 0.5) * 0.02;
  });

  return (
    <group ref={ref}>
      <Brick3D {...brick} />
    </group>
  );
}

function BrickField({ reduced }: { reduced: boolean }) {
  const group = useRef<Group>(null);

  useFrame((state, delta) => {
    if (reduced || !group.current) return;

    group.current.rotation.y += delta * 0.055;
    group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.25) * 0.04;
  });

  return (
    <group ref={group} scale={0.8} position={[0.65, 0.15, 0]}>
      <FloatingBrick
        reduced={reduced}
        speed={1.2}
        color={LEGO_COLORS.yellow}
        position={[-2.1, 1.1, -0.4]}
        rotation={[0.18, 0.42, 0.08]}
      />
      <FloatingBrick
        reduced={reduced}
        speed={0.9}
        color={LEGO_COLORS.red}
        position={[1.9, 1.35, -0.9]}
        rotation={[-0.2, -0.35, 0.12]}
      />
      <FloatingBrick
        reduced={reduced}
        speed={1.45}
        color={LEGO_COLORS.blue}
        position={[-1.35, -1.15, 0.35]}
        rotation={[0.15, -0.5, -0.1]}
      />
      <FloatingBrick
        reduced={reduced}
        speed={1.05}
        color={LEGO_COLORS.green}
        position={[2.15, -0.9, 0.15]}
        rotation={[0.1, 0.6, 0.18]}
      />
      <FloatingBrick
        reduced={reduced}
        speed={1.6}
        color={LEGO_COLORS.orange}
        position={[0.15, 2.15, -1.3]}
        rotation={[0.25, -0.2, -0.1]}
        scale={0.72}
      />
      <FloatingBrick
        reduced={reduced}
        speed={1.3}
        color={LEGO_COLORS.yellow}
        position={[0.35, -1.95, -0.8]}
        rotation={[-0.1, 0.3, 0.2]}
        scale={0.56}
      />
    </group>
  );
}

export default function LegoScene() {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.05,
    });

    const onVisibilityChange = () => setHidden(document.hidden);

    observer.observe(element);
    onVisibilityChange();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  const active = inView && !hidden;

  return (
    <div ref={containerRef} className="lego-scene" aria-hidden>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 8], fov: 36 }}
        gl={{ alpha: true, antialias: true }}
        frameloop={reduced ? "demand" : active ? "always" : "never"}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[4, 6, 5]} intensity={1.4} />
        <directionalLight position={[-5, -2, 3]} intensity={0.45} color="#ffd76a" />
        <BrickField reduced={reduced} />
      </Canvas>
    </div>
  );
}
