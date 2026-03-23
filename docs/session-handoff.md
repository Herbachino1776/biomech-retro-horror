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

## Fresh-Session Truth
- Chamber 3 finally works because the scene handoff contract was fixed, not because Chamber 3 internals were endlessly patched in isolation.
- The breakthrough was simple and surgical: ensure `Chamber03Scene` is registered, ensure Chamber 02's unlocked exit gate actually starts `Chamber03Scene`, and stop treating the failure as a deep chamber-content problem first.
- Sector 1 now has a real Chamber 3, a separate boss arena, a playable boss flow, a payoff path, and a forward progression contract.
- Known remaining Chamber 3 issues are real, but they are now secondary polish debt rather than the main blocker.
- The next best step is **not** more Chamber 3 rescue.
- The next best step is **Milestone 6: Bucket 2 foothold / The Black Aqueduct start**.

## What Works Now
- Start/title flow into Chamber 01 and death/restart loop.
- Chamber 01 core loop, lore beats, miniboss, and gate-release payoff remain stable.
- Chamber 02 is playable with shrine/cutscene flow, TOLL-KEEPER gate unlock, and onward progression wiring intact.
- Chamber 03 is playable in the active progression path.
- Chamber 03 now hands off into a separate boss arena for the Sector 1 finale.
- Sector 1 now has a complete functional arc: Chamber 01 -> Chamber 02 -> Chamber 03 -> boss flow -> onward progression contract.
- Mobile controls remain corrected for portrait and landscape playability.
- Desktop keyboard support remains intact.
- Texture-first asset loading with fallback resilience remains stable.
- GitHub Pages/Vite deployment invariants remain in force.

## Remaining Debt (Secondary)
- Chamber 3 encounter/pacing polish can still improve.
- Boss finale presentation and readability can still improve.
- Additional audiovisual cleanup remains worthwhile later, but it should not block Bucket 2 work.

## Active Milestone
**Milestone 6 — Bucket 2 Foothold / The Black Aqueduct Start: active.**

### Immediate Best Next Step
- Establish the first safe continuation beyond Sector 1.
- Build the initial Bucket 2 / The Black Aqueduct foothold as a canal/transit/infrastructure zone rather than a garden biome.
- Use black reflective liquid, necro-industrial canals, monumental gates/sluices, and oppressive symmetry as the current art-direction baseline.
- Preserve the now-working Sector 1 progression contract while opening the next area.

## Lessons Learned to Preserve
- **Bootstrap before spectacle.** Get the chamber booting and handing off correctly before layering setpiece content.
- **Do not one-shot giant chamber builds.** The failed single-pass Chamber 3 mega-build was the wrong implementation strategy.
- **When a chamber will not boot, check scene registration and transition wiring first.** Chamber flow bugs may be simpler than they look.
- **Do not patch a broken chamber in isolation when the real blocker is the previous scene's handoff contract.**

## Most Important Constraints
1. Do not regress GitHub Pages/Vite base-path behavior.
2. Keep mobile controls visible, fixed, and aligned in portrait and landscape.
3. Preserve desktop keyboard controls.
4. Keep texture-first rendering; fallback only on load failure.
5. Preserve dedicated cinematic lore-screen flow as the preferred lore delivery direction.
6. Preserve in-world ritual shrine/ossuary lore trigger presentation direction.
7. Preserve the shipped Sector 1 arc while opening Bucket 2.
8. End meaningful tasks with `npm run build` when code changes are involved.
