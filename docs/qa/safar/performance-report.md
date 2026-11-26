# Safar performance report

Measured on the production build with `npm run build && npm run start`, after closing every other
automation browser session. One headless Chrome session, 1920×1080, devicePixelRatio 1, music
active, no console errors.

Method: 2-second `requestAnimationFrame` windows, `fps = round(frames / elapsed)`. The host load
average is recorded from `uptime` at the same time. No CPU throttling was applied.

## Final build

| Scene      | Samples              | Host load (1 min) |
| ---------- | -------------------- | ----------------- |
| The Arcade | **60 / 59 / 60 fps** | 5.19              |
| The Meadow | **60 / 60 fps**      | 3.90              |

Corroborating clean runs on the same production renderer:

- 1280×633, arcade: **60 / 60 / 60 fps**.
- 1920×1080, arcade: **60 / 60 / 59 fps**, meadow: **60 / 60 / 58 fps** (host load ~2 at the time).
- 1920×1080, final build, meadow: **60 / 60 fps**.

## Why earlier low numbers were not the renderer

The rejected 23–33 fps samples (arcade 52 fps) were taken while **two extra headless Chrome
sessions** were running and external processes had the host at load average above 10. Those
sessions were closed; a single session on the same production code immediately returned the
above results. A transient sample of 46/50 fps also occurred during a build/QA burst; the next
arcade run on the same final build returned 60/59/60.

## What keeps the frame cheap

- All scenery is painted once into offscreen canvases; the arcade is prepared in
  `requestIdleCallback` (~23–39 ms) before it can be entered.
- Fixed lighting is baked: tree/structure/monument shadows, contact AO, light wash, pond
  reflections, arcade floor reflections, light shafts, rim haze, cabinets and sheen.
- Runtime glows use cached sprites (including fireflies); fixed light is not recomputed as
  gradients every frame.
- The static screen grade and vignette are a CSS composite layer, not full-screen canvas fills.
- Device pixel ratio is capped at 1.5; the pixel art is authored at 1×.
- Offscreen/hidden tabs pause the engine; reduced motion fixes golden hour and stops ambient
  motion.
- The per-frame scene is a cached canvas blit, a few cached sprite/actor draws, particles, and
  text tags.

The first terrain bake costs about 0.3 s of one-time work at first load.

QA close-up shots of the 17 monuments use a temporary, non-shipped camera hook (larger zoom and
manual framing) so each sculpture is legible; the islands/statues themselves are the production
renderer.
