# Current Milestone

## Current Project State
The project has completed **Milestone 4: Audio Identity Pass**.
The shipped playable slice remains Chamber 01 and Chamber 02, now with stabilized encounter flow, refined Chamber 01 miniboss payoff, Chamber 02 toll-keeper gate progression, cinematic lore beats, integrated ambient/audio cue coverage, and maintained mobile/desktop usability.

## What Is Currently Working
- Boot/title flow reliably enters the current Chamber 01 -> Chamber 02 vertical slice.
- Core player loop works: movement, jump, attack, damage, death, footsteps, and full restart/reset.
- Chamber 01 baseline encounter remains stable and readable.
- Chamber 01 lore shrine still unlocks the chamber gate flow without regressing the original lore-screen cadence.
- Chamber 01 dead-god witness beat still triggers the Half-Skull Ascendant miniboss.
- Chamber 01 miniboss telegraphing, contact danger, defeat payoff, banishment cue, and gate release remain active in the shipped flow.
- Chamber 01 -> Chamber 02 transition remains stable.
- Chamber 02 enemy encounters remain active with conservative wake timing and readable spacing.
- Chamber 02 TOLL-KEEPER encounter pair gates the chamber exit and now has clearer end-gate readiness feedback.
- Chamber 02 central lore trigger still uses a dedicated cinematic cutscene flow and now retains a clear diegetic shrine/ossuary affordance at the trigger site.
- Chamber 02 exit gate unlock + lore trigger flow remains intact after the TOLL-KEEPER fight.
- Chamber 01 and Chamber 02 ambience are integrated in the shipped flow.
- Player combat/death feedback, skitter, TOLL-KEEPER, miniboss, lore/gate, and banishment audio cues are present in the shipped slice.
- Mobile controls remain screen-space anchored and usable in portrait + landscape.
- Desktop keyboard controls remain available.
- Texture-first rendering with fallback-only resilience remains in place.
- Vite/GitHub Pages deployment model is still configured (`/biomech-retro-horror/` production base).

## Milestone 4 Closeout Status
Milestone 4 is now considered **complete / closed out** for the currently shipped Chamber 01 + Chamber 02 slice.

### Milestone 4 Closeout Rationale
- Chamber 01 and Chamber 02 both ship with integrated ambient loops.
- Player footsteps, attack/hurt/death feedback, enemy combat/death cues, miniboss cues, lore transition cues, gate cues, and banishment sting are wired into the shipped flow.
- Audio treatment remains aligned to the existing Chamber 01 + Chamber 02 vertical slice rather than forcing new content scope.
- The recent audio QA/polish pass has already been folded into the current shipped baseline.
- Mobile/desktop usability and deployment invariants remain preserved.

## Milestone 4 Acceptance Criteria (Completed)
1. Functional chamber ambience is shipped for the active playable slice.
2. Combat feedback SFX are shipped for player, skitter, TOLL-KEEPER, and miniboss encounters.
3. Lore transition, gate, and banishment cues are shipped in the active flow.
4. Chamber 01 -> Chamber 02 progression remains stable.
5. Death/restart/reset still works without soft-locking scene flow.
6. Portrait mobile playability remains intact.
7. Landscape usability remains intact.

## Known Remaining Rough Edges (Non-Blocking)
- Chamber 02 still ends on an exit-gate lore payoff rather than entering a playable Chamber 03, which is acceptable because new chambers remain out of scope for the shipped slice.
- Combat presentation remains intentionally restrained and should only expand when content work needs it.
- Future milestone work should add new playable content without destabilizing the shipped Chamber 01 + Chamber 02 baseline.

## Next Milestone Definition
**Milestone 5: Content Expansion** is the active implementation milestone.

### Core Goal
Extend the shipped Chamber 01 + Chamber 02 baseline into the next playable content step while preserving the now-complete audio-integrated slice.

### Immediate Milestone 5 Direction
- Chamber 03 is the next major content target under Milestone 5.
- Chamber 03 planning remains anchored to the **Ossuary Choir Hall** sector-finale vision.
- Chamber 03 should be delivered in chunked implementation slices, not one giant pass.

## Do Not Change Casually
- Base-path deployment contract (`/biomech-retro-horror/` prod, `/` dev).
- Mobile/desktop input parity and screen-space anchoring rules.
- Asset key/url indirection and fallback-only resilience behavior.
- Chamber 01 and Chamber 02 scene-flow contracts unless intentionally retuned.
- Lore-screen readability constraints in portrait iPhone-sized viewports.
