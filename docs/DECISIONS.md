# Design decisions

Locked creative direction. Update this file when a decision changes.

## Identity

- The site belongs to **Ibtasaam Amjad** — developer, storyteller, creative innovator.
- Origin story: entered computer science because of gaming. That is the narrative spine.
- Audience: recruiters, collaborators, and curious visitors. The site must communicate who he is within 60 seconds.

## Hero

- Fixed **Minecraft-inspired title screen**, not a normal scrolling hero.
- Menu buttons are the **only way into the site**; scroll is locked until a choice is made.
- Title: the generated **IBTASAAM stone-block wordmark**, the **PORTFOLIO EDITION** logo tucked directly underneath, and the angled **Still mining!** splash to its right.
- Background: a rotating six-face cubemap panorama using the 19 deployed sets. A picker cycles through them.
- Main menu: **Projects, Arcade, Ask My AI, About** — About is always last.
- Secondary icon row: **Contact** (phone), **Email**, **GitHub**, **LinkedIn**, with white pixel-art brand marks for the two social links.
- A **Download CV** button sits below the main menu and serves the PDF in `public/cv/`.
- Audio control lives in the footer, not the main menu. The audio starts only after a user gesture.
- Keyboard users can tab to the menu and press Enter; links work without JavaScript.
- The official panorama and audio sets are deployed at the owner's request for this personal fan project. The audio is hosted in the public Vercel Blob store `ibtasaam-audio`.

## Chapters

Each chapter has its own visual identity while sharing the grid, spacing scale, nav, logo, and accessibility rules.

- **About** — warm paper, editorial serif, grain, asymmetric layout. Holds the story, skills, stack, languages, and honors.
- **Projects** — brutalist grid, monochrome, mono labels, pinned scroll.
- **Arcade** — a literal arcade hall: cabinets, CRT screens, insert-coin interaction, high-score board. Games are WebAssembly builds launched full-screen.
- **Ask My AI** — terminal charcoal and green, monospace, typewriter reveals. AI agent with a persistent dock.
- **Contact** — light, minimal, generous whitespace, slow fades. Reached from the phone icon.

## Arcade

- A real arcade room, not a grid of cards.
- Each cabinet maps to a game project. Selecting one boots a WASM build.
- C++/SFML games are ported via Emscripten (SDL2 where SFML support is impractical).
- Python/pygame games are packaged with pygbag.
- Builds are lazy-loaded and hosted in `public/games/<slug>/` or an external bucket.

## AI agent

- One assistant, not multiple personas.
- Streaming responses from a Next.js route handler.
- Context comes from typed site content; add retrieval only if content outgrows the prompt.
- Guardrails: server-side key, per-IP rate limit, token cap, cheap model, off-topic refusal, visible disclaimer.
- Static FAQ fallback when the API is unavailable or over budget.

## Audio

- The auto-play pool combines the full game/menu soundtrack and the music discs, shuffled. The jukebox selects a specific disc.
- The title screen opens on **Subwoofer Lullaby**; the music dock shows the current track with a play/mute control, skip, and jukebox.
- UI buttons play the Minecraft click sound.
- Audio starts on the first user gesture, never on page load.
- The soundtrack is hosted in the public Vercel Blob store `ibtasaam-audio`; development files remain in the gitignored `public/audio/_dev/` folder.

## Constraints

- Mojang assets are deployed at the owner's request: the two button sprites, the 19 panorama sets, and the Blob soundtrack. They are excluded from the MIT license.
- **Autoplay** is blocked by browsers; music requires an explicit gesture.
- The site must remain usable with JavaScript disabled, reduced motion, and on low-end mobile devices.

## Open questions

- Final palette and type pairings for the non-Minecraft chapters.
- AI provider and model.
- Whether the arcade is rendered in 3D or as a layered 2D scene.
