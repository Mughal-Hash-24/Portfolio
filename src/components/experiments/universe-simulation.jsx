"use client";

/* eslint-disable react-hooks/immutability -- three.js objects, refs, and shader uniforms are mutated imperatively inside useFrame. */

/**
 * UniverseSimulation.jsx
 *
 * Phase 1 (non-interactive): Big Bang -> inflation -> recombination -> dark ages
 *   -> first stars -> galaxies. Cinematic camera, GPU-driven particles, bloom.
 * Phase 2 (interactive): the same particles are now live galaxies. Hover/click to
 *   fly in, differential rotation, twinkling stars, random supernovae.
 *
 * npm i three @react-three/fiber @react-three/drei @react-three/postprocessing
 *   React 18 -> @react-three/fiber@8, @react-three/drei@9, @react-three/postprocessing@2
 *   React 19 -> @react-three/fiber@9, @react-three/drei@10, @react-three/postprocessing@3
 */
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, Stars } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

/* ------------------------------ configuration ----------------------------- */
const DURATION = 30; // seconds of cinematic intro
const GALAXIES = 14; // max galaxies placed
const PER = 7000; // stars per galaxy  (lower for mobile, e.g. 2500)
const DUST = 12000; // intergalactic particles
const SPIN = 0.45; // galaxy rotation speed
const NONE = -10; // "no galaxy" sentinel for shader uniforms

const EPOCHS = [
  [0.0, "The Big Bang", "t = 0", "Everything is one point of unimaginable heat."],
  [0.06, "Inflation", "10⁻³⁶ seconds", "Space itself stretches, faster than light."],
  [0.2, "Recombination", "380,000 years", "The universe cools and the first light escapes."],
  [
    0.38,
    "The dark ages",
    "Up to 200 million years",
    "No stars yet. Gravity quietly gathers the matter.",
  ],
  [
    0.62,
    "First stars ignite",
    "About 200 million years",
    "Fusion begins inside the densest clumps.",
  ],
  [
    0.82,
    "Galaxies assemble",
    "About 1 billion years",
    "Stars settle into spinning cities of light.",
  ],
];
const NAMES = [
  "Aurelia",
  "Borealis",
  "Cygnet",
  "Draco",
  "Elara",
  "Fornax",
  "Gemma",
  "Helix",
  "Ixion",
  "Juno",
  "Kepler",
  "Lyra",
  "Mira",
  "Nereid",
  "Orrery",
  "Pavo",
];

/* --------------------------------- helpers -------------------------------- */
const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const mulberry32 = (a) => () => {
  a |= 0;
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const spinRate = (r) => SPIN / (0.4 + r); // must match the GLSL below

let _glow, _ring;
function glowTex() {
  if (_glow) return _glow;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d");
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, "rgba(255,255,255,1)");
  gr.addColorStop(0.2, "rgba(255,255,255,.55)");
  gr.addColorStop(0.5, "rgba(255,255,255,.12)");
  gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr;
  g.fillRect(0, 0, 128, 128);
  return (_glow = new THREE.CanvasTexture(c));
}
function ringTex() {
  if (_ring) return _ring;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d");
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, "rgba(255,255,255,0)");
  gr.addColorStop(0.7, "rgba(255,255,255,0)");
  gr.addColorStop(0.88, "rgba(255,255,255,.9)");
  gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr;
  g.fillRect(0, 0, 128, 128);
  return (_ring = new THREE.CanvasTexture(c));
}

