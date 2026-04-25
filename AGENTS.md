# AGENTS.md

## Purpose
This repository is a Phaser 3 + Vite retro biomechanical horror game. Keep work scoped, readable, and milestone-true.

## Default Workflow (Codex)
1. **Audit first.** For risky, ambiguous, or cross-system tasks, use Plan Mode first and read the relevant docs/code before editing.
2. **Use outcome-first prompts.** Prefer short task statements with explicit success criteria and constraints.
3. **Source of truth order:** live repo code + current docs > prior chat memory.
4. **Implement surgical changes.** Avoid broad rewrites when a narrow fix can satisfy the task.
5. **Validate.** Run available build/tests for meaningful changes.
6. **Ship discipline.** Commit changes and open a PR when tooling allows; if PR creation is unavailable, state why.

## Required Context Read (Before gameplay, controls, deployment, asset loading, UI/lore, or milestone-sequencing changes)
Read:
- `docs/current-milestone.md`
- `docs/milestone-roadmap.md`
- `docs/decisions.md`
- `docs/regressions-to-avoid.md`
- `docs/session-handoff.md`
- `docs/technical-invariants.md`
- `docs/art-direction-lock.md`

## Hard Guardrails
- Preserve **mobile portrait playability** (iPhone-sized) and **desktop keyboard parity**.
- Preserve GitHub Pages/Vite base-path behavior (`/biomech-retro-horror/` production, `/` local).
- Prefer **code/text-only changes** unless binary assets are explicitly provided/requested.
- Do not silently modify unrelated files.

## BRUTALITY / Boss Safety Rules
- Do **not** reopen BRUTALITY body/floor/collision logic unless the task directly requires it.
- Do **not** run global boss/floor/hurtbox rewrites without first proving one controlled pilot.
- For boss work, stabilize one-boss pilot first; migrate patterns globally only after that pilot is verified.

## Delivery Expectations
When executing a task:
- State goal and touched files.
- Keep diffs reviewable and minimal.
- Call out blockers/assumptions clearly.
- End with build/test verification.

## Definition of Done
Done means:
- matches current docs/milestone direction,
- runs without regression in core play/deploy contracts,
- remains understandable to future maintainers.
