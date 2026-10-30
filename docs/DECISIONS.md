# Design decisions

Locked creative direction. Update this file when a decision changes.

## Identity

- The site belongs to **Ibtasaam Amjad** — developer, storyteller, creative innovator.
- Origin story: entered computer science because of gaming. That is the narrative spine.
- Audience: recruiters, collaborators, and curious visitors. The site must communicate who he is within 60 seconds.
- Browser identity: an original 16×16 grass-block tile with a stone **IA** monogram, readable at favicon size on both light and dark tab bars.

## Hero

- Fixed **Minecraft-inspired title screen**, not a normal scrolling hero.
- The title screen is the **primary entry**; menu buttons navigate to chapter routes. Scroll is locked on the title screen until a choice is made, and chapter URLs are directly linkable for sharing and accessibility.
- Title: the generated **IBTASAAM stone-block wordmark**, the **PORTFOLIO EDITION** logo tucked directly underneath, and the angled **Still mining!** splash to its right.
- Background: a rotating six-face cubemap panorama using the 19 deployed sets. A picker cycles through them.
- Main menu: **Projects, Arcade, Ask My AI, About** — About is always last.
- Secondary icon row: **Contact** (phone), **Email**, **GitHub**, **LinkedIn**, with white pixel-art brand marks for the two social links.
- A **Download CV** button sits below the main menu and serves the PDF in `public/cv/`.
- Audio control lives in the footer, not the main menu. Playback is attempted on load and falls back to the first pointer or key gesture when the browser blocks autoplay.
- Keyboard users can tab to the menu and press Enter; links work without JavaScript.
- The official panorama and audio sets are deployed at the owner's request for this personal fan project. The audio is hosted in the public Vercel Blob store `ibtasaam-audio`.

## Chapters

Each chapter is its own route with its own theme scope while sharing the grid, spacing scale, nav, logo, and accessibility rules. The title screen stays at `/`; chapters live at `/projects`, `/arcade`, `/ask`, `/about`, and `/contact`.

- **About** — warm paper, editorial serif, grain, asymmetric layout. Holds the story, skills, stack, languages, and honors.
- **Projects** — a cinematic universe timeline that becomes an explorable galaxy map.
- **Arcade** — a literal arcade hall: cabinets, CRT screens, insert-coin interaction, high-score board. Games are WebAssembly builds launched full-screen.
- **Ask My AI** — terminal charcoal and green, monospace, typewriter reveals. AI agent with a persistent dock.
- **Contact** — light, minimal, generous whitespace, slow fades. Reached from the phone icon.

## Projects universe

- `/projects` opens on a full-screen cinematic timeline, from the initial singularity to the present day, then becomes an explorable map of galaxies.
- The cinematic runs about 42 seconds across nine epochs: singularity, inflation, nucleosynthesis, recombination, dark ages, first stars, galaxy formation, accelerated expansion, and present day.
- During the cinematic the only visible text is the bold name of the current epoch. The event descriptions remain in the screen-reader status and the static no-WebGL fallback, not in the visual HUD.
- The camera follows a fixed scripted path with deliberate zoom-ins for nucleosynthesis and galaxy formation and zoom-outs for recombination, the dark ages, and accelerated expansion.
- Matter starts uniform and only begins collapsing after the first stars ignite. The first-star field is deliberately larger than the final galaxy count, and those stars converge into the galaxies during galaxy formation.
- Seven galaxies represent the project domains: Pre-University Games, University Projects, Agentic AI & Multi-Agent Systems, NLP & Knowledge Graph Research, Hackathon Projects, Products, and Systems & Embedded. All 37 resume projects are represented; four projects are intentionally cross-listed where they belong to more than one domain.
- Each domain uses a unique procedural morphology and palette, so no two galaxies are copies. Projects and their stacks live in the domain panel; project planet systems are the next iteration.
- The background is populated with faint distant galaxies, nebulas, space dust, and occasional distant supernovae so the space outside the domain galaxies is not empty.
- The score begins only after the Big Bang, because sound has no medium in the early universe. The track is read from `NEXT_PUBLIC_UNIVERSE_SCORE_URL` in production, or the gitignored `public/audio/_dev/universe/` folder in development. No score file is committed.
- The experience is client-only and lazy-loaded, pauses rendering when the tab is hidden, respects reduced motion, and falls back to a static timeline when WebGL is unavailable.

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
- Playback starts on load when the browser permits it; otherwise the first pointer or key gesture starts the soundtrack automatically.
- The soundtrack is hosted in the public Vercel Blob store `ibtasaam-audio`; development files remain in the gitignored `public/audio/_dev/` folder.

## Constraints

- Mojang assets are deployed at the owner's request: the two button sprites, the 19 panorama sets, and the Blob soundtrack. They are excluded from the MIT license.
- **Autoplay** is blocked by browsers; music requires an explicit gesture.
- The site must remain usable with JavaScript disabled, reduced motion, and on low-end mobile devices.

## Open questions

- Final palette and type pairings for the non-Minecraft chapters.
- AI provider and model.
- Whether the arcade is rendered in 3D or as a layered 2D scene.
