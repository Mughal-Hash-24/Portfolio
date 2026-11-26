# Atlas content

The raw material for the `/atlas` chapter. This file is filled in **before** any map work, because regions are derived from the material, not invented ahead of it.

> **Status:** the first walkable iteration ships with starter entries in `src/content/atlas.ts` (clearly marked placeholders). Edit that file to add or replace influences — regions, landmarks, trails, and the index all derive from it. This document stays as the intake template for future dumps.

## How to add an entry

Use this shape for every influence. Only `why` is non-negotiable.

```yaml
- medium: music | film | books | poetry | philosophy
  title:
  creator:
  year:
  why: # required. One or two sentences on what it changed in you.
  quote: # optional. A line you still carry.
  note: # optional. A longer reflection.
  links: # optional. Repo, article, recording, stream.
  connections: # optional. Titles of related entries; these become trails in the world.
  interior: # optional. Room name if the landmark can be entered.
  secret: # optional. Hidden until found by wandering.
  night: # optional. Only appears or opens at night.
```

Rules:

- If you cannot write the `why`, it is a like, not an influence. Skip it or dig until the line exists.
- One line per work. Do not list a whole discography or filmography — pick the one that did something.
- `medium` can stay raw (“album”, “essay”, “poem”) if you are unsure. Clustering happens after the dump.
- Quotes are a format, not a region. Attach them to the entry they came from, or leave them loose for signposts.

Like vs influence, for calibration:

- like: “I liked it.”
- influence: “It taught me that restraint can be loud.”

## Raw dump

Paste entries here in any order. Messy is fine. Rough titles, half-remembered whys, no grouping.

<!-- start dumping below -->

## Provisional regions

A region only exists once at least **three** entries survive in it. Working buckets, to be confirmed by the dump:

| Region     | Holds                      |
| ---------- | -------------------------- |
| Music      | songs, albums, artists     |
| Film       | films, series              |
| Books      | novels, nonfiction, essays |
| Poetry     | poems, collections         |
| Philosophy | thinkers, ideas, schools   |

Quotes do not become a region; they hang off entries or live on signposts along the roads.

## Worked examples (illustrations — replace them)

```yaml
- medium: film
  title: In the Mood for Love
  creator: Wong Kar-wai
  year: 2000
  why: Taught me that longing is a visual language; nothing has to happen for everything to happen.
  quote: "He remembers those vanished years."
  interior: The Cinema

- medium: music
  title: [one specific track, not the artist]
  creator:
  year:
  why: The first piece of music that made me notice structure — how tension is built and released.
  connections:
    - [the film above, if it genuinely connects]

- medium: philosophy
  title: [essay or book]
  creator:
  why: Gave me a word for something I had felt but could not name.
  note: Longer reflection goes here.
  secret: true
  night: true
```

## Vertical slice (the build gate)

After the dump, the first build is:

- **One region** with placeholder tiles, walkable.
- **6–9 entries across at least three regions.**
- **One interior** entered through a landmark.
- **One trail** between two connected entries.
- **One night-only secret**, reachable by resting at a campfire.
- **One NPC greeting** near spawn.

If the slice feels good to walk, everything after it is content entry and art, not engineering.

## Deep links and slugs

Every entry gets a slug: lowercase kebab-case of the title (`in-the-mood-for-love`). `/atlas#in-the-mood-for-love` spawns beside that landmark with the entry open.

## Expansion rules

- A new region is appended data on the tile plane; the engine never changes.
- A new interior is appended room data referenced by an entry.
- Trails are derived from `connections` and must point both ways.
- Any `night` entry needs a reachable rest point (campfire or bed) so nobody has to wait for the clock.

## Story layer

The Atlas also has a guided storyline. Its content is separate from the regions:

- `src/content/atlas-story.ts`:
  - `guideName` / `guideTitle` and `storyLines` — the guide's dialogue for the prologue, the 2011 memory, the dimension, and free-roam greetings.
  - `missionStatement` — the quote on the Pond of Wisdom. The current line is a placeholder; replace `quote` and `attribution` when the final statement is ready.
  - `storyWorld` — the pond, inscription stone, 2011 shrine, gate, and the guide's walking path on the tile plane.
  - `arcadeStatues` — the seventeen stone inscriptions. Each has `game`, `year`, `quote`, an optional `reference: true` for lines that describe the game rather than quote it, a `motif` that the art renderer swaps in, and a `paint` accent.
  - `arcadeProps` / `arcadeDimension` — the dimension's game props, decor, spawn, and exit.

### Quote rules

Keep each inscription to one short line, attributed to the game, and set `reference: true` when it is a description rather than a quote. Avoid long passages, lyrics, or text that needs a content licence; the card is designed for a single engraved sentence.

### Extending the journey

- Add a statue by appending to `arcadeStatues`; the ring layout and plinth distribution are derived from the list length.
- A new motif needs a case in `drawMotif` in `atlas-art.ts`.
- Story beats live in the engine's stage machine; content belongs in `storyLines`. Do not put dialogue strings in the engine.
- The story is persisted under `atlas:story:v1`. Clear that key to replay the prologue.
