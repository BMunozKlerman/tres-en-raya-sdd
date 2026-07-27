# Traceability Matrix: Game Interface

**Branch**: `main` (003-interface) | **Date**: 2026-07-27

This matrix links every acceptance criterion to the task that covers it, the test that
verifies it, and the commit that delivers it. SHAs are filled in during implementation.
Do not invent SHAs — leave as `—` until the real commit exists.

Run `npm run verify:traceability` to check that no CA-ID is orphaned. It derives this feature's
test directory from the feature folder name (`003-interface` → `tests/interface/`).

**Task column**: filled in after `/speckit-tasks` generates `tasks.md`. Currently `—` for every
row — this skeleton is a `/speckit-plan` output, before task generation.

---

| CA-ID | Task | Test file | `describe`/`it` label | Commit SHA |
|-------|------|-----------|------------------------|------------|
| CA-I-01 | — | us-i1-configuration.test.js | `CA-I-01 — configuration controls displayed` | — |
| CA-I-02 | — | us-i1-configuration.test.js | `CA-I-02 — start transitions CONFIGURATION to IN_GAME` | — |
| CA-I-03 | — | us-i2-state-feedback.test.js | `CA-I-03 — turn indicator` | — |
| CA-I-04 | — | us-i2-state-feedback.test.js | `CA-I-04 — winning line highlighted, moves blocked` | — |
| CA-I-05 | — | us-i2-state-feedback.test.js | `CA-I-05 — illegal move rejected with reason` | — |
| CA-I-06 | — | us-i2-waiting-state.test.js | `CA-I-06 — waiting state shown, board disabled` | — |
| CA-I-07 | — | us-i2-state-feedback.test.js | `CA-I-07 — movement-phase legal marks and destinations indicated` | — |
| CA-I-08 | — | us-i2-state-feedback.test.js | `CA-I-08 — information conveyed without color alone` | — |
| CA-I-09 | — | us-i2-state-feedback.test.js | `CA-I-09 — resolvedFromMemory indicator` | — |
| CA-I-10 | — | us-i2-waiting-state.test.js | `CA-I-10 — waiting state visible for at least 300ms` | — |
| CA-I-11 | — | us-i2-state-feedback.test.js | `CA-I-11 — draw indicator, moves blocked` | — |
| CA-I-12 | — | us-i2-waiting-state.test.js | `CA-I-12 — IN_GAME to WAITING_FOR_AGENT transition` | — |
| CA-I-13 | — | us-i2-waiting-state.test.js | `CA-I-13 — WAITING_FOR_AGENT to IN_GAME transition after floor elapses` | — |
| CA-I-14 | — | us-i3-scoreboard.test.js | `CA-I-14 — win increments scoreboard` | — |
| CA-I-15 | — | us-i3-scoreboard.test.js | `CA-I-15 — draw increments scoreboard` | — |
| CA-I-16 | — | us-i3-scoreboard.test.js | `CA-I-16 — restart returns to CONFIGURATION, scoreboard preserved` | — |
| CA-I-17 | — | us-i4-keyboard.test.js | `CA-I-17 — focus-visible hook toggles on focus/blur` | — (behavioral half only — see `manual-verification.md` for rendered visibility) |
| CA-I-18 | — | us-i4-keyboard.test.js | `CA-I-18 — arrow keys move cell selection` | — |
| CA-I-19 | — | us-i4-keyboard.test.js | `CA-I-19 — Enter/Space activates like a click` | — |
| CA-I-20 | — | us-i4-keyboard.test.js | `CA-I-20 — turn/result announced without moving focus` | — |
| CA-I-21 | — | edge-cases.test.js | `CA-I-21 — occupied cell rejected` | — |
| CA-I-22 | — | edge-cases.test.js | `CA-I-22 — input ignored during WAITING_FOR_AGENT` | — |
| CA-I-23 | — | edge-cases.test.js | `CA-I-23 — restart during movement phase clears pending selection` | — |
| CA-I-24 | — | edge-cases.test.js | `CA-I-24 — configuration inaccessible outside CONFIGURATION` | — |
| CA-I-25 | — | edge-cases.test.js | `CA-I-25 — own-mark selection highlights destinations` | — |
| CA-I-26 | — | edge-cases.test.js | `CA-I-26 — destination selection applies the move` | — |
| CA-I-27 | — | edge-cases.test.js | `CA-I-27 — reselecting own mark cancels selection` | — |
| CA-I-28 | — | responsive-static.test.js | `CA-I-28 — no fixed pixel widths on layout containers` | — (structural proxy only — see `manual-verification.md`) |
| CA-I-29 | — | responsive-static.test.js | `CA-I-29 — single column below 768px, min-width breakpoint` | — (structural proxy only — see `manual-verification.md`) |
| CA-I-30 | — | responsive-static.test.js | `CA-I-30 — board container is square (aspect-ratio 1/1)` | — (structural proxy only — see `manual-verification.md`) |
| CA-I-31 | — | responsive-static.test.js | `CA-I-31 — interactive controls declare 44x44px minimum` | — (declared-value check — see `research.md` D-I-04 for why this one is closer to direct) |
| CA-I-32 | — | responsive-static.test.js | `CA-I-32 — configuration controls not clipped or overflow-hidden` | — (structural proxy only — see `manual-verification.md`) |
| CA-N-02 | — | non-functional.test.js | `CA-N-02 — fully operable with mouse (click handlers cover every action)` | — |
| CA-N-03 | — | non-functional.test.js | `CA-N-03 — full game completable via keyboard alone` | — |

