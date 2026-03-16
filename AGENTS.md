# AGENTS.md

## Project Role
You are implementing a retro horror game with a strict visual and gameplay identity. You must preserve tone, scope, and readability.

## Mandatory Pre-Change Context Read
Before changing gameplay, controls, deployment, asset loading, UI presentation, art integration, or lore presentation, you must read:
- `docs/current-milestone.md`
- `docs/decisions.md`
- `docs/regressions-to-avoid.md`
- `docs/art-direction-lock.md`
- `docs/technical-invariants.md`
- `docs/session-handoff.md`
- `docs/milestone-roadmap.md`

## Non-Negotiable Rules
1. Build the vertical slice before expanding scope.
2. Do not replace the art style with generic sci-fi, cyberpunk, zombie, or fantasy tropes.
3. Do not add systems that are not required by the current milestone.
4. Prefer simple, reliable implementations over complex architecture.
5. Keep the game playable in a browser.
6. Use placeholder shapes only when necessary, and label them clearly.
7. Keep all code modular and easy to inspect.
8. Do not silently rewrite unrelated files.
9. If a design choice is ambiguous, follow the docs rather than inventing a new direction.
10. Maintain oppressive pacing: avoid arcade chaos unless the milestone explicitly asks for it.
11. Preserve mobile playability on iPhone-sized browsers.
12. Preserve desktop keyboard support.
13. Fallback visuals should only be primary when textures truly fail to load.
14. GitHub Pages / Vite base-path behavior must not regress.
15. Prefer text/code changes unless binary changes are explicitly required.
16. Every meaningful task must end with a build verification step.
17. Treat regressions as failures to diagnose and fix, not as features to reimplement blindly.
18. Future art generation and integration must respect the locked palette and readability doctrine in `docs/art-direction-lock.md`.
19. Lore presentation is a major identity feature and should evolve toward discrete cinematic ritual presentation, not generic dialogue UI.

## Aesthetic Rules
- The world is biomechanical, ritualized, oppressive, and alien.
- UI must feel diegetic: grown, forged, ribbed, vertebral, or surgical.
- Favor strong silhouettes over noisy detail.
- Palette should remain constrained: bone, rust, oil-black, bruised metal, sickly green accents.
- Humor, when present, is cruel, alien, and understated.

## Technical Rules
- Default to Phaser 3 for implementation unless the repo already uses another engine.
- Optimize for iPhone-friendly browser play where practical.
- Keep render logic separate from gameplay logic.
- Put constants/config in dedicated files.
- Use descriptive filenames and comments.
- Avoid magic numbers when they affect tuning.

## Deliverable Style
When working on a task:
- summarize the goal
- list files you will touch
- implement only the scoped work
- note any blockers clearly

## Definition of Done
A task is done when:
- it matches the docs
- it runs without breaking existing play
- it is understandable by a non-expert human reviewing the repo
