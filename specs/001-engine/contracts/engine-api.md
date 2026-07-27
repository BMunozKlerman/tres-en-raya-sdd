# Engine API Contract

**Module**: `src/engine.js` | **Date**: 2026-07-26

All shapes are defined in `data-model.md`. This document specifies only the
public surface of the module (what is exported and how it behaves).

---

## Exports

```js
export { createGame, legalMoves, applyMove }
```

No default export. No other symbols are exported.

---

## createGame(mode?)

Returns the initial game state.

`createGame` is not listed in the CLAUDE.md contract table (which covers `legalMoves`
and `applyMove`). It is added here because CA-M-01 specifies an observable initial state
and that state must be produced by something; without this factory no test for CA-M-01
can be written. It is the minimum surface required to make CA-M-01 verifiable.

### Signature

```js
createGame(mode = 'classic') -> State
```

### Behaviour

- `mode` must be `'classic'` or `'continuous'`. Any other value is undefined behaviour
  (no CA covers it; callers are responsible).
- Returns a fresh state with `board` = 9×null, `turn='X'`, `phase='placement'`,
  `piecesPlaced=0`, `result=null`.

### Covered criteria

CA-M-01

---

## legalMoves(state)

Returns the list of moves the current player may make.

### Signature

```js
legalMoves(state: State) -> Move[]
```

### Dispatch rules

| Condition | Returns |
|-----------|---------|
| `state.result ≠ null` | `[]` |
| `state.phase === 'placement'` | one `{type:'place', cell:i}` per `board[i]===null` |
| `state.phase === 'movement'` | one `{type:'move', from:i, to:j}` per `board[i]===state.turn` × `board[j]===null` (i≠j) |

### Postconditions

- Every element of the returned array is a valid move according to `applyMove`.
- Order of elements is unspecified; callers must not depend on it.
- Does not mutate `state`.

### Covered criteria

CA-M-09, CA-M-10, CA-M-11

---

## applyMove(state, move)

Applies a move and returns the resulting state, or returns a structured error.

### Signature

```js
applyMove(state: State, move: Move) -> State | ErrorResult
```

where `ErrorResult = { error: true, reason: string }`.

### Dispatch rules

The engine applies checks in this order and stops at the first match:

1. `state.result ≠ null` → `{error:true, reason:'game_over'}`
2. `move.player ≠ state.turn` → `{error:true, reason:'wrong_turn'}`
3. `move.type === 'move'` and `state.phase === 'placement'` → `{error:true, reason:'wrong_phase'}`
4. `move.type === 'place'` and `state.phase === 'movement'` → `{error:true, reason:'wrong_phase'}`
5. **Placement path** (`move.type === 'place'`):
   - `state.board[move.cell] ≠ null` → `{error:true, reason:'cell_occupied'}`
   - Otherwise: apply placement (see below)
6. **Movement path** (`move.type === 'move'`):
   - `state.board[move.from] === null` → `{error:true, reason:'no_mark_at_source'}`
   - `state.board[move.from] ≠ move.player` → `{error:true, reason:'not_own_mark'}`
   - `state.board[move.to] ≠ null` → `{error:true, reason:'cell_occupied'}`
   - Otherwise: apply movement (see below)

### Placement logic

1. Set `board[move.cell] = move.player` (new array, no mutation).
2. Increment `piecesPlaced`.
3. If `mode === 'continuous'` and new `piecesPlaced === 6`: set `phase = 'movement'`.
4. Flip `turn`.
5. Check winner (scan `WINNING_LINES`). If found: set `result = move.player`.
6. Else if `mode === 'classic'` and `piecesPlaced === 9`: set `result = 'draw'`.
   (Win takes precedence — step 5 runs first; CA-M-14.)
7. Return new state.

### Movement logic

1. Set `board[move.from] = null`, `board[move.to] = move.player` (new array, no mutation).
2. `piecesPlaced` unchanged (stays at 6).
3. Flip `turn`.
4. Check winner. If found: set `result = move.player`.
5. No draw possible in continuous movement phase (CA-M-17).
6. Return new state.

### Postconditions

- `state` is never mutated.
- On success, the returned object is a new State with all invariants satisfied.
- On error, the returned object has `error: true` and `reason` is one of the strings
  listed in `data-model.md`.

### Covered criteria

CA-M-02, CA-M-03, CA-M-04, CA-M-05, CA-M-06, CA-M-07, CA-M-08,
CA-M-12, CA-M-13, CA-M-14, CA-M-15, CA-M-16, CA-M-17, CA-M-18, CA-M-19
