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
- Chamber 02 exit gate unlock state remains active after the TOLL-KEEPER fight, and the restored baseline now stops safely at the Chamber 02 threshold without entering Chamber 03.
- Chamber 01 + Chamber 02 ambience is integrated in the shipped slice.
- Player footsteps/combat/death audio is present.
- Skitter, TOLL-KEEPER, miniboss, lore/gate, and banishment cues are present.
- Recent audio QA/polish is already reflected in the shipped baseline.
- Mobile controls remain corrected for portrait and landscape playability.
- Texture-first asset loading with fallback resilience remains stable.

## What Still Needs Work Now
- Chamber 03 work currently in the repo is not trusted gameplay content and should not be used as the active baseline.
- Chamber 03 will be rebuilt from scratch in a later pass rather than debugged forward from the current emergency scene.
- Content expansion beyond the shipped Chamber 01 + Chamber 02 slice is the next milestone focus.
- Combat presentation can still be polished further later, but current readability is sufficient for the shipped baseline.

## Active Milestone
**Milestone 5 — Content Expansion: active.**

### Milestone 5 Planning Definition
- Core goal: extend the shipped Chamber 01 + Chamber 02 audio-integrated slice with the next playable content step.
- Scope: next area/chamber progression using established control, combat, lore, and audio patterns.
- Constraints: preserve mobile playability, preserve keyboard parity, and do not destabilize the current shipped baseline while expanding content.

## Latest Completed Task
- Emergency Chamber 03 direct-boot overrides were removed from the active app path.
- Normal BootScene title flow was restored as the trusted default entry.
- Chamber 01 + Chamber 02 are again the active reliable baseline.
- Chamber 02 now ends safely at its unlocked threshold instead of handing off into the current Chamber 03 emergency debug scene.
- Docs/status files now reflect the restored baseline and the requirement to rebuild Chamber 03 from scratch later.

## Exact Next Best Step After This Task
Use the Chamber 03 chunked planning docs as the implementation contract:
- `docs/chamber-03-master-plan.md`
- `docs/chamber-03-implementation-roadmap.md`

Immediate follow-through:
- begin from the restored title -> Chamber 01 -> Chamber 02 baseline,
- rebuild Chamber 03 in small milestone-disciplined slices,
- do not treat the current Chamber 03 emergency implementation as a stable starting point.

## Most Important Constraints
1. Do not regress GitHub Pages/Vite base-path behavior.
2. Keep mobile controls visible, fixed, and aligned in portrait and landscape.
3. Preserve desktop keyboard controls.
4. Keep texture-first rendering; fallback only on load failure.
5. Preserve dedicated cinematic lore-screen flow as the preferred lore delivery direction.
6. Preserve in-world ritual shrine/ossuary lore trigger presentation direction.
7. Preserve Chamber 01 + Chamber 02 stability while expanding content.
8. End meaningful tasks with `npm run build`.
