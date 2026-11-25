# Atlas content

The raw material for the `/atlas` chapter. This file is filled in **before** any map work, because regions are derived from the material, not invented ahead of it.

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
