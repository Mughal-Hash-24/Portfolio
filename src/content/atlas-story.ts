// The Atlas storyline: Pir-e-Iqbal's guided journey and the Gamer's Dimension.
// All quotes are short, publicly attributed references to the games named.

export type ArcadeMotif =
  | "lowrider"
  | "skyline"
  | "palm"
  | "bowling"
  | "helicopter"
  | "hood"
  | "signal"
  | "block"
  | "crewmate"
  | "dragon"
  | "soldier"
  | "scope"
  | "fist"
  | "ball"
  | "cricket"
  | "belt"
  | "island";

export type ArcadeStatue = {
  id: string;
  game: string;
  year: number;
  quote: string;
  reference?: boolean;
  motif: ArcadeMotif;
  paint: string;
  stone: string;
};

export const guideName = "Pir-e-Iqbal";
export const guideTitle = "Keeper of the Atlas";

// Placeholder mission statement — replace when the real one arrives.
export const missionStatement = {
  quote:
    "Either live with the apparatus of a heart charmer, or die with the misery and shame of worthlessness.",
  attribution: "My mission statement",
  note: "Inscribed at the Pond of Wisdom.",
};

export type StoryStage = "pond" | "introduce" | "follow" | "memory" | "portal" | "arcade" | "done";

export const storyLines = {
  intro: [
    "I am Pir-e-Iqbal. I keep this Atlas — the things that made you, not the things you made.",
    "You wrote your mission on the water before you could swim. I read it every morning.",
    "Now come. Before the shelves and the songs, there is a room where it all began.",
  ],
  followStart: ["Stay close. The first door is not far.", "This way — the path remembers."],
  followNudge: ["This way, wanderer.", "Mind the path. It is older than it looks."],
  memory: [
    "2011. You wanted to play Uphill Rush. You pressed the middle mouse button, and nothing happened.",
    "You did not know it then, but that question — why is nothing happening? — was the first line of code you ever wrote.",
    "The gate beside the monitor answers questions like that. Shall we?",
  ],
  portal: ["The Gamer's Dimension. Seventeen worlds, carved in stone.", "After you."],
  arcade: [
    "Welcome to the Gamer's Dimension. Every statue here is a world that raised you.",
    "Read the inscriptions. Remember them. The gate will take you home when you are ready.",
  ],
  returnWorld: ["Back on the path. The rest of the Atlas is yours to wander."],
  freeRoam: [
    "The Atlas is yours to wander. The gate stays open.",
    "Every path here is a thing that made you. Take your time.",
    "The pond remembers your words. So do I.",
  ],
} as const;

