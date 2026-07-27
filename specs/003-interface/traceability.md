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
| CA-I-01 | T-061/T-062 | us-i1-configuration.test.js | `CA-I-01 — configuration controls displayed` | — |
| CA-I-02 | T-061/T-062 | us-i1-configuration.test.js | `CA-I-02 — start transitions CONFIGURATION to IN_GAME` | — |
| CA-I-03 | T-063/T-064 | us-i2-state-feedback.test.js | `CA-I-03 — turn indicator` | — |
| CA-I-04 | T-065/T-066 | us-i2-state-feedback.test.js | `CA-I-04 — winning line highlighted, moves blocked` | — |
| CA-I-05 | T-063/T-064 | us-i2-state-feedback.test.js | `CA-I-05 — illegal move rejected with reason` (includes the `game_over` reason case) | — |
| CA-I-06 | T-075/T-076 | us-i2-waiting-state.test.js | `CA-I-06 — waiting state shown, board disabled` | — |
| CA-I-07 | T-071/T-072 | us-i2-state-feedback.test.js | `CA-I-07 — movement-phase legal marks and destinations indicated` | — |
| CA-I-08 | T-069/T-070 | us-i2-state-feedback.test.js | `CA-I-08 — information conveyed without color alone` | — |
| CA-I-09 | T-079/T-080 (render); T-081/T-082 (integration) | us-i2-state-feedback.test.js | `CA-I-09 — resolvedFromMemory indicator` (T-079/T-080); `CA-I-09 — resolvedFromMemory reflects real cross-game memory reuse` (T-081/T-082) | — |
| CA-I-10 | T-077/T-078 | us-i2-waiting-state.test.js | `CA-I-10 — waiting state visible for at least 300ms` | — |
| CA-I-11 | T-067/T-068 | us-i2-state-feedback.test.js | `CA-I-11 — draw indicator, moves blocked` | — |
| CA-I-12 | T-075/T-076 | us-i2-waiting-state.test.js | `CA-I-12 — IN_GAME to WAITING_FOR_AGENT transition` | — |
| CA-I-13 | T-077/T-078 | us-i2-waiting-state.test.js | `CA-I-13 — WAITING_FOR_AGENT to IN_GAME transition after floor elapses` | — |
| CA-I-14 | T-065/T-066 | us-i3-scoreboard.test.js | `CA-I-14 — win increments scoreboard` | — |
| CA-I-15 | T-067/T-068 | us-i3-scoreboard.test.js | `CA-I-15 — draw increments scoreboard` | — |
| CA-I-16 | T-083/T-084 | us-i3-scoreboard.test.js | `CA-I-16 — restart returns to CONFIGURATION, scoreboard preserved` | — |
| CA-I-17 | T-085/T-086 | us-i4-keyboard.test.js | `CA-I-17 — focus-visible hook toggles on focus/blur` | — (behavioral half only — see `manual-verification.md` for rendered visibility) |
| CA-I-18 | T-087/T-088 | us-i4-keyboard.test.js | `CA-I-18 — arrow keys move cell selection` | — |
| CA-I-19 | T-089/T-090 | us-i4-keyboard.test.js | `CA-I-19 — Enter/Space activates like a click` | — |
| CA-I-20 | T-091/T-092 | us-i4-keyboard.test.js | `CA-I-20 — turn/result announced without moving focus` | — |
| CA-I-21 | T-063/T-064 | edge-cases.test.js | `CA-I-21 — occupied cell rejected` | — |
| CA-I-22 | T-075/T-076 | edge-cases.test.js | `CA-I-22 — input ignored during WAITING_FOR_AGENT` | — |
| CA-I-23 | T-083/T-084 | edge-cases.test.js | `CA-I-23 — restart during movement phase clears pending selection` | — |
| CA-I-24 | T-061/T-062 | edge-cases.test.js | `CA-I-24 — configuration inaccessible outside CONFIGURATION` | — |
| CA-I-25 | T-071/T-072 | edge-cases.test.js | `CA-I-25 — own-mark selection highlights destinations` | — |
| CA-I-26 | T-073/T-074 | edge-cases.test.js | `CA-I-26 — destination selection applies the move` | — |
| CA-I-27 | T-071/T-072 | edge-cases.test.js | `CA-I-27 — reselecting own mark cancels selection` | — |
| CA-I-28 | T-093/T-094 | responsive-static.test.js | `CA-I-28 — no fixed pixel widths on layout containers` | — (structural proxy only — see `manual-verification.md`) |
| CA-I-29 | T-093/T-094 | responsive-static.test.js | `CA-I-29 — single column below 768px, min-width breakpoint` | — (structural proxy only — see `manual-verification.md`) |
| CA-I-30 | T-095/T-096 | responsive-static.test.js | `CA-I-30 — board container is square (aspect-ratio 1/1)` | — (structural proxy only — see `manual-verification.md`) |
| CA-I-31 | T-095/T-096 | responsive-static.test.js | `CA-I-31 — interactive controls declare 44x44px minimum` | — (declared-value check — see `research.md` D-I-04 for why this one is closer to direct) |
| CA-I-32 | T-095/T-096 | responsive-static.test.js | `CA-I-32 — configuration controls not clipped or overflow-hidden` | — (structural proxy only — see `manual-verification.md`) |
| CA-N-02 | T-097/T-098 | non-functional.test.js | `CA-N-02 — fully operable with mouse (click handlers cover every action)` | — |
| CA-I-33 | T-099/T-100 | us-i2-state-feedback.test.js | `CA-I-33 — occupied cell displays the mark's symbol` | — |
| CA-N-03 | T-101/T-102 | non-functional.test.js | `CA-N-03 — full game completable via keyboard alone` | — |

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

