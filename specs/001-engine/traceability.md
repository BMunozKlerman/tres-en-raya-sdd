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

---

## Notes

- **Task column** (`T-???`): filled in after `/speckit-tasks` generates `tasks.md`.
- **Commit SHA column**: filled in after each `T-NNN` commit is pushed. Use the full
  40-character SHA or the unambiguous short form (≥ 8 chars).
- A CA-ID with any `—` in the SHA column is not yet closed.
- `npm run verify:traceability` checks spec.md, tasks.md, test names, and git log — it
  does not read this file. This matrix is for human audit; the script is the gate.
