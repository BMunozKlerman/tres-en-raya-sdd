# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## About This Repository

Assignment 1 of the Postgraduate Diploma in Software Engineering (DCC, Universidad de Chile):
a tic-tac-toe game with a web interface, built entirely using the SDD (Spec-Driven Development)
workflow of Spec Kit — `constitution → specify → plan → tasks → implement`. Team of 4.

Grading: process 60%, product 30%, presentation 10%. Spec quality, change traceability, and
correct agent use matter more than the code itself.

## Language Convention

All generated artifacts MUST be written in English:
`spec.md`, `plan.md`, `tasks.md`, `traceability.md`, `README.md`, file and folder names,
code identifiers, test names, commit messages, and code comments.

**Exception 1 — Game UI**: The player-facing game interface is shown in Spanish (the Class 6
demo is in Spanish). The code and tests that cover it remain in English.

**Exception 2 — Interface spec mapping**: `specs/003-interface/spec.md` MUST include a table
mapping the 5 mandatory interface criteria from the assignment (written in Spanish) to their
English CA-I-nn IDs, quoting the original Spanish text so the correspondence is auditable.

## Functional Requirements

**RF-1 Game modes**
- Human vs. human (same device).
- Human vs. agent.

**RF-2 Agent levels** (must be distinguishable in play, not just in code):
- **simple**: picks among legal moves without evaluating consequences; no memory.
- **medium**: wins if it can win this turn, blocks if the opponent would win next turn;
  remembers the current game.
- **complex**: never loses a classic game; has persistent memory across games.

**RF-3 Modes**
- **classic**: one piece per turn on an empty cell; draw when the board is full; win takes
  precedence over draw if both are detected on the ninth move.
- **continuous**: each player has exactly 3 pieces; there is a placement phase then a movement
  phase (move a piece to an empty cell); **no draw exists** in this mode.

**RF-4 Interface**
- Mode / level / piece / game-mode configuration before starting a game.
- Restart available at any time.
- Visible session scoreboard.

**Non-functional**
- The agent must respond in under 1 second at any level.
- README must allow running the project in 3 steps or fewer.
- Mouse-operable; full keyboard operation is a desirable goal, not mandatory.

## Process Rules — Non-Negotiable

1. **The spec is the source of truth.** Code, plan, and tasks are derived from it. No
   behavioral change starts by touching code directly.
2. **Spec-first debugging.** A bug is first reproduced as a failing test (that RED commit is
   pushed failing), diagnosed as an incomplete or wrong criterion, corrected in `spec.md`, and
   only then is the affected code regenerated. Never patch code by hand.
3. **Full coverage per criterion.** Every acceptance criterion (CA) must be covered by at least
   one test whose name contains the corresponding CA-ID.
4. **One commit per task**, with tests green before committing. No monolithic commits or squash:
   the commit history is the process evidence.
   - During `/speckit-implement`, each `T-NNN` produces **exactly one commit**, without
     exception and without bundling tasks together — even when several tasks are small or
     touch the same file.
   - Corrections to process artifacts (`spec.md`, `plan.md`, `tasks.md`) made **outside** the
     task cycle — e.g. fixes surfaced by `/speckit-analyze` — may be grouped into a single
     commit when they all derive from the same review. The commit message MUST identify which
     review or analysis produced them.
5. **Manual edits only for non-behavioral details** (UI text, CSS). Must be recorded in the
   manual-edits table in `README.md`.
6. **All AI usage outside the SDD flow must be declared in `README.md`.**

## Naming Conventions

- User story: `US-<area>-<n>`
- Acceptance criterion: `CA-<area>-<nn>`
- Task: `T-NNN`
- Commit: `T-NNN: description (CA-X-NN, ...)`
- Test: `describe('CA-X-NN', ...)`
- Areas: `M` engine · `A` agents · `I` interface · `N` non-functional

### EARS Format for Criteria

