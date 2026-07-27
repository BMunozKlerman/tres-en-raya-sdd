# Traceability Matrix: Game Engine

**Branch**: `001-engine` | **Date**: 2026-07-26

This matrix links every acceptance criterion to the task that covers it, the test that
verifies it, and the commit that delivers it. SHAs are filled in during implementation.
Do not invent SHAs — leave as `—` until the real commit exists.

Run `npm run verify:traceability` to check that no CA-ID is orphaned.

---

| CA-ID   | Task   | Test file                    | `describe` label                              | Commit SHA |
|---------|--------|------------------------------|-----------------------------------------------|------------|
| CA-M-01 | T-???  | us-m1-rules.test.js          | `CA-M-01 — initial state`                     | —          |
| CA-M-02 | T-???  | us-m1-rules.test.js          | `CA-M-02 — turn alternation`                  | —          |
| CA-M-03 | T-???  | us-m1-rules.test.js          | `CA-M-03 — legal placement`                   | —          |
| CA-M-04 | T-???  | us-m1-rules.test.js          | `CA-M-04 — illegal: occupied cell`            | —          |
| CA-M-05 | T-???  | us-m1-rules.test.js          | `CA-M-05 — illegal: wrong turn`               | —          |
| CA-M-06 | T-???  | us-m1-rules.test.js          | `CA-M-06 — illegal: game over`                | —          |
| CA-M-07 | T-???  | us-m1-rules.test.js          | `CA-M-07 — illegal: opponent mark`            | —          |
| CA-M-08 | T-???  | us-m1-rules.test.js          | `CA-M-08 — illegal: wrong phase`              | —          |
| CA-M-09 | T-???  | us-m1-rules.test.js          | `CA-M-09 — legalMoves in placement phase`     | —          |
| CA-M-10 | T-???  | us-m1-rules.test.js          | `CA-M-10 — legalMoves in movement phase`      | —          |
| CA-M-11 | T-???  | us-m1-rules.test.js          | `CA-M-11 — legalMoves after game over`        | —          |
| CA-M-12 | T-???  | us-m2-results.test.js        | `CA-M-12 — win detection all 8 lines`         | —          |
| CA-M-13 | T-???  | us-m2-results.test.js        | `CA-M-13 — classic draw`                      | —          |
| CA-M-14 | T-???  | us-m2-results.test.js        | `CA-M-14 — win over draw precedence`          | —          |
| CA-M-15 | T-???  | us-m3-phases.test.js         | `CA-M-15 — placement to movement transition`  | —          |
| CA-M-16 | T-???  | us-m3-phases.test.js         | `CA-M-16 — legal movement`                    | —          |
| CA-M-17 | T-???  | us-m3-phases.test.js         | `CA-M-17 — no draw in continuous mode`        | —          |
| CA-M-18 | T-???  | edge-cases.test.js           | `CA-M-18 — illegal: empty source cell`        | —          |
| CA-M-19 | T-???  | edge-cases.test.js           | `CA-M-19 — illegal: occupied destination`     | —          |
| CA-M-20 | T-???  | us-m1-rules.test.js          | `CA-M-20 — illegal: placement during movement phase` | —   |

---

## Notes

- **Task column** (`T-???`): filled in after `/speckit-tasks` generates `tasks.md`.
- **Commit SHA column**: filled in after each `T-NNN` commit is pushed. Use the full
  40-character SHA or the unambiguous short form (≥ 8 chars).
- A CA-ID with any `—` in the SHA column is not yet closed.
- `npm run verify:traceability` checks spec.md, tasks.md, test names, and git log — it
  does not read this file. This matrix is for human audit; the script is the gate.

---

## Group Decision D2 — no task, by design

Group decision D2 (`spec.md § Design Decisions`) states: "the game continues; no repetition
rule, no penalty" when a board position repeats indefinitely in continuous mode. This decision
has **no RED/GREEN pair** anywhere in `tasks.md` and is not expected to. D2 documents the
*absence* of a behavior (the engine deliberately implements no repetition check), so there is
no observable response to test-drive — a test asserting "no rule fires" would be vacuous and
would not distinguish "correctly absent" from "not yet built". The evidence for D2 is negative:
no code in `src/engine.js` ever inspects move history or rejects a move for repeating a prior
position, and no criterion in `spec.md` requires it to. This entry exists so a future audit
does not read the absence of a D2 task as an orphaned decision.

## Group Decision D3 — evidence

Group decision D3 ("a player may return the next turn to the cell just vacated — allowed")
is exercised by a dedicated test inside the CA-M-16 pair: `tests/engine/us-m3-phases.test.js`,
second `it` block of `describe('CA-M-16 — legal movement', ...)` (see `tasks.md` T-023). The
test moves a mark away from a cell, applies an unrelated opponent move, then moves the same
mark back into the cell it vacated, and asserts the move is accepted. This is the concrete
evidence that D3 is implemented, not merely implied by the absence of a restriction.

## CA-M-17 — documented test-strategy limitation

CA-M-17 ("no draw ever occurs in continuous mode") is a universal claim over an unbounded
state space: continuous mode has no draw and, per D2, no termination by repetition, so the
game tree is not finite. The test in T-025 (`tests/engine/us-m3-phases.test.js`) checks this
property exhaustively over **all legal moves from 3 hand-built movement-phase states**
("balanced", "near-win", "constrained").

**What the test demonstrates**: for those 3 specific positions, every legal movement available
from `legalMoves(state)` produces a result that is either `null` or a player mark — never
`"draw"`. It also demonstrates that the implementation has no code path that assigns `"draw"`
outside the classic-mode branch (verified by code review of T-026's diff, not by the test
itself).

**What the test does not demonstrate**: that no reachable continuous-mode position, out of the
full combinatorial state space, could ever produce `"draw"`. Three sampled states are not a
proof over an unbounded tree. This limitation is accepted deliberately (2026-07-26): the
criterion is left as written in `spec.md` rather than rewritten into something narrower and
easier to test exhaustively, because the narrower version would describe an implementation
detail (e.g. "the draw branch is gated by `mode === 'classic'`") instead of the observable
player-facing guarantee the assignment actually asks for. The gap between claim and test
coverage is recorded here instead of hidden.
