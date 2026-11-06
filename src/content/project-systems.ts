import { projectById, type UniverseDomain } from "./projects-universe";

type StarSystemInspiration = {
  name: string;
  note: string;
  starColor: string;
  starScale: number;
};

type PlanetInspiration = {
  name: string;
  note: string;
  color: string;
  size: number;
};

const starSystems: StarSystemInspiration[] = [
  {
    name: "TRAPPIST-1",
    note: "Seven rocky worlds around an ultracool red dwarf",
    starColor: "#ff8a5c",
    starScale: 0.95,
  },
  {
    name: "Kepler-90",
    note: "Eight worlds, the fullest system yet found",
    starColor: "#ffe9b8",
    starScale: 1.1,
  },
  {
    name: "Kepler-186",
    note: "Five worlds orbiting a quiet red dwarf",
    starColor: "#ff9a6b",
    starScale: 0.92,
  },
  {
    name: "Proxima Centauri",
    note: "The nearest star to our Sun",
    starColor: "#ff7a50",
    starScale: 0.88,
  },
  {
    name: "Tau Ceti",
    note: "A calm Sun-like neighbour",
    starColor: "#fff3d0",
    starScale: 1.05,
  },
  {
    name: "55 Cancri",
    note: "Five worlds around a binary pair",
    starColor: "#ffd9a0",
    starScale: 1.08,
  },
  {
    name: "HD 10180",
    note: "A crowded family of six worlds",
    starColor: "#fff0c8",
    starScale: 1,
  },
  {
    name: "TOI-700",
    note: "Three worlds, one of them temperate",
    starColor: "#ff9a78",
    starScale: 0.9,
  },
  {
    name: "K2-138",
    note: "Five worlds locked in a resonant chain",
    starColor: "#ffcf9f",
    starScale: 0.97,
  },
  {
    name: "Kepler-442",
    note: "A super-Earth in the habitable zone",
    starColor: "#ffd9a8",
    starScale: 0.94,
  },
  {
    name: "LHS 1140",
    note: "A dense super-Earth close enough to study",
    starColor: "#ff8f66",
    starScale: 0.9,
  },
  {
    name: "GJ 667 C",
    note: "Worlds around a triple-star system",
    starColor: "#ff9a70",
    starScale: 0.93,
  },
  {
    name: "HD 40307",
    note: "Three super-Earths around an orange star",
    starColor: "#ffd2a0",
    starScale: 0.96,
  },
  {
    name: "Barnard's Star",
    note: "Ancient rock worlds near the Sun",
    starColor: "#ff8055",
    starScale: 0.87,
  },
  {
    name: "Kepler-452",
    note: "A super-Earth with a long, slow year",
    starColor: "#fff2cc",
    starScale: 1.06,
  },
];

