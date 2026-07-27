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
| CA-I-01 | T-061/T-062 | us-i1-configuration.test.js | `CA-I-01 — configuration controls displayed` | 0589cd9fe618f1a06cbd4c2853fff8dce1f3301d (RED) / 30d35ebc2f650b929109c898244d65883dbcb83e (GREEN) |
| CA-I-02 | T-061/T-062 | us-i1-configuration.test.js | `CA-I-02 — start transitions CONFIGURATION to IN_GAME` | 0589cd9fe618f1a06cbd4c2853fff8dce1f3301d (RED) / 30d35ebc2f650b929109c898244d65883dbcb83e (GREEN) |
| CA-I-03 | T-063/T-064 | us-i2-state-feedback.test.js | `CA-I-03 — turn indicator` | ce3d737448bb8db5f70500003c4ef69876446ef0 (RED) / 6f796b88a1b9c7a15ac8dfbcd6c1590fa75cff79 (GREEN) |
| CA-I-04 | T-065/T-066 | us-i2-state-feedback.test.js | `CA-I-04 — winning line highlighted, moves blocked` | c7c4f4c8b1ae7afcd32abd382ff205b56fb821fe (RED) / e37b5feca15c73b8f3ff704cdad5c4fb59d05452 (GREEN) |
| CA-I-05 | T-063/T-064 | us-i2-state-feedback.test.js | `CA-I-05 — illegal move rejected with reason` (includes the `game_over` reason case) | ce3d737448bb8db5f70500003c4ef69876446ef0 (RED) / 6f796b88a1b9c7a15ac8dfbcd6c1590fa75cff79 (GREEN) |
| CA-I-06 | T-075/T-076 | us-i2-waiting-state.test.js | `CA-I-06 — waiting state shown, board disabled` | 6650cfaca18e219521229c57be5c28da4ee61e57 (RED) / c439ab33ae10718ee9461766239f10c71c4cb264 (GREEN) |
| CA-I-07 | T-071/T-072 | us-i2-state-feedback.test.js | `CA-I-07 — movement-phase legal marks and destinations indicated` | 27669eef9008a221cba4e8c74f8e65ac93cfa79e (RED) / 6b2ffd3fa1010df0ec42888289463ea6256450e2 (GREEN) |
| CA-I-08 | T-069/T-070 | us-i2-state-feedback.test.js | `CA-I-08 — information conveyed without color alone` | abe63f41f86993128c2b194718b3cf7721637d1f (RED) / 9fe51bf59c0889de4fc5592e6a83335dbd6ab860 (GREEN, zero-code corollary) |
| CA-I-09 | T-079/T-080 (render); T-081/T-082 (integration) | us-i2-state-feedback.test.js | `CA-I-09 — resolvedFromMemory indicator` (T-079/T-080); `CA-I-09 — resolvedFromMemory reflects real cross-game memory reuse` (T-081/T-082) | db0112d0d40fa9e84e37cfb9153d3f517e5ac3b6 (RED) / 78a67ee8129861b880142fdb881b2fdfff5a1f85 (GREEN); 4fc149e286d9e4380f2ace5ed0d8dc7961743aed (RED) / d3a28d8f390b8decb6e8c5f960851a5bdc11eba8 (GREEN, zero-code corollary) |
| CA-I-10 | T-077/T-078 | us-i2-waiting-state.test.js | `CA-I-10 — waiting state visible for at least 300ms` | ee7716be9764fac6ee13be1edf28a921c74ea68f (RED) / 291b4dce097180a002c94d211e5cc856375f4eff (GREEN) |
| CA-I-11 | T-067/T-068 | us-i2-state-feedback.test.js | `CA-I-11 — draw indicator, moves blocked` | ea67771dc28f85825e88d7fadb1561d38fdb663e (RED) / ff5c79c9ca1931afe6f319e9dcc25c41a2127b74 (GREEN, zero-code corollary) |
| CA-I-12 | T-075/T-076 | us-i2-waiting-state.test.js | `CA-I-12 — IN_GAME to WAITING_FOR_AGENT transition` | 6650cfaca18e219521229c57be5c28da4ee61e57 (RED) / c439ab33ae10718ee9461766239f10c71c4cb264 (GREEN) |
| CA-I-13 | T-077/T-078 | us-i2-waiting-state.test.js | `CA-I-13 — WAITING_FOR_AGENT to IN_GAME transition after floor elapses` | ee7716be9764fac6ee13be1edf28a921c74ea68f (RED) / 291b4dce097180a002c94d211e5cc856375f4eff (GREEN) |
| CA-I-14 | T-065/T-066; amended T-101/T-102 (BUG-010) | us-i3-scoreboard.test.js | `CA-I-14 — win increments scoreboard`; `CA-I-14,CA-I-15 — scoreboard counts are identifiable by label` | c7c4f4c8b1ae7afcd32abd382ff205b56fb821fe (RED) / e37b5feca15c73b8f3ff704cdad5c4fb59d05452 (GREEN); 6f5c8003525421d528dfd38e864e5bb609e738e9 (RED) / b46826949641cc61a1bd889d0d86d0b4f005f2b4 (GREEN) |
| CA-I-15 | T-067/T-068; amended T-101/T-102 (BUG-010) | us-i3-scoreboard.test.js | `CA-I-15 — draw increments scoreboard`; `CA-I-14,CA-I-15 — scoreboard counts are identifiable by label` | ea67771dc28f85825e88d7fadb1561d38fdb663e (RED) / ff5c79c9ca1931afe6f319e9dcc25c41a2127b74 (GREEN); 6f5c8003525421d528dfd38e864e5bb609e738e9 (RED) / b46826949641cc61a1bd889d0d86d0b4f005f2b4 (GREEN) |
| CA-I-16 | T-083/T-084 | us-i3-scoreboard.test.js | `CA-I-16 — restart returns to CONFIGURATION, scoreboard preserved` | 06a15818152fec7271406aa30e763defcb41ed2f (RED) / 846773625ec658f380de38f3bc5114eaeed4b973 (GREEN) |
| CA-I-17 | T-085/T-086 | us-i4-keyboard.test.js | `CA-I-17 — focus-visible hook toggles on focus/blur` | a2e9f633c10972f6ffa562945f251a58d1a5ed61 (RED) / 4e27e97ad8f0963a8a15eee7507f5ab7a680434f (GREEN) (behavioral half only — see `manual-verification.md` for rendered visibility) |
| CA-I-18 | T-087/T-088 | us-i4-keyboard.test.js | `CA-I-18 — arrow keys move cell selection` | 55e97ccabfe25677090f703d1b52a77154ee8a7c (RED) / 52992481c438acb0d96c2bd1751d457caf3ab640 (GREEN) |
| CA-I-19 | T-089/T-090 | us-i4-keyboard.test.js | `CA-I-19 — Enter/Space activates like a click` | b217f67ba8eba3257df8a9503d21a60fc27dffc7 (RED) / 48d541fa2fca8400796c65d548682b100a96e4f4 (GREEN) |
| CA-I-20 | T-091/T-092 | us-i4-keyboard.test.js | `CA-I-20 — turn/result announced without moving focus` | 73e02659d01e6e8a4ee6c5d685275837f6237da5 (RED) / d4c14b4f598b7f6c93a4b6f5988dd2adb44ee50c (GREEN) |
| CA-I-21 | T-063/T-064 | edge-cases.test.js | `CA-I-21 — occupied cell rejected` | ce3d737448bb8db5f70500003c4ef69876446ef0 (RED) / 6f796b88a1b9c7a15ac8dfbcd6c1590fa75cff79 (GREEN) |
| CA-I-22 | T-075/T-076 | edge-cases.test.js | `CA-I-22 — input ignored during WAITING_FOR_AGENT` | 6650cfaca18e219521229c57be5c28da4ee61e57 (RED) / c439ab33ae10718ee9461766239f10c71c4cb264 (GREEN) |
| CA-I-23 | T-083/T-084 | edge-cases.test.js | `CA-I-23 — restart during movement phase clears pending selection` | 06a15818152fec7271406aa30e763defcb41ed2f (RED) / 846773625ec658f380de38f3bc5114eaeed4b973 (GREEN) |
| CA-I-24 | T-061/T-062 | edge-cases.test.js | `CA-I-24 — configuration inaccessible outside CONFIGURATION` | 0589cd9fe618f1a06cbd4c2853fff8dce1f3301d (RED) / 30d35ebc2f650b929109c898244d65883dbcb83e (GREEN) |
| CA-I-25 | T-071/T-072 | edge-cases.test.js | `CA-I-25 — own-mark selection highlights destinations` | 27669eef9008a221cba4e8c74f8e65ac93cfa79e (RED) / 6b2ffd3fa1010df0ec42888289463ea6256450e2 (GREEN) |
| CA-I-26 | T-073/T-074 | edge-cases.test.js | `CA-I-26 — destination selection applies the move` | 86fe09ec687893a240485eae058a274cbc240bbb (RED) / 7d48ccf90af41f192008501ca767d0a55b0a43d5 (GREEN) |
| CA-I-27 | T-071/T-072 | edge-cases.test.js | `CA-I-27 — reselecting own mark cancels selection` | 27669eef9008a221cba4e8c74f8e65ac93cfa79e (RED) / 6b2ffd3fa1010df0ec42888289463ea6256450e2 (GREEN) |
| CA-I-28 | T-093/T-094 | responsive-static.test.js | `CA-I-28 — no fixed pixel widths on layout containers` | 11efe3d2c42a0e530d4c16bda878d9f7e4921e74 (RED) / e712e5e3bf3e5661329015fb77b3788cb816e36c (GREEN) (structural proxy only — see `manual-verification.md`) |
| CA-I-29 | T-093/T-094 | responsive-static.test.js | `CA-I-29 — single column below 768px, min-width breakpoint` | 11efe3d2c42a0e530d4c16bda878d9f7e4921e74 (RED) / e712e5e3bf3e5661329015fb77b3788cb816e36c (GREEN) (structural proxy only — see `manual-verification.md`) |
| CA-I-30 | T-095/T-096 | responsive-static.test.js | `CA-I-30 — board container is square (aspect-ratio 1/1)` | e14ab75ba43e48930bf5de9266c85c105fea4dca (RED) / 336e9090a90db44398c3448110b14377a72dfa70 (GREEN) (structural proxy only — see `manual-verification.md`) |
| CA-I-31 | T-095/T-096 | responsive-static.test.js | `CA-I-31 — interactive controls declare 44x44px minimum` | e14ab75ba43e48930bf5de9266c85c105fea4dca (RED) / 336e9090a90db44398c3448110b14377a72dfa70 (GREEN) (declared-value check — see `research.md` D-I-04 for why this one is closer to direct) |
| CA-I-32 | T-095/T-096 | responsive-static.test.js | `CA-I-32 — configuration controls not clipped or overflow-hidden` | e14ab75ba43e48930bf5de9266c85c105fea4dca (RED) / 336e9090a90db44398c3448110b14377a72dfa70 (GREEN) (structural proxy only — see `manual-verification.md`) |
| CA-N-02 | T-097/T-098 | non-functional.test.js | `CA-N-02 — fully operable with mouse (click handlers cover every action)` | fd53c73dd620ecb3cf584a8a021357bd4d5b0a29 (RED+GREEN, zero-code corollary — see Notes) |
| CA-I-33 | T-099/T-100 | us-i2-state-feedback.test.js | `CA-I-33 — occupied cell displays the mark's symbol` | 6c5c447c48b0d23de6a8373b9b5d71ce83476f3c (RED) / 41485ba0f9e7179f72c85d02e0c7c6027b99c845 (GREEN) |
| CA-I-34 | T-105/T-106 (BUG-012) | us-i2-state-feedback.test.js | `CA-I-34 — turn indicator states the game has ended once FINISHED` | 8f529a7de0be4f28682f44fecfb9b76707d4096b (RED) / 0c60a1cba70cfa40a50350b765c554e70d12c6ad (GREEN) |
| CA-I-35 | T-107/T-108 | us-i1-configuration.test.js | `CA-I-35 — configuration controls show identifying placeholder labels` | 881c9de209fb49c1d0815390aca9e0d950a9a4f9 (RED) / 1ec5c863ab38b93db500525d83ee21b0edb47601 (GREEN) |
| CA-I-36 | T-109/T-110 | responsive-static.test.js | `CA-I-36 — action controls bounded to the board's max width at wide viewports` | ad5965e476df983fde7cad6077f54d475fbf95b4 (RED) / b59fa9e45d04e6ea7ec6c4c712c2a976dff74283 (GREEN) (structural proxy only — see `manual-verification.md`) |
| CA-N-03 | T-111/T-112 | non-functional.test.js | `CA-N-03 — full game completable via keyboard alone` | d7f278fdf8df87ad07f3928c6361c5ed5b9bb247 (RED) / 0f9d5836b779ff527bd1b61249521d79a9d77049 (GREEN) |
| CA-I-37 | T-114/T-115 | us-i1-configuration.test.js | `CA-I-37 — configuration option text is in Spanish` | — |
| CA-I-38 | T-116/T-117 | us-i4-keyboard.test.js | `CA-I-38 — visible keyboard instruction` | — |
| CA-I-39 | T-118/T-119 | us-i4-keyboard.test.js | `CA-I-39 — focus moves to the board on CONFIGURATION to IN_GAME transition` | — |

