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

Each chapter is its own route with its own theme scope while sharing the grid, spacing scale, nav, logo, and accessibility rules. The title screen stays at `/`; chapters live at `/projects`, `/arcade`, `/ask`, `/safar`, `/about`, and `/contact`.

- **About** — warm paper, editorial serif, grain, asymmetric layout. Holds the story, skills, stack, languages, and honors.
- **Projects** — a cinematic universe timeline that becomes an explorable galaxy map.
- **Safar** — a walkable top-down journey through the songs, films, books, poems, games, and ideas that shaped me, led by Pir-e-Iqbal.
- **Arcade** — a literal arcade hall: cabinets, CRT screens, insert-coin interaction, high-score board. Games are WebAssembly builds launched full-screen.
- **Ask My AI** — terminal charcoal and green, monospace, typewriter reveals. AI agent with a persistent dock.
- **Contact** — light, minimal, generous whitespace, slow fades. Reached from the phone icon.

## Projects universe

- `/projects` opens on a full-screen cinematic timeline, from the initial singularity to the present day, then becomes an explorable map of galaxies.
- The cinematic runs at most about twenty seconds across nine epochs: singularity, inflation, nucleosynthesis, recombination, dark ages, first stars, galaxy formation, accelerated expansion, and present day.
- During the cinematic the only visible text is the bold name of the current epoch. The event descriptions remain in the screen-reader status and the static no-WebGL fallback, not in the visual HUD.
- The camera follows a fixed scripted path with deliberate zoom-ins for nucleosynthesis and galaxy formation and zoom-outs for recombination, the dark ages, and accelerated expansion.
- Matter starts uniform and only begins collapsing after the first stars ignite. The first-star field is deliberately larger than the final galaxy count, and those stars converge into the galaxies during galaxy formation.
- Seven galaxies represent the project domains: Pre-University Games, University Projects, Agentic AI & Multi-Agent Systems, NLP & Knowledge Graph Research, Hackathon Projects, Products, and Systems & Embedded. All 37 resume projects are represented; four projects are intentionally cross-listed where they belong to more than one domain.
- Each domain galaxy is modeled on a distinct real object — M101, M31, M51, the Cartwheel Galaxy, the Large Magellanic Cloud, the Milky Way, and M104 — with morphology, size, and palette tuned to each; no two galaxies are copies.
- Selecting a galaxy flies a warp transit into it: a perspective star field stretches into streaks as it accelerates toward light speed with a live velocity readout, holds at the peak, then brakes into that galaxy's star field. The field keeps the same deep-sky background as the map and holds one star system per project, scattered randomly without overlap, each modeled on a real star system (TRAPPIST-1, Kepler-90, Proxima Centauri and so on), with one planet per stack item, each modeled on a real world (Mercury, Mars, 55 Cancri e, HD 189733 b and so on). Planets only materialize after the transit ends. Selecting a system zooms in and opens the project card with its planets labeled; selecting a planet opens a dossier naming its real-world inspiration and what the technology does. Dragging rotates the camera around the current focus at every level, and Escape plus a Galaxy map button step back out one level at a time.
- The background is populated with faint distant galaxies (including a farther, fainter shell), drifting nebulas, space dust, occasional shooting stars and distant supernovae, and a twinkling starfield of varied sizes and stellar colors — blue-white through red — so the space outside the domain galaxies is not empty.
- Labels never sit statically on the sky: galaxy, system, and planet names are sampled into star particles that assemble in the object's own color on hover (or focus) and scatter apart again, always billboarded and sized to stay legible at any zoom.
- Every star system has its own personality: scale, orbital tilt, elongation, eccentricity, direction, and planet sizes plus a per-system palette blended toward its star color, so no two systems repeat. Seeded systems may also carry a rocky asteroid belt, a pale ice belt, or both, and a few tumbling asteroids drift through every system.
- The score begins only after the Big Bang, because sound has no medium in the early universe. It enters 19 seconds into the track as inflation begins and fades out when the cinematic ends. The track is read from `NEXT_PUBLIC_UNIVERSE_SCORE_URL` in production, or the gitignored `public/audio/_dev/universe/` folder in development. No score file is committed.
- A signal-deck dock (bottom-left on desktop, top-right on mobile) manages the ambient soundtrack with the same track pool and golden-record disc archive as the other chapters. Starting the soundtrack fades the cinematic score, and beginning or replaying the cinematic pauses the soundtrack, so the two never overlap.
- The experience is client-only and lazy-loaded, pauses rendering when the tab is hidden, respects reduced motion, and falls back to a static timeline when WebGL is unavailable.

