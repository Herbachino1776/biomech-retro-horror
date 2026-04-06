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
- Do not regress authored chambers back toward early prototype layout assumptions (notably Sector 3 Chamber 1).

## Boss Pit / Run-State Invariants
- Boss pit completion state is run-scoped and must reset on death/fresh run.
- Boss pit reward-granted state is run-scoped and must reset on death/fresh run.
- Boss pit reward grants must be idempotent per run (no duplicate grants within a single run).
- Boss/miniboss/pit-boss death/payoff treatment must preserve modern full doctrine:
  - zoom
  - shake
  - elongated ceremonial finish
  - stronger gore payoff
  - escalated remains

## Scene Flow Invariants
- Sector 1 and Sector 2 chamber chains must remain playable end-to-end.
- Sector 3 Chamber 1 (`Sector03Chamber01Scene`) must remain registered/playable and aligned with later authored-chamber quality baseline.
- Sector 3 Chamber 3 built content must remain stable while consistency/polish work proceeds.
- Scene registration + transition wiring are first checks for any chamber boot/handoff failure.

## Milestone Direction Invariant
- Active content build lane is Milestone 9 (Sector 4 Chamber 1), with Sector 4 Chamber 2 shell/buildout as secondary support.
- Milestone 8 remains established active-support for Sector 3 consistency/polish shaping.
- BRUTALITY MODE is promoted as a next-active combat/chamber-authoring lane and should inform near-term encounter pacing doctrine.
- Preserve separate sequencing for enemy-class unification and boss-package retrofit; do not flatten milestone lanes during routine passes.