### Bug-fix commits (BUG-008–BUG-014, no dedicated `T-NNN` for some)

| Bug | Description | Fix commit(s) |
|-----|--------------|----------------|
| BUG-008 | Occupied cells never rendered their mark's symbol | New CA-I-33 — see T-099/T-100 row above |
| BUG-009 | `render.js` collapsed `data-cell-state` to just `"own"`, never `"opponent"` (contract non-compliance, no CA-ID) | 0df3cfa9d740b272e95734052be30f107298618c |
| BUG-010 | Scoreboard showed bare numbers with no identifying label | CA-I-14/CA-I-15 amended — see rows above (6f5c8003525421d528dfd38e864e5bb609e738e9 RED / b46826949641cc61a1bd889d0d86d0b4f005f2b4 GREEN) |
| BUG-011 | Live region duplicated `[data-result-indicator]`'s visible text (no CA-ID, `research.md` D-I-09) | 1dc7f5a6f396ae8fb719a2849385056ad2fa20c5 (RED) / 76655804562c2726404a2f3661a4a2b9639806f6 (GREEN) |
| BUG-012 | Turn indicator kept stating a pending turn after `FINISHED` | New CA-I-34 — see T-105/T-106 row above |
| BUG-013 | Configuration `<select>`s rendered blank after `restart` | New CA-I-35 — see T-107/T-108 row above |
| BUG-014 | Action controls stretched to full grid-column width at wide viewports | New CA-I-36 — see T-109/T-110 row above |

