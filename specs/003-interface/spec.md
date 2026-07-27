# Feature Specification: Game Interface

**Feature Branch**: `main` (this feature has no dedicated git branch — same group decision as
`002-agents`; see `CLAUDE.md` session log, 2026-07-27)
**ID Area**: `I` — all acceptance criteria in this spec use the prefix `CA-I-nn`. This spec also
carries `CA-N-02` and `CA-N-03`, the mouse- and keyboard-operability criteria the constitution
(P9) assigns to `003-interface`.

**Created**: 2026-07-27

**Status**: Draft

**Input**: User description: "Graphical web interface for the tic-tac-toe game. It consumes the
engine (`specs/001-engine`) and the agents (`specs/002-agents`); it does not reimplement rules.
Mandatory UI state machine (`CONFIGURATION → IN_GAME → WAITING_FOR_AGENT → IN_GAME → FINISHED`,
restart returns to `CONFIGURATION` from any state, scoreboard preserved). Five mandatory
criteria verbatim from the assignment. Configuration, scoreboard, restart, full keyboard
operation, color-independent information, and agent memory-reuse observability. Responsive
criteria from 320px to 1440px, mobile-first, square board, 44×44px touch targets."

<!--
  LANGUAGE: All content in this spec must be written in English.
  Exception: the player-facing game UI is displayed in Spanish (see CLAUDE.md).
-->

## Clarifications

### Session 2026-07-27

- Q: CA-I-04 needs to know *which* three cells completed a win to highlight them, but
  `specs/001-engine`'s contract only ever exposed `result` (the winning mark), never a line
  reference — how should this be resolved? → A: Amend `specs/001-engine` (CA-M-12 extended to
  also return `winningLine`) rather than having the UI duplicate the engine's `WINNING_LINES`
  constant. Duplicating it would violate constitution P2 (UI consumes the engine, does not
  reimplement its rules) and create a second copy of the same data that could drift out of sync.
  Logged as BUG-007 in `docs/bugs.md`; `001-engine` reopened with two new tasks (T-058, T-059) —
  see `specs/001-engine/spec.md` § Amendments. CA-I-04 below cites `state.winningLine`.
- Q: CA-I-06 ("WHILE the agent is computing its move, show a waiting state") has no minimum
  visible duration — with the complex agent responding in ~12ms, the criterion is satisfiable by
  test instrumentation alone, with no human ever perceiving it during the live demo. Should a
  minimum duration be added? → A: Yes, as a new criterion (CA-I-10) rather than by rewriting
  CA-I-06, which must stay verbatim as the assignment's mandatory criterion #4. 300ms was chosen
  as a concrete, testable floor, comfortably under CA-N-01's 1000ms budget, that guarantees the
  waiting state is demonstrable regardless of which level is computing.
