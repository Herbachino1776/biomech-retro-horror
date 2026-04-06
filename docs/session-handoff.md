# Session Handoff

Use this file to start a fresh planning/implementation session from real current state.

## Big-Picture Doctrine (Read First)
- The project is beyond an early vertical slice and now operates as a multi-sector prototype.
- Boss pits are now core structure, not optional side garnish.
- Sector 4 Chamber 1 is now an active content lane.
- Dense lore should be balanced by violent combat payoff, trap-altar tension, and meaningful run-growth rewards.

## Where the Project Actually Is
- **Sector 1 arc is functionally present:** Chamber 01 -> Chamber 02 -> Chamber 03 -> separate boss arena finale.
- **Sector 2 arc is functionally present in prototype form:**
  - Chamber 1: Black Aqueduct Intake
  - Chamber 2: The Compression Vaults
  - Chamber 3: The Kiln of Judgement
  - Chamber 3 boss payoff: The Sorrow Engine
- **Sector 3 state is established beyond bootstrap:**
  - Chamber 1 (**Gallery of Failed Measures**) rebuilt toward later authored-chamber standard
  - Chamber 3 substantially built from uploaded art pack
- **S3 -> S4 handoff has been addressed enough for live forward authoring.**
- **Sector 4 Chamber 1 is actively being built and has already received shell/shrine/enemy passes.**
- **Sector 4 Chamber 2 shell/buildout prep is now a real secondary lane while S4C1 remains primary.**

## Working / Next / Deferred Snapshot

### What is working now
- Core sector progression for Sector 1 and Sector 2.
- Shared major-encounter resolution flow.
- Boss-pit loop structure with deterministic return semantics.
- Modern full boss death/payoff treatment in current authored lanes.
- Renderer/camera stability fix that resolved prior global sprite shimmer/sparkle behavior.
- Meaningful fix for feet-hidden-under-black-control-bar readability issue.

### What is next (active)
- Continue Sector 4 Chamber 1 content buildout and quality shaping.
- Continue Sector 4 Chamber 2 shell/buildout prep as secondary support work.
- Keep Sector 3 consistency/polish carryover aligned while Sector 4 comes online.

### What is deferred (explicit)
- Enemy Class Unification + Grounding/Scale Normalization milestone (family audit + contract cleanup + shared spawnY/body alignment normalization).
- Boss package polish -> global boss retrofit sequence.
- Boss-pack content production lane (roughly a dozen boss concepts + per-boss background planning in `art/raw/bosspit`).
- BRUTALITY MODE later complex milestone.
- Character/action animation lane.

## Milestone Snapshot
### Milestone 7 (advanced/largely established)
Established lanes include:
- 7A Vessel Run Economy
- 7B Gore-Driven Combat Feedback
- 7D Projectile + AOE Combat Kit
- 7E Boss / Miniboss Readability pass (first-pass)
- 7F Poise / Stagger / Rite Finisher pass (first-pass)
- first 7G prototype (trap altar + boss pit)
- shared major-encounter resolution + boss-death doctrine hardening
- chamber-end ritual/cinematic motion groundwork

Still available as targeted follow-up:
- 7C Enemy Pursuit + Encounter Chemistry
- 7H Chamber-End Rituals + Cinematic Lore Motion
- 7I Sponge vs Satisfaction Balance

### Milestone 8 (established / active-support)
- Sector 3 buildout + boss-pit expansion are established and still important.
- This lane remains active-support but is no longer the sole primary lane.

### Milestone 9 (active)
- Sector 4 Chamber 1 buildout is active and practical now.
- S3 -> S4 handoff is no longer a placeholder-only future assumption.

## Global Cleanup Lanes to Preserve
- Enemy families are now a real planning/runtime concern (standard enemy vs elite vs miniboss vs boss), not a single interchangeable class.
- Enemy contract cleanup and grounding/scale cleanup should be treated together as a shared milestone lane, not ad-hoc room patches.
- Many enemies in Sector 2 and later are still slightly low and slightly small, and some class contracts remain mixed.
- Preserve the solved feet/control-bar readability correction as a no-regression baseline.

## Boss Package + Content Pipeline Notes
- Boss package abstraction is now mature enough for a true future lane.
- Required sequencing: polish package first, then retrofit/reimplement boss encounters globally.
- Keep this lane separate from enemy-class unification/grounding work.
- Future content lane should assume approximately a dozen boss concepts across boss-pit/miniboss/full-boss contexts.
- Likely art ingestion pattern: one background image per boss into `art/raw/bosspit`.
- Registered boss-pack inventory and confident/ambiguous pairing notes are tracked in `docs/boss-pack-catalog.md` for future boss-pit/miniboss/full-boss deployment passes.

## Current Build/Platform Baseline
- Phaser 3 + Vite.
- GitHub Pages project-site base path: `/biomech-retro-horror/`.
- Mobile iPhone-sized browser playability is required.
- Desktop keyboard parity is required.

## What Must Not Be Broken
- Base-path-safe deploy behavior.
- Mobile controls visibility/alignment and desktop keyboard parity.
- Sector scene registration + transition handoff contracts.
- Fresh-interact threshold progression rule.
- Lore scene isolation from chamber viewport blackout/matte layers.
- Shared enemy presentation consistency across chambers.
- Projectile hit/damage lifecycle contract.
- Boss pit completion/reward reset behavior across run restart.

## Most Likely Next Gameplay Pass After This Handoff
1. Continue Sector 4 Chamber 1 content buildout.
2. Keep Milestone 8 carryover consistency aligned while S4 lane advances.
3. Schedule Enemy Class Unification + Grounding/Scale Normalization milestone planning after immediate S4 authoring stability.
4. Preserve boss package polish + global retrofit as a dedicated separate milestone, not background drift work.
