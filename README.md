# Biomech Retro Horror

A browser-playable retro horror action prototype built with Phaser 3 + Vite, developed in a GitHub + Codex workflow.

## Project State (March 28, 2026)
This is a **multi-sector prototype** with active Sector 3 expansion underway.

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
  - Chamber 3 chamber-end major encounter payoff (**The Sorrow Engine**)
  - first trap-altar -> boss-pit loop in Sector 2 Chamber 2
  - established kill-payoff language (**Black Oil / Tar-laced Blood**)
  - live projectile + AOE readability combat tech in shipped encounters
- **Sector 3 (The Cradle of Refusal)** has started in playable form:
  - Chamber 1: **Gallery of Failed Measures** (`Sector03Chamber01Scene`)
  - functional encounter pockets + lore altar + threshold/seal handoff scaffold

## Milestone Direction Snapshot
- **Milestone 7** was meaningfully advanced through shared major-encounter resolution flow, chamber-end ritual/cinematic motion groundwork, and boss-death doctrine hardening.
- Milestone 7 is now **largely established** but can still receive targeted follow-up in remaining quality lanes.
- **Boss pits are core structural identity** (not optional side flavor).
- **Milestone 8 is now active in practice** through Sector 3 Chamber 1 and early Sector 3 buildout.

## Current Direction
- Preserve Sector 1 + Sector 2 + early Sector 3 functionality while reducing regressions.
- Continue Milestone 8 as coupled work: **Sector 3 buildout + boss-pit expansion**.
- Author new chambers with explicit background/encounter tier synergy (corridor basics vs opened-room elite domains).
- Keep the **future character animation lane** explicit but deferred (planned start point: player sprite).

## Planned (Not Active Yet): Character Animation Lane
Character animation is a real future production lane, but it is **not** the current implementation focus.

Planned later scope includes:
- player locomotion animation improvements
- weapon swing animation
- Rite animation
- broader combat/performance animation language

Current static-sprite-heavy gameplay presentation is an interim production state, not permanent doctrine.

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