## Safar

- A walkable top-down 2D world at `/safar` (chapter 04) for the things that shaped the owner: music, film, books, poetry, philosophy, and games. `/atlas` permanently redirects to `/safar`; internal module and storage names retain `atlas` so old progress and deep links survive. The visible product and HUD are **Safar**.
- All art is original and generated in code (canvas-drawn terrain, structures, sprites, icons). No external or Mojang assets are added; the chapter respects the existing asset policy.
- The world is data-driven. Content lives in `src/content/atlas.ts`: regions (mediums), entries, relics, and world anchors. Regions and interiors are appended data, not layout code. Entries carry a required why-line, optional quote/note/links, connections for trails, and optional night gating.
- Five regions: The Listening Glade (music), The Picture House (film), The Long Library (books), The Poem Garden (poetry), and The Quiet Hill (philosophy). Each entry is a pedestal landmark with its own item icon; walking close raises a prompt and opens a dark tooltip-style panel with the why-line, a purple lore quote, and trail chips.
- The world starts on the visitor's local clock. A slow day/night cycle (12 minutes) runs while the tab is visible; resting at the campfire advances six hours with a fade. One relic appears only at night, and the campfire exists so nobody has to wait for the clock.
- Extras: an NPC guide near spawn with rotating lines, lantern posts that glow after dark, fireflies, birds, drifting petals/pages/notes by region, an index drawer with fast travel, linked trails between related entries, one enterable interior (the Long Library hall), and found-state persistence in `localStorage`.
- Accessibility and performance: keyboard movement, Escape closes overlays, the index is the semantic list of every entry, each entry is shareable at `/safar#<slug>` (the world spawns beside its landmark with the panel open), reduced motion fixes golden hour and stops ambient motion, and the canvas loop pauses when the tab is hidden or the chapter is offscreen. The static fallback lists every entry and relic for no-JS and no-canvas visitors.
- The starter entries are placeholders drawn from widely known works, clearly marked in the content file; they are meant to be replaced with the owner's real influences.
- The game chrome is deliberately quiet: a small **SAFAR** wordmark and current place in the top-left, then Home, a sound dock, the journal, and the day/night clock. There is no chapter number, no editorial tagline, and no large title card inside the world. The title screen is a left-aligned field of the world with a serif wordmark, the Urdu سرَف mark, and two menu lines (Walk in, Open the journal), not a centred glass card.
- The soundtrack uses the site's existing 70-track background library and 22 music discs through `useAudio()`. The Safar dock exposes the current track, play/mute, next, the full record + soundtrack library, and a separate Game Sound switch. Starting the journey starts the soundtrack through the same user gesture; the library survives client-side navigation.
- Game sound is synthesized in a small Web Audio module (`atlas-sfx.ts`), so no new audio assets are added. Footsteps are surface-aware (grass swish, path dirt, stone tick, wood knock, water splash, arcade tick), and the scene adds low-volume birds by day, crickets at night, an arcade hum, coin ticks, stone chimes for plaques, a gate sound, and a find chime. The switch and mute are respected; the tab-visibility path silences the buses.
- The 2011 gate is no longer a stone portal dropped on the map. The guide now walks the player from the 2011 monitor to a built **arcade frontage** — a lit marquee, bulbs, an OPEN doorway, posters, a token pedestal, queue rope, and a red carpet on a paved apron. The scene transition happens through that doorway, and the same frontage style becomes the arcade's EXIT door back to the meadow.
- The seventeen game monuments are bespoke. Each sits in a lit stone niche with an arched frame, a hanging lamp, a baked accent wash, a cast shadow, a carved title plate, and a unique diorama: GTA SA's lowrider, GTA III's taxi and skyline, Vice City's neon palms and wedge car, GTA IV's bowling pin, GTA V's helicopter/V, the Assassin's hooded figure and crest, Watch Dogs' hooded phone/camera, Minecraft's creeper face and grass block, Among Us' crewmate and vent, Mortal Kombat's dragon medallion, Call of Duty's NVG soldier, I.G.I.'s scope and sniper, Tekken's iron fist and lightning, FIFA's goal and football, Cricket 07's stumps and bat, WWE 2K15's ring ropes and belt, and Far Cry 3's island, skull, machete and flare. The ring is wider and the monuments have floor light pools, a central joystick monument, arcade cabinets, scattered props, and a polished floor.
- The statue inscription card is an in-world carved plaque rather than a side panel: chamfered stone edges, brass rivets, a bulb strip, the site's Silkscreen pixel display for the game name, the Iowan serif for the quote, and mono metadata. It sits above the world at the bottom of the screen, keeps the monument visible, fits the longest quote at 1280×800 and 390×844, and closes with Esc, the button, or a tap outside. Every inscription is a short, attributed in-game quote or famous line, with the source named on the plaque; descriptive filler references were removed.
- Visual depth is precomputed, not per-frame. The terrain and arcade are painted once into offscreen canvases during load or idle time: baked directional tree/structure/monument shadows, contact AO, a warm/cool light wash, grass litter, pond depth and reflected silhouettes, arcade floor reflections, light shafts, rim haze, cabinets, and floor sheen. The runtime only draws cached images plus two actor shadows, two actor reflections in the arcade, a cached door-glow sprite, particles and nameplates. The arcade is prepared in `requestIdleCallback` (about 23ms) before the player reaches it; the terrain bake is about 0.3s at first load. No per-frame gradients are used for the arcade's fixed lighting.
- The architectural interior (the library) and the region pedestals remain. The mobile joystick, action button, keyboard path, skip-the-journey control, `prefers-reduced-motion` golden-hour path, and the no-JS static fallback still work. The static fallback names Safar, the guide, the pond inscription, the arcade, and all seventeen inscriptions.

