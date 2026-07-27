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

## BUG-007: `001-engine`'s contract had no way to expose which line won, blocking a legitimate `003-interface` consumer

**Found**: 2026-07-27 | **Status**: Open (spec amended; implementation pending T-058/T-059)

**Detection**: While drafting `specs/003-interface/spec.md`'s CA-I-04 ("WHEN a player aligns
three marks, THE SYSTEM SHALL highlight the winning line..."), an audit during that feature's
`/speckit-clarify` asked: how does the UI know *which* three cells to highlight? Checking
`specs/001-engine/contracts/engine-api.md` and `data-model.md` showed `State.result` only ever
holds the winning mark (`'X'|'O'`) or `'draw'` — never a line reference — and `WINNING_LINES`,
the 8-line constant `applyMove` scans internally, is a module-private `const` in `src/engine.js`,
not exported.

**Diagnosis**: Not a bug in `001-engine`'s own behavior — every one of its 20 criteria was, and
remains, correctly implemented and tested. The gap is a contract completeness bug: `001-engine`
was specified and closed before any consumer needed to know *which* line won (only *that* a mark
won), so nothing in its spec, plan, or tasks ever required exposing it. The gap was invisible
until a second, legitimate consumer (`003-interface`) actually needed the information — the same
"looks fine until something outside the feature tries to use it" shape as BUG-006, but here the
missing piece is a data field, not tooling.