/* ------------------------------ universe data ----------------------------- */
function buildUniverse() {
  const rnd = mulberry32(11);
  const randn = () => Math.sqrt(-2 * Math.log(rnd() + 1e-9)) * Math.cos(6.2831853 * rnd());
  const dir = () => new THREE.Vector3(randn(), randn(), randn()).normalize();

  const galaxies = [];
  for (let tries = 0; galaxies.length < GALAXIES && tries < 4000; tries++) {
    const c = new THREE.Vector3(randn(), randn() * 0.7, randn()).multiplyScalar(4.5);
    if (c.length() > 10 || galaxies.some((o) => o.center.distanceTo(c) < 4.8)) continue;
    const spiral = rnd() < 0.72;
    galaxies.push({
      id: galaxies.length,
      center: c,
      axis: dir(),
      spiral,
      R: spiral ? 1.3 + rnd() * 1.0 : 0.9 + rnd() * 0.6,
      arms: rnd() < 0.35 ? 3 : 2,
      twist: 3.5 + rnd() * 3,
      tint: new THREE.Color().setHSL(spiral ? 0.6 : 0.08, 0.55, 0.65),
      name: NAMES[galaxies.length % NAMES.length],
      billions: Math.round(40 + rnd() * 260),
    });
  }
  const g = galaxies.length;
  const N = g * PER + DUST;
  const A = {
    cloud: new Float32Array(N * 3),
    local: new Float32Array(N * 3),
    axis: new Float32Array(N * 3),
    center: new Float32Array(N * 3),
    color: new Float32Array(N * 3),
    attr: new Float32Array(N * 4), // seed, radius, galaxyId, size
  };
  const Y = new THREE.Vector3(0, 1, 0);
  galaxies.forEach((G) => (G.q = new THREE.Quaternion().setFromUnitVectors(Y, G.axis)));
  const v = new THREE.Vector3(),
    d = new THREE.Vector3(),
    col = new THREE.Color();
  const blue = new THREE.Color(0.55, 0.72, 1);

  for (let i = 0; i < N; i++) {
    const o = i * 3;
    if (i < g * PER) {
      const gid = i % g,
        G = galaxies[gid],
        R = G.R;
      let x, y, z, r;
      if (G.spiral) {
        if (rnd() < 0.22) {
          // bulge
          x = randn() * 0.2 * R;
          y = randn() * 0.15 * R;
          z = randn() * 0.2 * R;
          col.setRGB(1, 0.82, 0.55);
        } else {
          // spiral arms
          const t = Math.pow(rnd(), 0.7),
            rr = t * R;
          const arm = Math.floor(rnd() * G.arms);
          const a = (arm * 6.2831853) / G.arms + t * G.twist + randn() * 0.3 * (1.15 - 0.6 * t);
          x = Math.cos(a) * rr;
          z = Math.sin(a) * rr;
          y = randn() * 0.045 * R * (1.2 - t);
          if (rnd() < 0.05) col.setRGB(1, 0.45, 0.65);
          else col.setRGB(1, 0.85, 0.6).lerp(blue, Math.min(1, t * 1.3));
        }
        r = Math.hypot(x, z);
      } else {
        // elliptical
        x = randn() * 0.55 * R;
        y = randn() * 0.4 * R;
        z = randn() * 0.5 * R;
        col.setRGB(1, 0.7, 0.42);
        r = 0.6 * R;
      }
      col.multiplyScalar(0.6 + rnd() * 0.8);
      v.set(x, y, z).applyQuaternion(G.q);
      d.copy(dir())
        .multiplyScalar(Math.sqrt(rnd()) * 4.5)
        .add(G.center); // proto-galaxy overdensity
      A.local.set([v.x, v.y, v.z], o);
      A.axis.set([G.axis.x, G.axis.y, G.axis.z], o);
      A.center.set([G.center.x, G.center.y, G.center.z], o);
      A.cloud.set([d.x, d.y, d.z], o);
      A.color.set([col.r, col.g, col.b], o);
      A.attr.set([rnd(), r, gid, 0.03 + 0.08 * Math.pow(rnd(), 4)], i * 4);
    } else {
      // intergalactic dust
      d.copy(dir()).multiplyScalar(13 * Math.cbrt(rnd()));
      A.local.set([d.x, d.y, d.z], o);
      A.cloud.set([d.x, d.y, d.z], o);
      A.axis.set([0, 1, 0], o);
      A.color.set([0.14, 0.18, 0.3], o);
      A.attr.set([rnd(), 0, -1, 0.025 + 0.03 * rnd()], i * 4);
    }
  }
  return { galaxies, g, N, ...A };
}

// CPU twin of the vertex shader's rotation, so supernovae ride along with their galaxy.
const _a = new THREE.Vector3();
function starWorld(U, i, time, out) {
  const o = i * 3;
  out.set(U.local[o], U.local[o + 1], U.local[o + 2]);
  _a.set(U.axis[o], U.axis[o + 1], U.axis[o + 2]);
  out.applyAxisAngle(_a, time * spinRate(U.attr[i * 4 + 1]));
  out.x += U.center[o];
  out.y += U.center[o + 1];
  out.z += U.center[o + 2];
  return out;
}

