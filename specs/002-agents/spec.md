# Feature Specification: Game Agents

**Feature Branch**: `002-agents`
**ID Area**: `A` — all acceptance criteria in this spec use the prefix `CA-A-nn`. This spec
also carries `CA-N-01`, the response-time criterion the constitution (P9) assigns to
`002-agents`.

**Created**: 2026-07-27

**Status**: Draft

**Input**: User description: "Game agents for the tic-tac-toe engine. Three levels — simple,
medium, complex — defined by resolution (how well they evaluate the position) and memory (what
they retain across moves and games). Agents consume `specs/001-engine/spec.md`'s engine and do
not access the user interface."

<!--
  LANGUAGE: All content in this spec must be written in English.
  Exception: specs/003-interface/spec.md — see language convention in CLAUDE.md.
-->

## User Stories *(mandatory)*

### US-A-1 · Play Against an Opponent of a Chosen Difficulty (Priority: P1)

A player picks one of three difficulty levels — simple, medium, or complex — and the engine's
turn is resolved by an agent matching that level, in either game mode and in every phase of
continuous mode. Each level has a distinct decision rule: simple treats every legal move as
equally acceptable; medium reacts to immediate threats using only the state in front of it;
complex plays without ever losing a classic game and carries what it has learned forward across
games in the same session.

**Why P1**: This is the core contract the rest of the feature depends on — agents, UI, and
scoring all assume a `chooseMove` call resolves to a legal move for the requested level. Without
it, no game against the computer can be played at all.

**Independent test**: For each level and each combination of mode (classic, continuous) and
phase (placement, movement), calling `chooseMove` on a non-terminal state returns a move present
in `legalMoves(state)`. Confirm each level's distinguishing rule in isolation: simple ignores
memory, medium wins or blocks on the current state alone, complex never loses a full classic
game and reuses memory across games in a session.

**Acceptance criteria** (EARS notation):

| ID | EARS Criterion | Notes |
|----|----------------|-------|
| CA-A-01 | WHEN `chooseMove` is invoked for the simple, medium, or complex level on a non-terminal state, in classic or continuous mode, during the placement phase or the movement phase, THE SYSTEM SHALL return a move contained in `legalMoves(state)`. | Base legality guarantee (D5: all levels play both modes). Test MUST exercise level × mode × phase combinations, parametrized like CA-M-12. |
| CA-A-02 | WHEN `chooseMove` is invoked for the simple level on the same state with two different memory values, THE SYSTEM SHALL return the same move for both invocations. | Observable evidence of "no memory" (RF-2): the chosen move does not depend on memory content. |
| CA-A-03 | IF a legal move exists for the medium level that would set `result` to the current player's mark, THEN THE SYSTEM SHALL return one such move. | Win-this-turn detection (RF-2). Phase-agnostic: applies identically in classic and continuous mode, placement and movement phase. |
| CA-A-04 | IF no legal move exists for the medium level that would set `result` to the current player's mark, AND exactly one legal opponent move would set `result` to the opponent's mark on the opponent's next turn, THEN THE SYSTEM SHALL return a move after which no legal opponent move sets `result` to the opponent's mark. | Block-next-turn detection (RF-2), single-threat case. Phase-agnostic. The double-threat case is CA-A-14. |
| CA-A-05 | WHEN `chooseMove` is invoked for the medium level on the same state with two different memory values, THE SYSTEM SHALL return the same move for both invocations. | Medium's decision carries no memory weight: RF-2's "memory limited to the game in progress" reduces, at the decision level, to non-dependence on any history, since win/block detection needs only the current state. |
| CA-A-06 | WHEN the complex level plays a complete classic-mode game against any sequence of legal opponent moves, THE SYSTEM SHALL end that game with a result that is never the opponent's mark. | Classic-mode optimality (D8). Classic mode's state space is small enough to verify by exhaustive game-tree traversal, not sampling. |
| CA-A-07 | WHEN the complex level selects a move in continuous mode, THE SYSTEM SHALL return a move after which no legal opponent move, within the search horizon, sets `result` to the opponent's mark. | Continuous-mode optimality is bounded by a search horizon (D8) because the game tree is unbounded (no draw, no repetition rule — see 001-engine D2). The horizon depth is a plan-level parameter calibrated against CA-N-01. |
| CA-A-08 | WHEN the complex level is invoked, within the same session, on a position it has already resolved in an earlier `chooseMove` call, THE SYSTEM SHALL return `resolvedFromMemory` equal to true and `nodesEvaluated` less than the value returned for that position's first resolution. | Observable evidence of persistent memory (D6, D7): minimax already selects the same move with or without a cache, so memory would otherwise be untestable through the move alone. Test evidence MUST include at least one case where the second encounter happens in a different game of the same session, to demonstrate cross-game persistence, not just cross-call persistence within one game. |

