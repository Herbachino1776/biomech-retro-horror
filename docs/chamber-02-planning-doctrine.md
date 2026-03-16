# Chamber 02 Planning Doctrine (Pre-Implementation)

This document defines the **narrow target** for Chamber 02 so the next implementation pass can execute without visual, gameplay, or lore drift.

Status: planning-only. **Do not implement Chamber 02 systems from this doc yet.**

## Scope Guard
- Chamber 02 planning is a continuity artifact for future Milestone 5 content work, not permission to expand current Milestone 2 execution scope.
- Chamber 01 remains the active playable baseline and quality bar.
- Chamber 02 should reuse established patterns (controls, deployment safety, texture-first loading, cinematic lore cadence) instead of introducing broad new architecture.

## 1) Gameplay Purpose
Chamber 02 is the first "continuation chamber" whose purpose is to validate that the Chamber 01 loop can be repeated in a new space while preserving oppressive pacing and readability.

Gameplay purpose in practice:
- reinforce deliberate movement/combat spacing, not swarm chaos,
- reward observation and approach timing,
- stage one clearly telegraphed escalation beat after the player has already learned Chamber 01 basics.

## 2) Visual Identity
Chamber 02 should read as a deeper ritual stratum of the same world-language, not a style reset.

Mandatory morphology and material language:
- alien dinosaur-like fossil forms (triceratops/cyclops/T-rex hybrid influence),
- vertebral segmentation and horn-driven silhouettes,
- obsidian-dark fossil bone fused with rusted biomechanical mass,
- sparse sickly-green accents only for signal moments.

Avoid:
- human skull collage as dominant motif,
- neon sci-fi/cyberpunk glow language,
- noisy high-frequency detail that reduces play readability.

## 3) Relationship to Chamber 01
Chamber 02 is a **continuation**, not a replacement.

Continuity requirements:
- maintain Chamber 01 scale logic (monumental, ancient, oppressive),
- preserve interactable readability conventions established by Chamber 01 shrine/lore affordances,
- preserve readable floor/wall value grouping so combat silhouettes stay legible,
- preserve the same control feel and scene-flow expectations (no sudden genre shift).

Differentiation rule:
- Chamber 02 should feel more "spinal" and processional than Chamber 01, while staying in the same palette and biomechanical doctrine.

## 4) Focal Monument / Setpiece
Primary setpiece: **The Vertebral Horn Gate**.

Design intent:
- a colossal ribbed gate structure formed by interlocked horn arcs and stacked vertebrae,
- central cyclopean cavity/oculus that reads as a dormant sensory organ,
- rusted metal ligament braces fused into fossil-black bone mass.

Gameplay role:
- persistent orientation anchor visible from multiple chamber positions,
- symbolic ritual threshold tied to the chamber's lore beat,
- never so detailed that it obscures player/enemy silhouettes.

## 5) Encounter Rhythm
Target rhythm: **approach tension → short violent check → recovery/examination → second commitment check**.

Practical encounter cadence:
1. Quiet entry lane that establishes monument framing.
2. First enemy pressure beat in a readable lane (single-threat emphasis).
3. Brief decompression space with visual foreshadowing near the monument.
4. Second pressure beat near/under the gate with slightly higher commitment demand.

Rhythm constraints:
- keep encounter count low and readable,
- favor telegraphed danger over volume spam,
- preserve heavy, deliberate tempo aligned with existing combat direction.

## 6) Lore Beat
Chamber 02 lore beat should reveal doctrine, not exposition-dump plot.

Narrative function:
- frame the Vertebral Horn Gate as a selective ritual organ that "remembers" bone lineage,
- imply that passage requires resonance/recognition rather than simple mechanical unlocking,
- deepen dread through symbolic language and omission.

Presentation constraints:
- use the established discrete cinematic lore-screen pattern,
- keep text cryptic, concise, and area-specific,
- preserve diegetic shrine/ossuary interaction framing in-world.

## 7) New Idea Chamber 02 Introduces
Single new idea: **Ritual Alignment Readability**.

Definition:
- the chamber composition should teach that architecture itself communicates state through silhouette alignment (horn arcs, vertebral stacks, oculus framing), even before any future mechanic is added.

Scope discipline:
- this is a presentation/level-language idea first,
- do not add net-new gameplay systems just to "sell" this concept during initial Chamber 02 implementation.

## 8) Invariants from Chamber 01 Foundations
The following are mandatory carry-overs:

1. Browser playability with Phaser + Vite deployment assumptions intact.
2. GitHub Pages base-path safety and centralized asset key/URL mapping.
3. Mobile controls fixed to screen space with portrait/landscape usability.
4. Desktop keyboard parity preserved.
5. Texture-first rendering remains primary; fallback visuals remain failure-only.
6. Chamber readability at gameplay distance takes priority over art detail density.
7. Lore delivery remains discrete cinematic ritual transitions, not generic always-on dialogue.
8. Lore trigger affordances remain diegetic shrine/ossuary forms, not debug markers.
9. Oppressive pacing remains deliberate; avoid arcade-speed swarm escalation.

## Implementation Hand-off Checklist (for future Chamber 02 pass)
- Confirm milestone allows Chamber 02 implementation work.
- Define Chamber 02 asset batch in playbook priority order (interactable readability → orientation surfaces → depth silhouettes → identity anchor).
- Keep one focal setpiece (Vertebral Horn Gate) visually dominant.
- Validate readability on iPhone-sized portrait plus desktop.
- Run `npm run build` before merge.
