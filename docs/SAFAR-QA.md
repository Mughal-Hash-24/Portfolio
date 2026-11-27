# Safar QA dossier

This is the evidence trail for the Safar rebuild: the sounds, the music library, the guide's
journey, the arcade, all seventeen monuments, the in-game quote plaques, and the final
performance budget.

Production review server: `http://localhost:3000/safar`.

## Reproduce the content and wiring checks

```bash
npm run verify:safar
```

The committed verifier (`scripts/verify-safar.mjs`) asserts the full content graph and the
integration points for audio, the plaque, the guide, the gate and the monument renderer. Its
output is saved at [`verify-safar.txt`](./qa/safar/verify-safar.txt). It covers:

- the exact interim mission inscription supplied in the brief;
- the guide, including the **Pir-e-Iqbal / Bireqbal** names;
- the 2011 Uphill Rush / middle-mouse memory;
- the arcade intro that starts at 2011 with San Andreas, then III, Vice City, IV and V;
- all 17 monuments, their game, release year, quote, source, motif and no reference-only flags;
- the audio dock's `useAudio`/library/soundtrack/FX wiring;
- the `SafarSfx` surface list and engine `onStep`/`onSfx` integration;
- the plaque markup/CSS (Silkscreen title, Iowan serif quote) and the CSS screen grade;
- the precomputed art passes (frontage, reflections, door glow, shadows, pond finish, shafts).

Checks: `npm run lint`, `npm run typecheck`, `npm run format:check`, `npm run build` all pass.

## Audio and music

Screenshots:

- [`08-audio.jpg`](./qa/safar/08-audio.jpg) — the sound dock: **Subwoofer Lullaby — PLAYING**,
  Game Sound on, Mute / Next / Library.
- [`09-library-records.jpg`](./qa/safar/09-library-records.jpg) — **22** music discs.
- [`10-library-soundtrack.jpg`](./qa/safar/10-library-soundtrack.jpg) — **70** soundtrack tracks.
- [`11-sweden-playing.jpg`](./qa/safar/11-sweden-playing.jpg) — choosing **Sweden** from the
  library changes the dock to **Sweden — PLAYING**.

The dock is wired to the site's existing `useAudio()` and `backgroundTracks` / `discTracks`
library, so it is the same Minecraft soundtrack and disc archive as the rest of the site. The
audio survives client navigation through the root provider. Music starts from the _Walk in_
gesture.

Footsteps and ambience are synthesized in `src/components/atlas/atlas-sfx.ts` (no new audio
assets). Runtime probe on the QA build:

```json
{
  "enabledWalk": { "oscillators": 6, "sources": 4 },
  "switchAfterClick": "false",
  "mutedWalk": { "oscillators": 0, "sources": 0 },
  "enabledMuted": true
}
```

Full report: [`sfx-report.json`](./qa/safar/sfx-report.json). Surfaces: grass swish, path dirt,
stone, wood, water, arcade. Ambient birds/crickets/arcade hum and interaction sounds are gated by
the same switch and tab visibility.

## The guide and the journey

The guide is **Pir-e-Iqbal**, and his intro now also says _"Some call me Bireqbal. I answer to
both."_ — the alternate name from your latest note.

Screenshots in order:

1. [`02-mission.jpg`](./qa/safar/02-mission.jpg) — the Pond of Wisdom inscription.
2. [`03-guide.jpg`](./qa/safar/03-guide.jpg) — Pir-e-Iqbal's introduction.
3. [`03b-bireqbal.jpg`](./qa/safar/03b-bireqbal.jpg) — the Bireqbal alias line.
4. [`04-follow.jpg`](./qa/safar/04-follow.jpg) — the follow-the-guide walk.
5. [`05-2011.jpg`](./qa/safar/05-2011.jpg) — the 2011 Uphill Rush memory: CRT browser, mouse with
   the gold middle button, 2011 plaque, the guide.
