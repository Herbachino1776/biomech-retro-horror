# Milestone Roadmap

Lean roadmap grounded in current Phaser + Vite + GitHub Pages + mobile-first trajectory.

## Milestone 0 — Project Foundation
**Purpose:** establish runnable project skeleton and constraints.
**Status:** completed.

## Milestone 1 — Playable Mobile Vertical Slice
**Purpose:** lock a playable Chamber 01 loop for iPhone portrait + desktop keyboard.
**Status:** completed.

## Milestone 2 — Slice Art Cohesion + Lore Pattern Consolidation
**Purpose:** harden readability and formalize lore-screen flow patterns.
**Status:** completed.

## Milestone 3 — Encounter Expansion + Combat Readability
**Purpose:** deepen encounter readability and pacing in shipped sectors.
**Status:** completed.

## Milestone 4 — Audio Identity Pass
**Purpose:** establish oppressive baseline audio identity across gameplay/lore states.
**Status:** completed.

## Milestone 5 — Content Expansion (Sector 1)
**Purpose:** complete Chamber 03 + sector finale contract for Sector 1.
**Status:** completed and closed in first-pass terms.

## Milestone 6 — Bucket 2 Expansion (Sector 2: The Black Aqueduct / Pressure Gospel)
**Purpose:** build and prove the next sector arc beyond Sector 1.
**Status:** substantially complete in prototype form.

## Milestone 7 — Combat Sidequest Integration + Sector 2 Hardening
**Purpose:** integrate run-economy/combat lanes and lock Sector 2 behavior for clean handoff.

**Implemented state includes:**
- Vessel run economy baseline (entry restore + major encounter max reward)
- gore payoff strengthening
- projectile/AOE combat kit in live encounters
- readability and stagger/finisher foundations
- first trap-altar -> boss-pit prototype (Sector 2 Chamber 2)
- shared major-encounter resolution and boss-death sequence hardening
- chamber-end ritual/cinematic motion groundwork

**Remaining follow-up lanes (optional closeout/polish):**
- 7C Enemy Pursuit + Encounter Chemistry
- 7H Chamber-End Rituals + Cinematic Lore Motion
- 7I Sponge vs Satisfaction Balance

**Status:** advanced/largely established (no longer the main build lane).

## Milestone 8 — Sector 3 Buildout + Boss-Pit Expansion (Coupled)
**Purpose:** establish Sector 3 (**The Cradle of Refusal**) as an escalation sector while expanding boss pits as core structural rhythm.

**Current-reality notes:**
- Sector 3 Chamber 1 rebuilt to later authored-chamber standards.
- Chamber 1 boss flow already uses modern full boss treatment.
- Sector 3 Chamber 3 is substantially built from uploaded art pack.

**Status:** established/active-support lane (not the only primary lane).

## Milestone 9 — Sector 4 Chamber 1 Buildout (Active)
**Purpose:** bring Sector 4 online as the next live authored lane after Sector 3 handoff stabilization.

**Current-reality notes:**
- S3 -> S4 handoff work has been addressed.
- Sector 4 is now a live content lane, not a placeholder-only future idea.
- Sector 4 Chamber 1 has received shell/shrine/enemy passes.
- Sector 4 Chamber 2 shell/buildout prep is now a real adjacent lane (secondary while S4C1 remains primary).

**Status:** active now.

## Milestone 10 — BRUTALITY MODE Combat-State Integration (Next-Active Lane)
**Purpose:** implement BRUTALITY MODE as a meaningful combat-state system that changes encounter authoring, not just player stats.

**Scope / Includes:**
- kill-streak trigger/state machine lane (auto-only):
  - trigger on 2 basic-enemy kills within 5 seconds
  - only basic enemies count toward activation
  - no manual activation path
  - no visible meter/UI in v1
- duration + chamber usage lane:
  - fixed 20-second timer
  - kills do not extend duration
  - taking damage does not cancel/reset mode
  - max 2 activations per chamber
  - streak counting pauses while active and restarts from zero on mode end
