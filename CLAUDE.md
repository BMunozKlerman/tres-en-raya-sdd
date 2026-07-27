# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## About This Repository

Assignment 1 of the Postgraduate Diploma in Software Engineering (DCC, Universidad de Chile):
a tic-tac-toe game with a web interface, built entirely using the SDD (Spec-Driven Development)
workflow of Spec Kit — `constitution → specify → plan → tasks → implement`. Team of 4.

Grading: process 60%, product 30%, presentation 10%. Spec quality, change traceability, and
correct agent use matter more than the code itself.

## Language Convention

All generated artifacts MUST be written in English:
`spec.md`, `plan.md`, `tasks.md`, `traceability.md`, `README.md`, file and folder names,
code identifiers, test names, commit messages, and code comments.

**Exception 1 — Game UI**: The player-facing game interface is shown in Spanish (the Class 6
demo is in Spanish). The code and tests that cover it remain in English.

**Exception 2 — Interface spec mapping**: `specs/003-interface/spec.md` MUST include a table
mapping the 5 mandatory interface criteria from the assignment (written in Spanish) to their
English CA-I-nn IDs, quoting the original Spanish text so the correspondence is auditable.

## Functional Requirements

**RF-1 Game modes**
- Human vs. human (same device).
- Human vs. agent.

**RF-2 Agent levels** (must be distinguishable in play, not just in code):
- **simple**: picks among legal moves without evaluating consequences; no memory.
- **medium**: wins if it can win this turn, blocks if the opponent would win next turn;
  remembers the current game.
- **complex**: never loses a classic game; has persistent memory across games.

**RF-3 Modes**
- **classic**: one piece per turn on an empty cell; draw when the board is full; win takes
  precedence over draw if both are detected on the ninth move.
- **continuous**: each player has exactly 3 pieces; there is a placement phase then a movement
  phase (move a piece to an empty cell); **no draw exists** in this mode.

**RF-4 Interface**
- Mode / level / piece / game-mode configuration before starting a game.
- Restart available at any time.
- Visible session scoreboard.

**Non-functional**
- The agent must respond in under 1 second at any level.
- README must allow running the project in 3 steps or fewer.
- Mouse-operable; full keyboard operation is a desirable goal, not mandatory.

## Process Rules — Non-Negotiable

1. **The spec is the source of truth.** Code, plan, and tasks are derived from it. No
   behavioral change starts by touching code directly.
2. **Spec-first debugging.** A bug is first reproduced as a failing test (that RED commit is
   pushed failing), diagnosed as an incomplete or wrong criterion, corrected in `spec.md`, and
   only then is the affected code regenerated. Never patch code by hand.
3. **Full coverage per criterion.** Every acceptance criterion (CA) must be covered by at least
   one test whose name contains the corresponding CA-ID.
4. **One commit per task**, with tests green before committing. No monolithic commits or squash:
   the commit history is the process evidence.
5. **Manual edits only for non-behavioral details** (UI text, CSS). Must be recorded in the
   manual-edits table in `README.md`.
6. **All AI usage outside the SDD flow must be declared in `README.md`.**

## Naming Conventions

- User story: `US-<area>-<n>`
- Acceptance criterion: `CA-<area>-<nn>`
- Task: `T-NNN`
- Commit: `T-NNN: description (CA-X-NN, ...)`
- Test: `describe('CA-X-NN', ...)`
- Areas: `M` engine · `A` agents · `I` interface · `N` non-functional

### EARS Format for Criteria

- `THE SYSTEM SHALL <response>`
- `WHEN <event>, THE SYSTEM SHALL <response>`
- `WHILE <state>, THE SYSTEM SHALL <response>`
- `IF <condition>, THEN THE SYSTEM SHALL <response>`
- `WHERE <feature>, THE SYSTEM SHALL <response>`

One criterion = one observable response. **Prohibited words (P4)**: *correctly, intuitive,
fast, reasonable, appropriate, user-friendly*. If the test assertion cannot be named in one
sentence, the criterion is ambiguous and must be rewritten.

