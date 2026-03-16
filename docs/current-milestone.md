# Current Milestone

## Current Project State
The project has completed **Milestone 1: Playable Mobile Vertical Slice**.
Chamber 01 remains the playable in-browser vertical-slice foundation with Phaser 3 + Vite, concept-art-backed rendering, and a working player/enemy loop.

## What Is Currently Working
- Boot/start flow transitions into Chamber 01 and supports death/restart.
- Core player loop works: movement, jump, attack, damage, death.
- Skitter Servitor encounter loop is active and killable.
- Chamber 01 collision/platform traversal is stable.
- Mobile controls layout is corrected for both portrait and landscape playability while staying screen-space anchored.
- Chamber 01 first lore beat now uses a dedicated cinematic lore-screen flow.
- The Laughing Engine / furnace art is now used as the first lore-screen prototype image.
- The visible lore trigger marker in Chamber 01 is now an in-world ritual shrine/ossuary-style prop (replacing debug-style presentation).
- Centralized asset key/URL mapping is in place.
- Texture-first rendering works with fallback visuals when textures fail.
- Vite/GitHub Pages deployment model is configured (`/biomech-retro-horror/` production base).
- Desktop keyboard controls remain available.

## Milestone 1 Closeout Status
Milestone 1 signoff blockers have been addressed in shipped implementation:
- Portrait and landscape touch-control usability has been corrected.
- Chamber 01 lore delivery has moved from basic trigger pause behavior to a dedicated first cinematic lore-screen beat.
- Lore triggering now reads as in-world ritual interaction (shrine/ossuary prop) rather than a debug marker.

## Milestone 1 Acceptance Criteria (Completed)
Milestone 1 is complete with the following criteria met:
1. Chamber 01 remains playable end-to-end in browser (start → combat/lore → death/restart).
2. iPhone portrait mode has fully visible, usable touch controls (left/right/jump/attack/interact) in safe screen space.
3. Mobile controls are fixed to screen-space (no world/camera drift) and hit areas align with visible buttons.
4. Portrait gameplay view is meaningfully readable (not reduced to a tiny window).
5. Desktop keyboard support remains intact.
6. Player/enemy visuals appear grounded to the floor (not visually sunk).
7. Texture-first rendering and fallback behavior remain correct.
8. GitHub Pages/Vite base-path behavior remains correct.
9. Chamber 01 first lore beat uses a dedicated cinematic lore-screen pattern with the Laughing Engine/furnace artwork prototype.
10. Chamber 01 lore trigger presentation is an in-world ritual shrine/ossuary-style prop rather than a debug-style label.
11. `npm run build` succeeds.

## Exact Next Best Implementation Step
Begin **Milestone 2 visual production hardening for Chamber 01**: normalize the current playable art set (player, enemy, chamber, shrine/lore affordances, and UI readability surfaces) toward the locked palette + silhouette doctrine while preserving current Milestone 1 behavior and input/deployment invariants.

## Do Not Change Casually
- Base-path deployment contract (`/biomech-retro-horror/` prod, `/` dev).
- Mobile/desktop input parity and screen-space anchoring rules.
- Asset key/url indirection and fallback-only resilience behavior.
- Chamber 01 scene flow and combat timing contracts unless intentionally retuned.
- Portrait layout constants once validated on iPhone-sized viewports.