- `THE SYSTEM SHALL <response>`
- `WHEN <event>, THE SYSTEM SHALL <response>`
- `WHILE <state>, THE SYSTEM SHALL <response>`
- `IF <condition>, THEN THE SYSTEM SHALL <response>`
- `WHERE <feature>, THE SYSTEM SHALL <response>`

One criterion = one observable response. **Prohibited words (P4)**: *correctly, intuitive,
fast, reasonable, appropriate, user-friendly*. If the test assertion cannot be named in one
sentence, the criterion is ambiguous and must be rewritten.

## Stack and Architecture

- **Vite** + **JavaScript vanilla** (ES modules) + **Vitest**. No UI frameworks, no runtime
  dependencies.
- `src/engine.js` — pure engine: rules, modes, phases. No DOM.
- `src/agents.js` — pure agents (3 levels). No DOM.
- `src/ui.js` — rendering and event handling.

Dependency rule: UI depends on engine and agents; engine and agents **do not know about UI**.

Immutable state: an illegal move returns an error and leaves the state intact (no mutation).

```
state = {
  board: Array(9) of 'X' | 'O' | null,
  turn,
  mode,
  phase,
  piecesPlaced,
  result
}
```

### Contracts

- `legalMoves(state) -> Move[]`
- `applyMove(state, move) -> state' | {error, reason}`
- `chooseMove(state, level, memory, options?) -> {move, memory, nodesEvaluated, resolvedFromMemory}`
  — deterministic for `medium` and `complex`. **Supersedes** the earlier two-field sketch
  (`{move, memory'}`): decision D7 requires `nodesEvaluated`/`resolvedFromMemory` so that memory
  reuse is observable, and `options?` (currently `{random?: () => number}`) is a test-determinism
  seam for the simple level. Full contract in `specs/002-agents/contracts/agents-api.md`.

## Work Sequence (Spec Kit)

One feature at a time, in this order: `001-engine → 002-agents → 003-interface`.

Per feature:
1. `/speckit-specify` → commit
2. `/speckit-clarify` → commit
3. `/speckit-plan` → commit
4. `/speckit-tasks` → `/speckit-analyze` → commit
5. `/speckit-implement` **one task per invocation** (never without arguments)

### Inside each `/speckit-implement`

1. Write the RED test with the CA-ID in the `describe`; show it fails.
2. Commit `test(...)` with the failing test.
3. Minimum production code to make it pass.
4. Full suite green.
5. Commit `T-NNN`.
6. Record in `traceability.md`: TaskID, CA-IDs covered, and the **real** SHA of the commit.
7. Stop and report. Do not chain the next task without explicit instruction.

## What NOT to Do

- Do not write production code outside `/speckit-implement`.
- Do not choose technology inside a spec (that goes in the plan).
- Do not describe algorithms (minimax, alpha-beta pruning, memoization) in the agents spec —
  the spec describes observable behavior; the technique goes in the plan.
- Do not patch a behavioral bug by hand.
- Do not add functionality that no criterion requests.
- Do not invent SHAs in `traceability.md`.
- Do not squash commits.
- Do not use `/speckit-implement` without arguments.
- If a task is insufficient or contradicts the spec: stop and report, do not improvise.

## Pending Group Decisions — BLOCKING

These questions directly affect how the engine and agents specs are written for continuous mode.
**While a row remains unresolved, do not advance on that part of the spec** — ask and stop,
never decide on your own.

