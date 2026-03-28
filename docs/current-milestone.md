# Current Milestone

## Current Project State
- **Milestone 5 (Sector 1 Content Expansion) is closed** in first-pass terms.
- **Milestone 6 (Sector 2 / The Black Aqueduct) is functionally established** as a full prototype arc.
- **Milestone 7 (Combat Sidequest + wrap quality lanes) is largely established and meaningfully advanced.**
- **Milestone 8 (Sector 3 Buildout + Boss-Pit Expansion) is now active in practice.**

## What Is Working in the Current Build
- Sector 1 progression is live: Chamber 01 -> Chamber 02 -> Chamber 03 -> separate boss arena finale.
- Sector 2 progression is live: Black Aqueduct Intake -> Compression Vaults -> Kiln of Judgement.
- Sector 2 chamber boss/completion contract is live in Chamber 3 through The Sorrow Engine flow.
- Sector 2 Chamber 2 includes the first live trap-altar -> boss-pit prototype loop (with return handoff).
- Shared major-encounter resolution flow is active and reusable.
- Vessel run economy foundations are active: chamber-entry partial restore + major-encounter max-cap reward behavior.
- Projectile/AOE/boss readability systems are active in live Sector 2 encounters.
- Sector 3 Chamber 1 (**Gallery of Failed Measures**) exists as a playable backbone scene (`Sector03Chamber01Scene`).

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
- Milestone 8 execution has begun through Sector 3 Chamber 1 and early Sector 3 authoring.
- Practical priority is Sector 3 buildout + boss-pit expansion, while preserving existing Sector 1/2 contracts.
- Milestone 7 follow-up remains available as targeted polish/support work, not primary sequencing.

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

## Planned Future Lane (Deferred)
Character animation is an intentional future production lane, but it is **not active focus now**.
- planned start point: player sprite
- planned later scope: locomotion improvements, weapon swing animation, Rite animation, broader combat/performance animation language
- the production approach is already user-directed and should be preserved when this lane starts

## Do Not Change Casually
- Base-path deployment contract (`/biomech-retro-horror/` in production, `/` in local dev).
- Mobile controls and desktop keyboard parity.
- Scene registration + handoff wiring between Sector 2 chambers, boss-pit return flow, and Sector 3 Chamber 1.
- Lore cutscene scene isolation from chamber viewport matte/blackout layers.
- Projectile/AOE damage contracts and shared enemy presentation logic.
