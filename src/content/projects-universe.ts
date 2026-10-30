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
  template: GalaxyTemplate;
  palette: {
    core: string;
    mid: string;
    rim: string;
    halo: string;
  };
  projectIds: string[];
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
    duration: 3,
  },
  {
    id: "inflation",
    title: "Cosmic Inflation",
    era: "10⁻³² seconds",
    copy: "Space expands faster than light. Microscopic quantum fluctuations stretch into the seeds of every structure that will ever exist.",
    duration: 4,
  },
  {
    id: "nucleosynthesis",
    title: "Big Bang Nucleosynthesis",
    era: "10⁻⁶ seconds – 20 minutes",
    copy: "The universe is a quark–gluon plasma. As it cools, quarks bind into protons and neutrons, and the first hydrogen, helium, and trace lithium form.",
    duration: 6,
  },
  {
    id: "recombination",
    title: "CMB / Recombination",
    era: "380,000 years",
    copy: "Electrons finally bind to nuclei. Light escapes the fog and travels freely — the cosmic microwave background we still map today.",
    duration: 5,
  },
  {
    id: "dark-ages",
    title: "Cosmic Dark Ages",
    era: "380,000 – 200 million years",
    copy: "The first light fades. Neutral hydrogen fills the dark while gravity quietly pulls matter into filaments, halos, and the scaffolding of galaxies.",
    duration: 5,
  },
  {
    id: "first-stars",
    title: "Reionization / First Stars",
    era: "About 200 million years",
    copy: "The first stars ignite across the hydrogen fog. Their ultraviolet light reionizes the universe, and their supernovae scatter the first heavy elements.",
    duration: 5,
  },
  {
    id: "galaxy-formation",
    title: "Galaxy Formation",
    era: "About 1 billion years",
    copy: "Gravity gathers the first stars into halos. Gas cools, settles into rotating disks, and the first galaxies take shape.",
    duration: 7,
  },
  {
    id: "dark-energy",
    title: "Accelerated Expansion",
    era: "About 9.8 billion years",
    copy: "Dark energy begins to dominate. The expansion of space accelerates, stretching the gaps between galaxies and reddening their light.",
    duration: 4,
  },
  {
    id: "present",
    title: "Present Day",
    era: "13.8 billion years",
    copy: "The universe is still expanding. Here, each galaxy is a domain of work, and every star belongs to a project.",
    duration: 3,
  },
];

let cursor = 0;
export const universePhases: UniversePhase[] = phaseDefinitions.map((phase) => {
  const start = cursor;
  cursor += phase.duration;
  return { ...phase, start, end: cursor };
});

export const universeDuration = cursor;
export const scoreStartOffset = 19;
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
  { at: 0.07, radius: 6.5, height: 1, angle: 0.45, fov: 52, target: [0, 0, 0] },
  { at: 0.12, radius: 16, height: 5, angle: 0.8, fov: 55, target: [0, 0, 0] },
  { at: 0.17, radius: 10, height: 3, angle: 1.2, fov: 52, target: [0, 0, 0] },
  { at: 0.23, radius: 4.8, height: 1.4, angle: 1.65, fov: 44, target: [0.5, 0.2, 0] },
  { at: 0.31, radius: 7.5, height: 2.2, angle: 2, fov: 48, target: [0, 0, 0] },
  { at: 0.36, radius: 19, height: 4.5, angle: 2.4, fov: 55, target: [0, 0, 0] },
  { at: 0.43, radius: 26, height: 6, angle: 2.9, fov: 56, target: [0, 0, 0] },
  { at: 0.5, radius: 34, height: 8, angle: 3.4, fov: 58, target: [0, 0, 0] },
  { at: 0.55, radius: 24, height: 5, angle: 3.8, fov: 52, target: [0, 0, 0] },
  { at: 0.6, radius: 18, height: 4, angle: 4.1, fov: 48, target: [0, 0, 0] },
  { at: 0.667, radius: 12, height: 2.6, angle: 4.4, fov: 44, target: [0, 0, 0] },
  { at: 0.72, radius: 14, height: 3, angle: 4.7, fov: 46, target: [0, 0, 0] },
  { at: 0.78, radius: 22, height: 6, angle: 5, fov: 52, target: [0, 0, 0] },
  { at: 0.833, radius: 32, height: 8, angle: 5.3, fov: 56, target: [0, 0, 0] },
  { at: 0.9, radius: 38, height: 9, angle: 5.6, fov: 58, target: [0, 0, 0] },
  { at: 0.929, radius: 36, height: 9, angle: 5.75, fov: 57, target: [0, 0, 0] },
  { at: 1, radius: 34, height: 9, angle: 5.9, fov: 56, target: [4.5, -2, 0] },
] as const;

