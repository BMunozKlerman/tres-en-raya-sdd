# Research: Game Agents

**Branch**: `002-agents` | **Date**: 2026-07-27 | **Phase**: 0

## Purpose

Confirm all technique and design decisions before implementation. The stack is fixed by
constitution P1/P2 (see `CLAUDE.md`); the open unknowns for this feature are the per-level
decision technique, the search-horizon depth for continuous mode (D8), and the test seams
needed to make CA-A-02, CA-A-13, and CA-N-01 deterministic and measurable. This document
resolves all of them.

## Decisions

### D-R-01 — Random Source Injection for the Simple Level

**Decision**: `chooseMove` accepts a 4th, optional parameter — `options: { random?: () => number }`
— defaulting to `Math.random` when omitted. Only the simple level reads it.

**Rationale**: CA-A-13 requires 20 deterministic simulated games even though the simple level's
decision rule is uniform random selection. Monkey-patching the global `Math.random` for the
duration of a test is fragile (leaks across parallel Vitest workers, easy to forget to restore)
and cannot vary the seed per game while staying reproducible. An explicit function parameter is
the direct injection seam: tests pass a seeded generator, production callers (the future UI
feature) simply omit `options` and get real randomness. This does not add player-facing
functionality — no criterion changes behavior because of it — it is a testability seam of the
same kind `createGame(mode)` was for `001-engine` (CLAUDE.md's contract table did not list it
either, and it was added because otherwise CA-M-01 could not be exercised).

**Alternatives considered**: Global `Math.random` mock via `vi.spyOn` — rejected (fragile across
parallel test files, cannot assign a distinct seed per simulated game in CA-A-13's 20-game loop
without repeatedly re-mocking). Threading the seed through the `memory` parameter — rejected
because CA-A-02 requires the simple level's move to be identical across two different `memory`
values; putting the seed there would make the two invocations diverge by construction and the
criterion untestable as written.

### D-R-02 — PRNG Algorithm

**Decision**: `mulberry32`, a 32-bit seeded generator, implemented as ~5 lines with no
dependency. `random()` returns a float in `[0, 1)`, same contract as `Math.random`.

**Rationale**: P1 forbids runtime dependencies; a seeded PRNG must be hand-rolled or absent.
Mulberry32 is deterministic, fast, and well-known enough to review at a glance. Any output in
`[0, 1)` is sufficient because the simple level only needs `Math.floor(random() * legalMoves.length)`.

**Alternatives considered**: `crypto.getRandomValues` — rejected (not seedable, defeats the
purpose). A counter-based fake return sequence hardcoded in tests — rejected (works for CA-A-02's
two-call comparison but cannot produce the varied-but-reproducible play needed across 20 distinct
CA-A-13 games).

### D-R-03 — Medium Level Technique

**Decision**: Rule-based, no search tree. For each legal move: (1) apply it via `applyMove` on a
scratch copy; if `result` becomes the mover's mark, that move satisfies CA-A-04 — return the
first one found in `legalMoves` order. (2) Otherwise, for each opponent move that would follow
if no action is taken, check whether it sets `result` to the opponent's mark; collect every such
threat. If exactly one, return a move whose resulting state removes that threat (CA-A-05); if
two or more, return a move that blocks exactly one of them (CA-A-16, documented limitation). (3)
If no win and no threat, return the first move in `legalMoves` order (CA-A-15's win-over-block
priority falls out of step 1 running before step 2; no separate rule is needed).

**Rationale**: RF-2 defines medium as "wins if it can win this turn, blocks if the opponent would
win next turn; remembers the current game" — a two-step lookahead, not a search. Implementing it
as direct enumeration over `legalMoves`/`applyMove` keeps the module within the engine's public
contract (no new engine surface needed) and trivially satisfies CA-N-01 (at most `|legalMoves|²`
`applyMove` calls, ≤ 36² in the worst continuous-mode branching case — microseconds).

**Alternatives considered**: One-ply minimax with a shallow heuristic — rejected (over-engineered
for a rule the spec states in plain win/block terms; would blur the intentional behavioral gap
with `complex` that CA-A-16 documents).

### D-R-04 — Complex Level Technique

