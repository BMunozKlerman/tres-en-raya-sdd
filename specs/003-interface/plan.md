# Implementation Plan: Game Interface

**Branch**: `main` (003-interface has no dedicated git branch — same group decision as
`002-agents`; see `CLAUDE.md` session log, 2026-07-27) | **Date**: 2026-07-27 | **Spec**:
`specs/003-interface/spec.md`

**Input**: Feature specification from `specs/003-interface/spec.md`

## Summary

A vanilla-JS, mobile-first web UI that plays tic-tac-toe by consuming `specs/001-engine`'s
`createGame`/`legalMoves`/`applyMove` and `specs/002-agents`'s `chooseMove` exactly as published
— no rule is reimplemented in the UI layer. The UI layer is split into three internal modules
(`app-state.js`, `render.js`, `events.js`, bootstrapped by `src/ui.js`) so each has a single
reason to change, per the user's SOLID mandate; the two SOLID principles that have a real target
in this architecture (Single Responsibility, Dependency Inversion) are applied explicitly, and
Liskov Substitution / Interface Segregation are recorded as not applicable (no class hierarchy
exists or is introduced). Responsive layout is mobile-first with one `min-width: 768px`
breakpoint (D10) and a square board via `aspect-ratio`. Testing adds `jsdom` as a devDependency
— a documented exception to constitution P1 (see Complexity Tracking) — with a per-file
`// @vitest-environment jsdom` pragma, keeping
`001-engine`/`002-agents`'s `node`-environment purity untouched in the same `vitest.config.js`.
Six criteria (CA-I-17 partially, CA-I-28–CA-I-32) cannot be fully verified without a real layout
engine; per explicit group instruction, no Playwright/browser-mode dependency is added — instead
a documented manual verification procedure (`manual-verification.md`) closes those criteria,
alongside a partial, honestly-limited automated proxy (structural CSS assertions, `research.md`
D-I-04), following the same disclosure discipline `001-engine`'s CA-M-17 note established.

## Technical Context

**Language/Version**: JavaScript (ES modules), same as `001-engine`/`002-agents`. No transpiler.

**Primary Dependencies**: None at runtime (constitution P1). New devDependency: `jsdom` (Vitest's
DOM test environment — see `research.md` D-I-02 for the P1 justification). Existing
devDependencies (`vite`, `vitest`) unchanged.

**Storage**: N/A — no persistence across page reloads (spec.md Out of Scope); all state
(scoreboard, agent memory, configuration) lives in memory for the browser tab's session.

**Testing**: Vitest, single `vitest.config.js`. Engine/agent suites keep the default `node`
environment; interface suites opt into `jsdom` per file via the `// @vitest-environment jsdom`
pragma (`research.md` D-I-03). Test files live under `tests/interface/`, matched by
`scripts/verify-traceability.mjs`'s existing `NNN-name → tests/<name>` derivation
(`003-interface` → `interface`) with no script change needed.

**Target Platform**: Any evergreen desktop or mobile browser (via Vite's dev server / static
build); no Node-only or server-side execution of `src/ui.js`.

**Project Type**: Single-page web application (no separate backend/frontend split — the whole
repo is the frontend; engine/agents are pure logic modules the UI imports directly).

**Performance Goals**: Inherits CA-N-01 (agent response under 1000ms) from `002-agents`,
unaffected by this feature. New goal specific to this feature: CA-I-10's 300ms minimum
waiting-state floor, decoupled from computation time (`research.md` D-I-05).

**Constraints**: No horizontal scroll 320px–1440px (CA-I-28); 44×44px minimum touch targets
(CA-I-31); one fixed breakpoint at 768px (D10, CA-I-29); no new runtime dependency (P1); no
browser-automation test dependency (group decision, `research.md` D-I-04).

**Scale/Scope**: 4 user stories, 32 `CA-I-nn` criteria + `CA-N-02`/`CA-N-03`, one board (9
cells), one session's worth of state — no multi-page routing, no server, no persistence layer.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design below.*

| Principle | Check | Result |
|-----------|-------|--------|
| P1 · Fixed Stack | Vite + vanilla JS + Vitest only; no UI framework introduced. `jsdom` added as a devDependency — P1 literally permits only devDependencies "required for Vite and Vitest," and `jsdom` is required for Vitest's `jsdom` *test* environment, not for Vite or Vitest's core itself, so it is treated as an exception rather than assumed to fit the letter of the rule. Documented and justified below in Complexity Tracking, per P1's own clause ("Any proposal to add a dependency requires explicit group approval and documentation in the `plan.md` of the relevant feature with a technical justification"). No other dependency proposed. | ⚠️ Pass with documented exception (see Complexity Tracking) |
| P2 · Pure Layered Architecture | `src/ui/*.js` (bootstrapped by `src/ui.js`) depends only on the published `engine-api.md`/`agents-api.md` contracts; never imports or duplicates `WINNING_LINES` or any engine/agent internal. Dependency direction `UI → Agents → Engine` preserved. `applyMove`'s immutability is relied upon, not reimplemented. | ✅ Pass |
| P3 · Spec as Source of Truth | This plan is derived from `spec.md`'s 32 `CA-I-nn` + `CA-N-02`/`CA-N-03`, all already `✅ ready` (CA-I-04's engine dependency, BUG-007, is closed — see spec.md's Amendments-adjacent status row). No behavioral change proposed beyond what `spec.md` already specifies. | ✅ Pass |
| P4 · EARS Requirements | Unchanged from `spec.md` — this plan introduces no new criteria, only technique. | ✅ Pass (nothing to re-verify here) |
| P5 · Verification Gate | Every criterion gets a RED-before-GREEN automated test named with its `CA-ID` (`research.md`'s file mapping; `traceability.md` skeleton). The 6 layout-dependent criteria still get a named automated test (a structural/behavioral proxy, honestly documented as partial) — P5 is not weakened, since "at least one automated test whose name contains the CA-ID" is literally satisfied for all 34 IDs; see `research.md` D-I-04 for the full reasoning. | ✅ Pass |
| P6 · Traceability | `specs/003-interface/traceability.md` created (this plan) with the full 34-row skeleton, planned test file, and `describe` label per `CA-ID`. `scripts/verify-traceability.mjs` needs no change: it already derives `tests/interface/` from the `003-interface` folder name generically (fixed by BUG-006 during `002-agents`). | ✅ Pass |
| P7 · Spec-First Debugging | N/A at plan stage — no bug to fix yet. Process is inherited unchanged for this feature's implementation. | ✅ Pass (not yet exercised) |
| P8 · Human Review | N/A at plan stage — applies at task closure (`/speckit-implement`). | ✅ Pass (not yet exercised) |
| P9 · Non-Functional Requirements | CA-N-02 (mouse-operable) and CA-N-03 (keyboard-operable) both have planned tests (`non-functional.test.js`) before this feature can close. | ✅ Pass |

One documented exception (P1, the `jsdom` devDependency) is recorded in Complexity Tracking
below, per P1's own explicit-approval clause. No other principle is exempted; P4–P7 (the four
absolute non-negotiables per Governance § Exceptions) are unaffected — this exception concerns
only P1, which permits exceptions.

