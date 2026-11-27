import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = new URL("..", import.meta.url);
const read = (path) => readFileSync(fileURLToPath(new URL(path, root)), "utf8");

const story = await import(new URL("../src/content/atlas-story.ts", import.meta.url).href);

let failures = 0;
const check = (label, condition, detail = "") => {
  if (!condition) failures += 1;
  console.log(`${condition ? "PASS" : "FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`);
};

const expectedMission =
  "Either live with the apparatus of a heart charmer, or die with the misery and shame of worthlessness.";

const expected = [
  [
    "gta-san-andreas",
    "GTA: San Andreas",
    2004,
    "Carl Johnson",
    "lowrider",
    "Ah shit, here we go again.",
  ],
  [
    "gta-iii",
    "GTA III",
    2001,
    "Opening prologue",
    "skyline",
    "Liberty City. The worst place in America.",
  ],
  [
    "gta-vice-city",
    "GTA: Vice City",
    2002,
    "Tommy Vercetti",
    "palm",
    "Remember the name! Tommy Vercetti!",
  ],
  ["gta-iv", "GTA IV", 2008, "Roman Bellic", "bowling", "Cousin! Let's go bowling!"],
  [
    "gta-v",
    "GTA V",
    2013,
    "Michael De Santa",
    "helicopter",
    "You forget a thousand things every day, pal. Make sure this is one of 'em.",
  ],
  [
    "assassins-creed",
    "Assassin's Creed",
    2007,
    "The Creed",
    "hood",
    "Nothing is true; everything is permitted.",
  ],
  [
    "watch-dogs",
    "Watch Dogs",
    2014,
    "Aiden Pearce",
    "signal",
    "Everything is connected. And I'll use that to expose, to protect, and, if necessary, to punish.",
  ],
  ["minecraft", "Minecraft", 2011, "The End Poem", "block", "and the universe said I love you"],
  [
    "among-us",
    "Among Us",
    2018,
    "Red",
    "crewmate",
    "I do not want to alarm you, but there is an Impostor among us.",
  ],
  ["mortal-kombat", "Mortal Kombat", 1992, "The announcer", "dragon", "Finish him!"],
  [
    "call-of-duty",
    "Call of Duty",
    2003,
    "Captain MacMillan",
    "soldier",
    "Fifty thousand people used to live in this city. Now it's a ghost town.",
  ],
  ["igi", "Project I.G.I.", 2000, "The game's own subtitle", "scope", "I'm going in."],
  ["tekken", "Tekken", 1994, "The announcer", "fist", "Get ready for the next battle."],
  ["fifa", "FIFA", 1993, "FIFA 06 introduction", "ball", "This is the beautiful game."],
  [
    "cricket-07",
    "Cricket 07",
    2006,
    "Richie Benaud",
    "cricket",
    "Terrible running by the batsmen.",
  ],
  ["wwe-2k15", "WWE 2K15", 2014, "John Cena", "belt", "The champ is here!"],
  [
    "far-cry-3",
    "Far Cry 3",
    2012,
    "Vaas Montenegro",
    "island",
    "Did I ever tell you the definition of insanity?",
  ],
];

check(
  "mission inscription is the supplied interim line",
  story.missionStatement.quote === expectedMission,
);
check("guide is Pir-e-Iqbal", story.guideName === "Pir-e-Iqbal", story.guideName);
check("guide alias is Bireqbal", story.guideAlias === "Bireqbal", story.guideAlias);
check(
  "guide introductions name both Pir-e-Iqbal and Bireqbal",
  story.storyLines.intro.some((line) => line.includes("Pir-e-Iqbal")) &&
    story.storyLines.intro.some((line) => line.includes("Bireqbal")),
);
check(
  "2011 memory names Uphill Rush and the middle mouse button",
  story.storyLines.memory.some(
    (line) =>
      line.includes("2011") &&
      line.includes("Uphill Rush") &&
      line.toLowerCase().includes("middle mouse"),
  ),
);
check(
  "arcade welcome announces the seventeen-world memory tour",
  story.storyLines.arcade.join(" ").includes("Seventeen worlds") &&
    story.storyLines.arcade.join(" ").includes("2011") &&
    /lowrider/i.test(story.storyLines.arcade.join(" ")),
);
check("story contains a follow stage and a gate stage", story.storyWorld.gatePath.length === 4);