- Q: No criterion described what the player sees when a game ends in a draw — CA-I-04 (now
  CA-I-11's scoreboard counterpart) only covers the winning-line case. Should one be added? → A:
  Yes — new CA-I-11, a draw-case counterpart to CA-I-04: on a classic-mode draw, display a draw
  indicator and block further moves.
- Q: The state-machine transitions `IN_GAME → (agent's turn) WAITING_FOR_AGENT` and
  `WAITING_FOR_AGENT → (move ready) IN_GAME` had no criterion of their own, only inferable from
  CA-I-06's `WHILE` clause. Should explicit transition criteria be added? → A: Yes — new CA-I-12
  and CA-I-13, so every edge in the state machine has its own traceable criterion. CA-I-13
  explicitly depends on CA-I-10's minimum duration having elapsed, to avoid a race between "the
  agent's move is ready" and "the waiting state has been visible long enough."
- Q: Which `CA-I-nn` criteria cannot be verified in jsdom (no real CSS layout engine)? → A:
  CA-I-28, CA-I-29, CA-I-30, CA-I-31, CA-I-32 (all Responsive Design criteria) require actual
  geometry (`scrollWidth`, `offsetWidth/Height`, media-query-scoped layout) that jsdom does not
  compute; CA-I-17 (visible focus indicator) is borderline — a "focus class/attribute applied"
  proxy is jsdom-testable, but true rendered visibility is not. These 6 criteria are left as
  written; the choice of verification environment (Playwright, Vitest browser mode, or another
  tool) is deferred to `plan.md`, not decided in this spec.

These four criteria were added and the spec renumbered so all `CA-I-nn` IDs stay in document
order; no existing criterion's meaning changed except CA-I-04's Notes (winningLine reference).
Design Decisions D9 and D10 (below) were **not** reopened by this audit.

## Mandatory Interface Criteria — Assignment Mapping

Per `CLAUDE.md`'s Exception 2 (Interface spec mapping), the five criteria below are transcribed
**verbatim from the assignment brief, §2.5** and mapped to their `CA-I-nn` IDs.

| CA-I-nn | Spanish Original (assignment §2.5) | English EARS Criterion |
|---------|-------------------------------------|-------------------------|
| CA-I-03 | "EL SISTEMA SHALL indicar en todo momento de quién es el turno y con qué ficha juega." | THE SYSTEM SHALL indicate at all times whose turn it is and which mark they play. |
| CA-I-04 | "WHEN un jugador alinea tres fichas, EL SISTEMA SHALL destacar la línea ganadora y bloquear nuevas jugadas." | WHEN a player aligns three marks, THE SYSTEM SHALL highlight the winning line and block further moves. |
| CA-I-05 | "IF el jugador intenta una jugada ilegal, THEN EL SISTEMA SHALL rechazarla indicando el motivo, sin alterar el estado del tablero." | IF the player attempts an illegal move, THEN THE SYSTEM SHALL reject it stating the reason, without altering the board state. |
| CA-I-06 | "WHILE el agente calcula su jugada, EL SISTEMA SHALL mostrar un estado de espera y deshabilitar el tablero." | WHILE the agent is computing its move, THE SYSTEM SHALL show a waiting state and disable the board. |
| CA-I-07 | "WHILE la modalidad continua está en fase de movimiento, EL SISTEMA SHALL señalar qué fichas propias pueden moverse y a qué casillas." | WHILE continuous mode is in the movement phase, THE SYSTEM SHALL indicate which of the player's own marks can move and to which cells. |

## User Stories *(mandatory)*

### US-I-1 · Configure the Game (Priority: P1)

Before any game starts, a player sets up the match: whether the opponent is another human or an
agent, which agent level (if applicable), which mark each player uses, and whether the game
plays in classic or continuous mode. Only once all required choices are made can the game begin.

**Why P1**: Every other story depends on a valid configuration existing first — the state
machine has no path into `IN_GAME` except through a completed `CONFIGURATION` step.

**Independent test**: Load the interface fresh; verify all four configuration controls are
present and that "start" has no effect until a mark, opponent type, and game mode are selected
(and an agent level, when the opponent type is agent). Selecting valid values and starting
transitions to `IN_GAME`.

**Acceptance criteria** (EARS notation):

| ID | EARS Criterion | Notes |
|----|----------------|-------|
| CA-I-01 | WHILE the system is in the `CONFIGURATION` state, THE SYSTEM SHALL display selectable controls for opponent type (human or agent), the mark assigned to each player, and game mode (classic or continuous), plus an agent level control whenever the opponent type is agent. | Covers RF-1 (opponent type), RF-2 (agent level), RF-3 (game mode), RF-4 (mark). |
| CA-I-02 | IF the player activates start while opponent type, mark assignment, and game mode are selected, and an agent level is selected whenever the opponent type is agent, THEN THE SYSTEM SHALL transition from `CONFIGURATION` to `IN_GAME`. | State-machine transition `CONFIGURATION → (start) IN_GAME`. Starting without a required selection is out of scope for this criterion — no criterion in this spec asserts a different observable response for that case, since "start" simply has no effect until requirements are met. |

---

### US-I-2 · Play With Clear State Feedback (Priority: P1)

While a game is in progress, a player always knows whose turn it is, which mark is theirs, what
moves are legal right now, why a move was rejected if it was, and when the agent is thinking.
None of this information depends on being able to distinguish colors, and the complex agent's
memory reuse is visible when it happens. Every edge of the UI state machine — entering and
leaving `WAITING_FOR_AGENT`, reaching `FINISHED` by a win or by a draw — is itself observable.

**Why P1**: This is the core of RF-4 ("clear state feedback" is the assignment's own framing)
and directly encodes the five mandatory criteria from the assignment brief.

**Independent test**: Play a full game (human vs human) and verify the turn indicator updates
after every move, an illegal move is rejected with a stated reason and an unchanged board, a
winning line is highlighted and further clicks are blocked, and none of these signals rely on
color alone. Play a game against the complex agent and verify the state machine transitions into
`WAITING_FOR_AGENT` when its turn starts, stays there for at least the minimum waiting duration,
transitions back to `IN_GAME` once the move is applied, and a memory-reuse indicator appears
whenever `resolvedFromMemory` is `true`. Play a classic-mode game to a draw and verify a draw
indicator appears and the board is blocked.

**Acceptance criteria** (EARS notation):

| ID | EARS Criterion | Notes |
|----|----------------|-------|
| CA-I-03 | THE SYSTEM SHALL indicate at all times whose turn it is and which mark they play. | Mandatory criterion #1 (assignment, verbatim). |
| CA-I-04 | WHEN a player aligns three marks, THE SYSTEM SHALL highlight the winning line and block further moves. | Mandatory criterion #2 (assignment, verbatim). "Aligns three marks" maps to `state.result` becoming a mark and the specific cells to `state.winningLine` (`specs/001-engine` CA-M-12, amended — see Clarifications and `docs/bugs.md` BUG-007). |
| CA-I-05 | IF the player attempts an illegal move, THEN THE SYSTEM SHALL reject it stating the reason, without altering the board state. | Mandatory criterion #3 (assignment, verbatim). "The reason" is `applyMove`'s `ErrorResult.reason` (`wrong_turn`, `cell_occupied`, `wrong_phase`, `no_mark_at_source`, `not_own_mark`, `game_over` — full enumeration per `specs/001-engine/contracts/engine-api.md`), rendered as player-facing text for every value the engine can return, not only the subset expected under normal UI flow. |
| CA-I-06 | WHILE the agent is computing its move, THE SYSTEM SHALL show a waiting state and disable the board. | Mandatory criterion #4 (assignment, verbatim). Corresponds to the `WAITING_FOR_AGENT` UI state. Does not by itself require any minimum visible duration — see CA-I-10. |
| CA-I-07 | WHILE continuous mode is in the movement phase, THE SYSTEM SHALL indicate which of the player's own marks can move and to which cells. | Mandatory criterion #5 (assignment, verbatim). "Can move" means present as a `{type:'move', from:i, ...}` in `legalMoves(state)`. |
| CA-I-08 | WHERE information about turn, move legality, or the winning line is conveyed, THE SYSTEM SHALL also convey it through text or an icon, not through color alone. | Accessibility requirement independent of the mandatory five; applies to CA-I-03, CA-I-04, CA-I-05. |
| CA-I-09 | WHEN the agent's `chooseMove` decision has `resolvedFromMemory` equal to `true`, THE SYSTEM SHALL display an indicator that the move was resolved from memory. | Makes D7's memory-reuse metric (`specs/002-agents/contracts/agents-api.md`) observable during the demo, per RF-2's "persistent memory" capability for the complex level. |
| CA-I-10 | WHEN the agent is selected to move, THE SYSTEM SHALL keep the waiting state visible for at least 300 ms before applying the agent's chosen move. | Added by Clarifications (2026-07-27): CA-I-06 alone has no minimum visible duration, and the complex agent resolves in as little as ~12ms — well under this floor and under CA-N-01's 1000ms budget — which would make CA-I-06 satisfiable only by test instrumentation, never by a human observer during the live demo. Written as an observable behavior (duration the state stays visible), not an implementation technique. |
| CA-I-11 | WHEN a classic-mode game reaches the `FINISHED` state as a draw, THE SYSTEM SHALL display a draw indicator and block further moves. | Added by Clarifications (2026-07-27): the draw-case counterpart to CA-I-04, which only covers the win case. Continuous mode has no draw (`specs/001-engine` CA-M-17), so this criterion cannot apply there — not a gap, a consequence of the engine contract. |
| CA-I-12 | WHEN it becomes the agent's turn to move, THE SYSTEM SHALL transition from `IN_GAME` to `WAITING_FOR_AGENT`. | Added by Clarifications (2026-07-27): makes the state-machine edge `IN_GAME → (agent's turn) WAITING_FOR_AGENT` explicit and traceable, rather than only inferable from CA-I-06's `WHILE`. |
| CA-I-13 | WHEN the agent's chosen move is ready and the minimum waiting duration (CA-I-10) has elapsed, THE SYSTEM SHALL apply that move and transition from `WAITING_FOR_AGENT` to `IN_GAME`. | Added by Clarifications (2026-07-27): makes the state-machine edge `WAITING_FOR_AGENT → (move ready) IN_GAME` explicit. Ordered after CA-I-10 to avoid a race between "the move is ready" and "the waiting state has been visible long enough." |

---

### US-I-3 · Follow the Session Scoreboard (Priority: P2)

Across several games in one session, a player tracks how many games each side has won and how
many ended in a draw. Restarting starts a new game but never resets these counts.

**Why P2**: Builds on US-I-2 (a game must be playable and reach a result before the scoreboard
has anything to record) and is required by RF-4's "visible session scoreboard."

**Independent test**: Play a game to a win; verify the winning mark's count increments by one and
the other counts are unchanged. Play a classic-mode game to a draw; verify the draw count
increments. Restart; verify the board resets to `CONFIGURATION` while all scoreboard counts are
unchanged.

**Acceptance criteria** (EARS notation):

| ID | EARS Criterion | Notes |
|----|----------------|-------|
| CA-I-14 | WHEN a game reaches the `FINISHED` state with a winning mark, THE SYSTEM SHALL increment that mark's win count in the session scoreboard. | |
| CA-I-15 | WHEN a classic-mode game reaches the `FINISHED` state as a draw, THE SYSTEM SHALL increment the session scoreboard's draw count. | Continuous mode has no draw (`specs/001-engine` D2/CA-M-17), so this criterion cannot apply in that mode — not a gap, a consequence of the engine contract. |
| CA-I-16 | WHEN the player activates restart, THE SYSTEM SHALL discard the current game and return to the `CONFIGURATION` state while preserving the session scoreboard's win and draw counts. | State-machine transition "restart → `CONFIGURATION` from any state," scoreboard-preservation half. |

---

### US-I-4 · Operate the Application by Keyboard (Priority: P2)

A player who cannot or does not want to use a mouse configures, plays, and restarts a full game
using only the keyboard: every control shows where focus is, the board cells are reachable and
selectable with arrow keys, actions activate with Enter or Space, and turn/result changes are
announced to assistive technology without stealing focus away from where the player is.

**Why P2**: Required by constitution P9 (`CA-N-03`, a desirable goal) and by the assignment's
accessibility expectations; depends on US-I-2's state feedback already existing to have something
to announce.

**Independent test**: Using only a keyboard, complete a full game from `CONFIGURATION` through
`FINISHED`: tab through configuration controls with visible focus at each step, move the board
selection with arrow keys, place a mark with Enter or Space, and confirm a screen-reader-style
announcement fires on each turn change and on the final result without focus moving away from the
board.

**Acceptance criteria** (EARS notation):

| ID | EARS Criterion | Notes |
|----|----------------|-------|
| CA-I-17 | THE SYSTEM SHALL display a visible focus indicator on the currently focused interactive control at all times a control has focus. | Verification note: not fully verifiable in jsdom — see Clarifications. |
| CA-I-18 | WHILE the board has keyboard focus, THE SYSTEM SHALL move cell selection to the adjacent cell in the pressed arrow key's direction. | "Adjacent" follows the 3×3 grid layout; a press toward the grid's edge has no criterion requiring a specific response (see Assumptions). |
| CA-I-19 | WHEN the focused cell receives an Enter or Space key press, THE SYSTEM SHALL perform the same action a pointer click on that cell would perform. | Applies uniformly to placement and, per CA-I-25/CA-I-26, to movement-phase selection. |
| CA-I-20 | WHEN the turn changes or the game reaches a result, THE SYSTEM SHALL announce the change to assistive technology without moving keyboard focus. | Satisfies "announcement... without moving focus." |

---

### Edge Cases

| ID | Edge Case | EARS Criterion |
|----|-----------|-----------------|
| CA-I-21 | Player clicks or activates an already-occupied cell | IF the player clicks or activates a cell that is already occupied, THEN THE SYSTEM SHALL reject the move with the "cell occupied" reason and leave the board unchanged. |
| CA-I-22 | Player clicks or activates a cell during `WAITING_FOR_AGENT` | IF the player clicks or activates any cell while the system is in the `WAITING_FOR_AGENT` state, THEN THE SYSTEM SHALL ignore the input and keep the board disabled. |
| CA-I-23 | Player restarts during the movement phase of continuous mode | WHEN the player activates restart while the game is in the movement phase of continuous mode, THE SYSTEM SHALL discard the in-progress game, clear any pending own-mark selection, and return to `CONFIGURATION`, preserving the session scoreboard. |
| CA-I-24 | Player attempts to change configuration while a game is in progress | WHILE the system is in the `IN_GAME`, `WAITING_FOR_AGENT`, or `FINISHED` state, THE SYSTEM SHALL keep configuration controls inaccessible, requiring restart before any configuration change can take effect. |
| CA-I-25 | Player selects one of their own marks during the movement phase | WHEN the player selects one of their own marks during the movement phase, THE SYSTEM SHALL highlight that mark as selected and highlight its legal destination cells. |
| CA-I-26 | Player selects a destination cell after selecting their own mark | WHEN the player selects a highlighted destination cell while an own mark is selected, THE SYSTEM SHALL apply the move using the selected mark's cell as the origin and the chosen cell as the destination. |
| CA-I-27 | Player selects the same own mark a second time | WHEN the player selects an own mark that is already selected, THE SYSTEM SHALL cancel the selection and clear the highlighted destination cells. |

CA-I-25–CA-I-27 resolve the edge case of "can the own-mark selection be cancelled": yes, by
reselecting the same mark (see Assumptions for the alternative considered and discarded).

### Responsive Design

| ID | EARS Criterion | Notes |
|----|-----------------|-------|
| CA-I-28 | THE SYSTEM SHALL render the layout without horizontal scrolling at every viewport width from 320px to 1440px. | Not verifiable in jsdom — see Clarifications; verification environment deferred to `plan.md`. |
| CA-I-29 | WHERE the viewport width is below 768px, THE SYSTEM SHALL render configuration, board, and scoreboard in a single column. | Mobile-first base layout; 768px is fixed here as the boundary the criterion tests against (see Design Decision D10). Widths at or above 768px are unconstrained by this criterion — they only ever add layout space, never remove it, per CA-I-28. Not verifiable in jsdom — see Clarifications. |
| CA-I-30 | THE SYSTEM SHALL keep the board square and fully visible without scrolling at every supported viewport, including 320×568. | Not verifiable in jsdom — see Clarifications. |
| CA-I-31 | THE SYSTEM SHALL maintain a minimum touch target size of 44×44 px for every interactive control at every supported viewport. | Not verifiable in jsdom — see Clarifications. |
| CA-I-32 | THE SYSTEM SHALL keep all configuration controls reachable without any control being clipped or hidden outside the viewport at the narrowest supported viewport (320px). | Not verifiable in jsdom — see Clarifications. |

### Non-Functional Requirements

| ID | EARS Criterion | Notes |
|----|-----------------|-------|
| CA-N-02 | THE SYSTEM SHALL be fully operable with a mouse at any point in the game. | Assigned to `003-interface` by constitution P9; reproduced verbatim. |
| CA-N-03 | WHERE the browser receives keyboard focus, THE SYSTEM SHALL allow completing a full game without using the mouse. | Assigned to `003-interface` by constitution P9 as a desirable goal (not mandatory); reproduced verbatim. Realized by CA-I-17–CA-I-20. |

### Out of Scope

- Reimplementing any rule from `src/engine.js` or any decision technique from `src/agents.js` —
  the UI only calls `createGame`, `legalMoves`, `applyMove`, and `chooseMove`.
- Persisting the scoreboard or any configuration across page reloads (no criterion requests it;
  consistent with `specs/002-agents` D6's session-only memory scope).
- Sound, animation timing, or visual theming beyond what CA-I-08 (color-independent information)
  and the responsive criteria require.
- Any input modality other than pointer (mouse/touch) and keyboard (e.g., voice control,
  gamepad).
- Internal module structure, framework choice, specific CSS technique, and the test environment
  used to verify layout-dependent criteria (CA-I-28–CA-I-32) — these belong in `plan.md`.

### Design Decisions (Resolved)

| # | Question | Decision | Justification | Resolved by |
|---|----------|----------|---------------|-------------|
| D9 | Can the player cancel an own-mark selection mid movement-phase? | Yes — selecting the already-selected mark a second time cancels it (CA-I-27). | The state machine gives no dedicated "cancel" control, and inventing one would add a UI element no criterion requests. Reusing the same interaction (select) for cancellation keeps the control surface minimal and mirrors common toggle-select patterns; it is bound only to the movement-phase selection state, not to game rules, so it does not touch `specs/001-engine` or `specs/002-agents`. | Spec draft — 2026-07-27 |
| D10 | What viewport width separates the single-column base layout from a wider layout? | 768px. | A concrete number is required for CA-I-29 to be mechanically testable (P4 prohibits vague thresholds); 768px is the conventional phone/tablet boundary and keeps the 320–767px range consistently single-column, matching the explicit 320×568 test case in CA-I-30. | Spec draft — 2026-07-27 |

Neither D9 nor D10 was reopened by the 2026-07-27 `/speckit-clarify` audit — see Clarifications.

### Pending Decisions [NEEDS CLARIFICATION]

None. All ambiguities encountered while drafting and auditing this spec had a reasonable default
or were resolved by group decision — see Clarifications and Design Decisions above and
Assumptions below.

## Requirements *(mandatory)*

### Functional Requirements

| CA-ID | US | EARS Criterion | Status |
|-------|----|----------------|--------|
| CA-I-01 | US-I-1 | WHILE the system is in the `CONFIGURATION` state, THE SYSTEM SHALL display selectable controls for opponent type (human or agent), the mark assigned to each player, and game mode (classic or continuous), plus an agent level control whenever the opponent type is agent. | ✅ ready |
| CA-I-02 | US-I-1 | IF the player activates start while opponent type, mark assignment, and game mode are selected, and an agent level is selected whenever the opponent type is agent, THEN THE SYSTEM SHALL transition from `CONFIGURATION` to `IN_GAME`. | ✅ ready |
| CA-I-03 | US-I-2 | THE SYSTEM SHALL indicate at all times whose turn it is and which mark they play. | ✅ ready |
| CA-I-04 | US-I-2 | WHEN a player aligns three marks, THE SYSTEM SHALL highlight the winning line and block further moves. | ✅ ready — `specs/001-engine` BUG-007 closed (T-058/T-059, commits `71d9e29`/`cef0a5b`); `state.winningLine` now exists |
| CA-I-05 | US-I-2 | IF the player attempts an illegal move, THEN THE SYSTEM SHALL reject it stating the reason, without altering the board state. | ✅ ready |
| CA-I-06 | US-I-2 | WHILE the agent is computing its move, THE SYSTEM SHALL show a waiting state and disable the board. | ✅ ready |
| CA-I-07 | US-I-2 | WHILE continuous mode is in the movement phase, THE SYSTEM SHALL indicate which of the player's own marks can move and to which cells. | ✅ ready |
| CA-I-08 | US-I-2 | WHERE information about turn, move legality, or the winning line is conveyed, THE SYSTEM SHALL also convey it through text or an icon, not through color alone. | ✅ ready |
| CA-I-09 | US-I-2 | WHEN the agent's `chooseMove` decision has `resolvedFromMemory` equal to `true`, THE SYSTEM SHALL display an indicator that the move was resolved from memory. | ✅ ready |
| CA-I-10 | US-I-2 | WHEN the agent is selected to move, THE SYSTEM SHALL keep the waiting state visible for at least 300 ms before applying the agent's chosen move. | ✅ ready |
| CA-I-11 | US-I-2 | WHEN a classic-mode game reaches the `FINISHED` state as a draw, THE SYSTEM SHALL display a draw indicator and block further moves. | ✅ ready |
| CA-I-12 | US-I-2 | WHEN it becomes the agent's turn to move, THE SYSTEM SHALL transition from `IN_GAME` to `WAITING_FOR_AGENT`. | ✅ ready |
| CA-I-13 | US-I-2 | WHEN the agent's chosen move is ready and the minimum waiting duration (CA-I-10) has elapsed, THE SYSTEM SHALL apply that move and transition from `WAITING_FOR_AGENT` to `IN_GAME`. | ✅ ready |
| CA-I-14 | US-I-3 | WHEN a game reaches the `FINISHED` state with a winning mark, THE SYSTEM SHALL increment that mark's win count in the session scoreboard. | ✅ ready |
| CA-I-15 | US-I-3 | WHEN a classic-mode game reaches the `FINISHED` state as a draw, THE SYSTEM SHALL increment the session scoreboard's draw count. | ✅ ready |
| CA-I-16 | US-I-3 | WHEN the player activates restart, THE SYSTEM SHALL discard the current game and return to the `CONFIGURATION` state while preserving the session scoreboard's win and draw counts. | ✅ ready |
| CA-I-17 | US-I-4 | THE SYSTEM SHALL display a visible focus indicator on the currently focused interactive control at all times a control has focus. | ✅ ready |
| CA-I-18 | US-I-4 | WHILE the board has keyboard focus, THE SYSTEM SHALL move cell selection to the adjacent cell in the pressed arrow key's direction. | ✅ ready |
| CA-I-19 | US-I-4 | WHEN the focused cell receives an Enter or Space key press, THE SYSTEM SHALL perform the same action a pointer click on that cell would perform. | ✅ ready |
| CA-I-20 | US-I-4 | WHEN the turn changes or the game reaches a result, THE SYSTEM SHALL announce the change to assistive technology without moving keyboard focus. | ✅ ready |
| CA-I-21 | Edge Cases | IF the player clicks or activates a cell that is already occupied, THEN THE SYSTEM SHALL reject the move with the "cell occupied" reason and leave the board unchanged. | ✅ ready |
| CA-I-22 | Edge Cases | IF the player clicks or activates any cell while the system is in the `WAITING_FOR_AGENT` state, THEN THE SYSTEM SHALL ignore the input and keep the board disabled. | ✅ ready |
| CA-I-23 | Edge Cases | WHEN the player activates restart while the game is in the movement phase of continuous mode, THE SYSTEM SHALL discard the in-progress game, clear any pending own-mark selection, and return to `CONFIGURATION`, preserving the session scoreboard. | ✅ ready |
| CA-I-24 | Edge Cases | WHILE the system is in the `IN_GAME`, `WAITING_FOR_AGENT`, or `FINISHED` state, THE SYSTEM SHALL keep configuration controls inaccessible, requiring restart before any configuration change can take effect. | ✅ ready |
| CA-I-25 | Edge Cases | WHEN the player selects one of their own marks during the movement phase, THE SYSTEM SHALL highlight that mark as selected and highlight its legal destination cells. | ✅ ready |
| CA-I-26 | Edge Cases | WHEN the player selects a highlighted destination cell while an own mark is selected, THE SYSTEM SHALL apply the move using the selected mark's cell as the origin and the chosen cell as the destination. | ✅ ready |
| CA-I-27 | Edge Cases | WHEN the player selects an own mark that is already selected, THE SYSTEM SHALL cancel the selection and clear the highlighted destination cells. | ✅ ready |
| CA-I-28 | Responsive Design | THE SYSTEM SHALL render the layout without horizontal scrolling at every viewport width from 320px to 1440px. | ⚠️ not jsdom-verifiable — see Clarifications |
| CA-I-29 | Responsive Design | WHERE the viewport width is below 768px, THE SYSTEM SHALL render configuration, board, and scoreboard in a single column. | ⚠️ not jsdom-verifiable — see Clarifications |
| CA-I-30 | Responsive Design | THE SYSTEM SHALL keep the board square and fully visible without scrolling at every supported viewport, including 320×568. | ⚠️ not jsdom-verifiable — see Clarifications |
| CA-I-31 | Responsive Design | THE SYSTEM SHALL maintain a minimum touch target size of 44×44 px for every interactive control at every supported viewport. | ⚠️ not jsdom-verifiable — see Clarifications |
| CA-I-32 | Responsive Design | THE SYSTEM SHALL keep all configuration controls reachable without any control being clipped or hidden outside the viewport at the narrowest supported viewport (320px). | ⚠️ not jsdom-verifiable — see Clarifications |
| CA-N-02 | Non-Functional | THE SYSTEM SHALL be fully operable with a mouse at any point in the game. | ✅ ready |
| CA-N-03 | Non-Functional | WHERE the browser receives keyboard focus, THE SYSTEM SHALL allow completing a full game without using the mouse. | ✅ ready |

### Key Entities

- **UI State**: one of `CONFIGURATION`, `IN_GAME`, `WAITING_FOR_AGENT`, `FINISHED`. Governs which
  controls are active and what feedback is shown; every transition between these states now has
  its own criterion (CA-I-02, CA-I-04, CA-I-11, CA-I-12, CA-I-13, CA-I-16).
- **Configuration**: the player's choices before a game starts — opponent type (human/agent),
  agent level (when applicable), mark assignment per player, and game mode (classic/continuous).
  Consumed to call `createGame(mode)` and, when the opponent is an agent, `chooseMove`.
- **Session Scoreboard**: win counts per mark plus a draw count, accumulated across games in the
  running session; reset only by a page reload (out of scope), never by restart (CA-I-16).
- **Movement Selection**: the UI-only pending state of "an own mark is selected, awaiting a
  destination" during the movement phase of continuous mode (CA-I-25–CA-I-27). Not part of the
  engine's `State` (`specs/001-engine/data-model.md`) — it is derived UI state built from
  `legalMoves(state)` filtered to the selected origin.
- **Memory Reuse Indicator**: a UI-only rendering of `Decision.resolvedFromMemory`
  (`specs/002-agents/contracts/agents-api.md`) for the complex level (CA-I-09).
- **Winning Line Highlight**: a UI-only rendering of `state.winningLine`
  (`specs/001-engine/data-model.md`, amended — see Clarifications and BUG-007), the three cell
  indices the engine identifies as the completed line (CA-I-04). Not computed by the UI.

## Success Criteria *(mandatory)*

| ID | Measurable Outcome | CA-IDs Covered |
|----|--------------------|----------------|
| SC-I-01 | A new player can set opponent type, agent level (if applicable), mark, and game mode, and start a game, without needing instructions beyond what is on screen. | CA-I-01, CA-I-02 |
| SC-I-02 | At every point during a game, an observer can state whose turn it is, which mark they play, and — during a movement phase — which of their marks may move and where, by reading the screen alone. | CA-I-03, CA-I-07 |
| SC-I-03 | Every rejected move states its reason on screen, and the board looks identical to before the attempt. | CA-I-05, CA-I-21 |
| SC-I-04 | A completed game always ends with the winning line visibly marked and no further moves accepted, or with a draw indicator shown and no further moves accepted. | CA-I-04, CA-I-11, CA-I-22 |
| SC-I-05 | Across a session of multiple games, the scoreboard's totals equal the number of games actually won by each mark and the number of draws, and restarting never changes those totals. | CA-I-14, CA-I-15, CA-I-16, CA-I-23 |
| SC-I-06 | A player who cannot see color still receives every piece of state information a sighted, color-perceiving player receives. | CA-I-08 |
| SC-I-07 | A player using only a keyboard can complete a full game — configuration through result — with visible focus at every step and without a mouse. | CA-I-17, CA-I-18, CA-I-19, CA-I-20, CA-N-03 |
| SC-I-08 | The interface is usable with no horizontal scrolling and no control smaller than 44×44 px at any width from 320px to 1440px, including the 320×568 reference viewport. | CA-I-28, CA-I-29, CA-I-30, CA-I-31, CA-I-32 |
| SC-I-09 | Whenever the complex agent reuses a previously resolved position, that reuse is visible on screen during the same session it happened. | CA-I-09 |
| SC-I-10 | Every entry and exit of the `WAITING_FOR_AGENT` state is demonstrable, not just instrumentable: it is visible for at least 300ms regardless of the agent's actual computation time. | CA-I-06, CA-I-10, CA-I-12, CA-I-13 |

## Assumptions

- The UI calls `createGame`, `legalMoves`, `applyMove` (`specs/001-engine`, including the
  amended `winningLine` field, landed by T-058/T-059) and `chooseMove` (`specs/002-agents`)
  exactly as specified in their contracts; this feature introduces no new engine or agent
  behavior beyond that already-amended field.
- Arrow-key navigation (CA-I-18) at the grid's edge (e.g., pressing "up" from the top row) has no
  criterion requiring a specific response; an implementation that either clamps focus at the edge
  cell or wraps to the opposite edge both satisfy every criterion in this spec.
- The mobile/wider-layout breakpoint (CA-I-29) is fixed at 768px in this spec rather than
  deferred to `plan.md`, since a threshold is required for the criterion to be mechanically
  testable — see Design Decision D10.
- Movement-phase selection cancellation (CA-I-27) is achieved by reselecting the same mark, not a
  dedicated cancel control — see Design Decision D9.
- Configuration is only ever reachable in the `CONFIGURATION` state (CA-I-24); the state machine
  in this spec's Input never lists a transition from `IN_GAME`/`WAITING_FOR_AGENT`/`FINISHED`
  back to `CONFIGURATION` except through restart, so "changing configuration mid-game" has no UI
  surface to attempt it through in the first place.
- The 300ms minimum waiting duration (CA-I-10) is a UX floor applied uniformly regardless of
  agent level; for medium level or a complex-level search near CA-N-01's 1000ms budget, it is a
  no-op since the real computation already exceeds it.
- The test environment(s) able to verify CA-I-28–CA-I-32 (and, partially, CA-I-17) — none of
  which jsdom can verify, since it computes no real CSS layout — is a `plan.md` decision, not
  fixed here.
- The player-facing rendering of every criterion in this spec (button labels, waiting-state text,
  rejection-reason text, scoreboard labels) is in Spanish, per `CLAUDE.md`'s language convention;
  the criteria themselves, and all code/tests implementing them, remain in English.
