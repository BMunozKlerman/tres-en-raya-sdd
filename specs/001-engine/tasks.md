# Tasks: Game Engine

**Feature**: `001-engine` | **Date**: 2026-07-26  
**Input**: `specs/001-engine/plan.md`, `spec.md`, `data-model.md`, `contracts/engine-api.md`

**Method**: TDD — every criterion has one RED commit (failing test) that precedes its GREEN commit (minimum implementation). The full suite must be green on every GREEN commit before it is pushed.

**Total tasks**: 29 (T-001 to T-029)

**Grouping principle** (recorded per user decision 2026-07-26): Traceability is demonstrated live with `git log --grep="CA-M-nn"`. If a commit covers criteria from different layers, the criterion → commit path is no longer unambiguous. One RED/GREEN pair per criterion or per homogeneous group (same function, same code layer, same dispatch order) keeps the chain clean. This is why CA-M-01 (factory function `createGame`) is separated from CA-M-02/CA-M-03 (`applyMove` placement path), and why CA-M-05/CA-M-06 (universal guards, top of `applyMove`) are separated from CA-M-04 (placement-branch guard, inside the dispatch).

---

## Phase 1: Tooling (infrastructure — no behavioral CA-ID)

**Purpose**: Traceability gate (P6) and project scaffold (P1). Must be complete before any engine task. T-001 and T-002 are the only tasks without CA-IDs; they are tooling, not product behavior.

- [ ] T-001 Create `scripts/verify-traceability.mjs` using only Node.js built-ins (`node:fs`, `node:path`, `node:child_process`); implement the 6-step algorithm from `specs/001-engine/plan.md § Traceability Verifier Design` (extract CA-IDs from spec.md / tasks.md / test describe strings / git log, print ORPHAN lines, exit 1 on any orphan); add `"verify:traceability": "node scripts/verify-traceability.mjs"` to `package.json`. Expected commit: `T-001: add traceability verifier (verify:traceability npm script)`

- [ ] T-002 Initialize `package.json` with `"vite"` and `"vitest"` as devDependencies; create `vitest.config.js` at repo root with `environment: 'node'`, `include: ['tests/**/*.test.js']`, `coverage.provider: 'v8'`, `coverage.include: ['src/engine.js']`; add scripts `"test": "vitest run"` and `"coverage": "vitest run --coverage"` to `package.json`. Expected commit: `T-002: scaffold Vite/Vitest project (vitest.config.js, package.json)`

---

## Phase 2: US-M-1 — Engine Enforces Rules (Priority: P1)

**Goal**: `createGame`, `applyMove` (placement path + all placement-phase guards), and `legalMoves` (placement phase and game-over) fully implemented and tested.

**Independent test**: After T-014 GREEN, `npm test` is fully green for CA-M-01..CA-M-06, CA-M-08, CA-M-09, CA-M-11. CA-M-07 and CA-M-10 are deferred to Phase 4 (require the movement path from T-022).

**Prerequisite**: T-002 complete.

### Group A — createGame: initial state (CA-M-01)

_Separated from CA-M-02/CA-M-03: `createGame` is a factory function, a distinct export from `applyMove`. A commit that mixes the factory with the placement path makes `git log --grep="CA-M-01"` return a commit that also contains unrelated placement logic._

- [ ] T-003 [US-M-1] [AC: CA-M-01] RED — Create `tests/engine/us-m1-rules.test.js`; add one failing `describe('CA-M-01 — initial state', () => { it('returns the correct initial state for classic mode', ...) })`: call `createGame('classic')`, assert board is an array of 9 nulls, turn is `'X'`, mode is `'classic'`, phase is `'placement'`, piecesPlaced is `0`, result is `null`; add a second `it` for `createGame('continuous')` asserting mode is `'continuous'` and all other fields identical. Expected commit: `test(CA-M-01): failing test — initial state`

