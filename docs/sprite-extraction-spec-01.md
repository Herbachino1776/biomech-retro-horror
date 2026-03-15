# Sprite Extraction Spec 01

## Purpose
This document defines how first-pass concept art should be converted into gameplay-ready temporary sprite assets for the Milestone 1 vertical slice.

## Source Assets
- assets/concepts/player-concept-01.png
- assets/concepts/skitter-concept-01.png
- assets/concepts/sentinel-concept-01.png
- assets/concepts/laughing-engine-concept-01.png

## Goals
- Preserve silhouette clarity
- Favor gameplay readability over fine detail
- Create temporary sprite-ready stand-ins
- Avoid destructive edits to source concept art
- Keep derived assets separate from source art

## Output Locations
- assets/runtime/entities/
- assets/runtime/setpieces/

## General Rules
- Keep source concept PNGs unchanged
- Derived assets should be cropped from source art, not painted over
- Prefer transparent-background extracted subjects where practical
- Maintain aspect ratio
- Remove unnecessary empty margins
- Keep subject centered
- Use consistent naming
- Readability at small size is more important than preserving every detail

## Entity Targets

### Player
Output file:
- assets/runtime/entities/player-standin-01.png

Rules:
- Side-view or closest usable side-facing crop
- Full body visible
- Keep head, torso, forearms, boots readable
- Remove excess background
- Target readable in-game display height around 96–140 px

### Skitter Enemy
Output file:
- assets/runtime/entities/skitter-standin-01.png

Rules:
- Keep the full creature silhouette including legs
- Emphasize body shape and eye/head region
- Avoid overly tiny legs disappearing into noise
- Target readable in-game display height around 72–120 px

### Sentinel / Husk
Output file:
- assets/runtime/entities/sentinel-standin-01.png

Rules:
- Preserve tall silhouette
- Keep torso core and limb shape clear
- Avoid a muddy internal-detail crop
- Target readable in-game display height around 110–160 px

### Laughing Engine / Altar
Output file:
- assets/runtime/setpieces/laughing-engine-standin-01.png

Rules:
- Crop as environmental setpiece, not character sprite
- Preserve central face/altar/machine mass
- Keep threatening focal read from mid-distance
- Target display size suitable for chamber focal object

## Background / UI
No sprite extraction needed yet for:
- assets/concepts/chamber01-background-01.png
- assets/ui/biomech-ui-frame-01.png

These remain direct-use assets for now.

## Integration Rules
- Scene/entity code should prefer derived runtime stand-ins if they exist
- Fallback to source concept PNGs only if runtime stand-ins are absent
- Do not break the current playable vertical slice while integrating extracted stand-ins

## Acceptance Criteria
- Derived PNG files exist in the correct runtime folders
- Source concept art remains unchanged
- Runtime stand-ins load in-game
- Visual readability is improved compared with raw concept-art stand-ins
- Chamber 01 remains playable
