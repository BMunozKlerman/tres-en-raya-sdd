# Traceability Matrix: Game Engine

**Branch**: `001-engine` | **Date**: 2026-07-26

This matrix links every acceptance criterion to the task that covers it, the test that
verifies it, and the commit that delivers it. SHAs are filled in during implementation.
Do not invent SHAs — leave as `—` until the real commit exists.

Run `npm run verify:traceability` to check that no CA-ID is orphaned.

---

| CA-ID   | Task   | Test file                    | `describe` label                              | Commit SHA |
|---------|--------|------------------------------|-----------------------------------------------|------------|
| CA-M-01 | T-003 (RED), T-004 (GREEN) | us-m1-rules.test.js | `CA-M-01 — initial state`                     | 75be062cee902895ce300355ad8450ea59a5cdbe, b31e868e41d1170c5084b4af306026d1d4634619 |
| CA-M-02 | T-005 (RED), T-006 (GREEN) | us-m1-rules.test.js | `CA-M-02 — turn alternation`                  | a01df8e279977d700320780b5124f0bb3bc29942, 1db9c868a5de0e39fddc106606bd85c2c731f788 |
| CA-M-03 | T-005 (RED), T-006 (GREEN) | us-m1-rules.test.js | `CA-M-03 — legal placement`                   | a01df8e279977d700320780b5124f0bb3bc29942, 1db9c868a5de0e39fddc106606bd85c2c731f788 |
| CA-M-04 | T-009 (RED), T-010 (GREEN) | us-m1-rules.test.js | `CA-M-04 — illegal: occupied cell`            | 262c7f437acd4ff72f1ac07aa8689b98e75967b1, 3e73130cfa14e94df403f60434d0e4a0f7fb67d8 |
| CA-M-05 | T-007 (RED), T-008 (GREEN) | us-m1-rules.test.js | `CA-M-05 — illegal: wrong turn`                | 3744488d88544f5e331bcfc49b5d6cb6b943566d, 9bd617c74b80d6756ebb7fbcae5ccbb5fcb4d5e7 |
| CA-M-06 | T-007 (RED), T-008 (GREEN) | us-m1-rules.test.js | `CA-M-06 — illegal: game over`                 | 3744488d88544f5e331bcfc49b5d6cb6b943566d, 9bd617c74b80d6756ebb7fbcae5ccbb5fcb4d5e7 |
| CA-M-07 | T-027 (RED), T-028 (GREEN) | us-m1-rules.test.js | `CA-M-07 — illegal: opponent mark`             | c43fc3457a928d1ee72f143828d270684dc212d5, 8ebe682fd3fb82daf3df591336db8f55c913d06d |
| CA-M-08 | T-011 (RED), T-012 (GREEN) | us-m1-rules.test.js | `CA-M-08 — illegal: wrong phase`               | 3320ba035805df1e16e2cd5d012f5ba30bb2edcd, 8c8136f40db84107dccbc65a2e4dc45a2600ca38 |
| CA-M-09 | T-015 (RED), T-016 (GREEN) | us-m1-rules.test.js | `CA-M-09 — legalMoves in placement phase`      | 41f4b905bd39bcca6f3e0d65197fc8e1ad56a7f2, 2b567ceab345dbb4ca0a5a964679a228927ce00d |
| CA-M-10 | T-029 (RED), T-030 (GREEN) | us-m1-rules.test.js | `CA-M-10 — legalMoves in movement phase`       | 2c1b9e80cc6e142e60652be9c5b48198d9224937, 6b28fefeec54dbba060e31572f7eeb47ee79fc47 |
| CA-M-11 | T-015 (RED), T-016 (GREEN) | us-m1-rules.test.js | `CA-M-11 — legalMoves after game over`         | 41f4b905bd39bcca6f3e0d65197fc8e1ad56a7f2, 2b567ceab345dbb4ca0a5a964679a228927ce00d |
| CA-M-12 | T-017 (RED), T-018 (GREEN) | us-m2-results.test.js | `CA-M-12 — win detection all 8 lines`        | 7ff9ca65c4a7789c9fa587cdd0554f056cba5c2f, 65ee7787db24d7f23e86955b0a89b6bd9b44a2ec |
| CA-M-12 (amended: `winningLine`) | T-058 (RED), T-059 (GREEN) | us-m2-results.test.js | `CA-M-12 — win detection all 8 lines` (extended) | 71d9e29d588250cd6f9df939aa33af3f018b4613, cef0a5b25c62f45d84f56b3d345cbe1b5f602821 |
| CA-M-13 | T-019 (RED), T-020 (GREEN) | us-m2-results.test.js | `CA-M-13 — classic draw`                     | bdc0a947e4b48b754a1833de230ae2118be8923f, f781218e146e02808eb1bd5fb7e449859e331bf6 |
| CA-M-14 | T-019 (RED), T-020 (GREEN) | us-m2-results.test.js | `CA-M-14 — win over draw precedence`         | bdc0a947e4b48b754a1833de230ae2118be8923f, f781218e146e02808eb1bd5fb7e449859e331bf6 |
| CA-M-15 | T-021 (RED), T-022 (GREEN) | us-m3-phases.test.js  | `CA-M-15 — placement to movement transition` | f4a5f835ea23d0167b7531f41498aed401b76df7, 3c43205ed65bfa656e8b8d1ba335968d355dc3ae |
| CA-M-16 | T-023 (RED), T-024 (GREEN) | us-m3-phases.test.js  | `CA-M-16 — legal movement`                   | 2e6b82057639041143fda0f36ea636229b0d5514, 4f0e0c51c57d857a1a1c53895bc2465de037284e (fixture corrected by BUG-002, see below) |
| CA-M-17 | T-025 (RED), T-026 (GREEN) | us-m3-phases.test.js  | `CA-M-17 — no draw in continuous mode`       | 5582a0e816dee570d7bc8d857c2f51bbc2c1e641, 63655d61d7a416c677194bbd47156cc676e03419 |
| CA-M-18 | T-031 (RED), T-032 (GREEN) | edge-cases.test.js    | `CA-M-18 — illegal: empty source cell`       | 8e0008826dde261d7b4f1872018fd0c8ac039bac, 296fdadededf6b278bf7810b2e08ea4116339c59 |
| CA-M-19 | T-031 (RED), T-032 (GREEN) | edge-cases.test.js    | `CA-M-19 — illegal: occupied destination`    | 8e0008826dde261d7b4f1872018fd0c8ac039bac, 296fdadededf6b278bf7810b2e08ea4116339c59 |
| CA-M-20 | T-013 (RED), T-014 (GREEN) | us-m1-rules.test.js   | `CA-M-20 — illegal: placement during movement phase` | 410a9215bb3de246d3d8bf816753648d8e5ef8b8, 56a3ec6e4e0bc501080516d13e7052d5f92eff59 |

---

## Tooling Tasks (no CA-ID)

| Task  | Description | Commit SHA |
|-------|-------------|------------|
| T-001 | Add `verify:traceability` npm script | 0babcc66bdd5d51b64d6b12bc280d845b24471c1 |
| T-002 | Scaffold Vite/Vitest project | a6b09bd84731ec612abed1944c802ddf976073ab |

---

## Bug Fix Commits (process bugs, see `docs/bugs.md`)

| Bug | Description | Commit SHA |
|-----|-------------|------------|
| BUG-001 | `plan.md` corrected: restrict `verify-traceability` git-log matching to task-commit conventions | 706bafc1757db3f63b8b9ef95923d9e670fb8b8e |
| BUG-001 | `scripts/verify-traceability.mjs` regenerated to match the corrected plan | 809f0d8e5013642ba133a571685ec8de83742616 |
| BUG-002 | CA-M-16 (T-023) test fixture rewritten to a neutral movement — the original fixture completed a winning line once T-026 added the winner scan | bfe0a61a73ff5e1075491f796488b1f19baa74e4 |

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
