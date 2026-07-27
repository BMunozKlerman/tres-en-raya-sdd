# Feature Specification: Game Engine

**Feature Branch**: `001-engine`
**ID Area**: `M` — all acceptance criteria in this spec use the prefix `CA-M-nn`

**Created**: 2026-07-26

**Status**: Draft

**Input**: User description: "Game engine for tic-tac-toe. No UI and no agents in this spec."

## User Stories *(mandatory)*

<!--
  PROHIBITED WORDS — P4 of the Constitution (any criterion containing these fails review):
  correctly · intuitive · fast · reasonable · appropriate · user-friendly · properly

  Valid EARS forms (exactly one per criterion):
    THE SYSTEM SHALL <response>
    WHEN <event>, THE SYSTEM SHALL <response>
    WHILE <state>, THE SYSTEM SHALL <response>
    IF <condition>, THEN THE SYSTEM SHALL <response>
    WHERE <feature>, THE SYSTEM SHALL <response>

  One criterion = exactly ONE observable result = exactly ONE test.
-->

### US-M-1 · Engine Enforces Rules and Arbitrates the Game (Priority: P1)

The engine is the single authority on what moves are legal and what the game state is at every
point. It receives a state and a move, validates the move against the current rules and phase,
and returns either a new state or a structured rejection. No caller can modify the state
directly; every change goes through the engine.

**Why P1**: All other features — agents, UI, scoring — are built on top of this contract.
Without a correct, immutable engine, nothing else can be verified.

**Independent test**: Given an initial state, a sequence of legal moves produces the expected
board and turn sequence; every illegal move attempt returns the correct rejection reason and
leaves the input state byte-for-byte identical.

**Acceptance criteria** (EARS notation):

| ID | EARS Criterion | Notes |
|----|----------------|-------|
| CA-M-01 | THE SYSTEM SHALL accept a mode parameter ("classic" or "continuous") and produce an initial state in which: all 9 board cells are null, turn is X, mode is the specified mode, phase is "placement", piecesPlaced is 0, and result is null. | Covers initial state |
| CA-M-02 | WHEN a legal move is applied to a state whose result is null, THE SYSTEM SHALL return a new state in which turn is the player who was not the turn holder in the input state. | Turn alternation |
| CA-M-03 | WHEN the current player places a mark on a cell whose board value is null during the placement phase, THE SYSTEM SHALL return a new state in which that cell contains the current player's mark and piecesPlaced is one greater than in the input state. | Legal placement |
| CA-M-04 | WHEN a player targets a cell whose board value is not null, THE SYSTEM SHALL return an error with reason "cell_occupied" and leave the input state unchanged. | Occupied cell (both phases) |
| CA-M-05 | WHEN a player attempts a move on a state whose result is null and it is not that player's turn, THE SYSTEM SHALL return an error with reason "wrong_turn" and leave the input state unchanged. | Wrong turn |
| CA-M-06 | WHEN a player attempts a move on a state whose result is not null, THE SYSTEM SHALL return an error with reason "game_over" and leave the input state unchanged. | Finished game; blocks all further play |
| CA-M-07 | WHEN a player submits a movement action specifying a source cell that contains the other player's mark during the movement phase, THE SYSTEM SHALL return an error with reason "not_own_mark" and leave the input state unchanged. | Opponent's mark |
| CA-M-08 | WHEN a player submits a movement action (specifying both source and destination cells) during the placement phase, THE SYSTEM SHALL return an error with reason "wrong_phase" and leave the input state unchanged. | Move during placement |
| CA-M-09 | WHEN legalMoves is called on a state in the placement phase whose result is null, THE SYSTEM SHALL return a list containing exactly one placement action for each cell whose board value is null. | Legal placements enumerated |
| CA-M-10 | WHEN legalMoves is called on a state in the movement phase whose result is null, THE SYSTEM SHALL return a list containing one movement action for each combination of a source cell holding the current player's mark and a destination cell whose board value is null. | Legal movements enumerated |
| CA-M-11 | WHEN legalMoves is called on a state whose result is not null, THE SYSTEM SHALL return an empty list. | No moves after game ends |

---

### US-M-2 · Resolving Win and Draw per Mode (Priority: P2)

Once a move is applied, the engine checks for a terminal condition: a win (three marks aligned)
or, in classic mode only, a draw (board full with no winner). The result is embedded in the
returned state; no separate call is needed to query it.