| # | Question | Decision | Date |
|---|----------|----------|------|
| 1 | Movement phase: any empty cell or only adjacent? | ✅ Any empty cell. Adjacency restriction would leave a player with no legal moves, a case the assignment does not define. | 2026-07-26 |
| 2 | What happens if a position repeats indefinitely? | ✅ Game continues; no repetition rule. Ending by repetition would produce a terminal state without a winning line, contradicting the "no draw" rule. | 2026-07-26 |
| 3 | Can a player return the next turn to the cell just vacated? | ✅ Allowed. Prohibiting it would require storing the previous move in state, breaking P2 immutability. | 2026-07-26 |
| 4 | Who opens the movement phase after the 6th placement? | ✅ The player who did NOT place the 6th mark — follows naturally from turn alternation, no new rule needed. | 2026-07-26 |
| 5 | Do all 3 levels also play in continuous mode? | ✅ Yes; the assignment does not restrict any level by mode. See `specs/002-agents/spec.md` Design Decisions. | 2026-07-27 |
| 6 | "Persistent memory": browser session only or across reloads? | ✅ Session only. A session already contains multiple games, satisfying "persistent across games." | 2026-07-27 |
| 7 | How is memory observable if minimax already plays optimally without it? | ✅ `chooseMove` returns `nodesEvaluated` and `resolvedFromMemory` alongside the move. | 2026-07-27 |
| 8 | What does "optimal" mean in continuous mode, where the tree never ends and there is no draw? | ✅ Exact (never lose) in classic; bounded by a search horizon (never let the opponent complete a line within it) in continuous. Horizon depth is a plan-level parameter. | 2026-07-27 |

## Current Status

- [x] `specify init` executed
- [x] `/speckit-constitution` committed
- [x] Spec 001-engine artifacts complete (specify/clarify/plan/tasks/analyze) — 20 criteria
      CA-M-01–CA-M-20, 33 tasks T-001–T-033
- [x] Spec 001-engine implementation complete — T-001–T-033 done and committed (`npm test`
      35/35 green); `npm run verify:traceability` exits 0; `traceability.md` holds real SHAs
      for all 20 CA-IDs (commit `2ef54af`)
