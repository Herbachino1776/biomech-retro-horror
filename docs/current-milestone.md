# Current Milestone

## Current Project State
- **Milestone 5 (Sector 1 Content Expansion) is closed** in first-pass terms.
- **Milestone 6 (Bucket 2 / Sector 2: The Black Aqueduct) has progressed far beyond foothold status**.
- Sector 2 now has a playable Chamber 1 -> Chamber 2 -> Chamber 3 arc, with a real chamber boss payoff in Chamber 3.

## What Is Working in the Current Build
- Sector 1 progression is live: Chamber 01 -> Chamber 02 -> Chamber 03 -> separate boss arena finale.
- Sector 2 progression is live: Black Aqueduct Intake -> Compression Vaults -> Kiln of Judgement.
- Sector 2 boss/completion contract is live in Chamber 3 through The Sorrow Engine flow.
- Sector 2 lore cutscene usage is live across the arc and tied into chamber progression gates.
- Projectile combat tech is live and reusable (enemy projectile spawn/update/hit contract runs in Sector 2).
- Black Oil / Tar-laced Blood kill-payoff language is implemented and used in Sector 2 combat outcomes.

## Active Focus (Explicit)
**Active focus is Sector 2 stabilization/polish wrap + documentation hardening (not a new foothold build).**

Rationale:
- Sector 2 now exists as a full prototype arc, so the highest leverage work is consistency, regression prevention, and cleanup.
- The current risk is not missing core rooms; it is re-breaking hard-won contracts (handoffs, viewport behavior, projectile damage contract, shared enemy grounding).
- Sector 3 planning can run in parallel at pre-production level, but should not displace current stabilization.

## Immediate Priorities
1. Preserve stable chamber-to-chamber handoff behavior in Sector 2.
2. Preserve mobile threshold interaction contract (fresh post-entry interact required).
3. Preserve lore scene viewport integrity (no chamber overlay leakage).
4. Preserve projectile gameplay contract (visual projectile must still hurt correctly).
5. Avoid chamber-local patches for shared enemy presentation regressions.
6. Keep docs synchronized to actual build behavior so fresh sessions start from reality.

## Do Not Change Casually
- Base-path deployment contract (`/biomech-retro-horror/` in production, `/` in local dev).
- Mobile controls and desktop keyboard parity.
- Scene registration and handoff wiring between Sector 2 chambers.
- Lore cutscene scene isolation from chamber viewport matte/blackout layers.
- Shared enemy presentation logic without cross-chamber verification.

## Planned Future Sidequest Lane
- A dedicated combat sidequest roadmap is now documented in `docs/combat-sidequest-roadmap.md`.
- This roadmap is a planned future lane and **not** a statement that all listed systems are active now.
- Current active milestone focus remains Sector 2 stabilization/polish wrap + docs parity.
