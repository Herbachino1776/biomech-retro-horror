# Current Milestone

## Current Project State
The project has completed **Milestone 2: Slice Art Cohesion + Lore Pattern Consolidation**.
The playable baseline now spans Chamber 01 and Chamber 02 with a stable chamber transition, cinematic lore-screen beats in both chambers, and a conservative Chamber 02 post-lore reaction state.

## What Is Currently Working
- Boot/start flow transitions into Chamber 01 and supports death/restart.
- Core player loop works: movement, jump, attack, damage, death.
- Chamber 01 remains stable and playable with lore shrine interaction.
- Chamber 01 -> Chamber 02 transition is live and stable.
- Chamber 02 is playable with platform traversal and enemy pressure pacing.
- Chamber 02 lore trigger uses in-world shrine/ossuary presentation.
- Chamber 02 lore screen uses the Vertebral Horn Gate image with portrait-safe composition (no vertical flattening) while preserving landscape usability.
- Chamber 02 lore beat runs through a reusable lore-cutscene system (`LoreCutsceneScene` + config), so future chambers can plug in by swapping art/text/config only.
- Lore presentation remains dedicated cinematic ritual screens rather than generic dialogue overlays.
- Chamber 02 applies a conservative post-lore reaction state: ambient ritual shift + gate/sanctum visual change + one ritual-aligned enemy wake/activation.
- Mobile controls remain screen-space anchored and usable in portrait + landscape.
- Desktop keyboard controls remain available.
- Texture-first rendering with fallback-only resilience remains in place.
- Vite/GitHub Pages deployment model is configured (`/biomech-retro-horror/` production base).

## Milestone 2 Closeout Status
Milestone 2 is now considered **fully closed** for the shipped Chamber 01 + Chamber 02 slice.
Stabilization pass notes:
- Chamber 01/Chamber 02 flow and death/restart handoff remain intact.
- Chamber 02 lore cutscene and post-lore reaction state remain active and readable.
- Portrait + landscape control layout behavior remains in the mobile-safe path.
- Leftover mobile debug overlay text has been removed from runtime UI.

Milestone 2 signoff blockers are addressed in shipped implementation:
- Chamber 02 lore-screen portrait presentation no longer collapses into a thin/squashed strip.
- Chamber 02 post-lore reaction state now clearly changes chamber state and increases threat conservatively.
- Lore-screen pattern is now safely reusable with per-screen layout overrides while preserving Chamber 01 behavior.

## Milestone 2 Acceptance Criteria (Completed)
1. Playable slice remains stable across Chamber 01 and Chamber 02.
2. Chamber 01 behavior and lore-screen flow remain intact.
3. Chamber 01 -> Chamber 02 transition remains stable.
4. Chamber 02 lore screen is readable in portrait and landscape and uses correct art presentation.
5. Chamber 02 returns from lore in a visibly changed state.
6. Chamber 02 threat increases after lore without adding broad new systems.
7. Mobile/desktop input parity remains intact.
8. GitHub Pages/Vite base-path behavior remains correct.
9. `npm run build` succeeds.

## Milestone 3 Definition
**Milestone 3: Encounter Expansion + Combat Readability** is the next implementation milestone.

### Core Goal
Deepen encounter quality inside the existing vertical slice **without broad scope creep**. Milestone 3 is about making the shipped combat space read better, pace better, and feel more intentional rather than opening new content lanes.

### Relationship to Milestone 2
Milestone 2 established the shipped Chamber 01 + Chamber 02 slice, including chamber-to-chamber progression, lore/cutscene flow, and the baseline encounter space.
Milestone 3 builds on that baseline by improving **encounter depth and readability**, **not** by expanding into new chambers or replacing the current slice structure.

### Recommended Milestone 3 Scope
**Must-have**
- Better regular enemy telegraphing.
- Better regular enemy pacing and attack downtime.
- Clearer attack range and combat readability cues.
- Stronger hit/hurt feedback.
- One miniboss refinement pass.
- Limited combat visual productionization only where required to support readability.

**Nice-to-have only if it directly supports the must-have work**
- Small presentation assists that make enemy intent or impact states easier to read.
- Conservative cleanup of combat-facing visuals where fallback-looking placeholders still obscure encounter readability.

### Explicitly Out of Scope
- New chambers.
- Giant new systems.
- Full animation pipeline work.
- Broad audio overhaul.
- Puzzle expansion.
- Multiple new enemy families introduced at once.
- Major UI redesign.
- Major progression rewrite.

### Recommended Order Inside Milestone 3
1. **Regular enemy encounter depth pass.**
2. **Miniboss refinement pass.**
3. **Limited combat presentation support only where needed.**

### Hard Constraints / Invariants
- Preserve portrait mobile playability.
- Preserve desktop controls.
- Preserve current Chamber 01 + Chamber 02 progression.
- Preserve current lore/cutscene systems.
- Avoid broad redesigns that destabilize the shipped slice.

## Exact Next Best Implementation Step
Begin the **regular enemy encounter depth pass**: improve one existing regular threat loop with clearer telegraphing, better downtime/pacing, and stronger hit/hurt readability, without regressing mobile usability, current chamber progression, lore cadence, or deployment invariants.

## Do Not Change Casually
- Base-path deployment contract (`/biomech-retro-horror/` prod, `/` dev).
- Mobile/desktop input parity and screen-space anchoring rules.
- Asset key/url indirection and fallback-only resilience behavior.
- Chamber 01 and Chamber 02 scene-flow contracts unless intentionally retuned.
- Lore-screen readability constraints in portrait iPhone-sized viewports.
