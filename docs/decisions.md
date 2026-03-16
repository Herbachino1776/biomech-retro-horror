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

## Lore Presentation Direction
- Lore is a core identity system, not optional garnish.
- Preferred pattern is now established: **discrete cinematic ritual lore-screen transitions** from gameplay.
- Chamber 01 first lore beat uses the Laughing Engine/furnace art as the first lore-screen prototype.
- Avoid generic always-on in-world overlay/dialogue as the long-term primary lore format.
- Lore writing remains cryptic, symbolic, and area-specific.

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
