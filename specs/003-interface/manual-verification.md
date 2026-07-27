# Manual Verification Procedure

**Feature**: `003-interface` | **Date**: 2026-07-27

Six criteria cannot be fully verified by the automated suite because they require real CSS
layout (a layout/paint engine jsdom does not have) or true rendered visibility: **CA-I-17**
(visible focus — rendered-visibility half only; the behavioral hook is automated, see
`research.md` D-I-08), **CA-I-28**, **CA-I-29**, **CA-I-30**, **CA-I-31** (rendered-size half
only; the declared-CSS-value half is automated, see `research.md` D-I-04), **CA-I-32**.

This procedure is the authoritative closure for the rendered-layout half of those criteria,
parallel to how `specs/001-engine/traceability.md`'s CA-M-17 note documents what its automated
suite proves versus what it does not. Run it once per `003-interface` implementation cycle that
touches `src/styles.css` or `src/ui/render.js`'s DOM structure, and before the feature is
reported complete in `CLAUDE.md`.

## How to run

```
npm run dev
```

Open the printed local URL in a real browser (not a component preview). Use the browser's
device-toolbar / responsive-mode viewport resizing (exact CSS pixel widths, not a physical
device) to hit each width below exactly.

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

**Touch targets (CA-I-31)** — at 320×568 and at 1440×900: using the browser's element inspector,
select each of: a board cell, a configuration control, the start/restart button. Confirm the
computed (rendered) box is at least 44×44 CSS pixels at both widths. Record any control that
fails at either width.

**Focus visibility (CA-I-17)** — at 375×667 and at 1440×900: using Tab (and Shift+Tab), move
focus through every control (configuration, board cells once in a game, restart). At each
stop, confirm a focus indicator is visibly perceivable (not just present in the DOM as
`data-focus-visible` — an outline, border, or background change a sighted user would actually
notice).

## Results Log

Append one entry per run. Do not overwrite prior entries — this is a running log, same
discipline as `docs/bugs.md`.

```
### <date>, tester: <name>

Commit under test: <SHA>

| Width | CA-I-28 | CA-I-29 | CA-I-30 | CA-I-31 | CA-I-32 |
|-------|---------|---------|---------|---------|---------|
| 320×568   | pass/fail | n/a | pass/fail | pass/fail | pass/fail |
| 375×667   | pass/fail | pass/fail | pass/fail | n/a | n/a |
| 767×1024  | pass/fail | pass/fail | n/a | n/a | n/a |
| 768×1024  | pass/fail | pass/fail | pass/fail | n/a | n/a |
| 1024×768  | pass/fail | n/a | pass/fail | n/a | n/a |
| 1440×900  | pass/fail | n/a | pass/fail | pass/fail | n/a |

Focus visibility (CA-I-17): pass/fail, notes: ...

Failures found: <describe, or "none">
```

No entries yet — this procedure is created by `/speckit-plan`; the first run happens once
`/speckit-implement` has produced a renderable UI (after the tasks covering `src/ui/render.js`
and `src/styles.css`).
