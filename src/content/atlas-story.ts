// Safar's storyline: Pir-e-Iqbal's guided journey and the arcade of gamer years.
// All inscriptions are short, publicly attributed in-game quotes or famous references.

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
  source: string;
  motif: ArcadeMotif;
  paint: string;
  stone: string;
};

export const guideName = "Pir-e-Iqbal";
export const guideAlias = "Bireqbal";
export const guideTitle = "Guide";

// Placeholder mission statement — replace when the real one arrives.
export const missionStatement = {
  quote:
    "Either live with the apparatus of a heart charmer, or die with the misery and shame of worthlessness.",
  attribution: "My mission statement",
  note: "Inscribed at the Pond of Wisdom.",
};

export type StoryStage =
  "pond" | "introduce" | "follow" | "memory" | "gate" | "portal" | "arcade" | "done";

export const storyLines = {
  intro: [
    "I am Pir-e-Iqbal. I keep this road — the things that made you, not the things you made.",
    "Some call me Bireqbal. I answer to both.",
    "You wrote your mission on the water before you could swim. I read it every morning.",
    "Now come. Before the shelves and the songs, there is a room where it all began.",
  ],
  followStart: ["Stay close. The first door is not far.", "This way — the path remembers."],
  followNudge: ["This way, wanderer.", "Mind the path. It is older than it looks."],
  memory: [
    "2011. You wanted to play Uphill Rush. You pressed the middle mouse button, and nothing happened.",
    "You did not know it then, but that question — why is nothing happening? — was the first line of code you ever wrote.",
    "The door beside the monitor opens on every game that kept those years for you.",
  ],
  portal: ["Here it is. The arcade.", "I will be inside. After you."],
  arcade: [
    "Welcome to the arcade. Seventeen worlds, in the order they found you.",
    "Stay close. The green lowrider is where 2011 begins.",
    "Every building is open. Step inside whenever you want to look closer.",
  ],
  arcadeAgain: ["The arcade is yours to wander. The street door will take you home."],
  returnWorld: ["Back on the road. The rest of it is yours to wander."],
  freeRoam: [
    "The road is yours to wander. The arcade stays open.",
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
    source: "Carl Johnson",
    motif: "lowrider",
    paint: "#7cc36a",
    stone: "#7d7a70",
  },
  {
    id: "gta-iii",
    game: "GTA III",
    year: 2001,
    quote: "Liberty City. The worst place in America.",
    source: "Opening prologue",
    motif: "skyline",
    paint: "#ffd166",
    stone: "#7a7670",
  },
  {
    id: "gta-vice-city",
    game: "GTA: Vice City",
    year: 2002,
    quote: "Remember the name! Tommy Vercetti!",
    source: "Tommy Vercetti",
    motif: "palm",
    paint: "#ff7ab8",
    stone: "#807a74",
  },
  {
    id: "gta-iv",
    game: "GTA IV",
    year: 2008,
    quote: "Cousin! Let's go bowling!",
    source: "Roman Bellic",
    motif: "bowling",
    paint: "#e85d5d",
    stone: "#75726b",
  },
  {
    id: "gta-v",
    game: "GTA V",
    year: 2013,
    quote: "You forget a thousand things every day, pal. Make sure this is one of 'em.",
    source: "Michael De Santa",
    motif: "helicopter",
    paint: "#ff9f43",
    stone: "#7c7870",
  },
  {
    id: "assassins-creed",
    game: "Assassin's Creed",
    year: 2007,
    quote: "Nothing is true; everything is permitted.",
    source: "The Creed",
    motif: "hood",
    paint: "#f2ecdd",
    stone: "#787570",
  },
  {
    id: "watch-dogs",
    game: "Watch Dogs",
    year: 2014,
    quote:
      "Everything is connected. And I'll use that to expose, to protect, and, if necessary, to punish.",
    source: "Aiden Pearce",
    motif: "signal",
    paint: "#56e0ff",
    stone: "#727678",
  },
  {
    id: "minecraft",
    game: "Minecraft",
    year: 2011,
    quote: "and the universe said I love you",
    source: "The End Poem",
    motif: "block",
    paint: "#7cc36a",
    stone: "#79766d",
  },
  {
    id: "among-us",
    game: "Among Us",
    year: 2018,
    quote: "I do not want to alarm you, but there is an Impostor among us.",
    source: "Red",
    motif: "crewmate",
    paint: "#e84a5f",
    stone: "#7b7470",
  },
  {
    id: "mortal-kombat",
    game: "Mortal Kombat",
    year: 1992,
    quote: "Finish him!",
    source: "The announcer",
    motif: "dragon",
    paint: "#ffcf33",
    stone: "#7d776a",
  },
  {
    id: "call-of-duty",
    game: "Call of Duty",
    year: 2003,
    quote: "Fifty thousand people used to live in this city. Now it's a ghost town.",
    source: "Captain MacMillan",
    motif: "soldier",
    paint: "#9aa46a",
    stone: "#767268",
  },
  {
    id: "igi",
    game: "Project I.G.I.",
    year: 2000,
    quote: "I'm going in.",
    source: "The game's own subtitle",
    motif: "scope",
    paint: "#6fa8dc",
    stone: "#6f7278",
  },
  {
    id: "tekken",
    game: "Tekken",
    year: 1994,
    quote: "Get ready for the next battle.",
    source: "The announcer",
    motif: "fist",
    paint: "#b58cff",
    stone: "#777370",
  },
  {
    id: "fifa",
    game: "FIFA",
    year: 1993,
    quote: "This is the beautiful game.",
    source: "FIFA 06 introduction",
    motif: "ball",
    paint: "#e8f2f2",
    stone: "#747872",
  },
  {
    id: "cricket-07",
    game: "Cricket 07",
    year: 2006,
    quote: "Terrible running by the batsmen.",
    source: "Richie Benaud",
    motif: "cricket",
    paint: "#d9a066",
    stone: "#7d7568",
  },
  {
    id: "wwe-2k15",
    game: "WWE 2K15",
    year: 2014,
    quote: "The champ is here!",
    source: "John Cena",
    motif: "belt",
    paint: "#ffd166",
    stone: "#7c736a",
  },
  {
    id: "far-cry-3",
    game: "Far Cry 3",
    year: 2012,
    quote: "Did I ever tell you the definition of insanity?",
    source: "Vaas Montenegro",
    motif: "island",
    paint: "#5fd3a6",
    stone: "#73786e",
  },
];

