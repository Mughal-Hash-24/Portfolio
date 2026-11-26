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
8. [`07-arcade-hall.jpg`](./qa/safar/07-arcade-hall.jpg) — E enters the arcade; the welcome line
   starts at the green lowrider / 2011.

The live sequence observed in this pass: `follow → memory` (2011 line) `→ portal`; at the door the
prompt was **The Arcade / STEP INSIDE**; after E the location became **THE ARCADE** and the
speaker line was _"Welcome to the arcade. The green lowrider is where 2011 begins."_ The earlier
pass also verified the return street door and persisted story completion. The guide is visible in
the world nameplate and inside the arcade.

## The arcade and all seventeen monuments

- [`07-arcade-hall.jpg`](./qa/safar/07-arcade-hall.jpg) — the live hall.
- [`monuments.jpg`](./qa/safar/monuments.jpg) — a labelled contact sheet of all 17 production
  monument scenes.
- [`monuments/`](./qa/safar/monuments/) — each capture individually.

The set: GTA: San Andreas (lowrider), GTA III (taxi/skyline), GTA: Vice City (wedge car/neon
palms), GTA IV (bowling pin), GTA V (helicopter/V), Assassin's Creed (hood/crest), Watch Dogs
(hooded phone/camera), Minecraft (creeper face/grass block), Among Us (crewmate/vent), Mortal
Kombat (dragon medallion), Call of Duty (NVG soldier), Project I.G.I. (scope/sniper), Tekken
(iron fist/lightning), FIFA (goal/football), Cricket 07 (stumps/bat), WWE 2K15 (ropes/belt), Far
Cry 3 (island/skull/flare).

Each monument has a lit stone niche, a carved title plate, a hanging lamp, baked shadows and
accent light. The close-ups use a temporary QA camera (manual zoom/framing) so the sculptures are
legible; the monuments themselves are production art. The verifier asserts all 17 motifs in
`arcade-monuments.ts`.

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

Final production build, one headless session, 1920×1080, DPR 1, music active, no console errors:

- **Arcade: 60 / 59 / 60 fps** (host load 5.19)
- **Meadow: 60 / 60 fps** (host load 3.90)
- corroborating 1280×633 arcade: **60 / 60 / 60 fps**

The earlier 23–33 fps / arcade 52 samples were taken while two extra headless sessions and
external processes held the host above load 10; when those were closed the same production code
returned the figures above. All fixed lighting is precomputed; runtime glows are cached sprites;
the CSS grade avoids full-screen canvas fills; DPR is capped at 1.5; hidden tabs pause the loop.

## The interim mission inscription

The Pond of Wisdom card uses the exact line supplied in the brief:

> “Either live with the apparatus of a heart charmer, or die with the misery and shame of worthlessness.”

The brief explicitly says the final mission statement will arrive later; no substitute line was
invented. Replacing it is a one-constant edit in `src/content/atlas-story.ts`.
