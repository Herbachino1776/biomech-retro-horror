# Biomech Retro Horror

A browser-playable retro horror action prototype built with Phaser 3 + Vite, developed in a GitHub + Codex workflow.

## Project State (March 2026)
This is now a **multi-sector prototype**, not a Chamber 01-only vertical-slice stub.

- **Sector 1 (Ossuary / dead-god palace arc)** is functionally in place:
  - Chamber 01
  - Chamber 02
  - Chamber 03
  - separate boss arena finale
  - real boss payoff + progression onward
- **Sector 2 (The Black Aqueduct / Pressure Gospel arc)** is functionally in place in prototype form:
  - Chamber 1: **Black Aqueduct Intake**
  - Chamber 2: **The Compression Vaults**
  - Chamber 3: **The Kiln of Judgement**
  - Sector 2 chamber boss payoff in Chamber 3 (**The Sorrow Engine**)
  - first boss-pit template in Sector 2 Chamber 2
  - established kill-payoff language (**Black Oil / Tar-laced Blood**)
  - working projectile + AOE readability combat tech in live encounters

## Milestone Direction Snapshot
- Milestone 7 delivered major combat-sidequest progress (including Vessel run economy, gore payoff pass, projectile/AOE lanes, readability passes, and the first boss-pit prototype).
- Milestone 7 is advanced but still open in specific lanes (7C, 7H, 7I).
- Sector 3 doctrine is now explicitly defined as **The Cradle of Refusal** and planned as a major escalation point.
- Boss pits are now treated as **core structural identity**, not optional distant flavor.

## Current Direction
- Preserve Sector 1 + Sector 2 functionality while reducing regressions.
- Finish remaining Milestone 7 lanes before declaring closure.
- Prepare Milestone 8 as coupled work: **Sector 3 buildout + boss-pit expansion**.

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
