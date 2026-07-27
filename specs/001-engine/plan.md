# Implementation Plan: Game Engine

**Branch**: `001-engine` | **Date**: 2026-07-26 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-engine/spec.md`

## Summary

Pure ES-module engine (`src/engine.js`) that enforces all 19 acceptance criteria for
classic and continuous tic-tac-toe. The engine is a deterministic state machine with no
side effects: every operation receives an immutable state and returns either a new state
or a structured error. The first implementation task is the traceability verifier
(`scripts/verify-traceability.mjs`), which must be green before any game logic is merged.

## Technical Context

All decisions below are fixed by constitution P1 and P2 (see `CLAUDE.md`). No redesign.

**Language/Version**: JavaScript ES2022, ES modules (`.js`, `import`/`export`)
**Primary Dependencies**: Vitest 1.x (devDependency); Vite 5.x (devDependency, UI features)
**Storage**: N/A — pure in-memory state; no persistence in this feature
**Testing**: Vitest, `environment: 'node'` (no DOM required for engine)
**Target Platform**: Node.js 20 LTS (scripts, tests); modern browser (UI, future feature)
**Project Type**: Pure library module (no CLI, no server, no framework)
**Performance Goals**: Engine operations are O(1) or O(n) where n≤9; no goal defined for
  this feature. CA-N-01 (agent < 1 000 ms) belongs to `002-agents`.
**Constraints**: `src/engine.js` MUST NOT import DOM APIs, timers, or any module that
  does. Verified by Vitest running in `node` environment.
**Scale/Scope**: 1 module, 19 CA-IDs, 4 test files, 1 verifier script.

## Constitution Check

*GATE: Must pass before Phase 0. Re-checked after Phase 1.*

| Principle | Gate | Status |
|-----------|------|--------|
| P1 · Fixed Stack | Only Vite + Vitest as devDeps; zero runtime deps | ✅ Pass |
| P2 · Pure Layered Architecture | `engine.js` has no DOM/timer imports; contracts match spec | ✅ Pass |
| P3 · Spec as Source of Truth | Plan derived from spec; no behavior added beyond 19 CAs | ✅ Pass |
| P4 · EARS Requirements | Criteria live in spec, not here | ✅ Pass |
| P5 · Verification Gate | Task sequence: RED test → implementation; enforced in tasks.md | ✅ Pass |
| P6 · Traceability | `verify-traceability.mjs` is Task T-001 — first thing built | ✅ Pass |
| P7 · Spec-First Debugging | Documented in process rules; N/A at plan stage | ✅ Pass |
| P8 · Human Review | N/A at plan stage | ✅ Pass |
| P9 · Non-Functional | CA-N-01 → 002-agents; CA-N-02/03 → 003-interface; none here | ✅ Pass |

No violations. Complexity Tracking section left empty.

## State Transition Design

The engine is a pure function. All valid next states follow from this table.
`state'` denotes the returned new state object; `state` is left unchanged.

### Shared input validation (applied before mode-specific logic)

| Trigger | Condition | Result |
|---------|-----------|--------|
| `applyMove(state, move)` | `state.result ≠ null` | `{error:true, reason:"game_over"}` |
| `applyMove(state, move)` | `move.player ≠ state.turn` | `{error:true, reason:"wrong_turn"}` |
| Any move targeting `cell` | `state.board[cell] ≠ null` | `{error:true, reason:"cell_occupied"}` |

### Classic mode — placement phase

| From state | Event | To state |
|------------|-------|----------|
| `result=null`, `piecesPlaced<9`, `board[cell]=null`, `turn=P` | place P on `cell` | `board[cell]=P`, `piecesPlaced+1`, `turn` flipped; then check terminal (→ below) |
| After placement: winning line exists for P | — | `result=P` (win takes precedence, CA-M-12, CA-M-14) |
| After placement: `piecesPlaced=9`, no winner | — | `result="draw"` (CA-M-13) |
| After placement: `piecesPlaced<9`, no winner | — | `result=null` (game continues) |

Illegal placements (rejected before state change):

| Condition | Error reason |
|-----------|-------------|
| `board[cell] ≠ null` | `"cell_occupied"` (CA-M-04) |
| `move.player ≠ turn` | `"wrong_turn"` (CA-M-05) |
| `result ≠ null` | `"game_over"` (CA-M-06) |
| move is a movement action | `"wrong_phase"` (CA-M-08) |

### Continuous mode — placement phase (`piecesPlaced < 6`)