**Why P2**: Win/draw detection closes the game loop. Without it, a game session has no
termination condition and the scoring system cannot function.

**Independent test**: For each of the 8 winning lines, place marks so that line is completed on
the last move and verify result is set to the placing player. Fill a classic board with no
winner and verify result is "draw". Complete a line on the 9th move and verify result is the
player's mark, not "draw".

**Acceptance criteria** (EARS notation):

| ID | EARS Criterion | Notes |
|----|----------------|-------|
| CA-M-12 | WHEN a move results in cells [0,1,2], [3,4,5], [6,7,8], [0,3,6], [1,4,7], [2,5,8], [0,4,8], or [2,4,6] all containing the same player's mark, THE SYSTEM SHALL set result to that player's mark in the returned state. | All 8 winning lines; test MUST exercise each line independently |
| CA-M-13 | WHEN in classic mode the ninth placement is applied and no winning line is fully occupied by a single player's mark, THE SYSTEM SHALL set result to "draw" in the returned state. | Classic draw |
| CA-M-14 | WHEN in classic mode the ninth placement simultaneously fills the board and completes a winning line for the placing player, THE SYSTEM SHALL set result to that player's mark in the returned state and not set result to "draw". | Win takes precedence over draw on move 9 |

---

### US-M-3 · Managing the Phases of Continuous Mode (Priority: P3)

In continuous mode the game has two phases: placement (each player places their 3 marks) and
movement (each player slides one of their marks to an empty cell each turn). The engine tracks
the current phase, enforces phase-specific legality, and transitions automatically when the last
mark is placed.

**Why P3**: Continuous mode is a differentiating feature of the assignment. Without correct
phase management the mode cannot be played or tested.

**Independent test**: In continuous mode, place 6 marks alternating X and O; verify that the
7th action must be a movement and that turn has switched to the correct player. Then move marks
and verify a win is detected without the game ever ending in draw.

**Acceptance criteria** (EARS notation):

| ID | EARS Criterion | Notes |
|----|----------------|-------|
| CA-M-15 | WHEN in continuous mode the sixth placement is applied, THE SYSTEM SHALL return a state in which phase is "movement", turn is the player who did not make the sixth placement, and piecesPlaced is 6. | Transition decision D4: turn goes to the player who did NOT place the 6th mark — derived from unbroken turn alternation |
| CA-M-16 | WHEN the current player moves one of their own marks from a source cell to a cell whose board value is null during the movement phase, THE SYSTEM SHALL return a new state in which the source cell is null and the destination cell contains the player's mark. | Legal movement; any empty cell is valid (decision D1) |
| CA-M-17 | WHEN in continuous mode result is null and no winning line is fully occupied by a single player's mark after a legal movement, THE SYSTEM SHALL keep result as null in the returned state. | No draw in continuous mode; game continues indefinitely until a line is completed |

---

### Edge Cases

| ID | Edge Case | EARS Criterion |
|----|-----------|----------------|
| CA-M-18 | Source cell is empty during movement phase | WHEN a player submits a movement action specifying a source cell whose board value is null during the movement phase, THE SYSTEM SHALL return an error with reason "no_mark_at_source" and leave the input state unchanged. |
| CA-M-19 | Destination cell is occupied during movement phase | WHEN a player submits a movement action specifying a destination cell whose board value is not null during the movement phase, THE SYSTEM SHALL return an error with reason "cell_occupied" and leave the input state unchanged. |

### Out of Scope

- Graphical or text-based user interface.
- Agent / AI players of any level.
- Networking, multiplayer over a connection, or server-side persistence.
- Boards of sizes other than 3×3.
- Session management, scoring across games, or match history.
- Timers or clocks of any kind.

### Design Decisions (Resolved)

These decisions were raised as blocking questions in the group decision log and resolved before
this spec was written. They are encoded as criteria above; they MUST NOT be reopened without
a governance amendment.

