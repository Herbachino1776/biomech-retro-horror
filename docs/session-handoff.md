# Session Handoff

Use this file to start a fresh planning/implementation session quickly.

## Project Identity (Non-Negotiable)
Biomech Retro Horror is a browser-playable **biomechanical ritual horror** vertical slice.
Priorities: oppressive pacing, gameplay readability, diegetic UI, cryptic symbolic lore, and milestone discipline over feature sprawl.

## Current Stack + Deployment Model
- Engine/runtime: Phaser 3 (ES modules)
- Toolchain: Vite
- Deployment: GitHub Pages project-site (`/biomech-retro-horror/` base in production)
- Target support: iPhone portrait touch play + desktop keyboard parity

## What Works Now
- Start/boot into Chamber 01 and death/restart loop.
- Player core loop (move/jump/attack/damage/death).
- Skitter Servitor enemy loop (including kill loop).
- Mobile controls corrected for portrait and landscape playability.
- Chamber 01 first lore beat uses a dedicated cinematic lore-screen transition.
- Laughing Engine / furnace art is integrated as the first lore-screen prototype.
- Chamber 01 lore trigger presentation is an in-world ritual shrine/ossuary-style prop.
- Texture-first asset loading with fallback resilience.

## What Still Needs Work Now
- Sentinel + Laughing Engine are not full encounter systems yet.
- Chamber progression/seal logic remains partial.
- Chamber 01 lore-screen pattern should be generalized cleanly for additional beats.
- Ongoing art normalization toward locked shared palette/readability doctrine.

## Active Milestone
**Milestone 1 — Playable Mobile Vertical Slice: completed.**

## Latest Completed Task
- Chamber 02 conservative first integration/planning pass completed.
- All five Chamber 02 raw source assets are now wired into centralized asset key/URL mapping and boot preload without activating Chamber 02 gameplay/scene flow.
- Integration roles, production-facing naming targets, and defer notes are documented in `docs/chamber02-first-integration-pass.md` and `src/data/chamber02ArtPlan.js`.

## Exact Next Best Step After This Task
Implement **Milestone 2 visual production hardening in Chamber 01**: normalize current playable assets and interactable readability (including shrine/lore affordances) toward the locked palette + silhouette doctrine without expanding mechanics/scope.

## Most Important Constraints
1. Do not regress GitHub Pages/Vite base-path behavior.
2. Keep mobile controls visible, fixed, and aligned in portrait and landscape.
3. Preserve desktop keyboard controls.
4. Keep texture-first rendering; fallback only on load failure.
5. Preserve dedicated cinematic lore-screen flow as the preferred lore delivery direction.
6. Preserve in-world ritual shrine/ossuary lore trigger presentation direction.
7. Prefer text/code changes unless binary changes are explicitly required.
8. End meaningful tasks with `npm run build`.