- [ ] T-004 [US-M-1] [AC: CA-M-01] GREEN — Create `src/engine.js`; export `createGame(mode = 'classic')` returning a plain object with fields `{board: Array(9).fill(null), turn: 'X', mode, phase: 'placement', piecesPlaced: 0, result: null}`; `npm test` must pass for CA-M-01 only (no other tests exist yet). Expected commit: `T-004: createGame factory (CA-M-01)`

### Group B — applyMove: legal placement (CA-M-02, CA-M-03)

_CA-M-02 (turn flip) and CA-M-03 (board update + piecesPlaced) are two observable properties of the same `applyMove` call on a legal placement (D9: one operation, one returned state). Both are verified by the same test setup and implemented in the same function branch._

- [ ] T-005 [US-M-1] [AC: CA-M-02, CA-M-03] RED — Add to `tests/engine/us-m1-rules.test.js`:
  - `describe('CA-M-02 — turn alternation', ...)`: apply one legal placement (X at cell 0 on initial state); assert returned state has `turn === 'O'`.
  - `describe('CA-M-03 — legal placement', ...)`: apply one legal placement (X at cell 4 on initial state); assert returned board[4] is `'X'` and returned piecesPlaced is `1`.
  Expected commit: `test(CA-M-02,CA-M-03): failing tests — turn alternation and legal placement`

- [ ] T-006 [US-M-1] [AC: CA-M-02, CA-M-03] GREEN — In `src/engine.js`, export `applyMove(state, move)`; add the placement path: copy board, set `newBoard[move.cell] = move.player`, compute `newPiecesPlaced = state.piecesPlaced + 1`, flip turn (`state.turn === 'X' ? 'O' : 'X'`), return new state object (no mutation); `npm test` must be fully green. Expected commit: `T-006: applyMove placement path (CA-M-02, CA-M-03)`

### Group C — universal guards: game_over and wrong_turn (CA-M-05, CA-M-06)

_CA-M-05 (wrong_turn) and CA-M-06 (game_over) are both checked at the very top of `applyMove`, before any type dispatch — the same code layer. Separated from CA-M-04 (which lives inside the placement branch, a different layer)._

- [ ] T-007 [US-M-1] [AC: CA-M-05, CA-M-06] RED — Add to `tests/engine/us-m1-rules.test.js`:
  - `describe('CA-M-05 — illegal: wrong turn', ...)`: on initial state (turn=X), call `applyMove` with player `'O'`; assert return is `{error: true, reason: 'wrong_turn'}`; assert input state object is the same reference or byte-for-byte unchanged.
  - `describe('CA-M-06 — illegal: game over', ...)`: build a state with `result: 'X'`; call `applyMove` with any move; assert `{error: true, reason: 'game_over'}` and state unchanged.
  Expected commit: `test(CA-M-05,CA-M-06): failing tests — wrong turn and game over guards`

- [ ] T-008 [US-M-1] [AC: CA-M-05, CA-M-06] GREEN — In `src/engine.js`, prepend two universal guards to `applyMove` (before any other logic): `if (state.result !== null) return {error: true, reason: 'game_over'}`; `if (move.player !== state.turn) return {error: true, reason: 'wrong_turn'}`; `npm test` must be fully green. Expected commit: `T-008: universal guards game_over and wrong_turn (CA-M-05, CA-M-06)`

### Group D — placement-branch guard: cell_occupied (CA-M-04)

_CA-M-04 (cell_occupied) lives inside the placement branch of `applyMove`, after type dispatch — a different layer from the universal guards in Group C. Separate pair keeps `git log --grep="CA-M-04"` pointing to a commit that touches only the placement branch._

- [ ] T-009 [US-M-1] [AC: CA-M-04] RED — Add to `tests/engine/us-m1-rules.test.js`:
  - `describe('CA-M-04 — illegal: occupied cell', ...)`: build a state with board[0]='X'; call `applyMove` with `{type: 'place', player: 'O', cell: 0}`; assert `{error: true, reason: 'cell_occupied'}` and state unchanged.
  Expected commit: `test(CA-M-04): failing test — occupied cell guard in placement path`

