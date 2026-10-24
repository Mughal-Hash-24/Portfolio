# Asset manifest

## Policy

Reference files live in the gitignored `reference/` folder. At the owner's request, this personal fan project also deploys:

- the two Minecraft button sprites in `public/ui/minecraft/`
- the 19 official panorama sets in `public/panoramas/<slug>/`
- the Minecraft soundtrack in the public Vercel Blob store `ibtasaam-audio`

These are not covered by the MIT license, and no other Mojang art, font, or sound should be added.

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
- The 19 sets are deployed at the owner's request for this personal fan project.

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

- Local working copies: `public/panoramas/_dev/<slug>/` (gitignored).
- Deployed copies: `public/panoramas/<slug>/panorama_0..5.webp` (committed).
- Size: 1024×1024, WebP quality 82, ~88 KB per set, ~10 MB for all 19.
- Generated from `reference/All Panoramas/` with ImageMagick.

### Production assets

- Path: `public/panoramas/<slug>/panorama_0..5.webp`
- The 19 official sets are deployed at the owner's request.
- The manifest in `src/content/panoramas.ts` includes every set; there is no production filter.
- Keep the deployed source under the Vercel plan's file-size limit.

## Audio files

- Development derivatives: `public/audio/_dev/{music,records,ui}/*.mp3`, MP3 VBR (`-q:a 4`), gitignored.
- Production: public Vercel Blob store **ibtasaam-audio** (`store_Dmso7kB5nN1fjSwD`, region `iad1`), 1 GB Hobby allocation.
- Public URL base: `https://dmso7kb5nn1fjswd.public.blob.vercel-storage.com/audio/`
- The store contains 70 background tracks, 22 discs, and the UI click (~337 MB).
- `src/content/music.ts` maps the dev paths to Blob URLs at build time; production uses the Blob URLs.
- Blob storage is external to the deployment, so the Hobby 100 MB source cap does not apply to the soundtrack.
- Playback: HTMLAudioElement, 0.3 ambient volume, 0.5 disc volume, 0.35 click volume.
- The auto-play pool contains every background track **and** every disc, shuffled. The jukebox selects a disc directly. After a track ends, the next random track from the full pool plays.

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
