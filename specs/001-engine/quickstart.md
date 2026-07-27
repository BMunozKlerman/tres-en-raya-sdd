# Quickstart: Game Engine

**Branch**: `001-engine` | **Date**: 2026-07-26

How to validate that the engine implementation is correct end-to-end.

## Prerequisites

- Node.js 20 LTS
- `npm install` run at repo root (installs Vitest)

## Run the test suite

```bash
npm test
```

Expected output: all tests pass, grouped by CA-ID. Example:

```
✓ CA-M-01 — initial state
✓ CA-M-02 — turn alternation
...
✓ CA-M-19 — illegal: occupied destination
```

Exit code 0. No red tests before implementation is complete.

## Run a single test file

```bash
npx vitest run tests/engine/us-m1-rules.test.js
```

Replace the path with any of the four test files:
- `tests/engine/us-m1-rules.test.js` — CA-M-01 to CA-M-11
- `tests/engine/us-m2-results.test.js` — CA-M-12 to CA-M-14
- `tests/engine/us-m3-phases.test.js` — CA-M-15 to CA-M-17
- `tests/engine/edge-cases.test.js` — CA-M-18 to CA-M-19

## Run the traceability verifier

```bash
npm run verify:traceability
```

Expected output when all 19 CA-IDs are traced:

```
OK: all 19 CA-IDs fully traced
```

If any CA-ID is orphaned (missing from `tasks.md`, tests, or git log), the script prints
the specific failure and exits with code 1:

```
ORPHAN: CA-M-07 missing in: tasks.md, tests
```

The verifier must pass before any task is considered closed (P6).

## Coverage report

```bash
npm run coverage
```

Generates an HTML report in `coverage/`. The only file tracked is `src/engine.js`.

## Validation scenarios

These are the key scenarios that confirm the engine is correct. Each maps to one or more
CA-IDs; see `contracts/engine-api.md` and `data-model.md` for the exact shapes.

| Scenario | CA-IDs |
|----------|--------|
| `createGame()` returns board of 9 nulls, turn X, phase placement, result null | CA-M-01 |
| Place X at cell 4; next state has turn O | CA-M-02 |
| Place X at cell 0; board[0]=X, piecesPlaced=1 | CA-M-03 |
| Place X at occupied cell → `{error:true, reason:'cell_occupied'}` | CA-M-04 |
| O tries to move when it is X's turn → `{error:true, reason:'wrong_turn'}` | CA-M-05 |
| Any move after result≠null → `{error:true, reason:'game_over'}` | CA-M-06 |
| Move opponent's piece → `{error:true, reason:'not_own_mark'}` | CA-M-07 |
| `{type:'move'}` during placement phase → `{error:true, reason:'wrong_phase'}` | CA-M-08 |
| `legalMoves` in placement phase → one entry per null cell | CA-M-09 |
| `legalMoves` in movement phase → cross product own pieces × empty cells | CA-M-10 |
| `legalMoves` after game over → `[]` | CA-M-11 |
| Fill winning line [0,1,2] for X → result='X' | CA-M-12 |
| Fill board with no winner (classic) → result='draw' | CA-M-13 |
| 9th move completes a line AND fills board → result=winner, not 'draw' | CA-M-14 |
| 6th placement → phase='movement', turn flipped | CA-M-15 |
| Move own piece to empty cell (movement phase) → piece relocated, turn flipped | CA-M-16 |
| Fill board in movement phase without winner → result still null | CA-M-17 |
| Move from null cell → `{error:true, reason:'no_mark_at_source'}` | CA-M-18 |
| Move to occupied cell (movement) → `{error:true, reason:'cell_occupied'}` | CA-M-19 |
