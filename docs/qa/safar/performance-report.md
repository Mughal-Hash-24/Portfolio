# Safar performance report — game-building rebuild

Measured on the production build (`npm run build && npm run start`), one headless Chrome session,
devicePixelRatio 1, no console errors. Host load was recorded from `uptime` at the sample. No CPU
throttling.

Method: `requestAnimationFrame` windows; fps = frames / elapsed.

## Final build

| Scene                                            | Window        | Result       | Host load |
| ------------------------------------------------ | ------------- | ------------ | --------- |
| Interior (GTA III), 1920×1080                    | 181 / 3.005 s | **60.2 fps** | 4.44      |
| Interior (Minecraft), 390×844                    | 151 / 2.502 s | **60.3 fps** | 4.44      |
| Close game district, 1920×1080, 2.0× play camera | 197 / 3.538 s | **55.7 fps** | 4.44      |

The initial 1.55× establishing view follows the previous 60 fps path. The play camera was raised
to 2.0× so the player/guide are ~30% larger, which increases the static fill of the 1536×1024
district. The close-district sample was taken at host load 4.44; the interiors stayed at 60. I
tested three optimizations and rejected them because they were slower on this headless rasterizer:

- Cropping the static blit to the camera rect: **51 fps**.
- Splitting the static canvas into 256 px bled tiles and drawing only visible tiles: **48.5 fps**.
- Keeping the single cached blit: **55.7–57 fps** (the chosen path).

## What stays cheap

- The entire district is painted once into a cached canvas; the 17 interiors are painted lazily
  (480×288 each) the first time entered.
- All lighting, shadows, reflections, light pools, wall plaques and facade details are baked.
- Runtime work is the cached blit, the player/guide, cached glow sprites and text tags.
- The CSS screen grade/vignette is a composite layer, not a full-screen canvas fill.
- DPR is capped at 1.5; hidden tabs pause the engine.

## Previous reference

The previous 46×34 hall and 96×64 monument island both measured 60 fps at 1.55× on a quieter host
(host load 1.3). The 2.0× close camera is the change that costs fill rate on this headless host;
interiors and the 1.55× establishing view remain at 60.
