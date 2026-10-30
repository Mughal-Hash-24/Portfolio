export type GalaxyTemplate =
  | "grand-design"
  | "flocculent"
  | "interacting"
  | "ring"
  | "elliptical"
  | "edge-on"
  | "barred"
  | "irregular";

export type UniverseProject = {
  id: string;
  name: string;
  tagline: string;
  stack: string[];
  href?: string;
};

export type UniverseDomain = {
  id: string;
  name: string;
  label: string;
  blurb: string;
  template: GalaxyTemplate;
  palette: {
    core: string;
    mid: string;
    rim: string;
    halo: string;
  };
  projects: UniverseProject[];
};

export type UniversePhase = {
  id: string;
  title: string;
  era: string;
  copy: string;
  duration: number;
  start: number;
  end: number;
};

type PhaseDefinition = Omit<UniversePhase, "start" | "end">;

const phaseDefinitions: PhaseDefinition[] = [
  {
    id: "singularity",
    title: "Initial Singularity",
    era: "13.8 billion years ago",
    copy: "All matter, energy, space, and time begin in a single point. There is no outside, no before — and no medium to carry the sound of an explosion.",
    duration: 6,
  },
  {
    id: "inflation",
    title: "Cosmic Inflation",
    era: "10⁻³² seconds",
    copy: "Space expands faster than light. Microscopic quantum fluctuations stretch into the seeds of every structure that will ever exist.",
    duration: 7,
  },
  {
    id: "nucleosynthesis",
    title: "Big Bang Nucleosynthesis",
    era: "10⁻⁶ seconds – 20 minutes",
    copy: "The universe is a quark–gluon plasma. As it cools, quarks bind into protons and neutrons, and the first hydrogen, helium, and trace lithium form.",
    duration: 10,
  },
  {
    id: "recombination",
    title: "CMB / Recombination",
    era: "380,000 years",
    copy: "Electrons finally bind to nuclei. Light escapes the fog and travels freely — the cosmic microwave background we still map today.",
    duration: 9,
  },
  {
    id: "dark-ages",
    title: "Cosmic Dark Ages",
    era: "380,000 – 200 million years",
    copy: "The first light fades. Neutral hydrogen fills the dark while gravity quietly pulls matter into filaments, halos, and the scaffolding of galaxies.",
    duration: 9,
  },
  {
    id: "first-stars",
    title: "Reionization / First Stars",
    era: "About 200 million years",
    copy: "The first stars ignite. Their ultraviolet light reionizes the hydrogen fog, and their supernovae scatter the first heavy elements into the dark.",
    duration: 9,
  },
  {
    id: "galaxy-formation",
    title: "Galaxy Formation",
    era: "About 1 billion years",
    copy: "Gas cools inside dark-matter halos and settles into rotating disks. Spiral arms, bars, rings, and elliptical galaxies take shape.",
    duration: 11,
  },
  {
    id: "dark-energy",
    title: "Accelerated Expansion",
    era: "About 9.8 billion years",
    copy: "Dark energy begins to dominate. The expansion of space accelerates, stretching the gaps between galaxies and reddening their light.",
    duration: 8,
  },
  {
    id: "present",
    title: "Present Day",
    era: "13.8 billion years",
    copy: "The universe is still expanding. Here, each galaxy is a domain of work, and every star belongs to a project.",
    duration: 6,
  },
];

let cursor = 0;
export const universePhases: UniversePhase[] = phaseDefinitions.map((phase) => {
  const start = cursor;
  cursor += phase.duration;
  return { ...phase, start, end: cursor };
});

export const universeDuration = cursor;
export const scoreStartOffset = 42.5;
export const scorePhaseStart = universePhases[1].start;
export const explorationPhase = universePhases.length - 1;

export function phaseIndexAt(elapsed: number) {
  if (elapsed >= universeDuration) return explorationPhase;

  for (let index = universePhases.length - 1; index >= 0; index -= 1) {
    if (elapsed >= universePhases[index].start) return index;
  }

  return 0;
}

export const cameraKeyframes = [
  { at: 0, radius: 5, height: 0.5, angle: 0.2, fov: 50, target: [0, 0, 0] },
  { at: 0.06, radius: 6, height: 1, angle: 0.45, fov: 52, target: [0, 0, 0] },
  { at: 0.11, radius: 16, height: 5, angle: 0.8, fov: 55, target: [0, 0, 0] },
  { at: 0.18, radius: 10, height: 3, angle: 1.2, fov: 52, target: [0, 0, 0] },
  { at: 0.23, radius: 4.8, height: 1.4, angle: 1.65, fov: 44, target: [0.5, 0.2, 0] },
  { at: 0.3, radius: 7.5, height: 2.2, angle: 2, fov: 48, target: [0, 0, 0] },
  { at: 0.35, radius: 19, height: 4.5, angle: 2.4, fov: 55, target: [0, 0, 0] },
  { at: 0.43, radius: 24, height: 6, angle: 2.9, fov: 56, target: [0, 0, 0] },
  { at: 0.54, radius: 34, height: 8, angle: 3.4, fov: 58, target: [0, 0, 0] },
  { at: 0.6, radius: 22, height: 5, angle: 3.8, fov: 52, target: [0, 0, 0] },
  { at: 0.67, radius: 17, height: 4, angle: 4.1, fov: 48, target: [0, 0, 0] },
  { at: 0.74, radius: 11, height: 2.6, angle: 4.4, fov: 44, target: [0, 0, 0] },
  { at: 0.8, radius: 13, height: 3, angle: 4.7, fov: 46, target: [0, 0, 0] },
  { at: 0.87, radius: 26, height: 7, angle: 5.1, fov: 54, target: [0, 0, 0] },
  { at: 0.92, radius: 36, height: 9, angle: 5.5, fov: 58, target: [0, 0, 0] },
  { at: 1, radius: 34, height: 9, angle: 5.9, fov: 56, target: [4.5, -5.5, 0] },
] as const;

