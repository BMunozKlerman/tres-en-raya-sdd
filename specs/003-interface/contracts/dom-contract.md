# DOM/ARIA Contract

**Module**: `src/ui/render.js`, consumed by `src/ui/events.js` and `tests/interface/*` |
**Date**: 2026-07-27

This is the stable surface `render.js` guarantees exists in the DOM, so that `events.js` (event
wiring) and the test suite (assertions) can depend on it without depending on `render.js`'s
internal implementation. Attribute and class names below are the actual identifiers to be used
in `src/ui/render.js` and referenced verbatim by tests — not illustrative examples.

---

## Board

- `[data-board]` — the board container. `role="grid"`.
- `[data-cell="0"]` … `[data-cell="8"]` — one interactive element per cell (row-major, matching
  `specs/001-engine/data-model.md`'s indexing), each a real `<button>` so it is natively
  focusable and activates on Enter/Space without extra key handling (CA-I-19 is then satisfied
  by the browser's native button behavior for Enter/Space, reducing what `events.js` must
  special-case to arrow-key navigation, CA-I-18).
- `data-cell-state` on each cell: `"empty" | "own" | "opponent"` — text/attribute encoding of
  mark ownership, so information never depends on color alone (CA-I-08) and so cell state is
  assertable without reading rendered color.
- `data-winning="true"` on each of the three cells in `engineState.winningLine`, plus a visible
  text/icon child node (e.g. a "★" marker) — never color alone (CA-I-04, CA-I-08).
- `data-selected="true"` on the currently `movementSelection`-ed cell; `data-destination="true"`
  on its legal destination cells (CA-I-07, CA-I-25).
- `data-focus-visible="true"` toggled by `focus`/`blur` listeners on every interactive control,
  including board cells (CA-I-17 — see `research.md` D-I-08).

## Status region

- `[data-turn-indicator]` — text content always states whose turn it is and their mark
  (CA-I-03).
- `[data-waiting-indicator]` — present (and board cells carry `disabled`) while
  `uiState === 'WAITING_FOR_AGENT'` (CA-I-06, CA-I-22).
- `[data-memory-indicator]` — present only when `lastDecision.resolvedFromMemory === true`
  (CA-I-09).
- `[data-result-indicator]` — text content states the winning mark or "draw" once
  `uiState === 'FINISHED'` (CA-I-04, CA-I-11).
- `[data-error-indicator]` — text content states the rejection reason after an illegal move
  attempt (CA-I-05, CA-I-21); cleared on the next successful action.
- `[role="status"][aria-live="polite"]` (`[data-live-region]`) — the sole assistive-technology
  announcement target; its `textContent` is replaced (not appended) on every turn change and on
  reaching a result (CA-I-20). No other element in the document carries `aria-live`.

## Configuration

- `[data-config-opponent]`, `[data-config-agent-level]`, `[data-config-mark]`,
  `[data-config-mode]` — the four controls CA-I-01 requires; `data-config-agent-level` is only
  rendered (not merely disabled) when opponent type is `"agent"`, since CA-I-01 requires the
  control to appear conditionally, not just to be enabled/disabled.
- `[data-start-button]` — disabled (`disabled` attribute, not merely a CSS class) until all
  required fields are set (CA-I-02).
- All four controls above and `data-start-button` carry `disabled` while
  `uiState !== 'CONFIGURATION'` (CA-I-24).

## Scoreboard

- `[data-score="X"]`, `[data-score="O"]`, `[data-score="draw"]` — text content is the current
  count (CA-I-14, CA-I-15).

## Restart

- `[data-restart-button]` — present and enabled in every `uiState` (CA-I-16, CA-I-23).

---

## Notes

- Every `data-*` attribute above is what tests query by (`element.querySelector('[data-cell=
  "4"]')`, etc.) — never CSS class names or text content matching, so a purely cosmetic CSS
  change never breaks a test (tests verify behavior, not styling).
- `data-cell-state`, `data-winning`, `data-selected`, `data-destination`, `data-focus-visible`,
  and every `disabled` attribute are read directly by the static/behavioral test suite; none of
  them require computed layout, keeping every criterion above (except the six named in
  `research.md` D-I-04) fully jsdom-testable.
