# Current Milestone

## Current Project State
The project has completed **Milestone 3: Encounter Expansion + Combat Readability**.
The shipped playable slice now covers Chamber 01 and Chamber 02 with stabilized encounter flow, a refined Chamber 01 miniboss payoff, Chamber 02 toll-keeper gate progression, cinematic lore beats, and maintained mobile/desktop usability.

## What Is Currently Working
- Boot/title flow reliably enters the current Chamber 01 -> Chamber 02 vertical slice.
- Core player loop works: movement, jump, attack, damage, death, and full restart/reset.
- Chamber 01 baseline encounter remains stable and readable.
- Chamber 01 lore shrine still unlocks the chamber gate flow without regressing the original lore-screen cadence.
- Chamber 01 dead-god witness beat still triggers the Half-Skull Ascendant miniboss.
- Chamber 01 miniboss telegraphing, contact danger, defeat payoff, and gate release remain active in the shipped flow.
- Chamber 01 -> Chamber 02 transition remains stable.
- Chamber 02 enemy encounters remain active with conservative wake timing and readable spacing.
- Chamber 02 TOLL-KEEPER encounter pair gates the chamber exit and now has clearer end-gate readiness feedback.
- Chamber 02 central lore trigger still uses a dedicated cinematic cutscene flow and now retains a clear diegetic shrine/ossuary affordance at the trigger site.
- Chamber 02 exit gate unlock + lore trigger flow remains intact after the TOLL-KEEPER fight.
- Mobile controls remain screen-space anchored and usable in portrait + landscape.
- Desktop keyboard controls remain available.
- Texture-first rendering with fallback-only resilience remains in place.
- Vite/GitHub Pages deployment model is still configured (`/biomech-retro-horror/` production base).

## Milestone 3 Closeout Status
Milestone 3 is now considered **complete** for the currently shipped Chamber 01 + Chamber 02 slice.

### Milestone 3 Closeout Rationale
- Regular enemy encounter readability/pacing work is present in the shipped skitter + TOLL-KEEPER behavior.
- Chamber 01 includes the required miniboss refinement pass with telegraph, hurt feedback, defeat feedback, and payoff gating.
- Chamber 02 encounter sequencing now closes cleanly from enemy pressure -> TOLL-KEEPER gate unlock -> exit lore beat.
- Death/restart/reset remains functional across both active gameplay chambers and both lore-scene types.
- Portrait mobile playability and landscape usability remain preserved.
- `npm run build` succeeds.

## Milestone 3 Acceptance Criteria (Completed)
1. At least one regular enemy depth/readability pass is shipped.
2. One miniboss refinement pass is shipped in Chamber 01.
3. Chamber 01 -> Chamber 02 progression remains stable.
4. Chamber 02 encounter flow, including TOLL-KEEPER gating, remains playable end-to-end.
5. Exit-gate unlock + lore trigger flow is readable and stable.
6. Death/restart/reset still works without soft-locking scene flow.
7. Portrait mobile playability remains intact.
8. Landscape usability remains intact.
9. `npm run build` succeeds.

## Known Remaining Rough Edges (Non-Blocking)
- Chamber 02 still ends on an exit-gate lore payoff rather than entering a playable Chamber 03, which is acceptable because new chambers remain out of scope for this milestone.
- Combat presentation is still intentionally lightweight and relies on conservative shape/tint feedback rather than a full animation/audio production pass.
- Audio identity work remains a later milestone and is not required for Milestone 3 completion.

## Next Milestone Definition
**Milestone 4: Audio Identity Pass** is the next implementation milestone.

### Core Goal
Add oppressive chamber, encounter, and lore-transition audio treatment without destabilizing the now-complete Milestone 3 playable slice.

## Do Not Change Casually
- Base-path deployment contract (`/biomech-retro-horror/` prod, `/` dev).
- Mobile/desktop input parity and screen-space anchoring rules.
- Asset key/url indirection and fallback-only resilience behavior.
- Chamber 01 and Chamber 02 scene-flow contracts unless intentionally retuned.
- Lore-screen readability constraints in portrait iPhone-sized viewports.
