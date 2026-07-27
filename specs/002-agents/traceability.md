# Traceability Matrix: Game Agents

**Branch**: `002-agents` | **Date**: 2026-07-27

This matrix links every acceptance criterion to the task that covers it, the test that verifies
it, and the commit that delivers it. Task IDs are filled in once `/speckit-tasks` generates
`tasks.md`; commit SHAs are filled in during `/speckit-implement`, one real SHA per commit. Do
not invent SHAs or task IDs — leave both as `—` until they exist.

Run `npm run verify:traceability` to check that no CA-ID is orphaned.

---

| CA-ID | Task | Test file | `describe` label | Commit SHA |
|-------|------|-----------|-------------------|------------|
| CA-A-01 | — | us-a1-legality.test.js | `CA-A-01 — simple: legal move in every mode × phase` | — |
| CA-A-02 | — | us-a1-simple.test.js | `CA-A-02 — simple: move independent of memory` | — |
| CA-A-03 | — | us-a1-legality.test.js | `CA-A-03 — medium: legal move in every mode × phase` | — |
| CA-A-04 | — | us-a1-medium.test.js | `CA-A-04 — medium: wins this turn when possible` | — |
| CA-A-05 | — | us-a1-medium.test.js | `CA-A-05 — medium: blocks a single next-turn threat` | — |
| CA-A-06 | — | us-a1-medium.test.js | `CA-A-06 — medium: move independent of prior-game memory` | — |
| CA-A-07 | — | us-a1-legality.test.js | `CA-A-07 — complex: legal move in every mode × phase` | — |
| CA-A-08 | — | us-a1-complex.test.js | `CA-A-08 — complex: never loses a classic game` | — |
| CA-A-09 | — | us-a1-complex.test.js | `CA-A-09 — complex: safe within the search horizon in continuous mode` | — |
| CA-A-10 | — | us-a1-complex.test.js | `CA-A-10 — complex: cheaper resolution on a memoized position` | — |
| CA-A-11 | — | us-a2-determinism.test.js | `CA-A-11 — medium: repeats its own decision` | — |
| CA-A-12 | — | us-a2-determinism.test.js | `CA-A-12 — complex: repeats its own decision` | — |
| CA-A-13 | — | us-a2-simulation.test.js | `CA-A-13 — complex never loses to simple over 20 games` | — |
| CA-A-14 | — | edge-cases.test.js | `CA-A-14 — single legal move returned at every level` | — |
| CA-A-15 | — | edge-cases.test.js | `CA-A-15 — medium prefers winning over blocking` | — |
| CA-A-16 | — | edge-cases.test.js | `CA-A-16 — medium blocks one of two simultaneous threats` | — |
| CA-N-01 | — | performance.test.js | `CA-N-01 — worst-case response time under 1000 ms` | — |

---

## Notes

- **Task column** (`T-???`): filled in after `/speckit-tasks` generates `tasks.md`.
- **Commit SHA column**: filled in after each `T-NNN` commit is pushed. Use the full
  40-character SHA or the unambiguous short form (≥ 8 chars), per `CLAUDE.md`'s process rules.
- A CA-ID with any `—` in the Task or Commit SHA column is not yet closed.
- `npm run verify:traceability` checks `spec.md`, `tasks.md`, test names, and git log — it does
  not read this file. This matrix is for human audit; the script is the gate.

---

## Group Decision CA-A-06 — evidence pattern (absence of behavior)

CA-A-06, as narrowed by group decision option C (`spec.md` Clarifications, `CLAUDE.md` session
log, 2026-07-27), is a decision of absence of behavior for the medium level: the module never
reads incoming `memory` at all, so a value carried over from a previous game structurally cannot
affect the returned move. This mirrors 001-engine's Group Decision D2 entry in
`specs/001-engine/traceability.md` — the criterion still gets a RED/GREEN test pair (unlike D2,
which had none), but the pair proves an absence (no code path reads `memory`), not a positive
mechanism. This note exists so a future audit does not mistake a trivially-passing CA-A-06 test
for an under-tested criterion.

## Search Horizon Calibration — confirmed at starting value

`plan.md`'s search-horizon section started `HORIZON_DEPTH` at 6 plies and described a calibration
procedure to run during the CA-A-09 / CA-N-01 implementation tasks. T-048 ran that procedure
against the CA-A-09 fixture (`tests/agents/us-a1-complex.test.js`, continuous mode, movement
phase, maximal branching for that phase) with a cold transposition table: ~12 ms, 12,603 nodes
evaluated — far under the ~700 ms threshold. `HORIZON_DEPTH` was left at 6; see `plan.md` §
Search Horizon for the full measurement log. CA-N-01's own calibration pass (T-055/T-056) is
independent and measures the same constant against its own worst-case positions.

## CA-N-01 — confirmation, no production code (T-056)

`tests/agents/performance.test.js` measures all 6 combinations (2 worst-case positions × 3
levels) with a cold transposition table; all passed on first run, well under the 1000 ms ceiling
(complex's worst measurement was ~12 ms — see the T-048 calibration log in `plan.md`). No change
to `HORIZON_DEPTH` was needed; it reconciles with T-048's independent calibration for CA-A-09,
both landing on the starting value of 6.

## CA-A-13 — corollary confirmation, no production code (T-054)

CA-A-13's 20-game simulation (`tests/agents/us-a2-simulation.test.js`) passed on first run, with
no change to `src/agents.js` — the perceptible-outcome confirmation of CA-A-08's exhaustive proof
(`spec.md`'s own note on CA-A-13), not a new implementation requirement. Same convention as
CA-A-14's T-052 note above.

## CA-A-14 — corollary confirmation, no production code (T-052)

CA-A-14's test (`tests/agents/edge-cases.test.js`) passed on first run, with no change to
`src/agents.js` — a direct consequence of CA-A-01/CA-A-03/CA-A-07's legality guarantee (every
level already returns a move drawn from `legalMoves(state)`) applied to a one-element array. Same
convention as `specs/001-engine/traceability.md`'s D3 sub-test note: the RED/GREEN pair exists so
CA-A-14 has its own commit citing its ID (P6), not because the behavior was ever missing.