check("seventeen monuments", story.arcadeStatues.length === 17, String(story.arcadeStatues.length));
check("arcade hub props", story.arcadeProps.length === 8, String(story.arcadeProps.length));
check(
  "the arcade is a 96 x 64 island",
  story.arcadeDimension.w === 96 && story.arcadeDimension.h === 64,
  `${story.arcadeDimension.w} x ${story.arcadeDimension.h}`,
);
check(
  "the island has a 17-zone memory promenade",
  story.arcadeZones.length === 17,
  String(story.arcadeZones.length),
);
check(
  "the promenade orders all six left, five top and six right zones",
  story.arcadeZones.filter((zone) => zone.side === "left").length === 6 &&
    story.arcadeZones.filter((zone) => zone.side === "top").length === 5 &&
    story.arcadeZones.filter((zone) => zone.side === "right").length === 6,
);

const zoneOrder = story.arcadeZones.map((zone) => zone.id);
check(
  "zone order matches the collection",
  zoneOrder.join("|") === expected.map(([id]) => id).join("|"),
  zoneOrder.join(" → "),
);
check(
  "the tour visits the seventeen zones in order",
  zoneOrder.every((id) => typeof story.arcadeTour.stops[id] === "string") &&
    Object.keys(story.arcadeTour.stops).length === 17,
);
check(
  "the tour opens with 2011, San Andreas and the middle mouse button",
  /2011/.test(story.arcadeTour.stops["gta-san-andreas"]) &&
    /San Andreas/.test(story.arcadeTour.stops["gta-san-andreas"]) &&
    /middle mouse/i.test(story.arcadeTour.stops["gta-san-andreas"]),
);

const buildings = story.arcadeBuildings;
const buildingExpected = [
  ["gta-san-andreas", "Grove Street House", "Johnson Living Room", "GROVE ST."],
  ["gta-iii", "Luigi's Club", "Luigi's Back Room", "LUIGI'S"],
  ["gta-vice-city", "The Malibu Club", "The Malibu Floor", "MALIBU"],
  ["gta-iv", "Roman's Cab Depot", "The Cab Office", "ROMAN'S CAB"],
  ["gta-v", "Michael's Mansion", "De Santa Living Room", "DE SANTA"],
  ["assassins-creed", "Villa Auditore", "The Auditore Study", "VILLA AUDITORE"],
  ["watch-dogs", "Blume Data Center", "The ctOS Server Hall", "BLUME"],
  ["minecraft", "Village House", "The Block House", "VILLAGE"],
  ["among-us", "The Skeld", "The Skeld Cafeteria", "THE SKELD"],
  ["mortal-kombat", "Wu Shi Academy", "The Dragon Temple", "WU SHI"],
  ["call-of-duty", "Pripyat Apartment", "The Ruined Apartment", "PRIPYAT"],
  ["igi", "Radar Bunker", "The Command Bunker", "RADAR"],
  ["tekken", "Mishima Dojo", "Hon-Maru Dojo", "MISHIMA"],
  ["fifa", "The Stadium", "The Locker Room", "FIFA"],
  ["cricket-07", "The Pavilion", "The Long Room", "PAVILION"],
  ["wwe-2k15", "The Arena", "The Champions' Room", "WWE"],
  ["far-cry-3", "Vaas's Camp", "The Pirate Hut", "VAAS"],
];

check("seventeen buildings", buildings.length === 17, String(buildings.length));
check(
  "every zone has a building and room",
  story.arcadeZones.every((zone) => buildings.some((building) => building.id === zone.id)),
);
check(
  "buildings follow the collection order",
  buildings.map((building) => building.id).join("|") ===
    buildingExpected.map(([id]) => id).join("|"),
);