- [ ] Spec 002-agents — `/speckit-specify` done (17 criteria CA-A-01–CA-A-16 + CA-N-01, D5–D8
      encoded); `/speckit-clarify` applied (N=20 fixed in CA-A-13, CA-A-01 split by level,
      phase-agnostic note on CA-A-09); CA-A-06 (medium memory) resolved with option C — see
      Session Log below. `/speckit-plan` done (commit `eb7ac58`): technique per level, D7
      contract change (`chooseMove` now returns `nodesEvaluated`/`resolvedFromMemory`), search
      horizon calibration procedure, test strategy. Spec and plan both complete; headers say
      `Branch: main` (group decision, 2026-07-27 — see Session Log: no dedicated `002-agents`
      git branch, to keep 001-engine's linear history unbroken). **Next step: `/speckit-tasks`
      for 002-agents.** `/speckit-analyze` not started.
- [ ] Spec 003-interface (specify/clarify/plan/tasks/analyze)
- [ ] `traceability.md` with real SHAs up to date
- [ ] README cold-tested (fresh clone, 3 steps or fewer)

### Session Log

- 2026-07-26: Repository initialized, CLAUDE.md created. 8 blocking decisions pending before
  running `/speckit-constitution`.
- 2026-07-26: Constitution v1.0.0 drafted (P1–P9). Language convention added: all artifacts
  in English; game UI in Spanish (Class 6 demo). spec-template.md adapted to EARS + CA-IDs.
- 2026-07-26: specs/001-engine/spec.md written. 18 criteria CA-M-01–CA-M-18 (EARS, no
  prohibited words). Group decisions D1–D4 resolved and encoded in spec. D5–D8 still
  pending (block specs/002-agents).
- 2026-07-26: plan.md and tasks.md for 001-engine committed (19 criteria, 29 tasks).
  `/speckit-analyze` corrections applied: CA-M-20 added (wrong_phase symmetric case),
  T-021/T-022 split into CA-M-16/CA-M-17 pairs, D2/D3 documented in traceability.md —
  spec now at 20 criteria, tasks.md at 33 tasks (T-001–T-033).
- 2026-07-26: T-001–T-010 implemented and committed, one commit per task, RED before GREEN.
  `npm test` green (7/7). BUG-001 found and fixed during this block: the traceability
  verifier accepted `docs:` commits as implementation evidence (false positives on
  CA-M-15/CA-M-20); corrected in plan.md (commit 706bafc) and in
  `scripts/verify-traceability.mjs` (commit 809f0d8) — see `docs/bugs.md`. Next task: T-011.
- 2026-07-26: T-011–T-026 implemented and committed, one commit per task, RED before GREEN.
  `npm test` green (31/31). Covers CA-M-08, CA-M-20 (wrong_phase both directions), CA-M-09/
  CA-M-11 (legalMoves), CA-M-12 (all 8 winning lines), CA-M-13/CA-M-14 (classic draw and
  win-over-draw precedence), CA-M-15 (placement→movement transition), CA-M-16 (legal
  movement, incl. D3 return-to-vacated-cell), CA-M-17 (no-draw property in continuous mode).
  BUG-002 found and fixed during this block: the CA-M-16 fixture (T-023) used a movement
  that, once the winner scan was added in T-026, turned out to complete a winning line,
  breaking the previously green D3 sub-test; unlike BUG-001 this was not a spec-first
  correction (spec and engine were both correct) but a test-fixture defect — fixed in a
  separate commit (`bfe0a61`, T-023 left untouched) and logged in `docs/bugs.md`.
  `verify:traceability` orphans remaining: CA-M-07, CA-M-10, CA-M-18, CA-M-19 (Phase 4/5,
  deferred pending the movement guards). Next task: T-027.
- 2026-07-27: T-027–T-032 implemented and committed, one commit per task, RED before GREEN.
  `npm test` green (35/35). Covers CA-M-07 (not_own_mark guard), CA-M-10 (legalMoves
  cross-product in movement phase), CA-M-18/CA-M-19 (no_mark_at_source and cell_occupied
  guards on movement destination, new `tests/engine/edge-cases.test.js`). No spec or process
  deviations; no bugs found in this block. `npm run verify:traceability` now exits 0 (all
  20 CA-IDs traced). Only T-033 (real SHAs in traceability.md) remains, deferred per user
  request to a separate session with clear context. Next task: T-033.
- 2026-07-27: T-033 executed. `traceability.md` filled with real SHAs (full 40-char hashes)
  for all 20 CA-IDs, plus separate tables for the two tooling tasks (T-001/T-002, no CA-ID)
  and the three BUG-001/BUG-002 fix commits. No task lacked an identifiable commit. `npm test`
  35/35 green, `npm run verify:traceability` exits 0. Commit `2ef54af`. **001-engine is
  closed** (33/33 tasks).
- 2026-07-27: `/speckit-specify` run for 002-agents. `specs/002-agents/spec.md` written: 2 user
  stories (US-A-1 play at chosen difficulty, US-A-2 perceive levels as distinguishable), 15
  criteria (CA-A-01–CA-A-14 + CA-N-01), group decisions D5–D8 encoded as resolved (not marked
  NEEDS CLARIFICATION, per explicit instruction). Quality checklist passed on first iteration.
  Commit `19925de`.
- 2026-07-27: `/speckit-clarify` run for 002-agents (audit only, D5–D8 not reopened). Findings:
  (1) CA-A-11's simulation criterion named "N games" without fixing N — not testable as
  written; resolved by fixing N=20 (10+10 by first mover) directly in the EARS text, since N is
  a test-methodology parameter with no implementation dependency, unlike the search horizon
  (CA-A-07→CA-A-09), which genuinely needs plan-level calibration against CA-N-01. (2) CA-A-01
  grouped the legality guarantee for all three levels under one ID; split into three
  (CA-A-01 simple, CA-A-03 medium, CA-A-07 complex) because each level will land in its own
  commit, and a shared ID would let the simple-level commit mark the criterion "traced" while
  medium/complex remain unimplemented — the exact false-positive pattern BUG-001 found in
  001-engine's traceability verifier. Renumbered CA-A-02..CA-A-14 to CA-A-02..CA-A-16 (spec now
  has 17 criteria). (3) Added a "phase-agnostic" note to CA-A-09 (complex, continuous mode) for
  consistency with the medium-level criteria. All three integrated and committed together
  (commit `dc639a3`) with a new `## Clarifications` section recording the Q&A.
  **Pending at the time, later resolved (see next entry)**: CA-A-06 (medium level memory,
  ex-CA-A-05) asserted the decision is independent of memory in every case, which made RF-2's
  "memory limited to the game in progress" capability for `medium` formally unobservable — the
  same problem D7 solved for `complex` via decision metrics, but never solved here. Its original
  (flawed) wording was left in place, marked `⚠️ pending correction` in both `spec.md` and
  `checklists/requirements.md` ("Requirements are testable and unambiguous" unchecked). Three
  replacement wordings were put on the table: **Option A** — decision metric symmetric with D7
  (expose `nodesEvaluated`/`resolvedFromMemory` for `medium` too); **Option B** — observable
  effect on an in-game tie-break (require `medium` to repeat a stored choice between equally
  good moves); **Option C** — narrow the claim to non-persistence across games only (at the
  start of a new game, the move must not depend on any memory value produced by a previous
  game).
