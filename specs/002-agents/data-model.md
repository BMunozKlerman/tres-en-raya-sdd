# Data Model: Game Agents

**Branch**: `002-agents` | **Date**: 2026-07-27 | **Phase**: 1

All shapes below are plain JavaScript objects — no classes, no inheritance. `State` and
`Move` are defined in `specs/001-engine/data-model.md` and are consumed unchanged; they are
not redefined here.

---

## AgentLevel

```js
'simple' | 'medium' | 'complex'
```

Selects both the resolution rule and the memory rule (RF-2). Passed as `chooseMove`'s second
argument; any other value is undefined behavior (no CA-ID covers it, same convention as the
engine's `createGame(mode)`).

---

## Decision

The single return value of `chooseMove`, uniform across all three levels.

```js
{
  move:              Move,     // from specs/001-engine/data-model.md; one of legalMoves(state)
  memory:             Memory,   // updated memory — see per-level shapes below
  nodesEvaluated:     number,   // count of positions evaluated during this call, ≥ 0
  resolvedFromMemory: boolean,  // true iff this call reused a cached decision (D7)
}
```

`nodesEvaluated` and `resolvedFromMemory` exist solely to make memory reuse observable (D7,
CA-A-10); they carry no gameplay meaning for `simple` or `medium`, which always return
`resolvedFromMemory: false` (see per-level Memory shapes — neither level reads incoming memory,
so nothing is ever "resolved from" it).

---

## Memory (per level)

`memory` is opaque to the caller and level-scoped: a value produced for one level MUST NOT be
passed to `chooseMove` for a different level. The caller threads it between calls; `agents.js`
stores nothing internally (Assumptions, `spec.md`).

### Simple — `SimpleMemory`

```js
null | unknown   // never read; whatever is passed in is echoed back unchanged in `memory'`
```

Unused by design (CA-A-02). `chooseMove` for `simple` never inspects this value.

### Medium — `MediumMemory`

```js
null   // always returned; incoming value is always discarded, never inspected
```

Memoryless by design (CA-A-06, narrowed by option C — see `spec.md` Clarifications and
`CLAUDE.md` session log). The win-this-turn / block-next-turn rule needs no history to decide,
so RF-2's "memory limited to the game in progress" capability is satisfied by boundedness, not
by use — a decision of absence of behavior, the same pattern as 001-engine's D2.

### Complex — `ComplexMemory` (transposition table)

```js
{
  [positionKey: string]: TranspositionEntry
}
```

```js
// TranspositionEntry
{
  move:  Move,    // the resolved best move for this position
  value: number,  // minimax value at the resolution
  depth: number,  // search depth reached when this entry was written
}
```

`positionKey` is the canonical string `` `${mode}|${phase}|${turn}|${board.join('')}` ``, with
`null` board cells rendered as `'_'` (e.g. `"classic|placement|X|XO_______"`). `piecesPlaced` is
deliberately excluded: it is fully determined by `board` plus `phase`, so including it would
create redundant keys for the same logical position (D-R-06, `research.md`).

An entry is a cache **hit** for a given call when a key match exists at `depth ≥` the depth that
call would otherwise search to. On a hit, `resolvedFromMemory = true` and the cached `move` is
returned unchanged. On a miss, the level searches as normal, counts every node visited into
`nodesEvaluated`, and writes (or overwrites, if the new search is deeper) the entry before
returning — guaranteeing CA-A-10's "less computation the second time" for any position revisited
within the same session, including across games (D6).

`ComplexMemory` grows across games within a session and is discarded when the session ends
(page reload) — a caller-side property (the caller simply stops holding the object); `agents.js`
does not persist anything itself (D6).

---

## Search Horizon

```js
const HORIZON_DEPTH = 6;   // plies; see research.md D-R-05 for the calibration procedure
```

A module-level constant in `src/agents.js`, not part of the public contract. Applied only to
the complex level's continuous-mode search (CA-A-09); classic-mode search always runs to a
terminal state regardless of this constant (CA-A-08).

---

## Static Evaluation Score (horizon cutoff only)

Used internally by the complex level's alpha-beta search when a continuous-mode search reaches
`HORIZON_DEPTH` without a terminal state. Not observable through any public contract; no CA-ID
names it.

```js
// For each of the 8 winning lines (specs/001-engine/data-model.md WINNING_LINES):
//   +1 if the line has ≥1 own mark and 0 opponent marks
//   -1 if the line has ≥1 opponent mark and 0 own marks
//    0 otherwise (mixed or empty line)
// score = sum over all 8 lines
```

Terminal values used at actual terminal nodes (not the horizon cutoff) are fixed sentinels:
`WIN_SCORE = 1000`, `LOSS_SCORE = -1000`, distinct in magnitude from any possible heuristic sum
(±8) so terminal outcomes always dominate minimax comparisons regardless of search depth.

---

## Random Source (simple level only)

```js
// options parameter, 4th and optional argument to chooseMove
{ random?: () => number }   // returns a float in [0, 1); defaults to Math.random
```

Not part of `Decision` or `Memory` — a call-scoped injection seam (D-R-01, `research.md`),
consumed only by the simple level to pick uniformly among `legalMoves(state)`:
`legalMoves(state)[Math.floor(random() * legalMoves(state).length)]`.