const planetInspirations: PlanetInspiration[] = [
  { name: "Mercury", note: "Scorched and airless", color: "#9c958d", size: 0.8 },
  { name: "Venus", note: "A runaway greenhouse under acid clouds", color: "#e3c48f", size: 0.95 },
  { name: "Earth", note: "The only known living world", color: "#5f9fe8", size: 1 },
  {
    name: "Mars",
    note: "Rusty deserts and ancient riverbeds",
    color: "#c96a44",
    size: 0.85,
  },
  {
    name: "Jupiter",
    note: "A gas giant with a centuries-old storm",
    color: "#d9b98f",
    size: 1.35,
  },
  { name: "Saturn", note: "Rings of ice and dust", color: "#e6d2a2", size: 1.3 },
  { name: "Uranus", note: "A tipped ice giant", color: "#9ad9d6", size: 1.1 },
  { name: "Neptune", note: "Winds faster than sound", color: "#4f7bd9", size: 1.12 },
  {
    name: "Kepler-452 b",
    note: "A super-Earth in a habitable zone",
    color: "#8fbf8f",
    size: 1.15,
  },
  {
    name: "Proxima Centauri b",
    note: "A rocky world beside the nearest star",
    color: "#c2795f",
    size: 0.9,
  },
  { name: "TRAPPIST-1 e", note: "A temperate, rocky world", color: "#6fa3b8", size: 0.88 },
  { name: "TRAPPIST-1 f", note: "An icy cousin of the ocean worlds", color: "#a8c2cc", size: 0.92 },
  {
    name: "55 Cancri e",
    note: "A lava world with oceans of magma",
    color: "#cc4455",
    size: 0.95,
  },
  {
    name: "Kepler-10 b",
    note: "A molten planet, hotter than Mercury",
    color: "#d96a44",
    size: 0.9,
  },
  {
    name: "WASP-12 b",
    note: "A dark world being eaten by its star",
    color: "#3a2a26",
    size: 1.2,
  },
  {
    name: "HD 189733 b",
    note: "Cobalt blue, with glass in the wind",
    color: "#3d6fd9",
    size: 1.05,
  },
  {
    name: "Kepler-16 b",
    note: "A world with two suns in its sky",
    color: "#c2a87f",
    size: 1.1,
  },
  { name: "Kepler-22 b", note: "A temperate ocean super-Earth", color: "#6fb8cf", size: 1.1 },
  { name: "K2-18 b", note: "A water-rich world with a thick sky", color: "#4f93c2", size: 1.08 },
  { name: "LHS 1140 b", note: "A dense world with a rocky core", color: "#5f8f93", size: 1 },
  {
    name: "TOI-700 d",
    note: "A temperate rocky world, close by",
    color: "#7fa887",
    size: 0.92,
  },
  {
    name: "Kepler-186 f",
    note: "The first Earth-sized world in a habitable zone",
    color: "#8aa887",
    size: 0.9,
  },
  { name: "PSR B1620-26 b", note: "The oldest known planet", color: "#b0a184", size: 1.1 },
  {
    name: "HD 209458 b",
    note: "A puffy world leaking its atmosphere",
    color: "#c47a5a",
    size: 1.15,
  },
  { name: "Kepler-7 b", note: "A puffy planet light as foam", color: "#d9c9a8", size: 1.25 },
  {
    name: "Gliese 581 g",
    note: "A candidate super-Earth within reach",
    color: "#9fc4a8",
    size: 1.05,
  },
  {
    name: "Kepler-442 b",
    note: "A rocky world with more starlight than Earth",
    color: "#88a5b8",
    size: 1,
  },
];

