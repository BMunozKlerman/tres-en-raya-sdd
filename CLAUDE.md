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
- [x] Spec 002-agents — `/speckit-specify` done (17 criteria CA-A-01–CA-A-16 + CA-N-01, D5–D8
      encoded); `/speckit-clarify` applied (N=20 fixed in CA-A-13, CA-A-01 split by level,
      phase-agnostic note on CA-A-09); CA-A-06 (medium memory) resolved with option C — see
      Session Log below. `/speckit-plan` done (commit `eb7ac58`): technique per level, D7
      contract change (`chooseMove` now returns `nodesEvaluated`/`resolvedFromMemory`), search
      horizon calibration procedure, test strategy. `/speckit-tasks` done: 24 tasks T-034–T-057
      (originally 23, T-034–T-056, before the analyze-driven split below), full coverage of all
      17 CA-IDs. `/speckit-analyze` done (2026-07-27): one CRITICAL finding (constitution P2
      still asserted the pre-D7 `chooseMove` contract while `plan.md`/`contracts/agents-api.md`
      had already implemented the wider one), resolved by amending the constitution to v2.0.0
      rather than documenting an exception in `plan.md` — logged as BUG-003 in `docs/bugs.md`.
      Also split T-047 into T-047/T-048 (flagged as most likely to exceed one commit) and added
      literal "D7" citations to the tasks that materialize its `Decision` shape — see Session
      Log below. Headers say `Branch: main` (group decision, 2026-07-27 — see Session Log: no
      dedicated `002-agents` git branch, to keep 001-engine's linear history unbroken).
- [x] Spec 002-agents implementation complete — T-034–T-057 done and committed, one commit per
      task, RED before GREEN (`npm test` 63/63 green); `npm run verify:traceability` exits 0 for
      both features (37/37 CA-IDs); `specs/002-agents/traceability.md` holds real SHAs for all 17
      CA-IDs. Three process bugs found and fixed during this block (see `docs/bugs.md` and
      Session Log below): BUG-004 (`tasks.md`'s T-041 block-check pseudocode could not satisfy a
      genuine double threat — corrected to a direct single-ply check), BUG-005 (T-046's CA-A-09
      fixture was an unwinnable fork, not a fair test position — rebuilt and hand-verified),
      BUG-006 (`scripts/verify-traceability.mjs` was hardcoded to `001-engine` and had never once
      inspected `002-agents`, despite `plan.md` claiming otherwise — generalized to scan every
      feature). `src/agents.js` now implements all three levels (simple: uniform random;
      medium: win-then-block rule; complex: minimax + alpha-beta, `HORIZON_DEPTH=6`, transposition
      table). **002-agents is closed.**
- [x] `001-engine` reopening closed — T-058 (RED, commit `71d9e29`) and T-059 (GREEN, commit
      `cef0a5b`) implemented, one commit per task, RED before GREEN. `src/engine.js` now sets
      `winningLine` in both the placement and movement paths of `applyMove`, and `createGame`
      includes `winningLine: null`. `npm test` 64/64 green; `npm run verify:traceability` exits 0
      (37/37 CA-IDs across both features). BUG-007 closed (`docs/bugs.md`); CA-M-12's
      `⚠️ amended, pending T-058/T-059` marker cleared to `✅ ready` in `spec.md`; real SHAs
      recorded in `specs/001-engine/traceability.md`. **`001-engine` is closed again.**
- [x] Spec 003-interface — `/speckit-specify`, `/speckit-clarify`, **and `/speckit-plan`** all
      done. `spec.md` holds 4 user stories (US-I-1..4) and **32 `CA-I-nn` criteria** (the 5
      mandatory assignment criteria, verbatim from §2.5, mapped to their Spanish original in a
      dedicated table; configuration; scoreboard; restart; full keyboard operation;
      color-independent information; agent memory-reuse observability; responsive design
      320–1440px; minimum waiting-state duration; draw indicator; explicit `WAITING_FOR_AGENT`
      transition criteria) plus `CA-N-02`/`CA-N-03` cited from the constitution. Checklist
      passed, 0 `NEEDS CLARIFICATION` markers. `/speckit-clarify` was audit-only (D9/D10 not
      reopened) and grew the spec from 28 to 32 criteria. `/speckit-plan` (2026-07-27) generated
      `plan.md`, `research.md` (D-I-01..D-I-08), `data-model.md`, `contracts/app-state-api.md`,
      `contracts/dom-contract.md`, `quickstart.md`, `manual-verification.md`, and the
      `traceability.md` skeleton (34 CA-IDs, no SHAs invented) — see Session Log for the full
      set of decisions (UI module split, jsdom test strategy, mobile-first CSS, manual
      verification procedure for the 6 layout-dependent criteria). **One documented exception
      to constitution P1** recorded in `plan.md`'s Complexity Tracking: `jsdom` added as a
      devDependency (required by Vitest's `jsdom` test environment, not by Vite/Vitest's core
      itself), justified there per P1's explicit-approval clause and Governance's Exceptions
      procedure — not one of the four absolute non-negotiables, so a documented exception is
      permitted. **003-interface spec and plan are both complete.**
- [ ] `specs/003-interface/tasks.md` — not yet generated.
- [ ] `traceability.md` with real SHAs up to date for `003-interface` (skeleton only so far).
- [ ] README cold-tested (fresh clone, 3 steps or fewer).

**Next step**: `/speckit-tasks` for `003-interface`.

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
- 2026-07-27: `/speckit-tasks` run for 002-agents (commit `a6db369`). Generated `tasks.md`: 23
  tasks, T-034–T-056, one RED/GREEN pair per criterion or homogeneous group, full coverage of
  all 17 CA-IDs (Coverage Audit table, Self-Check Report). **Next step: `/speckit-analyze` for
  002-agents.**
- 2026-07-27: `/speckit-analyze` run for 002-agents (read-only pass over spec/plan/tasks/
  traceability/contracts/constitution). One CRITICAL finding: the ratified constitution (P2)
  still stated the pre-D7 `chooseMove(state, level, memory) → {move, memory'} — MUST be
  deterministic` contract verbatim, while `plan.md` and `contracts/agents-api.md` had already
  implemented the wider `Decision` shape (`nodesEvaluated`/`resolvedFromMemory` + `options?`)
  and a non-deterministic `simple` level (D-R-01) — neither document had amended the
  constitution nor recorded an exception in `plan.md`'s Complexity Tracking section. Also
  flagged: T-047 (CA-A-09) bundled a new code layer (static evaluation + horizon cutoff) with
  an open-ended calibration loop — the task most likely to exceed one commit; and D7 had no
  literal citation anywhere in `tasks.md`, only in `spec.md`/`plan.md`/`contracts/agents-api.md`.
  Resolved: constitution amended to **v2.0.0** (commit `f6a8c62`) via the Amendment Procedure —
  P2's `chooseMove` contract updated to match D7, "MUST be deterministic" narrowed to
  `medium`/`complex`, new Amendment History section recording the change; no exception
  documented in `plan.md` per explicit group instruction, since the constitution was the
  artifact stating something already false. `tasks.md` corrected (commit `d18f32c`): T-047
  split into T-047 (implementation) / T-048 (calibration), everything after renumbered
  (23 → 24 tasks, T-034–T-057); literal "D7" citations added to T-035, T-037, T-043, T-050.
  Both fixes logged as **BUG-003** in `docs/bugs.md`, since this is a process bug (a derived
  artifact drifting from the constitution) rather than a gameplay bug. **002-agents spec, plan,
  tasks, and analyze are all complete. Next step: `/speckit-implement` starting at T-034.**
- 2026-07-27: `/speckit-implement` run for 002-agents, T-034–T-057, one commit per task, RED
  before GREEN, `npm test` green throughout (63/63 at close). `src/agents.js` created and built
  incrementally: simple level (uniform random pick, `options.random` seam, T-034/T-035); medium
  level (base dispatch T-036/T-037, win-this-turn T-038/T-039, block-next-turn T-040/T-041);
  complex level (deterministic stub T-042/T-043, classic-mode minimax + alpha-beta T-044/T-045,
  continuous-mode horizon cutoff with static evaluation T-046–T-048, transposition table for
  cross-game memory reuse T-049/T-050); corollary confirmations for CA-A-14, CA-A-13, and CA-N-01
  (T-051–T-056, no production code); traceability closure with real SHAs (T-057). Three process
  bugs found and fixed along the way, all logged in `docs/bugs.md`:
  - **BUG-004**: `tasks.md`'s T-041 pseudocode (a two-ply "does any opponent reply win" check)
    could never satisfy CA-A-16 under a genuine double threat — occupying one threatened cell
    never clears a second, distinct one, so the check always fell through to an arbitrary
    fallback. Replaced with a direct single-ply check (does *this* cell, played by the opponent,
    win right now) that blocks the first threat found by construction. `tasks.md`'s T-041
    description corrected in place with a note explaining the discard; CA-A-05/CA-A-15/CA-A-16
    themselves were never touched.
  - **BUG-005**: T-046's first CA-A-09 fixture was an unnoticed fork (`O`'s three pieces created
    two independent one-move wins through a shared center cell) — an unwinnable position, not a
    fair test of the search. Caught only once the real minimax search (T-047) unanimously scored
    every legal move as a loss. Rebuilt as a single-threat position, hand-verified against all 8
    winning lines before the assertions were written (same discipline as 001-engine's BUG-002).
  - **BUG-006**: `specs/002-agents/plan.md`'s Constitution Check (P6 row) claimed
    `scripts/verify-traceability.mjs` "already scans any `CA-\d+` pattern... no change needed for
    the `CA-A-nn` prefix" — false on both counts (the regex was `CA-M-\d+` literally, and every
    path was hardcoded to `001-engine`). Every `verify:traceability` run during T-034–T-056 had
    therefore silently re-checked only `001-engine`'s already-closed 20 criteria. Found while
    preparing T-057, the first task that actually depended on `002-agents` coverage. Generalized
    the script to iterate every `specs/<feature>/` directory, report per feature, and use a
    table-row-anchored generic pattern (avoiding false orphans from cross-feature prose mentions
    like `002-agents/spec.md` citing `CA-M-12`). `npm run verify:traceability` now reports
    `001-engine: OK: all 20 CA-IDs fully traced` / `002-agents: OK: all 17 CA-IDs fully traced` /
    `OK: all 37 CA-IDs fully traced across 2 feature(s)`. `/speckit-analyze` did not catch this —
    it checks artifacts against each other, not claims a plan makes about tooling behavior.
  **002-agents is closed**: 24 tasks, 17 CA-IDs, `npm test` 63/63, `verify:traceability` exits 0
  for both features. Next step: `/speckit-specify` for `003-interface`.
