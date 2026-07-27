# Manual Verification Procedure

**Feature**: `003-interface` | **Date**: 2026-07-27

Seven criteria cannot be fully verified by the automated suite because they require real CSS
layout (a layout/paint engine jsdom does not have) or true rendered visibility: **CA-I-17**
(visible focus — rendered-visibility half only; the behavioral hook is automated, see
`research.md` D-I-08), **CA-I-28**, **CA-I-29**, **CA-I-30**, **CA-I-31** (rendered-size half
only; the declared-CSS-value half is automated, see `research.md` D-I-04), **CA-I-32**,
**CA-I-36** (added 2026-07-27, Amendment BUG-014 — same rendered-size-vs-declared-value gap as
CA-I-31, since the criterion is a `max-width` declaration whose actual rendered effect a
transform or a cascade override could still defeat).

This procedure is the authoritative closure for the rendered-layout half of those criteria,
parallel to how `specs/001-engine/traceability.md`'s CA-M-17 note documents what its automated
suite proves versus what it does not. Run it once per `003-interface` implementation cycle that
touches `src/styles.css` or `src/ui/render.js`'s DOM structure, and before the feature is
reported complete in `CLAUDE.md`.

## How to run

```
npm run dev
```

Open the printed local URL in **Google Chrome (stable channel), browser zoom reset to 100%**
(`Ctrl/Cmd+0`) — not a component preview, not a different browser, and not an arbitrary zoom
level, since both change effective CSS pixel sizes and can make the same build pass for one
tester and fail for another. Use Chrome DevTools' device-toolbar / responsive-mode viewport
resizing (exact CSS pixel widths, not a physical device) to hit each width below exactly.

## Checklist

Record one row per width in the Results Log below. For each width, load a fresh game (through
`CONFIGURATION`) and check every item.

| Width × Height | What to check | Criteria |
|-----------------|----------------|----------|
| 320 × 568 | No horizontal scrollbar appears at any point (configuration, in-game, finished). Board renders as a visible square (not clipped, not stretched into a rectangle). All four configuration controls and the start button are visible and reachable without scrolling horizontally. | CA-I-28, CA-I-30, CA-I-32 |
| 375 × 667 | Same three checks as above, plus: layout is single-column (config, board, scoreboard stacked vertically, in that order or another single-column order — not side-by-side). | CA-I-28, CA-I-29, CA-I-30 |
| 767 × 1024 | Layout is still single-column (last width below the D10 breakpoint). No horizontal scroll. | CA-I-28, CA-I-29 |
| 768 × 1024 | Layout switches to the wider arrangement (board and configuration/scoreboard no longer stacked in a single column). No horizontal scroll. Board remains square. | CA-I-28, CA-I-29, CA-I-30 |
| 1024 × 768 | No horizontal scroll. Board remains square and does not grow unreasonably large. | CA-I-28, CA-I-30 |
| 1440 × 900 | No horizontal scroll. Board remains square, fully visible. | CA-I-28, CA-I-30 |

**Action-control width (CA-I-36)** — at 768×1024, 1024×768, and 1440×900: using the browser's
element inspector, select the start button (if still in `CONFIGURATION`) and the restart button.
Confirm the computed (rendered) width of each is at most 480px, matching or narrower than the
board's own rendered width at that viewport. Record any control that exceeds it.

**Touch targets (CA-I-31)** — at 320×568 and at 1440×900: using the browser's element inspector,
select each of: a board cell, a configuration control, the start/restart button. Confirm the
computed (rendered) box is at least 44×44 CSS pixels at both widths. Record any control that
fails at either width.

**Focus visibility (CA-I-17)** — at 375×667 and at 1440×900: using Tab (and Shift+Tab), move
focus through every control (configuration, board cells once in a game, restart). At each stop,
using Chrome DevTools' contrast-checking tool (element picker → the "Contrast" row in the Styles
pane, or the Accessibility pane's "Contrast" panel) or an equivalent external contrast checker,
confirm the focus indicator meets **WCAG 2.2 Success Criterion 2.4.11 (Focus Appearance)**: a
contrast ratio of at least **3:1** between the indicator's pixels and the pixels of the adjacent,
unfocused control, across an area equivalent to a **2 CSS px** perimeter outline around the
control's border (or a solid indicator area of at least the same size). Record the measured ratio
per control, not just pass/fail — a control at exactly the threshold is a different result from
one well above it.

## Results Log

Append one entry per run. Do not overwrite prior entries — this is a running log, same
discipline as `docs/bugs.md`.

```
### <date>, tester: <name>

Commit under test: <SHA>

| Width | CA-I-28 | CA-I-29 | CA-I-30 | CA-I-31 | CA-I-32 | CA-I-36 |
|-------|---------|---------|---------|---------|---------|---------|
| 320×568   | pass/fail | n/a | pass/fail | pass/fail | pass/fail | n/a |
| 375×667   | pass/fail | pass/fail | pass/fail | n/a | n/a | n/a |
| 767×1024  | pass/fail | pass/fail | n/a | n/a | n/a | n/a |
| 768×1024  | pass/fail | pass/fail | pass/fail | n/a | n/a | pass/fail |
| 1024×768  | pass/fail | n/a | pass/fail | n/a | n/a | pass/fail |
| 1440×900  | pass/fail | n/a | pass/fail | pass/fail | n/a | pass/fail |

Focus visibility (CA-I-17): pass/fail, measured contrast ratio per control (must be ≥ 3:1 per
WCAG 2.2 SC 2.4.11): ...

Failures found: <describe, or "none">
```

No entries yet — this procedure is created by `/speckit-plan`; the first run happens once
`/speckit-implement` has produced a renderable UI (after the tasks covering `src/ui/render.js`
and `src/styles.css`).
