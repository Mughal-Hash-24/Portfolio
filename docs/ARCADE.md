# Arcade

Playable WebAssembly ports of the game projects, served from `/arcade`.

The page is a cabinet: it boots, idles on an attract screen, and plays whatever
cassette you pick. Each cassette also works on its own at
`/arcade/<slug>/index.html`.

## What ships

`public/arcade/<slug>/` holds the deployed build. Two kinds of artifact live
there:

- **pygame** — a single self-contained `index.html`. The game source, its helper
  modules, and its assets are embedded, so the page has no data fetches of its
  own. The Python runtime is **not** in the page: it is vendored once under
  `public/arcade-runtime/` and shared by every pygame cabinet.
- **C++/SFML** — `index.html` plus `index.js`, `index.wasm`, and `index.data`.
  Assets are preloaded into the Emscripten virtual filesystem, so the game reads
  them the same way it does on the desktop.

Both kinds are static files. No server-side support is required beyond serving
them, and the site's own routes are unaffected because the builds are requested
by explicit `index.html` path.

## Performance

Three things dominated the first working version, and each has a dedicated fix.

**Load time.** The pygame runtime is about 21 MB. Pulling it per game from
pygame-web's CDN meant a ten-minute cache and no compression, so returning to the
arcade re-downloaded all of it. The runtime now lives in
`public/arcade-runtime/` (one shared copy, cached hard by `next.config.ts`), and
`games/tools/vendor_runtime.py` refreshes it from the CDN when pygbag updates.
`games/tools/optimize_assets.py` writes Brotli siblings for local measurement;
the deployed origin compresses static assets itself.

**Frame rate.** Two real bugs sat behind "some games are slow to play":

- SFML's frame limiter calls `nanosleep`, which cannot suspend a browser thread.
  `setFramerateLimit` was a no-op, so those games spun as fast as the machine
  allowed and starved the main thread. `SleepImpl.cpp` in the SFML build now uses
  `emscripten_sleep`, which yields properly.
- The Bresenham visualiser issued one draw call per grid cell — 9,600 of them per
  frame, measured at 5 fps. It now builds a single vertex array for the whole
  grid: 33 fps.

C++ games are also built with `-O3` and LTO rather than `-O1`.

**Embedding.** `2D Voxel Engine V2` originally emitted one 3.4 MB source line for
its asset payload, which the browser truncates. Payloads are chunked into short
literals, and helper modules travel base64-encoded so a module containing quotes
or backslashes cannot break the page.

## Toolchain

Everything below is installed outside the repo and is **not** needed to build or
deploy the site — only to rebuild a game.

| Tool                         | Location         | Purpose               |
| ---------------------------- | ---------------- | --------------------- |
| Emscripten 7.x               | `~/emsdk`        | C++ → WebAssembly     |
| SFML 2.6.2 (Emscripten fork) | `~/sfml-wasm`    | SFML built for wasm32 |
| Python 3.13 + pygbag         | `~/.arcade-venv` | pygame → WebAssembly  |

SFML has no upstream Emscripten backend. The build uses the `2.6.x-EMCC` branch
of `Zombieschannel/SFML`, with one patch: modern libc++ does not define
`std::char_traits` for the unsigned integer types SFML uses as UTF-8/16/32 code
units, so those specializations are added in `include/SFML/System/Utf.hpp`
before the header's contents.

## Rebuilding

Source repos are cloned into `games/`, which is gitignored. From the repo root:

```bash
# pygame games: stage, convert to async, emit the browser page
games/tools/build_pygame.py            # or: build_pygame.py pong snake
tools/emit_pygame_html.py              # writes public/arcade/<slug>/index.html

# SFML games: compile, preload assets, install a clean page shell
games/tools/build_sfml.py              # or: build_sfml.py gaianox
games/tools/shell_sfml.py              # replaces Emscripten's debug UI
tools/publish_sfml.py                  # copies builds into public/arcade/
```

`games/tools/serve.py [port]` serves the whole arcade for local testing, with the
WebAssembly MIME types Emscripten expects. `games/tools/verify_browser.py`
boots every cabinet headlessly and reports its canvas size.

## Port notes

Each game needed a specific fix to run in a browser:

- **Blocking loops** — pygame games are converted with
  `games/tools/port_pygame.py`, which moves module-level code into an `async`
  entry point, keeps module globals visible to helpers and classes, and inserts
  a single `await asyncio.sleep(0)` in the game loop. SFML games keep their
  blocking loop because the build uses ASYNCIFY.
- **MP3 audio** — `2D Voxel Engine V2` loaded an MP3 for one effect. The wasm
  SDL_mixer has no MP3 codec, so the game died during setup; the clip is deployed
  as 44.1 kHz WAV instead. Games must also avoid a `set_mode` depth argument and
  `SysFont` on a missing family, both of which stall the surface.
- **`pygame.quit()` on loss** — Pong and Atari Breakout ended the process when
  the ball was lost, which closes the browser session. Both now reset the ball
  instead so the cabinet stays playable.
- **Missing assets** — `2D Voxel Engine V2` did not ship the
  `entity_animations.txt` manifest it loads at startup. It is generated beside
  the frames it describes.
- **Audio size** — the same game shipped an 18 MB `music.wav`. It is deployed as
  Vorbis (1.4 MB) and the WAV is excluded from the build.
- **Runtime Focus** — pygbag creates its canvas without a `tabindex`, so
  keyboard input went to the document body. The emitted page makes the canvas
  focusable and focuses it on interaction.
- **Emscripten shell** — `em++ -o index.html` emits a debug toolbar. It is
  replaced with a minimal page so the game fills the frame.

## Testing

`games/tools/` has the harnesses used to verify the port:

- `serve.py [port]` — serves `public/` with the MIME types Emscripten needs.
- `verify_browser.py <base>` — boots every cabinet headlessly, reports the canvas
  each game actually sized, and screenshots it.
- `fps_audit.py <slug>...` — measures requestAnimationFrame cadence per cabinet
  against an empty-page baseline.
- `capture_art.py` — refreshes the cassette covers in `public/arcade-art/`.

Serve the arcade from a **non-localhost host** when testing. pygbag treats
`localhost` as a development origin and redirects package lookups to a local
index on port 8000, which stalls every pygame game; any other host uses the
vendored runtime.

## Attribution

Each cabinet links to its original repository, which carries its own license.
`Super Mario Bros in MASM` is not ported: it is x86 assembly against the Win32
console and has no WebAssembly build path.
