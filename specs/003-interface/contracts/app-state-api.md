# App State API Contract

**Module**: `src/ui/app-state.js` | **Date**: 2026-07-27

All shapes are defined in `data-model.md`. This document specifies the public surface of the
internal UI-state module — the boundary `src/ui/render.js` and `src/ui/events.js` consume it
through. It is an internal contract (not exposed to `001-engine`/`002-agents`), documented the
same way for the same reason: so each of the three UI modules can be tested and changed against
a stable surface, per `research.md` D-I-01.

---

## Exports

```js
export {
  createAppState,
  startGame,
  applyPlayerMove,
  selectOwnMark,
  requestAgentMove,
  resolveAgentMove,
  restart,
}
```

No default export. Every export is a pure function: `(AppState, ...args) -> AppState`. None
mutate their input; none touch the DOM, a timer, or `Math.random` directly (timers are owned by
`events.js`, which calls `resolveAgentMove` when its `setTimeout` fires).

---

## createAppState()

```js
createAppState() -> AppState
```

Returns the initial `AppState`: `uiState: 'CONFIGURATION'`, `engineState: null`, an empty
`ConfigurationDraft`, `agentMemory: { simple: null, medium: null, complex: {} }`,
`scoreboard: { X: 0, O: 0, draw: 0 }`, `movementSelection: null`, `lastDecision: null`,
`pendingAgentMove: null`.

### Covered criteria
Supports CA-I-01 (nothing to cover directly; provides the state CA-I-01's controls read).

---

## startGame(state, config)

```js
startGame(state: AppState, config: ConfigurationDraft) -> AppState
```

Preconditions: `state.uiState === 'CONFIGURATION'` and `config` has all required fields set
(same check CA-I-02 requires of the "start" control).

Behavior: calls `createGame(config.mode)` (`specs/001-engine/contracts/engine-api.md`), stores it
as `engineState`, stores `config` as the frozen `config`, sets `uiState: 'IN_GAME'`.

### Covered criteria
CA-I-01, CA-I-02, CA-I-24 (config becomes read-only once this returns).

---

## applyPlayerMove(state, move)

```js
applyPlayerMove(state: AppState, move: Move) -> AppState
```

Preconditions: `state.uiState === 'IN_GAME'`.

Behavior: calls `applyMove(state.engineState, move)`. On success, updates `engineState`,
clears `movementSelection`, and — if the returned state's `result` is non-null — transitions
`uiState` to `FINISHED` and updates `scoreboard` (win count for a mark, draw count for
`'draw'`). On an `ErrorResult`, `AppState` is returned unchanged except for a transient
`lastError` field (rendered by CA-I-05/CA-I-21, not itself part of the state machine).

### Covered criteria
CA-I-03, CA-I-04, CA-I-05, CA-I-11, CA-I-14, CA-I-15, CA-I-21, CA-I-26.

---

## selectOwnMark(state, cell)

```js
selectOwnMark(state: AppState, cell: number) -> AppState
```

Preconditions: `state.uiState === 'IN_GAME'`, `state.engineState.phase === 'movement'`,
`state.engineState.board[cell] === state.engineState.turn`.

Behavior: if `cell === state.movementSelection`, clears the selection (D9, CA-I-27). Otherwise
sets `movementSelection: cell` (CA-I-25).

### Covered criteria
CA-I-07, CA-I-25, CA-I-27.

---

## requestAgentMove(state)

```js
requestAgentMove(state: AppState) -> AppState
```

Preconditions: `state.uiState === 'IN_GAME'`, it is the agent's turn per `state.config`.

Behavior: sets `uiState: 'WAITING_FOR_AGENT'`. Does **not** call `chooseMove` itself — `events.js`
calls `chooseMove` synchronously right after this transition and passes the resulting `Decision`
to `resolveAgentMove` once the 300ms floor (`research.md` D-I-05) has elapsed. Kept as two
separate functions (this one and `resolveAgentMove`) rather than one, because they cover two
distinct state-machine edges (CA-I-12 and CA-I-13) that must be independently observable in
tests without a fake timer forcing them together.

### Covered criteria
CA-I-06, CA-I-12, CA-I-22 (board disabled while in this state — enforced by `events.js` ignoring
input, not by this function, but the state it sets is what `events.js` checks).

---

## resolveAgentMove(state, decision)

```js
resolveAgentMove(state: AppState, decision: Decision) -> AppState
```

Preconditions: `state.uiState === 'WAITING_FOR_AGENT'`; called only after the 300ms floor has
elapsed (`events.js`'s responsibility, not this function's — see `research.md` D-I-05).

Behavior: stores `decision` as `lastDecision`; applies `decision.move` via `applyMove`; updates
`agentMemory` for the level that just moved from `decision.memory`; sets `uiState: 'IN_GAME'`
(and then, if the applied move ends the game, the same win/draw handling `applyPlayerMove`
performs — see `data-model.md`'s note on the `WAITING_FOR_AGENT → FINISHED` non-edge).

### Covered criteria
CA-I-09, CA-I-13.

---

## restart(state)

```js
restart(state: AppState) -> AppState
```

Preconditions: none — callable from any `uiState`.

Behavior: returns a fresh `AppState` (as `createAppState()`) except `scoreboard` and
`agentMemory` are carried over unchanged (CA-I-16's "preserving the session scoreboard";
`agentMemory`'s session-scoped persistence is `specs/002-agents` D6, unaffected by an in-session
restart).

### Covered criteria
CA-I-16, CA-I-23.
