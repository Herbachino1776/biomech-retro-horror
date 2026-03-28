# Torch Pass: New Chat Starter

## Read This First
1. `AGENTS.md`
2. `docs/current-milestone.md`
3. `docs/decisions.md`
4. `docs/technical-invariants.md`
5. `docs/session-handoff.md`
6. `docs/sector03-doctrine-and-bosspit-direction.md`
7. `docs/milestone-roadmap.md`

## Current Project State (Short)
The project is a multi-sector prototype, not a single-room slice. Sector 1 is playable end-to-end with its boss arena finale. Sector 2 is also playable as a three-chamber arc with its own chamber boss payoff. Sector 2 Chamber 2 includes the first working trap-altar -> boss-pit -> return loop.

Sector 3 has started in practice: Chamber 1 (**Gallery of Failed Measures**) exists as a playable backbone scene (`Sector03Chamber01Scene`) with functional encounter pockets, lore altar, and threshold/seal scaffold.

## Milestone Reality
- Milestone 7 is advanced/largely established (major systems landed, follow-up lanes remain).
- Milestone 8 is active in practice and is the current build lane.
- Milestone 8 meaning remains coupled: **Sector 3 buildout + boss-pit expansion**.

## What Milestone 7 Established
- 7A Vessel Run Economy
- 7B Gore-Driven Combat Feedback
- 7D Projectile + AOE Combat Kit
- 7E Boss/Miniboss readability pass (first-pass)
- 7F Poise/Stagger/Rite finisher groundwork
- first 7G trap-altar + boss-pit prototype
- shared major-encounter resolution + boss-death doctrine hardening
- chamber-end ritual/cinematic motion groundwork

## Remaining Milestone 7 Follow-Up Lanes
- 7C Enemy Pursuit + Encounter Chemistry
- 7H Chamber-End Rituals + Cinematic Lore Motion
- 7I Sponge vs Satisfaction Balance

## Chamber Authoring Doctrine (Default)
Author new chambers with this rhythm:
1. opening setpiece / lore altar segment
2. corridor wall-module run with basic enemy pockets
3. larger opened-up room background reveal
4. elite / miniboss domain inside that opened-up room
5. terminal threshold / seal / endcap

Interpretation:
- basic pockets primarily in corridor wall-module segments
- elites/minibosses/trap-altar reveals primarily in larger room backgrounds
- background segmentation and encounter tiering should visibly reinforce one another

## Sector 3 Framing (Canonical)
Sector 3 is **The Cradle of Refusal**. It is a deliberate escalation where the game weaponizes proven systems instead of only proving they exist. It should carry stronger combat pressure, denser lore cadence, more trap altars, and many boss pits.

## Boss Pits in Core Structure
Boss pits are now core structure and strategy, not detached side content.
- one-time per run
- reset on death/fresh run
- meaningful reward-bearing encounters
- clean entry/exit behavior
- personality-forward fights

Target rhythm: oppressive exploration -> suspicion -> ritual trigger -> descent -> violent boss payoff -> stronger vessel.

## Future Animation Lane (Planned, Deferred)
Character animation is a real future lane, but **not active focus right now**.
- starts with player sprite animation work
- later includes locomotion, weapon swing, Rite, and broader combat/performance animation language
- current static-sprite-heavy presentation is interim, not permanent doctrine

## Likely Next Implementation Priority
Continue Milestone 8 through Sector 3 gameplay buildout: first stronger trap-altar/boss-pit expansion and/or stronger elite-domain authoring in opened-room segments, without regressing current scene-flow/run-state contracts.