export type CameraKeyframe = (typeof cameraKeyframes)[number];

export const expansionAtPresent = 1.1;

export const universeProjects: UniverseProject[] = [
  {
    id: "space-invaders",
    name: "Space Invaders",
    tagline: "Alien waves, projectiles, and power-ups",
    stack: ["Python", "Pygame"],
    href: "https://github.com/Mughal-Hash-24/Space-Invaders",
  },
  {
    id: "socket-chess",
    name: "Socket Chess",
    tagline: "Networked two-player chess over sockets",
    stack: ["Python", "Pygame", "Sockets", "ngrok"],
    href: "https://github.com/Mughal-Hash-24/Chess",
  },
  {
    id: "two-birds-one-stone",
    name: "Two Birds One Stone",
    tagline: "Slingshot arcade with projectile physics",
    stack: ["Python", "Pygame"],
    href: "https://github.com/Mughal-Hash-24/Two-Birds-One-Stone",
  },
  {
    id: "2d-voxel-engine",
    name: "2D Voxel Engine",
    tagline: "Interactive 2D voxel terrain",
    stack: ["Python", "Pygame"],
    href: "https://github.com/Mughal-Hash-24/2D-Voxel-Engine",
  },
  {
    id: "2d-voxel-engine-v2",
    name: "2D Voxel Engine V2",
    tagline: "Terrain, enemies, and combat",
    stack: ["Python", "Pygame"],
    href: "https://github.com/Mughal-Hash-24/2D-Voxel-Engine-V2",
  },
  {
    id: "flappy-bird",
    name: "Flappy Bird Recreation",
    tagline: "Keyboard-controlled flight and obstacles",
    stack: ["Python", "Pygame"],
    href: "https://github.com/Mughal-Hash-24/Flappy-Bird",
  },
  {
    id: "pong",
    name: "Pong Recreation",
    tagline: "Two-player paddle and ball arcade",
    stack: ["Python", "Pygame"],
    href: "https://github.com/Mughal-Hash-24/Pong",
  },
  {
    id: "snake",
    name: "Snake Recreation",
    tagline: "Grid movement, food, and scoring",
    stack: ["Python", "Pygame"],
    href: "https://github.com/Mughal-Hash-24/Snake",
  },
  {
    id: "save-the-ball",
    name: "Save the Ball",
    tagline: "Bouncing-ball survival game",
    stack: ["Python", "Pygame"],
    href: "https://github.com/Mughal-Hash-24/Save-The-Ball",
  },
  {
    id: "bean-collector",
    name: "Bean Collector",
    tagline: "Timed coffee-bean arcade game",
    stack: ["Python", "Pygame"],
    href: "https://github.com/Mughal-Hash-24/Bean-Collector",
  },
  {
    id: "atari-breakout",
    name: "Atari Breakout Recreation",
    tagline: "Paddle, ball, and randomized bricks",
    stack: ["Python", "Pygame"],
    href: "https://github.com/Mughal-Hash-24/Atari-Breakout",
  },
  {
    id: "bresenham-visualizer",
    name: "Bresenham Line-Drawing Visualizer",
    tagline: "Interactive line-drawing algorithm",
    stack: ["C++", "SFML 2.6.2"],
    href: "https://github.com/Mughal-Hash-24/Line-Drawing-Algorithm",
  },
  {
    id: "chess-board-prototype",
    name: "Chess Board Prototype",
    tagline: "8×8 board with move validation",
    stack: ["C++", "SFML 2.6.2"],
    href: "https://github.com/Mughal-Hash-24/ChessEngine",
  },
  {
    id: "buzz-bomberz",
    name: "Buzz Bomberz",
    tagline: "Intellivision-inspired arcade shooter",
    stack: ["C++", "SFML"],
    href: "https://github.com/Mughal-Hash-24/Buzz_Bomberz_in_cpp",
  },
  {
    id: "sonic-classic-heroes",
    name: "Sonic Classic Heroes",
    tagline: "Chunk-randomized four-level platformer",
    stack: ["C++", "SFML 2.6.2", "Visual Studio"],
    href: "https://github.com/rayyan-41/Sonic-Classic-Heroes",
  },
  {
    id: "gaianox",
    name: "Gaianox",
    tagline: "Procedural 2D world prototype",
    stack: ["C++17", "SFML"],
    href: "https://github.com/Mughal-Hash-24/Gaianox",
  },
  {
    id: "chrono-rift",
    name: "Chrono Rift",
    tagline: "Multi-process tactical game",
    stack: ["C++17", "POSIX shared memory", "pthreads", "SFML"],
    href: "https://github.com/Mughal-Hash-24/Chrono-Rift",
  },
  {
    id: "super-mario-masm",
    name: "Super Mario Bros in MASM",
    tagline: "Multilevel platformer in x86 assembly",
    stack: ["x86 MASM", "Irvine32", "WinMM"],
    href: "https://github.com/Mughal-Hash-24/Super-Mario-Bros-in-MASM",
  },
  {
    id: "baghdad-reimagined",
    name: "Baghdad Reimagined",
    tagline: "Classical-AI city simulator",
    stack: ["Python", "FastAPI", "NumPy", "React 19"],
  },
  {
    id: "islamagood",
    name: "Islamagood",
    tagline: "Console smart-city simulator",
    stack: ["C++", "WinAPI", "Graphs", "Heaps"],
    href: "https://github.com/Mughal-Hash-24/Islamagood",
  },
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
    id: "ai-agent-security",
    name: "AI Agent Security",
    tagline: "Red-team search on tool-using agents",
    stack: ["Python", "Kaggle", "aicomp_sdk"],
  },
  {
    id: "naaas-newsnet",
    name: "NAaaS / NewsNet",
    tagline: "News knowledge-graph research",
    stack: ["Python", "spaCy", "DeBERTa-v3", "FAISS", "Leiden"],
  },
  {
    id: "kybernetes",
    name: "Kybernetes / Wisdom",
    tagline: "Versioned knowledge system with MCP tools",
    stack: ["Obsidian", "Python", "MCP", "Markdown"],
    href: "https://github.com/Mughal-Hash-24/Wisdom",
  },
  {
    id: "edugap",
    name: "EduGap",
    tagline: "Curriculum-to-job-market gap identifier",
    stack: ["Python", "FastAPI", "ChromaDB", "Gemini", "Playwright"],
    href: "https://github.com/Mughal-Hash-24/EduGap_Curriculum-Job-Listings-Gap-Identifier",
  },
  {
    id: "taxnet",
    name: "TaxNet",
    tagline: "Graph-based tax intelligence prototype",
    stack: ["Next.js 16", "FastAPI", "Neo4j GDS"],
  },
  {
    id: "documind",
    name: "DocuMind",
    tagline: "PDF-to-cited-RAG workspace",
    stack: ["n8n", "LlamaParse", "Pinecone", "Gemini"],
  },
  {
    id: "pokayoke",
    name: "Pokayoke",
    tagline: "Pre-submission financial data QA",
    stack: ["Python", "Google ADK", "MCP", "Gemini", "GCP"],
    href: "https://github.com/rayyan-41/pokayoke",
  },
  {
    id: "gridguard",
    name: "GridGuard",
    tagline: "Electricity-theft inspection dashboard",
    stack: ["Python", "FastAPI", "scikit-learn", "NumPy", "Cytoscape"],
    href: "https://github.com/TahaGPT/GridGuard",
  },
  {
    id: "maktaba",
    name: "Maktaba",
    tagline: "AI-assisted knowledge library with Hikma",
    stack: ["Next.js 15", "React 19", "D3", "Supabase", "MiniLM"],
    href: "https://github.com/Mughal-Hash-24/Maktaba",
  },
  {
    id: "proxenos",
    name: "Proxenos",
    tagline: "B2B trade orchestration platform",
    stack: ["Java 21", "Spring Boot", "PostgreSQL", "Solidity"],
    href: "https://github.com/Mughal-Hash-24/proxenos",
  },
  {
    id: "nu-hub",
    name: "NU-Hub",
    tagline: "Resource hub for incoming students",
    stack: ["HTML", "CSS", "JavaScript"],
    href: "https://github.com/Mughal-Hash-24/NU-Hub",
  },
  {
    id: "verteon",
    name: "Verteon",
    tagline: "Offline posture-correction system",
    stack: ["Tauri 2", "Rust", "SQLite", "ESP32", "BLE", "MediaPipe"],
  },
  {
    id: "consolegraphics",
    name: "ConsoleGraphicsExtension",
    tagline: "Windows console graphics library",
    stack: ["C++", "WinAPI", "GDI", "ANSI true color"],
  },
];

