# Decisions

Concise record of technical/design decisions currently in force.

## Engine + Runtime
- Phaser 3 + ES modules remains the runtime baseline.
- Vite remains the dev/build toolchain.
- Browser play remains primary: mobile-first without dropping desktop keyboard parity.

## Deployment
- GitHub Pages project-site deployment stays in force.
- Production base path remains `/biomech-retro-horror/`.
- Local dev base path remains `/`.
- Scene/asset loading must remain base-path-safe.

## Sector Identity + Naming Doctrine
- Bucket 2 is **The Black Aqueduct**.
- Sector 2 arc is **The Pressure Gospel**.
- Sector 2 chamber naming is locked:
  - Chamber 1 = **Black Aqueduct Intake**
  - Chamber 2 = **The Compression Vaults**
  - Chamber 3 = **The Kiln of Judgement**
- Sector 2 Chamber 3 boss is **The Sorrow Engine**.
- Sector 2 kill-payoff language is **Black Oil / Tar-laced Blood**.

## Chamber Scale + Finale Doctrine
- Chamber-03-level scale/consequence is the benchmark for future chambers.
- Sector-ending chambers may use separate boss arenas when that improves pacing/consequence framing.
- Future chamber differentiation should come from theme bucket, encounter composition, art package, trigger placement, and lore framing — not by lowering stakes.

## Gameplay + Combat Systems Doctrine
- Projectile tech is now a real reusable combat tool, not a chamber-only gimmick.
- Projectile behavior must preserve the full gameplay contract: spawn, movement, collision, damage, cleanup.
- Keep combat pacing deliberate/readable; avoid accidental drift into arcade-chaos tuning.

## Lore Presentation Doctrine
- Lore is a primary identity system.
- Preferred delivery remains discrete cinematic ritual transitions (`LoreScreenScene` / `LoreCutsceneScene`) instead of generic always-on dialogue UI.
- Lore-scene failures that match chamber viewport shape should be diagnosed as scene-layer leakage before changing lore art/layout.

## Shared Logic Stability Doctrine
- Shared enemy presentation logic must be treated as shared infrastructure.
- Do not “fix grounding” chamber-by-chamber when the regression source is shared presentation logic.
- Diagnose root cause first; avoid parallel local patches that fragment behavior.

## Milestone Flow Doctrine
- Milestone 5 is closed.
- Milestone 6 moved beyond foothold status and now represents a full Sector 2 prototype arc.
- Near-term work prioritizes Sector 2 stabilization/polish + docs parity before major Sector 3 implementation.

## Workflow Constraints
- Before gameplay/controls/deployment/asset-loading/UI/lore changes, read doctrine docs.
- Prefer text/code edits unless binary edits are explicitly required.
- End meaningful code tasks with `npm run build` verification.

## Combat Sidequest Doctrine (Planned Lane)
- Combat economy direction should be intentional run-level tuning, not chamber-reset-driven recovery loops.
- Vessel Integrity presentation is planned to evolve into a smooth draining bar (non-segmented HUD language).
- Enemy aggression and encounter chemistry are prioritized over spongeiness-only difficulty tuning.
- Rite remains a lore interaction pillar and is planned to later expand into a contextual combat finisher on staggered major enemies.
- Surprise altar-to-boss-pit transitions are an approved future encounter structure.
