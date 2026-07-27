# Data Model: Game Engine

**Branch**: `001-engine` | **Date**: 2026-07-26 | **Phase**: 1

All shapes below are plain JavaScript objects — no classes, no inheritance.
Cell indices: 0–8, row-major order (top-left = 0, bottom-right = 8).

```
0 | 1 | 2
---------
3 | 4 | 5
---------
6 | 7 | 8
```

---

## State

The single object passed to and returned by every engine function.

```js
{
  board:         Array(9),   // each element: 'X' | 'O' | null
  turn:          string,     // 'X' | 'O' — whose turn it is
  mode:          string,     // 'classic' | 'continuous'
  phase:         string,     // 'placement' | 'movement'
  piecesPlaced:  number,     // 0–9 (classic) | 0–6 (continuous, then constant at 6)
  result:        string|null // null | 'X' | 'O' | 'draw'
  winningLine:   Array(3)|null // null, or the 3 cell indices that produced a win (CA-M-12,
                                // amended — see spec.md § Amendments). Never set on a draw.
}
```

### Field invariants

| Field | Classic | Continuous — placement | Continuous — movement |
|-------|---------|------------------------|----------------------|
| `board` | 0–9 pieces | 0–6 pieces | exactly 6 pieces |
| `phase` | always `"placement"` | `"placement"` | `"movement"` |
| `piecesPlaced` | 0–9 | 0–6 | 6 (constant) |
| `result` | null until win/draw | null until win | null until win |
| `winningLine` | null unless `result` is a mark; never set for `"draw"` | null unless `result` is a mark | null unless `result` is a mark |

### Initial state (CA-M-01)

```js
{
  board:        [null, null, null, null, null, null, null, null, null],
  turn:         'X',
  mode:         'classic',   // or 'continuous', caller's choice at game start
  phase:        'placement',
  piecesPlaced: 0,
  result:       null,
  winningLine:  null
}
```

`createGame(mode)` is the factory that returns this initial state. `mode` defaults to
`'classic'` if omitted.

---

## Move shapes

### Placement move

Used during the placement phase of both modes.

```js
{ type: 'place', player: 'X'|'O', cell: 0–8 }
```

### Movement move

Used during the movement phase of continuous mode only.

```js
{ type: 'move', player: 'X'|'O', from: 0–8, to: 0–8 }
```

The engine dispatches on `move.type`. A `'place'` move during the movement phase is
rejected with `"wrong_phase"` (CA-M-20, the symmetric case of CA-M-08).

---

## Error shape

Returned by `applyMove` when the move is illegal. The state is not returned.

```js
{ error: true, reason: string }
```

### Reason codes

| Reason | Triggered by |
|--------|-------------|
| `"game_over"` | any move when `state.result ≠ null` (CA-M-06) |
| `"wrong_turn"` | `move.player ≠ state.turn` (CA-M-05) |
| `"cell_occupied"` | placement targeting occupied cell (CA-M-04); movement targeting occupied destination (CA-M-19) |
| `"wrong_phase"` | movement action during placement phase (CA-M-08); placement action during movement phase (CA-M-20) |
| `"no_mark_at_source"` | movement from a null cell (CA-M-18) |
| `"not_own_mark"` | movement from a cell owned by the opponent (CA-M-07) |

---

## Winning lines constant

Defined once in `src/engine.js`. Not exported (internal implementation detail).

```js
const WINNING_LINES = [
  [0, 1, 2], // top row
  [3, 4, 5], // middle row
  [6, 7, 8], // bottom row
  [0, 3, 6], // left column
  [1, 4, 7], // center column
  [2, 5, 8], // right column
  [0, 4, 8], // main diagonal
  [2, 4, 6], // anti-diagonal
];
```

CA-M-12 requires that all 8 lines are exercised independently in the test suite.

---

## legalMoves output element shapes

| Phase | Element shape |
|-------|--------------|
| `"placement"` | `{ type: 'place', cell: 0–8 }` |
| `"movement"` | `{ type: 'move', from: 0–8, to: 0–8 }` |

When `result ≠ null`, `legalMoves` returns `[]` (CA-M-11).
