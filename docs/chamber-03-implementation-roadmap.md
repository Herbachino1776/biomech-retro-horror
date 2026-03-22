# Chamber 03 Implementation Roadmap

Status: active bootstrap track. **This roadmap exists to prevent another oversized implementation attempt.** The trusted rolled-back Chamber 01 + Chamber 02 repo was the clean restart baseline, the old Chamber 02 exit-gate placeholder lore payoff remains removed, and Milestone 5B now exists in code as a minimal real-gate handoff plus Chamber 03 bootstrap scene.

## Warning from the Future
The prior Chamber 03 mistake was trying to build the full chamber in one pass.

That approach was wrong because it bundled:
- new progression continuity,
- new spatial layout,
- many encounters,
- threshold lore,
- a boss arena,
- sector-finale payoff,
- and audio identity work

into one destabilizing scope jump.

Chamber 03 should remain ambitious. The implementation strategy should not.

## Delivery Rule
Build Chamber 03 in milestone-safe slices. Each slice should preserve the shipped Chamber 01 + Chamber 02 baseline and leave the repo in a stable, testable state.

---

## Milestone 5A — Chamber 03 Doctrine + Transition Contract
**Purpose**
- Lock the Chamber 03 vision, finale role, and progression contract before gameplay implementation expands.

**Allowed Scope**
- planning docs,
- doctrine updates,
- explicit Chamber 02 -> Chamber 03 transition rules,
- milestone-safe sequencing guidance.

**Must NOT Be Attempted Yet**
- Chamber 03 gameplay scenes,
- Chamber 03 art integration,
- encounter implementation,
- boss implementation,
- audio implementation.

**Acceptance Target**
- repo docs clearly define Chamber 03 as Ossuary Choir Hall, Bucket 01's finale, and a chunked Milestone 5 target with a gate-based transition contract.

## Milestone 5B — Chamber 03 Bootstrap
**Purpose**
- Create the smallest stable playable scaffold for entering Chamber 03 without pretending the full chamber is done.

**Allowed Scope**
- Chamber 02 end-state correction needed to support a real gate/progression-object handoff from the new stable unlocked-gate baseline,
- minimal Chamber 03 scene/bootstrap setup,
- stable entry/exit plumbing,
- minimal continuity hooks that do not reintroduce a placeholder lore-screen payoff.

**Must NOT Be Attempted Yet**
- large room buildout,
- heavy encounter population,
- boss fight,
- finale payoff chain,
- broad new systems.

**Acceptance Target**
- player can cross a stable in-world threshold from Chamber 02's stable unlocked-gate endpoint into an intentionally minimal Chamber 03 bootstrap state without breaking the shipped slice.

**Current Implementation Note**
- Chamber 02's unlocked end gate now accepts direct interaction and starts `Chamber03Scene`.
- `Chamber03Scene` is intentionally empty, visible on first frame, controllable, and built from reused Chamber 01 / Chamber 02 backdrop/floor/gate art only.
- Dedicated Chamber 03 art, encounters, lore, boss work, and spectacle remain pending by design.

## Milestone 5C — Chamber 03 Spatial Buildout
**Purpose**
- Establish the hall's readable processional layout and sector-finale scale.

**Allowed Scope**
- core room flow,
- landmark geometry/layout,
- orientation anchors,
- traversal/readability tuning,
- chamber-specific visual staging that supports Ossuary Choir Hall identity.

**Must NOT Be Attempted Yet**
- full encounter saturation,
- final boss behavior,
- complete lore climax,
- next-bucket progression resolution,
- full audio identity pass.

**Acceptance Target**
- Chamber 03 reads as a longer, monumental Ossuary Choir Hall space with stable traversal and room identity, even if encounter and climax layers remain partial.

## Milestone 5D — Chamber 03 Encounter Layer
**Purpose**
- Add substantial encounter design so Chamber 03 stops feeling like an empty shell.

**Allowed Scope**
- encounter placement,
- wake timing,
- pacing/composition tuning,
- elite/high-pressure checkpoints if needed,
- difficulty/readability iteration using existing combat foundations.

**Must NOT Be Attempted Yet**
- final boss completion,
- full sector-ending reward chain,
- giant combat-system rewrites,
- unrelated chamber overhauls.

**Acceptance Target**
- Chamber 03 contains meaningful, staged encounter progression consistent with sector-finale pressure while preserving deliberate pacing and readability.

## Milestone 5E — Chamber 03 Threshold Lore + Boss Arena
**Purpose**
- Stand up the pre-climax threshold and the space that frames the first true boss.

**Allowed Scope**
- threshold lore beat,
- shrine/gate/ritual approach staging,
- boss arena layout and presentation contract,
- pre-fight continuity setup using the established lore-cutscene doctrine.

**Must NOT Be Attempted Yet**
- full boss polish,
- full next-bucket travel chain,
- complete ambience/music identity,
- extra chambers or unrelated narrative branches.

**Acceptance Target**
- Chamber 03 has a clear climax threshold and a readable boss arena that supports the future true boss without requiring the entire finale stack to be complete.

## Milestone 5F — Sector Finale Payoff
**Purpose**
- Land the actual sector-ending consequence of Chamber 03 and the boss defeat.

**Allowed Scope**
- boss defeat payoff,
- death/release/banishment consequences,
- progression unlock into the next area bucket,
- stronger finale feedback and resolution beats.

**Must NOT Be Attempted Yet**
- broad bucket-two implementation,
- giant meta-progression systems,
- unrelated refactors hidden inside the finale pass.

**Acceptance Target**
- defeating Chamber 03's true boss produces a clear sector-finale payoff and opens forward progression into the next bucket without destabilizing prior chambers.

## Milestone 5G — Chamber 03 Audio Identity
**Purpose**
- Give Chamber 03 and its boss threshold the oppressive audio treatment appropriate to a sector finale.

**Allowed Scope**
- chamber ambience,
- boss ambience/tension treatment,
- threshold stingers,
- payoff/death/progression cues,
- mixing/tuning specific to Chamber 03 states.

**Must NOT Be Attempted Yet**
- full-game soundtrack expansion,
- audio-system architecture rewrites,
- unrelated retroactive audio overhauls unless strictly required for Chamber 03 stability.

**Acceptance Target**
- Chamber 03 has a distinct audio identity that reinforces the Ossuary Choir Hall, first true boss pressure, and sector-finale payoff without overwhelming readability.

## Roadmap Discipline Summary
- Preserve the full Chamber 03 vision.
- Deliver it in slices.
- Never treat an unfinished slice as justification for overbuilding the next one.
- Never collapse the Chamber 02 -> Chamber 03 transition back into a fragile lore-screen-only handoff.
