"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getChatBuildScrollTop } from "@/lib/ask/scroll-to-build";
import { AskChat } from "./ask-chat";

type ChatExperienceProps = {
  suggestedQuestions: string[];
  contactEmail: string;
};

export function ChatExperience({ suggestedQuestions, contactEmail }: ChatExperienceProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      gsap.set(".chat-build__hud", { autoAlpha: 1 });
      gsap.set(".lego-chat--stage", { autoAlpha: 0.7, scale: 0.985 });
      gsap.set(".lego-chat__header", { y: -64, autoAlpha: 0 });
      gsap.set(".lego-tray__title, .lego-tray__hint", { autoAlpha: 0 });
      gsap.set(".lego-tray__brick", { x: -70, autoAlpha: 0, rotate: -5 });
      gsap.set(".lego-dock", { y: 80, autoAlpha: 0, scale: 0.94 });
      gsap.set(".lego-empty__mark", {
        scale: 0.4,
        autoAlpha: 0,
        rotate: -15,
      });
      gsap.set(".lego-empty__title, .lego-empty__lede", {
        y: 20,
        autoAlpha: 0,
      });
      gsap.set(".lego-starter", { y: 24, autoAlpha: 0 });
      gsap.set(".lego-disclaimer", { autoAlpha: 0 });
      gsap.set(".chat-build__progress span", { scaleX: 0 });

      const timeline = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: {
          trigger: wrapper,
          start: "top 85%",
          end: "bottom bottom",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      timeline
        .to(".lego-chat--stage", { autoAlpha: 1, scale: 1, duration: 0.4, ease: "power2.out" }, 0)
        .to(".lego-chat__header", { y: 0, autoAlpha: 1, duration: 0.4 }, 0.04)
        .to(".lego-tray__title, .lego-tray__hint", { autoAlpha: 1, duration: 0.2 }, 0.1)
        .to(
          ".lego-tray__brick",
          { x: 0, autoAlpha: 1, rotate: 0, duration: 0.3, stagger: 0.04 },
          0.12,
        )
        .to(".lego-dock", { y: 0, autoAlpha: 1, scale: 1, duration: 0.4 }, 0.18)
        .to(
          ".lego-empty__mark",
          {
            scale: 1,
            autoAlpha: 1,
            rotate: 0,
            duration: 0.3,
            ease: "back.out(1.5)",
          },
          0.26,
        )
        .to(
          ".lego-empty__title, .lego-empty__lede",
          { y: 0, autoAlpha: 1, duration: 0.25, stagger: 0.05 },
          0.32,
        )
        .to(".lego-starter", { y: 0, autoAlpha: 1, duration: 0.25, stagger: 0.035 }, 0.4)
        .to(".lego-disclaimer", { autoAlpha: 1, duration: 0.2 }, 0.5)
        .to(".chat-build__hud", { autoAlpha: 0, duration: 0.2 }, 0.56)
        .to(
          ".chat-build__progress span",
          { scaleX: 1, duration: 0.08, stagger: 0.035, ease: "none" },
          0,
        )
        .set({}, {}, 1);
    }, stageRef);

    return () => context.revert();
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let timer: number | undefined;

    function handleScrollEnd() {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const wrapper = wrapperRef.current;
        const target = getChatBuildScrollTop();
        if (!wrapper || target === null) return;

        const viewport = window.innerHeight;
        const wrapperTop = wrapper.getBoundingClientRect().top + window.scrollY;
        const start = wrapperTop - viewport * 0.85;
        const end = wrapperTop + wrapper.offsetHeight - viewport;
        const progress = (window.scrollY - start) / (end - start);

        if (progress > 0.55 && progress < 0.95 && Math.abs(window.scrollY - target) > 4) {
          window.scrollTo({ top: target, behavior: "smooth" });
        }
      }, 220);
    }

    window.addEventListener("scroll", handleScrollEnd, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", handleScrollEnd);
    };
  }, []);

  return (
    <div ref={wrapperRef} id="ask-brick" className="chat-build">
      <div ref={stageRef} className="chat-build__stage">
        <div className="chat-build__hud" aria-hidden>
          <span className="lego-kicker">Assembling Brick</span>
          <span className="chat-build__progress" aria-hidden>
            {Array.from({ length: 8 }, (_, index) => (
              <span key={index} />
            ))}
          </span>
        </div>
        <div className="chat-build__chat">
          <AskChat
            suggestedQuestions={suggestedQuestions}
            contactEmail={contactEmail}
            variant="stage"
          />
        </div>
      </div>
    </div>
  );
}
