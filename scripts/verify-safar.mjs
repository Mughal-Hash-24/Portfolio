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
  "arcade welcome starts at 2011 with San Andreas and the following games",
  story.storyLines.arcade[0].includes("2011") &&
    /lowrider|San Andreas/i.test(story.storyLines.arcade[0]) &&
    story.storyLines.arcade[1].includes("III") &&
    story.storyLines.arcade[1].includes("Vice City") &&
    story.storyLines.arcade[1].includes("IV"),
);
check("story contains a follow stage and a gate stage", story.storyWorld.gatePath.length === 4);

check("seventeen monuments", story.arcadeStatues.length === 17, String(story.arcadeStatues.length));
check("arcade props", story.arcadeProps.length === 8, String(story.arcadeProps.length));
check("custom arcade dimension", story.arcadeDimension.w === 46 && story.arcadeDimension.h === 34);

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

console.log("\nINSCRIPTIONS");
for (const row of rows) {
  console.log(`${row.game} (${row.year}) — ${row.source} — “${row.quote}”`);
}

if (failures > 0) {
  console.error(`\n${failures} verification failures`);
  process.exit(1);
}

console.log("\nAll Safar content, audio, card, story and monument wiring checks passed.");