## Arcade

- A real arcade room, not a grid of cards.
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
- Safar is framed as a journey through the owner's influences. The guide is named **Pir-e-Iqbal**, and the walk starts at the **Pond of Wisdom**, whose inscription is the owner's mission statement. The quote in `src/content/atlas-story.ts` is a placeholder until the final line arrives; it is also readable later at the stone and from the index.
- The first visit runs a short scripted prologue: the mission card, Pir-e-Iqbal's introduction, a follow-the-guide walk down the pond path, the 2011 memory, and the gate into the Gamer's Dimension. The guide waits when the player falls behind. The prologue is skippable, completion is stored in `localStorage`, and later visits begin in free roam where the guide greets the player on approach instead of replaying the script.
- The 2011 room is themed around the real memory of wanting to play Uphill Rush and pressing the middle mouse button: a stone browser window with a dune-and-cart screen, a stone keyboard, a carved 2011 plaque, a stone mouse with a gold middle button, a carved cursor, and a stone gate beside the monitor. The clearing is packed earth, not plaza stone, so the memory reads as a place rather than a courtyard.
- The **Gamer's Dimension** is a separate canvas scene reached through that gate: a neon-grid platform floating in a star void, a giant joystick monument at the centre, and seventeen carved stone monuments arranged along a ring, one for each game the owner named. The monuments are stone with painted accents; each has a year carved at its base and a short, attributed quote or reference read through an in-world prompt. The dimension also scatters original game props between the statues — Minecraft blocks, a bowling pin, an ammo crate, a football, a cricket bat, a neon palm, a Mortal Kombat medallion, and arcade tokens.
- Statue dossiers use a stone-inscription card: serif quote, mono metadata, engraved inset, and the game's accent colour. They are deliberately not generic gradient cards, and they use the site's existing serif/mono pairing rather than a new display font.
- Quotes and references are short, attributed to the game, and marked as references where they describe a game rather than quote it. All artwork for the journey and the dimension is original procedural canvas art; no game assets or logos are used. Statue content lives in `src/content/atlas-story.ts` so the list can be extended or the quotes replaced without touching the engine.
- Story navigation keeps accessibility: the dialogue can be advanced with Space or the on-screen button, the journey can be skipped, the index lists all seventeen inscriptions and travels to them, the static fallback lists the guide, mission, and every inscription, and the mobile joystick/action button drive the same engine.