- [ ] T-010 [US-M-1] [AC: CA-M-04] GREEN — In `src/engine.js`, inside the placement path, add guard before board mutation: `if (state.board[move.cell] !== null) return {error: true, reason: 'cell_occupied'}`; `npm test` must be fully green. Expected commit: `T-010: cell_occupied guard in placement path (CA-M-04)`

### Group E — type-dispatch guard: wrong_phase (CA-M-08)

- [ ] T-011 [US-M-1] [AC: CA-M-08] RED — Add to `tests/engine/us-m1-rules.test.js`:
  - `describe('CA-M-08 — illegal: wrong phase', ...)`: on a placement-phase state, call `applyMove` with `{type: 'move', player: 'X', from: 0, to: 1}`; assert `{error: true, reason: 'wrong_phase'}` and state unchanged.
  Expected commit: `test(CA-M-08): failing test — movement action during placement phase`

- [ ] T-012 [US-M-1] [AC: CA-M-08] GREEN — In `src/engine.js`, add type-dispatch check before the path split: `if (move.type === 'move' && state.phase === 'placement') return {error: true, reason: 'wrong_phase'}`; `npm test` must be fully green. Expected commit: `T-012: wrong_phase guard for movement actions during placement (CA-M-08)`

### Group F — legalMoves: placement phase and game-over (CA-M-09, CA-M-11)

_CA-M-09 (placement list) and CA-M-11 (empty list after game over) are both branches of `legalMoves`, the same exported function. Grouped by function boundary._

- [ ] T-013 [US-M-1] [AC: CA-M-09, CA-M-11] RED — Add to `tests/engine/us-m1-rules.test.js`:
  - `describe('CA-M-09 — legalMoves in placement phase', ...)`: on a state with k null cells (e.g. initial state: k=9), assert `legalMoves(state)` returns an array of exactly k elements, each `{type: 'place', cell: i}` where `board[i] === null`.
  - `describe('CA-M-11 — legalMoves after game over', ...)`: on a state with `result: 'X'`, assert `legalMoves(state)` returns `[]`.
  Expected commit: `test(CA-M-09,CA-M-11): failing tests — legalMoves placement phase and game-over`

- [ ] T-014 [US-M-1] [AC: CA-M-09, CA-M-11] GREEN — In `src/engine.js`, export `legalMoves(state)`: `if (state.result !== null) return []`; `if (state.phase === 'placement') return state.board.reduce((acc, v, i) => v === null ? [...acc, {type: 'place', cell: i}] : acc, [])`; `npm test` must be fully green. Expected commit: `T-014: legalMoves placement phase and game-over (CA-M-09, CA-M-11)`

---

## Phase 3: US-M-2 — Win and Draw Resolution (Priority: P2)

**Goal**: `applyMove` detects all 8 winning lines and the classic draw; win takes precedence on the 9th move.

**Independent test**: After T-018 GREEN, `npm test` passes all CA-M-12..CA-M-14 describes, including every winning line exercised parametrically for X and O.

**Prerequisite**: T-014 GREEN complete.

### Win detection — all 8 lines (CA-M-12)

- [ ] T-015 [US-M-2] [AC: CA-M-12] RED — Create `tests/engine/us-m2-results.test.js`; add `describe('CA-M-12 — win detection all 8 lines', ...)` using `it.each` parametrized over the 8 winning line triplets:
  ```js
  it.each([
    [[0,1,2], 'top row'],    [[3,4,5], 'middle row'], [[6,7,8], 'bottom row'],
    [[0,3,6], 'left col'],   [[1,4,7], 'center col'], [[2,5,8], 'right col'],
    [[0,4,8], 'main diag'],  [[2,4,6], 'anti-diag'],
  ])('CA-M-12 — X wins on line %s (%s)', (line) => { ... })
  ```
  Each `it` builds a classic state where X occupies the first two cells of the line and applies the third placement; asserts `result === 'X'`. Add a second `it.each` over two lines (`[0,1,2]`, `[0,3,6]`) for O wins, asserting `result === 'O'`. Expected commit: `test(CA-M-12): failing tests — all 8 winning lines parametrized (X and O)`

