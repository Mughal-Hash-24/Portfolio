# ibtasaam.com

Personal portfolio of **Ibtasaam Amjad** — developer, storyteller, creative innovator.

The site opens on a Minecraft-inspired title screen, then moves through chapters with distinct visual identities: an editorial about section, a project index, a literal arcade with playable browser ports of C++ and Python games, a terminal-style AI guide, and a quiet contact page.

> **Status:** title screen implemented with a cubemap panorama, generated wordmark and edition, menu hierarchy, and Minecraft audio player. The chapters are placeholders; the arcade and AI guide are next.

## Stack

| Layer     | Choice                                        |
| --------- | --------------------------------------------- |
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling   | Tailwind CSS v4                               |
| 3D        | Three.js, React Three Fiber, drei             |
| Motion    | GSAP + ScrollTrigger, Motion, Lenis           |
| Audio     | HTMLAudioElement, Minecraft derivatives (dev) |
| Content   | MDX (planned)                                 |
| Games     | C++/SFML → Emscripten, Python/pygame → pygbag |
| Hosting   | Vercel — [ibtasaam.com](https://ibtasaam.com) |

## Requirements

- Node.js 22 or newer
- npm 10 or newer

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The title screen loads panorama faces from `public/panoramas/_dev/` and audio from `public/audio/_dev/`. Both folders are gitignored because they contain Mojang assets. Without them the background falls back to a gradient and the audio dock is hidden. See [docs/ASSETS.md](./docs/ASSETS.md) for the asset layout and production requirements.

## Scripts

| Command                | Purpose                      |
| ---------------------- | ---------------------------- |
| `npm run dev`          | Start the development server |
| `npm run build`        | Production build             |
| `npm run start`        | Serve the production build   |
| `npm run lint`         | Run ESLint                   |
| `npm run lint:fix`     | Run ESLint with fixes        |
| `npm run typecheck`    | Type-check without emitting  |
| `npm run format`       | Format with Prettier         |
| `npm run format:check` | Verify formatting            |

## Project structure

```text
.
├── public/
│   ├── audio/          # Dev-only music derivatives (gitignored)
│   ├── brand/          # Wordmark and edition logos
│   ├── games/          # WASM game builds, one folder per game
│   ├── panoramas/      # Title-screen panorama frames
│   └── ui/minecraft/   # Approved button sprites
├── src/
│   ├── app/            # App Router: layouts, pages, route handlers
│   ├── components/     # Hero, audio, and chapter UI
│   ├── content/        # Typed site content and metadata
│   └── lib/            # Shared utilities
├── docs/               # Decisions and working notes
└── AGENTS.md           # Notes for coding agents working in this repo
```

## Branching

- `main` — production. Every push deploys to [ibtasaam.com](https://ibtasaam.com).
- `dev` — integration branch for work in progress.
- `feat/<scope>`, `fix/<scope>`, `chore/<scope>` — short-lived branches off `dev`.

Open a pull request into `dev`. Merge `dev` into `main` when a release is ready. See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Deployment

The project is set up for Vercel:

1. Import the GitHub repository in Vercel.
2. Set **Production Branch** to `main`.
3. Add `ibtasaam.com` and `www.ibtasaam.com` under **Settings → Domains**.
4. Add the DNS records Vercel shows for your account, or point the domain's nameservers at Vercel.
5. Set the primary domain so the other redirects to it.

Preview deployments are created for every branch and pull request.

Copy [`.env.example`](./.env.example) to `.env.local` for local secrets. Never commit real keys.

## Asset and licensing policy

- **Mojang assets:** reference-only, with one approved exception — the two button sprites in `public/ui/minecraft/`, used at the owner's request and excluded from the MIT license. Development panorama and audio derivatives are gitignored and never committed.
- **Audio:** local development uses the installed game's soundtrack in `public/audio/_dev/` (gitignored). Production must use licensed/CC0 tracks or an official Spotify embed.
- **Game builds** live in `public/games/<slug>/` with their own license and source link.
- **Code** is MIT licensed. Written content, artwork, and audio are © Ibtasaam Amjad, all rights reserved.

See [docs/ASSETS.md](./docs/ASSETS.md) for the full asset manifest, font licenses, the button sprite exception, and the audio policy.

## Roadmap

1. **Foundation** — design tokens, theme engine, base layout, deployment
2. **Title screen** — cubemap panorama, generated wordmark/edition, menu hierarchy, music player
3. **Chapters** — About, Projects (MDX), Journey, Contact
4. **Arcade** — cabinet UI, WASM game loading, first playable port
5. **Ask Me** — streaming AI agent with rate limits and a static FAQ fallback
6. **Polish** — performance budget, accessibility audit, OG images, analytics

## License

Code is released under the [MIT License](./LICENSE). All site content, artwork, and audio remain the property of Ibtasaam Amjad.