/* --------------------------------- shaders -------------------------------- */
const VERT = /* glsl */ `
  const float SPIN = ${SPIN.toFixed(3)};
  uniform float uProg, uTime, uScale, uSel, uHover, uTwinkle;
  attribute vec3 aLocal, aAxis, aCenter, aColor;
  attribute vec4 aData;
  varying vec3 vColor;
  varying float vAlpha;

  float sm(float a, float b, float x){ float t = clamp((x-a)/(b-a),0.,1.); return t*t*(3.-2.*t); }
  vec3 rot(vec3 p, vec3 k, float a){
    float c = cos(a), s = sin(a);
    return p*c + cross(k,p)*s + k*dot(k,p)*(1.-c);
  }

  void main(){
    float seed = aData.x, r = aData.y, gid = aData.z, size = aData.w;

    // phase A: explosive expansion from a single point (varied per particle)
    float ex = 1. - pow(2., -10. * clamp(uProg / (0.22 + 0.1*seed), 0., 1.));
    vec3 cloud = position * ex;

    // phase B: gravitational collapse into rotating galaxies
    float col = sm(0.30, 0.92, uProg);
    float w = SPIN / (0.4 + r) * step(0., gid);
    vec3 gal = aCenter + rot(aLocal, aAxis, uTime * w);
    float swirl = col*(1.-col)*4.*(1. - clamp(length(position)/14., 0., 1.));
    cloud = rot(cloud, vec3(0.,1.,0.), swirl);
    vec3 p = mix(cloud, gal, col);

    // temperature: white-hot -> ember -> cold dark -> starlight
    vec3 c = mix(vec3(1.,.96,.88), vec3(1.,.38,.1), sm(0.,.2,uProg));
    c = mix(c, vec3(.35,.06,.05), sm(.2,.42,uProg));
    c = mix(c, aColor, sm(.55,.9,uProg));
    float b = mix(2.2, .45, sm(0.,.3,uProg));
    b = mix(b, 1.0, sm(.6,.95,uProg));

    // interaction highlights
    float isSel = 1. - step(.5, abs(gid - uSel));
    float isHov = 1. - step(.5, abs(gid - uHover));
    float dim = uSel > -5. ? mix(.45, 1., isSel) : 1.;
    b *= dim * (1. + .9*isHov + .5*isSel);

    // twinkle (fades in once the galaxies exist)
    float tw = 1. - uTwinkle * .5 * (.5 + .5*sin(uTime*(1.5 + seed*5.) + seed*60.));

    vec4 mv = modelViewMatrix * vec4(p, 1.);
    gl_Position = projectionMatrix * mv;
    float s = size * mix(1.8, 1., sm(0.,.4,uProg)) * (1. + .35*isHov);
    gl_PointSize = clamp(s * uScale / -mv.z, 1., 28.);
    vColor = c;
    vAlpha = b * tw * .9;
  }
`;
const FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main(){
    float d = length(gl_PointCoord - .5);
    if (d > .5) discard;
    float f = pow(1. - d*2., 2.);
    gl_FragColor = vec4(vColor, f * vAlpha);
  }
