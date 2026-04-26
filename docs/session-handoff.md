# Session Handoff

Use this file to start a fresh planning/implementation session from real current state.

## Latest Update (2026-04-26)
- **Chamber02 ending repaired:** end corridor blockage/deadlock at the exit lane was corrected by relocating the physical gate barrier to the true threshold side, removing confusing ellipse/post gate dressing at the choke, and keeping only intentional collider geometry on progression blockers.
- **Chamber02 gate/threshold approach:** end gate now reads as an in-world prop sprite using `sector04Chamber02PropThresholdDoor` art, with collision/transition zones kept separate from decorative visuals.
- **Chamber02 lore beat restored:** a dedicated end-lane lore shrine trigger (Sector 2 Chamber 2 altar + lore screen image) now fires before the end boss gate flow and returns cleanly back into Chamber02.
- **Progression status into Chamber03:** final threshold remains boss-gated, now requires fresh interact at the unlocked end threshold, and transitions to `Chamber03Scene` through the existing handoff path.
- **Chamber02 modernization:** main chamber has been stretched for wider pacing pockets, prototype boss-pit descend prompt text removed, and gate visuals shifted toward in-world prop/sprite presentation rather than cropped background-style plates.
- **BRUTALITY support (Chamber02):** Chamber02 now runs BRUTALITY state tracking (2 kills / 5s trigger, 20s duration, max 2 activations), basic kills feed streaks, and enemy/toll-keeper aggression syncs while active with clean teardown on scene shutdown.
- **Second boss pit hardlock fix:** Hollow Sky pit hardlocked because `chamber02BossPitHollowSkyConfig` relied on the configurable pit default boss path (`PressureDeacon`) instead of the proven S1C2 `HalfSkullMiniboss` path. The fix explicitly sets `bossClass: HalfSkullMiniboss`, keeps activation-on-arrival-release and return-altar flow, and preserves Hollow Sky art/name while restoring stable sprite/hurtbox overlap combat.
- **Chamber-ending boss:** Chamber02 now includes a main-path end boss near the exit gate (**THE VERTEBRAL TOLL JUDGE**), with normal hurtbox overlap damage flow, delayed reveal/boss-bar behavior, and exit unlock after modern death/payoff resolution.
- **Current DEV target:** BootScene START GAME remains Chamber01Scene; DEV remains Chamber02Scene for S1C2 modernization validation.

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
- **BRUTALITY MODE is now the next-active combat-design milestone lane and should guide near-term chamber encounter composition.**

## Working / Next / Deferred Snapshot

### What is working now
- Core sector progression for Sector 1 and Sector 2.
- Shared major-encounter resolution flow.
- Boss-pit loop structure with deterministic return semantics.
- S1C2 boss-pit recovery lock (The Pit Judge):
  - first diagnostic for "boss won't move/attack/take damage" is activation/reveal state (`boss.active`, body enabled, `hasBossRevealTriggered`, reveal timing), not sprite/hurtbox swaps
  - boss combat activation is on arrival release (`activateBossOnArrivalRelease`), while boss-bar reveal remains a separate in/near-view presentation gate
  - normal damage authority is restored: `player.attackHitbox` overlap vs boss damage hurtbox/sprite
  - emergency fallback damage (`simpleAttackCycleDamage`) is disabled after recovery
  - intended geometry/config lock: `damageHurtbox` (`trimXRatio 0.08`, `trimYRatio 0.08`, `insetBottomPx 0`, `minWidth 180`, `minHeight 240`, `offsetX 0`, `offsetY -20`), remains lift `56px`, `spawnX 1560`
  - DEV default currently starts `Chamber02Scene` for focused S1C2 validation unless milestone direction explicitly changes
- S1C2 boss-pit activation/damage loop has been repaired and should be treated as stable unless runtime testing says otherwise.
- Modern full boss death/payoff treatment in current authored lanes.
- Renderer/camera stability fix that resolved prior global sprite shimmer/sparkle behavior.
- Meaningful fix for feet-hidden-under-black-control-bar readability issue.
- Sector 1 Chamber 1 Phase 2 layout/rhythm retrofit is now landed: longer corridor rhythm, wider pocket spacing, and BRUTALITY-era clustering opportunities while preserving Blind Cantor pilot behavior.

### What is next (active)
- Continue Sector 4 Chamber 1 content buildout and quality shaping.
- Continue Sector 4 Chamber 2 shell/buildout prep as secondary support work.
- Keep Sector 3 consistency/polish carryover aligned while Sector 4 comes online.
- Start BRUTALITY MODE as the next-active combat-design lane so upcoming chambers are authored around streak escalation windows.
- Treat S1C1 retrofit hardening and one-boss pilot work as legitimate targeted support lanes when explicitly requested, not as default roadmap replacement.

### What is deferred (explicit)
- Enemy Class Unification + Grounding/Scale Normalization milestone (family audit + contract cleanup + shared spawnY/body alignment normalization).
- Boss package polish -> global boss retrofit sequence.
- Boss-pack content production lane (roughly a dozen boss concepts + per-boss background planning in `art/raw/bosspit`).
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

### Milestone 10 (next-active combat lane)
- BRUTALITY MODE is now active-planned as the next combat/chamber-authoring focus.
- Preserved target behavior:
  - auto-trigger only: 2 basic-enemy kills within 5 seconds (basics-only counting, no manual trigger)
  - no visible meter/UI or on-screen indicator in v1
  - fixed 20-second mode timer; kills do not extend it
  - taking damage does not cancel/reset mode
  - max 2 activations per chamber
  - streak counting pauses during mode and restarts from zero when mode ends
  - larger/stronger presentation state + temporary Hammer of Banishment
  - BRUTALITY is currently treated as presentation/combat-state overlay (do not casually reopen body/floor/collision logic)
  - increased reach, slight speed boost, and stronger damage while active
  - enemy aggression override during mode (higher speed/aggro/pressure), then clean reset to normal on exit
  - basic enemies die instantly with dedicated brutality gore package
  - elites die in exactly 3 brutality hits with separate elite brutality gore package
  - quick screen shake on brutality kills, with no gameplay stoppage
  - activation cue is audio-only: loud aggressive elite-attack-style sound
  - deferred later FX (not current implementation): viewport chunk impacts, viewport blood splatter, broader screen-FX escalation
- This milestone changes chamber doctrine (density, placement, pacing windows), not just player stat tuning.

## Global Cleanup Lanes to Preserve
- Enemy families are now a real planning/runtime concern (standard enemy vs elite vs miniboss vs boss), not a single interchangeable class.
- Enemy contract cleanup and grounding/scale cleanup should be treated together as a shared milestone lane, not ad-hoc room patches.
- Many enemies in Sector 2 and later are still slightly low and slightly small, and some class contracts remain mixed.
- Preserve the solved feet/control-bar readability correction as a no-regression baseline.

## Boss Package + Content Pipeline Notes
- Boss package abstraction is now mature enough for a true future lane.
- Required sequencing: polish package first, prove one controlled boss pilot for runtime/floor/hurtbox behavior, then retrofit/reimplement boss encounters globally.
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
2. Begin BRUTALITY MODE implementation planning as the next-active combat/chamber-authoring lane while S4 lane advances.
3. Keep Milestone 8 carryover consistency aligned during S4 + BRUTALITY sequencing.
4. Preserve Enemy Class Unification + Grounding/Scale Normalization as a separate milestone after near-term BRUTALITY focus.
5. Preserve boss package polish + global retrofit as a dedicated separate milestone, not background drift work.
