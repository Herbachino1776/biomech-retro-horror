# Biomech Retro Horror

A browser-playable retro horror action prototype built with Phaser 3 + Vite, developed in a GitHub + Codex workflow.

## Project State (March 2026)
This is no longer a Chamber 01-only proof-of-concept.

- **Sector 1 (Ossuary / dead-god palace arc)** is functionally in place:
  - Chamber 01
  - Chamber 02
  - Chamber 03
  - separate boss arena finale
  - real boss payoff + progression onward
- **Sector 2 (Bucket 2: The Black Aqueduct / The Pressure Gospel arc)** is functionally in place in prototype form:
  - Chamber 1: **Black Aqueduct Intake**
  - Chamber 2: **The Compression Vaults**
  - Chamber 3: **The Kiln of Judgement**
  - Sector 2 chamber boss payoff in Chamber 3 (**The Sorrow Engine**)
  - established kill-payoff language (**Black Oil / Tar-laced Blood**)
  - working projectile tech used in live encounters

The game is still iterative and polish-heavy, but the current build is beyond a tiny vertical slice.

## Current Direction
- Preserve Sector 1 and Sector 2 functionality while reducing regressions.
- Stabilize and polish Sector 2 end-to-end behavior.
- Keep forward planning grounded for Sector 3 without pretending the game is content-complete.

## Tech Stack
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
  /audio
  /data
  /entities
  /scenes
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

Vite prints a local URL (usually `http://localhost:5173`).

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

This project is deployed as a **project site**. Production base path must remain:

`/biomech-retro-horror/`

Expected live URL:

`https://herbachino1776.github.io/biomech-retro-horror/`

### Deployment setup

1. In GitHub, open **Settings → Pages**.
2. Set **Source** to **GitHub Actions**.
3. Ensure default branch is `main` (or adjust `.github/workflows/deploy-pages.yml`).

### Deploy

Every push to `main` triggers `.github/workflows/deploy-pages.yml` to:

1. install dependencies with `npm ci`
2. run `npm run build`
3. upload `dist/` as the Pages artifact
4. deploy to GitHub Pages

### Play deployed build

Open:

`https://herbachino1776.github.io/biomech-retro-horror/`

## Working Norms
1. Read `AGENTS.md` and doctrine docs before major implementation work.
2. Keep milestone scope explicit and avoid silent unrelated rewrites.
3. Preserve mobile portrait playability and desktop keyboard parity.
4. Preserve base-path-safe deployment behavior.
5. End meaningful code tasks with build verification.