export type ArcadeBuilding = {
  id: string;
  buildingName: string;
  roomName: string;
  facadeSign: string;
  setting: string;
};

export const arcadeBuildings: ArcadeBuilding[] = [
  {
    id: "gta-san-andreas",
    buildingName: "Grove Street House",
    roomName: "Johnson Living Room",
    facadeSign: "GROVE ST.",
    setting: "Grove Street, Los Santos",
  },
  {
    id: "gta-iii",
    buildingName: "Luigi's Club",
    roomName: "Luigi's Back Room",
    facadeSign: "LUIGI'S",
    setting: "Red Light District, Liberty City",
  },
  {
    id: "gta-vice-city",
    buildingName: "The Malibu Club",
    roomName: "The Malibu Floor",
    facadeSign: "MALIBU",
    setting: "Vice Beach",
  },
  {
    id: "gta-iv",
    buildingName: "Roman's Cab Depot",
    roomName: "The Cab Office",
    facadeSign: "ROMAN'S CAB",
    setting: "Broker, Liberty City",
  },
  {
    id: "gta-v",
    buildingName: "Michael's Mansion",
    roomName: "De Santa Living Room",
    facadeSign: "DE SANTA",
    setting: "Rockford Hills, Los Santos",
  },
  {
    id: "assassins-creed",
    buildingName: "Villa Auditore",
    roomName: "The Auditore Study",
    facadeSign: "VILLA AUDITORE",
    setting: "Monteriggioni",
  },
  {
    id: "watch-dogs",
    buildingName: "Blume Data Center",
    roomName: "The ctOS Server Hall",
    facadeSign: "BLUME",
    setting: "Chicago",
  },
  {
    id: "minecraft",
    buildingName: "Village House",
    roomName: "The Block House",
    facadeSign: "VILLAGE",
    setting: "The Overworld",
  },
  {
    id: "among-us",
    buildingName: "The Skeld",
    roomName: "The Skeld Cafeteria",
    facadeSign: "THE SKELD",
    setting: "Deep space",
  },
  {
    id: "mortal-kombat",
    buildingName: "Wu Shi Academy",
    roomName: "The Dragon Temple",
    facadeSign: "WU SHI",
    setting: "Earthrealm",
  },
  {
    id: "call-of-duty",
    buildingName: "Pripyat Apartment",
    roomName: "The Ruined Apartment",
    facadeSign: "PRIPYAT",
    setting: "Pripyat, Ukraine",
  },
  {
    id: "igi",
    buildingName: "Radar Bunker",
    roomName: "The Command Bunker",
    facadeSign: "RADAR",
    setting: "The I.G.I. compound",
  },
  {
    id: "tekken",
    buildingName: "Mishima Dojo",
    roomName: "Hon-Maru Dojo",
    facadeSign: "MISHIMA",
    setting: "Japan",
  },
  {
    id: "fifa",
    buildingName: "The Stadium",
    roomName: "The Locker Room",
    facadeSign: "FIFA",
    setting: "Matchday",
  },
  {
    id: "cricket-07",
    buildingName: "The Pavilion",
    roomName: "The Long Room",
    facadeSign: "PAVILION",
    setting: "The Ground",
  },
  {
    id: "wwe-2k15",
    buildingName: "The Arena",
    roomName: "The Champions' Room",
    facadeSign: "WWE",
    setting: "The Arena",
  },
  {
    id: "far-cry-3",
    buildingName: "Vaas's Camp",
    roomName: "The Pirate Hut",
    facadeSign: "VAAS",
    setting: "Rook Islands",
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
  portal: { x: 55.4, y: 62.4 },
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
  gatePath: [
    { x: 60.2, y: 64.9 },
    { x: 59.1, y: 64.4 },
    { x: 57.7, y: 63.5 },
    { x: 56.3, y: 62.9 },
  ],
} as const;

export type ArcadeZoneSide = "left" | "top" | "right";

export type ArcadeZoneTheme =
  | "road"
  | "liberty"
  | "neon"
  | "brick"
  | "sunset"
  | "creed"
  | "ctos"
  | "blocks"
  | "ship"
  | "temple"
  | "war"
  | "snow"
  | "dojo"
  | "pitch"
  | "crease"
  | "ring"
  | "jungle";

export type ArcadeZone = {
  id: string;
  x: number;
  y: number;
  side: ArcadeZoneSide;
  rotation: number;
  theme: ArcadeZoneTheme;
};

export const arcadeDimension = {
  w: 96,
  h: 64,
  center: { x: 48, y: 32 },
  island: { x: 4, y: 4, w: 88, h: 56 },
  entrance: { x: 48, y: 58.4 },
  spawn: { x: 45.4, y: 55.2 },
  guide: { x: 43.8, y: 54.6 },
  bounds: { x: 6, y: 6, w: 84, h: 51 },
} as const;

const LEFT_ZONES = [
  ["gta-san-andreas", "road"],
  ["gta-iii", "liberty"],
  ["gta-vice-city", "neon"],
  ["gta-iv", "brick"],
  ["gta-v", "sunset"],
  ["assassins-creed", "creed"],
] as const;

const TOP_ZONES = [
  ["watch-dogs", "ctos"],
  ["minecraft", "blocks"],
  ["among-us", "ship"],
  ["mortal-kombat", "temple"],
  ["call-of-duty", "war"],
] as const;

const RIGHT_ZONES = [
  ["igi", "snow"],
  ["tekken", "dojo"],
  ["fifa", "pitch"],
  ["cricket-07", "crease"],
  ["wwe-2k15", "ring"],
  ["far-cry-3", "jungle"],
] as const;

export const arcadeZones: ArcadeZone[] = [
  ...LEFT_ZONES.map(([id, theme], index) => ({
    id,
    x: 16,
    y: 50 - index * 8,
    side: "left" as const,
    rotation: -Math.PI / 2,
    theme,
  })),
  ...TOP_ZONES.map(([id, theme], index) => ({
    id,
    x: 28 + index * 12,
    y: 9,
    side: "top" as const,
    rotation: 0,
    theme,
  })),
  ...RIGHT_ZONES.map(([id, theme], index) => ({
    id,
    x: 84,
    y: 10 + index * 8,
    side: "right" as const,
    rotation: Math.PI / 2,
    theme,
  })),
];

export type ArcadePropKind =
  "blocks" | "bowling" | "crate" | "football" | "cricket" | "palm" | "dragon" | "tokens";

export type ArcadeProp = {
  kind: ArcadePropKind;
  x: number;
  y: number;
};

export const arcadeProps: ArcadeProp[] = [
  { kind: "tokens", x: 48, y: 43 },
  { kind: "crate", x: 33.5, y: 32 },
  { kind: "bowling", x: 62.5, y: 32 },
  { kind: "palm", x: 38, y: 39.5 },
  { kind: "football", x: 58, y: 39.5 },
  { kind: "blocks", x: 40, y: 24.5 },
  { kind: "cricket", x: 56, y: 24.5 },
  { kind: "dragon", x: 48, y: 21 },
];

export const arcadeTour = {
  intro: "Stay close. Seventeen buildings, in the order they found you. We begin at the lowrider.",
  outro:
    "That was the avenue. Every one of these worlds left something behind, and every door is still open. The street door will take you back.",
  stops: {
    "gta-san-andreas":
      "2011. San Andreas gave you a whole state and a green lowrider. Then a middle mouse button refused to work. This is where the road starts.",
    "gta-iii":
      "Liberty City, 2001. Three islands, one yellow taxi, and a city that felt like it might keep going forever.",
    "gta-vice-city":
      "Vice City, 1986. Neon, palms, and a stolen empire. The first time a place had a colour of its own.",
    "gta-iv":
      "Liberty again, older and colder. Cousin, let's go bowling; the city was never just the mission.",
    "gta-v": "Los Santos, 2013. Three lives, one city, and a sky you could steal.",
    "assassins-creed":
      "The Creed: nothing is true; everything is permitted. The first game that asked you to climb toward a question.",
    "watch-dogs":
      "A city wired to itself. Everything is connected — even the things you would rather forget.",
    minecraft:
      "A world made of blocks. You could dig, build, and leave a mark; even this island is made of that idea.",
    "among-us": "A small ship and a liar among the crew. You learned to watch your friends.",
    "mortal-kombat": "Finish him! The first time a game shouted back.",
    "call-of-duty":
      "Fifty thousand people used to live here. War had a history, and the history had a voice.",
    igi: "I'm going in. The first mission you took alone.",
    tekken:
      "Get ready for the next battle. Fists, family, and a tournament that never really ended.",
    fifa: "This is the beautiful game.",
    "cricket-07":
      "Terrible running by the batsmen. A summer game with a commentary voice you can still hear.",
    "wwe-2k15": "The champ is here. The spectacle, the entrance, the roar.",
    "far-cry-3": "Did I ever tell you the definition of insanity? The last door on this road.",
  } as Record<string, string>,
} as const;
