# Current Milestone

## Current Project State
- **Milestone 5 (Sector 1 Content Expansion) is closed** in first-pass terms.
- **Milestone 6 (Sector 2 / The Black Aqueduct) is functionally established** as a full prototype arc.
- **Milestone 7 (Combat Sidequest + wrap quality lanes) is largely established and meaningfully advanced.**
- **Milestone 8 (Sector 3 Buildout + Boss-Pit Expansion) is established and no longer the only active content lane.**
- **Milestone 9 (Sector 4 Chamber 1 Buildout) is now active in execution.**
- **Sector 4 Chamber 2 shell/buildout prep is now a real adjacent lane (early structure, not full active replacement for S4C1).**

## What Is Working in the Current Build
- Sector 1 progression is live: Chamber 01 -> Chamber 02 -> Chamber 03 -> separate boss arena finale.
- Sector 2 progression is live: Black Aqueduct Intake -> Compression Vaults -> Kiln of Judgement.
- Sector 2 chamber boss/completion contract is live in Chamber 3 through The Sorrow Engine flow.
- Sector 2 Chamber 2 includes the first live trap-altar -> boss-pit prototype loop (with return handoff).
- Shared major-encounter resolution flow is active and reusable.
- Vessel run economy foundations are active: chamber-entry partial restore + major-encounter max-cap reward behavior.
- Projectile/AOE/boss readability systems are active in live Sector 2 encounters.
- Sector 3 Chamber 1 (**Gallery of Failed Measures**) has been rebuilt toward the later authored-chamber standard.
- Sector 3 Chamber 3 has already been substantially built out from its uploaded art pack.
- **Sector 4 Chamber 1 is in active content buildout (live lane, not placeholder-only planning).**
- **S3 -> S4 handoff work has been addressed enough that Sector 4 is now practical to build against as current content.**
- **Sector 4 Chamber 1 has received shell/shrine/enemy passes as part of active authoring.**
- **Sector 4 Chamber 2 shell/buildout groundwork exists as an active-support lane while S4C1 remains primary.**

## Milestone 7 Status (Truthful Snapshot)
Milestone 7 is **advanced/largely established** and no longer the main active build lane.

### Established in this phase
- 7A Vessel Run Economy
- 7B Gore-Driven Combat Feedback
- 7D Projectile + AOE Combat Kit
- 7E Boss/Miniboss Readability Pass (first-pass)
- 7F Poise/Stagger/Rite Finisher lane (first-pass)
- first 7G trap-altar/boss-pit prototype (Sector 2 Chamber 2)
- shared major-encounter resolution and boss-death payoff hardening
- chamber-end ritual/cinematic motion groundwork

### Follow-up lanes that can still be revisited
- 7C Enemy Pursuit + Encounter Chemistry
- 7H Chamber-End Rituals + Cinematic Lore Motion
- 7I Sponge vs Satisfaction Balance

## Active Build Lane Now
- **Sector 4 Chamber 1 (Milestone 9 lane) is the practical active content build lane.**
- **Sector 4 Chamber 2 shell/buildout remains a real secondary support lane, not a pure placeholder note.**
- Milestone 8 remains established and still relevant for Sector 3 consistency/polish carryover and boss-pit expansion continuity.
- Milestone 7 follow-up remains available as targeted polish/support work, not primary sequencing.
- **BRUTALITY MODE is promoted to next-active combat-design milestone planning and should now shape near-term encounter authoring doctrine.**

## Next-Active Combat Design Focus (BRUTALITY MODE)
- BRUTALITY MODE is no longer treated as a buried speculative feature; it is now the **next-active combat/chamber-authoring milestone lane** while Sector 4 Chamber 1 remains the active content-build lane.
- This milestone is expected to reshape chamber dynamics, enemy placement, AI pressure, gore expectations, and encounter rhythm (not just player stat tuning).

### Locked BRUTALITY MODE v1 Spec (Documentation Lock)
- **Trigger (auto only):**
  - auto-trigger only
  - requires **2 basic-enemy kills within 5 seconds**
  - only basic enemies count toward activation
  - no manual activation
  - no visible meter/UI yet
- **Duration / chamber usage:**
  - fixed **20-second** timer
  - kills do not extend duration
  - getting hit does not cancel/reset mode
  - maximum **2 activations per chamber**
  - while active, streak counting is paused
  - on end, streak counting restarts from zero
- **Player changes during mode:**
  - larger player sprite
  - collision body also grows
  - increased reach
  - slight movement-speed boost
  - stronger damage output
  - temporary weapon swap to **Hammer of Banishment**
  - movement tuning must account for larger body so mode stays fast/predatory, not clumsy
- **Enemy behavior during mode:**
  - enemies become more aggressive
  - increased move speed
  - increased aggro range
  - stronger headlong/meat-grinder pressure
  - enemy behavior must reset cleanly to normal when mode ends