---

### US-A-2 · Perceive the Three Levels as Distinguishable While Playing (Priority: P2)

A player who plays several games notices that the three levels behave differently: medium and
complex repeat the same decision when faced with the same situation, and complex consistently
outperforms simple over a run of games. This is what makes "choosing a difficulty" a meaningful
choice rather than a cosmetic label.

**Why P2**: Distinguishability is what makes RF-2's three levels a real feature rather than
three names for the same behavior. It depends on US-A-1's decision rules already being in place.

**Independent test**: Run the same state and memory through the medium level twice, and through
the complex level twice; both return identical moves each time. Run a batch of complete classic
games between the complex and simple levels, alternating who moves first; the complex level
never loses one.

**Acceptance criteria** (EARS notation):

| ID | EARS Criterion | Notes |
|----|----------------|-------|
| CA-A-09 | WHEN `chooseMove` is invoked twice for the medium level with the same state and the same memory, THE SYSTEM SHALL return the same move both times. | Determinism, medium level. |
| CA-A-10 | WHEN `chooseMove` is invoked twice for the complex level with the same state and the same memory, THE SYSTEM SHALL return the same move both times. | Determinism, complex level. |
| CA-A-11 | WHEN the complex level and the simple level play N complete classic-mode games against each other, alternating which level moves first, THE SYSTEM SHALL win or draw every game as the complex level. | Measurable distinguishability (US-A-2) verifiable by simulation. N is a plan-level parameter; the test suite fixes a concrete value. |

---

### Edge Cases

| ID | Edge Case | EARS Criterion |
|----|-----------|-----------------|
| CA-A-12 | Exactly one legal move is available | IF `legalMoves(state)` contains exactly one move, THEN THE SYSTEM SHALL return that move for the simple, medium, and complex level. |
| CA-A-13 | Medium level faces a simultaneous win-and-block choice | IF a legal move exists for the medium level that would set `result` to the current player's mark AND a different legal move exists that would block an opponent's next-turn win, THEN THE SYSTEM SHALL return the winning move. |
| CA-A-14 | Medium level faces a double threat it cannot fully resolve | IF no legal move exists for the medium level that would set `result` to the current player's mark, AND two or more distinct legal opponent moves would each set `result` to the opponent's mark on the opponent's next turn, THEN THE SYSTEM SHALL return a move that blocks exactly one of those opponent moves. |

CA-A-14 documents the medium level's known limitation against a double threat — RF-2 only
requires medium to detect and block a single next-turn threat. The complex level, verified by
CA-A-06 and CA-A-07, does not exhibit this limitation.

### Non-Functional Requirements

| ID | Edge Case | EARS Criterion |
|----|-----------|-----------------|
| CA-N-01 | Worst-case response time, any level | WHEN the agent computes its move in the worst-case position, THE SYSTEM SHALL return the move in under 1000 ms, measured at the simple, medium, and complex level. |

CA-N-01 is assigned to `002-agents` by constitution P9 and MUST be measured directly on the pure
`chooseMove` function, without any UI or DOM involvement.

### Out of Scope

- User interface of any kind (rendering, input handling, difficulty selector).
- Networking, multiplayer over a connection, or server-side persistence of memory or state.
- Difficulty levels beyond simple, medium, and complex.
- Algorithms or data structures used internally by any level (minimax, alpha-beta pruning,
  memoization) — these belong in `plan.md`, not in this spec.

### Design Decisions (Resolved)

