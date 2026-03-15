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
- Lore trigger/dialogue pause flow.
- Texture-first asset loading with fallback resilience.

## What Still Needs Work Now
- Sentinel + Laughing Engine are not full encounter systems yet.
- Chamber progression/seal logic remains partial.
- Lore presentation still needs dedicated cinematic lore-screen state flow.
- Ongoing art normalization toward locked shared palette/readability doctrine.

## Active Milestone
**Milestone 1 — Playable Mobile Vertical Slice (signoff hardening).**

## Exact Next Best Step After This Task
Implement the first discrete lore-screen transition for Chamber 01 (fade out gameplay → lore screen/state with subtle drift and cryptic text → fade back to gameplay), while preserving mobile input parity and base-path/asset invariants.

## Most Important Constraints
1. Do not regress GitHub Pages/Vite base-path behavior.
2. Keep mobile controls visible, fixed, and aligned in iPhone portrait.
3. Preserve desktop keyboard controls.
4. Keep texture-first rendering; fallback only on load failure.
5. Prefer text/code changes unless binary changes are explicitly required.
6. End meaningful tasks with `npm run build`.
7. Respect locked palette/readability doctrine and cinematic lore direction.
