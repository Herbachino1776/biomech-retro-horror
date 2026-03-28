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
- Sector 3 identity is **The Cradle of Refusal**.
- Sector 3 Chamber 1 playable backbone scene is **Gallery of Failed Measures**.

## Chamber Scale + Finale Doctrine
- Chamber-03-level scale/consequence is the benchmark for future chambers.
- Sector-ending chambers may use separate boss arenas when that improves pacing/consequence framing.
- Future chamber differentiation should come from theme bucket, encounter composition, art package, trigger placement, and lore framing — not by lowering stakes.

## Chamber Authoring Doctrine (Canonical)
New chambers should default to this authored rhythm:
1. opening setpiece / lore altar segment
2. corridor wall-module run with basic enemy pockets
3. larger opened-up room background reveal
4. elite / miniboss domain inside that opened-up room
5. terminal threshold / seal / endcap

This means:
- basic enemy pockets are primarily authored in corridor wall-module segments
- elites/minibosses/trap-altar reveals are primarily authored in larger room-style backgrounds
- background segmentation and encounter-tiering must visibly reinforce each other

## Gameplay + Combat Systems Doctrine
- Projectile tech is now a real reusable combat tool, not a chamber-only gimmick.
- Projectile behavior must preserve the full gameplay contract: spawn, movement, collision, damage, cleanup.
- Keep combat pacing deliberate/readable; avoid accidental drift into arcade-chaos tuning.
- Dense/obscure lore framing must be balanced with violent combat payoff, memorable encounter personality, and satisfying repeat-run combat feel.
- Shared major-encounter resolution flow is approved reusable infrastructure for chamber/boss endings.

## Boss Pit Doctrine (Canonical)
- Boss pits are now part of core structural game identity, not detached optional flavor.
- Boss pits are one-time per run.
- Boss pit completion/reward state resets on death/fresh run.
- Boss pits must grant meaningful Vessel growth rewards when cleared.
- Boss pits should preserve clean entry/exit contracts and deterministic return behavior.
- Sector 3 is expected to be boss-pit-heavy by design, with higher trap-altar density than earlier sectors.

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
- Milestone 7 is largely established; remaining 7C/7H/7I are targeted follow-up lanes, not default primary sequencing.
- Milestone 8 is now active in practice through Sector 3 Chamber 1 and early Sector 3 buildout.
- Post-7 direction remains coupled: Sector 3 buildout + boss-pit expansion.
- Global boss refinement/uniformity is planned as a later polish milestone (not dropped).

## Future Character Animation Doctrine (Deferred Lane)
- Animated characters are a real planned future production focus.
- This lane begins with the **player sprite**.
- Planned scope includes player locomotion improvements, weapon swing animation, Rite animation, and broader combat/performance animation language.
- This lane is intentionally deferred for now; current static-sprite-heavy presentation is not permanent doctrine.
- The user-defined production approach for animation should be preserved when this lane is activated.

## Workflow Constraints
- Before gameplay/controls/deployment/asset-loading/UI/lore changes, read doctrine docs.
- Prefer text/code edits unless binary edits are explicitly required.
- End meaningful code tasks with `npm run build` verification.

## Combat Sidequest Doctrine (Planned Lane)
- Combat economy direction should be intentional run-level tuning, not chamber-reset-driven recovery loops.
- Vessel Integrity presentation is planned to evolve into a smooth draining bar (non-segmented HUD language).
- Enemy aggression and encounter chemistry are prioritized over spongeiness-only difficulty tuning.
- Rite remains a lore interaction pillar and is planned to later expand into a contextual combat finisher on staggered major enemies.
- Surprise altar-to-boss-pit transitions are an approved encounter structure.
