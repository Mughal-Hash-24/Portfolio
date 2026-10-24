"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { CubeTextureLoader, SRGBColorSpace, type CubeTexture } from "three";

type PanoramaCanvasProps = {
  faces: string[];
  paused: boolean;
  reducedMotion: boolean;
};

function Cubemap({ faces, paused, reducedMotion }: PanoramaCanvasProps) {
  const [texture, setTexture] = useState<CubeTexture | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loader = new CubeTextureLoader();

    loader.load(faces, (loaded) => {
      if (cancelled) {
        loaded.dispose();
        return;
      }

      loaded.colorSpace = SRGBColorSpace;
      setTexture(loaded);
    });

    return () => {
      cancelled = true;
    };
  }, [faces]);

  useEffect(() => {
    return () => {
      texture?.dispose();
    };
  }, [texture]);

  useFrame((state, delta) => {
    if (paused || reducedMotion || document.hidden) return;
    state.camera.rotation.y += delta * 0.005;
  });

  return texture ? <primitive object={texture} attach="background" /> : null;
}

export default function PanoramaCanvas(props: PanoramaCanvasProps) {
  return (
    <div aria-hidden className="absolute inset-0">
      <Canvas
        className="panorama-canvas"
        camera={{ position: [0, 0, 0], fov: 75 }}
        dpr={[1, 1.75]}
        frameloop={props.paused ? "never" : "always"}
        gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
      >
        <Cubemap {...props} />
      </Canvas>
    </div>
  );
}
