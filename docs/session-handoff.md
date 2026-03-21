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
- Start/title flow into Chamber 01 and death/restart loop.
- Chamber 01 core loop (move/jump/attack/damage/death) remains stable.
- Chamber 01 first lore shrine -> `LoreScreenScene` beat remains stable.
- Chamber 01 dead-god witness beat -> `LoreCutsceneScene` -> Half-Skull Ascendant miniboss flow remains stable.
- Chamber 01 miniboss defeat payoff and Chamber 01 -> Chamber 02 gate release are active.
- Chamber 02 is playable with established platform/combat pacing.
- Chamber 02 central shrine/ossuary lore trigger runs through `LoreCutsceneScene` and preserves diegetic presentation.
- Chamber 02 post-lore reaction state is implemented: environmental ritual shift plus enemy wake/activation.
- Chamber 02 TOLL-KEEPER encounter pair gates the exit and unlocks the end gate on defeat.
- Chamber 02 exit gate lore trigger/payoff is active after unlock.
- Chamber 01 + Chamber 02 ambience is integrated in the shipped slice.
- Player footsteps/combat/death audio is present.
- Skitter, TOLL-KEEPER, miniboss, lore/gate, and banishment cues are present.
- Recent audio QA/polish is already reflected in the shipped baseline.
- Mobile controls remain corrected for portrait and landscape playability.
- Texture-first asset loading with fallback resilience remains stable.

## What Still Needs Work Now
- Chamber 03 now exists as the next playable content step and completes the current sector with a threshold omen beat plus true boss encounter.
- Future content expansion should treat Chamber 03 length/consequence as the new chamber complexity floor.
- Combat presentation can still be polished further later, but current readability is sufficient for the shipped baseline.

## Active Milestone
**Milestone 5 — Content Expansion: active.**

### Milestone 5 Planning Definition
- Core goal: extend the shipped Chamber 01 + Chamber 02 audio-integrated slice with the next playable content step.
- Scope: next area/chamber progression using established control, combat, lore, and audio patterns.
- Constraints: preserve mobile playability, preserve keyboard parity, and do not destabilize the current shipped baseline while expanding content.

## Latest Completed Task
- Milestone 4 audio identity pass is shipped and closed out.
- Chamber 01 + Chamber 02 ambience, player footsteps/combat/death audio, skitter/TOLL-KEEPER/miniboss cues, and lore/gate/banishment cues are integrated in the current playable slice.
- Recent audio QA/polish has already been folded into the shipped baseline without changing the slice scope.
- Docs/status files now reflect Milestone 4 completion and Milestone 5 activation.

## Exact Next Best Step After This Task
Extend beyond the new Chamber 03 sector finale baseline without regressing the now-playable Chamber 01 -> Chamber 02 -> Chamber 03 sequence.

## Most Important Constraints
1. Do not regress GitHub Pages/Vite base-path behavior.
2. Keep mobile controls visible, fixed, and aligned in portrait and landscape.
3. Preserve desktop keyboard controls.
4. Keep texture-first rendering; fallback only on load failure.
5. Preserve dedicated cinematic lore-screen flow as the preferred lore delivery direction.
6. Preserve in-world ritual shrine/ossuary lore trigger presentation direction.
7. Preserve Chamber 01 + Chamber 02 stability while expanding content.
8. End meaningful tasks with `npm run build`.