- [ ] T-016 [US-M-2] [AC: CA-M-12] GREEN — In `src/engine.js`, define (not exported) `const WINNING_LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]`; after updating the board in the placement path, scan all lines: `if (WINNING_LINES.some(line => line.every(i => newBoard[i] === move.player))) newResult = move.player`; `npm test` must be fully green. Expected commit: `T-016: WINNING_LINES constant and winner detection (CA-M-12)`

### Draw detection and win-over-draw precedence (CA-M-13, CA-M-14)

_CA-M-13 (no winner, board full → draw) and CA-M-14 (winner + board full → winner not draw) both trigger when `piecesPlaced === 9` in classic mode. They are the same code branch; CA-M-14 is verified by the order of checks (winner scan runs first). Grouped by shared code path._

- [ ] T-017 [US-M-2] [AC: CA-M-13, CA-M-14] RED — Add to `tests/engine/us-m2-results.test.js`:
  - `describe('CA-M-13 — classic draw', ...)`: apply the 9-move sequence `[X:0, O:4, X:1, O:3, X:5, O:2, X:7, O:8, X:6]` which fills the board with no winner; assert `result === 'draw'`.
  - `describe('CA-M-14 — win over draw precedence', ...)`: apply 8 moves leaving cells 0,1,2 for X (board full after last move, X wins on [0,1,2]); assert `result === 'X'` (not `'draw'`).
  Expected commit: `test(CA-M-13,CA-M-14): failing tests — classic draw and win-over-draw precedence`

- [ ] T-018 [US-M-2] [AC: CA-M-13, CA-M-14] GREEN — In `src/engine.js`, after the winner scan in the placement path, add draw detection: `else if (state.mode === 'classic' && newPiecesPlaced === 9) newResult = 'draw'`; winner scan runs first, so CA-M-14 is satisfied by ordering alone; `npm test` must be fully green. Expected commit: `T-018: draw detection and win-over-draw precedence (CA-M-13, CA-M-14)`

---

## Phase 4: US-M-3 — Continuous Mode Phases (Priority: P3)

**Goal**: Phase transition on the 6th placement; movement path with board swap, turn flip, winner check, no draw; movement-phase rule guards deferred from US-M-1 (CA-M-07, CA-M-10).

**Prerequisite**: T-018 GREEN complete.

### Phase transition (CA-M-15)

- [ ] T-019 [US-M-3] [AC: CA-M-15] RED — Create `tests/engine/us-m3-phases.test.js`; add `describe('CA-M-15 — placement to movement transition', ...)`: call `createGame('continuous')`, apply 6 alternating placements (X:0, O:1, X:2, O:3, X:4, O:5); assert the state returned after the 6th placement has `phase === 'movement'` and `turn === 'X'` (O made the 6th placement, so X opens movement). Expected commit: `test(CA-M-15): failing test — placement to movement transition`

- [ ] T-020 [US-M-3] [AC: CA-M-15] GREEN — In `src/engine.js`, in the placement path after incrementing piecesPlaced, add: `if (state.mode === 'continuous' && newPiecesPlaced === 6) newPhase = 'movement'`; `npm test` must be fully green. Expected commit: `T-020: phase transition to movement on 6th placement (CA-M-15)`

### Legal movement and no draw (CA-M-16, CA-M-17)

_CA-M-16 (movement succeeds, board updates) and CA-M-17 (result stays null — no draw) are both observable properties of the same `applyMove` call on a legal movement action (D9). Grouped by shared operation. CA-M-17 test strategy is exhaustive, not sampled — see below._

