# Asset manifest

## Policy

Mojang assets are **reference material only**. Extracted files live in the gitignored `reference/` folder and must never be committed or served. The site ships original recreations: hand-built CSS/SVG, self-hosted fonts, the generated wordmark, and self-captured footage.

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
- Sets: amethyst geode, bees, cherry grove, classic, happy ghasts, lakeside sunset, mangrove swamp, nether, nostalgia, ocean, Oceanside Extreme Hills, pale garden, pack, spring to life, sunset valley, the end, trial chamber, underground lava pool, village.
- These are Mojang's official panoramas. They stay local-only.

## Button specification

Measured from the 200×20 nine-slice sprite (border: 3 px):

- Outer 1 px black outline.
- 1 px top and left highlight: `#aaaaaa`.
- 1–2 px bottom and right shadow: `#565656`.
- Interior: `#6f6f6f` with a subtle stone noise texture.
- Hover interior: `#767676`; disabled interior: `#2d2d2d`.
- Text: centered, white, with a 1 px `#3f3f3f` drop shadow.
- No corner radius at texture level; the UI keeps hard pixel corners.

Recreate with layered `box-shadow` and an original noise layer. Never ship the extracted sprite.

## Fonts

| Font       | Role              | Source                                 | License |
| ---------- | ----------------- | -------------------------------------- | ------- |
| Monocraft  | Minecraft UI text | https://github.com/IdreesInc/Monocraft | OFL 1.1 |
| Geist      | Body copy         | Next.js font loader                    | OFL 1.1 |
| Silkscreen | Display accents   | Google Fonts                           | OFL 1.1 |

Monocraft files live in `src/app/fonts/` with its `OFL.txt`. It is Minecraft-inspired but not affiliated with Mojang.

## Panoramas

The title screen uses a six-face cubemap. The Three.js loader expects faces in `right, left, top, bottom, front, back` order; the Minecraft files are `front, right, back, left, top, bottom`.

Source structure:

```text
reference/All Panoramas/assets/minecraft/textures/gui/title/background/
├── <set>_panorama_0.png   # front
├── <set>_panorama_1.png   # right
├── <set>_panorama_2.png   # back
├── <set>_panorama_3.png   # left
├── <set>_panorama_4.png   # top
├── <set>_panorama_5.png   # bottom
└── <set>_panorama_overlay.png
```

### Development derivatives

- Path: `public/panoramas/_dev/<slug>/panorama_0..5.webp`
- Size: 768×768, WebP quality 82, ~68 KB per set.
- **Gitignored.** These are Mojang assets and must not be committed or deployed.
- Generated from `reference/All Panoramas/` with ImageMagick.

### Production assets

- Path: `public/panoramas/<slug>/panorama_0..5.webp`
- Must be self-captured or licensed. Do not copy the official pack.
- Optional `panorama_overlay.webp` (16×128 strip) for the horizon gradient.
- Keep each set under 1.5 MB after compression.

The manifest lives in `src/content/panoramas.ts`. Development-only entries are filtered out of production builds.

## Logo

The wordmark is the AI-generated stone-block logo supplied by Ibtasaam:

| File                                      | Details                                    |
| ----------------------------------------- | ------------------------------------------ |
| `reference/IBTASAAM Stone Block Logo.png` | Source, 2172×724 RGBA, 871 KB (gitignored) |
| `public/brand/ibtasaam-wordmark.webp`     | 1800×527, 63 KB, alpha preserved           |

It is Minecraft-inspired but uses original generated lettering. Do not replace it with a Mojang logo.

## Monogram

A grass-block monogram for the favicon is still planned. It must be original artwork.
