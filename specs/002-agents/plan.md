# Implementation Plan: Game Agents

**Branch**: `002-agents` | **Date**: 2026-07-27 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/002-agents/spec.md`

## Summary

Pure ES-module agents (`src/agents.js`) implementing three difficulty levels — simple, medium,
complex — that resolve `chooseMove` for a non-terminal engine state, consuming only
`legalMoves`/`applyMove` from `specs/001-engine/contracts/engine-api.md`. Simple picks uniformly
at random among legal moves; medium applies a win-this-turn/block-next-turn priority heuristic
with no search; complex runs minimax with alpha-beta pruning, exhaustive in classic mode and
bounded by a calibrated search horizon in continuous mode, backed by a transposition table that
makes cross-game memory reuse observable (D7).

**⚠️ Contract change (declared here, detailed in `contracts/agents-api.md`)**: D7 requires
`chooseMove` to return `nodesEvaluated` and `resolvedFromMemory` alongside the move, and a 4th
optional `options.random` parameter is added as a test-determinism seam for the simple level.
This **supersedes** the two-field return sketch (`{move, memory'}`) in `CLAUDE.md`'s Contracts
section, the same way `specs/001-engine/contracts/engine-api.md` added `createGame` beyond
CLAUDE.md's original engine sketch. `CLAUDE.md` should be updated to match in a follow-up
documentation commit; this plan is the authoritative record until then.

## Technical Context

All stack decisions below are fixed by constitution P1 and P2 (see `CLAUDE.md`). No redesign.

**Language/Version**: JavaScript ES2022, ES modules (`.js`, `import`/`export`)
**Primary Dependencies**: Vitest 1.x (devDependency, already present from 001-engine); no new
  dependency — the seeded PRNG (D-R-02) and timing (D-R-08) needs are met by hand-rolled code and
  Node built-ins (`performance.now()`)
**Storage**: N/A — the transposition table is an in-memory object threaded by the caller between
  calls; no persistence within this feature (session-only, per D6)
**Testing**: Vitest, `environment: 'node'` (no DOM required — same as `001-engine`)
**Target Platform**: Node.js 20 LTS (tests); modern browser (future `003-interface`, via UI
  threading `memory` in page-level state)
**Project Type**: Pure library module (no CLI, no server, no framework)
**Performance Goals**: CA-N-01 — every `chooseMove` call, any level, any mode, worst case, in
  under 1000 ms (P9 assigns this NFR to `002-agents`)
**Constraints**: `src/agents.js` MUST NOT import DOM APIs, timers, or any module that does; MUST
  import only `legalMoves`/`applyMove` from `src/engine.js` (P2: agents depend on the engine, the
  engine does not know about agents)
**Scale/Scope**: 1 module, 17 CA-IDs (CA-A-01–CA-A-16 + CA-N-01), planned across 8 test files

## Constitution Check

*GATE: Must pass before Phase 0. Re-checked after Phase 1.*

| Principle | Gate | Status |
|-----------|------|--------|
| P1 · Fixed Stack | No new runtime or dev dependency; PRNG and timing use hand-rolled code / Node built-ins | ✅ Pass |
| P2 · Pure Layered Architecture | `agents.js` has no DOM/timer imports; imports only `legalMoves`/`applyMove` from `engine.js`; UI is not touched | ✅ Pass |
| P3 · Spec as Source of Truth | Plan derived from `spec.md`'s 17 criteria; the `options.random` seam and `Decision`/`Memory` shapes add no behavior beyond what CA-A-01–16 and CA-N-01 require or D7 mandates | ✅ Pass |
| P4 · EARS Requirements | Criteria live in `spec.md`, not here | ✅ Pass |
| P5 · Verification Gate | Task sequence (RED test → implementation) enforced in `tasks.md`, same discipline as `001-engine` | ✅ Pass |
| P6 · Traceability | `scripts/verify-traceability.mjs` (built in `001-engine`) already scans any `CA-\d+` pattern across specs/tasks/tests/git log; no change needed for the `CA-A-nn` prefix | ✅ Pass |
| P7 · Spec-First Debugging | N/A at plan stage; documented in process rules | ✅ Pass |
| P8 · Human Review | N/A at plan stage | ✅ Pass |
| P9 · Non-Functional | CA-N-01 belongs to `002-agents` (this feature); CA-N-02/03 (if any) remain with `003-interface` | ✅ Pass |

No violations. Complexity Tracking section left empty.

## Technique per Level

Full rationale for each is in `research.md` (D-R-01 through D-R-08). Summary:

| Level | Technique | Memory | Determinism seam |
|-------|-----------|--------|-------------------|
| Simple | Uniform random pick over `legalMoves(state)` | Unused, echoed back unchanged (CA-A-02) | `options.random`, injectable, defaults to `Math.random` (D-R-01, D-R-02) |
| Medium | Win-this-turn check, then block-next-turn check, then first legal move as fallback (D-R-03) | Memoryless by design — always returns `null` (CA-A-06, option C; decision of absence of behavior, same pattern as 001-engine's D2) | None needed — no randomness involved |
| Complex | Minimax + alpha-beta; exhaustive to terminal in classic mode; bounded by `HORIZON_DEPTH` with a static evaluation cutoff in continuous mode (D-R-04); transposition table cache (D-R-06) | Persistent across games within a session (D6); `memory` is the transposition table object | None needed — deterministic tie-break by `legalMoves` order (D-R-04) |

## Search Horizon for Continuous Mode (CA-A-09, D8)

**Starting value**: `HORIZON_DEPTH = 6` plies (three of the agent's own moves, three opponent
replies). Lives as a module-level constant in `src/agents.js` (`data-model.md`).

**Calibration procedure** (executed during implementation, before the CA-N-01 task is closed):

1. Build a fixed set of continuous-mode movement-phase positions engineered to maximize
   branching (3 own pieces each with several empty destinations, no immediate win or forced
   loss present) — this forces the search to actually reach the horizon rather than pruning
   early on a terminal result.
2. Run the complex level against each position with a **cold** (empty) transposition table —
   the pessimistic case per CA-A-10 (a warm cache can only be faster).
3. Measure wall-clock time with `performance.now()`.
4. If the worst observed time exceeds ~700 ms (a safety margin below CA-N-01's 1000 ms ceiling,
   absorbing machine variability), decrement `HORIZON_DEPTH` by one ply and re-measure. If there
   is comfortable headroom, depth may be increased for stronger play, re-measuring each time.
5. Whatever value survives step 4 is what ships. If it differs from the starting value of 6, the
   implementing task MUST update the constant's documented value here in `plan.md` and record the
   change in `traceability.md` — the same discipline D8 already established for treating horizon
   depth as a plan-level, not a spec-level, parameter.

This calibration is a measurement activity performed during a `tasks.md` task, not a redesign of
the technique; it does not require touching `spec.md`.

## Test Strategy

### File layout

```
tests/
└── agents/
    ├── us-a1-legality.test.js     # CA-A-01, CA-A-03, CA-A-07 (legality, all levels × mode × phase)
    ├── us-a1-simple.test.js       # CA-A-02 (simple: memory independence)
    ├── us-a1-medium.test.js       # CA-A-04, CA-A-05, CA-A-06 (medium: win, block, memory)
    ├── us-a1-complex.test.js      # CA-A-08, CA-A-09, CA-A-10 (complex: classic optimality, horizon, memory reuse)
    ├── us-a2-determinism.test.js  # CA-A-11, CA-A-12 (medium/complex repeat their own decision)
    ├── us-a2-simulation.test.js   # CA-A-13 (20-game complex-vs-simple simulation)
    ├── edge-cases.test.js         # CA-A-14, CA-A-15, CA-A-16
    └── performance.test.js        # CA-N-01
```

### CA-ID → test mapping

Every `describe` block MUST contain the CA-ID exactly as it appears in `spec.md`, following the
same convention `001-engine` used (Vitest reports it in failure output; the traceability
verifier scans for it).

| CA-ID | Test file | `describe` label |
|-------|-----------|-------------------|
| CA-A-01 | us-a1-legality.test.js | `'CA-A-01 — simple: legal move in every mode × phase'` |
| CA-A-02 | us-a1-simple.test.js | `'CA-A-02 — simple: move independent of memory'` |
| CA-A-03 | us-a1-legality.test.js | `'CA-A-03 — medium: legal move in every mode × phase'` |
| CA-A-04 | us-a1-medium.test.js | `'CA-A-04 — medium: wins this turn when possible'` |
| CA-A-05 | us-a1-medium.test.js | `'CA-A-05 — medium: blocks a single next-turn threat'` |
| CA-A-06 | us-a1-medium.test.js | `'CA-A-06 — medium: move independent of prior-game memory'` |
| CA-A-07 | us-a1-legality.test.js | `'CA-A-07 — complex: legal move in every mode × phase'` |
| CA-A-08 | us-a1-complex.test.js | `'CA-A-08 — complex: never loses a classic game'` |
| CA-A-09 | us-a1-complex.test.js | `'CA-A-09 — complex: safe within the search horizon in continuous mode'` |
| CA-A-10 | us-a1-complex.test.js | `'CA-A-10 — complex: cheaper resolution on a memoized position'` |
| CA-A-11 | us-a2-determinism.test.js | `'CA-A-11 — medium: repeats its own decision'` |
| CA-A-12 | us-a2-determinism.test.js | `'CA-A-12 — complex: repeats its own decision'` |
| CA-A-13 | us-a2-simulation.test.js | `'CA-A-13 — complex never loses to simple over 20 games'` |
| CA-A-14 | edge-cases.test.js | `'CA-A-14 — single legal move returned at every level'` |
| CA-A-15 | edge-cases.test.js | `'CA-A-15 — medium prefers winning over blocking'` |
| CA-A-16 | edge-cases.test.js | `'CA-A-16 — medium blocks one of two simultaneous threats'` |
| CA-N-01 | performance.test.js | `'CA-N-01 — worst-case response time under 1000 ms'` |

CA-A-08 requires exhaustive traversal of all legal opponent-move sequences in classic mode
(small enough to enumerate fully, per the spec's own note); this is one `describe('CA-A-08', ...)`
with a recursive `it`-driving helper, not 9! separate `it` blocks.

### Vitest configuration

Reuses the existing `vitest.config.js` from `001-engine` (`environment: 'node'`,
`include: ['tests/**/*.test.js']`); no change needed — `tests/agents/**/*.test.js` is already
matched by the existing glob.

## Determinism Strategy for CA-A-13 (20-Game Simulation)

CA-A-13 requires the complex level to never lose to the simple level across 20 complete
classic-mode games (10 with each side moving first), while the simple level's decision rule is
uniform random selection. To keep the test itself deterministic and reproducible across CI runs:

1. Fix 20 seeds ahead of time in the test file (e.g. the integers `1..20`), one per simulated
   game — not derived from wall-clock time or any other non-reproducible source.
2. For each game, construct a seeded `random` function (D-R-02's mulberry32, seeded per step 1)
   and pass it as `options.random` to every `chooseMove` call made for the simple side in that
   game. The complex side needs no `options` (deterministic by construction, D-R-04).
3. Play the game to completion by alternating `chooseMove`/`applyMove` calls until
   `state.result !== null`, assigning first-mover by game index (games 1–10: complex first;
   11–20: simple first), per CA-A-13's wording.
4. Assert `state.result` is never `'O'`/`'X'` matching the simple side's mark — i.e. the complex
   side's result is never a loss (win or draw both pass).

Because the seeds are fixed constants checked into the test file, the same 20 games run
identically on every execution; no flakiness is introduced despite simple's randomness.

## Memory Across Games Within a Session (D6, D7, CA-A-10)

The caller (in this feature, the test harness simulating a session; in `003-interface`, the UI
module) is responsible for holding the `memory` value returned by one `chooseMove` call and
passing it into the next call for the same level — across moves within a game, and across games
within a session, per D6. `agents.js` itself never stores memory internally (Assumptions,
`spec.md`); this is what "the caller is responsible for threading memory" means concretely.

**How a test injects memory from a previous game**: to exercise CA-A-10's cross-game persistence
requirement, a test plays a first complete game at the complex level (any legal opponent
sequence), captures the final `memory` value returned by the last `chooseMove` call, then starts
a *second, independent* game (`createGame` from the engine) and calls `chooseMove` again with a
`state` from this new game that happens to reach a position already present as a key in the
carried-over `memory` — asserting `resolvedFromMemory === true` and a smaller `nodesEvaluated`
than the first game's resolution of that same position. This directly demonstrates cross-game
persistence, not merely cross-call persistence within one game (a distinction the spec calls out
explicitly in CA-A-10's Notes).

## Timing Test Design for CA-N-01

**Worst-case position, classic mode**: the initial empty board (`createGame('classic')`), complex
level, cold (empty `{}`) transposition table — the largest possible exhaustive minimax search,
since every other classic-mode position has a smaller remaining game tree.

**Worst-case position, continuous mode**: a hand-built movement-phase position with all 3 pieces
placed for each side, maximal empty-cell branching, and no immediate win or forced loss present
(the same shape used for the search-horizon calibration positions) — complex level, cold
transposition table, forcing a full `HORIZON_DEPTH`-bound search.

**Measurement**: wrap the `chooseMove` call with `performance.now()` immediately before and
after; assert the difference is `< 1000`. Both positions are measured at all three levels (CA-N-01
names simple, medium, and complex); simple and medium are expected to pass with a wide margin
given their enumeration-only techniques (D-R-03, uniform pick), but are still asserted, since the
criterion is written to cover every level, not only the slowest one.

## Project Structure

### Documentation (this feature)

```
specs/002-agents/
├── plan.md                 # This file
├── research.md             # Phase 0 — technique and calibration decisions
├── data-model.md           # Phase 1 — Decision, Memory (per level), search horizon, eval score
├── quickstart.md           # Phase 1 — how to run tests, simulate CA-A-13, measure CA-N-01
├── traceability.md         # Matrix skeleton (task/commit filled in during implement)
├── contracts/
│   └── agents-api.md       # Public API contract for chooseMove — declares the D7 contract change
└── tasks.md                # Phase 2 — created by /speckit-tasks
```

### Source Code (repository root)

```
src/
├── engine.js                # Unchanged, from 001-engine
└── agents.js                # New: chooseMove for simple, medium, complex

tests/
├── engine/                  # Unchanged, from 001-engine
└── agents/
    ├── us-a1-legality.test.js
    ├── us-a1-simple.test.js
    ├── us-a1-medium.test.js
    ├── us-a1-complex.test.js
    ├── us-a2-determinism.test.js
    ├── us-a2-simulation.test.js
    ├── edge-cases.test.js
    └── performance.test.js

vitest.config.js             # Unchanged — existing glob already matches tests/agents/**
package.json                 # Unchanged — no new scripts or dependencies needed
```

**Structure Decision**: Single-project layout, same as `001-engine`. Agents are one new module
alongside the existing engine module; tests mirror the user-story structure from `spec.md`
(US-A-1, US-A-2, Edge Cases, Non-Functional), the same convention `001-engine` established.

## Complexity Tracking

> No constitution violations. Section intentionally empty.
