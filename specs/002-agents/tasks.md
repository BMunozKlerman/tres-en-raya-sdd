# Tasks: Game Agents

**Feature**: `002-agents` | **Date**: 2026-07-27
**Input**: `specs/002-agents/plan.md`, `spec.md`, `data-model.md`, `contracts/agents-api.md`

**Method**: TDD — every criterion has one RED commit (failing test) that precedes its GREEN
commit (minimum implementation). The full suite must be green on every GREEN commit before it
is pushed. Numbering continues from `001-engine`'s `T-033` (single linear commit history on
`main`, no dedicated feature branch — see `CLAUDE.md` session log, 2026-07-27); the first task
here is `T-034`.

**Total tasks**: 24 (T-034 to T-057)

**Setup**: Not needed. Per `plan.md § Technical Context`, no new dependency, no new npm script,
and `vitest.config.js`'s existing glob (`tests/**/*.test.js`) already matches `tests/agents/**`.
The only prerequisite is `001-engine` being closed (T-033, commit `2ef54af`), which it is.

**Grouping principle** (same standard as `001-engine`'s D9): one RED/GREEN pair per criterion or
per homogeneous group (same function, same code layer, same dispatch order). The three
per-level legality criteria (CA-A-01 simple, CA-A-03 medium, CA-A-07 complex) are always in
separate pairs — this was the explicit reason `spec.md`'s clarification split them out of one
shared ID (BUG-001's false-positive pattern). Within a level, a criterion is grouped with
another only when they are trivial corollaries of the *same* minimal implementation and there is
no code path that could make one pass while the other fails.

**Documented exception — corollary criteria** (analogous to `001-engine`'s D3 sub-test in
T-023/T-024, where the just-vacated-cell case "required no special-casing" and was verified in
the same commit as the feature that already covered it without extra code): several `002-agents`
criteria are structural consequences of a level's algorithm choice rather than incremental
features —
- **Memory independence** (CA-A-02 simple, CA-A-06 medium) follows directly from the chosen
  technique never reading the `memory` parameter at all (D-R-01/D-R-03, `research.md`); there is
  no code path where legality could hold and memory-independence could fail.
- **Determinism** (CA-A-11 medium, CA-A-12 complex) follows directly from the chosen techniques
  containing no call to `Math.random` or any other non-deterministic source (D-R-03, D-R-04);
  medium and complex are deterministic from the first line of code that dispatches to them.
- **Single-legal-move edge case** (CA-A-14, all three levels) is a strict logical consequence of
  CA-A-01 + CA-A-03 + CA-A-07: if `legalMoves(state)` has exactly one element, "a move contained
  in `legalMoves(state)`" can only be that element.

For these, the criterion is bundled into the RED/GREEN pair of the implementation step that
establishes it — RED genuinely fails because the dispatch branch for that level does not exist
yet, and the single GREEN commit that adds the branch satisfies every bundled criterion at once.
This keeps every criterion individually traceable (its own `describe`, its own CA-ID in the
commit message) without manufacturing a RED that could never actually fail.

**Post-`/speckit-analyze` correction (2026-07-27)**: the original T-047 bundled a genuinely new
code layer (static evaluation + horizon cutoff for CA-A-09) with an open-ended, iterative
measurement procedure (the `HORIZON_DEPTH` calibration loop). `/speckit-analyze` flagged this as
the task most likely to exceed a single commit. It is now split into T-047 (implementation only,
`HORIZON_DEPTH` left at its starting value) and T-048 (calibration), and every task after it is
renumbered by one. This also motivated the constitution amendment to 2.0.0 (see
`.specify/memory/constitution.md § Amendment History`): the analysis found P2's ratified
`chooseMove` contract still describing the pre-D7 shape while `plan.md`/`contracts/agents-api.md`
already implemented the wider one.

---

## Phase 1: US-A-1 — Simple Level (Priority: P1)

**Goal**: `src/agents.js` created; `chooseMove` dispatches to a uniform-random pick for
`level === 'simple'`.

**Prerequisite**: None (first task of the feature).

### Simple: legality and memory independence (CA-A-01, CA-A-02)

_Grouped: both are properties of the exact same implementation (uniform random pick over
`legalMoves(state)`, `memory` never read) — see "Documented exception" above. `options.random`
is introduced here as the test-determinism seam (D-R-01/02, `data-model.md`)._

- [ ] T-034 [US-A-1] [AC: CA-A-01, CA-A-02] RED — Create `tests/agents/us-a1-legality.test.js`
  with `describe('CA-A-01 — simple: legal move in every mode × phase', () => { it.each([
  ['classic', 'placement'], ['continuous', 'placement'], ['continuous', 'movement'],
  ])(...)})`: for each combo, build a non-terminal state in that mode/phase (reuse
  `createGame`/`applyMove` from `specs/001-engine`), call
  `chooseMove(state, 'simple', null)`, assert `decision.move` is one of `legalMoves(state)`.
  Create `tests/agents/us-a1-simple.test.js` with
  `describe('CA-A-02 — simple: move independent of memory', ...)`: call `chooseMove(state,
  'simple', memoryA, {random: () => 0})` and `chooseMove(state, 'simple', memoryB, {random: () =>
  0})` with `memoryA !== memoryB` (e.g. `null` vs `{stale: true}`) on the same state; assert both
  return the same `move`. Both files fail because `src/agents.js` does not exist yet. Expected
  commit: `test(CA-A-01,CA-A-02): failing tests — simple legality and memory independence`

- [ ] T-035 [US-A-1] [AC: CA-A-01, CA-A-02] GREEN — Create `src/agents.js`; import
  `legalMoves` from `./engine.js` (P2: agents depend on the engine only). Export `chooseMove(state,
  level, memory, options = {})`: for `level === 'simple'`, `const moves = legalMoves(state)`,
  `const random = options.random ?? Math.random`, `const move = moves[Math.floor(random() *
  moves.length)]`, return `{move, memory, nodesEvaluated: moves.length, resolvedFromMemory:
  false}`. This is the first commit to materialize the D7 `Decision` shape
  (`{move, memory, nodesEvaluated, resolvedFromMemory}`, constitution P2 as amended to 2.0.0) —
  every level's dispatch branch returns this same shape from here on. `npm test` must be fully
  green. Expected commit: `T-035: chooseMove simple level — uniform random pick (CA-A-01,
  CA-A-02, D7)`

---

## Phase 2: US-A-1 — Medium Level (Priority: P1)

**Goal**: `chooseMove` dispatches to the win-this-turn / block-next-turn / fallback rule for
`level === 'medium'`, fully deterministic and memoryless.

**Prerequisite**: T-035 GREEN complete.

### Medium: legality, memory independence, determinism (CA-A-03, CA-A-06, CA-A-11)

_Grouped: all three are properties of the same minimal stub (first legal move, `memory` always
`null`) — see "Documented exception" above. CA-A-11 lives in `us-a2-determinism.test.js` per
`plan.md`'s file layout even though it is established here; grouping the RED/GREEN pair does not
require grouping the test file._

- [ ] T-036 [US-A-1] [AC: CA-A-03, CA-A-06, CA-A-11] RED — Add to
  `tests/agents/us-a1-legality.test.js`: `describe('CA-A-03 — medium: legal move in every mode ×
  phase', ...)`, same `it.each` mode/phase matrix as CA-A-01, calling `chooseMove(state,
  'medium', null)`. Add to `tests/agents/us-a1-medium.test.js` (new file):
  `describe('CA-A-06 — medium: move independent of prior-game memory', ...)`: call `chooseMove`
  on `createGame('classic')`'s initial state once with a non-empty carried-over memory value and
  once with `null`; assert the same `move`. Create `tests/agents/us-a2-determinism.test.js` (new
  file) with `describe('CA-A-11 — medium: repeats its own decision', ...)`: call `chooseMove`
  twice with the same state and the same memory; assert the same `move`. All three fail because
  `chooseMove` has no `'medium'` branch yet. Expected commit: `test(CA-A-03,CA-A-06,CA-A-11):
  failing tests — medium legality, memory independence, determinism`

- [ ] T-037 [US-A-1] [AC: CA-A-03, CA-A-06, CA-A-11] GREEN — In `src/agents.js`, add a
  `level === 'medium'` branch: `const moves = legalMoves(state); const move = moves[0]; return
  {move, memory: null, nodesEvaluated: moves.length, resolvedFromMemory: false}`. This
  establishes the medium level's own instance of the D7 `Decision` shape (always
  `resolvedFromMemory: false`, since the medium level is memoryless by design — CA-A-06, option
  C). `npm test` must be fully green. Expected commit: `T-037: chooseMove medium level — base
  dispatch, always memoryless (CA-A-03, CA-A-06, CA-A-11, D7)`

### Medium: win-this-turn (CA-A-04)

_Own pair: a genuinely new code layer, inserted before the fallback._

- [ ] T-038 [US-A-1] [AC: CA-A-04] RED — Add to `tests/agents/us-a1-medium.test.js`:
  `describe('CA-A-04 — medium: wins this turn when possible', ...)`: build a state where exactly
  one legal move sets `result` to the current player's mark (e.g. classic, X at [0,1], turn X,
  empty cell 2 completes `[0,1,2]`); call `chooseMove(state, 'medium', null)`; assert
  `decision.move` is that winning move (verify by applying it via `applyMove` and checking
  `result === state.turn`). Fails because the medium branch always returns `moves[0]` regardless
  of a winning option. Expected commit: `test(CA-A-04): failing test — medium wins this turn`