| # | Question | Decision | Justification | Resolved by |
|---|----------|----------|---------------|-------------|
| D1 | Movement destination: any empty cell or only adjacent? | Any empty cell on the board is a valid movement destination. | Restricting to adjacent cells would allow a player to be left with no legal moves — a case the assignment does not define and that would require inventing a resolution rule. "Any empty cell" keeps the game always solvable. | Group — 2026-07-26 |
| D2 | What happens if a board position repeats indefinitely? | The game continues; no repetition rule, no penalty. | The assignment states continuous mode runs until someone aligns three. Ending the game by repetition would produce a terminal state without a winning line, contradicting that rule. | Group — 2026-07-26 |
| D3 | Can a player return the next turn to the cell just vacated? | Yes; returning to the just-vacated cell is a legal movement. | Prohibiting it would require storing the previous move in the state, breaking the immutability and purity of `applyMove` required by constitution P2. The just-vacated cell is empty, so CA-M-16 already permits it. | Group — 2026-07-26 |
| D4 | Who opens the movement phase after the 6th placement? | The player who did NOT make the 6th placement opens the movement phase. | This follows directly from the alternating-turn rule already specified: after the 6th placement, the turn would pass to the other player in the normal course. No additional rule is needed. | Group — 2026-07-26 |

## Requirements *(mandatory)*

<!--
  Consolidated index of all EARS criteria for /speckit-plan and /speckit-tasks.
  Text must be identical to the source tables above. Do not paraphrase.
-->

### Functional Requirements

| CA-ID | US | EARS Criterion | Status |
|-------|----|----------------|--------|
| CA-M-01 | US-M-1 | THE SYSTEM SHALL accept a mode parameter ("classic" or "continuous") and produce an initial state in which: all 9 board cells are null, turn is X, mode is the specified mode, phase is "placement", piecesPlaced is 0, and result is null. | ✅ ready |
| CA-M-02 | US-M-1 | WHEN a legal move is applied to a state whose result is null, THE SYSTEM SHALL return a new state in which turn is the player who was not the turn holder in the input state. | ✅ ready |
| CA-M-03 | US-M-1 | WHEN the current player places a mark on a cell whose board value is null during the placement phase, THE SYSTEM SHALL return a new state in which that cell contains the current player's mark and piecesPlaced is one greater than in the input state. | ✅ ready |
| CA-M-04 | US-M-1 | WHEN a player targets a cell whose board value is not null, THE SYSTEM SHALL return an error with reason "cell_occupied" and leave the input state unchanged. | ✅ ready |
| CA-M-05 | US-M-1 | WHEN a player attempts a move on a state whose result is null and it is not that player's turn, THE SYSTEM SHALL return an error with reason "wrong_turn" and leave the input state unchanged. | ✅ ready |
| CA-M-06 | US-M-1 | WHEN a player attempts a move on a state whose result is not null, THE SYSTEM SHALL return an error with reason "game_over" and leave the input state unchanged. | ✅ ready |
| CA-M-07 | US-M-1 | WHEN a player submits a movement action specifying a source cell that contains the other player's mark during the movement phase, THE SYSTEM SHALL return an error with reason "not_own_mark" and leave the input state unchanged. | ✅ ready |
| CA-M-08 | US-M-1 | WHEN a player submits a movement action (specifying both source and destination cells) during the placement phase, THE SYSTEM SHALL return an error with reason "wrong_phase" and leave the input state unchanged. | ✅ ready |
| CA-M-09 | US-M-1 | WHEN legalMoves is called on a state in the placement phase whose result is null, THE SYSTEM SHALL return a list containing exactly one placement action for each cell whose board value is null. | ✅ ready |
| CA-M-10 | US-M-1 | WHEN legalMoves is called on a state in the movement phase whose result is null, THE SYSTEM SHALL return a list containing one movement action for each combination of a source cell holding the current player's mark and a destination cell whose board value is null. | ✅ ready |
| CA-M-11 | US-M-1 | WHEN legalMoves is called on a state whose result is not null, THE SYSTEM SHALL return an empty list. | ✅ ready |
| CA-M-12 | US-M-2 | WHEN a move results in cells [0,1,2], [3,4,5], [6,7,8], [0,3,6], [1,4,7], [2,5,8], [0,4,8], or [2,4,6] all containing the same player's mark, THE SYSTEM SHALL set result to that player's mark in the returned state. | ✅ ready |
| CA-M-13 | US-M-2 | WHEN in classic mode the ninth placement is applied and no winning line is fully occupied by a single player's mark, THE SYSTEM SHALL set result to "draw" in the returned state. | ✅ ready |
| CA-M-14 | US-M-2 | WHEN in classic mode the ninth placement simultaneously fills the board and completes a winning line for the placing player, THE SYSTEM SHALL set result to that player's mark in the returned state and not set result to "draw". | ✅ ready |
| CA-M-15 | US-M-3 | WHEN in continuous mode the sixth placement is applied, THE SYSTEM SHALL return a state in which phase is "movement", turn is the player who did not make the sixth placement, and piecesPlaced is 6. | ✅ ready |
| CA-M-16 | US-M-3 | WHEN the current player moves one of their own marks from a source cell to a cell whose board value is null during the movement phase, THE SYSTEM SHALL return a new state in which the source cell is null and the destination cell contains the player's mark. | ✅ ready |
| CA-M-17 | US-M-3 | WHEN in continuous mode result is null and no winning line is fully occupied by a single player's mark after a legal movement, THE SYSTEM SHALL keep result as null in the returned state. | ✅ ready |
| CA-M-18 | Edge Cases | WHEN a player submits a movement action specifying a source cell whose board value is null during the movement phase, THE SYSTEM SHALL return an error with reason "no_mark_at_source" and leave the input state unchanged. | ✅ ready |
| CA-M-19 | Edge Cases | WHEN a player submits a movement action specifying a destination cell whose board value is not null during the movement phase, THE SYSTEM SHALL return an error with reason "cell_occupied" and leave the input state unchanged. | ✅ ready |

