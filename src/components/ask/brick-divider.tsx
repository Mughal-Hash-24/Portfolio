"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LegoStuds, brickStyle, type LegoColor } from "./lego-brick";

const dividerColors: LegoColor[] = ["yellow", "red", "blue", "green", "orange"];

export function BrickDivider({ label }: { label?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      gsap.from(".lego-divider__brick", {
        y: 16,
        opacity: 0,
        rotate: -5,
        duration: 0.45,
        stagger: 0.035,
        ease: "power3.out",
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top 95%",
          once: true,
        },
      });
    }, rootRef);

    return () => context.revert();
  }, []);

  return (
    <div ref={rootRef} className="lego-divider">
      <div className="lego-divider__row" aria-hidden>
        {Array.from({ length: 12 }, (_, index) => (
          <span
            key={index}
            className="lego-divider__brick"
            style={brickStyle(dividerColors[index % dividerColors.length])}
          >
            <LegoStuds count={2} />
          </span>
        ))}
      </div>
      {label ? <p className="lego-divider__label">{label}</p> : null}
    </div>
  );
}