| From state | Event | To state |
|------------|-------|----------|
| `result=null`, `piecesPlaced<5`, `board[cell]=null`, `turn=P` | place P on `cell` | `board[cell]=P`, `piecesPlaced+1`, `turn` flipped; check winner (CA-M-12) |
| `result=null`, `piecesPlaced=5`, `board[cell]=null`, `turn=P` | place P on `cell` (6th mark) | `board[cell]=P`, `piecesPlaced=6`, `phase="movement"`, `turn` flipped (CA-M-15); check winner (CA-M-12) |

Illegal placements: same as classic mode. Movement actions rejected with `"wrong_phase"` (CA-M-08).

### Continuous mode — movement phase (`piecesPlaced = 6`, constant)

| From state | Event | To state |
|------------|-------|----------|
| `result=null`, `board[from]=P`, `board[to]=null`, `turn=P` | move P from `from` to `to` | `board[from]=null`, `board[to]=P`, `turn` flipped; check winner (CA-M-12) |
| After movement: winning line exists for P | — | `result=P` |
| After movement: no winner | — | `result=null` (CA-M-17; draw never occurs) |

Illegal movements:

| Condition | Error reason |
|-----------|-------------|
| `board[to] ≠ null` | `"cell_occupied"` (CA-M-19) |
| `board[from] = null` | `"no_mark_at_source"` (CA-M-18) |
| `board[from] = opponent` | `"not_own_mark"` (CA-M-07) |
| `move.player ≠ turn` | `"wrong_turn"` (CA-M-05) |
| `result ≠ null` | `"game_over"` (CA-M-06) |
| move is a placement action during movement phase | `"wrong_phase"` (plan-level decision; no CA-ID covers it — see note below) |

> Note on the last row: CA-M-08 covers "movement action during placement phase." The reverse
> (placement action during movement phase) is covered by **CA-M-20**, added to `spec.md` as
> the exact symmetric case of CA-M-08. Reject with `"wrong_phase"`; see `tasks.md` T-013/T-014.

### legalMoves output

| State | legalMoves returns |
|-------|--------------------|
| `result ≠ null` | `[]` (CA-M-11) |
| `phase="placement"`, `result=null` | one `{type:"place", cell:i}` for each `board[i]=null` (CA-M-09) |
| `phase="movement"`, `result=null` | one `{type:"move", from:i, to:j}` for each `board[i]=turn` × `board[j]=null` pair (CA-M-10) |

## Test Strategy

### File layout

```
tests/
└── engine/
    ├── us-m1-rules.test.js      # CA-M-01 to CA-M-11 (US-M-1: rules enforcement)
    ├── us-m2-results.test.js    # CA-M-12 to CA-M-14 (US-M-2: win/draw resolution)
    ├── us-m3-phases.test.js     # CA-M-15 to CA-M-17 (US-M-3: continuous mode phases)
    └── edge-cases.test.js       # CA-M-18, CA-M-19 (edge cases)
```

### CA-ID → test mapping

Every `describe` block MUST contain the CA-ID exactly as it appears in the spec.
Vitest will report it in the failure output, making orphan detection trivial.

| CA-ID | Test file | `describe` label |
|-------|-----------|-----------------|
| CA-M-01 | us-m1-rules.test.js | `'CA-M-01 — initial state'` |
| CA-M-02 | us-m1-rules.test.js | `'CA-M-02 — turn alternation'` |
| CA-M-03 | us-m1-rules.test.js | `'CA-M-03 — legal placement'` |
| CA-M-04 | us-m1-rules.test.js | `'CA-M-04 — illegal: occupied cell'` |
| CA-M-05 | us-m1-rules.test.js | `'CA-M-05 — illegal: wrong turn'` |
| CA-M-06 | us-m1-rules.test.js | `'CA-M-06 — illegal: game over'` |
| CA-M-07 | us-m1-rules.test.js | `'CA-M-07 — illegal: opponent mark'` |
| CA-M-08 | us-m1-rules.test.js | `'CA-M-08 — illegal: wrong phase'` |
| CA-M-09 | us-m1-rules.test.js | `'CA-M-09 — legalMoves in placement phase'` |
| CA-M-10 | us-m1-rules.test.js | `'CA-M-10 — legalMoves in movement phase'` |
| CA-M-11 | us-m1-rules.test.js | `'CA-M-11 — legalMoves after game over'` |
| CA-M-12 | us-m2-results.test.js | `'CA-M-12 — win detection all 8 lines'` |
| CA-M-13 | us-m2-results.test.js | `'CA-M-13 — classic draw'` |
| CA-M-14 | us-m2-results.test.js | `'CA-M-14 — win over draw precedence'` |
| CA-M-15 | us-m3-phases.test.js | `'CA-M-15 — placement to movement transition'` |
| CA-M-16 | us-m3-phases.test.js | `'CA-M-16 — legal movement'` |
| CA-M-17 | us-m3-phases.test.js | `'CA-M-17 — no draw in continuous mode'` |
| CA-M-18 | edge-cases.test.js | `'CA-M-18 — illegal: empty source cell'` |
| CA-M-19 | edge-cases.test.js | `'CA-M-19 — illegal: occupied destination'` |
| CA-M-20 | us-m1-rules.test.js | `'CA-M-20 — illegal: placement during movement phase'` |