- 2026-07-27: `/speckit-specify` run for 003-interface. `specs/003-interface/spec.md` written:
  4 user stories (US-I-1 configure, US-I-2 play with clear state feedback, US-I-3 follow the
  scoreboard, US-I-4 operate by keyboard), 28 `CA-I-nn` criteria plus `CA-N-02`/`CA-N-03` cited
  from the constitution. The 5 mandatory assignment criteria (§2.5, verbatim) are mapped in a
  dedicated table to their Spanish original, per `CLAUDE.md`'s Exception 2. Two resolved design
  decisions recorded (D9: movement-phase own-mark selection is cancelled by reselecting the same
  mark; D10: mobile/wider-layout breakpoint fixed at 768px). Checklist passed, 0
  `NEEDS CLARIFICATION` markers. Commit `6aba4f9`.
- 2026-07-27: `/speckit-clarify` run for 003-interface (audit only; D9/D10 not reopened, per
  explicit instruction). Verified: 28 `CA-I-nn` IDs unique, no P4-prohibited words inside any
  criterion's EARS text, state-machine transitions traced against the diagram in this file's
  RF-4/Input section. Found 2 real gaps and answered 3 direct questions:
  - **jsdom verifiability**: CA-I-24, CA-I-25, CA-I-26, CA-I-27, CA-I-28 (all responsive) plus
    CA-I-13 (visible focus, borderline — a "focus style applied" proxy is checkable, true
    rendered visibility is not) cannot be verified in jsdom, which computes no real CSS layout.
    The other ~26 criteria (state, ARIA, events, keyboard) need no layout and are jsdom-testable.
    Per group instruction, these 6 are left as written; a note was added to `spec.md` deferring
    the verification-environment decision (Playwright / Vitest browser mode / other) to
    `plan.md` — not decided here.
  - **CA-I-06 (waiting state) satisfiability**: as originally worded, satisfiable by
    instrumentation alone even at the complex agent's ~12ms response time, with no minimum
    visible duration — meaning a human would never actually see it during a live demo. Resolved
    by adding a new criterion (see below) rather than rewriting the mandatory-verbatim CA-I-06.
  - **Engine/agent contract gaps**: found one — CA-I-04 ("highlight the winning line") needs to
    know *which* cells won, but `001-engine`'s `State.result` never exposed a line reference and
    `WINNING_LINES` is not exported. Logged as **BUG-007** and resolved by amending
    `specs/001-engine` (CA-M-12 extended to also set `winningLine`; see next entry) rather than
    having the UI duplicate the engine's 8-line constant.
  Group decisions taken on all 4 open points (winning line: amend the engine, not duplicate it in
  the UI; waiting state: add a 300ms minimum-visible-duration criterion instead of rewriting
  CA-I-06; draw: add a criterion for the FINISHED-draw visual state, parallel to CA-I-04's win
  case; transitions: add explicit criteria for `IN_GAME→WAITING_FOR_AGENT` and
  `WAITING_FOR_AGENT→IN_GAME` instead of leaving them inferred). `spec.md` grew from 28 to 32
  `CA-I-nn` criteria (new: CA-I-10 minimum waiting duration, CA-I-11 draw indicator, CA-I-12/
  CA-I-13 transition triggers; everything from old CA-I-10 onward renumbered +4 to keep IDs in
  document order). **003-interface spec and clarify are complete.**
