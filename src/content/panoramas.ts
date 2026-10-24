export type PanoramaSet = {
  id: string;
  label: string;
  faces: string[];
};

// Three.js expects right, left, top, bottom, front, back.
const THREE_CUBE_FACE_ORDER = [1, 3, 4, 5, 0, 2] as const;
const PANORAMA_VERSION = "1";

function faceUrls(base: string) {
  return THREE_CUBE_FACE_ORDER.map((face) => `${base}/panorama_${face}.webp?v=${PANORAMA_VERSION}`);
}

function panoramaSet(id: string, label: string): PanoramaSet {
  return {
    id,
    label,
    faces: faceUrls(`/panoramas/${id}`),
  };
}

export const panoramaSets: PanoramaSet[] = [
  panoramaSet("classic", "Classic"),
  panoramaSet("cherry-grove", "Cherry Grove"),
  panoramaSet("bees", "Bees"),
  panoramaSet("amethyst-geode", "Amethyst Geode"),
  panoramaSet("happy-ghasts", "Happy Ghasts"),
  panoramaSet("lakeside-sunset", "Lakeside Sunset"),
  panoramaSet("mangrove-swamp", "Mangrove Swamp"),
  panoramaSet("nether", "Nether"),
  panoramaSet("nostalgia", "Nostalgia"),
  panoramaSet("ocean", "Ocean"),
  panoramaSet("oceanside-extreme-hills", "Oceanside Extreme Hills"),
  panoramaSet("pale-garden", "Pale Garden"),
  panoramaSet("spring-to-life", "Spring to Life"),
  panoramaSet("sunset-valley", "Sunset Valley"),
  panoramaSet("the-end", "The End"),
  panoramaSet("trial-chamber", "Trial Chamber"),
  panoramaSet("underground-lava-pool", "Underground Lava Pool"),
  panoramaSet("village", "Village"),
  panoramaSet("pack", "Pack"),
];

// Add licensed or self-captured sets here with images under /panoramas/<id>/.
export const customPanoramaSets: PanoramaSet[] = [];

export const availablePanoramas = [...customPanoramaSets, ...panoramaSets];

export const defaultPanoramaId = availablePanoramas[0]?.id ?? null;
