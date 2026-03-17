# Technical Invariants

Do-not-break checklist for milestone and deployment stability.

## Deployment / Build Invariants
- Production base path remains `/biomech-retro-horror/`.
- Local development base remains `/`.
- Every meaningful task ends with `npm run build` verification.

## Input / Platform Invariants
- Mobile touch controls remain visible and usable on iPhone portrait layouts.
- Mobile controls are screen-space anchored and must not drift with world/camera movement.
- Mobile control visuals and hit areas remain aligned.
- Mobile layout remains playable in both portrait and landscape orientations.
- Desktop keyboard support remains intact (move/jump/attack/interact/restart).

## Rendering / Asset Invariants
- Asset key + URL mapping stays centralized.
- Loaded textures remain primary rendering path.
- Fallback visuals are resilience-only when texture load fails.
- Do not silently invert fallback-vs-art priority.

## Gameplay Stability Invariants
- Chamber 01 playable loop remains stable.
- Scene flow contract remains stable: start/boot → chamber → death/restart.
- Combat timing contracts are not changed casually.
- Floor grounding adjustments must preserve collision behavior.

## Lore Presentation Invariants
- Lore moments should use **discrete scene/state transitions**.
- Lore flow should support fade-to-black then fade-in cadence.
- Lore screens should support subtle pan/zoom drift.
- Lore screens should support distinct music/sound treatment from active gameplay.
- Chamber 01 first lore beat pattern (Laughing Engine/furnace art prototype) remains stable; Chamber 02 now uses the reusable `LoreCutsceneScene` + `LORE_CUTSCENES` path.
- New chamber lore beats should reuse that cutscene system by changing config/art/text/style values only.
- Lore writing remains cryptic, area-specific, and foreshadowing-oriented.

## Lore Trigger Invariants
- Lore trigger affordances should remain diegetic in-world ritual/shrine forms.
- Avoid reverting visible trigger presentation to debug-style “LORE” marker boxes.

## Change-Type Discipline
- Prefer text/code changes unless binary changes are explicitly required.
- Treat regressions as issues to diagnose/fix, not blindly reimplement.
