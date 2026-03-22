# Decisions

Concise record of technical/design decisions currently in force.

## Engine + Runtime
- Phaser 3 + ES modules is the game runtime baseline.
- Vite is the dev/build toolchain.
- Browser play is the primary target (mobile-first without dropping desktop keyboard).

## Deployment
- Deploy as GitHub Pages **project site**.
- Vite production base path stays `/biomech-retro-horror/`.
- Local dev base path stays `/`.
- Scene/asset paths must remain base-path-safe (no ad-hoc absolute URL regressions).

## Controls + Input
- Maintain dual input: mobile touch + desktop keyboard.
- Mobile controls are always fixed to screen space (`scrollFactor(0)`), never world-space.
- Mobile controls layout must remain reliable in both portrait and landscape, with controls/hit areas aligned.
- Portrait layout may reserve a lower control band to keep touch UI visible/reliable.
- Mobile interact button can context-switch for lore/restart confirm flows.

## Asset Loading + Fallback
- Use centralized asset keys and URL mapping.
- Loaded textures/concept assets are the primary visual path.
- Fallback primitives are resilience-only when textures fail/miss.
- Do not let fallback presentation silently become the default art path.

## Combat Feel Direction (Near-Term)
- Combat direction is **slower, heavier, and more deliberate**, closer to a simplified Souls-like rhythm than a fast arcade brawler.
- Future tuning should prioritize weighty attack commitment windows and readable recovery.
- Future expansion should introduce stamina + evade timing carefully (without overcomplicated systems).
- Target loop direction: attack → spend stamina → reposition/avoid enemy attack → regain stamina → attack again.

## Environment Scale Direction
- Chamber presentation should preserve a **massive, ancient, alien, ritual monument** feeling.
- Do not casually compress camera/layout into cramped small-room framing during readability tweaks.

## Gameplay Scope + Milestone Flow
- Vertical-slice-first development is mandatory.
- Milestone 1 is complete and remains the current shipped baseline.
- Chamber 01 remains the current playable foundation; do not destabilize this loop while expanding.
- Prefer small reliable fixes over architecture expansion.
- Regressions must be diagnosed/fixed at root cause, not “reimplemented differently” without reason.
- Milestone 2 is complete and established the current Chamber 01 + Chamber 02 progression/lore baseline.
- Milestone 3 was defined as **Encounter Expansion + Combat Readability** and is now complete for the shipped Chamber 01 + Chamber 02 slice.
- Milestone 3 implementation landed in the intended order: regular enemy encounter depth pass first, miniboss refinement second, limited combat presentation support third.
- Milestone 4 (**Audio Identity**) is complete for the shipped Chamber 01 + Chamber 02 slice.
- Milestone 5 (**Content Expansion**) is now the active milestone.
- Major chamber expansion should be implemented in milestone slices rather than one oversized pass.

## Chamber Progression Doctrine
- Chamber 03 is the planned **Ossuary Choir Hall** and Bucket 01 sector finale.
- Chamber 03 contains the first true boss and closes the opening dead-god palace / laughing-engine / subterranean biomech necropolis thread.
- All future chambers should aim for **Chamber-03-level consequence, length, and complexity** even when their implementation is chunked.
- Every future chamber should include substantial encounter design plus a climax entity: miniboss, elite/high-level enemy, or true boss.
- Chambers should differentiate through art/theme, trigger placement, pacing, enemy placement, and climax tier rather than by lowering stakes.
- Chamber 02 -> Chamber 03 continuity should use a real gate/progression-object transition, not a fragile lore-screen-only handoff.

## Lore Presentation Direction
- Lore is a core identity system, not optional garnish.
- Preferred pattern is now established: **discrete cinematic ritual lore-screen transitions** from gameplay.
- Chamber 01 first lore beat uses the Laughing Engine/furnace art as the first lore-screen prototype.
- Chamber 02 lore now runs through the reusable `LoreCutsceneScene` + `LORE_CUTSCENES` configuration path.
- Future chamber lore beats should plug into that same cutscene path by swapping art/text/style config only, not by adding new lore-scene architecture.
- Avoid generic always-on in-world overlay/dialogue as the long-term primary lore format.
- Lore writing remains cryptic, symbolic, and area-specific.
- Lore screens must preserve source image aspect ratio; fit/crop in frame rather than stretching.
- Per-screen layout overrides are allowed when one global composition harms portrait readability.
- Chamber 02 post-lore doctrine is conservative state reaction: visible environmental shift + at least one threat activation, with no broad new system.

## Lore Trigger Presentation Direction
- Preferred lore trigger affordance is an **in-world ritual shrine / ossuary-style interactable**.
- Avoid debug-style floating “LORE” marker boxes as the visible player-facing pattern.

## Lore Planning Input Rule
- When the user provides new lore/worldbuilding direction in planning chats, incorporate relevant points into doctrine docs before major implementation passes.
- This is a continuity rule, not permission for random scope expansion.

## Merged main + branch baseline
- When branch/main guidance differs, preserve accepted deployment/mobile-control fixes from main and accepted milestone-polish tuning from the active branch.

## Workflow Constraints
- Before touching gameplay/controls/deployment/asset loading/UI/art/lore, read the doctrine docs.
- Prefer text/code changes unless binary edits are explicitly required.
- End meaningful tasks with build verification (`npm run build`).
