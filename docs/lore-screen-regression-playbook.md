# Lore Screen Regression Playbook

Focused reference for lore-screen failures that look like art/layout problems but are actually scene-layer leaks.

## What failed
The Sector 2 Chamber 1 Black Aqueduct lore screen was not mainly broken by the lore image.
The actual failure was that chamber viewport blackout/mask/overlay behavior leaked into the lore presentation layer.
That leak produced a large blacked-out region shaped like the normal gameplay chamber viewing area.

## Symptoms
- A large black region covers part of the lore screen.
- The blackout shape resembles the normal gameplay viewport, chamber matte, or chamber viewing window.
- Lore text or image appears partially hidden even though the lore asset itself is valid.
- The bug can look like a bad crop, broken layout, or failed lore-art composition pass.
- Adding more lore panels may appear to help briefly while the underlying leak remains active.

## Root-cause class
This is a **scene-layer / viewport-matte / overlay leakage** problem.
It is not automatically a lore-image or text-layout problem just because the failure appears inside a lore screen.

## First things to compare
1. Compare the blacked-out region against the normal gameplay viewport in the originating chamber.
2. Compare the broken lore screenshot against the chamber's blackout, matte, mask, and overlay shapes.
3. Check whether the hidden area lines up with chamber-space presentation instead of lore-screen composition.

If the blacked-out region matches the gameplay viewport, suspect chamber overlay/mask leakage before suspecting lore art.

## Common offenders
Inspect the chamber scene and any transition wiring that can leave presentation state active:
- chamber viewport blackout graphics
- chamber mattes and masks
- chamber overlay rectangles or containers
- chamber-specific fade layers that survive scene transition
- screen-space masking or crop state not cleared before the lore scene appears
- shared HUD or presentation helpers that may stay active across the handoff

## Correct fix strategy
1. Confirm whether the blackout shape matches the gameplay viewport or chamber UI framing.
2. Identify the chamber-owned overlay, mask, matte, or blackout element that is still active during lore presentation.
3. Disable, clear, or properly scope that leaking chamber element at the transition boundary.
4. Re-test the lore screen before changing lore art, crop, or text layout.
5. Only tune lore composition after the chamber leak is removed and the lore layer is clean.

Do not keep reworking the lore image if the chamber viewport matte is still active.

## What not to do
- Do not assume a viewport-shaped blackout is a bad lore crop first.
- Do not keep piling new lore-screen panels, masks, or black rectangles into `LoreScreenScene` before checking chamber layer state.
- Do not treat the lore image as the main suspect when the blackout lines up with chamber framing.
- Do not patch presentation symptoms on top of a still-leaking chamber overlay.

## Fast checklist
- Does the blacked-out region match the gameplay viewport or chamber matte shape?
- Did a chamber blackout, mask, or overlay remain active into the lore transition?
- Did you inspect the originating chamber scene before editing lore composition?
- Did you remove the leaking chamber element first?
- Did you verify the lore screen again before adding any new lore-side panels or masks?

This is another example of: check the simple transition/layering contract first.