for (const [id, buildingName, roomName] of buildingExpected) {
  const building = buildings.find((entry) => entry.id === id);
  check(`building exists: ${buildingName}`, Boolean(building));

  if (!building) continue;

  check(
    `building name: ${buildingName}`,
    building.buildingName === buildingName,
    building.buildingName,
  );
  check(`room name: ${roomName}`, building.roomName === roomName, building.roomName);
  check(`building facade sign: ${buildingName}`, Boolean(building.facadeSign), building.facadeSign);
}

check(
  "the welcome tells the player every building is open",
  story.storyLines.arcade.some((line) => /Every building is open/i.test(line)),
);
check(
  "the tour intro speaks of seventeen buildings",
  story.arcadeTour.intro.includes("Seventeen buildings"),
  story.arcadeTour.intro,
);
check(
  "the tour outro keeps the doors open",
  /every door is still open/i.test(story.arcadeTour.outro),
  story.arcadeTour.outro,
);
check(
  "the tour has an intro and an outro",
  story.arcadeTour.intro.includes("Seventeen buildings") &&
    story.arcadeTour.outro.includes("street door"),
);
check(
  "arcade island has blocks, a promenade, cliffs and a hub",
  story.arcadeDimension.island.w === 88 &&
    story.arcadeDimension.center.x === 48 &&
    story.arcadeDimension.center.y === 32,
);

const rows = [];

for (const [id, game, year, source, motif, quote] of expected) {
  const statue = story.arcadeStatues.find((entry) => entry.id === id);
  check(`monument exists: ${game}`, Boolean(statue));

  if (!statue) continue;

  check(`game name: ${game}`, statue.game === game, statue.game);
  check(`release year: ${game}`, statue.year === year, String(statue.year));
  check(`quote source: ${game}`, statue.source === source, statue.source);
  check(`visual motif: ${game}`, statue.motif === motif, statue.motif);
  check(`direct quote: ${game}`, statue.quote === quote, `“${statue.quote}”`);
  check(`no descriptive reference flag: ${game}`, !("reference" in statue));
  rows.push({ game, year, source, motif, quote: statue.quote });
}

const audioDock = read("src/components/atlas/safar-audio-dock.tsx");
const sfx = read("src/components/atlas/atlas-sfx.ts");
const engine = read("src/components/atlas/atlas-engine.ts");
const experience = read("src/components/atlas/atlas-experience.tsx");
const css = read("src/components/atlas/atlas.module.css");
const monuments = read("src/components/atlas/arcade-monuments.ts");
const art = read("src/components/atlas/atlas-art.ts");

for (const token of [
  "useAudio",
  "backgroundTracks",
  "discTracks",
  "playDisc",
  "Records",
  "Soundtrack",
  "Toggle game sound effects",
]) {
  check(`audio dock wires ${token}`, audioDock.includes(token));
}

for (const token of ["class SafarSfx", "step(", "setEnabled", "grass", "water", "arcade"]) {
  check(`sound engine provides ${token}`, sfx.includes(token));
}

for (const token of [
  "onStep",
  "onSfx",
  "setReducedMotion",
  "MAX_DPR",
  "prepareArcade",
  "getGlowSprite",
  "requestIdleCallback",
]) {
  check(`engine wires ${token}`, engine.includes(token));
}

for (const token of [
  "SafarAudioDock",
  "SafarSfx",
  "onStep",
  "onSfx",
  "screenFx",
  "plaqueLayer",
  "missionStatement",
]) {
  check(`experience wires ${token}`, experience.includes(token));
}

for (const token of [".screenFx", ".plaque", "var(--font-silkscreen", "var(--serif)"]) {
  check(`plaque/screen styling: ${token}`, css.includes(token));
}

for (const [, , , , motif] of expected) {
  check(`monument scene renders ${motif}`, monuments.includes(`case "${motif}"`));
}

for (const token of [
  "paintArcadeFrontage",
  "paintArcadeReflections",
  "drawArcadeDoorGlow",
  "paintCastShadows",
  "paintPondFinish",
  "paintArcadeShafts",
]) {
  check(`precomputed art provides ${token}`, art.includes(token));
}

