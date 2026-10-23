# Contributing

Thanks for taking a look at the project. This is a personal portfolio, but the conventions below keep it maintainable.

## Setup

```bash
npm install
npm run dev
```

Before opening a pull request, run:

```bash
npm run lint
npm run typecheck
npm run format:check
npm run build
```

## Branch model

- `main` — production; deploys to ibtasaam.com
- `dev` — integration branch
- `feat/<scope>` — new features
- `fix/<scope>` — bug fixes
- `chore/<scope>` — tooling and maintenance

Branch from `dev` and open pull requests back into `dev`. `main` only receives tested release merges.

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/):

```text
feat(hero): add title-screen menu
fix(arcade): release pointer lock on escape
docs(readme): document deployment steps
```

Common types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`.

Keep commits focused. One logical change per commit.

## Pull request checklist

- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes
- [ ] `npm run build` passes
- [ ] Checked on mobile and desktop
- [ ] Keyboard navigation works
- [ ] `prefers-reduced-motion` path is usable
- [ ] No new Mojang assets or ripped media
- [ ] Screenshots included for visual changes

## Code style

- TypeScript strict mode; prefer typed data over `any`.
- Server Components by default. Add `"use client"` only where interactivity requires it.
- Keep client bundles small; lazy-load 3D and game code.
- Style with Tailwind utilities. Use CSS Modules for complex, scoped effects.
- Animation: GSAP for scroll choreography, Motion for UI interactions. Do not animate the same element with both.
- Respect the existing naming and file layout.

## Performance budget

- Initial JavaScript for `/`: under 200 KB gzipped, excluding lazily loaded 3D and game code.
- Hero video: under 5 MB; poster image: under 200 KB.
- No layout shift from fonts, video, or the canvas.
- Pause WebGL rendering when offscreen or when the tab is hidden.

## Accessibility

- WCAG AA contrast for every chapter palette.
- Visible focus states on all interactive elements.
- Menu and navigation must work with a keyboard.
- Provide meaningful static fallbacks when 3D, video, or audio fails.
- Never trap the user: the title screen needs a keyboard-accessible exit.

## Assets

- Original artwork only. No Minecraft textures, fonts, sounds, or official panoramas.
- Game builds must include a source link and license.
- Audio must be licensed, CC0, or played through an official embed.

## Reporting issues

Use GitHub issues with a clear description and, for visual bugs, a screenshot or recording.