- [ ] T-021 [US-M-3] [AC: CA-M-16, CA-M-17] RED — Add to `tests/engine/us-m3-phases.test.js`:
  - `describe('CA-M-16 — legal movement', ...)`: reach movement phase (continuous, 6 placements: X:0, O:1, X:2, O:3, X:4, O:5); apply `{type:'move', player:'X', from:0, to:6}`; assert `board[0] === null`, `board[6] === 'X'`, `turn === 'O'`.
  - `describe('CA-M-17 — no draw in continuous mode', ...)`: verify exhaustively from **3 pre-built movement-phase states** with no winning line:
    - **State 1 — balanced**: X at [0,2,4], O at [1,3,5], turn X, empty [6,7,8]. No winning line.
    - **State 2 — near-win**: X at [0,1,7], O at [3,4,5], turn X, empty [2,6,8]. X is one mark from completing [0,1,2] but the completing move is not a legal movement in this state (cell 2 is empty and reachable). Use only moves that do NOT complete a line (filter with WINNING_LINES manually or via legalMoves).
    - **State 3 — constrained**: after X moves from cell 0 to cell 6, the just-vacated cell 0 is the only free cell adjacent to X's remaining marks; X at [6,2,4], O at [1,3,5], turn O, empty [0,7,8].
    For each state, iterate over **all entries returned by `legalMoves(state)`** (at minimum 9 per state: 3 own marks × 3 empty cells), apply each to the state with `applyMove`, and assert `result.result === null` and `result.result !== 'draw'`. The test is exhaustive for the movement-phase state space of each position.
  Expected commit: `test(CA-M-16,CA-M-17): failing tests — legal movement and exhaustive no-draw`

- [ ] T-022 [US-M-3] [AC: CA-M-16, CA-M-17] GREEN — In `src/engine.js`, add the movement path to `applyMove` (executed when `move.type === 'move'` and `state.phase === 'movement'`): copy board, set `newBoard[move.from] = null`, `newBoard[move.to] = move.player`, flip turn, run WINNING_LINES scan (same helper as placement path), set `newResult = move.player` if winner found — no draw check in this branch; `npm test` must be fully green. Expected commit: `T-022: movement path — board swap, turn flip, winner check, no draw (CA-M-16, CA-M-17)`

### CA-M-07 — deferred from US-M-1 (requires movement path from T-022)

- [ ] T-023 [US-M-1] [AC: CA-M-07] RED — Add to `tests/engine/us-m1-rules.test.js`: `describe('CA-M-07 — illegal: opponent mark', ...)`: build a movement-phase state with X at [0,2,4] and O at [1,3,5]; call `applyMove` with `{type:'move', player:'X', from:1, to:6}` (cell 1 holds O); assert `{error: true, reason: 'not_own_mark'}` and state unchanged. Expected commit: `test(CA-M-07): failing test — opponent mark guard in movement path`

- [ ] T-024 [US-M-1] [AC: CA-M-07] GREEN — In `src/engine.js`, add guard to the movement path before board mutation: `if (state.board[move.from] !== move.player) return {error: true, reason: 'not_own_mark'}`; `npm test` must be fully green. Expected commit: `T-024: not_own_mark guard in movement path (CA-M-07)`

### CA-M-10 — deferred from US-M-1 (requires movement path from T-022)

- [ ] T-025 [US-M-1] [AC: CA-M-10] RED — Add to `tests/engine/us-m1-rules.test.js`: `describe('CA-M-10 — legalMoves in movement phase', ...)`: reach movement phase (X at [0,2,4], O at [1,3,5], turn X, empty [6,7,8]); call `legalMoves(state)`; assert it returns an array of 9 elements (3 own marks × 3 empty cells), each `{type:'move', from:i, to:j}` where `board[i]==='X'` and `board[j]===null`. Expected commit: `test(CA-M-10): failing test — legalMoves movement phase cross-product`

- [ ] T-026 [US-M-1] [AC: CA-M-10] GREEN — In `src/engine.js`, extend `legalMoves`: add `else if (state.phase === 'movement')` branch iterating all (i,j) pairs where `state.board[i] === state.turn` and `state.board[j] === null` and `i !== j`, returning `{type:'move', from:i, to:j}` for each; `npm test` must be fully green. Expected commit: `T-026: legalMoves movement phase cross-product (CA-M-10)`

