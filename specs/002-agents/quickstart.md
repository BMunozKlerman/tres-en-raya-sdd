# Quickstart: Game Agents

**Branch**: `002-agents` | **Date**: 2026-07-27

How to validate that the agents implementation is correct end-to-end.

## Prerequisites

- Node.js 20 LTS
- `npm install` run at repo root (installs Vitest — no new dependency for this feature)
- `specs/001-engine` implemented (`src/engine.js` exports `createGame`, `legalMoves`, `applyMove`)

## Run the test suite

```bash
npm test
```

Expected output: all tests pass, grouped by CA-ID, including the existing `tests/engine/` suite
and the new `tests/agents/` suite. Example:

```
✓ CA-A-01 — simple: legal move in every mode × phase
✓ CA-A-02 — simple: move independent of memory
...
✓ CA-N-01 — worst-case response time under 1000 ms
```

Exit code 0. No red tests before implementation is complete.

## Run a single test file

```bash
npx vitest run tests/agents/us-a1-legality.test.js
```

Replace the path with any of the eight agent test files:
- `tests/agents/us-a1-legality.test.js` — CA-A-01, CA-A-03, CA-A-07
- `tests/agents/us-a1-simple.test.js` — CA-A-02
- `tests/agents/us-a1-medium.test.js` — CA-A-04, CA-A-05, CA-A-06
- `tests/agents/us-a1-complex.test.js` — CA-A-08, CA-A-09, CA-A-10
- `tests/agents/us-a2-determinism.test.js` — CA-A-11, CA-A-12
- `tests/agents/us-a2-simulation.test.js` — CA-A-13
- `tests/agents/edge-cases.test.js` — CA-A-14, CA-A-15, CA-A-16
- `tests/agents/performance.test.js` — CA-N-01

## Run the traceability verifier

```bash
npm run verify:traceability
```

The script built in `001-engine` (`scripts/verify-traceability.mjs`) already scans any
`/CA-\w+-\d+/`-shaped ID across `spec.md`, `tasks.md`, test files, and task/RED commit subjects —
no change is needed for it to also cover `CA-A-nn` and `CA-N-01`. Expected output once all 17
002-agents CA-IDs are traced (in addition to the 20 already-closed 001-engine ones):

```
OK: all 37 CA-IDs fully traced
```

## Validation scenarios

Each maps to one or more CA-IDs; see `contracts/agents-api.md` and `data-model.md` for the exact
shapes.

| Scenario | CA-IDs |
|----------|--------|
| `chooseMove` for each level, on a state in every mode × phase combination, returns a move in `legalMoves(state)` | CA-A-01, CA-A-03, CA-A-07 |
| Simple level, same state, two different `memory` values, same `options.random` → same move | CA-A-02 |
| Medium level has a legal move that wins this turn → that move is returned | CA-A-04 |
| Medium level has no winning move but exactly one opponent next-turn threat → returns a move that removes it | CA-A-05 |
| Medium level, initial state of a new game, memory from a previous game vs. empty memory → same move | CA-A-06 |
| Complex level plays a full classic game against any legal opponent sequence → never ends with the opponent's mark | CA-A-08 |
| Complex level in continuous mode → no legal opponent reply within `HORIZON_DEPTH` sets the opponent's mark | CA-A-09 |
| Complex level resolves the same position twice (including across two different games in one session) → second resolution has smaller `nodesEvaluated` and `resolvedFromMemory === true` | CA-A-10 |
| Medium level, same state + same memory, called twice → same move both times | CA-A-11 |
| Complex level, same state + same memory, called twice → same move both times | CA-A-12 |
| 20 seeded classic games, complex vs. simple, 10 each as first mover → complex never loses | CA-A-13 |
| `legalMoves(state)` has exactly one element → every level returns it | CA-A-14 |
| Medium level can both win now and block a threat → returns the winning move | CA-A-15 |
| Medium level faces two simultaneous next-turn threats → returns a move blocking exactly one | CA-A-16 |
| `chooseMove`, worst-case position (empty classic board / max-branching continuous position), cold memory, any level → elapsed time < 1000 ms | CA-N-01 |

## Simulating CA-A-13 manually

```js
import { createGame, applyMove } from '../src/engine.js';
import { chooseMove } from '../src/agents.js';

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Play one seeded game; repeat for seeds 1..20, alternating who moves first per CA-A-13.
let state = createGame('classic');
const rng = mulberry32(1);
let complexMemory = {};
let simpleMemory = null;
while (state.result === null) {
  const level = state.turn === 'X' ? 'complex' : 'simple';
  const memory = level === 'complex' ? complexMemory : simpleMemory;
  const options = level === 'simple' ? { random: rng } : undefined;
  const decision = chooseMove(state, level, memory, options);
  if (level === 'complex') complexMemory = decision.memory;
  else simpleMemory = decision.memory;
  state = applyMove(state, { ...decision.move, player: state.turn });
}
console.log(state.result); // must never be simple's mark, across all 20 seeded games
```

This snippet illustrates the pattern the actual `us-a2-simulation.test.js` test automates over
all 20 fixed seeds; it is not itself production code.

## Measuring CA-N-01 manually

```js
import { chooseMove } from '../src/agents.js';

const start = performance.now();
chooseMove(worstCaseState, 'complex', {});
const elapsed = performance.now() - start;
console.log(elapsed, 'ms'); // must be < 1000
```

Run against both worst-case positions (empty classic board; maximum-branching continuous
movement-phase position) with a cold (`{}`) transposition table, per `plan.md`'s Timing Test
Design section.