export const projectById = new Map(universeProjects.map((project) => [project.id, project]));

export const projectDomains: UniverseDomain[] = [
  {
    id: "pre-university",
    name: "Pre-University Games",
    label: "Pre-Uni Games",
    template: "flocculent",
    palette: {
      core: "#f6f0ff",
      mid: "#7ee8ff",
      rim: "#b58cff",
      halo: "#7ee8ff",
    },
    projectIds: [
      "space-invaders",
      "socket-chess",
      "two-birds-one-stone",
      "2d-voxel-engine",
      "2d-voxel-engine-v2",
      "flappy-bird",
      "pong",
      "snake",
      "save-the-ball",
      "bean-collector",
      "atari-breakout",
      "bresenham-visualizer",
      "chess-board-prototype",
    ],
  },
  {
    id: "university",
    name: "University Projects",
    label: "University",
    template: "grand-design",
    palette: {
      core: "#ffe0a8",
      mid: "#ff9a4d",
      rim: "#6fd6ff",
      halo: "#ffb36b",
    },
    projectIds: [
      "buzz-bomberz",
      "sonic-classic-heroes",
      "gaianox",
      "chrono-rift",
      "super-mario-masm",
      "baghdad-reimagined",
      "islamagood",
    ],
  },
  {
    id: "agentic",
    name: "Agentic AI & Multi-Agent Systems",
    label: "Agentic AI",
    template: "interacting",
    palette: {
      core: "#ffe2f1",
      mid: "#ff6fb5",
      rim: "#53f0d0",
      halo: "#ff82c8",
    },
    projectIds: ["the-odyssey", "google-mas", "coding-mas", "musannif", "ai-agent-security"],
  },
  {
    id: "nlp-research",
    name: "NLP & Knowledge Graph Research",
    label: "NLP & Graphs",
    template: "ring",
    palette: {
      core: "#e4f6ff",
      mid: "#74c8ff",
      rim: "#3f6dff",
      halo: "#7fd8ff",
    },
    projectIds: ["naaas-newsnet", "kybernetes", "edugap", "taxnet"],
  },
  {
    id: "hackathon",
    name: "Hackathon Projects",
    label: "Hackathons",
    template: "irregular",
    palette: {
      core: "#fff1c9",
      mid: "#ff8a4d",
      rim: "#ff4d6d",
      halo: "#ff8a4d",
    },
    projectIds: ["edugap", "taxnet", "documind", "pokayoke", "gridguard"],
  },
  {
    id: "products",
    name: "Products",
    label: "Products",
    template: "barred",
    palette: {
      core: "#fff0c8",
      mid: "#ffd166",
      rim: "#4fb8ff",
      halo: "#ffd166",
    },
    projectIds: ["maktaba", "proxenos", "musannif", "verteon", "nu-hub"],
  },
  {
    id: "systems",
    name: "Systems & Embedded",
    label: "Systems",
    template: "edge-on",
    palette: {
      core: "#f4f8ff",
      mid: "#9fc8ff",
      rim: "#4d7dff",
      halo: "#9fc8ff",
    },
    projectIds: ["verteon", "consolegraphics"],
  },
];

export const universeStats = {
  domains: projectDomains.length,
  projects: universeProjects.length,
};

export const universeDescription =
  "A cinematic tour from the Big Bang to the present, where seven galaxies map the domains of Ibtasaam Amjad's work and every project lives inside one of them.";
