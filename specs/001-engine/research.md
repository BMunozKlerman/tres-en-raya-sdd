# Research: Game Engine

**Branch**: `001-engine` | **Date**: 2026-07-26 | **Phase**: 0

## Purpose

Confirm all technology and design decisions before implementation. Because the stack is
fully fixed by constitution P1 and P2 (see `CLAUDE.md`), there are no open unknowns.
This document records what was evaluated and why no NEEDS CLARIFICATION remains.

## Decisions

### D-R-01 — JavaScript Module Format

**Decision**: ES modules (`import`/`export`, `.js` extension).  
**Rationale**: Mandated by P1 (Vite + vanilla JS). Vite's default is ESM; Vitest 1.x
supports ESM natively. CommonJS (`require`) is excluded.  
**Alternatives considered**: CommonJS — rejected (P1 violation).

### D-R-02 — Testing Framework

**Decision**: Vitest 1.x, `environment: 'node'`.  
**Rationale**: Mandated by P1. The engine has no DOM dependency (P2), so `jsdom` is
not needed and must not be used for this feature. Browser environment is deferred to
`003-interface`.  
**Alternatives considered**: Jest — rejected (P1 violation, different config format).

### D-R-03 — Engine API Style

**Decision**: Pure functions — `legalMoves(state)` and `applyMove(state, move)`.  
**Rationale**: Mandated by P2 (immutable state, no side effects). No class, no singleton,
no closure-based hidden state. Every call receives the full state and returns either a new
state or a structured error object.  
**Alternatives considered**: Class-based engine — rejected (P2 violation; hidden mutable
state breaks immutability contract).

### D-R-04 — Error Shape

**Decision**: `{error: true, reason: string}` returned from `applyMove` on illegal moves.
State object is never returned for illegal moves.  
**Rationale**: Caller can discriminate with `if (result.error)`. One shape for errors,
one shape for success — no exceptions thrown, no null returns.  
**Alternatives considered**: Thrown exceptions — rejected (forces try/catch at every call
site, complicates agent code); null return — rejected (cannot carry reason).

### D-R-05 — Winning Lines Representation

**Decision**: A constant array of 8 triples (cell index triplets), defined once in
`src/engine.js` and used by both `applyMove` and `legalMoves`.  
**Rationale**: Hard-coding is safe (board size is fixed at 3×3 per spec Out of Scope);
avoids runtime generation; makes CA-M-12 test trivial to write.  
**Alternatives considered**: Computed from board size — rejected (speculative, YAGNI;
board size is explicitly out of scope).

### D-R-06 — Traceability Verifier Dependencies

**Decision**: Only Node.js built-ins: `node:fs`, `node:path`, `node:child_process`.  
**Rationale**: The verifier runs before `npm install` is trustworthy; built-ins are always
available. P1 prohibits runtime dependencies.  
**Alternatives considered**: `glob` package — rejected (P1 violation).

## Conclusion

No unknowns remain. All decisions are either mandated by the constitution or derived
directly from the spec. Implementation may begin once `tasks.md` is generated and the
traceability gate is green.
