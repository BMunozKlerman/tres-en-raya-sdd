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
- [x] `specs/003-interface/tasks.md` — generated (`/speckit-tasks`, 2026-07-27): originally 40
      tasks, `T-060`–`T-099`, numbering continuing the global sequence right after `001-engine`'s
      `T-059` (no dedicated feature branch; confirmed with the user, since no `T-060` existed
      anywhere in the repo). Full coverage of all 34 criteria (32 `CA-I-nn` + `CA-N-02`/
      `CA-N-03`), RED before GREEN throughout, grouped by `contracts/app-state-api.md`'s function
      boundaries (e.g. `startGame` → CA-I-01/02/24 in one pair) per the same grouping principle
      `001-engine`/`002-agents` used. Self-review split the original single responsive-CSS pair
      into `T-091`/`T-092` (CA-I-28/29, page layout) and `T-093`/`T-094` (CA-I-30/31/32,
      component-level), mirroring `002-agents`'s `T-047`/`T-048` split, before the file was
      finalized.
- [x] `/speckit-analyze` run for `003-interface` (2026-07-27, commit `bd0bc71`): no CRITICAL/HIGH
      findings (full coverage, no GREEN before RED, no invented SHAs, no `NEEDS CLARIFICATION`
      remaining, no P4-prohibited words inside any `CA-I-nn`'s EARS text, no constitution
      conflict). Three MEDIUM/LOW findings resolved directly as documented corrections (same
      review, one commit, per `CLAUDE.md`'s rule for analyze-driven artifact fixes): (1) CA-I-05's
      `ErrorResult.reason` enumeration in `spec.md` was missing `'game_over'`, the sixth reason
      `specs/001-engine/contracts/engine-api.md` defines — added, and `T-063`/`T-064` extended to
      test it; (2) `data-model.md`'s `AppState.pendingAgentMove` field/entity was dead — no
      contract function in `app-state-api.md` ever read or wrote it, superseded by `research.md`
      D-I-05's actual `setTimeout`-closure mechanism — removed from both files; (3) CA-I-09's
      original `T-079`/`T-080` pair only proved `render.js` reads a hand-built `Decision`, never
      that `events.js`'s real `agentMemory` threading across two consecutive games produces a
      genuine `resolvedFromMemory: true` — a new `T-081`/`T-082` pair was inserted to test that
      integration, with an explicit fallback to a documented `traceability.md` limitation if it
      proves infeasible in jsdom. Every task from the original `T-081` onward renumbered +2
      (**40 → 42 tasks, `T-060`–`T-099` → `T-060`–`T-101`**), mirroring `002-agents`'s `T-047`/
      `T-048` split precedent. `manual-verification.md` also tightened: browser pinned to Chrome
      stable at 100% zoom (previously unpinned), and CA-I-17's subjective focus-visibility check
      replaced with WCAG 2.2 SC 2.4.11's citable 3:1 contrast threshold. `specs/003-interface/
      traceability.md`'s Task column updated to the new numbering for all 34 rows (SHA column
      still `—`, no SHAs invented). **003-interface spec, plan, tasks, and analyze are all
      complete. Not yet implemented.**
- [x] `003-interface` implementation started: `T-060`–`T-068` done and committed, one commit per
      task, RED before GREEN. `src/ui.js`, `src/ui/app-state.js`, `src/ui/render.js`,
      `src/ui/events.js` created and grown incrementally (configuration slice, turn indicator,
      illegal-move rejection including `game_over`, occupied-cell edge case, winning-line
      highlight + scoreboard win increment, draw indicator + scoreboard draw increment). `npm
      test` 75/75 green. Covers CA-I-01, CA-I-02, CA-I-03, CA-I-05, CA-I-11, CA-I-14, CA-I-15,
      CA-I-21, CA-I-24 (9/34). `npm run verify:traceability` correctly reports the remaining 23
      `003-interface` criteria as orphaned — expected, since their tasks (`T-069` onward) have not
      run yet. One deviation from `tasks.md`'s assumption, documented in `traceability.md`: T-067/
      T-068 (CA-I-11/CA-I-15) turned out to be a zero-code corollary — `applyPlayerMove`
      (T-064/T-066) already branches generically on any non-null `result` (mark or `'draw'`), so
      both draw-case tests passed on first run; T-068 recorded the corollary the same way
      `specs/002-agents/traceability.md` documents CA-A-14's.
- [x] `003-interface` implementation continued: `T-069`–`T-076` done and committed, one commit
      per task, RED before GREEN, `npm test` green throughout (85/85 at close). Covers CA-I-06,
      CA-I-07, CA-I-08, CA-I-12, CA-I-22, CA-I-25, CA-I-26, CA-I-27 (17/34 cumulative). T-069/T-070
      (CA-I-08, color-independent information) turned out to be a second zero-code corollary —
      T-064/T-066 already rendered every state it covers (turn, rejected move, winning line)
      through `textContent`/a `data-*`-driven child node — documented in `traceability.md`
      alongside the CA-I-11/CA-I-15 note, same convention. T-071/T-072 added
      `selectOwnMark(state, cell)` to `app-state.js` (toggle-to-cancel per D9) and `data-movable`/
      `data-selected`/`data-destination` rendering in `render.js`, driven from `legalMoves`
      (`specs/001-engine`); `events.js`'s board-cell click now branches on `phase === 'movement'`
      to call `selectOwnMark` instead of `applyPlayerMove`. T-073/T-074 wired a highlighted
      destination cell's click to `applyPlayerMove({type: 'move', from, to})`. T-075/T-076 added
      `requestAgentMove(state)` to `app-state.js` (sets `uiState: 'WAITING_FOR_AGENT'` only, no
      `chooseMove` call yet — that is `T-077`/`T-078`'s responsibility) and a
      `[data-waiting-indicator]` in `render.js`; `events.js` now calls `requestAgentMove`
      synchronously right after any human move whose resulting turn belongs to the configured
      agent, and the existing `uiState !== 'IN_GAME'` guard on the board's click handler already
      blocks input during `WAITING_FOR_AGENT` (CA-I-22), so no new ignore-logic was needed. No spec
      or process deviations beyond the CA-I-08 corollary noted above; no bugs found in this block.
      `npm run verify:traceability` correctly reports the remaining 16 `003-interface` criteria
      (CA-I-09, CA-I-10, CA-I-13, CA-I-16–CA-I-20, CA-I-23, CA-I-28–CA-I-32, CA-N-02, CA-N-03) as
      orphaned — expected, their tasks (`T-077` onward) have not run yet.
- [x] `003-interface` implementation continued: `T-077`–`T-084` done and committed, one commit
      per task, RED before GREEN throughout, `npm test` green at every GREEN commit (91/91 at
      close). Covers CA-I-09, CA-I-10, CA-I-13, CA-I-16, CA-I-23 (22/34 cumulative). `resolveAgentMove`
      (`app-state.js`) and the real `chooseMove` call plus a 300ms `setTimeout` floor
      (`events.js`) close the waiting-state timing; `[data-memory-indicator]` (`render.js`) closes
      the memory-reuse indicator, including a real cross-game integration test; `restart`
      (`app-state.js`) and `[data-restart-button]` close the session-scoreboard story. One
      documented deviation (T-081's real-integration test, `traceability.md`) — see Session Log.
      `npm run verify:traceability` reports the remaining 11 `003-interface` criteria (CA-I-17–
      CA-I-20, CA-I-28–CA-I-32, CA-N-02, CA-N-03) as orphaned — expected, their tasks (`T-085`
      onward) have not run yet.
- [x] `003-interface` implementation continued: `T-085`–`T-092` done and committed, one commit
      per task, RED before GREEN throughout, `npm test` green at every GREEN commit (103/103 at
      close). Covers CA-I-17, CA-I-18, CA-I-19, CA-I-20 (26/34 cumulative) — all of US-I-4
      (keyboard operation) is now closed. T-085/T-086 added capture-phase `focus`/`blur`
      listeners in `render.js` that toggle `data-focus-visible` on every interactive control
      (behavioral half only — rendered visibility remains a `manual-verification.md` concern per
      `research.md` D-I-04). T-087/T-088 added a `keydown` listener on `[data-board]` in
      `events.js` mapping arrow keys to row/column-aware adjacent-cell `.focus()` calls, clamped
      at grid edges. T-089/T-090 added an explicit `keydown` handler for `Enter`/`Space` on
      `[data-cell]` that calls `cell.click()`, since jsdom's `<button>` does not natively
      dispatch `click` on keyboard activation the way a real browser does — the task's own
      documented contingency for this exact outcome. T-091/T-092 added `[data-live-region]`
      (`role="status"`, `aria-live="polite"`) to `render.js`'s base structure, with its
      `textContent` replaced (not appended) on every turn change and on reaching a result.
      **One test-fixture bug found and fixed within T-090's own commit** (not a separate BUG-NNN,
      since it never reached a GREEN commit uncorrected): T-089's original movement-phase fixture
      placed X at cells `{0,1,2}` — an accidental winning line — which caused the game to finish
      before reaching the movement phase once real win-detection ran, breaking the test for the
      wrong reason; corrected to a hand-verified non-winning fixture (X `{0,1,3}`, O `{2,4,5}`)
      before T-090's GREEN commit landed, same discipline as `001-engine`'s BUG-002 and
      `002-agents`'s BUG-005. No other spec or process deviations; no bugs found in this block.
      `npm run verify:traceability` reports the remaining 8 `003-interface` criteria (CA-I-28–
      CA-I-32, CA-N-02, CA-N-03) as orphaned — expected, their tasks (`T-093` onward, Phases 6–7,
      responsive CSS and non-functional confirmation) have not run yet.
- [x] `003-interface` implementation continued: `T-093`–`T-098` done and committed, one commit per
      task, RED before GREEN throughout, `npm test` green at every GREEN commit (112/112 at close).
      Covers CA-I-28, CA-I-29, CA-I-30, CA-I-31, CA-I-32, CA-N-02 (32/34 cumulative) — closes all
      of Phase 6 (Responsive Design) and CA-N-02 of Phase 7. `src/styles.css` authored mobile-first
      (base rules single-column and fluid; one `@media (min-width: 768px)` block for the wider
      layout; `.board` gets `aspect-ratio: 1/1`; `button`/`select`/`.cell` get a 44×44px minimum).
      CA-N-02 was a zero-code corollary (every action already had a `click`/`change` path). See
      Session Log for full detail, including the structural CSS classes added to `render.js` to
      give the stylesheet real selectors to target. `npm run verify:traceability` reports only
      `CA-N-03` (T-099/T-100) as orphaned. **Manual verification per `manual-verification.md` is
      still pending** — not yet run in this session.
- [x] `003-interface` manual play-testing surfaced four gaps, closed as `T-099`–`T-106`, one
      commit per task, RED before GREEN throughout, `npm test` green at every GREEN commit
      (118/118 at close). **BUG-008** (spec gap): occupied cells never rendered their mark's
      symbol — new **CA-I-33**, closed by T-099/T-100. **BUG-009** (contract non-compliance, no
      CA-ID): `render.js` collapsed `dom-contract.md`'s `data-cell-state` enum to just `"own"`,
      never `"opponent"` — fixed in its own commit, kept separate from CA-I-33's pair. **BUG-010**
      (spec gap): the scoreboard showed bare numbers with no label identifying X/O/draw — CA-I-14
      and CA-I-15 amended in place to require a label, closed by T-101/T-102. **BUG-011** (plan
      gap, no CA-ID): the live region duplicated `[data-result-indicator]`'s visible text — closed
      by a new `research.md` decision (D-I-09) and a `.sr-only` clip-based hide, T-103/T-104.
      **BUG-012** (spec gap): the turn indicator kept stating a pending turn after `FINISHED` — new
      **CA-I-34**, closed by T-105/T-106. All four logged in `docs/bugs.md`; `spec.md` grew to 34
      `CA-I-nn` criteria. `npm run verify:traceability` reported only `CA-N-03` as orphaned after
      this block.
- [x] Further manual play-testing (this session) surfaced two more gaps, closed as `T-107`–`T-110`,
      one commit per task, RED before GREEN throughout, `npm test` green at every GREEN commit
      (122/122 at close). **BUG-013** (spec gap): after `restart`, all three static configuration
      `<select>`s appeared blank — their real `<option>`s were intact, but `config` resets to
      `null` and selects the placeholder `<option value="">`, which never had a `textContent` (not
      introduced by restart — present since the very first page load). New **CA-I-35** requires
      each control's own identifying Spanish placeholder label ("Oponente…", "Ficha…",
      "Modalidad…", "Nivel…") instead of blank text; closed by T-107/T-108. **BUG-014** (spec gap):
      action controls (start, restart) stretched to the full width of their grid column at wide
      viewports (≥768px) — a `justify-items: stretch` default with no width constraint on the
      buttons — while `.board` stayed capped at `min(90vw, 480px)`. New **CA-I-36** (Design
      Decision D11) bounds every action control to 480px, the same cap `.board` already declares;
      closed by T-109/T-110 via a shared `.action-button` CSS class. Both logged in `docs/bugs.md`;
      `spec.md` grew to 36 `CA-I-nn` criteria (38 total with `CA-N-02`/`CA-N-03`). `tasks.md` grew
      to 54 tasks — CA-N-03 renumbered `T-111`/`T-112`, traceability closure renumbered `T-113`.
      Both since run (commits `d7f278f`/`0f9d583`/`3e4601e`) in a prior session not narrated here
      in full — `003-interface` was closed at 38/38 `CA-I-nn`+`CA-N-nn` criteria before being
      reopened again for BUG-015/016/017 below.
- [x] `traceability.md` with real SHAs up to date for `003-interface` — filled for all 38 rows
      during `T-113`, then extended with 3 more rows (CA-I-37/CA-I-38/CA-I-39) during `T-122`
      (see below). 41 rows total for `003-interface`, all with real SHAs.
- [ ] `manual-verification.md`'s procedure executed at least once (rendered-layout half of
      CA-I-28–CA-I-32 and CA-I-36, computed touch targets for CA-I-31, action-control width for
      CA-I-36, focus-contrast for CA-I-17) and logged in that file's Results Log.
- [ ] README cold-tested (fresh clone, 3 steps or fewer).
- [x] `003-interface` reopened a second time (BUG-015/016/017, this session) after further manual
      play-testing following `T-113`'s closure — see Session Log below. `npm test` 131/131 green;
      `npm run verify:traceability` reports 78/78 CA-IDs fully traced across all three features
      (20 + 17 + 41).
- [ ] **BUG-018 candidate, not yet diagnosed or confirmed**: coverage gap found while auditing for
      the same shared-fixture bias that caused BUG-017 — no test in `tests/interface/` ever
      asserts `dataset.cellState === 'opponent'` (every assertion checks `'empty'`, `'own'`, or
      `!== 'empty'`). `render.js`'s `mark === state.config.marks.player1 ? 'own' : 'opponent'`
      looks correct by inspection and the `'opponent'` value is already part of `dom-contract.md`
      (fixed under BUG-009), so this is a coverage hole, not a confirmed defect like BUG-017 — to
      be diagnosed and closed (or dismissed) in a future session.

**Next step**: diagnose and close (or dismiss) the BUG-018 candidate above; then
`manual-verification.md`'s procedure (now also covering CA-I-37/38/39's discoverability/focus
behavior alongside the six previously-deferred criteria) and a cold README test before
`003-interface` is reported fully complete.

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
  complete.**
- 2026-07-27: `/speckit-tasks` run for `003-interface` (commit `b80476a`). Generated `tasks.md`:
  40 tasks, `T-060`–`T-099`, numbering confirmed with the user to continue right after
  `001-engine`'s `T-059` (no `T-060` existed anywhere in the repo, despite the session opening
  with a different assumed starting number). Full coverage of all 34 criteria (32 `CA-I-nn` +
  `CA-N-02`/`CA-N-03`), RED before GREEN throughout. Tasks grouped by `contracts/
  app-state-api.md`'s declared "Covered criteria" per function (e.g. `startGame` → CA-I-01,
  CA-I-02, CA-I-24 in one pair; `selectOwnMark` → CA-I-07, CA-I-25, CA-I-27 in another) — the
  same one-function-one-layer grouping principle `001-engine`/`002-agents` used, extended here to
  a "vertical slice" pattern since this feature's criteria are only observable through the full
  `app-state.js` → `render.js` → `events.js` stack rather than one pure file. Each of the 6
  criteria not fully verifiable in jsdom (CA-I-17, CA-I-28–CA-I-32) explicitly states in its task
  description what the automated proxy proves and what `manual-verification.md` alone closes,
  per `research.md` D-I-04. Self-review pre-split the original single responsive-CSS pair into
  `T-091`/`T-092` (CA-I-28/29, page-layout fluidity and the mobile-first breakpoint) and
  `T-093`/`T-094` (CA-I-30/31/32, board squareness, touch targets, configuration overflow) before
  the file was finalized, mirroring `002-agents`'s `T-047`/`T-048` split after the equivalent
  `/speckit-analyze` finding. Self-check reported: 34/34 criteria covered, no task without a
  CA-ID except `T-060` (tooling/scaffold, same precedent as `001-engine`'s `T-001`/`T-002`), no
  GREEN ordered before its RED, and `T-062` (the first behavioral GREEN task, creating all three
  UI modules at once for the configuration slice) flagged as a deliberately accepted
  larger-than-usual commit rather than split further, since splitting it would leave two of the
  three resulting commits unable to pass any test on their own. `specs/003-interface/
  traceability.md`'s Task column filled in for all 34 rows (SHA column left as `—`, no SHAs
  invented). **003-interface has spec, plan, and tasks all complete. Next step:
  `/speckit-analyze` for `003-interface`.**
- 2026-07-27: `/speckit-analyze` run for `003-interface` (read-only pass over spec/plan/tasks/
  traceability/contracts/constitution, cross-checked against `specs/001-engine` and
  `specs/002-agents`'s published contracts the way the audit that opened BUG-007 did). No
  CRITICAL or HIGH findings: 34/34 criteria covered, no task declaring a missing or nonexistent
  `CA-ID`, no GREEN preceding its RED, every planned `describe` carries its `CA-ID` literally, no
  SHA invented in `traceability.md`, no `NEEDS CLARIFICATION` remaining, no P4-prohibited word
  inside any `CA-I-nn`'s EARS text, no conflict against the constitution (the one P1 exception —
  `jsdom` — remains properly documented per Governance § Exceptions). Three MEDIUM/LOW findings,
  resolved as artifact corrections in the same commit (`bd0bc71`), per `CLAUDE.md`'s rule for
  analyze-driven fixes outside the task cycle: (1) CA-I-05's `spec.md` Notes enumerated
  `ErrorResult.reason` without `'game_over'`, the sixth value `specs/001-engine/contracts/
  engine-api.md` actually defines — the same class of gap that opened BUG-007, though here the
  engine already exposed the data and only the interface spec's transcription was incomplete;
  fixed in `spec.md` and `tasks.md`'s `T-063`/`T-064`. (2) `data-model.md`'s
  `AppState.pendingAgentMove` field and its `PendingAgentMove` entity were documented but never
  read or written by any of `app-state-api.md`'s seven exported functions — dead since
  `research.md` D-I-05 resolved the 300ms floor via an `events.js`-owned `setTimeout` closure
  instead; removed from both files. (3) CA-I-09's original `T-079`/`T-080` pair called
  `resolveAgentMove` with a hand-built `Decision`, proving only that `render.js` reads
  `resolvedFromMemory` correctly — it never exercised `events.js`'s real `chooseMove` call or
  `restart`'s `agentMemory` carryover across two actual games, so it could not show genuine
  cross-game memory reuse the way `SC-I-09` claims. A new pair, `T-081`/`T-082`, was inserted
  right after the original pair to close that gap (reusing `specs/002-agents`'s CA-A-10 cache-hit
  fixture strategy, routed through the real UI pipeline instead of calling `chooseMove` directly),
  with an explicit fallback in `T-082`'s description to a documented `traceability.md` limitation
  — following the CA-M-17/CA-I-28–32 disclosure pattern — if the integration turns out infeasible
  to drive deterministically in jsdom. Every task from the original `T-081` onward renumbered +2,
  mirroring `002-agents`'s `T-047`/`T-048` mid-sequence split: **40 → 42 tasks, `T-060`–`T-099` →
  `T-060`–`T-101`**. Two smaller findings closed the same way: `SC-I-10` and the CA-I-18
  Assumptions sentence reworded to drop "fast"/"reasonable" (outside any `CA-I-nn`'s EARS text, so
  not a P4 violation, but unnecessary vagueness); `manual-verification.md` pinned to Chrome stable
  at 100% zoom and given a citable WCAG 2.2 SC 2.4.11 (3:1 contrast) threshold for CA-I-17 in
  place of an untestable "visibly perceivable" judgment call. All six touched files
  (`spec.md`, `data-model.md`, `contracts/app-state-api.md`, `tasks.md`, `traceability.md`,
  `manual-verification.md`) committed together as `bd0bc71`, identifying this analysis pass as
  required by `CLAUDE.md`'s rule for grouping process-artifact corrections. **003-interface spec,
  plan, tasks, and analyze are all complete. Next step: `/speckit-implement T-060`.**
- 2026-07-27: `/speckit-implement` run for `003-interface`, `T-060`–`T-068`, one commit per task,
  RED before GREEN, `npm test` green throughout (75/75 at close). `jsdom` installed as a
  devDependency (commit `958126e`, T-060 — no test, tooling/scaffold precedent); `index.html`,
  `src/ui.js` stub, `src/styles.css` reset, `tests/interface/` created. `src/ui/app-state.js`,
  `src/ui/render.js`, `src/ui/events.js` created at T-062 and grown incrementally: configuration
  controls/start transition/config lockout (T-061/T-062, CA-I-01/CA-I-02/CA-I-24); turn indicator,
  illegal-move rejection over the engine's full `ErrorResult.reason` enumeration including
  `game_over`, occupied-cell edge case (T-063/T-064, CA-I-03/CA-I-05/CA-I-21); winning-line
  highlight, move-blocking, scoreboard win increment (T-065/T-066, CA-I-04/CA-I-14, hand-verified
  top-row fixture); draw indicator, move-blocking, scoreboard draw increment (T-067/T-068,
  CA-I-11/CA-I-15, hand-verified 9-move no-winner fixture). **Deviation from `tasks.md`'s
  assumption, documented in `specs/003-interface/traceability.md`**: T-067/T-068 turned out to be
  a zero-code corollary of T-064/T-066 — `applyPlayerMove` was implemented to branch generically
  on any truthy `result` (mark or `'draw'`) rather than the mark-only branch `tasks.md` described,
  so both `CA-I-11`/`CA-I-15` tests passed on first run; `T-068`'s commit records this the same
  way `specs/002-agents/traceability.md` documents `CA-A-14`'s corollary. `npm run
  verify:traceability` correctly reports the remaining 23 `003-interface` criteria as orphaned
  (their tasks, `T-069` onward, have not run yet) — `001-engine`/`002-agents` still fully traced.
  Stopped at `T-068` per explicit instruction (one task beyond the requested `T-067`, to close the
  RED/GREEN pair rather than leave `CA-I-11`/`CA-I-15` mid-pair). **Next step:
  `/speckit-implement T-069`.**
- 2026-07-27: `003-interface` implementation continued through `T-069`–`T-076` (configuration
  detail already summarized in Current Status above), then `T-077`–`T-084`, one commit per task,
  RED before GREEN throughout, `npm test` green at every GREEN commit (91/91 at close). Covers
  CA-I-09, CA-I-10, CA-I-13, CA-I-16, CA-I-23 for this last block (22/34 cumulative for
  `003-interface`). T-077/T-078 added `resolveAgentMove(state, decision)` to `app-state.js` and,
  in `events.js`'s `maybeHandOffToAgent`, the real `chooseMove` call plus a
  `setTimeout(..., 300)` floor (`research.md` D-I-05) so `WAITING_FOR_AGENT → IN_GAME` cannot fire
  before 300ms elapse — tested with `vi.useFakeTimers()`, advancing to 299ms (still waiting) and
  300ms (resolved) in separate cases. T-079/T-080 added `[data-memory-indicator]` to `render.js`,
  read from `lastDecision.resolvedFromMemory`, verified with a direct `resolveAgentMove` call
  against a hand-built `Decision` (proving `render.js` alone). T-081/T-082 (the
  `/speckit-analyze`-added real-integration pair) passed on first run — a third zero-code
  corollary, same pattern as CA-I-08/CA-I-11/CA-I-15 — since T-078/T-080 already implement
  everything the integration needs. **One deviation from `tasks.md`'s literal text, documented in
  `specs/003-interface/traceability.md`**: T-081's description says to reach the second game via
  `[data-restart-button]`, but `restart` is Phase 4 (T-083/T-084), strictly after this pair per
  `tasks.md`'s own Phase gate table, so that control did not exist yet when T-081 ran. Rather than
  fabricate a `Decision` (explicitly ruled out by the analysis that created T-081/T-082) or
  implement `restart` early without its own preceding RED (would violate P5), the test seeds the
  second game's initial `AppState` directly with the first game's real `agentMemory`/`scoreboard`
  — exactly the transformation `contracts/app-state-api.md` documents `restart` performing — then
  drives that second game through the same real `events.js`/`render.js` pipeline as the first
  (both games mounted via a small in-test harness reusing the real `render`/`attachEvents`, not a
  mock). `restart`'s own button mechanics remain fully covered by T-083/T-084 as planned. No
  `traceability.md` "Test-strategy limitations" entry was needed — the integration is fully
  exercised, not partially; the CA-I-09 contingency for an infeasible-in-jsdom fallback (which the
  user pre-authorized) was not triggered, since the blocker was task ordering, not jsdom. T-083/
  T-084 added `restart(state)` to `app-state.js` (fresh `createAppState()` except
  `scoreboard`/`agentMemory` carried over, per its contract), a `[data-restart-button]` in
  `render.js`'s base structure, and its `click` wiring in `events.js`. No other spec or process
  deviations; no bugs found in this block. `npm run verify:traceability` correctly reports the
  remaining 11 `003-interface` criteria (CA-I-17–CA-I-20, CA-I-28–CA-I-32, CA-N-02, CA-N-03) as
  orphaned — expected, their tasks (`T-085` onward) have not run yet. Stopped at `T-084` per
  explicit instruction (the requested range `T-077`–`T-084`), landing exactly on a closed RED/
  GREEN pair. **Next step: `/speckit-implement T-085`.**
- 2026-07-27: `003-interface` implementation continued through `T-085`–`T-092`, one commit per
  task, RED before GREEN throughout, `npm test` green at every GREEN commit (103/103 at close).
  Covers CA-I-17, CA-I-18, CA-I-19, CA-I-20 (26/34 cumulative) — closes all of US-I-4. T-085/T-086
  (CA-I-17): capture-phase `focus`/`blur` listeners added once in `render.js`'s
  `attachFocusVisible`, attached to `root` (not per-control) so the dynamically-inserted
  `[data-config-agent-level]` control is covered without re-attaching listeners on every render;
  toggles `data-focus-visible` on every interactive control named in `dom-contract.md`. T-087/
  T-088 (CA-I-18): a `keydown` listener on `[data-board]` in `events.js` maps `ArrowUp`/
  `ArrowDown`/`ArrowLeft`/`ArrowRight` to the adjacent cell by row/column arithmetic, clamping at
  the grid edge (no criterion requires wrapping, per `spec.md`'s Assumptions) rather than
  wrapping. T-089/T-090 (CA-I-19): confirmed jsdom's native `<button>` does *not* dispatch `click`
  on `Enter`/`Space` the way a real browser does — `tasks.md`'s own documented uncertainty for
  this exact task resolved in favor of the explicit-handler branch: a `keydown` listener on
  `[data-board]` calls `cell.click()` for `Enter`/`Space`, reusing the existing `click` handler
  rather than duplicating its branching logic. **One test-fixture bug found and fixed within
  T-090's own commit, before it reached GREEN** (not logged as a separate `docs/bugs.md` entry,
  since — unlike `001-engine`'s BUG-002 and `002-agents`'s BUG-005, both caught only after landing
  in a prior GREEN commit — this one was caught and corrected before any commit shipped it):
  T-089's original movement-phase fixture placed X's three pieces at cells `{0,1,2}`, an
  accidental top-row winning line, so once T-090's real win-detection ran during GREEN, the game
  finished before ever reaching the movement phase and the test failed for the wrong reason.
  Corrected to a hand-verified non-winning fixture (X at `{0,1,3}`, O at `{2,4,5}`, verified
  against all 8 `WINNING_LINES` entries) as part of T-090's own commit. T-091/T-092 (CA-I-20):
  `[data-live-region]` (`role="status"`, `aria-live="polite"`) added to `render.js`'s base
  structure once, in `buildStructure`; its `textContent` is replaced (not appended) on every
  render describing the current turn or, once `FINISHED`, the result — no `.focus()` call
  anywhere in this path. Its own RED test initially asserted focus stayed on the just-played
  board cell after a win, which is not achievable: disabling a focused `<button>` (CA-I-04's
  block-further-moves rule) natively blurs it in both jsdom and real browsers — not a violation
  of CA-I-20, since the UI code itself never calls `.focus()`/`.blur()` for this. Rewritten to
  assert focus retention against `[data-restart-button]` instead, the one control
  `dom-contract.md` guarantees is never disabled. No other spec or process deviations; no bugs
  found in this block. `npm run verify:traceability` reports the remaining 8 `003-interface`
  criteria (CA-I-28–CA-I-32, CA-N-02, CA-N-03) as orphaned — expected, their tasks (`T-093`
  onward, Phases 6–7) have not run yet. Requested range was `T-085`–`T-091`; per instruction to
  finish a pair rather than stop mid-pair, execution continued one task further to `T-092` to
  close the CA-I-20 RED/GREEN pair T-091 opened. **Next step: `/speckit-implement T-093`.**
- 2026-07-27: `003-interface` implementation continued through `T-093`–`T-098`, one commit per
  task, RED before GREEN throughout, `npm test` green at every GREEN commit (112/112 at close).
  Covers CA-I-28, CA-I-29, CA-I-30, CA-I-31, CA-I-32, CA-N-02 (32/34 cumulative) — closes Phase 6
  (Responsive Design) entirely and CA-N-02 of Phase 7. `src/styles.css` authored mobile-first per
  `research.md` D-I-07: base (non-media-query) rules put `.app` in a single-column flex layout,
  `.board`/`.config-panel`/`.scoreboard` use only relative widths (`%`, `vw`, `min()`, `max-width`
  + `width: 100%`, never a fixed pixel value wider than 320px), and one `@media (min-width: 768px)`
  block (D10) switches `.app` to a two-column grid — no `max-width` query used anywhere. T-093/T-094
  (CA-I-28/29) also required first adding the `.app`/`.board`/`.config-panel`/`.scoreboard`
  structural classes and a `.cell` class to `src/ui/render.js`'s `buildStructure`/`renderScoreboard`
  (previously the DOM had no CSS hooks beyond `data-*` attributes), and moving the scoreboard's
  dynamically-created `[data-score]` spans into a dedicated `[data-scoreboard]` container so
  `.scoreboard` has a real element to style — a structural change, not a behavioral one; no test
  queries by class name, only by `data-*`, so nothing in the existing 103 tests needed touching.
  T-095/T-096 (CA-I-30/31/32) added `aspect-ratio: 1 / 1` plus a relative `width` to `.board`, and
  `min-width`/`min-height: 44px` to `button`, `select`, and `.cell` (three separate rules rather
  than one grouped selector list, since `tests/interface/responsive-static.test.js`'s regex-based
  CSS-source proxy resolves one selector at a time and does not parse comma-separated selector
  groups — noted here since it shaped the CSS's literal structure, not just its declared values).
  `.config-panel` already had no `overflow: hidden` + narrow-fixed-width combination from T-094, so
  CA-I-32 needed no further change beyond its own dedicated test. T-097/T-098 (CA-N-02) turned out
  to be a fourth zero-code corollary (same pattern as CA-I-08/CA-I-11/CA-I-15/CA-I-09's render
  half) — every action built across Phases 2–5 was already wired to `click`/`change`, never
  requiring a `keydown`, so `tests/interface/non-functional.test.js`'s full-game-via-mouse-only
  test (classic mode to a win and back through restart, plus continuous-mode movement-phase
  selection and destination clicks) passed on first run; documented in `traceability.md` alongside
  the other three corollary notes. No spec or process deviations; no bugs found in this block.
  `npm run verify:traceability` reports only `CA-N-03` as orphaned — expected, its task (`T-099`/
  `T-100`, the last of Phase 7) has not run yet. Requested range was exactly `T-093`–`T-098`, which
  landed precisely on a closed RED/GREEN pair (T-097/T-098), so no extension was needed.
  **Manual verification is now due**: `manual-verification.md`'s procedure closes the
  rendered-layout half of CA-I-28–CA-I-32 (structural CSS proxy only, per `research.md` D-I-04) —
  run `npm run dev`, open the result in Chrome stable at 100% zoom, and check each of the six
  widths (320×568, 375×667, 767×1024, 768×1024, 1024×768, 1440×900) against that file's checklist
  table (no horizontal scroll, square board, single-column below 768px / two-column at and above
  it, no clipped configuration controls), plus the separate 44×44px computed-touch-target check at
  320×568 and 1440×900 for CA-I-31 and the focus-visibility contrast check at 375×667 and 1440×900
  for CA-I-17 (deferred from `T-085`/`T-086`, since only the behavioral hook was closed there).
  Record every result in `manual-verification.md`'s own Results Log (append-only, one dated entry
  citing the commit SHA under test — do not overwrite prior entries). **Next step:
  `/speckit-implement T-099`, then the manual-verification run above before `003-interface` is
  reported complete.**
- 2026-07-27: Manual play-testing (not the automated suite) surfaced four gaps in a row, each
  closed spec-first per constitution P3/P7: reproduce as a failing test, diagnose against
  `spec.md`, correct the spec, regenerate code. **BUG-008**: occupied cells never displayed their
  mark's symbol — `renderBoard` only ever wrote the `'★'` win glyph into `textContent`, never the
  mark itself, for every other occupied cell. No `CA-I-nn` had ever required the board to visibly
  render its own contents (CA-I-03 covers the turn indicator, CA-I-04 only the three winning
  cells, CA-I-08 only requires information *already conveyed elsewhere* to also be non-color).
  New **CA-I-33** added; closed by T-099 (RED, `6c5c447`) / T-100 (GREEN, `41485ba`). **BUG-009**
  (found while diagnosing BUG-008, kept in its own commit): `render.js` collapsed
  `dom-contract.md`'s `data-cell-state` enum to just `"own"`, never `"opponent"` — a contract
  non-compliance, not a spec gap, so no CA-ID; fixed in commit `0df3cfa`. **BUG-010**: the
  scoreboard showed three bare numbers with no label identifying which count was X's, O's, or the
  draw's. CA-I-14/CA-I-15 amended in place to require an identifying label; closed by T-101 (RED,
  `6f5c800`) / T-102 (GREEN, `b468269`). **BUG-011**: `[data-result-indicator]` and
  `[data-live-region]` both displayed the same "Gana X"/"Empate" text simultaneously — a
  `research.md`-level gap (no decision had specified the live region's visual treatment), not a
  `spec.md` amendment, so no CA-ID; resolved by decision D-I-09 (`.sr-only` clip-based hiding) and
  closed by T-103 (RED, `1dc7f5a`) / T-104 (GREEN, `7665580`). **BUG-012**: the turn indicator kept
  stating "Turno de O" after the game reached `FINISHED`, simultaneously with the result shown
  elsewhere — CA-I-03 ("at all times") was never scoped for the terminal state. New **CA-I-34**
  added as a boundary clause (CA-I-03's own text untouched); closed by T-105 (RED, `8f529a7`) /
  T-106 (GREEN, `0c60a1c`). All four logged in `docs/bugs.md`; the BUG-010/011/012 trio closed
  together in one docs commit (`84da4c0`). `npm test` 118/118 green at close; `spec.md` now holds
  34 `CA-I-nn` criteria. `npm run verify:traceability` reports only `CA-N-03` as orphaned.
  **Manual verification (per `manual-verification.md`) remains not yet run.**
- 2026-07-27: User play-tested the app directly (not the automated suite) after a `restart` and
  found two more issues, diagnosed together in this session before any code was touched, per the
  same spec-first discipline. **Diagnosis first, then approval, then implementation** — the user
  explicitly asked for the classification (spec gap vs. contract non-compliance vs. implementation
  defect) before any file was edited. **BUG-013**: all three static configuration `<select>`s
  rendered blank after `restart` — confirmed by manual play that their real `<option>`s
  (`human`/`agent`, `X`/`O`, `classic`/`continuous`) were intact when the dropdown was opened, so
  this was never a lost-options defect. Root cause: `restart` resets `config` to `null` in every
  field, selecting each `<select>`'s placeholder `<option value="">`, which never had a
  `textContent` — present since the very first page load, not introduced by `restart`. CA-I-01
  only requires controls to be displayed and selectable, which the blank placeholder still
  satisfied; no criterion ever specified the "no selection" state's own appearance. New **CA-I-35**
  added, with per-control Spanish labels carrying ellipses ("Oponente…", "Ficha…", "Modalidad…",
  "Nivel…" — chosen over a single generic placeholder repeated three times, and over labels without
  ellipsis, since "Oponente" alone would read as a selected value rather than an unselected state);
  closed by T-107 (RED, `881c9de`) / T-108 (GREEN, `1ec5c86`). **BUG-014**: the restart button
  rendered at the full width of its grid column at wide viewports while the board occupied roughly
  a third of it — `.app`'s `@media (min-width: 768px)` grid defaults to `justify-items: stretch`,
  and no button ever declared a width constraint, while `.board` stayed capped at
  `min(90vw, 480px)`. User explicitly asked that this be governed by a criterion (not a manual CSS
  edit in the README's exception table), reasoning that layout is exactly what `jsdom` cannot
  verify, so it is the last place to leave undocumented CSS. New **CA-I-36** added (Design
  Decision D11: reuse `.board`'s own 480px cap rather than invent a second threshold), verified by
  a static-CSS-source proxy on a new shared `.action-button` class, with the rendered-width claim
  deferred to `manual-verification.md` (extended with a seventh not-fully-jsdom-verifiable
  criterion, its own checklist row at 768×1024/1024×768/1440×900, and a `CA-I-36` column in the
  Results Log table); closed by T-109 (RED, `ad5965e`) / T-110 (GREEN, `b59fa9e`). Docs (`spec.md`,
  `tasks.md`, `traceability.md`, `docs/bugs.md`, `contracts/dom-contract.md`,
  `manual-verification.md`) committed together first (`e158931`), per the same discipline the
  BUG-008 block used, before either RED/GREEN pair. `tasks.md` grew to 54 tasks: `CA-N-03`
  renumbered `T-111`/`T-112` (placed after this new Phase 7.7, same reasoning `002-agents`'s
  T-047/T-048 split and this spec's own BUG-008/010/011/012 insertions used — the keyboard-only
  playthrough should exercise the corrected controls, not stale ones), traceability closure
  renumbered `T-113`. `npm test` 122/122 green at close; `spec.md` now holds 36 `CA-I-nn` criteria
  (38 total with `CA-N-02`/`CA-N-03`). `npm run verify:traceability` reports only `CA-N-03` as
  orphaned — expected, `T-111`/`T-112` have not run yet. **Next step: `/speckit-implement T-111`,
  then `T-113`, then the `manual-verification.md` run (now covering seven criteria) before
  `003-interface` is reported complete.**
- 2026-07-27: Further manual play-testing after `003-interface`'s `T-113` closure surfaced three
  more gaps, diagnosed together before any code changed, per the same spec-first discipline as
  BUG-008–BUG-014. **BUG-015** (spec gap): every configuration `<select>`'s populated options
  (`human`/`agent`, `classic`/`continuous`, and the three agent levels) rendered their literal
  English identifier as visible text — `CLAUDE.md`'s Spanish game-UI convention had only ever
  been acknowledged as a descriptive `spec.md` Assumptions note, never translated into a testable
  criterion. New **CA-I-37** requires Spanish option text per an explicit mapping (`human`→
  "Humano", `agent`→"Agente", `classic`→"Clásica", `continuous`→"Continua", `simple`→"Simple",
  `medium`→"Medio", `complex`→"Complejo"; `value`s unchanged, marks `X`/`O` not translated);
  closed by T-114 (RED, `b3e5799`) / T-115 (GREEN, `82725d8`). **BUG-016** (spec gap): keyboard
  navigation works once a cell already has focus (Tab reaches it, arrows move the selection), but
  nothing tells a player this is how the board is operated, and nothing places focus on the board
  automatically after starting a game. Two new criteria, kept separate so each is independently
  testable: **CA-I-38** (a static visible instruction naming the arrow-key/Enter/Space
  interaction), closed by T-116 (RED, `9705534`) / T-117 (GREEN, `dc729b5`); and **CA-I-39**
  (keyboard focus moves to `[data-cell="0"]`, with an identifying `aria-label`, on the
  `CONFIGURATION → IN_GAME` transition only — not on any later render), closed by T-118 (RED,
  `1b3e28c`) / T-119 (GREEN, `205d458`). **BUG-017** (implementation defect, no new CA-ID): `CA-I-12`
  already required the `WAITING_FOR_AGENT` transition "when it becomes the agent's turn," with no
  condition on a prior human move — but `events.js`'s `maybeHandOffToAgent()` was only ever
  invoked from the board's `click` listener, never from `[data-start-button]`'s, so choosing mark
  `O` against an agent (agent = `X`, agent opens) left the board waiting indefinitely. Root cause
  of the miss: every existing fixture in `us-i2-waiting-state.test.js` hardcoded
  `marks.player1: 'X'` and always triggered a human `click` first, so the "agent opens" branch of
  an already-correct criterion was never exercised — `CA-ID` coverage counting cannot detect an
  unexercised branch of a criterion that has at least one passing test. Closed by T-120 (RED,
  `2953129`) / T-121 (GREEN, `4f347cc`) — `events.js`'s `[data-start-button]` handler now calls
  `maybeHandOffToAgent()` (plus the `rerender()` its synchronous `WAITING_FOR_AGENT` `setState`
  needs) right after the transition. All three logged in `docs/bugs.md`; `spec.md`,
  `contracts/dom-contract.md`, and `tasks.md`/`traceability.md` updated together in one docs
  commit (`81de691`) before any RED/GREEN pair, per `CLAUDE.md`'s rule for same-review artifact
  corrections. `T-122` (commit `ae9023a`) recorded the three new rows' real SHAs in
  `traceability.md`. `npm test` 131/131 green at close; `npm run verify:traceability` exits 0 for
  all three features (78/78 CA-IDs: 20 + 17 + 41). As explicitly requested, the fixture-bias audit
  that closed BUG-017 was extended to the rest of `003-interface`'s test suite before closing this
  block: it surfaced one more candidate of the same shared-assumption class — no test anywhere in
  `tests/interface/` asserts `dataset.cellState === 'opponent'` (every assertion checks
  `'empty'`, `'own'`, or `!== 'empty'`), even though `render.js`'s `mark === config.marks.player1
  ? 'own' : 'opponent'` branch looks correct by inspection and `'opponent'` is already part of
  `dom-contract.md` (fixed under BUG-009). Logged as **BUG-018 — coverage gap, not a confirmed
  defect** (unlike BUG-017, no incorrect behavior has been observed, only an untested branch);
  left undiagnosed and unclosed per explicit instruction, for a future session. **Next step**:
  diagnose and close (or dismiss) BUG-018, then run `manual-verification.md`'s procedure (now
  also covering CA-I-38/CA-I-39's discoverability/focus behavior) and a cold README test before
  `003-interface` is reported fully complete.