export type CameraKeyframe = (typeof cameraKeyframes)[number];

export const expansionAtPresent = 1.1;

export const projectDomains: UniverseDomain[] = [
  {
    id: "game-development",
    name: "Game Development",
    label: "Game Dev",
    blurb: "Playable worlds, hand-built engines, and the systems underneath them.",
    template: "grand-design",
    palette: {
      core: "#ffe0a8",
      mid: "#ff9a4d",
      rim: "#6fd6ff",
      halo: "#ffb36b",
    },
    projects: [
      {
        id: "sonic-classic-heroes",
        name: "Sonic Classic Heroes",
        tagline: "Four-level chunk-randomized platformer",
        stack: ["C++", "SFML 2.6.2", "Visual Studio"],
        href: "https://github.com/rayyan-41/Sonic-Classic-Heroes",
      },
      {
        id: "islamagood",
        name: "Islamagood",
        tagline: "Console smart-city simulator",
        stack: ["C++", "WinAPI", "Graphs", "Heaps"],
        href: "https://github.com/Mughal-Hash-24/Islamagood",
      },
      {
        id: "arcade-games",
        name: "Arcade & Early Games",
        tagline: "A decade of small playable experiments",
        stack: ["Python", "Pygame", "C++", "SFML"],
        href: "https://github.com/Mughal-Hash-24",
      },
    ],
  },
  {
    id: "agentic-ai",
    name: "Agentic AI",
    label: "Agentic AI",
    blurb: "Tool-using systems that plan, retrieve, and act in the real world.",
    template: "flocculent",
    palette: {
      core: "#f6ddff",
      mid: "#b58cff",
      rim: "#5f6bff",
      halo: "#a97bff",
    },
    projects: [
      {
        id: "the-odyssey",
        name: "The Odyssey",
        tagline: "Swarm of multi-agent systems",
        stack: ["Python", "FastAPI", "MCP", "Redis", "TypeScript"],
      },
      {
        id: "google-mas",
        name: "Google MAS",
        tagline: "Google Workspace agent system",
        stack: ["Python", "Workspace APIs", "OAuth", "MCP"],
      },
      {
        id: "multi-step-tool-attacks",
        name: "AI Agent Security",
        tagline: "Red-team search on tool-using agents",
        stack: ["Python", "Kaggle", "aicomp_sdk"],
      },
      {
        id: "kybernetes",
        name: "Kybernetes / Wisdom",
        tagline: "Versioned knowledge system with MCP tools",
        stack: ["Obsidian", "Python", "MCP", "Markdown"],
        href: "https://github.com/Mughal-Hash-24/Wisdom",
      },
    ],
  },
  {
    id: "multi-agent-systems",
    name: "Multi-Agent Systems",
    label: "Multi-Agent",
    blurb: "Specialist agents that negotiate, delegate, and write together.",
    template: "interacting",
    palette: {
      core: "#ffe2f1",
      mid: "#ff6fb5",
      rim: "#53f0d0",
      halo: "#ff82c8",
    },
    projects: [
      {
        id: "coding-mas",
        name: "Coding MAS",
        tagline: "Multi-agent software engineering",
        stack: ["Python", "MCP", "Git", "Automated tests"],
      },
      {
        id: "musannif",
        name: "Musannif",
        tagline: "Multi-agent long-form writer",
        stack: ["Python", "Textual", "NetworkX", "Anthropic", "Mistral"],
        href: "https://github.com/Mughal-Hash-24/Musannif",
      },
      {
        id: "pokayoke",
        name: "Pokayoke",
        tagline: "Pre-submission financial data quality",
        stack: ["Python", "Google ADK", "MCP", "Gemini", "GCP"],
        href: "https://github.com/rayyan-41/pokayoke",
      },
    ],
  },
  {
    id: "nlp-knowledge",
    name: "NLP & Knowledge Graphs",
    label: "NLP & Graphs",
    blurb: "Language, entities, and the graphs that connect them.",
    template: "ring",
    palette: {
      core: "#e4f6ff",
      mid: "#74c8ff",
      rim: "#3f6dff",
      halo: "#7fd8ff",
    },
    projects: [
      {
        id: "maktaba",
        name: "Maktaba",
        tagline: "AI-assisted knowledge library with Hikma",
        stack: ["Next.js 15", "React 19", "D3", "Supabase", "MiniLM"],
        href: "https://github.com/Mughal-Hash-24/Maktaba",
      },
      {
        id: "naaas-research",
        name: "NAaaS / NewsNet",
        tagline: "News knowledge-graph research",
        stack: ["Python", "spaCy", "DeBERTa-v3", "FAISS", "Leiden"],
      },
      {
        id: "edugap",
        name: "EduGap",
        tagline: "Curriculum-to-job-market gap identifier",
        stack: ["Python", "FastAPI", "ChromaDB", "Gemini"],
        href: "https://github.com/Mughal-Hash-24/EduGap_Curriculum-Job-Listings-Gap-Identifier",
      },
    ],
  },
  {
    id: "machine-learning",
    name: "Machine Learning & Data",
    label: "ML & Data",
    blurb: "Models and data products that turn signal into decisions.",
    template: "elliptical",
    palette: {
      core: "#ffe8c7",
      mid: "#ffae7a",
      rim: "#ff6b8a",
      halo: "#ffb08a",
    },
    projects: [
      {
        id: "gridguard",
        name: "GridGuard",
        tagline: "Electricity-theft inspection dashboard",
        stack: ["Python", "FastAPI", "scikit-learn", "NumPy", "Cytoscape"],
        href: "https://github.com/TahaGPT/GridGuard",
      },
      {
        id: "baghdad-reimagined",
        name: "Baghdad Reimagined",
        tagline: "Classical-AI city simulator",
        stack: ["Python", "FastAPI", "NumPy", "React 19"],
      },
      {
        id: "taxnet",
        name: "TaxNet",
        tagline: "Graph-based tax intelligence prototype",
        stack: ["Next.js 16", "FastAPI", "Neo4j GDS"],
      },
    ],
  },
  {
    id: "systems-embedded",
    name: "Systems & Embedded",
    label: "Systems",
    blurb: "Close-to-the-metal software that talks directly to hardware.",
    template: "edge-on",
    palette: {
      core: "#f4f8ff",
      mid: "#9fc8ff",
      rim: "#4d7dff",
      halo: "#9fc8ff",
    },
    projects: [
      {
        id: "chrono-rift",
        name: "Chrono Rift",
        tagline: "Multi-process tactical game",
        stack: ["C++17", "POSIX shared memory", "pthreads", "SFML"],
        href: "https://github.com/Mughal-Hash-24/Chrono-Rift",
      },
      {
        id: "consolegraphics",
        name: "ConsoleGraphicsExtension",
        tagline: "Windows console graphics library",
        stack: ["C++", "WinAPI", "GDI", "ANSI true color"],
      },
      {
        id: "verteon",
        name: "Verteon",
        tagline: "Offline posture-correction system",
        stack: ["Tauri 2", "Rust", "SQLite", "ESP32", "BLE", "MediaPipe"],
      },
    ],
  },
  {
    id: "full-stack",
    name: "Full-Stack Products",
    label: "Products",
    blurb: "End-to-end products with real interfaces and real constraints.",
    template: "barred",
    palette: {
      core: "#fff1c9",
      mid: "#ffd166",
      rim: "#4fb8ff",
      halo: "#ffd166",
    },
    projects: [
      {
        id: "proxenos",
        name: "Proxenos",
        tagline: "B2B trade orchestration platform",
        stack: ["Java 21", "Spring Boot", "PostgreSQL", "Solidity"],
        href: "https://github.com/Mughal-Hash-24/proxenos",
      },
      {
        id: "documind",
        name: "DocuMind",
        tagline: "AI-driven document extraction",
        stack: ["n8n", "LlamaParse", "Pinecone", "Gemini", "Next.js"],
      },
    ],
  },
  {
    id: "experiments",
    name: "Experiments & Prototypes",
    label: "Experiments",
    blurb: "Small builds, strange ideas, and things made to learn.",
    template: "irregular",
    palette: {
      core: "#eaffd2",
      mid: "#9bff8a",
      rim: "#41d6a3",
      halo: "#9bff8a",
    },
    projects: [
      {
        id: "nu-hub",
        name: "NU-Hub",
        tagline: "Resource hub for incoming students",
        stack: ["Next.js", "TypeScript", "Private"],
      },
      {
        id: "chess-engine",
        name: "Chess Board Prototype",
        tagline: "C++/SFML board and piece renderer",
        stack: ["C++", "SFML"],
      },
      {
        id: "gaianox",
        name: "Gaianox",
        tagline: "Procedural 2D world prototype",
        stack: ["C++17", "SFML"],
      },
      {
        id: "line-drawing",
        name: "Bresenham Visualizer",
        tagline: "Line-drawing demo on a pixel grid",
        stack: ["C++", "SFML"],
      },
    ],
  },
];

export const universeStats = {
  domains: projectDomains.length,
  projects: projectDomains.reduce((total, domain) => total + domain.projects.length, 0),
};

export const universeDescription =
  "A cinematic tour from the Big Bang to the present, where every galaxy is a domain of Ibtasaam Amjad's work and every project lives inside one of them.";
