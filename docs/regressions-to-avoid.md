# Regressions to Avoid

Known failure patterns and what future tasks must protect.

## 1) GitHub Pages / Vite Base-Path Regressions
**Observed risk:** builds work locally but fail on project-site deploy when base path drifts.
- Keep production base `/biomech-retro-horror/` and dev base `/`.
- Avoid hardcoded paths that bypass centralized URL mapping.

## 2) Mobile Controls Off-Screen / Drift Regressions
**Observed risk:** controls became clipped/off-screen in portrait, or drifted with world/camera edits.
- Keep controls fixed to screen space.
- Re-layout controls on resize/orientation changes.
- Keep visible controls and hit areas aligned.
- Respect iPhone portrait safe-area constraints.

## 3) Desktop Keyboard Parity Regressions
**Observed risk:** mobile-centric edits can accidentally break keyboard control flow.
- Preserve movement/jump/attack/interact/restart keyboard support.
- Validate both input paths after control/UI work.

## 4) Fallback-vs-Art Regressions
**Observed risk:** fallback geometry accidentally became primary visuals.
- Loaded textures remain primary.
- Fallback visuals activate only when texture loading fails.
- Keep fallback labels/readability aids without replacing art path.

## 5) Floor / Sprite Grounding Regressions
**Observed risk:** stand-ins looked sunk into floor or visually floating after origin/display tuning.
- Keep collision behavior stable while tuning display origin/body offsets.
- Validate grounding against floor reference at gameplay camera zoom.

## 6) Combat Loop Timing Regressions
**Observed risk:** hit registration drift when overlap windows/cooldowns change casually.
- Do not change attack timing/hitbox enable windows without explicit retuning.
- Preserve deterministic contact damage + invulnerability behavior.

## 7) Restart / Scene Flow Regressions
**Observed risk:** death/restart handling can soft-lock scene flow.
- Preserve start → chamber → death/restart contract.
- Verify restart input works on both desktop and mobile paths.

## 8) Portrait Readability Overcorrection
**Observed risk:** improving readability by enlarging world can hide controls, or making room for controls can shrink world to unreadable size.
- Do not casually break portrait layout while improving readability.
- Balance world viewport height and dedicated control space; validate both visually.