## Stack and Architecture

- **Vite** + **JavaScript vanilla** (ES modules) + **Vitest**. No UI frameworks, no runtime
  dependencies.
- `src/engine.js` — pure engine: rules, modes, phases. No DOM.
- `src/agents.js` — pure agents (3 levels). No DOM.
- `src/ui.js` — rendering and event handling.

Dependency rule: UI depends on engine and agents; engine and agents **do not know about UI**.

Immutable state: an illegal move returns an error and leaves the state intact (no mutation).

```
state = {
  board: Array(9) of 'X' | 'O' | null,
  turn,
  mode,
  phase,
  piecesPlaced,
  result
}
```

### Contracts

- `legalMoves(state) -> Move[]`
- `applyMove(state, move) -> state' | {error, reason}`
- `chooseMove(state, level, memory) -> {move, memory'}` — deterministic.

## Work Sequence (Spec Kit)

One feature at a time, in this order: `001-engine → 002-agents → 003-interface`.

Per feature:
1. `/speckit-specify` → commit
2. `/speckit-clarify` → commit
3. `/speckit-plan` → commit
4. `/speckit-tasks` → `/speckit-analyze` → commit
5. `/speckit-implement` **one task per invocation** (never without arguments)

### Inside each `/speckit-implement`

1. Write the RED test with the CA-ID in the `describe`; show it fails.
2. Commit `test(...)` with the failing test.
3. Minimum production code to make it pass.
4. Full suite green.
5. Commit `T-NNN`.
6. Record in `traceability.md`: TaskID, CA-IDs covered, and the **real** SHA of the commit.
7. Stop and report. Do not chain the next task without explicit instruction.

## What NOT to Do

- Do not write production code outside `/speckit-implement`.
- Do not choose technology inside a spec (that goes in the plan).
- Do not describe algorithms (minimax, alpha-beta pruning, memoization) in the agents spec —
  the spec describes observable behavior; the technique goes in the plan.
- Do not patch a behavioral bug by hand.
- Do not add functionality that no criterion requests.
- Do not invent SHAs in `traceability.md`.
- Do not squash commits.
- Do not use `/speckit-implement` without arguments.
- If a task is insufficient or contradicts the spec: stop and report, do not improvise.

## Pending Group Decisions — BLOCKING

These questions directly affect how the engine and agents specs are written for continuous mode.
**While a row remains unresolved, do not advance on that part of the spec** — ask and stop,
never decide on your own.

| # | Question | Decision | Date |
|---|----------|----------|------|
| 1 | Movement phase: any empty cell or only adjacent? | _pending_ | |
| 2 | What happens if a position repeats indefinitely? | _pending_ | |
| 3 | Can a player return the next turn to the cell just vacated? | _pending_ | |
| 4 | Who opens the movement phase after the 6th placement? | _pending_ | |
| 5 | Do all 3 levels also play in continuous mode? | _pending_ | |
| 6 | "Persistent memory": browser session only or across reloads? | _pending_ | |
| 7 | How is memory observable if minimax already plays optimally without it? | _pending_ | |
| 8 | What does "optimal" mean in continuous mode, where the tree never ends and there is no draw? | _pending_ | |

## Current Status

- [x] `specify init` executed
- [ ] `/speckit-constitution` committed
- [ ] Spec 001-engine (specify/clarify/plan/tasks/analyze)
- [ ] Spec 002-agents (specify/clarify/plan/tasks/analyze)
- [ ] Spec 003-interface (specify/clarify/plan/tasks/analyze)
- [ ] `traceability.md` with real SHAs up to date
- [ ] README cold-tested (fresh clone, 3 steps or fewer)

### Session Log

- 2026-07-26: Repository initialized, CLAUDE.md created. 8 blocking decisions pending before
  running `/speckit-constitution`.
- 2026-07-26: Constitution v1.0.0 drafted (P1–P9). Language convention added: all artifacts
  in English; game UI in Spanish (Class 6 demo). spec-template.md adapted to EARS + CA-IDs.
