# Regressions to Avoid

Known failure patterns and what future tasks must protect.

## 1) GitHub Pages / Vite Base-Path Regressions
**Observed risk:** local works but project-site deploy breaks.  
- Keep production base `/biomech-retro-horror/` and dev base `/`.
- Avoid ad-hoc absolute URL paths.

## 2) Mobile Controls Visibility / Alignment Regressions
**Observed risk:** controls drift, clip, or desync from hit areas.  
- Keep controls screen-space anchored.
- Re-layout on resize/orientation changes.
- Preserve portrait + landscape usability.

## 3) Desktop Keyboard Parity Regressions
**Observed risk:** mobile-focused edits break keyboard flow.  
- Preserve keyboard move/jump/attack/interact/restart parity.

## 4) Chamber Handoff Contract Regressions
**Observed risk:** chamber seems “broken” when registration/handoff is the real fault.  
- Check scene registration first.
- Check threshold/transition target wiring second.
- For threshold progression issues, validate fresh-interact contract before content patching.

## 5) Fresh-Interact Threshold Regressions (Mobile + Desktop)
**Observed risk:** progression triggers immediately/incorrectly on stale button hold.  
- Threshold progression must require a **fresh post-entry interact press**.
- Do not accept pre-held interact input as valid progression intent.

## 6) Lore Screen Viewport Leak Regressions
**Observed risk:** viewport-shaped blackout appears in lore and gets misdiagnosed as art/layout failure.  
- Compare blackout shape to gameplay viewport first.
- Suspect chamber overlay/matte/viewport leakage before blaming lore assets.
- Remove inherited chamber blackout layers from lore scenes.

## 7) Projectile Contract Regressions
**Observed risk:** projectile looks correct but does not hurt player.  
- Audit basic gameplay contract first: overlap registration, damage call path, projectile active/body state, lifecycle cleanup.
- Do not jump straight to art/telegraph tuning when core hit contract is broken.

## 8) Enemy Grounding Regressions
**Observed risk:** enemy grounding drifts and gets patched room-by-room.  
- Verify whether regression source is shared enemy presentation logic before touching chamber-specific offsets.
- Fix shared path once; then validate all chambers.

## 9) Restart / Scene Flow Regressions
**Observed risk:** death/restart can soft-lock or leave stale state.  
- Preserve start -> chamber -> death/restart contract.
- Verify both keyboard and mobile restart paths.

## 10) Fallback-vs-Art Regressions
**Observed risk:** fallback primitives become accidental primary visuals.  
- Loaded textures remain primary.
- Fallback visuals are resilience-only.

## 11) Sector 3 Bootstrap Assumption Regressions
**Observed risk:** docs/tasks treat Sector 3 as early bootstrap and regress already-authored chamber quality.  
- Treat Sector 3 as later-stage build/polish-consistency shaping.
- Do not describe Chamber 1 as an old prototype layout.
- Preserve Chamber 1 rebuild alignment to newer authored-chamber standards.

## 12) Boss Death/Payoff Doctrine Drift
**Observed risk:** bosses regress to lighter/older death handling.  
- Keep all bosses/minibosses/pit bosses on the modern death/payoff family.
- Preserve zoom + shake + elongated ceremonial finish + stronger gore payoff + escalated remains.
