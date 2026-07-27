# Data Model: Game Interface

**Branch**: `main` (003-interface) | **Date**: 2026-07-27 | **Phase**: 1

All shapes below are plain JavaScript objects — no classes, no inheritance (see `research.md`
D-I-01 on why Liskov Substitution and Interface Segregation are not applicable here). This is
UI-only state, layered strictly on top of `specs/001-engine/data-model.md`'s `State` and
`specs/002-agents/contracts/agents-api.md`'s `Decision`; it introduces no new engine or agent
behavior.

---

## AppState

The single object owned by `src/ui/app-state.js`, read by `src/ui/render.js`, and transitioned
by `src/ui/events.js`.

```js
{
  uiState:           string,          // 'CONFIGURATION' | 'IN_GAME' | 'WAITING_FOR_AGENT' | 'FINISHED'
  config:            ConfigurationDraft,
  engineState:       State | null,    // specs/001-engine/data-model.md; null while uiState === 'CONFIGURATION'
  agentMemory:       AgentMemoryBank,
  scoreboard:        Scoreboard,
  movementSelection: number | null,   // selected own-mark cell index during continuous movement phase, or null
  lastDecision:      Decision | null, // last chooseMove() return value; null until the agent has moved once
  pendingAgentMove:  PendingAgentMove | null,
}
```

### Field invariants

| Field | `CONFIGURATION` | `IN_GAME` | `WAITING_FOR_AGENT` | `FINISHED` |
|-------|------------------|-----------|----------------------|------------|
| `engineState` | `null` | non-null, `result === null` | non-null, `result === null` | non-null, `result !== null` |
| `movementSelection` | `null` | `null` \| cell index (continuous, movement phase, own mark selected) | `null` | `null` |
| `pendingAgentMove` | `null` | `null` | non-null (set the instant `chooseMove` resolves) | `null` |
| `config` | editable | frozen (CA-I-24) | frozen | frozen |

---

## ConfigurationDraft

The player's in-progress choices before a game starts (US-I-1).

```js
{
  opponentType: 'human' | 'agent' | null,
  agentLevel:   'simple' | 'medium' | 'complex' | null, // required only when opponentType === 'agent'
  marks:        { player1: 'X' | 'O' | null },           // player2's mark is always the complement
  mode:         'classic' | 'continuous' | null,
}
```

`start` (CA-I-02) is enabled only when `opponentType`, `marks.player1`, and `mode` are all
non-null, and `agentLevel` is non-null whenever `opponentType === 'agent'`.

---

## AgentMemoryBank

Per-level memory, carried across games within the session (`specs/002-agents/spec.md` D6/D7 —
"persistent memory" means session-scoped, not page-reload-persisted). Reset only by a page
reload (out of scope for this feature — see spec.md Out of Scope).

```js
{
  simple:  null,        // simple level never reads memory; always echoed back unchanged
  medium:  null,        // medium level never reads memory; always echoed back unchanged
  complex: {},           // transposition table; grows across games in the session (CA-A-10)
}
```

The value for the level currently in play is threaded through every `chooseMove` call and
updated from `decision.memory` after each call, per `specs/002-agents/contracts/agents-api.md`'s
postconditions.

---

## Scoreboard

```js
{
  X:    number, // games won by X, this session
  O:    number, // games won by O, this session
  draw: number, // classic-mode draws, this session (continuous mode never contributes — CA-M-17)
}
```

Initialized to `{ X: 0, O: 0, draw: 0 }` when the application loads; never reset by `restart`
(CA-I-16), only by a page reload (out of scope).

---

## PendingAgentMove

UI-only bookkeeping for CA-I-10's minimum-visible-duration floor (`research.md` D-I-05).

```js
{
  move: Move,   // specs/001-engine/data-model.md Move shape — already computed by chooseMove
  readyAt: number, // timer handle or scheduled-apply marker; opaque to render.js
}
```

Set the instant `chooseMove` returns (the move is known); the move is applied via `applyMove`
only when the associated `setTimeout(..., 300)` fires, at which point `pendingAgentMove` is
cleared and `uiState` transitions back to `IN_GAME` (CA-I-13).

---

## Movement Selection (continuous mode, movement phase)

Not a separate object — a single `number | null` field on `AppState` (the selected own-mark
cell index, or `null`). Derived UI state, not part of the engine's `State`
(`specs/001-engine/data-model.md`): computed by filtering `legalMoves(engineState)` to entries
whose `from` equals `movementSelection`, to determine which destination cells to highlight
(CA-I-07, CA-I-25). Cleared by: applying a move (CA-I-26), reselecting the same mark (CA-I-27,
D9), or restart (CA-I-23).

---

## DOM/ARIA contract surface

See `contracts/dom-contract.md` for the concrete `data-*` attributes, roles, and element
structure that `render.js` guarantees and that `events.js` and the test suite depend on.

---

## UI State Machine

```
CONFIGURATION --(CA-I-02: start, all required fields set)--> IN_GAME
IN_GAME --(CA-I-12: agent's turn)--> WAITING_FOR_AGENT
WAITING_FOR_AGENT --(CA-I-13: move ready AND >=300ms elapsed)--> IN_GAME
IN_GAME --(CA-I-04: win) or (CA-I-11: classic draw)--> FINISHED
any state --(CA-I-16 / CA-I-23: restart)--> CONFIGURATION  (scoreboard preserved)
```

No other transitions exist. `WAITING_FOR_AGENT → FINISHED` is not a direct edge: the agent's
move is applied via `applyMove` while transitioning `WAITING_FOR_AGENT → IN_GAME` (CA-I-13), and
if that move ends the game, `IN_GAME → FINISHED` fires immediately after, in the same input
handler tick — both edges remain individually traceable to their own criterion.
