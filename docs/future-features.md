# Future Features

## Purpose
This document preserves approved/desirable future feature lanes so they are not lost while active milestone work continues.
It is intentionally additive and should not be used to mark active milestone work as complete.

## Status Legend
- `concept` = discussed direction, not scheduled yet
- `planned` = approved direction and expected to be scheduled
- `later milestone` = explicitly deferred until current active build lanes stabilize

---

## BRUTALITY MODE
**Status:** `later milestone`

### Design Summary
BRUTALITY MODE is a deliberately high-intensity temporary power state earned through rapid kills in a short time window.
It is meant to punctuate oppressive pacing with controlled spikes, not replace baseline combat tone.

### Core Behavior Targets
- trigger condition: rapid kill chain within a short timing window
- mode duration target: approximately **10–15 seconds**
- player form changes: enlarged player silhouette/form for mode readability
- weapon state: temporary upgraded weapon profile during mode
- basic-enemy output: one-hit explosive kills
- elite-enemy output: roughly three-hit blood/guts explosive kill cadence
- gore layer: alternate gore packages while mode is active
- feedback layer: temporary audiovisual + gameplay-state shift while active

### Scheduling Note
This is intentionally a **later complex milestone**, not the next small task.
It should be tackled only after current sector build lanes and global readability cleanup lanes are stable.

---

## Enemy Class Unification + Grounding/Scale Normalization
**Status:** `planned` / `later milestone`

### Why this exists
Enemy authoring has reached a point where multiple families are now live in practice (standard, elite, miniboss, boss).
We already hit regressions from mixing class contracts, and grounding/scale issues remain shared/global readability concerns.

### Scope
- audit all live enemy families and where each class contract is currently applied
- define/lock standard vs elite vs miniboss vs boss contract boundaries
- perform cross-chamber baseline pass on enemy floor contact
- normalize enemy scale targets for gameplay readability
- normalize shared spawnY/body alignment conventions where needed
- clean/polish reusable combat modules where this reduces family-contract drift
- run pilot migration before broad rollout
- preserve no-regression behavior for the solved feet-hidden-under-control-bar issue
- avoid ad-hoc room-only patches when shared presentation logic is the real source

### Separation note
This milestone is separate from the global boss-package retrofit lane.

---

## Global Boss Encounter Retrofit to Abstracted Boss Package
**Status:** `planned` / `later milestone`

### Required Sequence
1. polish and harden the abstracted boss package
2. retrofit/reimplement each boss encounter across the game to that package

### Scope
- unify encounter lifecycle and completion hooks
- preserve modern full boss death/payoff doctrine during retrofit
- reduce fragile bespoke per-scene boss flow where package coverage is intended

---

## Boss-Pack Content Production Plan
**Status:** `planned` / `later milestone`

### Current approved direction
- user plans to design roughly a dozen boss concepts
- usage spread is expected across boss pit, miniboss, and full boss contexts
- user likely plans one background image per boss
- expected asset placement target is the `art/raw/bosspit` folder

### Pipeline note
Treat this as a production/content lane paired with integration and encounter-authoring bandwidth.
Do not flatten this plan into one-off unordered asset drops.

---

## Character/Action Animation Expansion
**Status:** `planned` / `later milestone`

### Preserved direction
- begin with player weapon/attack animation polish
- expand toward broader weapon-set and alternate attack families
- add deeper Rite/combat-performance animation language

---

## Milestone 7 Follow-Up Lanes (Preserve)
**Status:** `planned`

Remaining follow-up lanes that still matter:
- 7C Enemy Pursuit + Encounter Chemistry
- 7H Chamber-End Rituals + Cinematic Lore Motion
- 7I Sponge vs Satisfaction Balance