const techNotes: Record<string, string> = {
  Python: "The language the whole world runs on.",
  Pygame: "Draws frames, sprites, and sound for the arcade loop.",
  Sockets: "Carries moves between the two players.",
  ngrok: "Tunnels the match across the internet.",
  "C++": "Systems-level code that owns every byte.",
  "SFML 2.6.2": "Windows, input, and sprites for the game loop.",
  SFML: "Windows, input, and sprites for the game loop.",
  "Visual Studio": "The build bench and debugger.",
  "C++17": "Modern C++ constructs across the engine.",
  "POSIX shared memory": "Processes share world state through memory.",
  pthreads: "Threads that split the simulation apart.",
  "x86 MASM": "Hand-written assembly, close to the metal.",
  Irvine32: "Assembly helpers for I/O and loops.",
  WinMM: "Windows multimedia timers and sound.",
  FastAPI: "Serves the simulation behind an HTTP API.",
  NumPy: "Array math for agents and worlds.",
  "React 19": "The interface layer above the models.",
  WinAPI: "Native Windows calls for console control.",
  Graphs: "Cities and roads modeled as a graph.",
  Heaps: "Priority queues for the best route.",
  MCP: "The tool protocol agents speak to the world.",
  Redis: "Shared memory and message flow between agents.",
  TypeScript: "Typed glue for the orchestration layer.",
  "Workspace APIs": "Reads and writes Google Workspace data.",
  OAuth: "Scoped access with revocable tokens.",
  Git: "The agent version-controls its own work.",
  "Automated tests": "Every change earns a test run.",
  Textual: "A terminal UI for watching the writer think.",
  NetworkX: "Graphs that map the document's structure.",
  Anthropic: "Claude plans and drafts long-form text.",
  Mistral: "A second model for contrast and edits.",
  Kaggle: "Runs the red-team search at scale.",
  aicomp_sdk: "The competition's agent security harness.",
  spaCy: "Parses entities and syntax from news.",
  "DeBERTa-v3": "Transformer embeddings for meaning.",
  FAISS: "Nearest-neighbour search across vectors.",
  Leiden: "Community detection over the news graph.",
  Obsidian: "Notes as the human-facing vault.",
  Markdown: "Plain-text knowledge that outlives tools.",
  ChromaDB: "A vector store for curriculum embeddings.",
  Gemini: "Extracts skills from job listings.",
  Playwright: "Drives a real browser to gather listings.",
  "Next.js 16": "The product shell and routing.",
  "Neo4j GDS": "Graph algorithms for tax networks.",
  n8n: "Wires the document pipeline together.",
  LlamaParse: "Turns PDFs into structured text.",
  Pinecone: "Hosted vector memory for retrieval.",
  "Google ADK": "Agent orchestration on Google Cloud.",
  GCP: "Hosts the pipeline and its data.",
  "scikit-learn": "Scores and flags suspicious meters.",
  Cytoscape: "Renders the theft network as a map.",
  "Next.js 15": "The library's web surface.",
  D3: "Forces and shapes for the knowledge view.",
  Supabase: "Auth and storage for the library.",
  MiniLM: "Small embeddings that run close by.",
  "Java 21": "The trade platform's runtime.",
  "Spring Boot": "Services, contracts, and REST.",
  PostgreSQL: "Transactional records for orders.",
  Solidity: "Escrow agreements on-chain.",
  HTML: "The page's structure.",
  CSS: "The page's look.",
  JavaScript: "The page's behavior.",
  "Tauri 2": "A native shell around the posture lab.",
  Rust: "Fast, safe code on the desktop.",
  SQLite: "Local history of every session.",
  ESP32: "The wearable sensor on the body.",
  BLE: "Wireless link from sensor to desktop.",
  MediaPipe: "Pose landmarks from the camera.",
  GDI: "Windows drawing calls into the console.",
  "ANSI true color": "24-bit color inside a terminal.",
};

export type ResolvedPlanet = {
  tech: string;
  note: string;
  inspiration: string;
  inspirationNote: string;
  color: string;
  size: number;
  orbit: number;
  speed: number;
  phase: number;
};

export type ResolvedSystem = {
  projectId: string;
  projectName: string;
  tagline: string;
  href?: string;
  inspiration: string;
  inspirationNote: string;
  starColor: string;
  starScale: number;
  planets: ResolvedPlanet[];
};

function hashString(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

const fallbackNote = "A tool this project leans on.";

export function resolveProjectSystems(domain: UniverseDomain): ResolvedSystem[] {
  const systemStart = hashString(domain.id) % starSystems.length;

  return domain.projectIds.flatMap((projectId, systemIndex) => {
    const project = projectById.get(projectId);
    if (!project) return [];

    const system = starSystems[(systemStart + systemIndex) % starSystems.length];
    const planetStart = hashString(`${domain.id}:${projectId}`) % planetInspirations.length;

    return [
      {
        projectId,
        projectName: project.name,
        tagline: project.tagline,
        href: project.href,
        inspiration: system.name,
        inspirationNote: system.note,
        starColor: system.starColor,
        starScale: system.starScale,
        planets: project.stack.map((tech, planetIndex) => {
          const planet =
            planetInspirations[(planetStart + planetIndex * 5) % planetInspirations.length];
          const wobble = hashString(`${projectId}:${tech}`) / 4294967296;

          return {
            tech,
            note: techNotes[tech] ?? fallbackNote,
            inspiration: planet.name,
            inspirationNote: planet.note,
            color: planet.color,
            size: planet.size * (0.92 + wobble * 0.16),
            orbit: 1.15 + planetIndex * 0.55 + wobble * 0.15,
            speed: (0.34 + wobble * 0.2) / (1 + planetIndex * 0.3),
            phase: wobble * Math.PI * 2,
          };
        }),
      },
    ];
  });
}
