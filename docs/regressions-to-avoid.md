# Regressions to Avoid

Known failure patterns from project trajectory and current safeguards.

## Gameplay / Flow
- **Broken restart loop after death**: if restart input handling drifts, the slice can soft-lock at failure state.
  - Do not break death-state input polling and scene restart behavior.
- **Hit registration drift**: attack overlap and enemy overlap contracts are tightly scoped.
  - Do not alter attack hitbox enable/disable timing without retuning.

## Controls
- **Mobile controls drifting with camera/world**: this makes touch play unusable.
  - Keep touch UI fixed in screen space and re-layout on resize.
- **Desktop input parity loss**: mobile-focused edits can accidentally drop keyboard behavior.
  - Preserve arrows + jump + attack + interact + restart support.

## Asset Loading / Fallback
- **Texture-first rendering accidentally removed**: fallback shapes becoming always-on causes visual downgrade.
  - Fallback visuals are safety only; concept/runtime textures should be primary when present.
- **Hardcoded asset path edits**: direct scene imports can desync from asset key mapping.
  - Keep centralized asset key/url mapping intact.

## GitHub Pages Deployment
- **Wrong Vite base path**: deployment works locally but fails on GitHub Pages subpath.
  - Do not regress production base path `/biomech-retro-horror/`.

## Visual / Presentation
- **Palette inconsistency amplification**: mixed concept hues can fragment the vertical-slice identity.
  - Normalize future assets toward the locked palette doctrine, do not widen it casually.
- **Fallback aesthetic becoming default art direction**: emergency placeholders can overwhelm intended look.
  - Preserve fallback readability, but keep it secondary to loaded art.

## Lore Presentation
- **Lore reduced to generic HUD/dialog UI only**: weakens identity and pacing.
  - Maintain movement toward discrete cinematic lore screens with transition grammar.
- **Over-explained lore text**: removes dread and foreshadowing.
  - Keep lore cryptic, area-specific, deliberately vague, and task/danger-foreshadowing.
