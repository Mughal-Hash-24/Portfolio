// The Atlas: a walkable world of the things that shaped me.
// Starter content — replace these entries with your own influences.
// Region centers, pedestal slots, the lake, and the campfire all derive
// from this file, so the world grows by editing data, not layout code.

export type AtlasRegionId = "music" | "film" | "books" | "poetry" | "philosophy";

export type AtlasLink = {
  label: string;
  href: string;
};

export type AtlasEntry = {
  id: string;
  region: AtlasRegionId;
  title: string;
  creator: string;
  year?: number;
  why: string;
  quote?: { text: string; attribution: string };
  note?: string;
  links?: AtlasLink[];
  connections?: string[];
  night?: boolean;
};

export type AtlasRelic = {
  id: string;
  region: AtlasRegionId;
  title: string;
  quote: string;
  attribution: string;
  hint: string;
  night?: boolean;
};

export type AtlasRegion = {
  id: AtlasRegionId;
  name: string;
  tagline: string;
  accent: string;
  soft: string;
  structure: "bandstand" | "cinema" | "library" | "pergola" | "stones";
  tree: "oak" | "autumn" | "blossom" | "pine";
  center: { x: number; y: number };
  slots: Array<{ x: number; y: number }>;
};

export const atlasRegions: AtlasRegion[] = [
  {
    id: "music",
    name: "The Listening Glade",
    tagline: "Where sound first rearranged me.",
    accent: "#7ee8ff",
    soft: "#b8f4ff",
    structure: "bandstand",
    tree: "oak",
    center: { x: 30, y: 40 },
    slots: [
      { x: 27, y: 43 },
      { x: 30, y: 44 },
      { x: 33, y: 43 },
    ],
  },
  {
    id: "film",
    name: "The Picture House",
    tagline: "Rooms where light learned to remember.",
    accent: "#ffcf6b",
    soft: "#ffe6a6",
    structure: "cinema",
    tree: "oak",
    center: { x: 118, y: 40 },
    slots: [
      { x: 115, y: 44 },
      { x: 118, y: 45 },
      { x: 121, y: 44 },
    ],
  },
  {
    id: "books",
    name: "The Long Library",
    tagline: "Shelves that outlast their readers.",
    accent: "#c3e08a",
    soft: "#e2f3b8",
    structure: "library",
    tree: "autumn",
    center: { x: 118, y: 80 },
    slots: [
      { x: 114, y: 84 },
      { x: 118, y: 85 },
      { x: 122, y: 84 },
    ],
  },
  {
    id: "poetry",
    name: "The Poem Garden",
    tagline: "Small rooms made of very few words.",
    accent: "#ff9ec9",
    soft: "#ffd0e4",
    structure: "pergola",
    tree: "blossom",
    center: { x: 32, y: 82 },
    slots: [
      { x: 28, y: 85 },
      { x: 32, y: 86 },
      { x: 36, y: 85 },
    ],
  },
  {
    id: "philosophy",
    name: "The Quiet Hill",
    tagline: "Where questions are allowed to stay open.",
    accent: "#b9a6ff",
    soft: "#d9ccff",
    structure: "stones",
    tree: "pine",
    center: { x: 75, y: 16 },
    slots: [
      { x: 72, y: 20 },
      { x: 75, y: 21 },
      { x: 78, y: 20 },
    ],
  },
];