---

## Phase 5: Edge Cases (CA-M-18, CA-M-19)

**Goal**: Remaining movement-path input guards — empty source cell and occupied destination.

_CA-M-18 (source null) and CA-M-19 (destination occupied) are both guards in the movement path, same code layer, same function branch. Grouped by layer._

**Prerequisite**: T-026 GREEN complete.

- [ ] T-027 [AC: CA-M-18, CA-M-19] RED — Create `tests/engine/edge-cases.test.js`:
  - `describe('CA-M-18 — illegal: empty source cell', ...)`: movement-phase state (X at [0,2,4], O at [1,3,5]); call `applyMove` with `{type:'move', player:'X', from:6, to:7}` (cell 6 is null); assert `{error:true, reason:'no_mark_at_source'}` and state unchanged.
  - `describe('CA-M-19 — illegal: occupied destination', ...)`: same state; call `applyMove` with `{type:'move', player:'X', from:0, to:1}` (cell 1 holds O); assert `{error:true, reason:'cell_occupied'}` and state unchanged.
  Expected commit: `test(CA-M-18,CA-M-19): failing tests — empty source and occupied destination`

- [ ] T-028 [AC: CA-M-18, CA-M-19] GREEN — In `src/engine.js`, add two guards to the movement path in this order (before board mutation): `if (state.board[move.from] === null) return {error:true, reason:'no_mark_at_source'}`; `if (state.board[move.to] !== null) return {error:true, reason:'cell_occupied'}`; `npm test` must be fully green; run `npm run verify:traceability` — expect only "missing in: git log" orphans at this point (SHAs recorded in T-029). Expected commit: `T-028: no_mark_at_source and cell_occupied guards in movement path (CA-M-18, CA-M-19)`

---

## Final Phase: Traceability Closure

- [ ] T-029 [AC: CA-M-01, CA-M-02, CA-M-03, CA-M-04, CA-M-05, CA-M-06, CA-M-07, CA-M-08, CA-M-09, CA-M-10, CA-M-11, CA-M-12, CA-M-13, CA-M-14, CA-M-15, CA-M-16, CA-M-17, CA-M-18, CA-M-19] Run `npm run verify:traceability`; fill Task column (T-NNN) and Commit SHA column for all 19 rows in `specs/001-engine/traceability.md` using real SHAs from `git log`; verify `npm run verify:traceability` exits 0 after the commit. Expected commit: `T-029: record real SHAs in traceability matrix — 001-engine complete`

---

## Coverage Audit

| CA-ID | RED task | GREEN task | Test file | Notes |
|-------|----------|------------|-----------|-------|
| CA-M-01 | T-003 | T-004 | us-m1-rules.test.js | ✅ |
| CA-M-02 | T-005 | T-006 | us-m1-rules.test.js | ✅ |
| CA-M-03 | T-005 | T-006 | us-m1-rules.test.js | ✅ D9: same operation, same returned state |
| CA-M-04 | T-009 | T-010 | us-m1-rules.test.js | ✅ Placement-branch guard — layer separated from CA-M-05/CA-M-06 |
| CA-M-05 | T-007 | T-008 | us-m1-rules.test.js | ✅ Universal guard — same layer as CA-M-06 |
| CA-M-06 | T-007 | T-008 | us-m1-rules.test.js | ✅ Universal guard — same layer as CA-M-05 |
| CA-M-07 | T-023 | T-024 | us-m1-rules.test.js | ✅ Deferred to Phase 4 — requires movement path (T-022) |
| CA-M-08 | T-011 | T-012 | us-m1-rules.test.js | ✅ |
| CA-M-09 | T-013 | T-014 | us-m1-rules.test.js | ✅ |
| CA-M-10 | T-025 | T-026 | us-m1-rules.test.js | ✅ Deferred to Phase 4 — requires movement path (T-022) |
| CA-M-11 | T-013 | T-014 | us-m1-rules.test.js | ✅ Same function as CA-M-09 (legalMoves), different branch |
| CA-M-12 | T-015 | T-016 | us-m2-results.test.js | ✅ it.each over 8 lines; CA-ID in test name |
| CA-M-13 | T-017 | T-018 | us-m2-results.test.js | ✅ |
| CA-M-14 | T-017 | T-018 | us-m2-results.test.js | ✅ Same code path as CA-M-13 (piecesPlaced===9), precedence by ordering |
| CA-M-15 | T-019 | T-020 | us-m3-phases.test.js | ✅ |
| CA-M-16 | T-021 | T-022 | us-m3-phases.test.js | ✅ |
| CA-M-17 | T-021 | T-022 | us-m3-phases.test.js | ✅ Exhaustive: all legal moves from 3 distinct states; no arbitrary N |
| CA-M-18 | T-027 | T-028 | edge-cases.test.js | ✅ |
| CA-M-19 | T-027 | T-028 | edge-cases.test.js | ✅ |