- **Kill behavior / gore:**
  - basic enemies receive instant brutality kills
  - basics use a dedicated brutality gore package separate from elites
  - brutality kill feel should be instant chunks: messy, fast, spectacular
  - quick screen shake on brutality kills
  - no gameplay stoppage
  - elites die in exactly **3 brutality hits**
  - elites use a distinct brutality gore package separate from basics
- **Presentation / feedback for v1:**
  - no visible meter
  - no on-screen indicator
  - activation cue is audio-only for now
  - activation cue should use a loud aggressive elite-attack-style sound
- **Deferred FX lane (not current implementation):**
  - chunks slamming the viewport
  - blood splatter spraying the viewport
  - broader screen FX escalation

### Chamber Authoring Doctrine Shift (From BRUTALITY MODE)
Future chamber design should intentionally support:
- basic-enemy pairings/clusters that make 2 kills in 5 seconds realistically achievable
- elite placements that let players cash out the active state
- enough density for a meat-grinder feeling
- enough readability/breathing room that the mode feels earned and usable, not random spam

## Recently Locked Technical/Readability Outcomes
- The global sprite shimmer/sparkle issue is treated as a **renderer/camera stability problem that was solved at system level**, not as an art-only defect.
- The enemy feet-hidden-under-black-control-bar issue has been solved in a meaningful way and is no longer accepted behavior.
- Enemy grounding/scale correction is now recognized as a **global cleanup lane**, and recent enemy authoring confirms this must be handled alongside class-contract cleanup:
  - multiple enemy-class families are now live in practice (standard, elite, miniboss, boss)
  - many enemies in Sector 2 and beyond still sit slightly too low and/or read slightly too small
  - this is now planned as a dedicated future enemy-class unification + grounding/scale milestone (not a one-off chamber tweak)

## Enemy Class Direction (Planned Future Lane, Not Active)
- A distinct future lane is reserved for **Enemy Class Unification + Grounding/Scale Normalization**.
- This lane exists because current content now includes multiple practical enemy families and we have already seen regressions from mixing contracts across those families.
- Planned scope includes:
  1. family audit across live standard enemy / elite / miniboss / boss types
  2. explicit contract boundaries between standard-enemy and boss-family logic
  3. shared grounding/scale/spawnY/body-alignment normalization
  4. reusable combat-module cleanup where appropriate
  5. pilot migration before broader rollout
- This lane is **not** the same milestone as global boss-package retrofit.

## Boss Package Direction (Now a Real Future Lane)
- Boss pit / boss encounter abstraction has advanced enough to support explicit future sequencing.
- Boss-pack ingestion/registration coverage has been expanded to include additional `art/raw/bosspit` assets; deployment wiring remains a separate later lane.
- Planned order is now:
  1. polish the abstracted boss package itself
  2. retrofit/reimplement boss encounters across the game to that package
- This is preserved as its own later milestone lane and should not be folded into ad-hoc chamber edits.

## Authoring Doctrine to Follow During Active Sector Buildouts
Chambers should be authored with this default rhythm:
1. opening setpiece / lore altar segment
2. corridor wall-module run with basic enemy pockets
3. larger opened-up room background reveal
4. elite / miniboss domain inside that opened-up room
5. terminal threshold / seal / endcap

Meaning:
- standard/basic enemy pockets belong primarily in corridor wall-module segments
- elites/minibosses/trap-altar reveals belong primarily in larger room-style backgrounds
- background segmentation and encounter tiering should visibly reinforce each other

## Planned Later Milestone Items (Deferred)
- **Polish Chamber 1** remains a later polish item, not current mainline milestone focus.
- Sector 3 chamber-to-chamber consistency polish remains a later-stage shaping lane.
- Enemy class unification + grounding/scale normalization remains a dedicated future milestone lane.
- Boss package polish + global boss retrofit remains a dedicated future milestone lane.

## Planned Future Lane (Deferred)
Character animation is an intentional future production lane, but it is **not active focus now**.
- current conservative baseline: player idle + walk + functional visible hammer attack are working
- planned start point for deeper polish: player weapon/attack refinement pass
- planned later scope: broader weapon-set expansion, alternate attack families (smash / thrust / swipe / upswing), Rite animation, broader combat/performance animation language
- the production approach is already user-directed and should be preserved when this lane starts

## Do Not Change Casually
- Base-path deployment contract (`/biomech-retro-horror/` in production, `/` in local dev).
- Mobile controls and desktop keyboard parity.
- Scene registration + handoff wiring between sectors/chambers and boss-pit return flow.
- Lore cutscene scene isolation from chamber viewport matte/blackout layers.
- Projectile/AOE damage contracts and shared enemy presentation logic.