## Project Structure

### Documentation (this feature)

```text
specs/003-interface/
├── plan.md                  # This file (/speckit-plan command output)
├── research.md              # Phase 0 output — D-I-01..D-I-08 decisions
├── data-model.md            # Phase 1 output — AppState, ConfigurationDraft, Scoreboard, etc.
├── contracts/
│   ├── app-state-api.md     # Phase 1 output — src/ui/app-state.js public surface
│   └── dom-contract.md      # Phase 1 output — data-*/ARIA attributes render.js guarantees
├── quickstart.md            # Phase 1 output — run/validate guide
├── manual-verification.md   # Phase 1 output — authoritative procedure for the 6 layout criteria
├── traceability.md          # Phase 1 output — CA-ID → planned test file/describe skeleton
└── tasks.md                 # Phase 2 output (/speckit-tasks — NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── engine.js       # 001-engine — unchanged by this feature
├── agents.js       # 002-agents — unchanged by this feature
├── ui.js           # NEW — bootstraps the three modules below on DOMContentLoaded
├── ui/
│   ├── app-state.js  # NEW — UI state machine + scoreboard + config draft (contracts/app-state-api.md)
│   ├── render.js     # NEW — DOM output only (contracts/dom-contract.md)
│   └── events.js     # NEW — DOM event wiring; calls engine/agent contracts + app-state.js
└── styles.css        # NEW — mobile-first, one min-width:768px breakpoint (research.md D-I-07)

index.html            # NEW — Vite entry point, loads src/ui.js and src/styles.css

tests/
├── engine/            # 001-engine — unchanged
├── agents/            # 002-agents — unchanged
└── interface/         # NEW
    ├── us-i1-configuration.test.js
    ├── us-i2-state-feedback.test.js
    ├── us-i2-waiting-state.test.js
    ├── us-i3-scoreboard.test.js
    ├── us-i4-keyboard.test.js
    ├── edge-cases.test.js
    ├── responsive-static.test.js
    └── non-functional.test.js
```

**Structure Decision**: Single-project layout (no separate frontend/backend split — this is a
static, dependency-free web app). The UI layer is physically split into `src/ui.js` (entry
point) plus `src/ui/*.js` (state, render, events) rather than the single `src/ui.js` file
`CLAUDE.md`'s Contracts section names literally — justified in `research.md` D-I-01 as a Single
Responsibility application, not a deviation from constitution P2's actual constraints (dependency
direction and "no rule reimplementation"), which are unaffected by this split. `tests/interface/`
matches `scripts/verify-traceability.mjs`'s existing generic feature-directory derivation with no
tooling change required.

## Complexity Tracking

*One exception, tracked per constitution P1's explicit-approval clause and Governance §
Exceptions (documented here, in the `plan.md` of the feature requiring it, per that section's
own procedure). P1 is not one of the four absolute non-negotiables (P4/P5/P6/P7 — Governance §
Exceptions bars weakening those), so a documented exception is permitted here.*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| P1 · Fixed Stack — adds `jsdom` as a devDependency, which is not literally "Vite" or "Vitest" itself, only a package Vitest's `jsdom` test environment depends on. | Without a DOM implementation, Vitest's default `node` environment has no `document`/`window`; automating any of CA-I-03, CA-I-05–CA-I-27 (click/keyboard/ARIA/state-feedback behavior) is impossible without one, since they all assert on DOM nodes, attributes, or event dispatch. `jsdom` is Vitest's own documented reference implementation for this. | **No test dependency at all** (verify UI behavior only manually) — rejected: would leave ~27 of 34 criteria with no automated test whatsoever, violating P5/P6 (NON-NEGOTIABLE, no exceptions admitted) far more severely than adding one devDependency violates P1 (which explicitly allows exceptions). **Playwright / Vitest browser mode** — rejected per explicit group instruction (`research.md` D-I-04): adds a heavier browser-automation dependency to solve a problem (DOM assertions) `jsdom` already solves without one; reserved, and still rejected, for the 6 layout-dependent criteria that `jsdom` genuinely cannot help with. `jsdom` ships no code to the built application — it is a test-only devDependency, the smallest exception that keeps P5/P6 intact. |