### Key Entities *(include if feature involves data)*

- **Game State**: complete, immutable snapshot of a game at a point in time. Fields: `board`,
  `turn`, `mode`, `phase`, `piecesPlaced`, `result`. A state is never mutated; every operation
  produces a new state or an error.
- **Board**: sequence of 9 cells (indices 0–8, row-major: row 0 is [0,1,2], row 1 is [3,4,5],
  row 2 is [6,7,8]). Each cell holds X, O, or null.
- **Move**: a player action applied to a state. Two subtypes: a placement action (target cell
  index) and a movement action (source cell index, destination cell index).
- **Winning Line**: one of the 8 fixed cell triplets [0,1,2], [3,4,5], [6,7,8], [0,3,6],
  [1,4,7], [2,5,8], [0,4,8], [2,4,6] that determine victory.
- **Error**: a structured rejection returned when a move is illegal. Contains a `reason` string
  identifying the violated rule. The input state is not altered.

## Success Criteria *(mandatory)*

| ID | Measurable Outcome | CA-IDs Covered |
|----|--------------------|----------------|
| SC-M-01 | A new game state for either mode can be produced from a single mode specification with all fields at their defined initial values. | CA-M-01 |
| SC-M-02 | Every illegal move attempt returns a rejection that identifies the specific rule violated; the input state is identical before and after the attempt. | CA-M-04, CA-M-05, CA-M-06, CA-M-07, CA-M-08, CA-M-18, CA-M-19 |
| SC-M-03 | A winner is detected on the turn the winning line is completed; no additional move is required to confirm the result. | CA-M-12 |
| SC-M-04 | In classic mode, a full board with no winner produces result "draw"; a full board where the final placement completes a winning line produces result equal to the placing player's mark, not "draw". | CA-M-13, CA-M-14 |
| SC-M-05 | In continuous mode, no sequence of legal movements ever produces result "draw"; the game continues until a winning line is completed. | CA-M-17 |
| SC-M-06 | At any non-terminal state, the complete set of legal next actions can be enumerated in a single call. | CA-M-09, CA-M-10, CA-M-11 |
| SC-M-07 | The winning-line check covers all 8 lines; a test suite that exercises each line independently passes for both X and O. | CA-M-12 |

## Assumptions

- The engine is a pure function module with no side effects; it does not read from or write to
  any external system (file system, network, browser storage).
- The caller is responsible for specifying the correct mode at game start; the engine does not
  infer the mode from the sequence of moves.
- Cell indices are integers 0–8 (row-major). Any index outside this range is treated as an
  invalid move; the specific error reason for out-of-range indices is left to the plan.
- The engine does not enforce a time limit on any operation; that constraint is specified in
  CA-N-01, which belongs to the agents spec (002-agents).
- In continuous mode, with 6 marks on a 9-cell board and any empty cell as a valid destination
  (D1), a player always has at least 3 × 3 = 9 legal movements available; a "no legal moves"
  state is unreachable and does not require a resolution rule.
