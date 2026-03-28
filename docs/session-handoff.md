# Session Handoff

Use this file to start a fresh planning/implementation session from real current state.

## Big-Picture Doctrine (Read First)
- The project is beyond an early vertical slice and now operates as a multi-sector prototype.
- Boss pits are now core structure, not optional side garnish.
- Milestone 8 (Sector 3 + boss-pit expansion) is active in practice.
- Dense lore should be balanced by violent combat payoff, trap-altar tension, and meaningful run-growth rewards.

## Where the Project Actually Is
- **Sector 1 arc is functionally present:** Chamber 01 -> Chamber 02 -> Chamber 03 -> separate boss arena finale.
- **Sector 2 arc is functionally present in prototype form:**
  - Chamber 1: Black Aqueduct Intake
  - Chamber 2: The Compression Vaults
  - Chamber 3: The Kiln of Judgement
  - Chamber 3 boss payoff: The Sorrow Engine
- **First boss pit template exists in Sector 2 Chamber 2** (trap altar descent, pit boss kill, exit altar return).
- **Sector 3 Chamber 1 exists and is playable:** Gallery of Failed Measures (`Sector03Chamber01Scene`).

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

### Milestone 8 (active)
- Sector 3 buildout + boss-pit expansion are coupled and underway.
- Current practical anchor is Sector 3 Chamber 1 handoff-safe expansion.

## Chamber Authoring Doctrine (Default)
Author new chambers in this rhythm:
1. opening setpiece / lore altar segment
2. corridor wall-module run with basic enemy pockets
3. larger opened-up room background reveal
4. elite / miniboss domain inside that opened-up room
5. terminal threshold / seal / endcap

Guidance:
- keep basic pockets mostly in corridor wall-module segments
- place elites/minibosses/trap-altar reveals mostly in larger room-style segments
- keep background segmentation and encounter tiering visibly coupled

## Boss Pit Strategic Meaning (Current Doctrine)
- Boss pits are one-time per run.
- Boss pit state resets on death/fresh run.
- Boss pits now matter strategically because they grow the run (Vessel progression impact).
- Sector 3 is expected to heavily expand trap altars and boss pits.

## Current Build/Platform Baseline
- Phaser 3 + Vite.
- GitHub Pages project-site base path: `/biomech-retro-horror/`.
- Mobile iPhone-sized browser playability is required.
- Desktop keyboard parity is required.

## What Must Not Be Broken
- Base-path-safe deploy behavior.
- Mobile controls visibility/alignment and desktop keyboard parity.
- Sector 1 and Sector 2 end-to-end scene handoff contracts.
- Sector 3 Chamber 1 scene registration and threshold/seal handoff behavior.
- Fresh-interact threshold progression rule.
- Lore scene isolation from chamber viewport blackout/matte layers.
- Shared enemy presentation consistency across chambers.
- Projectile hit/damage lifecycle contract.
- Boss pit completion/reward reset behavior across run restart.

## Planned Future Lane (Do Not Lose)
Character animation is a real planned lane, but it is **not active focus yet**.
- starts with player sprite animation work
- later includes locomotion, weapon swing, Rite, and broader combat/performance animation language
- respect the user-defined animation process when this lane begins

## Most Likely Next Gameplay Pass After Docs
1. Expand Sector 3 with first stronger trap-altar/boss-pit route(s) and/or elite-domain reinforcement in opened-up room segments.
2. Keep Milestone 8 buildout primary; revisit Milestone 7 follow-up only when it directly supports the Sector 3 lane.