6. [`06-arcade-front.jpg`](./qa/safar/06-arcade-front.jpg) — the guide leads to the built ARCADE
   marquee, not a stone portal.
7. [`06b-arcade-door.jpg`](./qa/safar/06b-arcade-door.jpg) — the prompt **The Arcade / Step
   inside** at the door.
8. [`19-buildings-close.jpg`](./qa/safar/19-buildings-close.jpg) — the close play camera on the
   promenade: Grove Street, Luigi's Club and the Malibu Club, with the player at the door.
9. [`18-interior-gta-iii.jpg`](./qa/safar/18-interior-gta-iii.jpg) — inside Luigi's Club; the
   skyline/taxi diorama, the bar, the shelf and the wall inscription.
10. [`20-mobile-building.jpg`](./qa/safar/20-mobile-building.jpg) — 390×844: the Minecraft village
    building, its door prompt and the close camera.
11. [`21-mobile-interior-minecraft.jpg`](./qa/safar/21-mobile-interior-minecraft.jpg) — 390×844:
    the Minecraft interior, creeper diorama and End Poem inscription.

The live sequence: `follow → memory` (2011 line) `→ portal → arcade`. At the door the prompt is
**The Arcade / Step inside**; after E the location becomes **The Arcade**, the guide says
_"Welcome to the arcade. Seventeen worlds, in the order they found you."_ and then the 17-stop
memory tour begins. The return street door and persisted story completion are unchanged.

## The arcade: seventeen game buildings, seventeen interiors

The arcade is a **96 × 64 floating game district**, not a hall of niches. The U-shaped memory
promenade now holds **17 game-specific buildings**, and every building is enterable into its own
painted interior:

| Zone             | Building           | Interior             |
| ---------------- | ------------------ | -------------------- |
| GTA: San Andreas | Grove Street House | Johnson Living Room  |
| GTA III          | Luigi's Club       | Luigi's Back Room    |
| GTA: Vice City   | The Malibu Club    | The Malibu Floor     |
| GTA IV           | Roman's Cab Depot  | The Cab Office       |
| GTA V            | Michael's Mansion  | De Santa Living Room |
| Assassin's Creed | Villa Auditore     | The Auditore Study   |
| Watch Dogs       | Blume Data Center  | The ctOS Server Hall |
| Minecraft        | Village House      | The Block House      |
| Among Us         | The Skeld          | The Skeld Cafeteria  |
| Mortal Kombat    | Wu Shi Academy     | The Dragon Temple    |
| Call of Duty     | Pripyat Apartment  | The Ruined Apartment |
| Project I.G.I.   | Radar Bunker       | The Command Bunker   |
| Tekken           | Mishima Dojo       | Hon-Maru Dojo        |
| FIFA             | The Stadium        | The Locker Room      |
| Cricket 07       | The Pavilion       | The Long Room        |
| WWE 2K15         | The Arena          | The Champions' Room  |
| Far Cry 3        | Vaas's Camp        | The Pirate Hut       |

Each exterior is a bespoke facade with the game's architectural identity and sign — Grove Street's
porch, garage and lowrider; Luigi's neon and awning; the Malibu's deco pink; Roman's roll-up cab
depot; the De Santa glass villa; the Auditore tower; Blume's server glass; the village's block
house; the Skeld hull; the Wu Shi pagoda; the broken Pripyat block; the radar bunker; the Mishima
dojo; the stadium; the white cricket pavilion; the arena marquee; Vaas's tiki camp. Approaching a
door prompts **Enter · [building]**, and E opens that building's interior as a close-camera scene.

