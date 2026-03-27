# Current Milestone

## Current Project State
- **Milestone 5 (Sector 1 Content Expansion) is closed** in first-pass terms.
- **Milestone 6 (Sector 2 / The Black Aqueduct) is functionally established** as a full prototype arc.
- **Milestone 7 (Combat Sidequest + wrap quality lanes) is advanced but not closed.**

## What Is Working in the Current Build
- Sector 1 progression is live: Chamber 01 -> Chamber 02 -> Chamber 03 -> separate boss arena finale.
- Sector 2 progression is live: Black Aqueduct Intake -> Compression Vaults -> Kiln of Judgement.
- Sector 2 chamber boss/completion contract is live in Chamber 3 through The Sorrow Engine flow.
- Sector 2 Chamber 2 includes the first live trap-altar -> boss-pit prototype loop (with return handoff).
- Vessel run economy foundations are active: chamber-entry partial restore + major-encounter max-cap reward behavior.
- Projectile/AOE/boss readability systems are active in live Sector 2 encounters.

## Milestone 7 Status (Truthful Snapshot)
Milestone 7 is **advanced** and has delivered major lanes, but remains open.

### Implemented enough for this phase
- 7A Vessel Run Economy
- 7B Gore-Driven Combat Feedback
- 7D Projectile + AOE Combat Kit
- 7E Boss/Miniboss Readability Pass (first-pass)
- 7F Poise/Stagger/Rite Finisher lane (first-pass)
- first 7G trap-altar/boss-pit prototype (Sector 2 Chamber 2)

### Still open / active Milestone 7 lanes
- **7C Enemy Pursuit + Encounter Chemistry**
- **7H Chamber-End Rituals + Cinematic Lore Motion**
- **7I Sponge vs Satisfaction Balance**

## Sector 3 Readiness
- Sector 3 doctrine is now defined in `docs/sector03-doctrine-and-bosspit-direction.md`.
- Sector 3 buildout is ready for execution once remaining Milestone 7 lanes are sufficiently wrapped.
- Boss-pit direction is now treated as a core structural lane for post-7 implementation, not detached side content.

## Do Not Change Casually
- Base-path deployment contract (`/biomech-retro-horror/` in production, `/` in local dev).
- Mobile controls and desktop keyboard parity.
- Scene registration + handoff wiring between Sector 2 chambers and boss-pit return flow.
- Lore cutscene scene isolation from chamber viewport matte/blackout layers.
- Projectile/AOE damage contracts and shared enemy presentation logic.
