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

## Repository protection

The CI workflow in `.github/workflows/ci.yml` runs the pull request checks. Configure GitHub branch protection (Settings → Branches or Rulesets) so those checks are enforced:

- `main` — require a pull request, require the **Quality** check, block force pushes and deletions, and do not allow bypassing. Only release merges from `dev` land here. Keep "require branches to be up to date" off: `Quality` runs against the pull request merge commit, so a release is still tested against current `main` without forcing a `main` → `dev` sync.
- `dev` — require the **Quality** check, and block force pushes and deletions. Require pull requests as well if you want the integration branch to stay review-only; otherwise direct pushes are fine as long as CI passes.
- Vercel — keep **Production Branch** set to `main` and leave preview deployments enabled for all other branches.

If you rename the workflow or job, update the required check name to match.

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
- [ ] No Mojang assets beyond the owner-approved button sprites, panorama sets, and Blob soundtrack; no dev audio committed
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

- Mojang assets are limited to the owner-approved set: the two button sprites, the 19 panorama sets in `public/panoramas/<slug>/`, and the soundtrack in the public Vercel Blob store. Do not add other textures, fonts, sounds, or panoramas.
- Development audio derivatives live in the gitignored `public/audio/_dev/` folder and must never be committed.
- Game builds must include a source link and license.
- Production audio is hosted in the public Vercel Blob store; do not add other audio assets.

## Reporting issues

Use GitHub issues with a clear description and, for visual bugs, a screenshot or recording.
