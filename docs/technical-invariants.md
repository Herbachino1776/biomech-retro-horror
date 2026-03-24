# Technical Invariants

Do-not-break checklist for current stability.

## Deployment / Build Invariants
- Production base path remains `/biomech-retro-horror/`.
- Local development base remains `/`.
- Meaningful code tasks end with `npm run build` verification.

## Input / Platform Invariants
- Mobile touch controls remain visible/usable on iPhone-sized browsers.
- Controls remain screen-space anchored (`scrollFactor(0)` behavior preserved).
- Control visuals and hit areas stay aligned.
- Portrait and landscape remain playable.
- Desktop keyboard support remains intact.

## Viewport / Layout Invariants
- Chamber 3 responsive viewport/bootstrap pattern is the known-good reference for mobile layout stability.
- New chamber viewport/bootstrap fixes should follow the Chamber 3 proven pattern unless a stronger tested pattern replaces it.

## Progression / Threshold Invariants
- Threshold progression requires intentional **fresh interact press after entry**.
- Pre-held interact state must not auto-advance progression.

## Lore Scene Invariants
- Lore remains a discrete scene transition pattern (`LoreScreenScene` / `LoreCutsceneScene`).
- Lore scenes must not inherit chamber viewport blackout/matte/overlay layers.
- If lore blackout shape mirrors gameplay viewport, treat as chamber overlay leakage until disproven.

## Rendering / Asset Invariants
- Asset key + URL mapping remains centralized.
- Loaded textures remain primary visual path.
- Fallback primitives are resilience-only when texture loading fails.

## Combat / Entity Invariants
- Projectile tech preserves full gameplay contract: active body, overlap, damage, and cleanup.
- Shared enemy presentation logic must remain stable across chambers.
- Grounding regressions should be fixed in shared presentation paths when that is the root source, not chamber-by-chamber.

## Scene Flow Invariants
- Sector 1 and Sector 2 chamber chains must remain playable end-to-end.
- Scene registration + transition wiring are first checks for any chamber boot/handoff failure.