export const atlasEntries: AtlasEntry[] = [
  {
    id: "clair-de-lune",
    region: "music",
    title: "Clair de Lune",
    creator: "Claude Debussy",
    year: 1905,
    why: "Taught me that quiet can be the loudest thing in a room, and that a melody can move like weather.",
  },
  {
    id: "a-love-supreme",
    region: "music",
    title: "A Love Supreme",
    creator: "John Coltrane",
    year: 1965,
    why: "Made devotion audible. Proof that discipline and ecstasy are the same practice, not opposites.",
  },
  {
    id: "the-koln-concert",
    region: "music",
    title: "The Köln Concert",
    creator: "Keith Jarrett",
    year: 1975,
    why: "Made me trust that a mistake can become the theme if you stay with it long enough.",
  },
  {
    id: "in-the-mood-for-love",
    region: "film",
    title: "In the Mood for Love",
    creator: "Wong Kar-wai",
    year: 2000,
    why: "Taught me that longing is a visual language. Nothing has to happen for everything to happen.",
    connections: ["the-guest-house"],
  },
  {
    id: "spirited-away",
    region: "film",
    title: "Spirited Away",
    creator: "Hayao Miyazaki",
    year: 2001,
    why: "Wonder needs no explanation, and work can be a form of love. I left the cinema braver.",
    connections: ["tao-te-ching"],
  },
  {
    id: "2001-a-space-odyssey",
    region: "film",
    title: "2001: A Space Odyssey",
    creator: "Stanley Kubrick",
    year: 1968,
    why: "Made silence feel enormous. The first film I experienced as architecture rather than story.",
    connections: ["the-myth-of-sisyphus"],
  },
  {
    id: "the-left-hand-of-darkness",
    region: "books",
    title: "The Left Hand of Darkness",
    creator: "Ursula K. Le Guin",
    year: 1969,
    why: "Proved a novel can rebuild a whole grammar of us and them, and make the rebuilding feel like weather.",
  },
  {
    id: "the-name-of-the-rose",
    region: "books",
    title: "The Name of the Rose",
    creator: "Umberto Eco",
    year: 1980,
    why: "Made knowledge feel physical — a place with corridors, locks, and fire. I have wanted to build a library ever since.",
    note: "I read it too young, skipped half the Latin, and came back at nineteen for the ending. The labyrinth keeps its doors open.",
  },
  {
    id: "one-hundred-years-of-solitude",
    region: "books",
    title: "One Hundred Years of Solitude",
    creator: "Gabriel García Márquez",
    year: 1967,
    why: "Taught me that repetition is how grief keeps time, and that a family can be a kind of history.",
  },
  {
    id: "the-guest-house",
    region: "poetry",
    title: "The Guest House",
    creator: "Rumi",
    quote: {
      text: "This being human is a guest house.",
      attribution: "Rumi, translated by Coleman Barks",
    },
    why: "Gave me a way to host every feeling as a visitor instead of an enemy.",
    connections: ["in-the-mood-for-love"],
  },
  {
    id: "wild-geese",
    region: "poetry",
    title: "Wild Geese",
    creator: "Mary Oliver",
    quote: { text: "You do not have to be good.", attribution: "Mary Oliver" },
    why: "Permission is a form of poetry. That first line rearranged my standards from achievement to attention.",
    connections: ["meditations"],
  },
  {
    id: "archaic-torso-of-apollo",
    region: "poetry",
    title: "Archaic Torso of Apollo",
    creator: "Rainer Maria Rilke",
    quote: { text: "You must change your life.", attribution: "Rainer Maria Rilke" },
    why: "A poem that closes like a command. I still hear the last line as a door opening, not a scolding.",
  },
  {
    id: "meditations",
    region: "philosophy",
    title: "Meditations",
    creator: "Marcus Aurelius",
    quote: {
      text: "You have power over your mind — not outside events. Realize this, and you will find strength.",
      attribution: "Marcus Aurelius",
    },
    why: "Showed me philosophy as a daily practice rather than a monument. I keep a copy where I work.",
    connections: ["wild-geese"],
  },
  {
    id: "tao-te-ching",
    region: "philosophy",
    title: "Tao Te Ching",
    creator: "Laozi",
    quote: {
      text: "Nothing is softer or more flexible than water, yet nothing can resist it.",
      attribution: "Laozi, Tao Te Ching",
    },
    why: "Taught me the strength of yielding. I stopped mistaking force for progress.",
    connections: ["spirited-away"],
  },
  {
    id: "the-myth-of-sisyphus",
    region: "philosophy",
    title: "The Myth of Sisyphus",
    creator: "Albert Camus",
    quote: { text: "One must imagine Sisyphus happy.", attribution: "Albert Camus" },
    why: "Made the absurd feel like a place to live rather than a wall to argue with.",
    connections: ["2001-a-space-odyssey"],
  },
];

export const atlasRelics: AtlasRelic[] = [
  {
    id: "space-between-notes",
    region: "music",
    title: "The Space Between",
    quote: "Music is the space between the notes.",
    attribution: "Claude Debussy",
    hint: "A glint behind the trees in the Listening Glade.",
  },
  {
    id: "beauty-and-terror",
    region: "poetry",
    title: "Beauty and Terror",
    quote: "Let everything happen to you: beauty and terror.",
    attribution: "Rainer Maria Rilke",
    hint: "At night, the Poem Garden keeps a light that daylight hides.",
    night: true,
  },
  {
    id: "privilege-to-be-alive",
    region: "philosophy",
    title: "The Morning Question",
    quote: "When you arise in the morning, think of what a privilege it is to be alive.",
    attribution: "Marcus Aurelius",
    hint: "Hidden behind the standing stones on the Quiet Hill.",
  },
];

export const libraryRelic: AtlasRelic = {
  id: "paradise-library",
  region: "books",
  title: "The Reading Desk",
  quote: "I have always imagined that Paradise will be a kind of library.",
  attribution: "Jorge Luis Borges",
  hint: "Inside the Long Library.",
};

export const guideLines: string[] = [
  "Welcome to the Atlas. Every path here leads to something that shaped me.",
  "Walk anywhere — nothing is locked, some things are only hidden.",
  "The index is in the top right if you would rather read than wander.",
  "Night changes things. Rest at the fire if you want to see what the dark keeps.",
];

export const worldConfig = {
  tileSize: 16,
  tilesW: 150,
  tilesH: 104,
  spawnTile: { x: 75, y: 57 },
  campfireTile: { x: 81, y: 58 },
  signpostTile: { x: 77, y: 56 },
  guideTile: { x: 70, y: 53 },
  lake: { x: 75, y: 94, rx: 16, ry: 5.5 },
} as const;

export const regionById = new Map(atlasRegions.map((region) => [region.id, region]));
export const entryById = new Map(atlasEntries.map((entry) => [entry.id, entry]));
export const relicById = new Map([...atlasRelics, libraryRelic].map((relic) => [relic.id, relic]));
export const entriesByRegion = new Map(
  atlasRegions.map((region) => [
    region.id,
    atlasEntries.filter((entry) => entry.region === region.id),
  ]),
);

export const atlasDescription =
  "The Atlas is a walkable world of the songs, films, books, poems, and ideas that shaped how Ibtasaam Amjad thinks — five regions, hidden relics, and a night that keeps its own secrets.";
