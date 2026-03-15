# Current Milestone

## Current Project State
The project is in a **playable Milestone 1→2 transition state**: a browser-playable Chamber 01 slice with graybox gameplay logic and concept-art-assisted presentation.

### Currently Working
- Phaser 3 + Vite runtime boots into a title/start scene and transitions into Chamber 01.
- Core player loop works: move, jump, attack, take damage, die, restart.
- One active enemy loop works in-room (Skitter Servitor patrol/aggro/contact damage).
- Lore trigger flow works via a pause-style panel system with resume input.
- HUD and dialogue can render with diegetic UI frame assets when available, and rectangle fallback when not.
- Mobile touch controls exist and are screen-space anchored; desktop keyboard controls also work.
- Concept art is loaded through centralized asset keys/URLs; gameplay remains playable with fallback primitives.
- Vite production base-path behavior is configured for GitHub Pages project-site deployment.

### Incomplete / Recently Regressed Risk Areas
- Sentinel and Laughing Engine are currently presentation/set-dressing only, not complete encounter logic.
- Chamber progression systems are still partial (sealed gate presentation exists, full progression flow is not complete).
- Lore delivery is currently mostly dialogue-panel based and needs a stronger cinematic presentation layer.
- Concept art palette consistency is uneven across sources, causing visual drift if not normalized.

## Active Milestone Definition (Concrete Acceptance Criteria)
For the current vertical slice pass, treat the milestone as complete only when all are true:
1. Start scene, chamber transition, and restart loop are stable in browser builds.
2. Chamber 01 remains fully traversable with reliable collisions and camera follow.
3. Player combat loop remains readable and deterministic (attack cooldown, hit detection, damage, death).
4. At least one enemy encounter remains functional and balanced for tension over chaos.
5. Mobile touch controls remain usable on iPhone-sized viewports without camera-space drift.
6. Desktop keyboard support remains intact for movement, attack, interact, and restart.
7. Build output works under GitHub Pages base path (`/biomech-retro-horror/`).
8. Art/fallback behavior remains safe: fallback shapes are backup, not default replacement when textures load.
9. Lore beats preserve oppressive pacing and begin evolving into **discrete cinematic lore screens** rather than only in-world overlay text.

## Do Not Change Casually
- Input mappings and control affordances (mobile + desktop parity).
- Scene flow contract (BootScene → Chamber01Scene → restart).
- Base-path deployment assumptions for GitHub Pages.
- Asset key/url indirection and fallback safety logic.
- Current readability-first collision/combat tuning constants.

## Lore Presentation Trajectory
Lore should remain cryptic, area-specific, and deliberately vague, often foreshadowing immediate danger or task intent. Presentation should evolve from basic overlay text toward **discrete cutscene-like lore screens** with stronger ritual/cinematic identity.
