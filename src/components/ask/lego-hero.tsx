"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { MotionConfig, motion, useSpring } from "motion/react";
import { useLayoutEffect, useRef, type PointerEvent as ReactPointerEvent } from "react";
import gsap from "gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { LEGO_COLORS, LegoStuds, brickStyle, type LegoColor } from "./lego-brick";

const LegoScene = dynamic(() => import("./lego-scene"), {
  ssr: false,
  loading: () => <div className="lego-scene-fallback" aria-hidden />,
});

const facts: Array<{ value: string; label: string; color: LegoColor }> = [
  { value: "20+", label: "projects", color: "blue" },
  { value: "5", label: "hackathon wins", color: "red" },
  { value: "7", label: "skill groups", color: "yellow" },
  { value: "6", label: "leadership roles", color: "green" },
];

export function LegoHero() {
  const rootRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const rotateX = useSpring(0, { stiffness: 160, damping: 18 });
  const rotateY = useSpring(0, { stiffness: 160, damping: 18 });

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const context = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });

      timeline
        .from(".lego-hero__avatar", {
          y: 36,
          rotate: -2,
          opacity: 0,
          duration: 0.9,
        })
        .from(
          ".lego-hero__eyebrow, .lego-hero__title, .lego-hero__lede",
          {
            y: 22,
            opacity: 0,
            duration: 0.7,
            stagger: 0.08,
          },
          "-=0.6",
        )
        .from(".lego-hero__facts", { y: 16, opacity: 0, duration: 0.55 }, "-=0.35")
        .from(".lego-hero__cta-row", { y: 12, opacity: 0, duration: 0.5 }, "-=0.3")
        .from(".lego-hero__scene-column", { y: 24, opacity: 0, duration: 0.8 }, "-=0.55");
    }, rootRef);

    return () => context.revert();
  }, []);

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (reduced || event.pointerType !== "mouse") return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    rotateX.set(y * -8);
    rotateY.set(x * 8);
  }

  function resetTilt() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <MotionConfig reducedMotion="user">
      <section ref={rootRef} className="lego-hero lego-band" aria-labelledby="brick-hero-title">
        <div className="lego-hero__grid">
          <div className="lego-hero__avatar">
            <motion.div
              className="lego-avatar-card"
              style={{
                rotateX,
                rotateY,
                transformPerspective: 1000,
              }}
              onPointerMove={handlePointerMove}
              onPointerLeave={resetTilt}
            >
              <div className="lego-avatar-card__studs" aria-hidden>
                {Array.from({ length: 4 }, (_, index) => (
                  <span key={index} className="lego-avatar-card__stud" />
                ))}
              </div>

              <div className="lego-avatar-card__image">
                <Image
                  src="/ask/lego-avatar.webp"
                  alt="LEGO minifigure portrait of Ibtasaam Amjad"
                  width={720}
                  height={897}
                  priority
                  sizes="(min-width: 1200px) 340px, (min-width: 900px) 300px, 76vw"
                  className="h-full w-full object-cover object-top"
                />
                <div className="lego-avatar-card__glare" aria-hidden />
              </div>

              <div className="lego-avatar-card__plate">
                <div>
                  <p className="lego-avatar-card__name">BRICK</p>
                  <p className="lego-avatar-card__role">LEGO GUIDE</p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="lego-hero__copy">
            <p className="lego-kicker lego-hero__eyebrow">
              <span className="lego-live-dot" />
              SET 003 · LEGO GUIDE
            </p>

            <h2 id="brick-hero-title" className="lego-hero__title">
              I&apos;m <span>Brick.</span>
            </h2>

            <p className="lego-hero__lede">
              Ibtasaam&apos;s LEGO guide. Ask me about his work, projects, skills, or experience. I
              pull the right pieces from his public story and snap them into an answer.
            </p>

            <ul className="lego-hero__facts">
              {facts.map((fact) => (
                <li key={fact.label}>
                  <span
                    className="lego-fact__stud"
                    style={{ background: LEGO_COLORS[fact.color] }}
                    aria-hidden
                  />
                  <strong>{fact.value}</strong>
                  <span>{fact.label}</span>
                </li>
              ))}
            </ul>

            <div className="lego-hero__cta-row">
              <a
                href="#ask-input"
                className="lego-hero__cta"
                style={brickStyle("yellow")}
                onClick={() => {
                  window.setTimeout(() => {
                    document.getElementById("ask-input")?.focus({ preventScroll: true });
                  }, 300);
                }}
              >
                <LegoStuds count={3} />
                <span>Start building</span>
                <span aria-hidden>↓</span>
              </a>
              <span className="lego-hero__hint">Or jump to the brick lab below.</span>
            </div>
          </div>

          <div className="lego-hero__scene-column" aria-hidden>
            <div className="lego-hero__scene">
              <LegoScene />
            </div>
            <div className="lego-hero__scene-label">
              <span className="lego-kicker">SET 003</span>
              <span>The guide, in pieces</span>
            </div>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
