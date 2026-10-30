import type { Metadata } from "next";
import { UniverseStage } from "@/components/experiments/universe-stage";

export const metadata: Metadata = {
  title: "Universe",
  description:
    "An interactive simulation of the universe, from the Big Bang through the first galaxies.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function UniversePage() {
  return <UniverseStage />;
}