**Decision**: Minimax with alpha-beta pruning. Classic mode searches to a terminal state
exhaustively (small tree, ≤ 9!). Continuous mode is bounded by a search horizon (`HORIZON_DEPTH`,
see D-R-05) with a static evaluation function at the cutoff. A transposition table (see D-R-06)
threaded through the `memory` parameter caches previously resolved positions.

**Rationale**: D8 requires exact optimality in classic mode (never lose) and bounded-horizon
optimality in continuous mode, because continuous mode's tree is unbounded (no draw, no
repetition rule — 001-engine D2). Alpha-beta pruning is the standard technique to keep node
counts inside CA-N-01's 1000 ms budget without changing the result minimax alone would produce.

**Tie-break rule** (both modes): among moves with equal minimax value, return the first one in
the order `legalMoves` produces (which is itself the engine's cell-index / from-then-to order —
see `specs/001-engine/contracts/engine-api.md`). This is a deterministic, arbitrary rule, as
permitted by the spec's Assumptions section ("tie-breaking... is left to the implementation");
it exists only to make CA-A-12 (determinism) trivially satisfiable, not because any criterion
requires a specific tie-break.

**Alternatives considered**: Plain minimax without pruning — rejected (worst-case node count in
continuous mode cannot be bounded without also bounding depth, and unpruned classic-mode search
from an empty board risks approaching CA-N-01's budget on slower hardware). Iterative deepening —
rejected as unnecessary complexity; a fixed horizon is sufficient once calibrated (D-R-05) and
avoids introducing a second tunable parameter (time budget vs. depth budget) for no criterion
that asks for it.

### D-R-05 — Search Horizon Depth (D8, CA-A-09)

**Decision**: Start at `HORIZON_DEPTH = 6` plies (three of the agent's own moves and three
opponent replies) for continuous-mode search. This constant lives in `src/agents.js`.

**Calibration procedure** (executed during implementation, before CA-N-01's task is marked
done): benchmark `chooseMove` at the complex level over a fixed set of continuous-mode
movement-phase positions chosen to maximize branching (3 own pieces, several empty destinations
each, no immediate win or forced loss — the condition that forces the search to actually reach
the horizon instead of pruning early on a terminal result). Measure wall-clock time with
`performance.now()`, cold memory (empty transposition table, i.e. first-ever resolution, the
worst case per CA-A-10). If the worst observed time exceeds a safety margin below CA-N-01's
1000 ms ceiling (target: stay under ~700 ms to absorb machine variability), reduce
`HORIZON_DEPTH` by one ply and re-measure; if there is comfortable headroom, depth may be
increased for stronger play, re-measuring each time. The value that ships is whatever value
survives this loop — if it differs from 6, the implementing task must update this constant's
value here in `plan.md` and note the change in `traceability.md`, the same discipline D8
already established for horizon depth as a plan-level (not spec-level) parameter.

**Static evaluation function at the horizon cutoff**: for each of the 8 winning lines, add
`+1` per own mark and no opponent mark on that line, subtract `1` for the symmetric opponent
case; lines blocked by both marks score 0. Sum over all 8 lines. This is an internal heuristic,
not a spec-observable value — no CA-ID names it — used only to rank non-terminal leaf positions
consistently for alpha-beta ordering.

**Alternatives considered**: Fixed low depth (e.g. 2) chosen without measurement — rejected,
risks either violating CA-N-01 on slower machines or under-using the available time budget,
producing a weaker-than-necessary complex level with no test evidence either way. A
time-boxed cutoff (stop searching after N ms) instead of a depth cutoff — rejected because it
makes `nodesEvaluated` (CA-A-10's observability field) machine-dependent and non-reproducible
across test runs, breaking CA-A-12's determinism requirement.

### D-R-06 — Transposition Table Design (D7, CA-A-10)

**Decision**: The complex level's `memory` is a plain object (not a `Map`, to stay trivially
serializable if ever inspected) keyed by a canonical position string:
`` `${mode}|${phase}|${turn}|${board.join('')}` `` (board cells joined with `null` rendered as
`'_'`). Each entry is `{ move, value, depth }` — the resolved best move, its minimax value, and
the search depth at which it was resolved. `piecesPlaced` is not part of the key because it is
fully determined by `board` (count of non-null cells) plus `phase`; including it would create
redundant keys for the same logical position.

**Rationale**: D7 requires memory reuse to be observable via `nodesEvaluated` and
`resolvedFromMemory`. A position → decision cache is the simplest structure that makes "already
resolved" a direct lookup. Because 001-engine's D2 establishes that repeated positions are not
specially treated by the engine (no history-dependent rule), a memory-less positional key is
sufficient — no move history needs to be part of it.

**Hit semantics**: on a lookup hit at a depth ≥ the depth the current call would search to,
`resolvedFromMemory = true`, `nodesEvaluated` counts only the lookup (a small constant, e.g. 1),
and the cached `move` is returned unchanged. On a miss (or a hit at a shallower depth than
required), the module runs alpha-beta as normal, counts every node visited during that specific
call into `nodesEvaluated`, and writes/overwrites the entry before returning. This guarantees
CA-A-10's requirement that a repeated position's second resolution reports a strictly smaller
`nodesEvaluated` than its first.

**Alternatives considered**: A single flat move-count cache keyed by state (no depth field) —
rejected because a shallow-search entry could incorrectly satisfy a later request that needs
deeper search (e.g. a horizon-bound continuous-mode entry re-used for a call that could safely
search deeper); storing `depth` prevents that correctness bug even though no test currently
exercises the boundary (documented here for the implementer, not asserted as a criterion).

### D-R-07 — Memory Scoping per Level (RF-2, D6, CA-A-06, CA-A-10)

**Decision**: Simple: `memory` is read by nothing; the level echoes back whatever it received,
unchanged, on every call. Medium: `memory` is read by nothing either — the level always returns
`memory' = null`, discarding whatever it received, on every call. This is what makes CA-A-06
trivially true: not because the implementation tracks "start of a new game" specially, but
because medium never looks at memory content at all, so a value carried over from a previous
game has, structurally, no path by which it could affect the move. Complex: `memory` is the
transposition table object (D-R-06); the caller is responsible for holding it in scope across
`chooseMove` calls, including across games in the same session (D6), and letting it fall out of
scope on reload (nothing in `agents.js` persists it — session-only is a caller-side property,
per D6, not something the module enforces).

**Rationale**: RF-2 states medium "remembers the current game," but CA-A-06 (as re-scoped by
option C — see `spec.md` Clarifications) only requires non-persistence *across* games, which a
memoryless implementation satisfies by construction — the decision of absence of behavior
recorded in `spec.md` and `CLAUDE.md`'s session log. Building an actual per-game memory
structure for medium that the algorithm never consults would be speculative (YAGNI) and would
contradict the spec's own justification for narrowing CA-A-06.

**Alternatives considered**: Giving medium a real (but unused) per-game memory object, to leave
room for a future smarter medium — rejected; no criterion asks for it, and the constitution's
"no speculative abstraction" rule applies here as much as anywhere else.

### D-R-08 — Timing Measurement for CA-N-01

**Decision**: Wrap the `chooseMove` call in `performance.now()` before and after, inside a
Vitest test running in `environment: 'node'` (no DOM, no timer mocking). Assert the elapsed
milliseconds is `< 1000` for each of the three levels, at the worst-case position defined in
D-R-05's calibration note: classic mode from the empty board (complex level, cold/empty
transposition table — the largest possible exhaustive search) and continuous mode from a
maximum-branching movement-phase position (complex level, cold table, horizon-bound search).
Simple and medium are measured at the same two positions for completeness (CA-N-01 names all
three levels); both are expected to finish in low single-digit milliseconds given D-R-03's
enumeration-only technique.

**Rationale**: `performance.now()` is a Node.js built-in (P1: no dependency added) and gives
sub-millisecond resolution, more than sufficient against a 1000 ms budget. Testing with cold
memory is the pessimistic case — CA-A-10 guarantees warm (already-resolved) calls are faster, so
proving the cold case bounds the warm case too.

**Alternatives considered**: `Date.now()` — rejected, coarser resolution, no reason to prefer it
over `performance.now()` on Node 20. A dedicated benchmarking library — rejected (P1 violation;
also unnecessary for a single-assertion timing test).

## Conclusion

No unknowns remain. All decisions are either mandated by the constitution, derived directly
from `spec.md`'s criteria and design decisions (D5–D8, CA-A-06 as narrowed by option C), or
introduced as minimal, justified test seams (D-R-01's `options.random` parameter) with no
player-facing behavioral effect. Implementation may begin once `tasks.md` is generated.
