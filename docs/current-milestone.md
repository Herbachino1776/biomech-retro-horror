# Current Milestone

## Current Project State
- **Milestone 5 (Sector 1 Content Expansion) is closed** in first-pass terms.
- **Milestone 6 (Sector 2 / The Black Aqueduct) is functionally established** as a full prototype arc.
- **Milestone 7 (Combat Sidequest + wrap quality lanes) is largely established and meaningfully advanced.**
- **Milestone 8 (Sector 3 Buildout + Boss-Pit Expansion) is active in later-stage execution.**

## What Is Working in the Current Build
- Sector 1 progression is live: Chamber 01 -> Chamber 02 -> Chamber 03 -> separate boss arena finale.
- Sector 2 progression is live: Black Aqueduct Intake -> Compression Vaults -> Kiln of Judgement.
- Sector 2 chamber boss/completion contract is live in Chamber 3 through The Sorrow Engine flow.
- Sector 2 Chamber 2 includes the first live trap-altar -> boss-pit prototype loop (with return handoff).
- Shared major-encounter resolution flow is active and reusable.
- Vessel run economy foundations are active: chamber-entry partial restore + major-encounter max-cap reward behavior.
- Projectile/AOE/boss readability systems are active in live Sector 2 encounters.
- Sector 3 Chamber 1 (**Gallery of Failed Measures**) has been rebuilt toward the later authored-chamber standard.
- Half-Skull was removed from Sector 3 Chamber 1.
- Chamber 1 now uses a provisional replacement boss based on `art/raw/sector03/chamber02/enemy_chamber02_blind_cantor_basic_01.png`.
- Chamber 1 boss flow now follows modern full treatment: zoom + shake + elongated ceremonial finish + stronger gore payoff + escalated boss remains.
- Sector 3 Chamber 3 has already been substantially built out from its uploaded art pack.

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
- Milestone 8 is in a later-stage build/polish-consistency phase rather than early bootstrap.
- Practical priority is Sector 3 consistency, chamber quality alignment, and boss-pit expansion while preserving existing Sector 1/2 contracts.
- Milestone 7 follow-up remains available as targeted polish/support work, not primary sequencing.

### Canonical Boss-Pit Polish Anchor (Current)
- **Sector 1 Chamber 2 (`Chamber02BossPitScene`) is the canonical pit-under-polish anchor.**
- Reliability-first contract is now explicit: keep immediate `Chamber02Scene -> Chamber02BossPitScene` entry stable and avoid fragile source-scene cinematic handoff choreography.
- Polish should be added on the **arrival side** inside pit scenes first (arrival lock + intimidation sting + clean control return), then generalized later once trusted.
- S1C2 pit tuning is intentionally **easy-tier** to match early-game pacing.
- Textless modern death payoff package remains the canonical S1C2 pit resolution.
- Super-altar return should feel grounded (no clunky black-screen hiding tricks / no awkward midair return feel).

### Boss-Pit Abstraction (Deferred on Purpose)
- Do **not** abstract the pit system until the Chamber02 canonical pattern is trusted in play.
- Future milestone should cover:
  - shared pit entry helper
  - shared pit return helper
  - shared arrival sting / arrival beat helper
  - shared textless payoff package helper
  - per-pit difficulty tiers/config plumbing
- Optional later prop polish: add a ladder/physical-descent prop where appropriate.

## Authoring Doctrine to Follow During Milestone 8
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
- **Polish Chamber 1** is a later polish item, not current mainline milestone focus.
- Sector 3 chamber-to-chamber consistency polish remains a later-stage shaping lane.

## Planned Future Lane (Deferred)
Character animation is an intentional future production lane, but it is **not active focus now**.
- current conservative baseline: player idle + walk + functional visible hammer attack are working
- planned start point for deeper polish: player weapon/attack refinement pass
- planned later scope: broader weapon-set expansion, alternate attack families (smash / thrust / swipe / upswing), Rite animation, broader combat/performance animation language
- the production approach is already user-directed and should be preserved when this lane starts

## Do Not Change Casually
- Base-path deployment contract (`/biomech-retro-horror/` in production, `/` in local dev).
- Mobile controls and desktop keyboard parity.
- Scene registration + handoff wiring between Sector 2 chambers, boss-pit return flow, and Sector 3 Chamber 1.
- Lore cutscene scene isolation from chamber viewport matte/blackout layers.
- Projectile/AOE damage contracts and shared enemy presentation logic.