- 2026-07-27: Group picked **option C** for CA-A-06. New wording: `chooseMove` for the medium
  level, invoked on the initial state of a new game once with a memory value carried over from a
  previous game and once with an empty memory value, returns the same move both times. Recorded
  as a decision of absence of behavior — same pattern as 001-engine's D2 — since the medium
  level's win-this-turn/block-next-turn algorithm needs no history at all to decide; RF-2's
  "memory limited to the game in progress" capability is satisfied by boundedness, not by use.
  Option A was discarded because it would add instrumentation RF-2 requires only for `complex`;
  Option B was discarded because it would invent a tie-break behavior no criterion requests.
  Integrated into `spec.md` (Clarifications entry, EARS text, Functional Requirements table,
  Pending Decisions, Key Entities) and `checklists/requirements.md` ("Requirements are testable
  and unambiguous" now checked), commit `5c1ed58`. **002-agents spec is complete** — 17 criteria
  (CA-A-01–CA-A-16 + CA-N-01), checklist fully passed, ready for `/speckit-plan`.
- 2026-07-27: `/speckit-plan` run for 002-agents (commit `eb7ac58`). Generated `plan.md`,
  `research.md`, `data-model.md`, `contracts/agents-api.md`, `quickstart.md`, and a
  `traceability.md` skeleton (17 CA-IDs, no SHAs invented). Technique per level: simple = uniform
  random pick with an injectable `options.random` seam; medium = win-then-block rule enumeration,
  no search; complex = minimax + alpha-beta with a transposition table, exhaustive in classic
  mode and bounded by `HORIZON_DEPTH` (starting at 6 plies, calibration procedure documented) in
  continuous mode. **Contract change declared**: D7 requires `chooseMove` to return
  `nodesEvaluated`/`resolvedFromMemory` alongside the move — this supersedes the `{move, memory'}`
  sketch previously in this file's Contracts section; that section has now been updated to match
  (see above) and points to `specs/002-agents/contracts/agents-api.md` for the full signature.
  **Note on branching (flagged, resolved same day — see next entry)**: this session's work
  (spec, clarify, plan) was committed directly to `main`, even though `spec.md`/`plan.md`
  declared `Branch: 002-agents` at the time.
- 2026-07-27: Group decision on the branching mismatch flagged above: **no dedicated
  `002-agents` git branch will be created**. The engine feature (`001-engine`) already lives
  entirely on `main` with a linear commit history; opening a feature branch partway through a
  second feature would only fragment that history without adding process value the assignment's
  grading criteria (process traceability via commit history) actually rewards. `spec.md` and
  `plan.md` headers corrected to read `Branch: main`, with a one-line pointer back to this log
  entry so the correction itself is auditable. This is a workflow decision, not a spec content
  change — no CA-ID or D-number is affected, and `.specify` branch-naming conventions elsewhere
  in the repo are left as-is (they name the feature, not a literal git ref).
  **002-agents spec and plan are both complete. Next step: `/speckit-tasks` for 002-agents.**
