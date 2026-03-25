# Combat Sidequest Roadmap

Planned, approved future lane for combat-focused systems work.

This roadmap is **not** a statement that these systems already exist in the build. It is a sequencing and implementation-planning guide for future milestone work after active stabilization priorities are protected.

## Intended Order

`7A -> 7B -> 7C -> 7D -> 7E -> 7F -> 7G -> 7H -> 7I`

## Milestone 7A — Vessel Run Economy
- Start each run at **5 Vessel Integrity**.
- Restore **+1 Vessel Integrity** when entering a new chamber.
- Increase **max Vessel capacity by +1** whenever a miniboss or boss is defeated.
- No healing items in this milestone.
- Full sector runs should remain challenging under this economy.
- Important HUD note: Vessel Integrity should move to a **solid bar that drains smoothly** (not segmented). If needed, that HUD conversion can be split into its own tightly scoped sub-pass.

## Milestone 7B — Gore-Driven Combat Feedback
- Strengthen on-hit splatter feedback.
- Ensure every normal enemy death gets a meaningful rupture burst.
- Elites get larger rupture bursts than normal enemies.
- Keep effects inside a maroon / oxblood / black tar palette.
- Improve repeat-run combat satisfaction through stronger crunch/spray payoff.
- Preserve miniboss/boss hierarchy so their deaths still read as higher-tier events.
- Escalating disfigurement/visual payoff is especially useful for larger boss concepts.

## Milestone 7C — Enemy Pursuit + Encounter Chemistry
- Increase patrolling enemy presence where encounter pacing benefits.
- Make generic enemies more heat-seeking/aggressive.
- Reduce passive behavior patterns where enemies idle into weak attacks.
- Scale chamber difficulty primarily through encounter chemistry and placement, not spongeiness alone.

## Milestone 7D — Projectile + AOE Combat Kit
- Expand projectile art/polish.
- Define reusable AOE attack language.
- Keep telegraphs readable and implementation-consistent.
- Ensure clean elite/miniboss/boss integration paths.
- Reduce “what even hit me” outcomes.

## Milestone 7E — Boss / Miniboss Readability Pass
- Improve telegraph clarity.
- Clarify punish windows.
- Improve readability of projectile/AOE boss patterns.
- Reduce confusing or unfair-feeling hits.

## Milestone 7F — Poise / Stagger / Rite Finisher
- Add poise/stagger behavior for elites/minibosses/bosses.
- Stagger states open clear punish windows.
- Rite evolves into contextual combat finisher behavior on staggered major enemies.
- Elite finishers can be scaled-down versions.
- Miniboss/boss finishers can become short cutscene-like payoff moments.

## Milestone 7G — Secret Altars + Boss Pits
- Add more altars per chamber.
- Some altars remain lore altars.
- Some altars become surprise trap altars.
- Trap flow: fade to black -> player falls into boss pit.
- Boss pit contains miniboss or boss encounter.
- After victory, player returns to altar location.

## Milestone 7H — Chamber-End Rituals + Cinematic Lore Motion
- Strengthen chamber-end ritual presentation.
- Add animated lore screens/background motion.
- Add more cinematic gate/machine/awakening transitions.
- Increase authored progression feel without breaking existing scene-flow contracts.

## Milestone 7I — Sponge vs Satisfaction Balance Pass
- Only allow spongeiness where visual payoff clearly earns it.
- Larger enemies may take more hits when disfigurement/rupture feedback scales appropriately.
- Treat this as a final balance pass after upstream milestones are implemented.