`;

/* -------------------------------- components ------------------------------ */
function Cosmos({ U, intro, selected, hovered }) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
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
        },
      }),
    [],
  );
  useFrame(({ clock, size, camera, gl }) => {
    const u = mat.uniforms,
      p = intro.current.prog;
    u.uTime.value = clock.elapsedTime;
    u.uProg.value = p;
    u.uTwinkle.value = smooth(0.92, 1, p);
    u.uScale.value =
      (size.height * gl.getPixelRatio()) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2));
    u.uSel.value = selected ?? NONE;
    u.uHover.value = hovered ?? NONE;
  });
  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[U.cloud, 3]} />
        <bufferAttribute attach="attributes-aLocal" args={[U.local, 3]} />
        <bufferAttribute attach="attributes-aAxis" args={[U.axis, 3]} />
        <bufferAttribute attach="attributes-aCenter" args={[U.center, 3]} />
        <bufferAttribute attach="attributes-aColor" args={[U.color, 3]} />
        <bufferAttribute attach="attributes-aData" args={[U.attr, 4]} />
      </bufferGeometry>
      <primitive object={mat} attach="material" />
    </points>
  );
}

function Director({ intro, phase, onDone, onEpoch }) {
  const ep = useRef(-1);
  useFrame((_, dt) => {
    if (phase !== "intro") return;
    const s = intro.current;
    s.t += Math.min(dt, 0.1) * (s.skip ? 10 : 1);
    s.prog = Math.min(1, s.t / DURATION);
    let e = 0;
    EPOCHS.forEach(([p], i) => {
      if (s.prog >= p) e = i;
    });
    if (e !== ep.current) {
      ep.current = e;
      onEpoch(e);
    }
    if (s.prog >= 1) onDone();
  });
  return null;
}

function BigBangFlash({ intro }) {
  const ref = useRef();
  useFrame(() => {
    const p = intro.current.prog,
      s = ref.current;
    s.visible = p < 0.25;
    const k = Math.min(p / 0.18, 1);
    s.scale.setScalar(1 + 30 * (1 - Math.pow(1 - k, 3)));
    s.material.opacity = 1 - smooth(0, 0.18, p);
  });
  return (
    <sprite ref={ref}>
      <spriteMaterial
        map={glowTex()}
        color={new THREE.Color(3, 2.8, 2.4)}
        blending={THREE.AdditiveBlending}
        transparent
        depthWrite={false}
        depthTest={false}
      />
    </sprite>
  );
}

function CameraRig({ intro, phase, selected, U }) {
  const { camera } = useThree();
  const controls = useThree((s) => s.controls);
  const fly = useRef(null);
  const first = useRef(true);

  useFrame((_, dt) => {
    if (phase === "intro") {
      const p = intro.current.prog;
      const e = smooth(0, 1, Math.pow(p, 0.8));
      const d = 7 + 23 * e,
        a = p * 1.4 + 0.3;
      camera.position.set(Math.sin(a) * d, d * 0.26, Math.cos(a) * d);
      camera.lookAt(0, 0, 0);
      return;
    }
    const f = fly.current;
    if (!f || !controls) return;
    f.t = Math.min(1, f.t + dt / 1.8);
    const e = f.t < 0.5 ? 4 * f.t ** 3 : 1 - Math.pow(-2 * f.t + 2, 3) / 2;
    camera.position.lerpVectors(f.p0, f.p1, e);
    controls.target.lerpVectors(f.t0, f.t1, e);
    controls.update();
    if (f.t >= 1) {
      fly.current = null;
      controls.enabled = true;
    }
  });

  useEffect(() => {
    if (phase !== "explore" || !controls) return;
    if (first.current) {
      first.current = false;
      if (selected === null) return;
    }
    const G = selected === null ? null : U.galaxies[selected];
    const target = G ? G.center.clone() : new THREE.Vector3();
    const dist = G ? G.R * 3.4 : 30;
    const dir = camera.position.clone().sub(target).normalize();
    controls.enabled = false;
    fly.current = {
      t: 0,
      p0: camera.position.clone(),
      p1: target.clone().addScaledVector(dir, dist),
      t0: controls.target.clone(),
      t1: target,
    };
  }, [selected, phase, controls]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

function Marker({ g, active, selected, hovered, onHover, onSelect }) {
  const sprite = useRef();
  const level = useRef(0);
  const isSel = selected === g.id,
    isHov = hovered === g.id;
  useFrame(({ clock }, dt) => {
    const target = !active
      ? 0
      : isSel
        ? 0.22 + 0.06 * Math.sin(clock.elapsedTime * 2.5)
        : isHov
          ? 0.38
          : 0.14;
    level.current += (target - level.current) * Math.min(1, dt * 4);
    sprite.current.material.opacity = level.current;
  });
  return (
    <group position={g.center}>
      <sprite ref={sprite} scale={[g.R * 3, g.R * 3, 1]}>
        <spriteMaterial
          map={glowTex()}
          color={g.tint}
          blending={THREE.AdditiveBlending}
          transparent
          depthWrite={false}
          depthTest={false}
          opacity={0}
        />
      </sprite>
      {active && (
        <mesh
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover(g.id);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            onHover(null);
            document.body.style.cursor = "auto";
          }}
          onClick={(e) => {
            if (e.delta > 5) return;
            e.stopPropagation();
            onSelect(g.id);
          }}
        >
          <sphereGeometry args={[g.R * 1.15, 16, 16]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
        </mesh>
      )}
      {active && (isHov || isSel) && (
        <Html position={[0, g.R * 1.3, 0]} center style={{ pointerEvents: "none" }}>
          <div style={styles.tag}>{g.name}</div>
        </Html>
      )}
    </group>
  );
}

const FLASH = new THREE.Color(3, 3.2, 4);
const SHOCK = new THREE.Color(0.9, 1.3, 2.2);
function Supernovae({ U, active, selected }) {
  const SLOTS = 8;
  const slots = useRef(
    Array.from({ length: SLOTS }, () => ({ on: false, age: 0, star: 0, life: 4 })),
  );
  const flashes = useRef([]),
    rings = useRef([]);
  const next = useRef(1.5);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }, dt) => {
    if (!active) return;
    next.current -= dt;
    if (next.current <= 0) {
      const s = slots.current.find((x) => !x.on);
      if (s) {
        const gal = selected !== null ? selected : Math.floor(Math.random() * U.g);
        s.on = true;
        s.age = 0;
        s.life = 3.5 + Math.random() * 2;
        s.star = gal + U.g * Math.floor(Math.random() * PER);
      }
      next.current = selected !== null ? 0.7 + Math.random() * 1.5 : 1.6 + Math.random() * 3;
    }
    slots.current.forEach((s, i) => {
      const f = flashes.current[i],
        r = rings.current[i];
      if (!f || !r) return;
      if (!s.on) {
        f.visible = r.visible = false;
        return;
      }
      s.age += dt;
      const u = s.age / s.life;
      if (u >= 1) {
        s.on = false;
        f.visible = r.visible = false;
        return;
      }
      starWorld(U, s.star, clock.elapsedTime, tmp);
      f.visible = r.visible = true;
      f.position.copy(tmp);
      r.position.copy(tmp);
      f.scale.setScalar(0.3 + 0.8 * (1 - Math.pow(1 - Math.min(u * 2.5, 1), 3)));
      f.material.opacity = Math.min(u / 0.06, 1) * Math.pow(1 - u, 2.2);
      r.scale.setScalar(0.15 + 2.2 * (1 - Math.pow(1 - u, 3)));
      r.material.opacity = 0.7 * Math.pow(1 - u, 1.5);
    });
  });

  return Array.from({ length: SLOTS }, (_, i) => (
    <group key={i}>
      <sprite ref={(el) => (flashes.current[i] = el)} visible={false}>
        <spriteMaterial
          map={glowTex()}
          color={FLASH}
          blending={THREE.AdditiveBlending}
          transparent
          depthWrite={false}
          depthTest={false}
        />
      </sprite>
      <sprite ref={(el) => (rings.current[i] = el)} visible={false}>
        <spriteMaterial
          map={ringTex()}
          color={SHOCK}
          blending={THREE.AdditiveBlending}
          transparent
          depthWrite={false}
          depthTest={false}
        />
      </sprite>
    </group>
  ));
}

function Scene({ U, intro, phase, onDone, onEpoch, selected, hovered, setSelected, setHovered }) {
  const explore = phase === "explore";
  return (
    <>
      <color attach="background" args={["#000"]} />
      <Director intro={intro} phase={phase} onDone={onDone} onEpoch={onEpoch} />
      <CameraRig intro={intro} phase={phase} selected={selected} U={U} />
      <BigBangFlash intro={intro} />
      <Cosmos U={U} intro={intro} selected={selected} hovered={hovered} />
      {U.galaxies.map((g) => (
        <Marker
          key={g.id}
          g={g}
          active={explore}
          selected={selected}
          hovered={hovered}
          onHover={setHovered}
          onSelect={setSelected}
        />
      ))}
      {explore && (
        <>
          <Supernovae U={U} active selected={selected} />
          <Stars radius={90} depth={40} count={2500} factor={4} fade speed={1} />
        </>
      )}
      <OrbitControls
        makeDefault
        enabled={explore}
        enablePan={false}
        enableDamping
        dampingFactor={0.06}
        minDistance={1.5}
        maxDistance={45}
        autoRotate={selected !== null}
        autoRotateSpeed={0.6}
      />
      <EffectComposer multisampling={0}>
        <Bloom
          mipmapBlur
          intensity={1.1}
          luminanceThreshold={0.15}
          luminanceSmoothing={0.4}
          radius={0.8}
        />
        <Vignette eskil={false} offset={0.2} darkness={0.7} />
      </EffectComposer>
    </>
  );
}

/* ----------------------------------- HUD ---------------------------------- */
const serif = "'Iowan Old Style','Palatino Linotype',Palatino,Georgia,serif";
const sans = "system-ui,-apple-system,'Segoe UI',sans-serif";
const styles = {
  root: {
    position: "relative",
    width: "100%",
    height: "100vh",
    background: "#000",
    overflow: "hidden",
    color: "#e9e4d8",
    fontFamily: sans,
  },
  epoch: {
    position: "absolute",
    left: "6vw",
    bottom: "9vh",
    maxWidth: 440,
    pointerEvents: "none",
    animation: "uvFade 1.4s ease both",
  },
  title: {
    fontFamily: serif,
    fontWeight: 400,
    fontSize: "clamp(30px,4.6vw,56px)",
    lineHeight: 1.05,
    margin: 0,
    letterSpacing: "-0.01em",
  },
  when: { margin: "10px 0 2px", fontSize: 15, color: "#ffb36b" },
  note: { margin: 0, fontSize: 15, lineHeight: 1.5, color: "#a9a396" },
  btn: {
    position: "absolute",
    background: "rgba(255,255,255,.06)",
    border: "1px solid rgba(255,255,255,.18)",
    color: "#e9e4d8",
    borderRadius: 999,
    padding: "8px 16px",
    fontSize: 14,
    cursor: "pointer",
    backdropFilter: "blur(6px)",
  },
  panel: {
    position: "absolute",
    right: "4vw",
    top: "50%",
    transform: "translateY(-50%)",
    width: 270,
    padding: "22px 22px 20px",
    background: "rgba(8,10,18,.62)",
    border: "1px solid rgba(255,255,255,.12)",
    borderRadius: 14,
    backdropFilter: "blur(10px)",
    animation: "uvFade .6s ease both",
  },
  tag: {
    fontFamily: serif,
    fontSize: 15,
    padding: "3px 10px",
    borderRadius: 6,
    background: "rgba(8,10,18,.7)",
    border: "1px solid rgba(255,255,255,.15)",
    color: "#f1ece0",
    whiteSpace: "nowrap",
  },
  hint: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: "4vh",
    textAlign: "center",
    fontSize: 14,
    color: "#8f8a7e",
    pointerEvents: "none",
    animation: "uvFade 1.2s ease both",
  },
};

function Experience({ onReplay }) {
  const U = useMemo(() => buildUniverse(), []);
  const intro = useRef({ t: 0, prog: 0, skip: false });
  const [phase, setPhase] = useState("intro");
  const [epoch, setEpoch] = useState(0);
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setSelected(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const G = selected !== null ? U.galaxies[selected] : null;
  const E = EPOCHS[epoch];

  return (
    <div style={styles.root}>
      <style>{`@keyframes uvFade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        @media (prefers-reduced-motion: reduce){*{animation:none!important}}`}</style>
      <Canvas
        camera={{ position: [0, 2, 7], fov: 50, near: 0.1, far: 400 }}
        dpr={[1, 2]}
        gl={{ antialias: false, powerPreference: "high-performance" }}
      >
        <Scene
          U={U}
          intro={intro}
          phase={phase}
          onDone={() => setPhase("explore")}
          onEpoch={setEpoch}
          selected={selected}
          hovered={hovered}
          setSelected={setSelected}
          setHovered={setHovered}
        />
      </Canvas>

      {phase === "intro" && (
        <>
          <div key={epoch} style={styles.epoch}>
            <h2 style={styles.title}>{E[1]}</h2>
            <p style={styles.when}>{E[2]}</p>
            <p style={styles.note}>{E[3]}</p>
          </div>
          <button
            style={{ ...styles.btn, right: "4vw", top: "4vh" }}
            onClick={() => (intro.current.skip = true)}
          >
            Skip intro
          </button>
        </>
      )}

      {phase === "explore" && !G && (
        <>
          <div style={styles.hint}>Click a galaxy to fly in. Drag to orbit, scroll to zoom.</div>
          <button style={{ ...styles.btn, left: "4vw", top: "4vh" }} onClick={onReplay}>
            Replay the beginning
          </button>
        </>
      )}

      {G && (
        <>
          <button
            style={{ ...styles.btn, left: "4vw", top: "4vh" }}
            onClick={() => setSelected(null)}
          >
            Back to the cosmos
          </button>
          <aside style={styles.panel}>
            <h3 style={{ ...styles.title, fontSize: 28 }}>{G.name}</h3>
            <p style={styles.when}>
              {G.spiral ? `Spiral galaxy, ${G.arms} arms` : "Elliptical galaxy"}
            </p>
            <p style={styles.note}>
              About {G.billions} billion stars (this model draws {Math.round(PER).toLocaleString()}{" "}
              of them). Stars near the core orbit faster than those at the rim, which is why the
              arms wind up over time.
            </p>
          </aside>
        </>
      )}
    </div>
  );
}

export default function UniverseSimulation() {
  const [run, setRun] = useState(0);
  return <Experience key={run} onReplay={() => setRun((r) => r + 1)} />;
}