Docs commits recording each bug/amendment (spec.md, tasks.md, traceability.md skeleton, bugs.md):
`61b8e0bfadf199bf2329614dbb3e7cf8ef0b3c0d` (CA-I-33, BUG-008), `84da4c0e66b1294c04235bcdccb808bea0454270`
(BUG-010/011/012 closure), `e158931c9c1915de781e93d925744c1623e44a9a` (CA-I-35/CA-I-36, BUG-013/014).

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
- **CA-I-36** (added post-implementation, BUG-014): same pattern as CA-I-31 — automated coverage
  reads the *declared* `max-width` on `.action-button`, not the rendered, computed width (a grid
  `justify-items` override elsewhere in the cascade could still stretch it back).
  `manual-verification.md`'s computed-width check at 768×1024, 1024×768, and 1440×900 is the
  authoritative closure.
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

## CA-I-35 — added post-implementation (BUG-013, T-107/T-108)

`spec.md`'s Amendments section (2026-07-27, A4) records why: `restart` resets `config` to `null`
in every field, which selects each `<select>`'s placeholder `<option value="">` — present, and
blank, since the very first `buildStructure` call, not introduced by `restart` itself. Found by
manual play (specifically, after a restart), not by the automated suite — no test ever asserted
any `<option>`'s `textContent`, only `value`/`disabled`. T-107 (RED) is a genuine failing test,
not a zero-code-corollary candidate. T-108 (GREEN) gives each control's empty option its own
identifying label and adds one to `[data-config-agent-level]`'s previously label-less placeholder
too, for consistency, even though the reported symptom was only on the three static selects.

## CA-I-36 — added post-implementation (BUG-014, T-109/T-110)

`spec.md`'s Amendments section (2026-07-27, A5) records why: `.app`'s wide-viewport grid layout
(`@media (min-width: 768px)`) stretches grid items to fill their column by default, so
`[data-start-button]`/`[data-restart-button]` (no explicit width) filled the same wide column
`.board` occupies, despite `.board` itself being capped to `min(90vw, 480px)`. Found by manual
play at a wide viewport, not by `responsive-static.test.js`, which had no selector or assertion
for action-control width before this amendment. T-109 (RED) is a genuine failing test. T-110
(GREEN) adds a shared `.action-button` class (start and restart buttons) with `max-width: 480px`
— reusing `.board`'s own cap (Design Decision D11) rather than a new, unjustified number.

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
