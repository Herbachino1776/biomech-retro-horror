# Milestone Roadmap

Lean roadmap grounded in current Phaser + Vite + GitHub Pages + mobile-first trajectory.

## Milestone 0 — Project Foundation
**Purpose:** establish runnable project skeleton and constraints.
**Scope / Includes:** Phaser setup, Vite build/dev flow, base docs, initial chamber scaffold, input baseline.
**Acceptance Criteria:** project boots locally, builds successfully, and has documented structure.
**Dependencies:** none.
**Do Not Expand Prematurely:** content volume, advanced systems.
**Status:** completed.

## Milestone 1 — Playable Mobile Vertical Slice
**Purpose:** lock a playable Chamber 01 loop that works on iPhone portrait and desktop keyboard.
**Scope / Includes:** movement/combat/death-restart, one active enemy loop, lore trigger, mobile controls, responsive portrait layout.
**Acceptance Criteria:** chamber playable with visible usable portrait controls, readable world view, grounded sprites, desktop parity, successful build.
**Dependencies:** Milestone 0 complete.
**Do Not Expand Prematurely:** extra levels, new mechanics, heavy refactors.
**Status:** completed.
**Completion Notes:** mobile controls are corrected for portrait + landscape usability; Chamber 01 first lore beat now uses dedicated cinematic lore-screen flow with Laughing Engine/furnace prototype art; lore trigger marker presentation is now an in-world ritual shrine/ossuary-style prop.

## Milestone 2 — Slice Art Cohesion + Lore Pattern Consolidation
**Purpose:** harden visual cohesion/readability in the current playable slice while consolidating the newly established lore delivery pattern.
**Scope / Includes:** Chamber 01 asset normalization toward art lock, interactable readability tuning, and cleanup/generalization of lore-screen + shrine trigger pattern for future beats.
**Acceptance Criteria:** current playable assets read clearly at play scale, align with locked palette/silhouette doctrine, and preserve established lore-screen/shrine interaction behavior without regressions.
**Dependencies:** Milestone 1 complete.
**Do Not Expand Prematurely:** new gameplay systems, new chambers, branching narrative architecture.
**Status:** completed.
**Completion Notes:** lore-screen pattern now supports per-screen layout overrides + aspect-preserving image fit to prevent portrait flattening; Chamber 02 lore beat ships with a conservative post-lore ritual reaction state (environment shift + ritual-aligned enemy wake) without broad system expansion.

## Milestone 3 — Encounter Expansion + Combat Readability
**Purpose:** deepen encounter quality inside the shipped Chamber 01 + Chamber 02 slice without broad scope creep.
**Relationship to Milestone 2:** Milestone 2 established Chamber 01 + Chamber 02 progression, lore/cutscene flow, and the baseline encounter space. Milestone 3 built on that baseline by improving encounter depth/readability rather than adding new chambers.
**Scope / Includes:**
- Better regular enemy telegraphing.
- Better regular enemy pacing / attack downtime.
- Clearer attack range/readability cues.
- Stronger hit/hurt feedback.
- One miniboss refinement pass.
- Limited combat visual productionization only where needed to support readability.
**Acceptance Criteria:** at least one regular enemy depth pass and one miniboss refinement pass land with clearer readable combat feedback, while preserving mobile portrait playability, desktop controls, current chamber progression, lore/cutscene flow, and deployment invariants.
**Dependencies:** Milestone 2 cohesion and presentation hardening.
**Do Not Expand Prematurely:** new chambers, giant new systems, full animation pipeline work, broad audio overhaul, puzzle expansion, multiple new enemy families at once, major UI redesign, or major progression rewrites.
**Status:** completed.
**Completion Notes:** Chamber 01 miniboss encounter now serves as the milestone miniboss refinement; Chamber 02 regular encounters and TOLL-KEEPER gate sequence provide the shipped regular-enemy readability/pacing pass; death/restart/reset and portrait/landscape playability remain stable through the full slice.

## Milestone 4 — Audio Identity Pass
**Purpose:** establish oppressive audio identity without overwhelming readability.
**Scope / Includes:** ambient bed, combat feedback SFX, lore transition audio treatment.
**Acceptance Criteria:** functional audio layering for chamber/gameplay/lore states.
**Dependencies:** stable lore-screen/state structure from Milestones 1–3.
**Do Not Expand Prematurely:** full soundtrack production.
**Status:** completed.
**Completion Notes:** the shipped Chamber 01 + Chamber 02 slice now includes chamber ambience, player footsteps/combat/death feedback, skitter/TOLL-KEEPER/miniboss cues, and lore/gate/banishment treatment; recent audio QA/polish is already reflected in the current baseline.

## Milestone 5 — Content Expansion
**Purpose:** extend the playable slice beyond the current Chamber 01 + Chamber 02 baseline.
**Scope / Includes:** next playable area/chamber progression using established control/combat/lore/audio patterns.
**Acceptance Criteria:** next content step is playable without regressing the current baseline quality bar. Chamber 03 first-pass sector-finale implementation now satisfies the first playable expansion step.
**Dependencies:** Milestones 1–4 stable.
**Do Not Expand Prematurely:** open-world structure, broad branching map, or new systems not required by the next playable area.
**Status:** next planned / active.

## Milestone 6 — Polish, Testing, and Release Slice
**Purpose:** stabilize and package a coherent release-quality vertical slice.
**Scope / Includes:** regression cleanup, performance/readability polish, deployment verification, final docs pass.
**Acceptance Criteria:** reproducible build/deploy success, stable input parity, milestone docs aligned with shipped behavior.
**Dependencies:** prior milestones substantially complete.
**Do Not Expand Prematurely:** new mechanics/content additions during stabilization.
**Status:** planned.