These decisions were raised as blocking questions in `CLAUDE.md` (D5–D8) and resolved before
this spec was written. They are encoded as criteria above; they MUST NOT be reopened without a
governance amendment.

| # | Question | Decision | Justification | Resolved by |
|---|----------|----------|---------------|-------------|
| D5 | Do all 3 levels also play in continuous mode? | Yes; all three levels play in both classic and continuous mode. | The assignment does not restrict any level by mode; limiting a level to one mode would leave functional requirements uncovered. | Group — 2026-07-27 |
| D6 | "Persistent memory": browser session only or across reloads? | Session only; memory is not preserved across page reloads. | A session already contains multiple games, which satisfies "persistent across games." Cross-reload storage would add serialization and state-cleanup concerns with no criterion requiring them. | Group — 2026-07-27 |
| D7 | How is memory observable if minimax already plays optimally without it? | `chooseMove` returns, alongside the move, `nodesEvaluated` and `resolvedFromMemory`. | Since minimax already selects an optimal move whether or not a cache is used, the move itself cannot distinguish "used memory" from "did not." Exposing these two decision metrics makes memory reuse observable and testable (CA-A-08). | Group — 2026-07-27 |
| D8 | What does "optimal" mean in continuous mode, where the tree never ends and there is no draw? | Classic-mode optimality is exact (never lose); continuous-mode optimality is bounded by a search horizon (never let the opponent complete a line within that horizon). | D1/D2 (001-engine) leave continuous mode with no termination by repetition, so its game tree is infinite; unbounded search cannot satisfy CA-N-01's one-second budget. The horizon depth is a plan-level parameter, not a spec value. | Group — 2026-07-27 |

### Pending Decisions [NEEDS CLARIFICATION]

None — group decisions D5–D8 above resolve every open question raised for this feature. No
`[NEEDS CLARIFICATION]` markers remain in this spec.

## Requirements *(mandatory)*

### Functional Requirements

| CA-ID | US | EARS Criterion | Status |
|-------|----|----------------|--------|
| CA-A-01 | US-A-1 | WHEN `chooseMove` is invoked for the simple, medium, or complex level on a non-terminal state, in classic or continuous mode, during the placement phase or the movement phase, THE SYSTEM SHALL return a move contained in `legalMoves(state)`. | ✅ ready |
| CA-A-02 | US-A-1 | WHEN `chooseMove` is invoked for the simple level on the same state with two different memory values, THE SYSTEM SHALL return the same move for both invocations. | ✅ ready |
| CA-A-03 | US-A-1 | IF a legal move exists for the medium level that would set `result` to the current player's mark, THEN THE SYSTEM SHALL return one such move. | ✅ ready |
| CA-A-04 | US-A-1 | IF no legal move exists for the medium level that would set `result` to the current player's mark, AND exactly one legal opponent move would set `result` to the opponent's mark on the opponent's next turn, THEN THE SYSTEM SHALL return a move after which no legal opponent move sets `result` to the opponent's mark. | ✅ ready |
| CA-A-05 | US-A-1 | WHEN `chooseMove` is invoked for the medium level on the same state with two different memory values, THE SYSTEM SHALL return the same move for both invocations. | ✅ ready |
| CA-A-06 | US-A-1 | WHEN the complex level plays a complete classic-mode game against any sequence of legal opponent moves, THE SYSTEM SHALL end that game with a result that is never the opponent's mark. | ✅ ready |
| CA-A-07 | US-A-1 | WHEN the complex level selects a move in continuous mode, THE SYSTEM SHALL return a move after which no legal opponent move, within the search horizon, sets `result` to the opponent's mark. | ✅ ready |
| CA-A-08 | US-A-1 | WHEN the complex level is invoked, within the same session, on a position it has already resolved in an earlier `chooseMove` call, THE SYSTEM SHALL return `resolvedFromMemory` equal to true and `nodesEvaluated` less than the value returned for that position's first resolution. | ✅ ready |
| CA-A-09 | US-A-2 | WHEN `chooseMove` is invoked twice for the medium level with the same state and the same memory, THE SYSTEM SHALL return the same move both times. | ✅ ready |
| CA-A-10 | US-A-2 | WHEN `chooseMove` is invoked twice for the complex level with the same state and the same memory, THE SYSTEM SHALL return the same move both times. | ✅ ready |
| CA-A-11 | US-A-2 | WHEN the complex level and the simple level play N complete classic-mode games against each other, alternating which level moves first, THE SYSTEM SHALL win or draw every game as the complex level. | ✅ ready |
| CA-A-12 | Edge Cases | IF `legalMoves(state)` contains exactly one move, THEN THE SYSTEM SHALL return that move for the simple, medium, and complex level. | ✅ ready |
| CA-A-13 | Edge Cases | IF a legal move exists for the medium level that would set `result` to the current player's mark AND a different legal move exists that would block an opponent's next-turn win, THEN THE SYSTEM SHALL return the winning move. | ✅ ready |
| CA-A-14 | Edge Cases | IF no legal move exists for the medium level that would set `result` to the current player's mark, AND two or more distinct legal opponent moves would each set `result` to the opponent's mark on the opponent's next turn, THEN THE SYSTEM SHALL return a move that blocks exactly one of those opponent moves. | ✅ ready |
| CA-N-01 | Non-Functional | WHEN the agent computes its move in the worst-case position, THE SYSTEM SHALL return the move in under 1000 ms, measured at the simple, medium, and complex level. | ✅ ready |

