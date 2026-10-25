"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import { useMinecraftAudio, type MinecraftAudio } from "@/components/hero/use-minecraft-audio";

const AudioPlayerContext = createContext<MinecraftAudio | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
  const audio = useMinecraftAudio();
  const pathname = usePathname();
  const autoplayAttempted = useRef(false);
  const { startBackground } = audio;

  useEffect(() => {
    if (pathname !== "/") {
      autoplayAttempted.current = false;
      return;
    }

    if (autoplayAttempted.current) return;
    autoplayAttempted.current = true;
    startBackground();
  }, [pathname, startBackground]);

  return <AudioPlayerContext.Provider value={audio}>{children}</AudioPlayerContext.Provider>;
}

export function useAudio() {
  const audio = useContext(AudioPlayerContext);

  if (!audio) {
    throw new Error("useAudio must be used within AudioProvider");
  }

  return audio;
}
