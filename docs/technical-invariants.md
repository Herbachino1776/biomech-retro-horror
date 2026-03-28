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
- Shared major-encounter resolution flow must preserve freeze/unfreeze, lock, and completion semantics across chambers.

## Chamber Authoring / Encounter Tier Invariants
- New chambers should preserve authored structure: opening setpiece/lore -> corridor wall-module basic pockets -> opened-up room reveal -> elite/miniboss domain -> threshold/seal endcap.
- Basic enemy density should primarily live in corridor wall-module segments.
- Elite/miniboss/trap-altar reveal encounters should primarily live in opened-up room domains.
- Background segmentation and encounter tiering should stay coupled for readability.

## Boss Pit / Run-State Invariants
- Boss pit completion state is run-scoped and must reset on death/fresh run.
- Boss pit reward-granted state is run-scoped and must reset on death/fresh run.
- Boss pit reward grants must be idempotent per run (no duplicate grants within a single run).

## Scene Flow Invariants
- Sector 1 and Sector 2 chamber chains must remain playable end-to-end.
- Sector 3 Chamber 1 (`Sector03Chamber01Scene`) must remain registered/playable as current Milestone 8 backbone handoff.
- Scene registration + transition wiring are first checks for any chamber boot/handoff failure.

## Milestone Direction Invariant
- Active build lane remains Milestone 8 (Sector 3 buildout + boss-pit expansion).
- Do not casually derail active milestone direction with unrelated system expansion during routine passes.
