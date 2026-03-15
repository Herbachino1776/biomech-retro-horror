# Decisions

Concise source of decisions already in force.

## Engine / Runtime
- Use **Phaser 3** with modular ES modules; avoid unnecessary framework expansion.
- Use **Vite** for local dev/build; keep browser-first playability as default.

## Deployment
- Deploy as a GitHub Pages **project site**, not root site.
- Vite production build must use base path: `/biomech-retro-horror/`.
- Local dev base remains `/`.

## Controls / Input
- Maintain dual input support: desktop keyboard + mobile touch.
- Mobile controls are fixed in screen space (`scrollFactor(0)`), never world-anchored.
- Mobile interaction control is context-switched (gameplay vs dialogue/death).

## Art Loading / Fallback
- Assets are referenced through centralized keys and URL mapping, not hardcoded scene paths.
- Concept art can be used as temporary runtime imagery via crop/display config.
- Fallback primitives (rectangles/shapes) exist for resilience and should only dominate when texture loading fails.

## Gameplay / Scope
- Vertical-slice-first delivery remains mandatory; no speculative systems beyond milestone needs.
- Readability and oppressive pacing take precedence over content volume.
- Keep render/presentation concerns separate from gameplay logic.

## Workflow Constraints
- Read AGENTS and docs before meaningful implementation changes.
- Keep changes scoped, modular, and reviewable.
- Prefer text/code changes unless binary edits are explicitly required.
- End meaningful tasks with a build verification step.

## Lore Presentation
- Lore delivery direction is **discrete cutscene-like screens/states**, not ordinary in-world text overlays alone.
- Lore text tone should stay cryptic, area-specific, and foreshadow immediate threat/objective.
