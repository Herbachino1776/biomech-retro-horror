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
**Status:** `planned` / `active-planned near-term lane`

### Design Summary
BRUTALITY MODE is a deliberately high-intensity temporary power state earned through rapid kills in a short time window.
It is meant to punctuate oppressive pacing with controlled spikes, not replace baseline combat tone.

### Core Behavior Targets
- trigger condition (auto-only): **2 basic-enemy kills within 5 seconds**
- activation counting: only basic enemies count toward trigger
- activation UX in v1: no manual trigger, no visible meter, no on-screen indicator
- mode duration: fixed **20 seconds**
- duration rules: kills do not extend mode; taking damage does not cancel/reset mode
- chamber cap: max **2 activations per chamber**
- streak lifecycle: streak counting pauses during mode, then restarts from zero on mode end
- player form changes: enlarged player silhouette/form and enlarged collision body
- player combat changes: increased reach, slight speed boost, stronger damage output
- weapon state: temporary swap to **Hammer of Banishment**
- enemy behavior: temporary aggression ramp (speed + aggro + pressure), then clean reset on mode end
- basic-enemy output: instant brutality kills with dedicated basic brutality gore package
- elite-enemy output: exactly **3 brutality hits** to kill with separate elite brutality gore package
- kill feedback: quick screen shake on brutality kills with no gameplay stoppage
- activation cue: audio-only using a loud aggressive elite-attack-style sound
- deferred FX lane (not implemented in v1): viewport chunk impacts, viewport blood splatter, broader screen FX escalation

### Chamber/Encounter Authoring Doctrine Impact
BRUTALITY MODE is now treated as a near-term combat/chamber-authoring milestone lane.
Future chambers should intentionally support:
- streak-building fodder/basic clusters
- elite placements that can cash out temporary power-state windows
- kill-density pacing + AI pressure windows that make activation earned
- readable rhythm and breathing room so the power state can be used well
- authored escalation windows, not random enemy spam

### Scheduling Note
This remains a meaningful multi-system milestone (not a tiny side tweak), but it is no longer buried as distant speculation.
It is now expected to be sequenced as active/next-active combat-design planning while preserving separate enemy-class and boss-retrofit lanes.

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
