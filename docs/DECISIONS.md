# Design decisions

Locked creative direction. Update this file when a decision changes.

## Identity

- The site belongs to **Ibtasaam Amjad** — developer, storyteller, creative innovator.
- Origin story: entered computer science because of gaming. That is the narrative spine.
- Audience: recruiters, collaborators, and curious visitors. The site must communicate who he is within 60 seconds.

## Hero

- Fixed **Minecraft-inspired title screen**, not a normal scrolling hero.
- Menu buttons are the **only way into the site**; scroll is locked until a choice is made.
- Title: the generated **IBTASAAM stone-block wordmark** (`public/brand/ibtasaam-wordmark.webp`), with an angled splash line.
- Background: a rotating six-face cubemap panorama. A picker cycles through the available sets.
- Menu items: About, Projects, Arcade, Ask Me, Contact. Resume joins once the PDF exists.
- Music toggle lives in the menu. Audio starts only after a user gesture.
- Keyboard users can tab to the menu and press Enter; links work without JavaScript.
- The official panorama pack is development-only. Production needs self-captured or licensed sets.

## Chapters

Each chapter has its own visual identity while sharing the grid, spacing scale, nav, logo, and accessibility rules.

- **About** — warm paper, editorial serif, grain, asymmetric layout.
- **Projects** — brutalist grid, monochrome, mono labels, pinned scroll.
- **Arcade** — a literal arcade hall: cabinets, CRT screens, insert-coin interaction, high-score board. Games are WebAssembly builds launched full-screen.
- **Ask Me** — terminal charcoal and green, monospace, typewriter reveals. AI agent with a persistent dock.
- **Contact** — light, minimal, generous whitespace, slow fades.

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

## Constraints

- **No Mojang assets.** No textures, sounds, fonts, logos, or official panoramas. Use original voxel art, free pixel fonts, self-captured footage, and the generated wordmark.
- The official panorama pack is reference-only; optimized derivatives live in the gitignored `public/panoramas/_dev/` folder.
- **Music** is an official Spotify embed or a licensed/CC0 track. No ripped files.
- **Autoplay** is blocked by browsers; music requires an explicit gesture.
- The site must remain usable with JavaScript disabled, reduced motion, and on low-end mobile devices.

## Open questions

- Final set of licensed panoramas to ship, and whether to include a custom-world set.
- Final palette and type pairings for the non-Minecraft chapters.
- AI provider and model.
- Whether the arcade is rendered in 3D or as a layered 2D scene.