- 2026-07-27: **`001-engine` reopened**, triggered by the CA-I-04 gap found above. Per constitution
  P3 (spec is the source of truth for any behavioral change) and the same amendment discipline
  used for the constitution itself (v1.0.0 → v2.0.0), `specs/001-engine/spec.md` gained a new
  "Amendments (Post-Closure)" section: CA-M-12 amended to also set `winningLine` (the winning
  line's three cell indices) on the returned state — no new CA-ID, per D9 (both fields are one
  operation's single response). `data-model.md` and `contracts/engine-api.md` updated to match.
  Two new tasks appended to `tasks.md`, continuing the project's global task sequence from
  `002-agents`'s end: **T-058** (RED — extend the existing CA-M-12 test with `winningLine`
  assertions) and **T-059** (GREEN — capture the matching `WINNING_LINES` entry in `src/engine.js`
  instead of just the boolean `hasWinner`). Neither task has been executed yet — per `CLAUDE.md`,
  production code is not written outside `/speckit-implement`, so `src/engine.js` is unchanged
  and BUG-007 (`docs/bugs.md`) remains **Open** until T-058/T-059 run. `specs/003-interface`'s
  CA-I-04 updated to cite `state.winningLine` instead of describing the gap. **Next step**:
  `/speckit-implement T-058` (to close BUG-007) at some point before `003-interface` is
  implemented, since its UI work depends on the field existing; then continue `003-interface`
  with `/speckit-plan`.
