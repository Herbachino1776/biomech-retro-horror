# Session Handoff (Planning Reset)

## Project Identity & Vision
Biomech Retro Horror is a browser-playable **biomechanical ritual horror** vertical slice: oppressive pacing, strong silhouette readability, diegetic UI, and cryptic environmental lore. Scope is vertical-slice-first (one polished chamber loop), not feature expansion. Tone stays ceremonial, alien, industrial-organic, and restrained. Avoid generic cyberpunk/fantasy/zombie drift.

## Tech Stack & Deployment Model
- Engine/runtime: **Phaser 3** (modular ES modules) + **Vite**.
- Target platform: browser-first, with iPhone-sized touch usability and desktop keyboard parity.
- Deployment: GitHub Pages project site; production base path must remain `/biomech-retro-horror/` (dev base `/`).
- Asset loading: centralized key→URL mapping; loaded textures are primary, fallback shapes are resilience-only.

## Current Milestone & Acceptance Criteria
Current state is a Milestone 1→2 transition with a playable Chamber 01 slice. Treat the pass as complete only when these remain true:
1. Stable start → chamber → death/restart loop.
2. Chamber 01 traversable with reliable collision/camera.
3. Deterministic player combat loop (cooldown/hit/damage/death).
4. At least one enemy encounter functional and tension-balanced.
5. Mobile touch controls remain iPhone-usable and screen-space anchored.
6. Desktop keyboard movement/attack/interact/restart remains intact.
7. Build works under `/biomech-retro-horror/` base path.
8. Texture-first visuals preserved; fallback shapes do not become default.
9. Lore presentation continues moving toward **discrete cinematic lore screens**.

## What Is Working Now
- Runtime boots and transitions into Chamber 01.
- Core player loop works: move/jump/attack/take damage/die/restart.
- Skitter Servitor encounter loop is active.
- Lore trigger flow exists via pause-style panel.
- HUD/dialog can use diegetic frame assets with fallback resilience.
- Mobile touch controls exist; desktop keyboard controls also exist.
- Centralized asset mapping and GitHub Pages base-path configuration are in place.

## What Still Needs Work Now
- Husk Sentinel and Laughing Engine are not complete encounter logic yet (mostly presentation/set-dressing).
- Chamber progression is partial (seal/gate presentation exists; full progression logic incomplete).
- Lore delivery needs stronger discrete cinematic state treatment beyond panel-only flow.
- Art consistency across concept sources still needs normalization to the locked palette/readability doctrine.

## Art Doctrine & Palette Discipline (Locked)
- Visual identity: biomechanical ritual horror, oppressive and readable.
- Palette discipline: mostly bone/ivory, rust/dried-blood metal, oil-black/charcoal, bruised brown-purple neutrals; sickly green only as restrained accent.
- Readability hierarchy: silhouette first, texture second, detail third.
- UI must feel diegetic (grown/forged/ribbed), not flat modern chrome.
- Do not broaden style language to patch gaps; normalize assets into the lock.

## Mobile Control Doctrine
- Keep touch controls fixed to screen space (`scrollFactor(0)`), never world-anchored.
- Maintain responsive re-layout on resize/orientation changes.
- Preserve context-switched interaction behavior (gameplay vs dialogue/death states).
- Any input change must preserve desktop parity.

## Lore Presentation Doctrine
- Lore is a major identity pillar and should be **discrete cinematic transitions**, not only generic HUD overlays.
- Support fade-to-black/fade-in rhythm, slow pan/zoom drift where appropriate, and distinct lore audio treatment.
- Writing remains cryptic, area-specific, and danger/task-foreshadowing.

## Technical Invariants (Do Not Break)
- Vite base-path contract (`/biomech-retro-horror/` prod, `/` dev).
- Stable scene flow contract (boot/start → chamber → death/restart).
- Input parity and mobile screen-space anchoring.
- Centralized asset key/URL mapping.
- Texture-first rendering with fallback-only resilience path.
- Core combat timing contracts unless explicitly retuned.
- End meaningful tasks with `npm run build` verification.

## Major Regressions Already Encountered
- Broken restart loop soft-lock risk.
- Hit registration drift when attack overlap timing changes.
- Mobile controls drifting with camera/world.
- Desktop keyboard parity loss during mobile-focused edits.
- Fallback visuals accidentally becoming default path.
- Hardcoded asset paths bypassing centralized mapping.
- GitHub Pages failures from wrong Vite base path.
- Lore regressing into generic overlay-only UI and over-explained text.

## Exact Recommended Next Step
Implement the **first discrete cinematic lore screen state transition** for Chamber 01’s existing lore beat (fade out gameplay → lore scene/state with cryptic text and subtle drift → return to chamber), while preserving all current input parity, base-path behavior, and texture/fallback invariants.
