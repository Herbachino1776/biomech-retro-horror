# Technical Invariants

Short source-of-truth checklist. Do not casually break these.

## Deployment / Build
- [ ] Vite production base path remains `/biomech-retro-horror/`.
- [ ] Dev base remains `/` for local workflow.
- [ ] Every meaningful task ends with a build verification (`npm run build`).

## Input / Platform Support
- [ ] Mobile touch controls remain iPhone-usable and fixed to screen space (not world space).
- [ ] Mobile controls re-layout correctly on viewport resize/orientation changes.
- [ ] Desktop keyboard support remains available for movement, attack, interact, and restart.

## Rendering / Asset Safety
- [ ] Asset keys + URL mapping stay centralized.
- [ ] Loaded textures are primary visual path.
- [ ] Fallback shapes remain resilience-only when textures are missing/fail.

## Gameplay Stability
- [ ] Scene flow remains stable (boot/start → chamber → death/restart).
- [ ] Core combat timing contracts are not changed without explicit retuning.

## Lore Presentation Invariants
- [ ] Lore moments are implemented as **discrete scene/state transitions**, not only ordinary HUD overlays.
- [ ] Lore flow supports fade-to-black and fade-in presentation.
- [ ] Lore screens support slow pan/zoom drift where appropriate.
- [ ] Lore screens support dedicated music/sound treatment distinct from gameplay ambience.
- [ ] Lore writing remains cryptic, area-specific, and foreshadowing-oriented.

## Change-Type Discipline
- [ ] Prefer text-only/code-only changes unless binary edits are explicitly required.
- [ ] If a regression appears, diagnose/fix root cause instead of reimplementing blindly.
