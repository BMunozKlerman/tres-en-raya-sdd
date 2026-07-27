# Bug Log

Process bugs found in this project's own tooling or artifacts (not gameplay bugs, which
follow the spec-first debugging flow in `CLAUDE.md` § Process Rules and are never patched
by hand). Each entry uses the format below; add new bugs at the top.

## Entry format

```
## BUG-NNN: <short title>

**Found**: <date> | **Status**: Fixed | Open | Won't fix

**Detection**: how the bug was noticed — what output or behavior looked wrong.

**Diagnosis**: the actual root cause.

**Fix**: what changed and where, with real commit SHAs (never invented — see CLAUDE.md
"Do not invent SHAs in traceability.md", same rule applies here).

**Result**: what was verified after the fix.
```

---

## BUG-003: `/speckit-analyze` found a derived artifact contradicting the ratified constitution

**Found**: 2026-07-27 | **Status**: Fixed

**Detection**: Running `/speckit-analyze` on `002-agents` (spec, plan, tasks, traceability, and
`contracts/agents-api.md` all complete, no code written yet) surfaced a CRITICAL finding: P2 of
`.specify/memory/constitution.md` (v1.0.0) states verbatim `chooseMove(state, level, memory) →
{move, memory'} — MUST be deterministic`, with no per-level qualification. `plan.md` and
`contracts/agents-api.md` had already declared a "contract change" — a 4-field `Decision` return
shape plus an optional `options` parameter, and a `simple` level that is intentionally
non-deterministic (uniform random pick, D-R-01) — but both documents only addressed superseding
`CLAUDE.md`'s informal sketch of the same contract, never the identical text embedded in the
constitution itself. `plan.md`'s Complexity Tracking section, where any exception to a principle
must be documented per Governance, was left empty ("No constitution violations").

**Diagnosis**: This is not a spec-first bug in the gameplay sense — no test was wrong and no
criterion was ambiguous. The root cause is procedural: the constitution is supposed to be the
highest artifact in the hierarchy (`Constitution > spec.md > plan.md > tasks.md > code`), but a
downstream artifact (`plan.md`) had drifted from it without going through the Amendment Procedure
(Governance § Amendment Procedure: issue with `governance` label, ≥3/4 approval, semver bump).
Two options were on the table: (a) document the mismatch as an exception in `plan.md`'s
Complexity Tracking section, or (b) amend the constitution itself, since it was the one asserting
a contract the project had already stopped honoring. The group chose (b): per Governance's own
rationale (constitution is the source of truth), leaving it stating something false is worse than
correcting it through the defined procedure.

**Fix**: `.specify/memory/constitution.md` amended to v2.0.0 (MAJOR — backward-incompatible
redefinition of an existing principle's normative contract): P2's `chooseMove` contract updated
to `(state, level, memory, options?) → {move, memory, nodesEvaluated, resolvedFromMemory}`, MUST
be deterministic narrowed to `medium`/`complex` only, with `simple`'s non-determinism (CA-A-02,
D-R-01) and the `nodesEvaluated`/`resolvedFromMemory` fields (D7) called out by name. A new
`SYNC IMPACT REPORT` addendum and a new "Amendment History" section under Governance record the
version change, the date, and the motivating decision (D7, `specs/002-agents/spec.md`). No
exception was added to `plan.md`'s Complexity Tracking — the constitution was corrected instead,
per explicit group instruction. Commit `f6a8c62798c595e634cd07b37105587ff4580f9e`.

Separately (not a constitution issue, but found in the same analysis pass): `tasks.md`'s original
T-047 bundled a new code layer (continuous-mode static evaluation + horizon cutoff, CA-A-09) with
an open-ended calibration loop, flagged as the task most likely to exceed a single commit. Split
into T-047 (implementation) and T-048 (calibration); every task after it renumbered by one
(23 → 24 tasks, T-034–T-057). Recorded in this same commit as this log entry.

**Result**: The constitution and `tasks.md` are internally consistent again — P2 now describes
the contract `plan.md`/`contracts/agents-api.md` already implement, and every criterion in
`spec.md` still maps to exactly one RED task and one GREEN task in `tasks.md` (verified by the
Coverage Audit table). No code exists yet for `002-agents`, so no `npm test`/`verify:traceability`
run was affected.

**Lesson**: a spec-first workflow's derived artifacts (`plan.md`, contracts) can legitimately
declare a "supersedes" note against an *informal* sketch like `CLAUDE.md`'s Contracts section, but
the same text living inside the *ratified constitution* is not informal — it is the artifact
Governance calls authoritative. `/speckit-analyze` should be run against the constitution
explicitly, not only against spec/plan/tasks consistency, whenever a plan declares any contract
change — the drift here existed for a full planning cycle before being caught.

---

## BUG-002: CA-M-16 test fixture (T-023) used a movement that completed a winning line

