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

## Milestone 3 — Encounter Expansion (Sentinel / Laughing Engine)
**Purpose:** extend threat depth using existing loop foundations.
**Scope / Includes:** evolve Sentinel/Laughing Engine into fuller encounter behavior with readable telegraphing and pacing.
**Acceptance Criteria:** at least one expanded encounter loop lands without regressing input/readability/deployment invariants.
**Dependencies:** Milestone 2 cohesion and presentation hardening.
**Do Not Expand Prematurely:** multi-boss ecosystem or broad content volume expansion.
**Status:** planned.

## Milestone 4 — Audio Identity Pass
**Purpose:** establish oppressive audio identity without overwhelming readability.
**Scope / Includes:** ambient bed, combat feedback SFX, lore transition audio treatment.
**Acceptance Criteria:** functional audio layering for chamber/gameplay/lore states.
**Dependencies:** stable lore-screen/state structure from Milestones 1–2.
**Do Not Expand Prematurely:** full soundtrack production.
**Status:** planned.

## Milestone 5 — Second Area / Content Expansion
**Purpose:** prove repeatability of slice systems in a second environment.
**Scope / Includes:** second chamber/area using established control/combat/lore patterns.
**Acceptance Criteria:** second area is playable without regressing Milestone 1 quality bar.
**Dependencies:** Milestones 1–4 stable.
**Do Not Expand Prematurely:** open-world structure or large branching map.
**Status:** planned.

## Milestone 6 — Polish, Testing, and Release Slice
**Purpose:** stabilize and package a coherent release-quality vertical slice.
**Scope / Includes:** regression cleanup, performance/readability polish, deployment verification, final docs pass.
**Acceptance Criteria:** reproducible build/deploy success, stable input parity, milestone docs aligned with shipped behavior.
**Dependencies:** prior milestones substantially complete.
**Do Not Expand Prematurely:** new mechanics/content additions during stabilization.
**Status:** planned.