---

## Dependencies & Execution Order

All 29 tasks are strictly sequential. No [P] markers: every GREEN touches `src/engine.js`; consecutive REDs for the same test file accumulate content in the same file; T-001 and T-002 both touch `package.json`.

```
T-001 → T-002
  → T-003(RED) → T-004(GREEN)      CA-M-01
  → T-005(RED) → T-006(GREEN)      CA-M-02, CA-M-03
  → T-007(RED) → T-008(GREEN)      CA-M-05, CA-M-06
  → T-009(RED) → T-010(GREEN)      CA-M-04
  → T-011(RED) → T-012(GREEN)      CA-M-08
  → T-013(RED) → T-014(GREEN)      CA-M-09, CA-M-11
  → T-015(RED) → T-016(GREEN)      CA-M-12
  → T-017(RED) → T-018(GREEN)      CA-M-13, CA-M-14
  → T-019(RED) → T-020(GREEN)      CA-M-15
  → T-021(RED) → T-022(GREEN)      CA-M-16, CA-M-17
  → T-023(RED) → T-024(GREEN)      CA-M-07
  → T-025(RED) → T-026(GREEN)      CA-M-10
  → T-027(RED) → T-028(GREEN)      CA-M-18, CA-M-19
  → T-029                          traceability closure
```

**Phase gates**:

| Phase starts at | Prerequisite |
|-----------------|-------------|
| Phase 2 (T-003) | T-002 complete |
| Phase 3 (T-015) | T-014 GREEN — legalMoves and full placement path green |
| Phase 4 (T-019) | T-018 GREEN — winner and draw detection green |
| Phase 4 deferred (T-023) | T-022 GREEN — movement path exists |
| Phase 5 (T-027) | T-026 GREEN — movement guards and legalMoves(movement) green |
| Final (T-029) | T-028 GREEN — `npm test` fully green |

---

## Self-Check Report

| Check | Result |
|-------|--------|
| CA-ID with no RED task | None — 19/19 covered |
| CA-ID with no GREEN task | None — 19/19 covered |
| GREEN preceding its RED | None — verified by task sequence above |
| Tasks without CA-ID | T-001 and T-002 only (tooling, by design) |
| Tasks too large for one session | None — largest single task is T-021 (3 movement-phase states × all legal moves, one describe); bounded and self-contained |
| CA-ID with unclear test strategy | None — CA-M-12 uses it.each over 8 lines; CA-M-17 is exhaustive over all legal moves from 3 states |
| Parallel tasks touching the same file | None (no [P] markers) |

**Deferred criteria note**: CA-M-07 and CA-M-10 are spec-listed under US-M-1 but their RED/GREEN tasks appear in Phase 4 because their test assertions require the movement path (T-022) to exist. RED always precedes GREEN for each criterion; the full suite is green after each GREEN commit.
