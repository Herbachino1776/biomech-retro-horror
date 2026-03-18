# Biomech Retro Horror

A 1990s-inspired retro horror game project with oppressive biomechanical aesthetics, built for a GitHub + Codex workflow.

## Objective
Create a playable vertical slice first:
- Chamber 01 and Chamber 02 playable in sequence
- 1 player character
- regular skitter encounters plus TOLL-KEEPER variants
- 1 miniboss
- chamber-specific cinematic lore flows
- 1 title screen
- 1 death / restart loop
- 1 coherent visual biome

## Shipped Slice Reality
- Chamber 01 remains the playable foundation and still uses `LoreScreenScene` for its first shrine-driven lore beat.
- Chamber 01 also uses `LoreCutsceneScene` for the later dead-god witness beat.
- Chamber 01 culminates in the Half-Skull Ascendant miniboss encounter and gate-release payoff.
- Chamber 02 uses `LoreCutsceneScene` for its shrine/exit-gate lore flow and post-lore reaction state.
- Chamber 02 ends on a TOLL-KEEPER-gated exit lore payoff rather than a playable Chamber 03, which is the current intentional scope boundary.
- Restart/reset flow safely handles both lore-scene types because both are live in the shipped game.

## Tech Stack (Current Scaffold)
- Engine: Phaser 3
- Runtime: Node.js (npm)
- Dev server / bundler: Vite
- Language: JavaScript (ES modules)

## Project Structure

```text
/assets
  /audio
  /backgrounds
  /sprites
  /ui
/docs
/prompts
/src
  /data
    gameConfig.js
  /entities
  /scenes
    BootScene.js
  /systems
  /ui
  main.js
index.html
package.json
```

## Local Development

### 1) Install dependencies

```bash
npm install
```

### 2) Run the dev server

```bash
npm run dev
```

Vite will print a local URL (usually `http://localhost:5173`). Open it in your browser.

### 3) Build for production

```bash
npm run build
```

Build output is generated in `dist/`.

### 4) (Optional) Preview the production build

```bash
npm run preview
```

## GitHub Pages Deployment

This project is deployed as a **project site** (not a user/org root site), so the production base path must be:

`/biomech-retro-horror/`

Expected live URL:

`https://herbachino1776.github.io/biomech-retro-horror/`

### Deployment setup

1. In GitHub, open **Settings → Pages**.
2. Set **Source** to **GitHub Actions**.
3. Ensure your default branch is `main` (or update `.github/workflows/deploy-pages.yml` if different).

### Deploy

Every push to `main` triggers `.github/workflows/deploy-pages.yml` to:

1. install dependencies with `npm ci`
2. run `npm run build`
3. upload `dist/` as the Pages artifact
4. deploy to GitHub Pages

### Play the deployed build

Open:

`https://herbachino1776.github.io/biomech-retro-horror/`

### Local dev remains unchanged

Use:

```bash
npm run dev
```

This still serves the game locally from `/`.

## Workflow
1. Read `AGENTS.md`.
2. Read repo docs in `/docs` and treat them as source of truth.
3. Implement the current milestone only.
4. Keep changes small and modular.
5. Open PR-sized changes, not giant rewrites.

## Current Milestone Status
Milestone 3 is complete. See `docs/current-milestone.md`, `docs/milestone-roadmap.md`, and `docs/milestones.md` for the shipped slice status and the next milestone.