## CA-I-08 — corollary confirmation, no production code (T-070)

T-064/T-066's implementation already rendered every state CA-I-08 covers (turn, rejected move,
winning line) through `textContent`/a `data-*`-driven child node, never a class-only signal — the
`data-turn-indicator`/`data-error-indicator` paragraphs and the winning cells' `"★"` text child
were all built as part of the base RED/GREEN pairs, not added specially for accessibility. T-069's
dedicated cross-cutting test passed on first run; T-070 required no change to `src/ui/*.js`. Same
convention as `specs/002-agents/traceability.md`'s CA-A-14 note and this spec's own CA-I-11/CA-I-15
documented-exception pattern below: the RED/GREEN pair still exists so CA-I-08 has its own commit
citing its ID (P6), not because the behavior was ever missing.

## CA-I-09 — real cross-game memory-reuse integration, no production code (T-082)

T-081's test drives two consecutive "games" through the real `events.js` pipeline
(`requestAgentMove` → `chooseMove` → `resolveAgentMove`, `render.js`'s `[data-memory-indicator]`)
using the actual `src/ui/events.js`/`src/ui/render.js` modules — nothing in the test is a
hand-built `Decision`. It passed on first run at T-081 (zero-code corollary, same pattern as
CA-I-08/CA-I-11/CA-I-15 above), since T-078 (`resolveAgentMove` calling the real `chooseMove`)
and T-080 (the indicator reading `lastDecision.resolvedFromMemory`) already implement everything
the integration needs.

**One deviation from `tasks.md`'s literal T-081 description, documented here per the process
rule for corrections found during implementation**: the task text says to reach the second game
by clicking `[data-restart-button]`. That control — and the `restart(state)` function itself —
do not exist yet; `tasks.md`'s own Phase gate table places `restart` in Phase 4 (T-083/T-084),
strictly *after* this CA-I-09 pair, so a literal restart click was not executable at this point
in the sequence. Rather than fabricate a `Decision` (which the analysis that created T-081/T-082
explicitly ruled out) or implement `restart` early out of task order (which would give CA-I-16/
CA-I-23 a GREEN commit with no preceding RED, violating P5), the test seeds the second game's
initial `AppState` directly with the first game's real `agentMemory`/`scoreboard` — precisely the
transformation `contracts/app-state-api.md` documents `restart` will perform
(`{...createAppState(), agentMemory, scoreboard}`) — then drives that second game through the
same real `events.js`/`render.js` pipeline as the first. This proves the actual claim T-081/T-082
exist to test (does a real second game, given the first game's real memory, produce a genuine
`resolvedFromMemory: true` through `chooseMove`?) without depending on a control that has no RED
test of its own yet. `restart`'s own mechanics (the button, returning to `CONFIGURATION`,
preserving the scoreboard) remain fully covered by T-083/T-084 as planned; this note only records
why T-081 did not literally click it. No `traceability.md` "Test-strategy limitations" entry was
needed — the integration is fully exercised, not partially.