CA-M-12 requires 8 `it` blocks (one per winning line) plus 2 `it` blocks for X and O.
All within the same `describe('CA-M-12', ...)`.

### Vitest configuration

File: `vitest.config.js` at repo root.

```js
// vitest.config.js  (do not write production code — this is the plan-level contract only)
export default {
  test: {
    environment: 'node',          // P2: engine has no DOM dependency
    include: ['tests/**/*.test.js'],
    coverage: {
      provider: 'v8',
      include: ['src/engine.js'],
    },
  },
}
```

No `jsdom`, no browser environment needed for this feature. The UI feature (003-interface)
will add a separate Vitest configuration or a `--environment jsdom` override.

## Traceability Verifier Design

File: `scripts/verify-traceability.mjs`
npm script: `"verify:traceability": "node scripts/verify-traceability.mjs"`

This script is **Task T-001** — the first thing built in the project.

### Algorithm

```
1. SPEC_IDS  ← extract deduplicated /CA-M-\d+/ from specs/001-engine/spec.md
               (source of truth for what must be covered)

2. TASKS_IDS ← extract /CA-M-\d+/ from specs/001-engine/tasks.md
               FAIL immediately if tasks.md does not exist

3. TEST_IDS  ← scan tests/engine/**/*.test.js for /CA-M-\d+/ in describe/it strings
               FAIL immediately if tests/engine/ does not exist

4. COMMIT_IDS← git log --pretty=format:"%s" | extract /CA-M-\d+/

5. For each id in SPEC_IDS:
     orphaned_in = []
     if id not in TASKS_IDS  → orphaned_in.push("tasks.md")
     if id not in TEST_IDS   → orphaned_in.push("tests")
     if id not in COMMIT_IDS → orphaned_in.push("git log")
     if orphaned_in not empty → print "ORPHAN: {id} missing in {orphaned_in}"
                                  set exit_code = 1

6. if exit_code = 0 → print "OK: all {n} CA-IDs fully traced"
   else              → exit(1)
```

### Failure messages (exact format)

```
ORPHAN: CA-M-07 missing in: tasks.md, tests
ORPHAN: CA-M-12 missing in: git log
OK: all 19 CA-IDs fully traced
```

Exit code 1 if any orphan is found; exit code 0 otherwise.

The script uses only Node.js built-ins: `node:fs`, `node:path`, `node:child_process`.
No npm dependencies.

## Project Structure

### Documentation (this feature)

```
specs/001-engine/
├── plan.md              # This file
├── research.md          # Phase 0 — technology decisions (no unknowns)
├── data-model.md        # Phase 1 — state shape, move shapes, error shape
├── quickstart.md        # Phase 1 — how to run tests and verifier
├── traceability.md      # Matrix skeleton (SHAs filled in during implement)
├── contracts/
│   └── engine-api.md    # Public API contract for legalMoves and applyMove
└── tasks.md             # Phase 2 — created by /speckit-tasks
```

### Source Code (repository root)

```
src/
└── engine.js            # Pure engine module; no other source files for this feature

scripts/
└── verify-traceability.mjs   # CA-ID orphan checker (T-001)

tests/
└── engine/
    ├── us-m1-rules.test.js
    ├── us-m2-results.test.js
    ├── us-m3-phases.test.js
    └── edge-cases.test.js

vitest.config.js         # Vitest configuration (node environment)
package.json             # Scripts: test, verify:traceability
```

**Structure Decision**: Single-project layout. Engine is one module; tests mirror the
user-story structure from the spec. Scripts directory holds Node.js-only tooling.

## Complexity Tracking

> No constitution violations. Section intentionally empty.