export const arcadeStatues: ArcadeStatue[] = [
  {
    id: "gta-san-andreas",
    game: "GTA: San Andreas",
    year: 2004,
    quote: "Ah shit, here we go again.",
    motif: "lowrider",
    paint: "#7cc36a",
    stone: "#7d7a70",
  },
  {
    id: "gta-iii",
    game: "GTA III",
    year: 2001,
    quote: "Liberty City, 2001 — the first city that felt infinite.",
    reference: true,
    motif: "skyline",
    paint: "#ffd166",
    stone: "#7a7670",
  },
  {
    id: "gta-vice-city",
    game: "GTA: Vice City",
    year: 2002,
    quote: "Vice City, 1986 — neon, palms, and a stolen empire.",
    reference: true,
    motif: "palm",
    paint: "#ff7ab8",
    stone: "#807a74",
  },
  {
    id: "gta-iv",
    game: "GTA IV",
    year: 2008,
    quote: "Cousin, let's go bowling.",
    motif: "bowling",
    paint: "#e85d5d",
    stone: "#75726b",
  },
  {
    id: "gta-v",
    game: "GTA V",
    year: 2013,
    quote: "Los Santos, 2013 — three criminals, one city.",
    reference: true,
    motif: "helicopter",
    paint: "#ff9f43",
    stone: "#7c7870",
  },
  {
    id: "assassins-creed",
    game: "Assassin's Creed",
    year: 2007,
    quote: "Nothing is true; everything is permitted.",
    motif: "hood",
    paint: "#f2ecdd",
    stone: "#787570",
  },
  {
    id: "watch-dogs",
    game: "Watch Dogs",
    year: 2014,
    quote: "Everything is connected.",
    motif: "signal",
    paint: "#56e0ff",
    stone: "#727678",
  },
  {
    id: "minecraft",
    game: "Minecraft",
    year: 2011,
    quote: "Never dig straight down.",
    motif: "block",
    paint: "#7cc36a",
    stone: "#79766d",
  },
  {
    id: "among-us",
    game: "Among Us",
    year: 2018,
    quote: "There is an impostor among us.",
    motif: "crewmate",
    paint: "#e84a5f",
    stone: "#7b7470",
  },
  {
    id: "mortal-kombat",
    game: "Mortal Kombat",
    year: 1992,
    quote: "Finish him!",
    motif: "dragon",
    paint: "#ffcf33",
    stone: "#7d776a",
  },
  {
    id: "call-of-duty",
    game: "Call of Duty",
    year: 2003,
    quote: "Bravo Six, going dark.",
    motif: "soldier",
    paint: "#9aa46a",
    stone: "#767268",
  },
  {
    id: "igi",
    game: "Project I.G.I.",
    year: 2000,
    quote: "Project I.G.I., 2000 — the mission began alone.",
    reference: true,
    motif: "scope",
    paint: "#6fa8dc",
    stone: "#6f7278",
  },
  {
    id: "tekken",
    game: "Tekken",
    year: 1994,
    quote: "Get ready for the next battle.",
    motif: "fist",
    paint: "#b58cff",
    stone: "#777370",
  },
  {
    id: "fifa",
    game: "FIFA",
    year: 1993,
    quote: "The beautiful game.",
    motif: "ball",
    paint: "#e8f2f2",
    stone: "#747872",
  },
  {
    id: "cricket-07",
    game: "Cricket 07",
    year: 2006,
    quote: "Howzat!",
    motif: "cricket",
    paint: "#d9a066",
    stone: "#7d7568",
  },
  {
    id: "wwe-2k15",
    game: "WWE 2K15",
    year: 2014,
    quote: "The champ is here.",
    motif: "belt",
    paint: "#ffd166",
    stone: "#7c736a",
  },
  {
    id: "far-cry-3",
    game: "Far Cry 3",
    year: 2012,
    quote: "Did I ever tell you the definition of insanity?",
    motif: "island",
    paint: "#5fd3a6",
    stone: "#73786e",
  },
];

// Overworld anchors for the journey (tile coordinates).
export const storyWorld = {
  spawn: { x: 71.2, y: 56.6 },
  guide: { x: 66.4, y: 56.2 },
  pond: { x: 68.6, y: 53.1, rx: 3.2, ry: 2.7 },
  missionStone: { x: 71.8, y: 51.4 },
  shrine: {
    monitor: { x: 60.8, y: 61.2 },
    mouse: { x: 64.2, y: 63.4 },
    plaque: { x: 60.8, y: 64.2 },
    anchor: { x: 60.9, y: 63.4 },
  },
  portal: { x: 56.8, y: 62.0 },
  path: [
    { x: 69.6, y: 58.2 },
    { x: 67.4, y: 60.3 },
    { x: 64.6, y: 61.9 },
    { x: 62.2, y: 63.1 },
    { x: 60.4, y: 64.4 },
  ],
  guidePath: [
    { x: 66.4, y: 56.2 },
    { x: 69.6, y: 58.2 },
    { x: 67.4, y: 60.3 },
    { x: 64.6, y: 61.9 },
    { x: 62.2, y: 63.1 },
    { x: 60.2, y: 64.9 },
  ],
} as const;

export const arcadeDimension = {
  w: 46,
  h: 34,
  center: { x: 23, y: 16.5 },
  radiusX: 16,
  radiusY: 12,
  ringX: 11,
  ringY: 8.4,
  spawn: { x: 23, y: 24.9 },
  exit: { x: 23, y: 27.8 },
  guide: { x: 20.2, y: 24.6 },
} as const;

export type ArcadePropKind =
  "blocks" | "bowling" | "crate" | "football" | "cricket" | "palm" | "dragon" | "tokens";

export type ArcadeProp = {
  kind: ArcadePropKind;
  x: number;
  y: number;
};

export const arcadeProps: ArcadeProp[] = [
  { kind: "blocks", x: 30.6, y: 25.2 },
  { kind: "bowling", x: 10.3, y: 24.1 },
  { kind: "crate", x: 8.8, y: 16.9 },
  { kind: "football", x: 36.2, y: 12.2 },
  { kind: "cricket", x: 20.4, y: 11.0 },
  { kind: "palm", x: 16.4, y: 7.2 },
  { kind: "dragon", x: 29.7, y: 6.9 },
  { kind: "tokens", x: 23.4, y: 22.2 },
];
