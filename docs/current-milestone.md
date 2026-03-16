# Current Milestone

## Current Project State
The project is in **Milestone 1: Playable Mobile Vertical Slice hardening**.
Chamber 01 is playable in-browser with Phaser 3 + Vite, concept-art-backed rendering, and a working player/enemy loop. This pass focuses on mobile portrait stability/readability and durable project doctrine.

## What Is Currently Working
- Boot/start flow transitions into Chamber 01 and supports death/restart.
- Core player loop works: movement, jump, attack, damage, death.
- Skitter Servitor encounter loop is active and killable.
- Chamber 01 collision/platform traversal is stable.
- Dialogue/lore trigger exists and can pause/resume play.
- Centralized asset key/URL mapping is in place.
- Texture-first rendering works with fallback visuals when textures fail.
- Vite/GitHub Pages deployment model is configured (`/biomech-retro-horror/` production base).
- Desktop keyboard controls remain available.

## Remaining Milestone 1 Final-Polish Items
- Keep portrait controls stable/visible while preserving current readability wins.
- Finalize slight player/enemy floor-grounding offset without collision regression.
- Confirm chamber scale still feels monumental on portrait viewports (no cramped-room regression).

## Active Milestone Definition (Acceptance Criteria)
Milestone 1 is signoff-ready only when all are true:
1. Chamber 01 remains playable end-to-end in browser (start → combat/lore → death/restart).
2. iPhone portrait mode has fully visible, usable touch controls (left/right/jump/attack/interact) in safe screen space.
3. Mobile controls are fixed to screen-space (no world/camera drift) and hit areas align with visible buttons.
4. Portrait gameplay view is meaningfully readable (not reduced to a tiny window).
5. Desktop keyboard support remains intact.
6. Player/enemy visuals appear grounded to the floor (not visually sunk).
7. Texture-first rendering and fallback behavior remain correct.
8. GitHub Pages/Vite base-path behavior remains correct.
9. `npm run build` succeeds.

## Do Not Change Casually
- Base-path deployment contract (`/biomech-retro-horror/` prod, `/` dev).
- Mobile/desktop input parity and screen-space anchoring rules.
- Asset key/url indirection and fallback-only resilience behavior.
- Chamber 01 scene flow and combat timing contracts unless intentionally retuned.
- Portrait layout constants once validated on iPhone-sized viewports.
