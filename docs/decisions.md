# Decisions

Concise record of technical/design decisions currently in force.

## Engine + Runtime
- Phaser 3 + ES modules is the game runtime baseline.
- Vite is the dev/build toolchain.
- Browser play is the primary target (mobile-first without dropping desktop keyboard).

## Deployment
- Deploy as GitHub Pages **project site**.
- Vite production base path stays `/biomech-retro-horror/`.
- Local dev base path stays `/`.
- Scene/asset paths must remain base-path-safe (no ad-hoc absolute URL regressions).

## Controls + Input
- Maintain dual input: mobile touch + desktop keyboard.
- Mobile controls are always fixed to screen space (`scrollFactor(0)`), never world-space.
- Portrait layout may reserve a lower control band to keep touch UI visible/reliable.
- Mobile interact button can context-switch for dialogue/death confirm flows.

## Asset Loading + Fallback
- Use centralized asset keys and URL mapping.
- Loaded textures/concept assets are the primary visual path.
- Fallback primitives are resilience-only when textures fail/miss.
- Do not let fallback presentation silently become the default art path.

## Gameplay Scope + Milestone Flow
- Vertical-slice-first development is mandatory.
- Prefer small reliable fixes over architecture expansion.
- Regressions must be diagnosed/fixed at root cause, not “reimplemented differently” without reason.

## Lore Presentation Direction
- Lore is a core identity system, not optional garnish.
- Presentation direction is toward **discrete cinematic ritual/cutscene-style screens**.
- Avoid generic always-on in-world overlay/dialogue as the long-term primary lore format.
- Lore writing remains cryptic, symbolic, and area-specific.

## Workflow Constraints
- Before touching gameplay/controls/deployment/asset loading/UI/art/lore, read the doctrine docs.
- Prefer text/code changes unless binary edits are explicitly required.
- End meaningful tasks with build verification (`npm run build`).
