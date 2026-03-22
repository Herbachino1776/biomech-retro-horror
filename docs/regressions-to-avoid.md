# Regressions to Avoid

Known failure patterns and what future tasks must protect.

## 1) GitHub Pages / Vite Base-Path Regressions
**Observed risk:** builds work locally but fail on project-site deploy when base path drifts.
- Keep production base `/biomech-retro-horror/` and dev base `/`.
- Avoid hardcoded paths that bypass centralized URL mapping.

## 2) Mobile Controls Visibility / Alignment Regressions
**Observed risk:** controls can become clipped/off-screen in portrait or misaligned after resize/orientation edits.
- Keep controls fixed to screen space.
- Re-layout controls on resize/orientation changes.
- Keep visible controls and hit areas aligned.
- Preserve both portrait and landscape playability.
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

## 8) Lore Presentation Backslide Regressions
**Observed risk:** lore can regress from cinematic screen transitions back to generic always-on dialogue overlays, or removed placeholder flows can get reintroduced as fake progress.
- Preserve dedicated lore-screen transition cadence where implemented.
- Keep lore pacing discrete and ritual/cinematic in tone.
- Do not reintroduce the removed Chamber 02 exit-gate placeholder lore payoff as a substitute for real Chamber 03 continuity.

## 9) Lore Trigger Presentation Regressions
**Observed risk:** interactable lore markers can drift back toward debug-style UI objects.
- Preserve in-world ritual shrine/ossuary-style lore trigger presentation.
- Keep placeholders diegetic and in-world readable, not debug-box literal.

## 10) Chamber 02 Endpoint Regression
**Observed risk:** cleanup work around Chamber 03 planning can destabilize the shipped Chamber 02 endpoint.
- Preserve the current post-TOLL-KEEPER unlocked gate end state.
- Do not add a fake Chamber 03 boot, broken transition stub, or replacement placeholder cinematic during cleanup-only passes.
