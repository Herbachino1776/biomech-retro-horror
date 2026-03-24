# Session Handoff

Use this file to start a fresh planning/implementation session from real current state.

## Where the Project Actually Is
The game is beyond a small vertical-slice stub.

- **Sector 1 arc is functionally present:**
  - Chamber 01
  - Chamber 02
  - Chamber 03
  - separate boss arena finale
  - real boss payoff and onward progression contract
- **Sector 2 arc is functionally present in prototype form (Bucket 2: The Black Aqueduct / The Pressure Gospel):**
  - Chamber 1: Black Aqueduct Intake
  - Chamber 2: The Compression Vaults
  - Chamber 3: The Kiln of Judgement
  - Chamber 3 boss payoff: The Sorrow Engine
  - lore beats integrated with progression flow
  - projectile combat tech active in shipped encounters
  - Black Oil / Tar-laced Blood payoff language active

## Current Build/Platform Baseline
- Phaser 3 + Vite
- GitHub Pages project-site base path: `/biomech-retro-horror/`
- Mobile iPhone-sized browser playability is required
- Desktop keyboard parity is required

## Major Fixes That Were Hard-Won
1. **Chamber 3 handoff/registration breakthrough**
   - Chamber flow failures were solved by restoring scene registration + transition wiring contracts, not by chamber-internal guesswork.
2. **Sector 2 Chamber 1 -> Chamber 2 threshold fresh-press fix**
   - Progression now requires an intentional fresh interact after threshold entry.
3. **Sector 2 Chamber 2 viewport/bootstrap fix**
   - Chamber 2 was stabilized by mirroring the proven Chamber 3 viewport/bootstrap pattern.
4. **Lore viewport blackout leak diagnosis/fix**
   - Lore blackout artifact traced to chamber viewport/overlay leakage, not lore art composition failure.
5. **Projectile bug root-cause lesson**
   - “Looks right but doesn’t hurt” was a gameplay contract miss, not a presentation issue.
6. **Enemy grounding regression lesson**
   - Regression came from shared enemy presentation logic; chamber-local patching was the wrong repair strategy.

## What Must Not Be Broken
- Base-path-safe deploy behavior.
- Mobile controls visibility/alignment and desktop keyboard parity.
- Sector 1 and Sector 2 end-to-end scene handoff contracts.
- Fresh-interact threshold progression rule.
- Lore scene isolation from chamber viewport blackout/matte layers.
- Shared enemy presentation consistency across chambers.
- Projectile hit/damage lifecycle contract.

## Recent Hard-Won Lessons (Concise)
- Bootstrap and scene contracts first; spectacle/content layering second.
- If a chamber fails to load, verify registration/handoff before touching encounter content.
- If lore blackout shape matches gameplay viewport, inspect camera overlays/layer leakage first.
- If projectile visuals work but damage fails, audit overlap/damage contract first.
- Fix shared presentation regressions at the shared layer, then validate all chambers.

## Most Likely Next Step
**Primary next step:** Sector 2 stabilization/polish wrap + documentation parity hardening.  
**Parallel planning step:** begin Sector 3 pre-production framing without introducing unneeded systems yet.
