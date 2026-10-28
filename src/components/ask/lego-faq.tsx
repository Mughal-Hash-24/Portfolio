"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LEGO_COLORS, type LegoColor } from "./lego-brick";

type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

const manualColors: LegoColor[] = ["yellow", "red", "blue", "green"];

export function LegoFaq({ faqs }: { faqs: FaqItem[] }) {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      gsap.from(".lego-manual", {
        y: 22,
        opacity: 0,
        duration: 0.65,
        stagger: 0.06,
        ease: "power3.out",
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top 92%",
          once: true,
        },
      });
    }, rootRef);

    return () => context.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      id="faq"
      className="lego-manuals lego-band"
      aria-labelledby="ask-faq-heading"
    >
      <div className="lego-manuals__head">
        <div>
          <p className="lego-kicker">Spare parts · always available</p>
          <h2 id="ask-faq-heading" className="lego-manuals__title">
            Instruction manuals
          </h2>
          <p className="lego-manuals__lede">
            Brick is an AI guide, so these are the always-available answers. If the build is busy or
            the API is unavailable, start here.
          </p>
        </div>
        <div className="lego-manuals__meta">
          <p className="lego-manuals__count">{faqs.length} answers</p>
          <p className="lego-kicker">No API required</p>
        </div>
      </div>

      <div className="lego-manuals__grid">
        {faqs.map((faq, index) => (
          <details
            key={faq.id}
            className="lego-manual"
            style={
              {
                "--manual-color": LEGO_COLORS[manualColors[index % manualColors.length]],
              } as CSSProperties
            }
          >
            <summary className="lego-manual__summary">
              <span className="lego-manual__number">{String(index + 1).padStart(2, "0")}</span>
              <span className="lego-manual__question">{faq.question}</span>
              <span className="lego-manual__toggle" aria-hidden>
                +
              </span>
            </summary>
            <p className="lego-manual__answer">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