**Fix** (spec-side, this session): `specs/001-engine/spec.md`'s CA-M-12 amended to also set
`winningLine` (the winning line's three cell indices) on the returned state, alongside `result`
(no new CA-ID — per D9, both fields belong to the one response of a single `applyMove` call).
`data-model.md` and `contracts/engine-api.md` updated to match. Two new tasks appended to
`specs/001-engine/tasks.md` (T-058 RED, T-059 GREEN) to extend the existing CA-M-12 test and
implement the field in `src/engine.js`. `specs/003-interface/spec.md`'s CA-I-04 updated to cite
`state.winningLine` instead of describing a gap.

**Alternative considered and rejected**: have `src/ui.js` duplicate the 8-line array itself to
compute the winning line locally. Rejected because it would violate constitution P2 (UI consumes
the engine, does not reimplement its rules) and create a second copy of `WINNING_LINES` that
could silently drift from the engine's if that constant ever changed.

**Result**: Not yet verified — `winningLine` is documented but not implemented. This entry
remains **Open** until T-058/T-059 run through `/speckit-implement` and `npm run
verify:traceability` confirms CA-M-12's extended coverage. Will be updated to **Fixed** with
real commit SHAs at that point, per `CLAUDE.md`'s "do not invent SHAs" rule.

---

## BUG-006: `plan.md` claimed the traceability verifier already covered `002-agents`; it never did

**Found**: 2026-07-27 | **Status**: Fixed

**Detection**: While closing T-057 (traceability closure for `002-agents`), reading
`scripts/verify-traceability.mjs` before relying on its `OK: all 20 CA-IDs fully traced` output
showed the script was hardcoded end to end to `001-engine`: `SPEC_PATH`, `TASKS_PATH`, and
`TESTS_DIR` all pointed literally at `specs/001-engine/...` and `tests/engine/`, and its
`CA_ID_RE` was `/CA-M-\d+/g` — a pattern that cannot match `CA-A-*` IDs even if the paths had been
right. Every `npm run verify:traceability` run during this implementation session (T-034–T-056)
had therefore only ever re-checked `001-engine`'s already-closed 20 criteria; it never once
inspected `specs/002-agents/`, `tests/agents/`, or any `CA-A-*`/`CA-N-01` ID.

**Diagnosis**: Not a spec-first bug — `spec.md`'s CA-A-* criteria were all correctly written.
The defect was `specs/002-agents/plan.md`'s Constitution Check table (P6 row), which asserted:
"`scripts/verify-traceability.mjs` (built in `001-engine`) already scans any `CA-\d+` pattern
across specs/tasks/tests/git log; no change needed for the `CA-A-nn` prefix — ✅ Pass." That
sentence was written and marked "Pass" without re-reading the script it described, and it is
false in two independent ways at once (wrong regex, wrong paths). `/speckit-analyze` on
`002-agents` (2026-07-27, see BUG-003) did not catch this, and structurally could not have: it
cross-checks spec/plan/tasks/traceability/contracts/constitution *against each other* for
internal consistency — it has no step that executes or reads `scripts/verify-traceability.mjs`
itself to verify a claim made *about* the tool's behavior. The gap survived an entire planning
cycle and 23 implementation tasks because nothing in the process actually depended on the
script covering `002-agents` until T-057, the one task whose entire job is to run it.

**Fix**: `scripts/verify-traceability.mjs` generalized to iterate every `specs/<NNN-name>/`
directory containing both a `spec.md` and a `tasks.md` (skipping a feature that hasn't reached
`/speckit-implement` yet, rather than erroring), deriving each feature's tests directory from its
name (`NNN-name` → `tests/<name>`) and using the generic `CA-[A-Z]+-\d+` pattern. Reports per
feature (one block per `<featureDir>:`, so an orphan is immediately attributable), plus a final
combined total. Extraction of `SPEC_IDS`/`TASKS_IDS` was additionally tightened to only count a
`CA-ID` that opens a markdown table row (`| CA-X-NN | ...`): both spec files contain prose that
cites a sibling or cross-feature `CA-ID` in passing (`002-agents/spec.md` cites `CA-M-12` as a
parametrization example; `001-engine/spec.md` cites `CA-N-01` to explain why it isn't covered
there), and the original unfiltered substring match would have counted those mentions as if the
file were defining the criterion — a new class of false orphan that only appears once the script
reads text it was never pointed at before. `specs/001-engine/plan.md` § Traceability Verifier
Design amended with a note explaining the original design was `001-engine`-specific and recording
the generalization; `specs/002-agents/plan.md`'s P6 row corrected to stop asserting the false
claim and point at this entry instead.

**Result**: `npm run verify:traceability` now reports per feature — `001-engine: OK: all 20
CA-IDs fully traced` and `002-agents: OK: all 17 CA-IDs fully traced`, `OK: all 37 CA-IDs fully
traced across 2 feature(s)` overall. `npm test` unaffected throughout (63/63 green both before
and after this fix — this was a tooling-only change, no production or test code touched).

**Lesson**: same underlying pattern as BUG-003 and BUG-004, one level further out — a derived
artifact (`plan.md`) made a factual claim about a *shared tool's* behavior instead of about
spec/plan/tasks consistency, and no process step exists whose job is to verify claims of that
shape. `/speckit-analyze` checks artifacts against each other; it does not execute tooling to
confirm a plan's description of that tooling is accurate. Any future plan that asserts "no change
needed" about a piece of existing tooling should be treated as a claim requiring verification —
by reading or running the tool — before being marked "✅ Pass", not assumed true because a
previous feature already built the tool.

---

## BUG-005: T-046's CA-A-09 fixture was an unwinnable fork, not a fair test position

**Found**: 2026-07-27 | **Status**: Fixed

**Detection**: While implementing T-047 (continuous-mode minimax + horizon cutoff), running the
real search against T-046's committed CA-A-09 fixture (`O` owning `{0,1,6,7}` from an earlier
draft, later `{1,4,6}`) returned a move that still lost to the opponent's very next reply — for
every one of the 9 legal moves available to the complex level, minimax's own evaluation (verified
with a standalone debug script, both with and without a depth-preference tie-break on the
terminal scores) returned `LOSS_SCORE`. The real search agreed unanimously that the position was
lost no matter what; this was not a search bug.

**Diagnosis**: Not a spec-first bug — CA-A-09 itself is fine. The fixture was the defect. `O`'s
three pieces were chosen to form a threat at one cell (e.g. via line `[1,4,7]`), but the same
pieces also shared the center cell with a second, unnoticed pair on a different line (e.g.
`[2,4,6]`), producing two independent one-move wins for `O` on two different cells. A single `X`
move can occupy only one cell, so this is a genuine fork: unblockable in one ply, and (as
confirmed by the exhaustive search) unrecoverable within the horizon either. `plan.md`'s
calibration-position guidance explicitly calls for positions "with no immediate win or forced
loss present" precisely to avoid this — the fixture violated its own design constraint, and
nothing before T-047 actually ran a real search against it to catch that (T-046's RED check only
needed the naive stub to fail, which it did, for the wrong reason: any move loses, so the stub's
arbitrary first move losing proved nothing about blocking specifically).