The 17 interiors are 30 × 18 rooms with custom floors, walls, lighting, furniture and props, plus
the game's existing diorama and an in-theme wall plaque carrying the direct quote, source, year
and setting. Examples: the lowrider in the Johnson living room; the skyline/taxi, bar and booths
of Luigi's; the Malibu dance floor and bar; the cab-office map and bowling pins; the modern De
Santa room; the Auditore shelves and banners; the ctOS racks, monitors and camera; the crafting
table, furnace, chest and creeper; the Skeld cafeteria, vents and star window; the Wu Shi gong,
throne and dragon; the Pripyat broken window, sandbags and gas mask; the bunker map table and
screens; the dojo mats, lanterns and gong; the FIFA lockers, jerseys and tactics board; the
pavilion scoreboard, bats and stumps; the WWE lockers, title case and steel chair; the pirate
hut's skulls, bar, radio and torch. The display inside also opens the existing quote card.

Evidence:

- [`19-buildings-close.jpg`](./qa/safar/19-buildings-close.jpg) — live 1920×1080 close play view.
- [`18-interior-gta-iii.jpg`](./qa/safar/18-interior-gta-iii.jpg) — live Luigi's interior.
- [`20-mobile-building.jpg`](./qa/safar/20-mobile-building.jpg) and
  [`21-mobile-interior-minecraft.jpg`](./qa/safar/21-mobile-interior-minecraft.jpg) — mobile.
- [`monuments.jpg`](./qa/safar/monuments.jpg) — the dioramas now installed inside the buildings.

All 17 buildings and interiors were rendered at runtime in a smoke pass (`enterArcadeRoom` for
every id, paint + render, no errors), and the real door loop (prompt → E → interior → display card
→ promenade door) was exercised in the production build.

### Camera: establish wide, play close

The camera keeps the old 1.55× desktop / 1.25× mobile establishing view for the first 2.4 s of
entry, then eases to a **2.0× desktop / 1.62× mobile** play view (the tour start also targets the
close view). This makes the player and guide roughly 30% larger while keeping the district
readable. Interiors automatically use a close room camera (the 480×288 room fills the screen).
The room camera, location label, display card and promenade exit were all exercised in production.

### The guide-led memory tour

The 17-stop story survives the rebuild. The guide stops **on the promenade beside each building**
(not through a facade), speaks the game-specific line, and waits 2.2 s for the player to walk the
short distance to the door and step inside. The HUD shows `Memory Tour · n/17 · game`, the
off-screen chevron points back to the guide, and `Skip tour` remains available. Completion is
stored under `safar:arcade-tour:v1`; the ticket booth and Journal replay it. A full runtime pass
through all 17 stops was run on the production build: every line/HUD count matched, the outro
fired, the tour saved `done`, and the HUD cleared.

The 17 stops in order: San Andreas, III, Vice City, IV, V, Assassin's Creed, Watch Dogs,
Minecraft, Among Us, Mortal Kombat, Call of Duty, I.G.I., Tekken, FIFA, Cricket 07, WWE 2K15,
Far Cry 3. The tour content, building/room pairs, facade signs and room art are asserted by
`npm run verify:safar`.

## Plaques and direct in-game quotes

Screenshots:

- [`12-plaque-minecraft.jpg`](./qa/safar/12-plaque-minecraft.jpg) — the carved plaque with the
  Minecraft End Poem line.
- [`13-plaque-watch-dogs.jpg`](./qa/safar/13-plaque-watch-dogs.jpg) — the long Watch Dogs quote,
  still fitting inside the plaque.

The runtime plaque check opened all 17 from the live build and verified the title, year, source,
quote, fit and typography on every one:

- **17/17 PASS** — [`card-report.json`](./qa/safar/card-report.json).
- Game title font: **Silkscreen**; quote font: **Iowan Old Style** serif; both confirmed by
  `getComputedStyle` on every card.
- Every card fits 1440×900 and the mobile 390×844 layout. Mobile plaque check:
  [`15-mobile-plaque.jpg`](./qa/safar/15-mobile-plaque.jpg) (390×844; card box top 580, bottom 793,
  left 20, right 370) and [`14-mobile-title.jpg`](./qa/safar/14-mobile-title.jpg).

