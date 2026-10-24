# Asset manifest

## Policy

Reference files live in the gitignored `reference/` folder and are never deployed. The site ships the generated wordmark and edition, self-hosted fonts, and original CSS/SVG work.

There is one approved exception: the two Minecraft button sprites in `public/ui/minecraft/` are used at the owner's request for this personal fan project. They are not covered by the MIT license, and no other Mojang art, font, sound, or panorama is committed.

## Reference library

### Minecraft client (26.2)

Extracted from `~/.minecraft/versions/26.2/26.2.jar` into `reference/minecraft-26.2/`:

| Path        | Contents                                                                  |
| ----------- | ------------------------------------------------------------------------- |
| `widget/`   | `button.png`, `button_highlighted.png`, `button_disabled.png` + `.mcmeta` |
| `title/`    | `minecraft.png`, `edition.png`                                            |
| `font/`     | `ascii.png`, `accented.png`, `nonlatin_european.png`, `default.json`      |
| `menu/`     | menu background and separator textures                                    |
| `panorama/` | Placeholder 1×1 sprites only                                              |

### Panorama pack

`reference/All Panoramas/` is a 19-set resource pack:

- **19 sets × 6 faces** = 114 panorama images, 1024×1024 each.
- 13 overlay strips at 16×128.
- These are Mojang's official panoramas. They stay local-only.

### Audio

Resolved from `~/.minecraft/assets/indexes/32.json` and the hashed object store:

- 70 background tracks (`music/game/`, `music/menu/`).
- 22 music discs (`records/`).
- 1 UI click (`random/click.ogg`).
- 279.7 MB of source Ogg Vorbis.

## Buttons

The UI uses the extracted 200×20 sprites directly as nine-slice border images:

| File                                         | Purpose             |
| -------------------------------------------- | ------------------- |
| `public/ui/minecraft/button.png`             | Default menu button |
| `public/ui/minecraft/button-highlighted.png` | Hover / focus state |

- `border-image-slice: 3 fill`, `border-image-width: 6px`, `border-image-repeat: stretch`.
- Default: black outline, `#aaaaaa` top/left highlight, `#6f6f6f` face, `#565656` bottom/right shadow.
- Highlighted: white outline, `#afafaf` top/left, `#757575` face, `#5c5c5c` bottom/right.
- Text: white, `2px 2px 0 #3f3f3f` shadow.

Do not add other Minecraft textures. The sprites are an explicit, documented exception to the general asset policy.

## Fonts

| Font       | Role              | Source                                 | License |
| ---------- | ----------------- | -------------------------------------- | ------- |
| Monocraft  | Minecraft UI text | https://github.com/IdreesInc/Monocraft | OFL 1.1 |
| Geist      | Body copy         | Next.js font loader                    | OFL 1.1 |
| Silkscreen | Display accents   | Google Fonts                           | OFL 1.1 |

Monocraft files live in `src/app/fonts/` with its `OFL.txt`.

## Panoramas

The title screen uses a six-face cubemap. Three.js expects faces in `right, left, top, bottom, front, back` order; the Minecraft files are `front, right, back, left, top, bottom`.

### Development derivatives

- Path: `public/panoramas/_dev/<slug>/panorama_0..5.webp`
- Size: 1024×1024, WebP quality 82, ~88 KB per set, 9.9 MB for all 19.
- **Gitignored.** These are Mojang assets and are never committed or deployed.
- Generated from `reference/All Panoramas/` with ImageMagick.

### Production assets

- Path: `public/panoramas/<slug>/panorama_0..5.webp`
- Must be self-captured or licensed. Do not copy the official pack.
- Optional `panorama_overlay.webp` (16×128 strip) for the horizon gradient.
- Keep each set under 1.5 MB after compression.

The manifest lives in `src/content/panoramas.ts`. Development-only entries are filtered out of production builds.

## Audio files

- Development derivatives: `public/audio/_dev/{music,records,ui}/*.mp3`, MP3 VBR (`-q:a 4`).
- **Gitignored.** Never commit or deploy the official soundtrack.
- Manifest: `src/content/music.ts` (track metadata and paths) plus a local `public/audio/_dev/manifest.json`.
- Playback: HTMLAudioElement, 0.3 ambient volume, 0.5 disc volume, 0.35 click volume.
- The first menu click or audio toggle starts the ambient playlist. Discs play once from the jukebox, then ambient music resumes.
- Production must provide licensed/CC0 tracks in `customBackgroundTracks` / `customDiscTracks`, or use an official Spotify embed.

## Logo

The wordmark and edition are AI-generated stone-block assets supplied by Ibtasaam:

| File                                            | Details                                    |
| ----------------------------------------------- | ------------------------------------------ |
| `reference/IBTASAAM Stone Block Logo.png`       | Source, 2172×724 RGBA, 871 KB (gitignored) |
| `public/brand/ibtasaam-wordmark.webp`           | 1800×527, 63 KB, alpha preserved           |
| `reference/Portfolio Edition 3D Block Logo.png` | Source, 2172×724 RGBA, 480 KB (gitignored) |
| `public/brand/portfolio-edition.webp`           | 1200×281, 26 KB, alpha preserved           |

The edition sits directly under the wordmark at 45% of its width, with the splash text immediately to its right. The generated lettering is Minecraft-inspired but not a Mojang logo.

## Monogram

A grass-block monogram for the favicon is still planned. It must be original artwork.