### Key Entities

- **Agent Level**: one of `simple`, `medium`, `complex`. Determines both the resolution rule
  (how the position is evaluated before deciding) and the memory rule (what is retained across
  calls) per RF-2.
- **Decision**: the value returned by `chooseMove` — the chosen `move`, the updated `memory`,
  `nodesEvaluated` (a count), and `resolvedFromMemory` (a boolean). The last two fields exist
  solely to make memory reuse observable (D7); their exact production is a plan-level concern.
- **Memory**: an opaque, level-scoped value threaded between `chooseMove` calls by the caller.
  Unused by the simple level (CA-A-02); carries no decision weight for the medium level
  (CA-A-05); persists across games within a session for the complex level (D6, CA-A-08).
- **Session**: the lifetime of the running page. Memory for the complex level persists for the
  duration of a session and is discarded on reload (D6).
- **Search Horizon**: a bounded depth limit applied to the complex level's move search in
  continuous mode (D8). Its value is a plan-level parameter, calibrated against CA-N-01.

## Success Criteria *(mandatory)*

| ID | Measurable Outcome | CA-IDs Covered |
|----|--------------------|----------------|
| SC-A-01 | At any point in either mode and either continuous-mode phase, every move an agent returns, at every level, is one of the moves currently available to the player. | CA-A-01, CA-A-12 |
| SC-A-02 | Playing at the complex level, a classic-mode game never ends with the opponent's mark as the result, regardless of how the opponent plays. | CA-A-06 |
| SC-A-03 | Over N classic games between the complex and simple levels, alternating who moves first, the complex level never loses. | CA-A-11 |
| SC-A-04 | Given the same position and the same memory, the medium and complex levels each repeat their own earlier decision. | CA-A-09, CA-A-10 |
| SC-A-05 | Within a session, a position the complex level has already worked out — even in an earlier game — is resolved with less computation the second time. | CA-A-08 |
| SC-A-06 | An agent always responds within one second, at every level, even in the worst-case position. | CA-N-01 |

## Assumptions

- The caller is responsible for supplying and threading the `memory` value between `chooseMove`
  calls; the agents module does not store it itself.
- Tie-breaking among multiple moves that satisfy a criterion (several equally winning moves,
  several cells that block the same threat, which of two simultaneous threats the medium level
  blocks) is left to the implementation. Determinism (CA-A-09, CA-A-10) requires only that the
  same choice repeats for the same state and memory, not any specific tie-break rule.
- N (CA-A-11) and the search horizon (CA-A-07) are calibrated in `plan.md` against CA-N-01's
  one-second budget; this spec does not fix their values.
- Agents consume the engine's `applyMove` and `legalMoves` contracts exactly as specified in
  `specs/001-engine/spec.md`; this feature introduces no new engine behavior.
- CA-N-01 is measured directly on the pure `chooseMove` function, without any UI or DOM
  involvement, consistent with constitution P9.
