# Tasks: Game Interface

**Feature**: `003-interface` | **Date**: 2026-07-27
**Input**: `specs/003-interface/plan.md`, `spec.md`, `research.md`, `data-model.md`,
`contracts/app-state-api.md`, `contracts/dom-contract.md`, `manual-verification.md`

**Method**: TDD — every criterion has one RED commit (failing test) that precedes its GREEN
commit (minimum implementation). The full suite must be green on every GREEN commit before it is
pushed. Numbering continues the single linear commit history on `main` (no dedicated feature
branch — see `CLAUDE.md` session log, 2026-07-27) immediately after `001-engine`'s `T-059`
(BUG-007 GREEN, commit `cef0a5b`) — confirmed with the user 2026-07-27, since `002-agents`
already closed at `T-057` and no `T-060` exists anywhere in the repo. The first task here is
`T-060`.

**Total tasks**: 44 (T-060 to T-103), plus one untracked bug-fix commit (BUG-009, no `T-NNN`,
between T-100 and T-101 — see Phase 7.5). Originally 42 (T-060–T-101); grew by 2 when CA-I-33 was
added post-implementation (BUG-008, `spec.md` Amendments) — see Phase 7.5 below.

**Grouping principle** (same standard as `001-engine`'s and `002-agents`'s): one RED/GREEN pair
per criterion or per homogeneous group (same contract function, same code layer). Where
`contracts/app-state-api.md` explicitly lists several `CA-I-nn` IDs as the "Covered criteria" of
one function (e.g. `startGame` → CA-I-01, CA-I-02, CA-I-24), that function's implementation is
one RED/GREEN pair. A criterion's **test** always lands in the exact file `traceability.md`'s
skeleton already assigns it, even when its RED task also touches a sibling file in the same
commit (e.g. a task implementing `startGame` adds assertions to both
`us-i1-configuration.test.js` and `edge-cases.test.js`, mirroring how `002-agents`'s T-036 wrote
to three files in one RED commit).

**Vertical-slice note**: unlike `001-engine`/`002-agents` (one pure file, `src/engine.js` /
`src/agents.js`), this feature's criteria are only observable through the full stack
(`app-state.js` → `render.js` → `events.js`, mounted in a real DOM). Each GREEN task therefore
grows all three modules together for the slice of behavior it covers — the same incremental
pattern `002-agents` used to grow `src/agents.js` level by level, applied here across three files
instead of one. `src/ui/app-state.js`, `src/ui/render.js`, and `src/ui/events.js` are each first
created in T-062 (the first behavioral GREEN task) with only the configuration-slice functions
populated; later tasks add functions to the same three files incrementally.

**Post-generation split (self-review, applied before this file was finalized)**: the original
single "responsive CSS" pair covering all five of CA-I-28/29/30/31/32 in one commit was judged
too large — writing the full mobile-first stylesheet (page layout fluidity, the 768px breakpoint,
the square board, every control's touch target, and the configuration panel's overflow behavior)
in one commit risks the same "task most likely to exceed one commit" pattern `/speckit-analyze`
flagged for `002-agents`'s original T-047. Split into T-093/T-094 (page-layout structural
assertions: CA-I-28, CA-I-29) and T-095/T-096 (component-level structural assertions: CA-I-30,
CA-I-31, CA-I-32). (Numbers as renumbered by the `/speckit-analyze` correction below — originally
T-091/T-092 and T-093/T-094 before the CA-I-09 integration pair was inserted.)

**Post-analysis correction** (`/speckit-analyze` on `003-interface`, applied before implementation
started — no task had been executed yet, so this is a plan-cycle correction, not a T-NNN GREEN
rewrite): three findings from that analysis are folded in here. (1) CA-I-05's RED/GREEN pair
(T-063/T-064) is extended to cover the engine's full `ErrorResult.reason` enumeration, including
`game_over`, which the original task description omitted — `spec.md`'s CA-I-05 Notes now lists it
too. (2) A new RED/GREEN pair, **T-081/T-082**, is inserted immediately after the original CA-I-09
pair (T-079/T-080) to test the real cross-game memory-reuse integration that T-079/T-080 alone
does not exercise (that pair only proves `render.js` reads `lastDecision.resolvedFromMemory`
correctly from a hand-built `Decision`, not that `events.js`'s real `agentMemory` threading across
two consecutive games actually produces one). Every task from the original T-081 onward is
renumbered +2 (T-081→T-083, ..., T-099→T-101), mirroring the same renumbering `002-agents` did
when its T-047/T-048 split was inserted mid-sequence after that feature's own `/speckit-analyze`
pass. (3) `data-model.md`'s `PendingAgentMove` entity and `AppState.pendingAgentMove` field were
removed as obsolete (superseded by `research.md` D-I-05's actual mechanism — the pending move is
held in an `events.js` closure via `setTimeout`, never in `AppState`) — no task ever referenced
that field, so no task text changes for this one, only `data-model.md` and
`contracts/app-state-api.md`.

---

## Phase 1: Tooling (infrastructure — no behavioral CA-ID)

**Purpose**: Traceability gate (P6) and project scaffold (P1), same precedent as `001-engine`'s
T-001/T-002 (the only tasks in that feature without CA-IDs, explicitly labeled tooling). T-060 is
the only task here without a CA-ID. `scripts/verify-traceability.mjs` needs no change — it
already derives `tests/interface/` from the `003-interface` folder name generically (fixed by
BUG-006 during `002-agents`).