- [ ] T-039 [US-A-1] [AC: CA-A-04] GREEN — In `src/agents.js`, in the `'medium'` branch, before
  the fallback: for each move in `moves`, apply it via `applyMove(state, move)` (scratch, no
  mutation per P2) and check `result === state.turn`; if found, return that move (counting each
  scratch `applyMove` call into `nodesEvaluated`). `npm test` must be fully green. Expected
  commit: `T-039: medium win-this-turn detection (CA-A-04)`

### Medium: block-next-turn and its consequences (CA-A-05, CA-A-15, CA-A-16)

_Grouped: block-next-turn is one code layer (inserted between the win-check and the fallback);
CA-A-15 (win preferred over block) is the ordering consequence of block running *after* the
win-check already added in T-039 — same pattern as `001-engine`'s CA-M-13/CA-M-14 (draw
detection ordered after the winner scan, in the same commit); CA-A-16 (blocks one of two
threats) is the same block-check exercised on a fixture with two threats instead of one, no
additional code._

- [ ] T-040 [US-A-1] [AC: CA-A-05, CA-A-15, CA-A-16] RED — Add to
  `tests/agents/us-a1-medium.test.js`: `describe('CA-A-05 — medium: blocks a single next-turn
  threat', ...)`: build a state with no immediate win for the current player but exactly one
  legal opponent move that would win next turn; call `chooseMove`; assert the returned move,
  once applied by the opponent's actual next move via `legalMoves`, leaves no opponent move that
  sets `result` to the opponent's mark. Add to `tests/agents/edge-cases.test.js` (new file):
  `describe('CA-A-15 — medium prefers winning over blocking', ...)`: build a state where the
  current player has both a winning move and a different move that would block the opponent's
  next-turn win; assert `chooseMove` returns the winning move. Add
  `describe('CA-A-16 — medium blocks one of two simultaneous threats', ...)`: build a state with
  no current-player win and two distinct opponent moves that would each win next turn; assert
  the returned move blocks at least one of them. All three fail because the medium branch has no
  block-check. Expected commit: `test(CA-A-05,CA-A-15,CA-A-16): failing tests — medium
  block-next-turn, win-over-block precedence, double-threat`