- player transformation + Hammer of Banishment lane:
  - larger/stronger presentation state (overlay feel), without casual body/floor/collision rewrites
  - increased reach, slight movement-speed boost, stronger damage
  - temporary weapon swap to Hammer of Banishment
  - if body/floor/collision changes are ever proposed, require an explicit proof task first
- enemy aggression override + reset lane:
  - increased move speed and aggro range
  - more headlong/meat-grinder pressure during mode
  - clean reset to normal enemy behavior when mode ends
- brutality kill/gore rules lane:
  - basic enemies: instant brutality kills
  - elites: exactly 3 brutality hits to kill
  - separate brutality gore packages for basics vs elites
  - quick screen shake on brutality kills, no gameplay stoppage
- audio/FX lane:
  - v1 activation cue is audio-only (loud aggressive elite-attack-style sound)
  - no on-screen indicator/meter yet
  - deferred later FX lane: viewport chunk impacts, viewport blood splatter, broader screen FX escalation
- chamber-authoring implications lane:
  - basic clusters/pairings should make 2-kill-in-5s activation realistically achievable
  - elite placement should allow active-state cashout opportunities
  - density should support meat-grinder feel
  - preserve readability/breathing room so activation feels earned and usable, not random spam

**Separation guardrails:**
- this lane is separate from Enemy Class Unification + Grounding/Scale Normalization
- this lane is separate from Boss Package Polish + Global Boss Retrofit

**Status:** active-planned / next-active combat-design milestone.

## Milestone 11 — Sector 3/4 Pacing, Density, and Readability Polish
**Purpose:** tune oppressive pacing clarity and combat readability under heavier encounter density.

**Scope / Includes:**
- pacing and downtime/combat beat refinement
- lore/combat cadence balancing
- readability cleanup under dense altar + pit + encounter flows
- chamber-level polish carryover where needed

**Status:** planned later milestone.

## Milestone 12 — Enemy Class Unification + Grounding/Scale Normalization
**Purpose:** formalize enemy-family contracts and normalize shared presentation/readability baselines before broader family migration work.

**Why this now exists as a separate lane:**
- multiple enemy-class families are already live in real authored content
- standard enemies, elites, minibosses, and bosses are not interchangeable contracts
- prior regressions showed that contract mixing causes brittle behavior and cleanup churn
- grounding/scale/feet-contact issues are global shared concerns, not chamber-local patchwork

**Scope / Includes:**
- full audit of live enemy families and class usage across chambers/sectors
- explicit standard vs elite vs miniboss vs boss contract definitions
- shared grounding/scale/spawnY/body-alignment normalization pass
- reusable combat module cleanup/polish where appropriate
- pilot migration on selected encounters before broad rollout

**Status:** planned later milestone.

## Milestone 13 — Boss Package Polish + Global Boss Retrofit
**Purpose:** stabilize and polish abstracted boss package before full-game encounter retrofit.

**Required sequence:**
1. polish/harden abstracted boss package first
2. prove one controlled boss pilot for runtime/floor/hurtbox behavior
3. retrofit/reimplement each boss encounter to the package

**Scope / Includes:**
- preserve modern full boss death/payoff doctrine across all converted fights
- unify encounter lifecycle hooks and completion semantics
- reduce per-scene bespoke boss logic where package coverage is intended

**Status:** planned later milestone.

## Milestone 14 — Boss-Pack Content Production Lane
**Purpose:** produce and integrate planned boss-pack content systematically.

**Current approved planning direction:**
- user plans roughly a dozen boss concepts spanning boss-pit, miniboss, and full-boss use
- user likely plans one background image per boss
- paired boss/background assets are intended for `art/raw/bosspit` content flow

**Status:** planned later milestone (content production + integration pipeline).

## Milestone 15 — Character/Action Animation Lane (Deferred, Explicit)
**Purpose:** evolve presentation language from static-sprite-heavy baseline to authored character action performance.

**Planned sequencing:**
- conservative baseline already present: player idle + walk + visible hammer attack
- start deferred polish with player weapon/attack refinement
- improve player locomotion readability/feel where needed
- expand attack language into alternate families (smash / thrust / swipe / upswing)
- add Rite animation language
- expand weapon-set breadth and broader combat/performance animation vocabulary

**Status:** planned and intentionally deferred.