- 2026-07-27: T-058 (RED, commit `71d9e29`) and T-059 (GREEN, commit `cef0a5b`) implemented, one
  commit per task, RED before GREEN. `src/engine.js` now sets `winningLine` (the matching line's
  three cell indices, or `null`) in both the placement and movement paths of `applyMove`, and
  `createGame` includes `winningLine: null`. `npm test` 64/64 green; `npm run
  verify:traceability` exits 0 (`001-engine: OK: all 20 CA-IDs`, `002-agents: OK: all 17
  CA-IDs`, 37/37 combined). Follow-up docs commit closed BUG-007 in `docs/bugs.md`, recorded
  both real SHAs in `specs/001-engine/traceability.md`'s CA-M-12 (amended) row, cleared the
  `⚠️ amended, pending T-058/T-059` marker to `✅ ready` in `spec.md`'s Functional Requirements
  table, and checked off T-058/T-059 in `tasks.md` — all four edits grouped in one commit per
  `CLAUDE.md`'s rule for process-artifact corrections outside the task cycle. **`001-engine` is
  closed again; `003-interface`'s CA-I-04 dependency is unblocked.**
- 2026-07-27: `/speckit-plan` run for `003-interface`. Generated `plan.md`, `research.md`
  (decisions D-I-01 through D-I-08), `data-model.md`, `contracts/app-state-api.md`,
  `contracts/dom-contract.md`, `quickstart.md`, `manual-verification.md`, and the
  `traceability.md` skeleton (34 rows: 32 `CA-I-nn` + `CA-N-02`/`CA-N-03`, no SHAs invented).
  Key decisions: the UI layer is split into `src/ui/{app-state,render,events}.js` (bootstrapped
  by `src/ui.js`) for Single Responsibility, consuming only the published engine/agents
  contracts for Dependency Inversion — Liskov Substitution and Interface Segregation recorded as
  not applicable, since no class hierarchy exists in this codebase; mobile-first CSS with one
  `min-width: 768px` breakpoint (D10) and a square board via `aspect-ratio`; a single
  `vitest.config.js` with UI test files opting into a `jsdom` environment via a per-file
  `// @vitest-environment jsdom` pragma, keeping `001-engine`/`002-agents` on the `node`
  environment; and, per explicit group instruction, no Playwright/browser-mode dependency for
  the 6 criteria jsdom cannot fully verify (CA-I-17 partially, CA-I-28–CA-I-32) — instead a
  structural/behavioral automated proxy plus an authoritative manual verification procedure
  (`manual-verification.md`), with limitations disclosed the same way `001-engine`'s CA-M-17
  note discloses its own test-strategy gap. **`jsdom` as a devDependency is recorded as a
  documented exception to constitution P1** in `plan.md`'s Complexity Tracking section (P1 is
  not one of the four absolute non-negotiables, so a documented exception is permitted there,
  per P1's explicit-approval clause and Governance § Exceptions) — corrected into that section
  in a same-day follow-up commit after first being justified only in `research.md`, per explicit
  review request. Also corrected two stale `spec.md` status markers left over from before
  BUG-007 closed (CA-I-04's row, the Assumptions note). **003-interface spec and plan are both
  complete. Next step: `/speckit-tasks` for `003-interface`.**
