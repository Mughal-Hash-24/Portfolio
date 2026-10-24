export type PanoramaSet = {
  id: string;
  label: string;
  faces: string[];
  devOnly?: boolean;
};

// Three.js expects right, left, top, bottom, front, back.
const THREE_CUBE_FACE_ORDER = [1, 3, 4, 5, 0, 2] as const;

function faceUrls(base: string) {
  return THREE_CUBE_FACE_ORDER.map((face) => `${base}/panorama_${face}.webp`);
}

function devSet(id: string, label: string): PanoramaSet {
  return {
    id,
    label,
    faces: faceUrls(`/panoramas/_dev/${id}`),
    devOnly: true,
  };
}

export const panoramaSets: PanoramaSet[] = [
  devSet("classic", "Classic"),
  devSet("cherry-grove", "Cherry Grove"),
  devSet("bees", "Bees"),
  devSet("amethyst-geode", "Amethyst Geode"),
  devSet("happy-ghasts", "Happy Ghasts"),
  devSet("lakeside-sunset", "Lakeside Sunset"),
  devSet("mangrove-swamp", "Mangrove Swamp"),
  devSet("nether", "Nether"),
  devSet("nostalgia", "Nostalgia"),
  devSet("ocean", "Ocean"),
  devSet("oceanside-extreme-hills", "Oceanside Extreme Hills"),
  devSet("pale-garden", "Pale Garden"),
  devSet("spring-to-life", "Spring to Life"),
  devSet("sunset-valley", "Sunset Valley"),
  devSet("the-end", "The End"),
  devSet("trial-chamber", "Trial Chamber"),
  devSet("underground-lava-pool", "Underground Lava Pool"),
  devSet("village", "Village"),
  devSet("pack", "Pack"),
];

// Add licensed or self-captured sets here with images under /panoramas/<id>/.
export const customPanoramaSets: PanoramaSet[] = [];

export const availablePanoramas =
  process.env.NODE_ENV === "production"
    ? customPanoramaSets
    : [...customPanoramaSets, ...panoramaSets];

export const defaultPanoramaId = availablePanoramas[0]?.id ?? null;
