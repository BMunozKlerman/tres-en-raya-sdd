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
