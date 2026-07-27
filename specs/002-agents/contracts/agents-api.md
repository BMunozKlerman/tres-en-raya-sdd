# Agents API Contract

**Module**: `src/agents.js` | **Date**: 2026-07-27

All shapes are defined in `data-model.md`. This document specifies only the public surface of
the module (what is exported and how it behaves).

---

## ⚠️ Contract Change — supersedes `CLAUDE.md`

`CLAUDE.md`'s "Contracts" section sketches:

```
chooseMove(state, level, memory) -> {move, memory'}   // deterministic
```

That sketch predates group decision **D7**, which requires `chooseMove` to expose two
decision metrics — `nodesEvaluated` and `resolvedFromMemory` — as the sole observable evidence
that the complex level's memory is actually reused (CA-A-10; see `spec.md` § Design Decisions).
Without those fields, memory reuse has no way to be tested: minimax already selects an optimal
move whether or not a cache assists it, so the move alone cannot distinguish "used memory" from
"did not."

**The contract this feature implements is therefore:**

```js
chooseMove(state, level, memory, options?) -> Decision
```

where `Decision = { move, memory, nodesEvaluated, resolvedFromMemory }` (see `data-model.md`),
and `options` is a 4th, **optional** parameter (`{ random?: () => number }`) consumed only by
the simple level, added purely as a test/determinism seam (D-R-01, `research.md`) — it changes
no CA-tested behavior, since omitting it (the expected real-caller usage) defaults to
`Math.random` and every criterion is satisfied either way.

This plan is the authoritative record of the change; `CLAUDE.md`'s Contracts bullet and
`README.md` (if it echoes the signature) should be updated to match in a follow-up documentation
commit, the same way `specs/001-engine/contracts/engine-api.md` added `createGame(mode)` beyond
CLAUDE.md's original two-function sketch.

---

## Exports

```js
export { chooseMove }
```

No default export. No other symbols are exported. `HORIZON_DEPTH` and the static evaluation
function (`data-model.md`) are internal implementation details, not exported.

---

## chooseMove(state, level, memory, options?)

Resolves the current player's move for the requested agent level.

### Signature

```js
chooseMove(
  state:   State,             // specs/001-engine/data-model.md
  level:   'simple' | 'medium' | 'complex',
  memory:  Memory,             // level-scoped; see data-model.md
  options?: { random?: () => number }  // consumed only by 'simple'; defaults to Math.random
) -> Decision
```

### Preconditions

- `state` MUST be non-terminal (`state.result === null`). Behavior on a terminal state is
  undefined — no CA-ID requires a specific response, since `legalMoves(state)` would already
  return `[]` and every level's technique assumes at least one legal move exists.
- `memory` MUST be a value previously returned by `chooseMove` for the **same** `level`, or the
  level's initial value (`null` for simple and medium; `{}` for complex, an empty transposition
  table). Passing memory produced by a different level is undefined behavior (Assumptions,
  `spec.md`).

### Dispatch by level

| Level | Technique | Memory read? | `nodesEvaluated` meaning |
|-------|-----------|--------------|--------------------------|
| `simple` | Uniform random pick over `legalMoves(state)`, via `options.random` (default `Math.random`) | No — always echoed back unchanged | `legalMoves(state).length` (moves considered, not searched) |
| `medium` | Win-this-turn check, then block-next-turn check, then first legal move (D-R-03) | No — always discarded; `memory'` is always `null` | Number of `applyMove` scratch calls made while checking win/block (≤ 2 × `legalMoves(state).length`) |
| `complex` | Minimax + alpha-beta; exhaustive in classic mode, bounded by `HORIZON_DEPTH` in continuous mode; transposition-table lookup first (D-R-04, D-R-06) | Yes — table lookup/write keyed by canonical position | Nodes visited during *this* call's search; `1` on a cache hit |

### Postconditions

- `decision.move` is an element of `legalMoves(state)` (CA-A-01, CA-A-03, CA-A-07, CA-A-14).
- `decision.memory` is the value the caller must pass to the next `chooseMove` call for the same
  level (and, for `complex`, the same session) to preserve continuity (D6, D7, CA-A-10).
- Does not mutate `state` or the incoming `memory` object — `agents.js` follows the same
  immutability discipline as `engine.js` (constitution P2), returning a new memory object rather
  than mutating the one it received, so a caller retaining a reference to the old memory value
  is unaffected.
- Deterministic for `medium` and `complex`: same `state` + same `memory` (+ no `options` for
  `simple`, which is level-irrelevant here) ⇒ same `decision.move` on every call (CA-A-11,
  CA-A-12).

### Covered criteria

CA-A-01, CA-A-02, CA-A-03, CA-A-04, CA-A-05, CA-A-06, CA-A-07, CA-A-08, CA-A-09, CA-A-10,
CA-A-11, CA-A-12, CA-A-13, CA-A-14, CA-A-15, CA-A-16, CA-N-01