**Found**: 2026-07-26 | **Status**: Fixed

**Detection**: While implementing T-026 (winner scan in the movement path, CA-M-17), the
previously green D3 sub-test of `CA-M-16 — legal movement` (from T-023) broke: it started
returning `{error: true, reason: 'game_over'}` on its second `applyMove` call instead of a
new state.

**Diagnosis**: Unlike BUG-001, this is **not** a spec-first correction — the spec and the
engine were both correct. The defect was in the test fixture itself. T-023's `CA-M-16` test
used `reachMovementPhase()` (X at {0,2,4}, O at {1,3,5}, turn X) and then moved X from cell 0
to cell 6. Nobody checked, at the time that fixture was written, whether that move completed
one of the 8 fixed winning lines — it does: X ends up at {2,4,6}, the anti-diagonal. Before
T-026 existed, the movement path did not scan for a winner at all, so the test passed anyway,
for the wrong reason: it never exercised the "does this move complete a line" question it
implicitly assumed the answer to (no). Once T-026 added the winner scan the engine correctly
set `result: 'X'` after that move, and the D3 sub-test's next `applyMove` call — which assumed
the game was still ongoing — was correctly rejected with `game_over`.

**Fix**: `tests/engine/us-m3-phases.test.js` (`CA-M-16` describe block) rewritten to use a
neutral move (X from 0 to 7, landing at {2,4,7} — not one of the 8 lines) for both the base
"legal movement" test and the D3 return-to-vacated-cell sequence (X 0→7, O 1→6, X 7→0). Every
intermediate board in the new sequence was verified with a small brute-force script (checking
`result` against all 8 `WINNING_LINES` after each move) *before* the assertions were written,
the same discipline used for CA-M-17's states. Commit `bfe0a61`.

**Result**: `npm test` green again, 31/31, including both `CA-M-16` sub-tests and the CA-M-17
win-detection test added alongside T-026. No production code changed — only the test fixture.

**Lesson**: a test that passes before the behavior it exercises has been implemented may be
passing for the wrong reason. Winner-detection didn't exist yet when T-023 was written, so the
test's implicit assumption ("this move doesn't win") was never actually checked by anything —
it just happened to not matter yet. The fix in BUG-002's report for CA-M-17 (T-025) — verifying
against `WINNING_LINES` with a script before writing assertions — should be standard practice
for any fixture in movement-phase tests going forward, not just for CA-M-17.

---

## BUG-001: Traceability verifier accepted `docs:` commits as implementation evidence

**Found**: 2026-07-26 | **Status**: Fixed

**Detection**: After implementing T-001–T-010 and running `npm run verify:traceability`,
the orphan report showed `CA-M-15` and `CA-M-20` missing only from `tests` (not from
`git log`), even though neither criterion had any implementation or RED-test commit yet.
Every other unimplemented criterion (CA-M-07 through CA-M-19, excluding CA-M-15/CA-M-20)
correctly showed as missing from both `tests` and `git log`. The inconsistency was the tell:
two specific IDs looked "half traced" for no implementation reason.

**Diagnosis**: Step 4 of the verifier algorithm, as specified in `plan.md` §
"Traceability Verifier Design", was `git log --pretty=format:"%s" | extract /CA-M-\d+/` —
an unfiltered substring match over every commit subject in history. Two earlier `docs:`
commits happened to mention these IDs in passing while documenting the `/speckit-analyze`
corrections (one about fixing CA-M-15's redundancy in the spec, one about adding CA-M-20):
neither commit implemented anything, but the verifier could not tell the difference between
"this ID was implemented" and "this ID was merely typed in a commit message." The algorithm
was too permissive: it treated commit-subject substring presence as proof of coverage, when
the actual requirement (constitution P6) is proof of an implementing commit.

**Fix**:
- `specs/001-engine/plan.md` step 4 rewritten to filter `git log` subjects to only those
  matching `/^T-\d+:/` or `/^test\(.+\):/` (the task/RED commit-message conventions from
  `CLAUDE.md` § Naming Conventions) before extracting CA-IDs — commit `706bafc`.
- `scripts/verify-traceability.mjs` regenerated to match the corrected algorithm (added
  `TASK_COMMIT_RE` filter before the `extractIds` call on commit subjects) — commit `809f0d8`.
- Per constitution P3/P7, the plan was corrected first and the script regenerated from it
  second, in two separate commits — the tooling is held to the same spec-first discipline
  as game logic, not patched ad hoc.

**Result**: Re-running `npm run verify:traceability` after the fix shows `CA-M-15` and
`CA-M-20` correctly listed as `missing in: tests, git log`, consistent with every other
unimplemented criterion. `CA-M-01`–`CA-M-06` (implemented in T-003–T-010) remain correctly
absent from the orphan list. `npm test` unaffected (7/7 green throughout).