**Fix**: Rebuilt the fixture from scratch with a documented, hand-verified single-threat
position (`O` at `{0,3,7}` with a movement-only threat completed by moving the piece at `7` to
`6`, keeping `0` and `3` in place; `X` at `{1,4,8}`) and checked by exhaustive enumeration of the
8 winning lines that no other 2-owned/1-empty pattern exists for either side before writing the
assertions — the same discipline BUG-002's fix established for `001-engine`'s movement-phase
fixtures. Verified with a standalone script that the real minimax search (a) finds a fully safe
move (blocking cell `6`) and (b) that this differs from the arbitrary first legal move in
`legalMoves` enumeration order, so the RED state before T-047 is a genuine test of the missing
search, not an artifact of an unwinnable position. `tests/agents/us-a1-complex.test.js` updated
in a commit separate from T-047's GREEN commit, T-046 itself left untouched (same convention as
BUG-002's T-023).

**Result**: Re-run against the committed T-046 stub: fails as expected (`moves[0]` doesn't block,
opponent wins). Re-run against the real T-047 search: passes, resolves in ~11 ms. `npm test`
green throughout except for the intentional RED window.

**Lesson**: same underlying lesson as BUG-002, now recurring for the agents feature — a
hand-built board fixture that involves 2+ marks of the same player on a shared line needs an
exhaustive check against all 8 winning lines (not just the one line the fixture author had in
mind) before it's trustworthy, especially once a mark sits on a highly-connected cell like the
center. This applies doubly to continuous-mode fixtures, where an unnoticed second threat doesn't
just make a test fixture wrong — it can make the *position itself* uncoverable by any level,
silently turning a "does the agent search correctly" test into "is this position lost," which is
a different and unintended question.

---

## BUG-004: `tasks.md`'s T-041 pseudocode described an algorithm that cannot satisfy CA-A-16

**Found**: 2026-07-27 | **Status**: Fixed

**Detection**: While implementing T-041 (medium block-next-turn), the pseudocode in `tasks.md`
was followed literally: for each candidate move, apply it, then check whether *any* of the
opponent's `legalMoves` on the resulting state would set `result` to the opponent's mark; return
the first candidate for which *none* do. The CA-A-16 test (double-threat fixture: two distinct
cells, each independently completing a line for the opponent) failed after this implementation —
`chooseMove` returned an arbitrary non-blocking cell instead of one of the two threat cells.

**Diagnosis**: Not a spec-first bug — `spec.md`'s CA-A-05, CA-A-15, and CA-A-16 were all correct
and unambiguous. The defect was in `tasks.md`'s implementation description: under a genuine
double threat, occupying one threatened cell never clears the other, so the opponent can always
still win through the remaining cell on their next turn. The condition "none of the opponent's
replies would set `result`" is therefore never true for *any* candidate once two or more real
threats exist, so the described two-ply lookahead always falls through to the arbitrary
`moves[0]` fallback — which has no reason to be a threat cell. The algorithm was never viable for
the double-threat case it was written to cover; single-threat (CA-A-05) worked only by
coincidence, since with exactly one threat, blocking it does make "none do" true.

**Fix**: `specs/002-agents/tasks.md`'s T-041 description rewritten to match the algorithm
actually implemented in `src/agents.js` (commit `c94095d`): a direct, single-ply check — for each
candidate move, ask whether that same cell, played by the opponent instead, would immediately set
`result` to the opponent's mark; return the first candidate for which it does. This blocks
whichever threat is encountered first by construction (CA-A-16, "blocks exactly one of those
opponent moves"), and is behaviorally identical to the discarded two-ply version whenever there is
only one threat (CA-A-05). A correction note was added directly under T-041 in `tasks.md`
explaining why the two-ply pseudocode was discarded. **CA-A-05, CA-A-15, and CA-A-16 in
`spec.md` did not change** — only the derived implementation-plan description did.

**Result**: `npm test` remained green throughout (the fix was applied before T-041's GREEN commit
was made, so no regression was ever committed); `tasks.md` and `src/agents.js` are now
consistent. `npm run verify:traceability` unaffected (still validates only `001-engine`'s 20
CA-IDs; `002-agents`'s `traceability.md` is filled at T-057).

**Lesson**: same pattern as BUG-003, one level lower in the artifact hierarchy — there,
`plan.md`/`contracts/agents-api.md` had drifted from the constitution; here, the actual
implementation correctly satisfies `spec.md` while `tasks.md`'s own suggested algorithm does not.
`tasks.md` pseudocode is a *plan*, not the spec — when an implementer finds it doesn't actually
satisfy the criterion it claims to cover, the fix is to correct the plan-level artifact (with a
note explaining why), not to force a non-viable algorithm into working, and not to weaken the
test until it passes.

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
