# Research: Game Interface

**Branch**: `main` (003-interface) | **Date**: 2026-07-27 | **Phase**: 0

This document resolves every open technical question for `003-interface` before Phase 1 design.
No `NEEDS CLARIFICATION` markers remain in `spec.md`; the decisions below are plan-level
(technique, module layout, test environment), not spec-level (observable behavior).

---

## D-I-01 — Module structure inside the UI layer

**Decision**: Split the UI layer into three internal modules under `src/ui/`, with `src/ui.js`
as the single entry point Vite's `index.html` loads:

- `src/ui/app-state.js` — owns the composed application state (UI state machine, configuration
  draft, session scoreboard, movement selection, last agent decision, pending agent move). Pure
  functions: given a state and an event, returns a new state. No DOM access.
- `src/ui/render.js` — pure(-ish) functions that read the composed state and update the DOM
  (board cells, turn indicator, waiting overlay, scoreboard, ARIA live region, focus-visible
  hooks). No event listeners, no calls to `chooseMove`/`applyMove`.
- `src/ui/events.js` — attaches DOM event listeners (click, keydown), translates user input into
  calls to `app-state.js`'s transition functions and to the engine/agent contracts, then triggers
  a re-render.
- `src/ui.js` — bootstraps the three modules on `DOMContentLoaded`. This is the file constitution
  P2 names as "the UI layer"; splitting its internals into `src/ui/*.js` does not change what
  P2 actually constrains (dependency direction `UI → Agents → Engine`, and "MUST NOT reimplement
  any game rule") — it constrains behavior, not physical file count. `001-engine` and
  `002-agents` are single files because each is one pure, cohesive function set; the UI layer
  has three genuinely different reasons to change (state shape, DOM output, input handling), so
  collapsing them into one file would itself violate Single Responsibility.

**Rationale**: Per the user's SOLID mandate, each module gets exactly one reason to change:
`app-state.js` changes when the state machine or scoreboard rules change; `render.js` changes
when what's shown on screen changes; `events.js` changes when an input mapping changes. A bug in
"the waiting overlay doesn't disappear" is now locatable to one file without reading the others.

**Dependency Inversion applied**: `events.js` and `app-state.js` depend only on the *published*
engine/agent contracts (`createGame`, `legalMoves`, `applyMove` from `specs/001-engine/contracts/
engine-api.md`; `chooseMove` from `specs/002-agents/contracts/agents-api.md`) — imported as
plain ES module functions, never on `WINNING_LINES` or any other internal engine/agent detail.
In vanilla JS with no class hierarchy, "depending on an abstraction" means depending on the
contract module's exported function signatures rather than reaching into engine/agent internals;
there is no interface/protocol type to inject, so this is the full extent to which D applies here.

**Liskov Substitution and Interface Segregation do not apply**: neither principle has a subject
in this codebase — there are no class hierarchies (L needs subtypes; ISS needs multiple
client-specific interfaces implemented by a shared type), and constitution P2 already forbids
introducing one (no framework, no OOP layer) for a plain 9-cell board game. This plan commits
only to **S** (Single Responsibility, the three-module split above) and **D** (Dependency
Inversion, consuming published contracts only) — the two SOLID principles that have a real
target in this architecture. Documented here rather than silently ignored, so the omission is a
recorded decision, not an oversight.

**Alternatives considered**: A single `src/ui.js` (matching `CLAUDE.md`'s Contracts section
literally) was rejected because it would force three unrelated concerns (state shape, DOM
output, input handling) to share one file, directly violating the Single Responsibility mandate
for a feature large enough that all three genuinely vary independently (e.g., a future change to
how the waiting overlay renders should never require touching input handling).

---

## D-I-02 — `jsdom` as a new devDependency

**Decision**: Add `jsdom` to `package.json`'s `devDependencies`.

**Justification (per constitution P1's explicit-approval clause)**: `jsdom` is required for
Vitest's `jsdom` test environment, which is the only way to unit-test DOM manipulation, event
handling, and ARIA attributes without a real browser. Node's default Vitest environment has no
`document`/`window`; without `jsdom`, criteria like CA-I-03 (turn/mark indication), CA-I-17
through CA-I-20 (keyboard/focus/ARIA), and CA-I-21–CA-I-27 (click/selection edge cases) could
not be automated at all. `jsdom` ships no runtime code to the shipped application — it is a
test-only tool, consistent with P1's "Only `devDependencies` are permitted: those required for
Vite and Vitest" (Vitest's own documentation names `jsdom` as its reference DOM environment
package). No production dependency is added; `src/*.js` still import nothing beyond native ES
modules the browser provides.

**Alternatives considered and rejected**: `happy-dom` (a lighter jsdom alternative) — rejected
only because `jsdom` is the more widely documented, higher-fidelity option for Vitest and this
project needs no performance optimization at its test-suite size (a few dozen DOM tests).
Playwright / Vitest browser mode — rejected per explicit group instruction (see D-I-03): would
add a browser-automation dependency P1 does not already permit and would require a formal
constitution amendment for a marginal verification gain the manual procedure (D-I-04) already
covers.

---

## D-I-03 — Test environment: single Vitest config, per-file `jsdom` pragma

**Decision**: Keep one `vitest.config.js` at the repo root. Its `test.environment` stays
`'node'` (the default already used by `001-engine`/`002-agents`, which must never see a DOM per
constitution P2). Every UI test file that needs a DOM declares it individually with Vitest's
per-file environment pragma, as the first line of the file:

```js
// @vitest-environment jsdom
```

**Rationale**: This lets `npm test` run engine, agent, and interface suites together with one
command and one config, coexisting without cross-contamination: `tests/engine/**` and
`tests/agents/**` never instantiate a DOM (proving P2's "MUST NOT access the DOM" for those two
layers is still upheld at the test level, not just by convention), while `tests/interface/**`
opts in per file. No new npm script, no separate Vitest project/workspace config, no new
CLI flag to remember — `npm test` remains the single entry point `CLAUDE.md`'s "3 steps or
fewer" README requirement already relies on.

**Alternatives considered**: A second `vitest.config.jsdom.js` with its own `test` script —
rejected as unnecessary indirection; Vitest's per-file pragma exists precisely to avoid needing
multiple configs for mixed-environment suites in one project. A Vitest "projects" (workspace)
setup — rejected for the same reason: it solves a multi-package monorepo problem this
single-package project does not have.

---

## D-I-04 — Verification strategy for the 6 criteria jsdom cannot fully verify

**Scope**: CA-I-28, CA-I-29, CA-I-30, CA-I-31, CA-I-32 (Responsive Design) require real CSS
layout (`scrollWidth`, computed box geometry, media-query-scoped rendering) that jsdom does not
compute — it parses HTML and CSS but never lays out or paints. CA-I-17 (visible focus indicator)
is borderline: the *behavioral hook* (a class/attribute toggling on focus/blur) is
jsdom-testable; true rendered visibility (contrast, size, position of the focus ring) is not.

**Group decision (per user instruction)**: do NOT add Playwright or Vitest browser mode. Adding
either would introduce a new class of dependency (a browser binary or browser-automation
harness) that P1 does not already permit for "Vite and Vitest" devDependencies, and would require
a formal constitution amendment for six criteria — disproportionate to the gain, especially since
this project's live demo already puts a human in front of the actual rendered page.

**Resolution — two-tier verification, following the same honesty discipline as `001-engine`'s
CA-M-17 test-strategy limitation** (`specs/001-engine/traceability.md` § "CA-M-17 — documented
test-strategy limitation": state plainly what the automated suite proves and what it does not):

1. **Automated tier — static CSS structural assertions** (`tests/interface/responsive-static.
   test.js`, plain Node environment, no DOM): read the raw source text of `src/styles.css` and
   assert *structural* properties that a correct mobile-first, fluid, touch-ready stylesheet must
   have, per each criterion:
   - **CA-I-28** (no horizontal scroll 320–1440px): assert no rule for a top-level layout
     container (`.app`, `.board`, `.config-panel`, `.scoreboard`) sets a fixed pixel `width`;
     only `%`, `vw`, `rem`, or `max-width` combined with `width: 100%` are present. A fixed pixel
     width wider than 320px is the single most common cause of horizontal scroll, so its absence
     is a meaningful (if not sufficient) proxy.
   - **CA-I-29** (single column below 768px): assert the base (non-media-query) rule for the
     layout container uses `display: flex; flex-direction: column` (or `grid-template-columns:
     1fr`), and that any multi-column rule (`grid-template-columns` with more than one track, or
     `flex-direction: row`) for that container exists only inside a `@media (min-width: 768px)`
     block — proving the D10 breakpoint is expressed as `min-width` (mobile-first), never
     `max-width`.
   - **CA-I-30** (square board): assert the board container's rule declares
     `aspect-ratio: 1 / 1` and a relative `width`/`max-width` (not a fixed pixel value).
   - **CA-I-31** (44×44px touch targets): assert every interactive-control selector (`button`,
     `.cell`, `select`, `.mark-choice`) has `min-width: 44px` and `min-height: 44px` (or larger)
     declared, at every breakpoint that redeclares dimensions for it.
   - **CA-I-32** (config controls reachable at 320px): assert the configuration container has no
     `overflow: hidden` paired with a fixed width narrower than its content's declared minimum,
     and no `white-space: nowrap` on any control that could force it outside the viewport.

   **Honest limitation, stated up front and repeated in `traceability.md`**: these assertions
   prove the stylesheet is *structured* the way a correct responsive, touch-ready layout must be
   structured (mobile-first base rules, `min-width` breakpoints, relative sizing, explicit touch
   dimensions). They do **not** prove the rendered page is actually free of horizontal scroll,
   actually square, or actually free of clipping at any real viewport — that requires computing
   layout, which jsdom cannot do. A stylesheet could pass every structural assertion here and
   still render incorrectly if some other, unexamined rule overrides it (e.g., a later cascade
   rule re-widening an element). This is the same class of gap CA-M-17's traceability note
   documents for its 3-sample test: the automated suite proves a necessary condition, not the
   full claim.
   - **CA-I-31 specifically** — asserting the declared CSS values *does* count as a genuine,
     if partial, automated check: unlike CA-I-28/29/30/32 (which check the absence of a known
     failure mode), CA-I-31's criterion is itself a literal numeric CSS property assertion
     (`min-width: 44px` / `min-height: 44px`), so reading the declared value is checking exactly
     the thing the criterion asks for, modulo cascade override risk. It is still not proof of the
     *rendered, computed* size (a later rule, an inherited `box-sizing` change, or a `transform:
     scale()` could still shrink the effective target), so the manual procedure below remains the
     authoritative check — but this one criterion's automated coverage is closer to direct than
     the other four's absence-of-antipattern checks.

2. **Manual tier — authoritative, documented procedure** (`specs/003-interface/
   manual-verification.md`, created alongside this plan): exact viewport widths to check, what
   to observe at each, and where the result is recorded. See that file for the full procedure.
   This tier is what actually closes CA-I-17 (rendered visibility half), CA-I-28, CA-I-29,
   CA-I-30, CA-I-31 (rendered size), and CA-I-32.

**Traceability note**: per constitution P5/P6 (NON-NEGOTIABLE, no exceptions admitted), every
`CA-*` criterion still needs at least one automated test whose name contains its `CA-ID`. The
static CSS tests above satisfy this literally for CA-I-28–CA-I-32 — each gets a real, named,
mechanically-run assertion — while `traceability.md` and this document record, in the same
place `CA-M-17`'s limitation is recorded, that automated coverage here is partial and the manual
procedure is what closes the full claim. CA-I-17 additionally gets a real jsdom behavioral test
(the focus/blur attribute-toggle hook — see D-I-08) that is a stronger, non-static-only check.

---

## D-I-05 — 300ms minimum waiting state (CA-I-10) given a synchronous `chooseMove`

**Problem**: `chooseMove` (`specs/002-agents/contracts/agents-api.md`) is synchronous and can
resolve in single-digit milliseconds (complex level, cache hit). CA-I-10 requires the
`WAITING_FOR_AGENT` state to stay visible at least 300ms regardless.

**Decision**: On the agent's turn, `events.js`:
1. Transitions to `WAITING_FOR_AGENT` and disables the board (CA-I-06, CA-I-12) — synchronously,
   immediately.
2. Calls `chooseMove(...)` synchronously to obtain the `Decision` (the move is already known at
   this point; it is simply not yet applied).
3. Starts a `setTimeout(..., 300)`. Only when that timer fires does `events.js` apply the move
   via `applyMove`, update `app-state.js`, and transition back to `IN_GAME` (CA-I-13).

This means the 300ms is spent holding an *already-computed* move, not waiting for the computation
— the computation and the minimum-visibility floor are decoupled, so CA-I-10 holds even when
`chooseMove` takes 0ms, and CA-N-01's 1000ms budget is never at risk of being confused with
CA-I-10's 300ms floor (they measure different things: one bounds computation, the other bounds
display).

**Test approach**: `tests/interface/us-i2-waiting-state.test.js` uses Vitest's fake timers
(`vi.useFakeTimers()`):
- Trigger the agent's turn; assert the UI state is `WAITING_FOR_AGENT` and the board is disabled
  immediately after the synchronous `chooseMove` call returns (CA-I-06, CA-I-12) — proving the
  wait is not incidentally caused by the computation itself.
- Advance fake time by 299ms; assert the UI state is still `WAITING_FOR_AGENT`, the move has not
  been applied yet, and the board is still disabled (CA-I-10's lower bound — this is the
  assertion that actually distinguishes "a floor exists" from "it happened to be slow").
- Advance fake time to 300ms total; assert the UI state has transitioned to `IN_GAME` and the
  engine state reflects the agent's move (CA-I-13).

No real wall-clock wait ever occurs in the test (`vi.useFakeTimers()` + `vi.advanceTimersByTime`),
keeping the suite fast and deterministic per `CLAUDE.md`'s TDD rules ("Tests must be fast,
isolated, and deterministic").

---

## D-I-06 — Rendering `state.winningLine` and surfacing `resolvedFromMemory`

**Winning line** (CA-I-04): `render.js` reads `engineState.winningLine` (`specs/001-engine/
data-model.md`, amended). When non-null, it applies a CSS class (e.g. `cell--winning`) to the
DOM nodes at those three indices *and* renders a text/icon marker on them (constitution's global
"never color alone" rule and CA-I-08), and `events.js` refuses further placement/movement input
once `engineState.result !== null` (shared with CA-I-11's draw case and CA-I-22's edge case).
No `WINNING_LINES` constant is duplicated in the UI layer — the three indices come from the
engine's own computation, per the Clarifications' resolution of BUG-007.

**`resolvedFromMemory`** (CA-I-09): every `chooseMove` call's returned `Decision` is stored as
`app-state.js`'s `lastDecision`. `render.js` reads `lastDecision.resolvedFromMemory`; when `true`,
it shows a small indicator (e.g., a "memoria" badge in the status line) for that turn. Because
`lastDecision` is overwritten on the *next* agent turn, the indicator naturally reflects only the
most recent decision — no additional state is needed to "clear" it. Tested by asserting the
indicator's presence/absence across two `chooseMove` calls in the same session with
`resolvedFromMemory: true` then `false` (mirrors `002-agents`'s CA-A-10 evidence pattern).

---

## D-I-07 — Responsive CSS technique

**Decision**: `src/styles.css`, mobile-first:
- Base rules (no media query) target 320px: layout container is `display: flex; flex-direction:
  column`; all widths are `%`/`max-width` combined with `width: 100%`, never a fixed pixel value
  (global CLAUDE.md "Fluidity over Fixedness" rule).
- One breakpoint, `@media (min-width: 768px)` (D10): switches the layout container to a
  multi-column arrangement (e.g., `grid-template-columns: minmax(0,1fr) minmax(0,2fr)`, board in
  the larger column, configuration/scoreboard in the smaller one) — a `min-width` query only, per
  the global "Bottom-Up Rule" (never `max-width` without explicit justification, and none is
  needed here: there is exactly one breakpoint).
- Board stays square via `aspect-ratio: 1 / 1` on its container, with `width: min(90vw, 480px)` (a
  relative cap, not a fixed width) so it shrinks on narrow viewports and stops growing past a
  comfortable size on wide ones, satisfying CA-I-30 at every width including 320×568.
- Every interactive control (board cells, configuration selects, restart button, movement-phase
  selection targets) declares `min-width: 44px; min-height: 44px` at every breakpoint that
  resizes it, satisfying CA-I-31 and the global "Touch-Ready by Default" rule from first render.

---

## D-I-08 — Keyboard operation and assistive-technology announcement testing

**Decision**:
- **CA-I-17** (focus indicator): `render.js` attaches `focus`/`blur` listeners to every
  interactive control that toggle a `data-focus-visible` attribute (or CSS class). The jsdom test
  (`tests/interface/us-i4-keyboard.test.js`) calls `element.focus()`, asserts the attribute is
  present; calls `element.blur()`, asserts it is removed. This is a genuine behavioral test (the
  hook the CSS relies on to render a visible outline actually fires), not a static check — but it
  does not prove the *rendered* outline is visually perceivable (contrast, size), which the
  manual procedure (D-I-04) covers.
- **CA-I-18** (arrow-key cell navigation): dispatch a `keydown` event with `key: 'ArrowRight'`
  (etc.) on the focused board cell; assert `document.activeElement` becomes the adjacent cell's
  DOM node, per the row-major layout (`specs/001-engine/data-model.md`'s cell indexing).
- **CA-I-19** (Enter/Space activates like a click): dispatch `keydown` with `key: 'Enter'` (and
  separately `key: ' '`) on a focused, legal cell; assert the resulting `engineState` is identical
  to what a `click` event on the same cell would produce (same `applyMove` call, same board).
- **CA-I-20** (announcement without moving focus): assert an ARIA live region
  (`role="status"` / `aria-live="polite"`) exists once at startup; after a move changes the turn
  or reaches a result, assert its `textContent` changed to describe the new turn/result, and that
  `document.activeElement` is unchanged from before the move (proving focus did not move).

All four are fully jsdom-testable: they depend only on DOM event dispatch, `document.
activeElement`, and attribute/text-content reads — none require real layout or paint.