The quotes are in-game lines/famous game references, not descriptions:

| Game             | Source                  | Inscription                                                                                       |
| ---------------- | ----------------------- | ------------------------------------------------------------------------------------------------- |
| GTA: San Andreas | Carl Johnson            | “Ah shit, here we go again.”                                                                      |
| GTA III          | Opening prologue        | “Liberty City. The worst place in America.”                                                       |
| GTA: Vice City   | Tommy Vercetti          | “Remember the name! Tommy Vercetti!”                                                              |
| GTA IV           | Roman Bellic            | “Cousin! Let's go bowling!”                                                                       |
| GTA V            | Michael De Santa        | “You forget a thousand things every day, pal. Make sure this is one of 'em.”                      |
| Assassin's Creed | The Creed               | “Nothing is true; everything is permitted.”                                                       |
| Watch Dogs       | Aiden Pearce            | “Everything is connected. And I'll use that to expose, to protect, and, if necessary, to punish.” |
| Minecraft        | The End Poem            | “and the universe said I love you”                                                                |
| Among Us         | Red                     | “I do not want to alarm you, but there is an Impostor among us.”                                  |
| Mortal Kombat    | The announcer           | “Finish him!”                                                                                     |
| Call of Duty     | Captain MacMillan       | “Fifty thousand people used to live in this city. Now it's a ghost town.”                         |
| Project I.G.I.   | The game's own subtitle | “I'm going in.”                                                                                   |
| Tekken           | The announcer           | “Get ready for the next battle.”                                                                  |
| FIFA             | FIFA 06 introduction    | “This is the beautiful game.”                                                                     |
| Cricket 07       | Richie Benaud           | “Terrible running by the batsmen.”                                                                |
| WWE 2K15         | John Cena               | “The champ is here!”                                                                              |
| Far Cry 3        | Vaas Montenegro         | “Did I ever tell you the definition of insanity?”                                                 |

## Rename, HUD and routes

- [`01-title.jpg`](./qa/safar/01-title.jpg) — the Safar title screen; no chapter number, no giant
  in-world chapter heading.
- `/safar` → 200; `/atlas` → **308** `/safar`.
- Canonical/OG/title: `Safar · Ibtasaam`, `/safar`; sitemap contains `/safar` and not `/atlas`.
- `/atlas#clair-de-lune` → `/safar#clair-de-lune` with the Clair de Lune entry open;
  `/safar#in-the-mood-for-love` opens that entry.
- The remaining chrome is the small SAFAR wordmark, current place, Home, sound dock, Journal and
  clock. The title screen is the serif wordmark, سفر mark and two menu lines.

## Performance

See [`performance-report.md`](./qa/safar/performance-report.md).

Production build, single headless session, devicePixelRatio 1, no console errors:

- **Interior, 1920×1080:** **60.2 fps** (181 frames / 3.005 s).
- **Interior, 390×844 mobile:** **60.3 fps** (151 / 2.502 s).
- **Close district, 1920×1080, 2.0× play camera:** **55.7 fps** (197 / 3.538 s) at host load
  4.44. The initial 1.55× establishing view is the previous 60 fps path; the closer play camera
  increases the static fill, and the headless host load was high during this sample. This is
  recorded rather than hidden.

The rebuilt district keeps all scenery in one cached canvas; the 17 interiors are 480×288
canvases painted lazily per entered room. There is no per-frame lighting, shadow, reflection or
light-shaft work. The camera zoom/stage, room scene, door/card loop and tour are verified.

## The interim mission inscription

The Pond of Wisdom card uses the exact line supplied in the brief:

> “Either live with the apparatus of a heart charmer, or die with the misery and shame of worthlessness.”

The brief explicitly says the final mission statement will arrive later; no substitute line was
invented. Replacing it is a one-constant edit in `src/content/atlas-story.ts`.