- [ ] T-060 Add `jsdom` to `package.json`'s `devDependencies` (documented P1 exception, already
  recorded in `plan.md`'s Complexity Tracking — this task only executes the install, it does not
  re-justify it). Create `index.html` at the repo root (Vite entry point, loads `src/ui.js` and
  `src/styles.css`, one `<div id="app"></div>` mount point). Create `src/ui.js` exporting
  `mountApp(root)` (currently an empty stub — populated incrementally starting in T-062) and
  calling it on `DOMContentLoaded` when run in a real browser. Create `src/styles.css` with only a
  minimal, empty-page-safe reset (`box-sizing: border-box` universal rule; no layout rules yet —
  those start in T-093). Create the `tests/interface/` directory. Document the per-file
  `// @vitest-environment jsdom` pragma convention (`research.md` D-I-03) as the first line of
  every file subsequently created under `tests/interface/` — no `vitest.config.js` change needed,
  since its `test.environment` stays `'node'` for `001-engine`/`002-agents`. No test is written for
  this task (pure scaffold, same precedent as `001-engine`'s T-002). Expected commit: `T-060:
  scaffold interface project (index.html, src/ui.js, src/styles.css, jsdom devDependency)`

---

## Phase 2: US-I-1 — Configure the Game (Priority: P1)

**Goal**: `createAppState`/`startGame` (`src/ui/app-state.js`), configuration rendering
(`src/ui/render.js`), and the start-button click handler (`src/ui/events.js`) fully implemented.

**Prerequisite**: T-060 complete.

### Configuration controls, start transition, and config lockout (CA-I-01, CA-I-02, CA-I-24)

_Grouped: all three are `startGame`'s declared "Covered criteria" in `contracts/
app-state-api.md` — one function, one code layer. CA-I-24's test lives in `edge-cases.test.js`
per the traceability skeleton even though it is established here, same as `002-agents`'s
CA-A-11/CA-A-12 living in `us-a2-determinism.test.js` while being established inside a base-stub
pair._

- [ ] T-061 [US-I-1] [AC: CA-I-01, CA-I-02, CA-I-24] RED — Create
  `tests/interface/us-i1-configuration.test.js` (first line `// @vitest-environment jsdom`) with
  `describe('CA-I-01 — configuration controls displayed', ...)`: mount the app into a fresh jsdom
  `document.body`, assert `[data-config-opponent]`, `[data-config-mark]`, `[data-config-mode]` are
  present, `[data-config-agent-level]` is absent until opponent type is set to `"agent"`, at which
  point it appears (per `dom-contract.md`'s conditional-rendering note). Add
  `describe('CA-I-02 — start transitions CONFIGURATION to IN_GAME', ...)`: assert
  `[data-start-button]` carries `disabled` while any required field is unset; set all required
  fields (opponent, mark, mode, and agent level when opponent is `"agent"`); assert `disabled` is
  removed; click it; assert `[data-board]` cells become interactive (uiState left
  `CONFIGURATION`). Create `tests/interface/edge-cases.test.js` (first line
  `// @vitest-environment jsdom`) with `describe('CA-I-24 — configuration inaccessible outside
  CONFIGURATION', ...)`: after starting a game, assert all four config controls and
  `[data-start-button]` carry `disabled`. All three fail because `mountApp` is still an empty
  stub. Expected commit: `test(CA-I-01,CA-I-02,CA-I-24): failing tests — configuration controls,
  start transition, config lockout`

- [ ] T-062 [US-I-1] [AC: CA-I-01, CA-I-02, CA-I-24] GREEN — Create `src/ui/app-state.js`
  exporting `createAppState()` and `startGame(state, config)` exactly per
  `contracts/app-state-api.md` (config validity check, `createGame(config.mode)` from
  `specs/001-engine`, `uiState: 'IN_GAME'` on success). Create `src/ui/render.js` exporting a
  `render(root, state)` function that, for now, only draws the four configuration controls, the
  start button (`disabled` per CA-I-02's precondition, and per CA-I-24 whenever
  `uiState !== 'CONFIGURATION'`), and an empty `[data-board]` with `[data-cell="0"]`…
  `[data-cell="8"]` as `<button>` elements (structure only — cell content/state added in T-064).
  Create `src/ui/events.js` exporting `attachEvents(root, getState, setState)` wiring the four
  config controls' `change` events and the start button's `click` event to `startGame` +
  re-render. Wire all three into `src/ui.js`'s `mountApp`. `npm test` must be fully green.
  Expected commit: `T-062: configuration controls, start transition, config lockout (CA-I-01,
  CA-I-02, CA-I-24)`

---

## Phase 3: US-I-2 — Play With Clear State Feedback (Priority: P1)

**Goal**: `applyPlayerMove`, `selectOwnMark`, `requestAgentMove`, `resolveAgentMove`
(`src/ui/app-state.js`), the corresponding DOM output (`src/ui/render.js`), and click/timer
wiring (`src/ui/events.js`) fully implemented.

**Prerequisite**: T-062 GREEN complete.

### Turn indicator, illegal-move rejection, occupied-cell edge case (CA-I-03, CA-I-05, CA-I-21)

_Grouped: the base success/error path of `applyPlayerMove`, per `contracts/app-state-api.md` —
one function. CA-I-21 is the occupied-cell instance of the same `ErrorResult` handling CA-I-05
establishes generally; its test lives in `edge-cases.test.js` per the skeleton._

- [ ] T-063 [US-I-2] [AC: CA-I-03, CA-I-05, CA-I-21] RED — Create
  `tests/interface/us-i2-state-feedback.test.js` (`// @vitest-environment jsdom`) with
  `describe('CA-I-03 — turn indicator', ...)`: after starting a human-vs-human classic game,
  assert `[data-turn-indicator]`'s text names the current mark; click a legal cell; assert the
  text now names the other mark. Add `describe('CA-I-05 — illegal move rejected with reason',
  ...)`: click a cell with the wrong player's turn forced via a direct `applyPlayerMove` call with
  a mismatched mark (or, if `events.js` never allows constructing that request, use
  `app-state.js`'s `applyPlayerMove` directly against an `AppState`); assert `[data-error-
  indicator]`'s text is non-empty and the board is unchanged. Add a second case to the same
  `describe`: call `applyPlayerMove` directly against an `AppState` whose `engineState.result` is
  already non-null (a finished game); assert `[data-error-indicator]` states a distinct
  `'game_over'` reason and the board is unchanged — covering the full `ErrorResult.reason`
  enumeration `specs/001-engine/contracts/engine-api.md` defines
  (`wrong_turn`, `cell_occupied`, `wrong_phase`, `no_mark_at_source`, `not_own_mark`,
  `game_over`), not only the subset reachable through normal click flow, per `spec.md`'s CA-I-05
  Notes. Add to `edge-cases.test.js`: `describe('CA-I-21 — occupied cell rejected', ...)`: click
  an already-occupied cell; assert `[data-error-indicator]` states the "cell occupied" reason and
  the board is unchanged. All fail because `applyPlayerMove` does not exist yet. Expected commit:
  `test(CA-I-03,CA-I-05,CA-I-21): failing tests — turn indicator, illegal move rejection
  (including game_over), occupied cell`

- [ ] T-064 [US-I-2] [AC: CA-I-03, CA-I-05, CA-I-21] GREEN — In `src/ui/app-state.js`, add
  `applyPlayerMove(state, move)` per `contracts/app-state-api.md`: call `applyMove` from
  `specs/001-engine`; on success update `engineState`; on an `ErrorResult`, return `state`
  unchanged except a transient `lastError` field, for every `reason` value the engine can return
  (including `game_over`), not a hand-picked subset. In `render.js`, populate each `[data-cell]`'s
  `data-cell-state` (`"empty" | "own" | "opponent"`), add `[data-turn-indicator]` text content
  (whose turn, which mark), and `[data-error-indicator]` text content from `lastError`, with a
  player-facing message for each of the six `reason` values. In `events.js`, wire each board
  cell's `click` to `applyPlayerMove` + re-render. `npm test` must be fully green. Expected
  commit: `T-064: turn indicator, illegal move rejection (including game_over), occupied cell
  (CA-I-03, CA-I-05, CA-I-21)`

### Winning line highlight, block further moves, scoreboard win increment (CA-I-04, CA-I-14)

_Grouped: `applyPlayerMove`'s win branch (CA-I-04) and its scoreboard side effect (CA-I-14) are
the same code path — `contracts/app-state-api.md` lists both under `applyPlayerMove`. CA-I-14's
test lives in `us-i3-scoreboard.test.js` per the skeleton._

- [ ] T-065 [US-I-2] [AC: CA-I-04, CA-I-14] RED — Add to `us-i2-state-feedback.test.js`:
  `describe('CA-I-04 — winning line highlighted, moves blocked', ...)`: drive a classic game to a
  win (reuse a hand-verified winning sequence, same discipline as `001-engine`'s BUG-002/
  `002-agents`'s BUG-005 fixture corrections); assert `[data-winning="true"]` is present on
  exactly the three winning cells (`engineState.winningLine`) and that clicking any remaining
  empty cell has no effect on the board afterward. Create
  `tests/interface/us-i3-scoreboard.test.js` (`// @vitest-environment jsdom`) with
  `describe('CA-I-14 — win increments scoreboard', ...)`: after the same win, assert
  `[data-score="<winning mark>"]`'s text content is `"1"` and the other counts are unchanged. Both
  fail because `applyPlayerMove` never checks `result` yet. Expected commit: `test(CA-I-04,
  CA-I-14): failing tests — winning line highlight, block further moves, scoreboard win
  increment`

- [ ] T-066 [US-I-2] [AC: CA-I-04, CA-I-14] GREEN — In `app-state.js`'s `applyPlayerMove`, after a
  successful `applyMove`, if the returned state's `result` is a mark: set `uiState: 'FINISHED'`
  and increment `scoreboard[result]`. In `render.js`, when `engineState.result` is a mark, apply
  `data-winning="true"` plus a visible text/icon child (e.g. `"★"`) to each cell in
  `engineState.winningLine` (never color alone, per CA-I-08's global rule — verified again in
  T-069/T-070), set `[data-result-indicator]` text to the winning mark, and disable every
  `[data-cell]`. Render `[data-score="X"]`, `[data-score="O"]`, `[data-score="draw"]` from
  `state.scoreboard`. `npm test` must be fully green. Expected commit: `T-066: winning line
  highlight, block further moves, scoreboard win increment (CA-I-04, CA-I-14)`

### Draw indicator, block further moves, scoreboard draw increment (CA-I-11, CA-I-15)

_Grouped: same `applyPlayerMove` branch as CA-I-04/CA-I-14, the draw case instead of the win case
— per `spec.md`'s CA-I-11 Notes, "the draw-case counterpart to CA-I-04"._

- [ ] T-067 [US-I-2] [AC: CA-I-11, CA-I-15] RED — Add to `us-i2-state-feedback.test.js`:
  `describe('CA-I-11 — draw indicator, moves blocked', ...)`: drive a classic game to a full-board
  draw (hand-verified fixture, no winner); assert `[data-result-indicator]` states a draw and
  every `[data-cell]` carries `disabled`. Add to `us-i3-scoreboard.test.js`:
  `describe('CA-I-15 — draw increments scoreboard', ...)`: after the same draw, assert
  `[data-score="draw"]`'s text content is `"1"` and the win counts are unchanged. Both fail
  because `applyPlayerMove` only branches on a mark result, not `'draw'`. Expected commit:
  `test(CA-I-11,CA-I-15): failing tests — draw indicator, block further moves, scoreboard draw
  increment`

- [ ] T-068 [US-I-2] [AC: CA-I-11, CA-I-15] GREEN — In `app-state.js`'s `applyPlayerMove`, extend
  the post-move check: if `result === 'draw'`, set `uiState: 'FINISHED'` and increment
  `scoreboard.draw`. In `render.js`, when `engineState.result === 'draw'`, set
  `[data-result-indicator]` text to a draw message and disable every `[data-cell]` (shares the
  disable logic T-066 added for the win case). `npm test` must be fully green. Expected commit:
  `T-068: draw indicator, block further moves, scoreboard draw increment (CA-I-11, CA-I-15)`

### Color-independent information (CA-I-08)

_Corollary of CA-I-03/CA-I-04/CA-I-05 (already built): each already carries a text/icon
alongside any visual state per T-064/T-066. This pair adds the dedicated cross-cutting test and,
where a gap is found, the missing text/icon node — not a new code layer._

- [ ] T-069 [US-I-2] [AC: CA-I-08] RED — Add to `us-i2-state-feedback.test.js`:
  `describe('CA-I-08 — information conveyed without color alone', ...)`: for the turn indicator,
  a rejected move, and a winning line (three sub-assertions in one `describe`, reusing fixtures
  from T-064/T-066), assert each relies on `textContent` or a `data-*`-driven icon node, never a
  bare CSS class as the only signal (i.e., a DOM query that ignores `class` attributes and reads
  only text/`data-*` still recovers the same information). Expected to fail only if any of the
  three states T-064/T-066 built turns out to rely on a class-only signal with no accompanying
  text/icon. Expected commit: `test(CA-I-08): failing test — information conveyed without color
  alone`

- [ ] T-070 [US-I-2] [AC: CA-I-08] GREEN — If T-069 reveals a gap (a state signaled only by a CSS
  class), add the missing `textContent`/icon child node in `render.js` for that state; if no gap
  exists, this task requires no production change (T-064/T-066 already satisfy CA-I-08 as a
  corollary — same pattern as `002-agents`'s CA-A-14/CA-A-13 zero-code GREEN commits). `npm test`
  must be fully green. Expected commit: `T-070: confirm/complete color-independent information
  (CA-I-08)`

### Movement-phase own-mark selection (CA-I-07, CA-I-25, CA-I-27)

_Grouped: `selectOwnMark`'s declared "Covered criteria" in `contracts/app-state-api.md` — one
function (select-to-highlight and D9's reselect-to-cancel are the same dispatch branch)._

- [ ] T-071 [US-I-2] [AC: CA-I-07, CA-I-25, CA-I-27] RED — Add to `us-i2-state-feedback.test.js`:
  `describe('CA-I-07 — movement-phase legal marks and destinations indicated', ...)`: start a
  continuous-mode game and drive it to the movement phase (6 placements); assert every own-mark
  cell that has at least one legal destination is distinguishable (e.g. a
  `data-movable="true"` attribute) via `legalMoves(state)`'s `{type:'move', from, ...}` entries.
  Add to `edge-cases.test.js`: `describe('CA-I-25 — own-mark selection highlights destinations',
  ...)`: click an own mark; assert `[data-selected="true"]` on it and `[data-destination="true"]`
  on each of its legal destination cells. Add `describe('CA-I-27 — reselecting own mark cancels
  selection', ...)`: click the same mark again; assert `data-selected` and `data-destination` are
  all cleared. All three fail because `selectOwnMark` does not exist yet. Expected commit:
  `test(CA-I-07,CA-I-25,CA-I-27): failing tests — movement-phase selection, highlighting, and
  cancellation`

- [ ] T-072 [US-I-2] [AC: CA-I-07, CA-I-25, CA-I-27] GREEN — In `app-state.js`, add
  `selectOwnMark(state, cell)` per `contracts/app-state-api.md`: toggles `movementSelection` off
  if `cell` is already selected (D9, CA-I-27), else sets it (CA-I-25). In `render.js`, during the
  movement phase, compute destination cells by filtering `legalMoves(engineState)` to entries
  whose `from` equals `movementSelection` (or, when nothing is selected, mark every own cell with
  at least one legal `from` entry as `data-movable="true"`, satisfying CA-I-07); apply
  `data-selected="true"` / `data-destination="true"` accordingly. In `events.js`, wire an own-mark
  cell's `click`, during the movement phase, to `selectOwnMark` instead of `applyPlayerMove`.
  `npm test` must be fully green. Expected commit: `T-072: movement-phase selection, highlighting,
  cancellation (CA-I-07, CA-I-25, CA-I-27)`

### Movement-phase move application (CA-I-26)

_Own pair: `applyPlayerMove`'s handling of a `{type:'move', from, to}` request built from
`movementSelection` — `contracts/app-state-api.md` lists CA-I-26 under `applyPlayerMove`, a
different function than T-071/T-072's `selectOwnMark`, so it is not grouped with them._

- [ ] T-073 [US-I-2] [AC: CA-I-26] RED — Add to `edge-cases.test.js`: `describe('CA-I-26 —
  destination selection applies the move', ...)`: select an own mark, then click one of its
  highlighted destination cells; assert the move was applied (origin cell now empty, destination
  cell carries the mover's mark) and `movementSelection` is cleared. Fails because clicking a
  `[data-destination]` cell currently does nothing (T-072 wired selection, not application).
  Expected commit: `test(CA-I-26): failing test — destination selection applies the move`

- [ ] T-074 [US-I-2] [AC: CA-I-26] GREEN — In `events.js`, wire a destination cell's `click`,
  while `movementSelection` is non-null, to call `applyPlayerMove(state, {type: 'move', from:
  state.movementSelection, to: cell})`, which `app-state.js`'s existing `applyPlayerMove` (T-064)
  already handles via `applyMove`'s movement path; clear `movementSelection` on success (already
  part of `applyPlayerMove`'s contract). `npm test` must be fully green. Expected commit: `T-074:
  movement-phase move application (CA-I-26)`

### Waiting state, IN_GAME → WAITING_FOR_AGENT transition, input ignored while waiting (CA-I-06, CA-I-12, CA-I-22)

_Grouped: `requestAgentMove`'s declared "Covered criteria" in `contracts/app-state-api.md` — one
function. CA-I-22's test lives in `edge-cases.test.js` per the skeleton._

- [ ] T-075 [US-I-2] [AC: CA-I-06, CA-I-12, CA-I-22] RED — Create
  `tests/interface/us-i2-waiting-state.test.js` (`// @vitest-environment jsdom`) with
  `describe('CA-I-06 — waiting state shown, board disabled', ...)`: start a human-vs-agent game;
  make the human's move so it becomes the agent's turn; assert `[data-waiting-indicator]` is
  present and every `[data-cell]` carries `disabled`. Add `describe('CA-I-12 — IN_GAME to
  WAITING_FOR_AGENT transition', ...)`: assert the transition happens synchronously the instant
  it becomes the agent's turn (before any timer fires). Add to `edge-cases.test.js`:
  `describe('CA-I-22 — input ignored during WAITING_FOR_AGENT', ...)`: click a board cell while
  `[data-waiting-indicator]` is present; assert the board is unchanged. All three fail because
  `requestAgentMove` does not exist yet. Expected commit: `test(CA-I-06,CA-I-12,CA-I-22): failing
  tests — waiting state, IN_GAME to WAITING_FOR_AGENT transition, input ignored while waiting`

- [ ] T-076 [US-I-2] [AC: CA-I-06, CA-I-12, CA-I-22] GREEN — In `app-state.js`, add
  `requestAgentMove(state)` per `contracts/app-state-api.md`: sets `uiState:
  'WAITING_FOR_AGENT'` only (does not call `chooseMove` itself — that is T-077/T-078's
  responsibility in `events.js`). In `events.js`, after a human move whose resulting `state.turn`
  belongs to the configured agent, call `requestAgentMove` + re-render immediately (synchronous,
  CA-I-12), and ignore every board-cell `click` while `uiState === 'WAITING_FOR_AGENT'` (CA-I-22).
  In `render.js`, render `[data-waiting-indicator]` and `disabled` on every `[data-cell]` while
  `uiState === 'WAITING_FOR_AGENT'`. `npm test` must be fully green. Expected commit: `T-076:
  waiting state, IN_GAME to WAITING_FOR_AGENT transition, input ignored while waiting (CA-I-06,
  CA-I-12, CA-I-22)`

### 300ms minimum waiting duration and WAITING_FOR_AGENT → IN_GAME transition (CA-I-10, CA-I-13)

_Grouped: the `setTimeout(..., 300)` floor and `resolveAgentMove`'s transition are one mechanism
per `research.md` D-I-05 — the floor exists specifically to gate when `resolveAgentMove` may run._

- [ ] T-077 [US-I-2] [AC: CA-I-10, CA-I-13] RED — Add to `us-i2-waiting-state.test.js`, using
  `vi.useFakeTimers()` (per `research.md` D-I-05's test approach): trigger the agent's turn;
  assert `uiState` is `WAITING_FOR_AGENT` immediately after the synchronous `chooseMove` call
  returns. `describe('CA-I-10 — waiting state visible for at least 300ms', ...)`: advance fake
  time by 299ms; assert `uiState` is still `WAITING_FOR_AGENT`, the move is not yet applied, and
  the board is still disabled. `describe('CA-I-13 — WAITING_FOR_AGENT to IN_GAME transition after
  floor elapses', ...)`: advance fake time to 300ms total; assert `uiState` is `IN_GAME` and
  `engineState` reflects the agent's move. Fails because `resolveAgentMove` does not exist and no
  timer is started yet. Expected commit: `test(CA-I-10,CA-I-13): failing tests — 300ms minimum
  waiting duration, WAITING_FOR_AGENT to IN_GAME transition`

- [ ] T-078 [US-I-2] [AC: CA-I-10, CA-I-13] GREEN — In `app-state.js`, add
  `resolveAgentMove(state, decision)` per `contracts/app-state-api.md`: stores `decision` as
  `lastDecision`, applies `decision.move` via the existing `applyPlayerMove`-equivalent logic
  (reuse `applyMove` directly, since the move is already chosen), updates `agentMemory`, sets
  `uiState: 'IN_GAME'` (then `'FINISHED'` immediately after if the applied move ends the game,
  sharing T-066/T-068's win/draw handling). In `events.js`, per `research.md` D-I-05: call
  `chooseMove` synchronously right after `requestAgentMove` (T-076), start `setTimeout(() =>
  resolveAgentMove(...), 300)`, and only re-render on that timer firing. `npm test` must be fully
  green. Expected commit: `T-078: 300ms minimum waiting duration, WAITING_FOR_AGENT to IN_GAME
  transition (CA-I-10, CA-I-13)`

### Memory-reuse indicator (CA-I-09)

_Own pair: `resolveAgentMove` already stores `lastDecision` (T-078); this task only adds the
`render.js` output for `resolvedFromMemory`, per `research.md` D-I-06 — a different concern from
the timing mechanism T-077/T-078 cover, kept separate for the same reason `002-agents` kept D7's
`nodesEvaluated` and `resolvedFromMemory` as two named fields rather than one._

- [ ] T-079 [US-I-2] [AC: CA-I-09] RED — Add to `us-i2-state-feedback.test.js`: `describe('CA-I-09
  — resolvedFromMemory indicator', ...)`: drive a complex-level game through `resolveAgentMove`
  (via fake timers, as in T-077) once with a `Decision` whose `resolvedFromMemory` is `false` and
  once (a later call, same session) whose `resolvedFromMemory` is `true`; assert
  `[data-memory-indicator]` is absent after the first and present after the second. Fails because
  `render.js` never reads `lastDecision.resolvedFromMemory`. Expected commit: `test(CA-I-09):
  failing test — resolvedFromMemory indicator`

- [ ] T-080 [US-I-2] [AC: CA-I-09] GREEN — In `render.js`, render `[data-memory-indicator]` only
  when `state.lastDecision?.resolvedFromMemory === true` (naturally absent before the first agent
  move and after any decision with `resolvedFromMemory: false`, since `lastDecision` is
  overwritten each turn — no extra "clear" logic needed, per `research.md` D-I-06). `npm test`
  must be fully green. Expected commit: `T-080: resolvedFromMemory indicator (CA-I-09)`

### Real cross-game memory-reuse integration (CA-I-09, continued)

_Added by `/speckit-analyze` (2026-07-27): T-079/T-080 only prove `render.js` reads
`lastDecision.resolvedFromMemory` from a hand-built `Decision` object passed directly to
`resolveAgentMove` — they never exercise `events.js`'s real `chooseMove` call or `restart`'s
`agentMemory` carryover (`contracts/app-state-api.md`'s `restart`), so they cannot show that a
second real game genuinely produces `resolvedFromMemory: true` through the actual UI pipeline.
This pair closes that gap using the same cache-hit fixture strategy `specs/002-agents`'s CA-A-10
test already established for `chooseMove` directly, adapted to route through the full
`app-state.js` → `events.js` integration instead of calling `chooseMove` directly._

- [ ] T-081 [US-I-2] [AC: CA-I-09] RED — Add to `us-i2-state-feedback.test.js`:
  `describe('CA-I-09 — resolvedFromMemory reflects real cross-game memory reuse', ...)`: start a
  complex-level game, drive it (via the real `requestAgentMove` → `chooseMove` → `resolveAgentMove`
  pipeline in `events.js`, using `vi.useFakeTimers()` per T-077/T-078) to a board position that
  populates `agentMemory.complex`'s transposition table; click `[data-restart-button]` (`restart`
  carries `agentMemory` over per its contract); start a second complex-level game in the same
  `AppState` session and drive it, through the same real pipeline, to a position the first game's
  search already evaluated — reusing `specs/002-agents`'s CA-A-10 fixture (same board reachable by
  both games) so the cache hit is genuine, not asserted by construction. Assert the second game's
  `chooseMove` call returns `resolvedFromMemory: true` and that `[data-memory-indicator]` appears
  on that turn, while the first game's equivalent turn had `resolvedFromMemory: false` and no
  indicator. Fails because no existing test drives two consecutive real games through the shared
  `agentMemory` pipeline. Expected commit: `test(CA-I-09): failing test — resolvedFromMemory
  reflects real cross-game memory reuse`

- [ ] T-082 [US-I-2] [AC: CA-I-09] GREEN — Run `npm test`. Because `resolveAgentMove` (T-078) and
  `restart`'s `agentMemory` carryover (T-082 of the original sequence, now T-084 — see Phase 4)
  already exist, this task is expected to require no production change, the same
  zero-code-corollary pattern as T-070/T-090/T-098/T-100 — it confirms the integration T-079/T-080
  alone could not prove. **Contingency (only if T-081 cannot pass deterministically in jsdom)**: if
  forcing a genuine transposition-table cache hit across two `createGame` calls turns out to
  require more plies or wall-clock-sensitive search than a fast, deterministic unit test can
  reliably exercise, do not weaken T-081 into another hand-built `Decision` mock — instead, revert
  T-081 to a documented limitation in `specs/003-interface/traceability.md`'s "Test-strategy
  limitations" section, following the same pattern already used there for CA-I-28–CA-I-32/CA-I-17:
  state plainly that automated coverage for CA-I-09 proves `render.js`'s reading of
  `resolvedFromMemory` (T-079/T-080) but not genuine cross-game reuse through the real pipeline,
  and that the latter is demonstrated only during the live presentation. `npm test` must be fully
  green either way. Expected commit: `T-082: confirm/complete real cross-game memory-reuse
  integration (CA-I-09)`

---

## Phase 4: US-I-3 — Follow the Session Scoreboard (Priority: P2)

**Goal**: `restart` (`src/ui/app-state.js`) and the restart button (`render.js`/`events.js`)
fully implemented. CA-I-14/CA-I-15 (scoreboard increments) are already complete — T-066/T-068.

**Prerequisite**: T-082 GREEN complete.

### Restart: return to CONFIGURATION, scoreboard preserved, movement selection cleared (CA-I-16, CA-I-23)

_Grouped: `restart`'s declared "Covered criteria" in `contracts/app-state-api.md` — one function,
callable from any `uiState`. CA-I-23's test lives in `edge-cases.test.js` per the skeleton._

- [ ] T-083 [US-I-3] [AC: CA-I-16, CA-I-23] RED — Add to `us-i3-scoreboard.test.js`:
  `describe('CA-I-16 — restart returns to CONFIGURATION, scoreboard preserved', ...)`: play a game
  to a win (scoreboard now non-zero); click `[data-restart-button]`; assert `uiState` is
  `CONFIGURATION`, `engineState` is `null`, and every `[data-score]` value is unchanged. Add to
  `edge-cases.test.js`: `describe('CA-I-23 — restart during movement phase clears pending
  selection', ...)`: in a continuous-mode game, select an own mark (T-072's `selectOwnMark`), then
  click restart; assert `uiState` is `CONFIGURATION` and a subsequent fresh game shows no stale
  `data-selected`/`data-destination` attributes. Both fail because `restart` does not exist yet.
  Expected commit: `test(CA-I-16,CA-I-23): failing tests — restart returns to CONFIGURATION,
  scoreboard preserved, pending selection cleared`

- [ ] T-084 [US-I-3] [AC: CA-I-16, CA-I-23] GREEN — In `app-state.js`, add `restart(state)` per
  `contracts/app-state-api.md`: returns a fresh `createAppState()` except `scoreboard` and
  `agentMemory` are carried over unchanged. In `render.js`, ensure `[data-restart-button]` is
  present and never `disabled` in any `uiState` (per `dom-contract.md`). In `events.js`, wire its
  `click` to `restart` + re-render. `npm test` must be fully green. Expected commit: `T-084:
  restart returns to CONFIGURATION, scoreboard preserved, pending selection cleared (CA-I-16,
  CA-I-23)`

---

## Phase 5: US-I-4 — Operate the Application by Keyboard (Priority: P2)

**Goal**: Focus-visible hook, arrow-key board navigation, Enter/Space activation, and the ARIA
live-region announcement all implemented per `research.md` D-I-08.

**Prerequisite**: T-084 GREEN complete.

### Visible focus indicator hook (CA-I-17)

_Not fully jsdom-verifiable (`research.md` D-I-04): the automated test proves only the
**behavioral half** — the `data-focus-visible` attribute genuinely toggles on real `focus`/`blur`
event dispatch, a stronger check than the responsive criteria's static-only proxies (D-I-08). It
does **not** prove the resulting outline is visually perceivable (contrast, size, position) —
that half is closed only by `specs/003-interface/manual-verification.md`'s focus-visibility check
at two widths, not by this task's test._

- [ ] T-085 [US-I-4] [AC: CA-I-17] RED — Create `tests/interface/us-i4-keyboard.test.js`
  (`// @vitest-environment jsdom`) with `describe('CA-I-17 — focus-visible hook toggles on
  focus/blur', ...)`: call `.focus()` on a configuration control and separately on a board cell;
  assert `data-focus-visible="true"` appears; call `.blur()`; assert the attribute is removed.
  Fails because no `focus`/`blur` listener exists yet. Expected commit: `test(CA-I-17): failing
  test — focus-visible hook toggles on focus/blur`

- [ ] T-086 [US-I-4] [AC: CA-I-17] GREEN — In `render.js`, attach `focus`/`blur` listeners to
  every interactive control (config controls, start button, board cells, restart button) that
  toggle `data-focus-visible` (per `dom-contract.md`). `npm test` must be fully green. Automated
  coverage is the behavioral hook only — see the note above for what remains closed by
  `manual-verification.md`. Expected commit: `T-086: focus-visible hook toggles on focus/blur
  (CA-I-17)`

### Arrow-key board navigation (CA-I-18)

- [ ] T-087 [US-I-4] [AC: CA-I-18] RED — Add to `us-i4-keyboard.test.js`: `describe('CA-I-18 —
  arrow keys move cell selection', ...)`: focus `[data-cell="4"]` (center); dispatch a `keydown`
  with `key: 'ArrowRight'`; assert `document.activeElement` is `[data-cell="5"]`; repeat for
  `ArrowLeft`/`ArrowUp`/`ArrowDown`, per the row-major 3×3 layout
  (`specs/001-engine/data-model.md`'s indexing). Fails because no `keydown` listener exists on
  the board yet. Expected commit: `test(CA-I-18): failing test — arrow keys move cell selection`

- [ ] T-088 [US-I-4] [AC: CA-I-18] GREEN — In `events.js`, attach a `keydown` listener to
  `[data-board]` that, on `ArrowUp`/`ArrowDown`/`ArrowLeft`/`ArrowRight`, computes the adjacent
  cell index in the pressed direction (clamping at the grid edge — no criterion requires a
  specific edge behavior, per `spec.md`'s Assumptions) and calls `.focus()` on that cell's
  `[data-cell]` button. `npm test` must be fully green. Expected commit: `T-088: arrow keys move
  cell selection (CA-I-18)`

### Enter/Space activation (CA-I-19)

- [ ] T-089 [US-I-4] [AC: CA-I-19] RED — Add to `us-i4-keyboard.test.js`: `describe('CA-I-19 —
  Enter/Space activates like a click', ...)`: focus a legal, empty `[data-cell]`; dispatch
  `keydown` with `key: 'Enter'`; assert the resulting `engineState` is identical to what a
  `click` on the same cell would produce; repeat with `key: ' '`. Also verify the movement-phase
  case: focus an own mark, press Enter, assert the same selection T-072's click handler produces.
  Written defensively (not assumed to pass on jsdom's native `<button>` semantics alone) per
  `research.md` D-I-08. Expected commit: `test(CA-I-19): failing test — Enter/Space activates
  like a click`

- [ ] T-090 [US-I-4] [AC: CA-I-19] GREEN — If T-089 fails on jsdom's native button activation, add
  an explicit `keydown` handler in `events.js` for `Enter`/`Space` on `[data-cell]` elements that
  invokes the same handler the `click` listener already calls (T-064/T-072/T-074); if jsdom's
  native semantics already pass T-089 unmodified, this task requires no production change (same
  zero-code-corollary pattern as T-070/T-052). `npm test` must be fully green. Expected commit:
  `T-090: confirm/complete Enter/Space activation parity with click (CA-I-19)`

### Turn/result announcement without moving focus (CA-I-20)

- [ ] T-091 [US-I-4] [AC: CA-I-20] RED — Add to `us-i4-keyboard.test.js`: `describe('CA-I-20 —
  turn/result announced without moving focus', ...)`: assert `[data-live-region]`
  (`role="status"`, `aria-live="polite"`) exists once at startup (T-062's base render); focus a
  board cell, note `document.activeElement`; make a move that changes the turn; assert
  `[data-live-region]`'s `textContent` changed to describe the new turn and
  `document.activeElement` is unchanged; repeat for a move that reaches a result. Fails because
  `[data-live-region]`'s content is never updated yet. Expected commit: `test(CA-I-20): failing
  test — turn/result announced without moving focus`

- [ ] T-092 [US-I-4] [AC: CA-I-20] GREEN — In `render.js`, add `[data-live-region]` to the base
  structure if not already present from T-062, and replace (not append) its `textContent` on
  every turn change and on reaching `FINISHED`, describing the new turn or the result; never call
  `.focus()` from this code path. `npm test` must be fully green. Expected commit: `T-092:
  turn/result announced without moving focus (CA-I-20)`

---

## Phase 6: Responsive Design (Cross-Cutting)

**Goal**: `src/styles.css` fully authored, mobile-first, per `research.md` D-I-07, with the
structural CSS proxy tests from D-I-04.

**Prerequisite**: T-092 GREEN complete (all interactive controls exist to style).

**Test-strategy note (applies to both pairs below)**: automated coverage is a *structural CSS
proxy* (`tests/interface/responsive-static.test.js`, plain Node environment — no jsdom, no real
layout engine), reading the raw source text of `src/styles.css`. It proves the stylesheet is
*structured* the way a correct mobile-first, fluid, touch-ready layout must be structured; it does
**not** prove the rendered page is actually free of horizontal scroll, actually square, or
actually free of clipping at any real viewport — that requires computing layout, which this test
environment cannot do. The full claim is closed only by `specs/003-interface/
manual-verification.md`, per `research.md` D-I-04's documented group decision against Playwright/
browser-mode.

### Page-layout fluidity and mobile-first breakpoint (CA-I-28, CA-I-29)

- [ ] T-093 [Responsive] [AC: CA-I-28, CA-I-29] RED — Create
  `tests/interface/responsive-static.test.js` (plain Node environment, no `jsdom` pragma) with
  `describe('CA-I-28 — no fixed pixel widths on layout containers', ...)`: read
  `src/styles.css`'s source text; assert no rule for `.app`, `.board`, `.config-panel`, or
  `.scoreboard` sets a fixed pixel `width` wider than 320px (only `%`, `vw`, `rem`, or
  `max-width` + `width: 100%` are present). Add `describe('CA-I-29 — single column below 768px,
  min-width breakpoint', ...)`: assert the base (non-media-query) rule for `.app` uses
  `display: flex; flex-direction: column` (or `grid-template-columns: 1fr`), and that any
  multi-column rule for `.app` exists only inside `@media (min-width: 768px)` — never inside a
  `max-width` query. Both fail because `src/styles.css` is still the near-empty reset from T-060.
  Expected commit: `test(CA-I-28,CA-I-29): failing tests — layout fluidity, mobile-first
  breakpoint`

- [ ] T-094 [Responsive] [AC: CA-I-28, CA-I-29] GREEN — In `src/styles.css`, per `research.md`
  D-I-07: base (mobile) rules for `.app` as `display: flex; flex-direction: column`, all
  container widths as `%`/`max-width` + `width: 100%` (never a fixed pixel value, per the global
  CLAUDE.md "Fluidity over Fixedness" rule); one `@media (min-width: 768px)` block (D10) switching
  `.app` to a multi-column arrangement. `npm test` must be fully green. Expected commit: `T-094:
  page-layout fluidity and mobile-first breakpoint (CA-I-28, CA-I-29)`

### Square board, touch targets, configuration overflow (CA-I-30, CA-I-31, CA-I-32)

- [ ] T-095 [Responsive] [AC: CA-I-30, CA-I-31, CA-I-32] RED — Add to `responsive-static.test.js`:
  `describe('CA-I-30 — board container is square (aspect-ratio 1/1)', ...)`: assert the board
  container's rule declares `aspect-ratio: 1 / 1` and a relative (not fixed-pixel) `width`/
  `max-width`. Add `describe('CA-I-31 — interactive controls declare 44x44px minimum', ...)`:
  assert every interactive-control selector (`button`, `.cell`, `select`, `.mark-choice`) declares
  `min-width: 44px` and `min-height: 44px` (or larger) at every breakpoint that redeclares
  dimensions for it — this is a declared-value check, closer to direct than CA-I-28/29/30/32's
  absence-of-antipattern checks, per `research.md` D-I-04. Add `describe('CA-I-32 — configuration
  controls not clipped or overflow-hidden', ...)`: assert the configuration container has no
  `overflow: hidden` paired with a fixed width narrower than its content's declared minimum, and
  no `white-space: nowrap` on any control. All three fail because `src/styles.css` has no board,
  control, or configuration rules yet. Expected commit: `test(CA-I-30,CA-I-31,CA-I-32): failing
  tests — square board, touch targets, configuration overflow`

- [ ] T-096 [Responsive] [AC: CA-I-30, CA-I-31, CA-I-32] GREEN — In `src/styles.css`, per
  `research.md` D-I-07: board container `aspect-ratio: 1 / 1; width: min(90vw, 480px)` (relative
  cap, not fixed); every interactive control (board cells, config selects, restart button,
  movement-phase selection targets) `min-width: 44px; min-height: 44px` at every breakpoint that
  resizes it; configuration container uses fluid width with no `overflow: hidden` +
  narrow-fixed-width combination. `npm test` must be fully green. Expected commit: `T-096: square
  board, touch targets, configuration overflow (CA-I-30, CA-I-31, CA-I-32)`

---

## Phase 7: Non-Functional Requirements (Cross-Cutting)

**Goal**: CA-N-02/CA-N-03, both corollaries of the click and keyboard wiring already built in
Phases 2–5 — dedicated tests confirming the coverage, per the same discipline `002-agents` used
for CA-A-13/CA-A-14.

**Prerequisite**: T-096 GREEN complete (every control and interaction exists to audit).

### Fully operable with a mouse (CA-N-02)

- [ ] T-097 [Non-Functional] [AC: CA-N-02] RED — Create `tests/interface/non-functional.test.js`
  (`// @vitest-environment jsdom`) with `describe('CA-N-02 — fully operable with mouse (click
  handlers cover every action)', ...)`: complete a full game — configuration, placement/movement
  moves, restart — using only `click` events (no `keydown` dispatched anywhere in this test);
  assert every state transition in `data-model.md`'s UI State Machine is reachable this way.
  Expected to fail only if some action built in Phases 2–5 turns out to have no click path (it
  should not, since every prior GREEN task wired a `click` handler first). Expected commit:
  `test(CA-N-02): failing/asserting test — fully operable with mouse`

- [ ] T-098 [Non-Functional] [AC: CA-N-02] GREEN — Run `npm test`; if any action lacks a `click`
  handler, add it in `events.js` (per whichever earlier task's contract function it belongs to);
  otherwise no production change is needed — this is the coverage confirmation, not a new
  feature. `npm test` must be fully green. Expected commit: `T-098: confirm CA-N-02 — fully
  operable with mouse`

### Full game completable via keyboard alone (CA-N-03)

- [ ] T-101 [Non-Functional] [AC: CA-N-03] RED — Add to `non-functional.test.js`:
  `describe('CA-N-03 — full game completable via keyboard alone', ...)`: complete a full game —
  tab through configuration controls (`change` events triggered via keyboard-equivalent
  interaction), select/activate board cells via `ArrowKey`+`Enter`/`Space` (T-088/T-090), restart
  via focus + `Enter` on `[data-restart-button]` — with no `click` event dispatched anywhere in
  this test. Expected to fail only if some action lacks a keyboard path. Expected commit:
  `test(CA-N-03): failing/asserting test — full game completable via keyboard alone`

- [ ] T-102 [Non-Functional] [AC: CA-N-03] GREEN — Run `npm test`; if any action lacks a keyboard
  path, add it (per whichever of T-086/T-088/T-090/T-092's mechanisms it belongs to); otherwise no
  production change is needed. `npm test` must be fully green. Expected commit: `T-102: confirm
  CA-N-03 — full game completable via keyboard alone`

---

## Phase 7.5: Amendment — Board Mark Visibility (BUG-008)

**Goal**: close the gap found by manual play-testing after `T-093`–`T-098`: occupied cells never
displayed their mark's symbol, because no `CA-I-nn` ever required it (`spec.md`'s Amendments
section, A1). New criterion **CA-I-33** (numbered out of document order, deliberately, to avoid
renumbering any already-committed criterion — see `spec.md`).

**Prerequisite**: T-098 GREEN complete (board rendering exists to extend). Inserted before
`T-101`/`T-102` (CA-N-03) since CA-N-03's keyboard-only playthrough should exercise the corrected
rendering too, not a stale one.

**Separate, deliberately excluded from this pair's commits**: `render.js`'s `data-cell-state`
collapsing `"opponent"` into `"own"` (a `contracts/dom-contract.md` compliance defect, not a
`CA-I-nn` gap — no criterion requires the distinction). Tracked as **BUG-009**, fixed in its own
commit (`fix: render.js distinguishes own from opponent cell state per dom-contract.md`) right
after T-100, so `git log --grep="CA-I-33"` returns only commits that satisfy that criterion.

- [ ] T-099 [US-I-2] [AC: CA-I-33] RED — Add to `us-i2-state-feedback.test.js`:
  `describe('CA-I-33 — occupied cell displays the mark's symbol', ...)`: play a move; assert the
  occupied cell's `textContent` is non-empty and states the mark that occupies it (read via
  `cell.textContent`, not `dataset.cellState`). Add a second case: drive a game to a win; assert
  every winning-line cell's `textContent` still identifies its mark's symbol (not solely `'★'`
  with the mark lost) — proving CA-I-33 and CA-I-04 do not conflict. Fails because `renderBoard`
  only ever writes `'★'` (winning cells) or `''` (every other cell) into `textContent`. Expected
  commit: `test(CA-I-33): failing test — occupied cell displays the mark's symbol`

- [ ] T-100 [US-I-2] [AC: CA-I-33] GREEN — In `render.js`'s `renderBoard`, write the mark's symbol
  into the cell's `textContent` whenever the cell is occupied; when the cell is also part of
  `winningLine`, keep both the mark's symbol and the `'★'` win indicator (e.g. `"X ★"`), so neither
  CA-I-04 nor CA-I-33 is lost. `npm test` must be fully green. Expected commit: `T-100: occupied
  cell displays the mark's symbol (CA-I-33)`

---

## Final Phase: Traceability Closure

- [ ] T-103 [AC: CA-I-01, CA-I-02, CA-I-03, CA-I-04, CA-I-05, CA-I-06, CA-I-07, CA-I-08, CA-I-09,
  CA-I-10, CA-I-11, CA-I-12, CA-I-13, CA-I-14, CA-I-15, CA-I-16, CA-I-17, CA-I-18, CA-I-19,
  CA-I-20, CA-I-21, CA-I-22, CA-I-23, CA-I-24, CA-I-25, CA-I-26, CA-I-27, CA-I-28, CA-I-29,
  CA-I-30, CA-I-31, CA-I-32, CA-I-33, CA-N-02, CA-N-03] Run `npm run verify:traceability`; fill the
  Task column (T-NNN) and Commit SHA column for all 35 rows in `specs/003-interface/
  traceability.md` using real SHAs from `git log`; execute `manual-verification.md`'s procedure
  for CA-I-17 (rendered-visibility half), CA-I-28–CA-I-32, and record the result in that file;
  verify `npm run verify:traceability` exits 0 for all three features (37 + 35 = 72 CA-IDs
  combined) after the commit. Expected commit: `T-103: record real SHAs in traceability matrix —
  003-interface complete`

---

## Coverage Audit

| CA-ID | RED task | GREEN task | Test file | Notes |
|-------|----------|------------|-----------|-------|
| CA-I-01 | T-061 | T-062 | us-i1-configuration.test.js | Grouped with CA-I-02, CA-I-24 — `startGame`'s covered criteria |
| CA-I-02 | T-061 | T-062 | us-i1-configuration.test.js | Grouped with CA-I-01, CA-I-24 |
| CA-I-03 | T-063 | T-064 | us-i2-state-feedback.test.js | Grouped with CA-I-05, CA-I-21 — `applyPlayerMove` base path |
| CA-I-04 | T-065 | T-066 | us-i2-state-feedback.test.js | Grouped with CA-I-14 — `applyPlayerMove` win branch |
| CA-I-05 | T-063 | T-064 | us-i2-state-feedback.test.js | Grouped with CA-I-03, CA-I-21 |
| CA-I-06 | T-075 | T-076 | us-i2-waiting-state.test.js | Grouped with CA-I-12, CA-I-22 — `requestAgentMove`'s covered criteria |
| CA-I-07 | T-071 | T-072 | us-i2-state-feedback.test.js | Grouped with CA-I-25, CA-I-27 — `selectOwnMark`'s covered criteria |
| CA-I-08 | T-069 | T-070 | us-i2-state-feedback.test.js | Corollary of CA-I-03/04/05 — dedicated cross-cutting test |
| CA-I-09 | T-079 (render); T-081 (integration) | T-080 (render); T-082 (integration) | us-i2-state-feedback.test.js | Two pairs: T-079/T-080 prove `render.js` reads a hand-built `Decision`; T-081/T-082 (added by `/speckit-analyze`) prove genuine cross-game reuse through the real `events.js`/`restart` pipeline |
| CA-I-10 | T-077 | T-078 | us-i2-waiting-state.test.js | Grouped with CA-I-13 — 300ms floor mechanism (D-I-05) |
| CA-I-11 | T-067 | T-068 | us-i2-state-feedback.test.js | Grouped with CA-I-15 — `applyPlayerMove` draw branch |
| CA-I-12 | T-075 | T-076 | us-i2-waiting-state.test.js | Grouped with CA-I-06, CA-I-22 |
| CA-I-13 | T-077 | T-078 | us-i2-waiting-state.test.js | Grouped with CA-I-10 |
| CA-I-14 | T-065 | T-066 | us-i3-scoreboard.test.js | Grouped with CA-I-04 |
| CA-I-15 | T-067 | T-068 | us-i3-scoreboard.test.js | Grouped with CA-I-11 |
| CA-I-16 | T-083 | T-084 | us-i3-scoreboard.test.js | Grouped with CA-I-23 — `restart`'s covered criteria |
| CA-I-17 | T-085 | T-086 | us-i4-keyboard.test.js | ⚠️ Behavioral proxy only — rendered visibility closed by manual-verification.md |
| CA-I-18 | T-087 | T-088 | us-i4-keyboard.test.js | Own pair — arrow-key navigation |
| CA-I-19 | T-089 | T-090 | us-i4-keyboard.test.js | Own pair — may be a zero-code corollary if jsdom's native button semantics suffice |
| CA-I-20 | T-091 | T-092 | us-i4-keyboard.test.js | Own pair — ARIA live region |
| CA-I-21 | T-063 | T-064 | edge-cases.test.js | Grouped with CA-I-03, CA-I-05 |
| CA-I-22 | T-075 | T-076 | edge-cases.test.js | Grouped with CA-I-06, CA-I-12 |
| CA-I-23 | T-083 | T-084 | edge-cases.test.js | Grouped with CA-I-16 |
| CA-I-24 | T-061 | T-062 | edge-cases.test.js | Grouped with CA-I-01, CA-I-02 |
| CA-I-25 | T-071 | T-072 | edge-cases.test.js | Grouped with CA-I-07, CA-I-27 |
| CA-I-26 | T-073 | T-074 | edge-cases.test.js | Own pair — `applyPlayerMove`'s movement-application branch, different function than `selectOwnMark` |
| CA-I-27 | T-071 | T-072 | edge-cases.test.js | Grouped with CA-I-07, CA-I-25 |
| CA-I-28 | T-093 | T-094 | responsive-static.test.js | ⚠️ Structural proxy only — rendered layout closed by manual-verification.md |
| CA-I-29 | T-093 | T-094 | responsive-static.test.js | ⚠️ Structural proxy only — see CA-I-28 |
| CA-I-30 | T-095 | T-096 | responsive-static.test.js | ⚠️ Structural proxy only — see CA-I-28 |
| CA-I-31 | T-095 | T-096 | responsive-static.test.js | ⚠️ Declared-value check, closer to direct — manual-verification.md still authoritative for computed size |
| CA-I-32 | T-095 | T-096 | responsive-static.test.js | ⚠️ Structural proxy only — see CA-I-28 |
| CA-N-02 | T-097 | T-098 | non-functional.test.js | Corollary of every click handler built in Phases 2–5 |
| CA-I-33 | T-099 | T-100 | us-i2-state-feedback.test.js | Added post-implementation (BUG-008, Amendment A1) — own pair, board mark visibility |
| CA-N-03 | T-101 | T-102 | non-functional.test.js | Corollary of every keyboard handler built in Phase 5 |

---

## Dependencies & Execution Order

All 44 tasks are strictly sequential (every GREEN task touches at least one of
`src/ui/app-state.js`, `src/ui/render.js`, `src/ui/events.js`, or `src/styles.css`, each grown
incrementally; no `[P]` markers).

```
T-060 (setup)
  → T-061(RED) → T-062(GREEN)  CA-I-01, CA-I-02, CA-I-24
  → T-063(RED) → T-064(GREEN)  CA-I-03, CA-I-05, CA-I-21
  → T-065(RED) → T-066(GREEN)  CA-I-04, CA-I-14
  → T-067(RED) → T-068(GREEN)  CA-I-11, CA-I-15
  → T-069(RED) → T-070(GREEN)  CA-I-08
  → T-071(RED) → T-072(GREEN)  CA-I-07, CA-I-25, CA-I-27
  → T-073(RED) → T-074(GREEN)  CA-I-26
  → T-075(RED) → T-076(GREEN)  CA-I-06, CA-I-12, CA-I-22
  → T-077(RED) → T-078(GREEN)  CA-I-10, CA-I-13
  → T-079(RED) → T-080(GREEN)  CA-I-09 (render only)
  → T-081(RED) → T-082(GREEN)  CA-I-09 (real cross-game integration)
  → T-083(RED) → T-084(GREEN)  CA-I-16, CA-I-23
  → T-085(RED) → T-086(GREEN)  CA-I-17
  → T-087(RED) → T-088(GREEN)  CA-I-18
  → T-089(RED) → T-090(GREEN)  CA-I-19
  → T-091(RED) → T-092(GREEN)  CA-I-20
  → T-093(RED) → T-094(GREEN)  CA-I-28, CA-I-29
  → T-095(RED) → T-096(GREEN)  CA-I-30, CA-I-31, CA-I-32
  → T-097(RED) → T-098(GREEN)  CA-N-02
  → T-099(RED) → T-100(GREEN)  CA-I-33 (Amendment, BUG-008)
  → (fix, no T-NNN)             BUG-009 — dom-contract.md own/opponent compliance
  → T-101(RED) → T-102(GREEN)  CA-N-03
  → T-103                      traceability closure
```

**Phase gates**:

| Phase starts at | Prerequisite |
|------------------|-------------|
| Phase 1 (T-060) | `002-agents` closed (T-057, commit recorded in `specs/002-agents/traceability.md`) |
| Phase 2 (T-061) | T-060 complete |
| Phase 3 (T-063) | T-062 GREEN — configuration slice complete |
| Phase 4 (T-083) | T-082 GREEN — all US-I-2 gameplay slices complete, including CA-I-09's real integration pair |
| Phase 5 (T-085) | T-084 GREEN — restart complete |
| Phase 6 (T-093) | T-092 GREEN — every interactive control exists to style |
| Phase 7 (T-097) | T-096 GREEN — styles complete |
| Phase 7.5 (T-099) | T-098 GREEN — CA-N-02 confirmed |
| Phase 7 cont'd (T-101) | T-100 GREEN, plus BUG-009 fixed — CA-I-33 and the DOM contract are both correct before the keyboard-only playthrough exercises them |
| Final (T-103) | T-102 GREEN — `npm test` fully green |

---

## Self-Check Report

| Check | Result |
|-------|--------|
| CA-ID with no task | None — 35/35 covered (see Coverage Audit; CA-I-33 added post-implementation, BUG-008) |
| Task with no CA-ID | Only T-060 (Phase 1 tooling/scaffold) — same documented exception `001-engine`'s T-001/T-002 established; explicitly labeled "no behavioral CA-ID" in its phase header, per project precedent, not a deviation invented here |
| GREEN preceding its RED | None — every pair is listed RED-then-GREEN in both the task list and the dependency graph above |
| Tasks likely to exceed one commit | Flagged and pre-emptively split during generation: the original single "all 5 responsive criteria" pair was split into T-093/T-094 (CA-I-28, CA-I-29 — page layout) and T-095/T-096 (CA-I-30, CA-I-31, CA-I-32 — component-level), mirroring `002-agents`'s T-047/T-048 split. Remaining borderline case: **T-062** (the first behavioral GREEN task) creates all three of `src/ui/app-state.js`, `src/ui/render.js`, `src/ui/events.js` in one commit — larger than a typical single-criterion GREEN, but judged acceptable because it mirrors `002-agents`'s T-035 (first commit creating the entire `src/agents.js` file) and the three files' *content* here is scoped tightly to configuration only (no gameplay logic yet); flagged here for the user's review rather than split further, since splitting "create app-state.js" from "create render.js" from "create events.js" would leave two of the three commits unable to pass any test on their own (an untestable intermediate commit is a worse traceability outcome than one slightly larger commit, per P5's red-before-green intent). |
| CA-ID with unclear test strategy | None outright unclear, but three are worth flagging: **CA-I-19** (T-089/T-090) — GREEN may end up requiring zero production code if jsdom's native `<button>` keyboard semantics already dispatch `click` on Enter/Space; the task is written to handle either outcome, but the actual result is only knowable at implementation time. **CA-I-17/CA-I-28–CA-I-32** — test strategy is deliberately partial by design (documented proxy + manual procedure, per `research.md` D-I-04), not unclear; flagged here only so the distinction between "partial by design" and "unclear" is explicit. **CA-I-09**'s T-081/T-082 — the real cross-game integration test's feasibility inside jsdom (no wall clock, deterministic transposition-table cache hit) is not yet proven; T-082's description carries an explicit contingency to fall back to a documented `traceability.md` limitation, same pattern as the six partial criteria, if it turns out infeasible. |

**Documented-exception note**: T-070 (CA-I-08), T-090 (CA-I-19), T-098 (CA-N-02), and T-102
(CA-N-03) may turn out to require zero production changes if the behavior they check is already a
correct corollary of earlier tasks — the same pattern `002-agents` used for CA-A-13/CA-A-14/
CA-N-01's confirmation-only GREEN commits (T-052, T-054, T-056). Each still gets its own
`describe`, its own RED/GREEN pair, and its own commit message citing its CA-ID. If any of these
four fails, per P7 (spec-first debugging) the fix path is: diagnose which earlier task's
implementation is actually incomplete, fix it there, and re-verify — never add special-casing
inside the confirmation task itself. **T-100 (CA-I-33) is not in this list** — it is a genuine
implementation gap (BUG-008), not expected to be a zero-code corollary.