---

## Notes

- **Task column**: filled in after `/speckit-tasks` generates `tasks.md`.
- **Commit SHA column**: filled in after each `T-NNN` commit is pushed. Use the full
  40-character SHA or the unambiguous short form (≥ 8 chars).
- A CA-ID with any `—` in the SHA column is not yet closed.
- `npm run verify:traceability` checks spec.md, tasks.md, test names, and git log — it
  does not read this file. This matrix is for human audit; the script is the gate.

---

## Test-strategy limitations (documented per constitution P5/P6, no exceptions admitted)

Following the same discipline `specs/001-engine/traceability.md` uses for CA-M-17:

- **CA-I-28, CA-I-29, CA-I-30, CA-I-32**: automated coverage is a *structural CSS proxy*
  (`responsive-static.test.js`, plain Node environment — no jsdom, no real layout engine). It
  proves the stylesheet is *structured* the way a correct mobile-first, fluid, square-board
  layout must be structured (no fixed pixel widths on layout containers, a `min-width: 768px`
  breakpoint and not `max-width`, `aspect-ratio: 1/1` on the board container, no
  `overflow: hidden` + narrow-fixed-width combination on the configuration container). It does
  **not** prove the rendered page is actually free of horizontal scroll, actually square, or
  actually free of clipping at any real viewport — jsdom computes no layout, and no other tool
  was added per the group's explicit decision against Playwright/browser-mode (`research.md`
  D-I-04). The rendered-layout claim is closed only by `manual-verification.md`.
- **CA-I-31**: automated coverage reads the *declared* CSS values (`min-width`/`min-height` on
  every interactive-control selector) — closer to a direct check than the other four, since the
  criterion is itself a literal numeric CSS property assertion, but still not proof of the
  *rendered, computed* size (cascade overrides, inherited `box-sizing`, or a `transform: scale()`
  could still shrink the effective target). `manual-verification.md`'s computed-size check at
  two widths (320×568, 1440×900) is the authoritative closure.
- **CA-I-17**: automated coverage is a genuine *behavioral* test (the `data-focus-visible`
  attribute toggles correctly on `focus`/`blur`) — stronger than the responsive criteria's static
  checks, since it exercises real event handling, not just source-text pattern matching. It does
  not prove the resulting visual indicator is actually perceivable (contrast, size, position);
  `manual-verification.md`'s focus-visibility check at two widths closes that half.

**What every other criterion's automated test proves**: full behavioral coverage — DOM state,
event handling, and state-machine transitions are all real jsdom (or, for `chooseMove`'s
synchronous-timer criteria, fake-timer-driven) assertions, with no manual-verification
counterpart needed.
