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
| CA-A-01 | T-034 (RED), T-035 (GREEN) | us-a1-legality.test.js | `CA-A-01 — simple: legal move in every mode × phase` | 22468b3428e4b2993cdb318ffeb598e810fa99f4, 49b5f886b2f9207e458f19e14b7b905efb419e8a |
| CA-A-02 | T-034 (RED), T-035 (GREEN) | us-a1-simple.test.js | `CA-A-02 — simple: move independent of memory` | 22468b3428e4b2993cdb318ffeb598e810fa99f4, 49b5f886b2f9207e458f19e14b7b905efb419e8a |
| CA-A-03 | T-036 (RED), T-037 (GREEN) | us-a1-legality.test.js | `CA-A-03 — medium: legal move in every mode × phase` | 42fe3812bbf8de71fee86c794a986379634d849c, 91653fda01302a997022847eac03a81e17b86cf6 |
| CA-A-04 | T-038 (RED), T-039 (GREEN) | us-a1-medium.test.js | `CA-A-04 — medium: wins this turn when possible` | 50ef0bdc7fcb1deee2c2d5a44b9d39057a66f156, 27276ecc117d22fb48047c03f7523ece5803352e |
| CA-A-05 | T-040 (RED), T-041 (GREEN) | us-a1-medium.test.js | `CA-A-05 — medium: blocks a single next-turn threat` | a9b8ab12f596cf6dde3acf7c4944c34793a09bdc, c94095dc71ae784799e82568434a5f66368f14b3 |
| CA-A-06 | T-036 (RED), T-037 (GREEN) | us-a1-medium.test.js | `CA-A-06 — medium: move independent of prior-game memory` | 42fe3812bbf8de71fee86c794a986379634d849c, 91653fda01302a997022847eac03a81e17b86cf6 |
| CA-A-07 | T-042 (RED), T-043 (GREEN) | us-a1-legality.test.js | `CA-A-07 — complex: legal move in every mode × phase` | 0461a0fcbafefb9edbcf8283375ae3bd0ea78655, 12942baf888828eb5b556fe421cba9c656f15b3b |
| CA-A-08 | T-044 (RED), T-045 (GREEN) | us-a1-complex.test.js | `CA-A-08 — complex: never loses a classic game` | 0f263120b48d890d66988d2d12066f6cd379bc0c, 4ab6b2d089b0bcab65ebbb8adb11d05c39123636 |
| CA-A-09 | T-046 (RED), T-047 (GREEN), T-048 (GREEN) | us-a1-complex.test.js | `CA-A-09 — complex: safe within the search horizon in continuous mode` | 4ad5d28fabec845979984f3b2b526b6704fa908c, 71bfaafc0229e9f8940a374ec5ac3cafcba8564e, 395ccf5202bdd7f4da9581638bc2c94ebc1cd011 (fixture corrected by BUG-005, see below) |
| CA-A-10 | T-049 (RED), T-050 (GREEN) | us-a1-complex.test.js | `CA-A-10 — complex: cheaper resolution on a memoized position` | 1b3f8ca98090ca1d4ce045122e94432608c96238, c32008dc2414df8537a01382bf952bb2d00f4606 |
| CA-A-11 | T-036 (RED), T-037 (GREEN) | us-a2-determinism.test.js | `CA-A-11 — medium: repeats its own decision` | 42fe3812bbf8de71fee86c794a986379634d849c, 91653fda01302a997022847eac03a81e17b86cf6 |
| CA-A-12 | T-042 (RED), T-043 (GREEN) | us-a2-determinism.test.js | `CA-A-12 — complex: repeats its own decision` | 0461a0fcbafefb9edbcf8283375ae3bd0ea78655, 12942baf888828eb5b556fe421cba9c656f15b3b |
| CA-A-13 | T-053 (RED), T-054 (GREEN, no code change) | us-a2-simulation.test.js | `CA-A-13 — complex never loses to simple over 20 games` | 60249738a5c87842e2347af715f9805057033982, 30e8ad4b9bc5c79076c1252c04afe2db226828a0 |
| CA-A-14 | T-051 (RED), T-052 (GREEN, no code change) | edge-cases.test.js | `CA-A-14 — single legal move returned at every level` | aa8083ff6ed64e5ef739e69c670882257f917d4f, e5211e125b848e62fc63592b2629b574a0772994 |
| CA-A-15 | T-040 (RED), T-041 (GREEN) | edge-cases.test.js | `CA-A-15 — medium prefers winning over blocking` | a9b8ab12f596cf6dde3acf7c4944c34793a09bdc, c94095dc71ae784799e82568434a5f66368f14b3 |
| CA-A-16 | T-040 (RED), T-041 (GREEN) | edge-cases.test.js | `CA-A-16 — medium blocks one of two simultaneous threats` | a9b8ab12f596cf6dde3acf7c4944c34793a09bdc, c94095dc71ae784799e82568434a5f66368f14b3 |
| CA-N-01 | T-055 (RED), T-056 (GREEN, no code change) | performance.test.js | `CA-N-01 — worst-case response time under 1000 ms` | b9fa7092a54540126bb3ccb63b6a5706e2290964, 565d7b22c1899e29f8f4d21096b3bd60251b5a0c |

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
