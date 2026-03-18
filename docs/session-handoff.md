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
- Chamber 01 core loop (move/jump/attack/damage/death) remains stable.
- Chamber 01 lore shrine -> cinematic lore-screen flow remains stable.
- Chamber 01 -> Chamber 02 transition is active.
- Chamber 02 is playable with established platform/combat pacing.
- Chamber 02 lore shrine triggers a dedicated cinematic lore-screen beat via reusable `LoreCutsceneScene` + cutscene config.
- Chamber 02 lore-screen composition is now portrait-safe and landscape-safe using per-screen layout overrides + aspect-preserving image fit.
- Chamber 02 post-lore reaction state is implemented: environmental ritual shift plus ritual-aligned enemy activation.
- Mobile controls remain corrected for portrait and landscape playability.
- Texture-first asset loading with fallback resilience remains stable.

## What Still Needs Work Now
- Sentinel + Laughing Engine are not full encounter systems yet.
- Chamber progression/seal logic remains partial.
- Audio identity pass (ambient + encounter + lore transitions) is still pending.

## Active Milestone
**Milestone 3 — Encounter Expansion + Combat Readability: planned, not yet implemented.**

### Milestone 3 Planning Definition
- Core goal: deepen encounter quality without broad scope creep.
- Relationship to Milestone 2: Milestone 2 already established Chamber 01 + Chamber 02 progression, lore/cutscene flow, and the baseline encounter space; Milestone 3 now focuses on encounter depth/readability rather than new chamber expansion.
- Must-have scope: better regular enemy telegraphing, pacing/attack downtime, attack range readability cues, stronger hit/hurt feedback, one miniboss refinement pass, and limited combat visual productionization only where needed.
- Out of scope: new chambers, giant new systems, full animation pipeline work, broad audio overhaul, puzzle expansion, multiple new enemy families at once, major UI redesign, and major progression rewrite.
- Ordered implementation path: (1) regular enemy encounter depth pass, (2) miniboss refinement pass, (3) limited combat presentation support only where needed.
- Hard constraints: preserve portrait mobile playability, desktop controls, current chamber progression, current lore/cutscene systems, and avoid broad redesigns.

## Latest Completed Task
- Milestone 2 closeout pass shipped and stabilized for handoff.
- Chamber 2 lore-screen portrait composition corrected (no flattened/smushed image strip; stronger filled composition with readable text containment).
- Chamber 2 first post-lore reaction state established (ambient veil + gate ritual visual shift + one ritual-aligned enemy wake/activation).
- Chamber 2 lore implementation is now the reusable cutscene baseline for future chambers (swap art/text/config, keep flow architecture).
- Milestone/docs status updated to match shipped behavior.

## Exact Next Best Step After This Task
Begin the **regular enemy encounter depth pass** for Milestone 3: improve one existing regular enemy's telegraphing, pacing/downtime, attack range readability, and hit/hurt feedback while preserving mobile readability, current chamber progression, lore cadence, and deployment invariants.

## Most Important Constraints
1. Do not regress GitHub Pages/Vite base-path behavior.
2. Keep mobile controls visible, fixed, and aligned in portrait and landscape.
3. Preserve desktop keyboard controls.
4. Keep texture-first rendering; fallback only on load failure.
5. Preserve dedicated cinematic lore-screen flow as the preferred lore delivery direction.
6. Preserve in-world ritual shrine/ossuary lore trigger presentation direction.
7. Preserve Chamber 01 stability while expanding encounter depth.
8. End meaningful tasks with `npm run build`.