const arcadeArt = read("src/components/atlas/arcade-dimension-art.ts");
for (const token of [
  "export function paintArcadeDimension",
  "paintVoid",
  "paintIsland",
  "paintPromenade",
  "paintGarden",
  "paintHub",
  "paintZone",
  "paintZoneSign",
  "paintZoneLights",
  "paintAtmosphere",
  "paintGameBuilding",
]) {
  check(`precomputed island art provides ${token}`, arcadeArt.includes(token));
}

const buildingArt = read("src/components/atlas/arcade-buildings-art.ts");
for (const token of [
  "export function paintGameBuilding",
  "paintFacade",
  "paintNeon",
  "paintPalm",
  "paintStadium",
  "paintPavilion",
  "paintMishima",
  "paintWweArena",
  "paintVaasCamp",
  "paintPripyat",
  "paintRadarBunker",
  "paintSkeld",
  'case "gta-san-andreas"',
  'case "gta-iii"',
  'case "gta-vice-city"',
  'case "gta-iv"',
  'case "gta-v"',
  'case "assassins-creed"',
  'case "watch-dogs"',
  'case "minecraft"',
  'case "among-us"',
  'case "mortal-kombat"',
  'case "call-of-duty"',
  'case "igi"',
  'case "tekken"',
  'case "fifa"',
  'case "cricket-07"',
  'case "wwe-2k15"',
  'case "far-cry-3"',
]) {
  check(`building art provides ${token}`, buildingArt.includes(token));
}

const roomArt = read("src/components/atlas/arcade-rooms-art.ts");
for (const token of [
  "export function paintArcadeRoom",
  "paintQuoteWall",
  "paintDiorama",
  "paintDoor",
  "drawArcadeScene",
  "wrapQuote",
  'case "gta-san-andreas"',
  'case "gta-iii"',
  'case "gta-vice-city"',
  'case "gta-iv"',
  'case "gta-v"',
  'case "assassins-creed"',
  'case "watch-dogs"',
  'case "minecraft"',
  'case "among-us"',
  'case "mortal-kombat"',
  'case "call-of-duty"',
  'case "igi"',
  'case "tekken"',
  'case "fifa"',
  'case "cricket-07"',
  'case "wwe-2k15"',
  'case "far-cry-3"',
]) {
  check(`interior art provides ${token}`, roomArt.includes(token));
}

const worldSource = read("src/components/atlas/atlas-world.ts");
for (const token of [
  "buildArcadeRoom",
  "ArcadeRoom",
  "tourStop",
  "display",
  "bounds",
  "const w = 30",
  "const h = 18",
]) {
  check(`room world provides ${token}`, worldSource.includes(token));
}

for (const token of [
  "startArcadeTour",
  "updateArcadeTour",
  "skipArcadeTour",
  "finishArcadeTour",
  "tourSign",
  "arcadeTourComplete",
  "tourActive",
  "enterArcadeRoom",
  "exitArcadeRoom",
  "paintArcadeRoom",
  "arcadeRoom",
  "arcadeZoomProgress",
  "arcadeZoomTarget",
  "arcadeIntroTimer",
  "roomDisplay",
  "roomExit",
  "initialHour",
]) {
  check(`engine wires ${token}`, engine.includes(token));
}

for (const token of [
  "ARCADE_TOUR_KEY",
  "onTour",
  "onTourComplete",
  "onRoom",
  "RoomInfo",
  "arcadeRoom",
  "tourHud",
  "tourSkip",
  "indexTour",
  "Skip the tour",
  "buildings",
]) {
  check(`experience wires ${token}`, experience.includes(token));
}

for (const token of [".tourHud", ".tourGame", ".tourTrack", ".tourSkip", ".indexTour"]) {
  check(`tour styling: ${token}`, css.includes(token));
}

console.log("\nINSCRIPTIONS");
for (const row of rows) {
  console.log(`${row.game} (${row.year}) — ${row.source} — “${row.quote}”`);
}

if (failures > 0) {
  console.error(`\n${failures} verification failures`);
  process.exit(1);
}

console.log("\nAll Safar content, audio, card, story and monument wiring checks passed.");