## CA-I-33 — added post-implementation (BUG-008, T-099/T-100)

`spec.md`'s Amendments section (2026-07-27) records why: no criterion in `T-060`–`T-098`'s scope
ever required an occupied cell to visibly display its mark, so `render.js`'s `renderBoard` never
wrote one into `textContent` except the `'★'` win glyph. Found by manual play, not by the
automated suite — see `docs/bugs.md` BUG-008 for the full write-up, including why every prior test
passed regardless (they asserted `dataset.cellState`, never `textContent`). T-099 (RED) is a
genuine failing test — not a zero-code-corollary candidate, unlike CA-I-08/CA-I-11/CA-I-15/CA-N-02
above — since the gap was real, not already satisfied by an earlier task. T-100 (GREEN) writes the
mark's symbol into `textContent` for every occupied cell and keeps it alongside the `'★'` glyph on
winning cells, so CA-I-04 and CA-I-33 do not conflict.

**Kept separate, on purpose**: a second, unrelated defect found in the same file while diagnosing
this one — `render.js` collapsing `contracts/dom-contract.md`'s `data-cell-state` enum
(`"own" | "opponent"`) into just `"own"` — is fixed in its own commit, not T-100's, and tracked as
**BUG-009**, so this criterion's commit history stays about CA-I-33 alone.

## CA-N-02 — corollary confirmation, no production code (T-098)

Every action reachable in a real game (configuration via `change` on the four `select` controls,
starting via `[data-start-button]`, placing/moving via board-cell `click`, movement-phase
selection/destination via `click`, and `[data-restart-button]`) was already wired to a mouse-only
event (`click` or `change`) as part of its own base RED/GREEN pair — none of that wiring depends
on a `keydown` listener. T-097's test drove a full classic game to a win and back to
`CONFIGURATION` via restart, plus a full continuous-mode game through movement-phase selection and
destination clicks, using only `click`/`change` events, and passed on first run. T-098 required no
change to `src/ui/*.js`. Same convention as this file's CA-I-08/CA-I-11/CA-I-15 notes above.

## CA-I-11/CA-I-15 — corollary confirmation, no production code (T-068)

`tasks.md`'s T-067/T-068 description assumed `applyPlayerMove` would branch on a winning mark
only and need a distinct `'draw'` arm added in T-068. T-064/T-066's actual implementation already
branches generically on `result.result` being truthy (any non-null result, mark or `'draw'`), so
CA-I-11's draw indicator and CA-I-15's scoreboard increment were already satisfied the moment
T-066 landed. Both tests (`us-i2-state-feedback.test.js`, `us-i3-scoreboard.test.js`) passed on
first run at T-067; T-068 required no change to `src/ui/*.js`. Same convention as
`specs/002-agents/traceability.md`'s CA-A-14 note and this spec's own CA-I-08/CA-I-19/CA-N-02/
CA-N-03 documented-exception pattern: the RED/GREEN pair still exists so CA-I-11/CA-I-15 each
have their own commit citing their ID (P6), not because the behavior was ever missing.
