# Chamber 02 First Integration Pass (Conservative)

Status: completed as a bounded planning + asset wiring pass.

## Scope
This pass intentionally avoids full Chamber 02 gameplay/scene implementation. It establishes safe groundwork while preserving Chamber 01 as the only active playable chamber.

## Raw source assets inspected
- `art/raw/chamber02/vertebral_horn_gate_01_source.png` (1024x1536)
- `art/raw/chamber02/chamber02_background_plate_01_source.png` (1024x1536)
- `art/raw/chamber02/chamber02_floor_strip_01_source.png` (1536x1024)
- `art/raw/chamber02/foreground_vertebral_horn_arch_01_source.png` (1536x1024)
- `art/raw/chamber02/ritual_alignment_landmark_01_source.png` (1024x1536)

Raw files remain in place and are treated as source inputs.

## Production-facing naming plan
Planned production targets (not yet materialized as finalized processed binaries):
- `assets/chambers/chamber02/vertebral-horn-gate-01.png`
- `assets/chambers/chamber02/chamber02-background-plate-01.png`
- `assets/chambers/chamber02/chamber02-floor-strip-01.png`
- `assets/chambers/chamber02/foreground-vertebral-horn-arch-01.png`
- `assets/chambers/chamber02/ritual-alignment-landmark-01.png`

## First-pass integration decisions
### Wired now (asset pipeline only)
- Vertebral Horn Gate
- Chamber 02 Background Plate
- Chamber 02 Floor Strip
- Foreground Vertebral Horn Arch
- Ritual Alignment Landmark

Wired means: centralized asset keys + URL mapping + boot preload are in place.

### Scaffolded / deferred for scene placement
- `foreground_vertebral_horn_arch_01_source.png`
  - Deferred for world placement to avoid early foreground occlusion/readability regressions.
- `ritual_alignment_landmark_01_source.png`
  - Placement deferred until the Chamber 02 lane/interactable route is locked.

### Caution notes (from doctrine)
- Do not overcommit to strict mirror-symmetry or centered vertical-beam framing as always-on composition rules.
- Use assets for silhouette, processional tone, and material language first.
- Preserve gameplay readability and low-frequency value separation before adding detail-heavy layering.

## Clean next implementation step
Create a minimal `Chamber02Scene` art blockout using only:
1. background plate,
2. floor strip,
3. vertebral horn gate.

Then run iPhone-portrait and desktop readability validation before introducing foreground arch and ritual landmark placements.