- [ ] T-041 [US-A-1] [AC: CA-A-05, CA-A-15, CA-A-16] GREEN — In `src/agents.js`, in the
  `'medium'` branch, after the win-check and before the fallback: for each candidate move,
  check directly whether that same cell, played by the opponent instead, would set `result` to
  the opponent's mark (`applyMove` on a scratch state with `turn` set to the opponent and the
  candidate's cell/destination as the opponent's move); return the first candidate for which it
  does (this directly occupies a threatened cell, blocking that specific threat; naturally
  blocks one of several when more than one exists — CA-A-16 — and never runs at all when the
  win-check above already returned — CA-A-15, by ordering alone). `npm test` must be fully
  green. Expected commit: `T-041: medium block-next-turn detection (CA-A-05, CA-A-15, CA-A-16)`

**Correction (2026-07-27, post-implementation)**: the two-ply lookahead originally described
here — "simulate the opponent's resulting `legalMoves` after applying [a candidate move] and
check whether any of them would set `result` to the opponent's mark; return the first candidate
for which none do" — was discarded during implementation. Under a genuine double threat (two
*distinct* cells, each independently completing a line for the opponent), occupying one threat
cell never clears the other: the opponent can still win through the remaining cell on their next
turn. That means "none [of the opponent's replies] would set `result`" is never true for *any*
candidate once two or more real threats exist, so the two-ply check always falls through to the
arbitrary `moves[0]` fallback — which is not guaranteed to be a threat cell at all. The
single-ply direct check above (does *this* cell, played by the opponent, win right now?) blocks
the first threat it finds by construction, which is exactly what CA-A-16 asks for ("blocks
exactly one of those opponent moves"), and reduces to the same behavior as the two-ply version
whenever there is only one threat (CA-A-05). Logged as **BUG-004** in `docs/bugs.md`. **CA-A-05,
CA-A-15, and CA-A-16 themselves are unchanged** — this correction is to the implementation
approach this task describes, not to any acceptance criterion in `spec.md`.

---

## Phase 3: US-A-1 — Complex Level (Priority: P1)

**Goal**: `chooseMove` dispatches to minimax + alpha-beta for `level === 'complex'`, exhaustive
in classic mode, bounded by `HORIZON_DEPTH` in continuous mode, backed by a transposition table.

**Prerequisite**: T-041 GREEN complete.

### Complex: legality and determinism (CA-A-07, CA-A-12)

_Grouped: both are properties of the same minimal deterministic stub — see "Documented
exception" above. Real minimax is added incrementally in T-044/T-046/T-047; this stub is
intentionally naive (`legalMoves(state)[0]`) and gets replaced, not extended, by T-045's search._

- [ ] T-042 [US-A-1] [AC: CA-A-07, CA-A-12] RED — Add to `tests/agents/us-a1-legality.test.js`:
  `describe('CA-A-07 — complex: legal move in every mode × phase', ...)`, same mode/phase
  `it.each` matrix, calling `chooseMove(state, 'complex', {})`. Add to
  `tests/agents/us-a2-determinism.test.js`: `describe('CA-A-12 — complex: repeats its own
  decision', ...)`: call `chooseMove` twice with the same state and the same memory object;
  assert the same `move`. Both fail because `chooseMove` has no `'complex'` branch yet. Expected
  commit: `test(CA-A-07,CA-A-12): failing tests — complex legality and determinism`

- [ ] T-043 [US-A-1] [AC: CA-A-07, CA-A-12] GREEN — In `src/agents.js`, add a `level ===
  'complex'` branch with a deterministic placeholder: `const moves = legalMoves(state); const
  move = moves[0]; return {move, memory, nodesEvaluated: moves.length, resolvedFromMemory:
  false}`. This establishes the complex level's own instance of the D7 `Decision` shape — the
  placeholder always reports `resolvedFromMemory: false`; the transposition table that can flip
  it to `true` is added later in T-050. `npm test` must be fully green. Expected commit: `T-043:
  chooseMove complex level — deterministic base dispatch (CA-A-07, CA-A-12, D7)`

### Complex: classic-mode optimality (CA-A-08)

- [ ] T-044 [US-A-1] [AC: CA-A-08] RED — Create `tests/agents/us-a1-complex.test.js` with
  `describe('CA-A-08 — complex: never loses a classic game', ...)`: a recursive `it`-driving
  helper (per `plan.md`'s note — one `describe`, not 9! separate `it` blocks) that plays the
  complex level against every legal sequence of opponent moves in classic mode from the initial
  state (or a documented representative subtree — see `data-model.md`'s `WIN_SCORE`/`LOSS_SCORE`
  sentinels for how terminal values are meant to dominate), asserting the final `result` is never
  the opponent's mark. Fails because the placeholder in T-043 does not search at all. Expected
  commit: `test(CA-A-08): failing test — complex never loses a classic game`

- [ ] T-045 [US-A-1] [AC: CA-A-08] GREEN — In `src/agents.js`, replace the classic-mode path of
  the `'complex'` branch with minimax + alpha-beta pruning per `research.md` (D-R-04): recurse via
  `legalMoves`/`applyMove`, terminal values `WIN_SCORE = 1000` / `LOSS_SCORE = -1000` /
  draw `0` (`data-model.md`), maximize for the current player, deterministic tie-break by
  `legalMoves` order; increment `nodesEvaluated` per node visited; no transposition table yet
  (added in T-049/T-050), no horizon (classic mode always reaches a terminal state). `npm test`
  must be fully green. Expected commit: `T-045: complex classic-mode minimax with alpha-beta
  (CA-A-08)`

### Complex: continuous-mode bounded optimality (CA-A-09)

- [ ] T-046 [US-A-1] [AC: CA-A-09] RED — Add to `tests/agents/us-a1-complex.test.js`:
  `describe('CA-A-09 — complex: safe within the search horizon in continuous mode', ...)`: build
  a continuous-mode movement-phase position (reuse the maximal-branching shape from `plan.md`'s
  calibration procedure); call `chooseMove(state, 'complex', {})`; assert that for every legal
  opponent reply within `HORIZON_DEPTH` plies, none sets `result` to the opponent's mark. Fails
  because T-045's minimax has no continuous-mode branch (classic-only) and no horizon cutoff.
  Expected commit: `test(CA-A-09): failing test — complex safe within the search horizon in
  continuous mode`

- [ ] T-047 [US-A-1] [AC: CA-A-09] GREEN — In `src/agents.js`, extend the complex-level minimax
  to continuous mode: add the module-level constant `const HORIZON_DEPTH = 6` (`data-model.md`)
  and the static evaluation function (sum over the 8 winning lines, `+1`/`-1`/`0` per line, per
  `data-model.md`); when `state.mode === 'continuous'` and the recursion reaches
  `HORIZON_DEPTH` without a terminal state, return the static evaluation instead of recursing
  further. `HORIZON_DEPTH` stays at its starting value of 6 in this commit — the calibration
  procedure that may adjust it is a separate task (T-048), since it measures timing against
  CA-N-01's budget, not CA-A-09's own safety property, which holds at whatever depth is actually
  searched. `npm test` must be fully green. Expected commit: `T-047: complex continuous-mode
  search bounded by HORIZON_DEPTH with static evaluation cutoff (CA-A-09)`

_Split from a single task after `/speckit-analyze` (2026-07-27) flagged the original T-047 as the
task most likely to exceed one commit: it bundled a genuinely new code layer (static evaluation +
horizon cutoff) with an open-ended, iterative measurement procedure (repeated
decrement-and-remeasure). Splitting keeps each commit to one concern._

- [ ] T-048 [US-A-1] [AC: CA-A-09] GREEN — Run the calibration procedure from `plan.md § Search
  Horizon` (steps 2–5) against the continuous-mode position built in T-046: measure the
  worst-case position with a cold transposition table; if the worst observed time exceeds ~700
  ms, decrement `HORIZON_DEPTH` and re-measure; if there is comfortable headroom, depth may be
  increased for stronger play, re-measuring each time. Record the final `HORIZON_DEPTH` value in
  `plan.md § Search Horizon` if it differs from 6. No new production code beyond the constant's
  value, if it changes — CA-A-09's test (T-046) already asserts the safety property at whatever
  depth is configured; this task only tunes the depth against the timing budget. This is the
  same measurement CA-N-01 (T-055/T-056) performs independently against the same constant; kept
  as its own commit under its own CA-ID rather than merged with CA-N-01's calibration, per P6
  (every `CA-*` criterion needs its own commit citing its ID). `npm test` must be fully green.
  Expected commit: `T-048: calibrate HORIZON_DEPTH against the timing budget for continuous-mode
  search (CA-A-09)`

### Complex: memory reuse via transposition table (CA-A-10)

- [ ] T-049 [US-A-1] [AC: CA-A-10] RED — Add to `tests/agents/us-a1-complex.test.js`:
  `describe('CA-A-10 — complex: cheaper resolution on a memoized position', ...)`: play a first
  complete classic-mode game at the complex level, capture the final `memory` returned by the
  last `chooseMove` call; start a second, independent game (`createGame`) and drive it to a state
  whose canonical position key (per `data-model.md`'s `` `${mode}|${phase}|${turn}|${board}` ``
  scheme) is already present in the carried-over `memory`; call `chooseMove` with that `state`
  and the carried-over `memory`; assert `decision.resolvedFromMemory === true` and
  `decision.nodesEvaluated` is less than the `nodesEvaluated` recorded for that same position's
  first resolution in the first game. This directly demonstrates cross-game persistence, not
  merely cross-call persistence within one game (`plan.md`'s explicit distinction). Fails because
  T-045/T-047's minimax never reads or writes any cache — `memory` is threaded through unread.
  Expected commit: `test(CA-A-10): failing test — complex reuses memory across games`

- [ ] T-050 [US-A-1] [AC: CA-A-10] GREEN — In `src/agents.js`, thread `memory` through the
  complex-level minimax as a transposition table (`data-model.md`'s `ComplexMemory`): before
  recursing on a position, look up its canonical key in `memory`; on a hit at `depth ≥` the depth
  this call would otherwise search to, return the cached `move` with `resolvedFromMemory: true`
  and `nodesEvaluated: 1`; on a miss, search as normal, then write (or overwrite, if deeper) the
  resulting `{move, value, depth}` entry into a **new** memory object (no mutation of the
  incoming `memory`, per P2) before returning it as `decision.memory`. This is the task that
  makes `resolvedFromMemory` actually flip to `true` — the primary observable evidence for D7,
  which every earlier level's stub (T-035, T-037, T-043) could only report as `false`. `npm test`
  must be fully green. Expected commit: `T-050: complex transposition table — cross-game memory
  reuse (CA-A-10, D7)`

---

## Phase 4: Cross-Level Criteria (Edge Cases, US-A-2)

**Goal**: The corollary edge case that spans all three levels (CA-A-14), then the
distinguishability simulation (CA-A-13) and the response-time NFR (CA-N-01).

**Prerequisite**: T-050 GREEN complete (all three levels fully implemented).

### Single legal move at every level (CA-A-14)

_Corollary of CA-A-01 + CA-A-03 + CA-A-07 (already established) plus CA-A-08/CA-A-09's search
correctness — see "Documented exception" above. No new production code is expected; this pair
exists to give CA-A-14 its own dedicated test and commit, per P6 (every `CA-*` criterion needs a
passing test and a commit citing its ID, independent of whether other criteria already imply
it)._

- [ ] T-051 [Edge Cases] [AC: CA-A-14] RED — Add to `tests/agents/edge-cases.test.js`:
  `describe('CA-A-14 — single legal move returned at every level', ...)`: build a state where
  `legalMoves(state)` has exactly one element (e.g. classic mode, 8 cells filled, no winner);
  call `chooseMove` for `'simple'`, `'medium'`, and `'complex'`; assert all three return that one
  move. This is a new file addition and therefore starts failing until run against the full
  implementation (no branch is missing, but the assertion has never been checked). Expected
  commit: `test(CA-A-14): failing test — single legal move at every level`

- [ ] T-052 [Edge Cases] [AC: CA-A-14] GREEN — Run `npm test`; confirm CA-A-14 passes with no
  changes to `src/agents.js` — direct consequence of CA-A-01/CA-A-03/CA-A-07's legality guarantee
  applied to a one-element `legalMoves` array. Record this explicitly in `traceability.md`'s
  notes column (same convention as `001-engine`'s D3 sub-test note in T-024). Expected commit:
  `T-052: confirm single-legal-move corollary holds at every level (CA-A-14)`

### Distinguishability by simulation (CA-A-13)

- [ ] T-053 [US-A-2] [AC: CA-A-13] RED — Create `tests/agents/us-a2-simulation.test.js` with
  `describe('CA-A-13 — complex never loses to simple over 20 games', ...)`: per `plan.md`'s
  Determinism Strategy, fix 20 seeds (`1..20`), one per game; for each, seed a mulberry32
  `random` function and pass it as `options.random` to every `chooseMove` call for the simple
  side; alternate `chooseMove`/`applyMove` until `state.result !== null`; assign first mover by
  game index (games 1–10: complex first; 11–20: simple first); assert `state.result` never equals
  the simple side's mark. Fails because `src/agents.js` has never been driven through a full
  20-game loop and the test itself does not exist yet. Expected commit: `test(CA-A-13): failing
  test — 20-game complex-vs-simple simulation`

- [ ] T-054 [US-A-2] [AC: CA-A-13] GREEN — Run `npm test`; confirm the simulation passes with no
  changes to `src/agents.js` — this is the perceptible-outcome confirmation of CA-A-08's
  exhaustive proof, not a new implementation requirement (`spec.md`'s note on CA-A-13). If any
  game fails, that indicates a bug in T-045's minimax, not a missing feature — fix there under
  P7 (spec-first debugging) rather than adding special-casing here. Expected commit: `T-054:
  confirm complex never loses to simple over 20 games (CA-A-13)`

### Response time under 1000 ms (CA-N-01)

- [ ] T-055 [Non-Functional] [AC: CA-N-01] RED — Create `tests/agents/performance.test.js` with
  `describe('CA-N-01 — worst-case response time under 1000 ms', ...)`: for each of the two
  worst-case positions in `plan.md § Timing Test Design` (classic initial board; continuous
  maximal-branching movement position, both with a cold transposition table), and for each level
  (`simple`, `medium`, `complex`), wrap `chooseMove` with `performance.now()` before and after;
  assert the difference is `< 1000`. This is a new file addition; run it to confirm current
  timings are captured and asserted (expected to fail only if a prior commit already violates
  the budget — otherwise this documents the NFR is enforced, matching the corollary pattern
  above where the criterion is new but the underlying behavior already exists). Expected commit:
  `test(CA-N-01): failing/asserting test — worst-case response time under 1000 ms at every level`

- [ ] T-056 [Non-Functional] [AC: CA-N-01] GREEN — Run `npm test`; if any measurement exceeds
  1000 ms, reduce `HORIZON_DEPTH` (`src/agents.js`) per `plan.md`'s calibration procedure step 4
  and re-measure until all six measurements (2 positions × 3 levels) are under budget; record the
  final `HORIZON_DEPTH` value in `plan.md` if it changed from 6 — reconcile against whatever
  value T-048 already recorded for CA-A-09, since both tasks tune the same constant. `npm test`
  must be fully green. Expected commit: `T-056: confirm CA-N-01 response-time budget at every
  level (CA-N-01)`

---

## Final Phase: Traceability Closure

- [ ] T-057 [AC: CA-A-01, CA-A-02, CA-A-03, CA-A-04, CA-A-05, CA-A-06, CA-A-07, CA-A-08, CA-A-09,
  CA-A-10, CA-A-11, CA-A-12, CA-A-13, CA-A-14, CA-A-15, CA-A-16, CA-N-01] Run `npm run
  verify:traceability`; fill the Task column (T-NNN) and Commit SHA column for all 17 rows in
  `specs/002-agents/traceability.md` using real SHAs from `git log`; verify `npm run
  verify:traceability` exits 0 after the commit. Expected commit: `T-057: record real SHAs in
  traceability matrix — 002-agents complete`

---

## Coverage Audit

| CA-ID | RED task | GREEN task | Test file | Notes |
|-------|----------|------------|-----------|-------|
| CA-A-01 | T-034 | T-035 | us-a1-legality.test.js | ✅ Grouped with CA-A-02 — same base implementation |
| CA-A-02 | T-034 | T-035 | us-a1-simple.test.js | ✅ Corollary of the memory-blind uniform pick |
| CA-A-03 | T-036 | T-037 | us-a1-legality.test.js | ✅ Grouped with CA-A-06, CA-A-11 — same base stub |
| CA-A-04 | T-038 | T-039 | us-a1-medium.test.js | ✅ New layer, own pair |
| CA-A-05 | T-040 | T-041 | us-a1-medium.test.js | ✅ Grouped with CA-A-15, CA-A-16 — same block-check layer |
| CA-A-06 | T-036 | T-037 | us-a1-medium.test.js | ✅ Corollary — base stub never reads memory |
| CA-A-07 | T-042 | T-043 | us-a1-legality.test.js | ✅ Grouped with CA-A-12 — same deterministic stub |
| CA-A-08 | T-044 | T-045 | us-a1-complex.test.js | ✅ Real minimax replaces the stub, classic mode |
| CA-A-09 | T-046 | T-047, T-048 | us-a1-complex.test.js | ✅ T-047 implements the cutoff; T-048 calibrates HORIZON_DEPTH (split after /speckit-analyze) |
| CA-A-10 | T-049 | T-050 | us-a1-complex.test.js | ✅ Transposition table layered onto T-047's search |
| CA-A-11 | T-036 | T-037 | us-a2-determinism.test.js | ✅ Corollary of the base stub; test file per plan.md |
| CA-A-12 | T-042 | T-043 | us-a2-determinism.test.js | ✅ Corollary of the deterministic complex stub |
| CA-A-13 | T-053 | T-054 | us-a2-simulation.test.js | ✅ Perceptible-outcome confirmation of CA-A-08 |
| CA-A-14 | T-051 | T-052 | edge-cases.test.js | ✅ Corollary of CA-A-01/03/07 — documented, no new code |
| CA-A-15 | T-040 | T-041 | edge-cases.test.js | ✅ Ordering consequence — win-check precedes block-check |
| CA-A-16 | T-040 | T-041 | edge-cases.test.js | ✅ Same block-check, two-threat fixture |
| CA-N-01 | T-055 | T-056 | performance.test.js | ✅ Calibration loop against HORIZON_DEPTH |

---

## Dependencies & Execution Order

All 24 tasks are strictly sequential. No `[P]` markers: every GREEN touches `src/agents.js`
(except T-048, T-052, T-054, T-056, which may touch only the `HORIZON_DEPTH` constant or nothing
at all); consecutive REDs for the same test file accumulate content in the same file.

```
T-034(RED) → T-035(GREEN)      CA-A-01, CA-A-02
  → T-036(RED) → T-037(GREEN)  CA-A-03, CA-A-06, CA-A-11
  → T-038(RED) → T-039(GREEN)  CA-A-04
  → T-040(RED) → T-041(GREEN)  CA-A-05, CA-A-15, CA-A-16
  → T-042(RED) → T-043(GREEN)  CA-A-07, CA-A-12
  → T-044(RED) → T-045(GREEN)  CA-A-08
  → T-046(RED) → T-047(GREEN) → T-048(GREEN)  CA-A-09
  → T-049(RED) → T-050(GREEN)  CA-A-10
  → T-051(RED) → T-052(GREEN)  CA-A-14
  → T-053(RED) → T-054(GREEN)  CA-A-13
  → T-055(RED) → T-056(GREEN)  CA-N-01
  → T-057                      traceability closure
```

**Phase gates**:

| Phase starts at | Prerequisite |
|------------------|-------------|
| Phase 1 (T-034) | `001-engine` closed (T-033, commit `2ef54af`) |
| Phase 2 (T-036) | T-035 GREEN — simple level complete |
| Phase 3 (T-042) | T-041 GREEN — medium level complete |
| Phase 3, CA-A-09 (T-046) | T-045 GREEN — classic-mode minimax exists |
| Phase 3, CA-A-09 calibration (T-048) | T-047 GREEN |
| Phase 3, CA-A-10 (T-049) | T-048 GREEN — continuous-mode search exists and is calibrated |
| Phase 4 (T-051) | T-050 GREEN — all three levels fully implemented |
| Phase 4, CA-A-13 (T-053) | T-052 GREEN |
| Phase 4, CA-N-01 (T-055) | T-054 GREEN |
| Final (T-057) | T-056 GREEN — `npm test` fully green |

---

## Self-Check Report

| Check | Result |
|-------|--------|
| CA-ID with no RED task | None — 17/17 covered |
| CA-ID with no GREEN task | None — 17/17 covered |
| GREEN preceding its RED | None — verified by task sequence above |
| Tasks without CA-ID | None — no tooling phase was needed for this feature (plan.md: no new dependency, no new script) |
| Tasks exceeding one commit | The largest single implementation step is T-045 (classic-mode minimax with alpha-beta) — kept as one GREEN because CA-A-08 names a single observable property ("never loses") that minimax either satisfies or does not; splitting the algorithm into partial commits would leave an intermediate commit claiming CA-A-08 traced while the search is incomplete, the same false-positive risk BUG-001 found in 001-engine. The original T-047 (continuous-mode cutoff + calibration) was flagged by `/speckit-analyze` (2026-07-27) as the task most likely to exceed one commit and has since been split into T-047 (implementation) and T-048 (calibration). |
| CA-ID with unclear test strategy | CA-A-08 uses one `describe` driving a recursive helper over legal opponent sequences (per plan.md), not 9! separate `it` blocks — documented in T-044. All other criteria have a single concrete fixture or `it.each` matrix. |

**Documented-exception note** (see header): CA-A-02, CA-A-06, CA-A-11, CA-A-12, and CA-A-14 are
structural corollaries of implementation choices made for other criteria, not independently
codeable features. Each still gets its own `describe`, its own RED/GREEN pair, and its own
commit message citing its CA-ID, satisfying P6's traceability requirement — but the "RED" state
for these pairs is genuine only in the sense that the *specific test* did not exist and had never
been run before that commit, not that the underlying behavior was ever absent. This mirrors
`001-engine`'s T-023/T-024 precedent (D3: "requires no special-casing — the existing check
already allows it") and is called out explicitly here rather than left implicit, so a reviewer
auditing `git log --grep` understands why some GREEN commits (T-052, T-054, T-056) add no
production code.

**Corollary GREEN commits with no code change**: T-052 (CA-A-14) and T-054 (CA-A-13) are expected
to require zero changes to `src/agents.js` if the preceding implementation is correct. If either
fails, per P7 (spec-first debugging) the fix path is: diagnose which earlier criterion's
implementation is actually wrong (CA-A-01/03/07 for T-052; CA-A-08 for T-054), fix that
criterion's code, and re-verify — never add special-casing inside T-052/T-054 themselves.

**D7 traceability note** (added 2026-07-27, per `/speckit-analyze`): D7 (`spec.md § Design
Decisions`) motivates the `nodesEvaluated`/`resolvedFromMemory` fields in every level's `Decision`
return value. Prior to this note, no task cited "D7" by name, making it traceable only through
`spec.md`, `plan.md`, and `contracts/agents-api.md`. The literal string `D7` now appears in the
expected commit messages of T-035, T-037, T-043 (the three tasks that first establish the shape
for each level) and T-050 (the task that makes `resolvedFromMemory` actually become `true`), so a
`git log --grep D7` search surfaces the same commits a reviewer would expect from `spec.md`.
