# Bug Log

Process bugs found in this project's own tooling or artifacts (not gameplay bugs, which
follow the spec-first debugging flow in `CLAUDE.md` § Process Rules and are never patched
by hand). Each entry uses the format below; add new bugs at the top.

## Entry format

```
## BUG-NNN: <short title>

**Found**: <date> | **Status**: Fixed | Open | Won't fix

**Detection**: how the bug was noticed — what output or behavior looked wrong.

**Diagnosis**: the actual root cause.

**Fix**: what changed and where, with real commit SHAs (never invented — see CLAUDE.md
"Do not invent SHAs in traceability.md", same rule applies here).

**Result**: what was verified after the fix.
```

---

## BUG-017: `maybeHandOffToAgent` never invoked at game start — the agent does not open when it holds the first turn

**Found**: 2026-07-27 | **Status**: Open

**Classification**: implementation defect of an existing criterion (`CA-I-12`), not a spec gap.

**Detection**: Manual play-testing — configuring mark `O` against an agent (agent = `X`) left
the board waiting indefinitely for a human move, even though the engine's `createGame` always
opens on turn `X`, i.e. the agent's turn.

**Diagnosis**: `src/ui/events.js`'s `maybeHandOffToAgent()` is only invoked from the board's
`click` listener, right after a human `applyPlayerMove` (lines ~152, ~163) — never from
`[data-start-button]`'s `click` listener, which only calls `setState(startGame(...))` and
`rerender()`. `CA-I-12` ("WHEN it becomes the agent's turn to move, THE SYSTEM SHALL transition
from `IN_GAME` to `WAITING_FOR_AGENT`") already covers this literally: "becomes the agent's
turn" is not conditioned on a prior human move having occurred. This is a genuine implementation
gap against an already-correct criterion, not a spec gap.

**Why the suite missed it**: every fixture covering `CA-I-06`/`CA-I-10`/`CA-I-12`/`CA-I-13`
(`tests/interface/us-i2-waiting-state.test.js`) sets `marks.player1: 'X'` — the human is always
X, the agent is always O — and always triggers a human `click` before asserting the waiting
state. No fixture exercises `marks.player1: 'O'` (agent = X, agent opens), so the branch was
never run. Per-`CA-ID` coverage counting could not have caught this: it only asks "does at least
one passing test cite this `CA-ID`", not "are all of this criterion's observable branches
exercised."

**Lesson**: the spec was correct and the criterion already existed. The defect survived because
every fixture in the suite shared the same bias (human = X), so an entire branch of the
criterion went unexercised without any `CA-ID` coverage count ever revealing it. `CA-ID`
coverage is not branch coverage — it is worth auditing other `003-interface` criteria for the
same shared-fixture bias (same mark assumption, or any other unstated shared assumption) before
considering this class of gap closed for the feature.

**Fix**: `events.js`'s `[data-start-button]` `click` listener calls `maybeHandOffToAgent()`
immediately after `setState(startGame(...))`, exactly as the board's `click` listener already
does after every human move.

**Test**: new fixture in `us-i2-waiting-state.test.js` with `marks.player1: 'O'` that starts a
game and asserts `[data-waiting-indicator]` is present **without** any board `click` — RED
against the current code (nothing transitions to `WAITING_FOR_AGENT` without a prior human
move), GREEN once the fix lands.

---

## BUG-016: keyboard navigation works once a cell has focus, but nothing tells the player how to get there

**Found**: 2026-07-27 | **Status**: Open

**Classification**: spec gap.

**Detection**: Manual keyboard-only play-testing — Tab does reach the board and arrow keys do
move the selection once a cell has focus, but nothing communicates that Tab is how to reach the
board's keyboard interaction, and nothing places focus on the board automatically when a game
starts.

**Diagnosis**: `CA-I-18`/`CA-I-19` define what happens once a cell already has focus; no
criterion in US-I-4 ever addressed how a keyboard-only player discovers, or arrives at, that
interaction in the first place. `tests/interface/us-i4-keyboard.test.js`'s `CA-I-18` tests call
`cell.focus()` directly before dispatching the arrow key — a faithful test of exactly what the
criterion asks, which is why it is green, but it does not (and per the criterion's current text,
was never asked to) cover the moment of first arriving at the board.

**Fix**: two new criteria, added as separate, independently testable responses rather than one
combined criterion — see `spec.md` Amendments A7:
- **CA-I-38**: a static, always-visible instruction stating that arrow keys move the selection
  and Enter/Space activates it.
- **CA-I-39**: keyboard focus moves automatically to a board cell (with an identifying
  accessible name) on the `CONFIGURATION → IN_GAME` transition only — not on any later render —
  so a keyboard-only player always has a known way to reach the board without guessing.

**Result**: pending T-116–T-119.

---

## BUG-015: configuration option text renders in English despite the project's Spanish game-UI convention

**Found**: 2026-07-27 | **Status**: Open

**Classification**: spec gap.

**Detection**: Manual play-testing showed every configuration `<select>`'s populated options
(`human`, `agent`, `classic`, `continuous`, and the three agent levels) render their literal
English identifiers as visible text.

**Diagnosis**: No `CA-I-nn` ever required the *language* of an option's text once populated —
`CA-I-01` only requires the controls to exist and be selectable, and `CA-I-35` (BUG-013) only
covers the unselected/placeholder state. `CLAUDE.md`'s game-UI-in-Spanish convention was
acknowledged only in `spec.md`'s Assumptions section (a descriptive note, not a testable
criterion), so it was never translated into anything the suite could check.

**Fix**: new criterion **CA-I-37** (see `spec.md` Amendments A6) requiring Spanish option text
per an explicit mapping (`human`→"Humano", `agent`→"Agente", `classic`→"Clásica",
`continuous`→"Continua", `simple`→"Simple", `medium`→"Medio", `complex`→"Complejo"); `value`s
unchanged, marks (`X`/`O`) not translated.

**Result**: pending T-114/T-115.

---

## BUG-014: action controls (start, restart) stretch to the full grid-column width, far wider than the board

**Found**: 2026-07-27 | **Status**: Fixed

**Classification**: spec gap.

**Detection**: Manual play-testing at a wide viewport (≥768px) showed the restart button
rendered at the full width of its layout container while the board occupied roughly a third of
that width.

**Diagnosis**: **Spec gap.** `src/styles.css`'s `@media (min-width: 768px)` block switches `.app`
to `display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 2fr)`. Grid items default to
`justify-items: stretch`, so a `<button>` with no explicit width fills its entire grid-column
track — here, the wider `2fr` track the board also occupies — while `.board` has an explicit
`width: min(90vw, 480px)` that keeps it far narrower than that track. No `CA-I-nn` in
`spec.md` ever governed the proportion between action controls and the board; CA-I-28–CA-I-32
cover scrolling, columns, squareness, touch-target minimums, and clipping, none of which this
violates. Not a `dom-contract.md` non-compliance either — the contract never described action-
control sizing before this amendment.

**Fix** (spec-first, per constitution P3/P7): new criterion **CA-I-36** added to `spec.md`
(Amendments section, A5) constraining every action control's width to at most 480px at ≥768px —
the same maximum `.board` already declares (Design Decision D11, reusing the existing threshold
rather than inventing a second one). `dom-contract.md` extended with a new "Action Controls"
section documenting a shared `.action-button` class. `tasks.md` extended with T-109 (RED) /
T-110 (GREEN).

**Result**: `npm test` green after the fix; `responsive-static.test.js` gained a static-CSS-source
check for `.action-button`'s declared `max-width`. Rendered-width closure remains a
`manual-verification.md` concern (added to its checklist), same class of gap as CA-I-28–CA-I-32.

**Lesson**: a CSS layout technique (grid stretch) can silently violate an unstated proportion
constraint; the fix is a new criterion with a threshold reusing an already-justified number
(`.board`'s own cap), not an arbitrary new one.

---

## BUG-013: configuration controls render blank (no placeholder text) after restart

**Found**: 2026-07-27 | **Status**: Fixed

**Classification**: spec gap.

**Detection**: Manual play-testing after a restart showed all three configuration `<select>`
controls appear completely blank. Opening each dropdown confirmed the real options
(`human`/`agent`, `X`/`O`, `classic`/`continuous`) were intact — only the collapsed, currently
selected view was blank.

**Diagnosis**: **Spec gap.** `restart()` (`src/ui/app-state.js`) resets `config`'s four fields to
`null`; `renderConfigControls` (`src/ui/render.js`) sets each `<select>.value = ''`, selecting the
placeholder `<option value="">` that never had a `textContent` — present since the very first page
load, not introduced by restart. CA-I-01 only requires the controls to be displayed and
selectable, which the blank placeholder still technically satisfies; no criterion ever specified
what the "no selection" state itself must look like. Not an implementation defect against any
written criterion, and not a `dom-contract.md` non-compliance — the contract never described the
unselected-state appearance either.

**Fix** (spec-first, per constitution P3/P7): new criterion **CA-I-35** added to `spec.md`
(Amendments section, A4): each configuration control's empty placeholder option carries its own
identifying Spanish label (`"Oponente…"`, `"Ficha…"`, `"Modalidad…"`, `"Nivel…"`) instead of blank
text — one label per control, not a single generic placeholder repeated three times, since the
actual gap was that three blank controls gave no clue which one configured what. `dom-contract.md`
extended to document the placeholder labels. `tasks.md` extended with T-107 (RED) / T-108 (GREEN).

**Result**: `npm test` green after the fix.

**Lesson**: a criterion satisfied by its literal text (CA-I-01: "display selectable controls")
can still leave an observable state — here, "no selection" — completely unspecified; the fix is
an additive criterion describing that state's own required text, the same pattern BUG-010 used
for the scoreboard's missing labels.

---

## BUG-012: turn indicator keeps stating a pending turn after the game reaches FINISHED

**Found**: 2026-07-27 | **Status**: Fixed (commits `8f529a7`/`0c60a1c`)

**Classification**: spec gap.

**Detection**: Manual play-testing showed `[data-turn-indicator]` still reads "Turno de O" after
the game ends, simultaneously with the result being shown elsewhere ("Gana X").

**Diagnosis**: **Spec gap.** CA-I-03 ("at all times") is the assignment's verbatim mandatory
criterion #1 and is not rewritten. It was simply never scoped for the one state where "whose
turn" stops being a meaningful question — `FINISHED`. `dom-contract.md` mirrored the same
unscoped wording. Not a contract non-compliance (the contract never said anything about
`FINISHED` either) and not an implementation defect of an existing criterion (`render.js` does
exactly what CA-I-03's literal text requires — "at all times" — it just never occurred to anyone
that "at all times" would keep applying past the point where there is no turn to indicate).

**Fix** (spec-first, per constitution P3/P7): new criterion **CA-I-34** added to `spec.md`
(Amendments section, A3) as a boundary clause for the `FINISHED` state — CA-I-03's own EARS text
is untouched. Chosen wording replaces the turn indicator's text with a statement that the game
has ended ("Partida terminada"), rather than clearing it to an empty string, per explicit group
decision: an indicator that goes blank leaves an unexplained visual gap, while stating the game
ended keeps satisfying CA-I-03's "indicate at all times" intent through the terminal state too.
`dom-contract.md`'s `[data-turn-indicator]` entry extended to note the `FINISHED`-state text.
`tasks.md` extended with T-105 (RED, `8f529a7`) / T-106 (GREEN, `0c60a1c`).

**Result**: `npm test` 118/118 green after the fix.

**Lesson**: a criterion transcribed verbatim from an external mandatory source can still have an
unscoped boundary; the fix is an additive clause with its own CA-ID, never an edit to the
verbatim text itself. Found by manual play, not by the automated suite — no test ever asserted
`[data-turn-indicator]`'s content once `uiState === 'FINISHED'`.

---

## BUG-011: `[data-result-indicator]` and `[data-live-region]` both show the same result text visibly

**Found**: 2026-07-27 | **Status**: Fixed (commits `1dc7f5a`/`7665580`)

**Classification**: plan gap (not a spec gap, not a contract non-compliance).

**Detection**: Manual play-testing showed "Gana X" (or "Empate") displayed twice on screen at
once after a game ends.

**Diagnosis**: **Plan gap.** CA-I-04, CA-I-11, and CA-I-20 are each independently satisfied —
`[data-result-indicator]` (CA-I-04/CA-I-11) and `[data-live-region]` (CA-I-20) are two distinct,
individually-required elements, and neither `render.js` nor `dom-contract.md` violates what either
criterion asks for. What was missing is a `research.md`/`dom-contract.md` decision about the live
region's visual treatment — nothing ever said it should be hidden from sighted users while
remaining in the accessibility tree, so `render.js` left it as an ordinary visible `<p>`.

**Fix**: `research.md` D-I-09 added (`sr-only` technique, not `display:none`/`visibility:hidden`,
so `aria-live` still fires for assistive technology); `dom-contract.md`'s Status region entry for
`[data-live-region]` updated to require the `sr-only` treatment. CA-I-20 unchanged — no `spec.md`
amendment, since no criterion's behavior changes, only an undecided visual detail is now decided.
`tasks.md` extended with T-103 (RED, `1dc7f5a`) / T-104 (GREEN, `7665580`), with no `CA-I-nn` tag
(same precedent as `001-engine`'s T-001/T-002 and this feature's own T-060: a task can exist
without a CA-ID when it fixes a contract/tooling detail rather than a criterion).

**Result**: `npm test` 117/117 green after the fix.

**Lesson**: a contract/plan artifact can have a gap independent of any spec gap — two criteria can
each be individually satisfied while their combined, unplanned interaction still produces a
defect no criterion forbids. Found by manual play; nothing in the automated suite ever asserted
the two elements' texts against each other or checked either element's visual (non-accessibility)
treatment.

---

## BUG-010: scoreboard counts have no identifying label

**Found**: 2026-07-27 | **Status**: Fixed (commits `6f5c800`/`b468269`)

**Classification**: spec gap.

**Detection**: Manual play-testing showed the scoreboard renders as three bare numbers ("3 0 0")
with no text indicating which is X's win count, O's win count, or the draw count.

**Diagnosis**: **Spec gap.** CA-I-14 and CA-I-15 only required the count to increment correctly;
neither ever asserted the count must be identifiable. `dom-contract.md` mirrored that gap —
`[data-score="X"]` etc. were only ever specified as "text content is the current count," no label.
Not a contract non-compliance (`render.js` does exactly what the contract said) and not an
implementation defect of an existing criterion (both criteria's own literal behavior — increment
on `FINISHED` — was, and remains, correctly implemented).

**Fix** (spec-first, per constitution P3/P7): CA-I-14 and CA-I-15 amended in `spec.md` (not split
into a new CA-ID — labeling is part of the same scoreboard-entry behavior, and a separate CA-ID
for a label alone would fragment traceability for one combined observable) to require a label
identifying each count, in Spanish (`"X"`, `"O"`, `"Empates"`) per the game UI's language
convention; `dom-contract.md` extended with `[data-score-label="X"|"O"|"draw"]`. `tasks.md`
extended with T-101 (RED, `6f5c800`) / T-102 (GREEN, `b468269`).

**Result**: `npm test` 115/115 green after the fix.

**Lesson**: same shape as BUG-008 — the automated suite was internally consistent (asserting only
`[data-score].textContent`) but never encoded what a human observer needs to identify each value.
None of BUG-010/011/012 were reachable by `/speckit-analyze` either: analyze checks artifacts
against each other for internal consistency, not the product's actual on-screen output against a
human's expectations — that gap only manual play-testing closes.

---

## BUG-009: `render.js` collapsed `dom-contract.md`'s `"own" | "opponent"` cell-state enum into just `"own"`

**Found**: 2026-07-27 | **Status**: Fixed

**Detection**: Found while diagnosing BUG-008 (below) and reading `render.js`'s `renderBoard`
against `contracts/dom-contract.md`'s Board section, which documents `data-cell-state` on each
cell as `"empty" | "own" | "opponent"`. The actual code was:
`cell.dataset.cellState = mark === null || mark === undefined ? 'empty' : 'own';` — any occupied
cell, regardless of which mark occupies it, is labeled `'own'`.

**Diagnosis**: Not a spec gap — no `CA-I-nn` requires distinguishing "the current player's mark"
from "the opponent's mark" in a cell (CA-I-07/CA-I-25 only ever query the *current* player's own
marks through `legalMoves(state)`, never through `data-cell-state`). This is a **contract
non-compliance**: `contracts/dom-contract.md` is a `plan.md`-level artifact `render.js` is
supposed to satisfy exactly, and it never did for this one attribute. No test caught it because
no test in `tests/interface/` ever asserted `dataset.cellState === 'opponent'` — every existing
assertion only checked `'empty'` vs. `'own'` (see BUG-008's lesson: tests only ever exercised the
oracle they themselves needed, not the full documented contract).

**Fix**: `render.js`'s `renderBoard` changed to compare the occupying mark against
`state.config.marks.player1` (the human player's configured mark) to set `'own'` or `'opponent'`
correctly, in a commit of its own, deliberately kept separate from CA-I-33's RED/GREEN pair (see
BUG-008) so the two unrelated fixes do not share a commit message. Commit: `fix: render.js
distinguishes own from opponent cell state per dom-contract.md` (SHA recorded once committed —
not invented here, see `CLAUDE.md`'s "Do not invent SHAs" rule).

**Result**: `npm test` green after the fix; no existing test needed to change, since none of them
asserted the (wrong) `'own'`-for-everyone value in the first place — the defect was invisible to
the suite, only visible by reading the contract text directly against the code.

**Lesson**: same shape as BUG-008 below, one contract layer removed from acceptance criteria — a
DOM/API contract (`contracts/*.md`) can drift from its own implementation exactly like a spec can,
and nothing catches it automatically unless a test is written against the contract's literal
documented values, not just the values a particular criterion happens to need.

---

## BUG-008: no acceptance criterion ever required a placed mark to be visible on the board

**Found**: 2026-07-27 | **Status**: Fixed

**Detection**: Manual play-testing after `T-093`–`T-098` (responsive CSS and CA-N-02) showed that
placing a mark never displays an `'X'`/`'O'` symbol in the cell — the board looked empty even mid-
game. Inspecting the DOM showed each occupied cell's `textContent` was `''`; only the three cells
of a completed `winningLine` ever received visible text (the `'★'` glyph from CA-I-04/T-066).

**Diagnosis**: Not a CSS bug and not a rendering bug in the narrow sense — `render.js`'s
`renderBoard` was doing exactly what it was written to do. The actual root cause is a **spec gap**:
re-reading every criterion in `specs/003-interface/spec.md` that touches the board (CA-I-03 — the
turn indicator; CA-I-04 — only the three winning cells; CA-I-08 — requires information *already
conveyed elsewhere* to also be conveyed via text/icon, not the base requirement to convey it in
the first place) showed none of them ever asserted the most basic requirement of a tic-tac-toe UI:
that a placed mark is visible in its cell. The gap was invisible to the entire `T-060`–`T-098`
automated suite because every test that touched cell state asserted `cell.dataset.cellState`
(`'empty'`/`'own'`) — the internal attribute the tests themselves used as their oracle — and never
once asserted `cell.textContent` for a non-winning occupied cell. 112/112 tests were green while
the product, played by a human, did not show the board's own contents.

**Fix** (spec-first, per constitution P3/P7): `specs/003-interface/spec.md` amended (see
"Amendments (Post-Implementation)" section) with a new criterion, **CA-I-33** — WHILE a cell is
occupied, THE SYSTEM SHALL display the occupying mark's symbol in that cell, including when the
cell is also part of a highlighted winning line (CA-I-04), so the mark is not lost when the `'★'`
glyph is added. Numbered 33, out of document order, specifically to avoid renumbering any of the
32 already-implemented and committed criteria. `specs/003-interface/tasks.md` extended with a new
Phase 7.5 (T-099 RED, T-100 GREEN) inserted before the CA-N-03 pair (renumbered T-101/T-102) and
before the final traceability-closure task (renumbered T-103). `render.js`'s `renderBoard` now
writes the mark's symbol into `textContent` for every occupied cell, keeping the `'★'` glyph
alongside it (not replacing it) on winning cells.

**Result**: T-099 (RED) failed exactly as expected before the fix (occupied, non-winning cells had
empty `textContent`); T-100 (GREEN) implemented the fix, `npm test` green afterward.

**Lesson**: a green suite proves internal consistency between tests and code, not that the product
does what a criterion never asked for — CA-I-08 already establishes the principle that
*conveyed* information must not depend on color alone, but nothing in this spec had established
the more basic fact that the board's contents must be conveyed *at all*. `/speckit-analyze` did
not, and structurally could not, catch this: it cross-checks spec/plan/tasks/traceability/
contracts/constitution against each other for internal consistency, but it has no step that asks
"is there a criterion for this obviously-necessary behavior?" — it cannot detect the absence of a
criterion nobody wrote, only inconsistencies between criteria that already exist. The same failure
mode as BUG-006/BUG-007 (a real gap invisible until a concrete consumer — here, a human player —
actually exercised the missing behavior), but one layer closer to the user: those were contract
gaps between features; this one is a spec gap between the spec and the product it is supposed to
describe.

---

## BUG-007: `001-engine`'s contract had no way to expose which line won, blocking a legitimate `003-interface` consumer

**Found**: 2026-07-27 | **Status**: Fixed

**Detection**: While drafting `specs/003-interface/spec.md`'s CA-I-04 ("WHEN a player aligns
three marks, THE SYSTEM SHALL highlight the winning line..."), an audit during that feature's
`/speckit-clarify` asked: how does the UI know *which* three cells to highlight? Checking
`specs/001-engine/contracts/engine-api.md` and `data-model.md` showed `State.result` only ever
holds the winning mark (`'X'|'O'`) or `'draw'` — never a line reference — and `WINNING_LINES`,
the 8-line constant `applyMove` scans internally, is a module-private `const` in `src/engine.js`,
not exported.

**Diagnosis**: Not a bug in `001-engine`'s own behavior — every one of its 20 criteria was, and
remains, correctly implemented and tested. The gap is a contract completeness bug: `001-engine`
was specified and closed before any consumer needed to know *which* line won (only *that* a mark
won), so nothing in its spec, plan, or tasks ever required exposing it. The gap was invisible
until a second, legitimate consumer (`003-interface`) actually needed the information — the same
"looks fine until something outside the feature tries to use it" shape as BUG-006, but here the
missing piece is a data field, not tooling.

**Fix** (spec-side, this session): `specs/001-engine/spec.md`'s CA-M-12 amended to also set
`winningLine` (the winning line's three cell indices) on the returned state, alongside `result`
(no new CA-ID — per D9, both fields belong to the one response of a single `applyMove` call).
`data-model.md` and `contracts/engine-api.md` updated to match. Two new tasks appended to
`specs/001-engine/tasks.md` (T-058 RED, T-059 GREEN) to extend the existing CA-M-12 test and
implement the field in `src/engine.js`. `specs/003-interface/spec.md`'s CA-I-04 updated to cite
`state.winningLine` instead of describing a gap.

**Alternative considered and rejected**: have `src/ui.js` duplicate the 8-line array itself to
compute the winning line locally. Rejected because it would violate constitution P2 (UI consumes
the engine, does not reimplement its rules) and create a second copy of `WINNING_LINES` that
could silently drift from the engine's if that constant ever changed.

**Result**: T-058 (RED, commit `71d9e29d588250cd6f9df939aa33af3f018b4613`) and T-059 (GREEN,
commit `cef0a5b25c62f45d84f56b3d345cbe1b5f602821`) run through `/speckit-implement`, one commit
per task, RED before GREEN. `src/engine.js` now sets `winningLine` (the matching line's three
cell indices, or `null`) in both the placement and movement paths of `applyMove`, and
`createGame` includes `winningLine: null` in the initial state. `npm test` 64/64 green;
`npm run verify:traceability` exits 0 (`001-engine: OK: all 20 CA-IDs fully traced`,
`002-agents: OK: all 17 CA-IDs fully traced`, 37/37 combined). `specs/001-engine/traceability.md`
updated with both SHAs; `spec.md`'s Functional Requirements table CA-M-12 row changed from
`⚠️ amended, pending T-058/T-059` to `✅ ready`.

---

## BUG-006: `plan.md` claimed the traceability verifier already covered `002-agents`; it never did

**Found**: 2026-07-27 | **Status**: Fixed

**Detection**: While closing T-057 (traceability closure for `002-agents`), reading
`scripts/verify-traceability.mjs` before relying on its `OK: all 20 CA-IDs fully traced` output
showed the script was hardcoded end to end to `001-engine`: `SPEC_PATH`, `TASKS_PATH`, and
`TESTS_DIR` all pointed literally at `specs/001-engine/...` and `tests/engine/`, and its
`CA_ID_RE` was `/CA-M-\d+/g` — a pattern that cannot match `CA-A-*` IDs even if the paths had been
right. Every `npm run verify:traceability` run during this implementation session (T-034–T-056)
had therefore only ever re-checked `001-engine`'s already-closed 20 criteria; it never once
inspected `specs/002-agents/`, `tests/agents/`, or any `CA-A-*`/`CA-N-01` ID.

**Diagnosis**: Not a spec-first bug — `spec.md`'s CA-A-* criteria were all correctly written.
The defect was `specs/002-agents/plan.md`'s Constitution Check table (P6 row), which asserted:
"`scripts/verify-traceability.mjs` (built in `001-engine`) already scans any `CA-\d+` pattern
across specs/tasks/tests/git log; no change needed for the `CA-A-nn` prefix — ✅ Pass." That
sentence was written and marked "Pass" without re-reading the script it described, and it is
false in two independent ways at once (wrong regex, wrong paths). `/speckit-analyze` on
`002-agents` (2026-07-27, see BUG-003) did not catch this, and structurally could not have: it
cross-checks spec/plan/tasks/traceability/contracts/constitution *against each other* for
internal consistency — it has no step that executes or reads `scripts/verify-traceability.mjs`
itself to verify a claim made *about* the tool's behavior. The gap survived an entire planning
cycle and 23 implementation tasks because nothing in the process actually depended on the
script covering `002-agents` until T-057, the one task whose entire job is to run it.

**Fix**: `scripts/verify-traceability.mjs` generalized to iterate every `specs/<NNN-name>/`
directory containing both a `spec.md` and a `tasks.md` (skipping a feature that hasn't reached
`/speckit-implement` yet, rather than erroring), deriving each feature's tests directory from its
name (`NNN-name` → `tests/<name>`) and using the generic `CA-[A-Z]+-\d+` pattern. Reports per
feature (one block per `<featureDir>:`, so an orphan is immediately attributable), plus a final
combined total. Extraction of `SPEC_IDS`/`TASKS_IDS` was additionally tightened to only count a
`CA-ID` that opens a markdown table row (`| CA-X-NN | ...`): both spec files contain prose that
cites a sibling or cross-feature `CA-ID` in passing (`002-agents/spec.md` cites `CA-M-12` as a
parametrization example; `001-engine/spec.md` cites `CA-N-01` to explain why it isn't covered
there), and the original unfiltered substring match would have counted those mentions as if the
file were defining the criterion — a new class of false orphan that only appears once the script
reads text it was never pointed at before. `specs/001-engine/plan.md` § Traceability Verifier
Design amended with a note explaining the original design was `001-engine`-specific and recording
the generalization; `specs/002-agents/plan.md`'s P6 row corrected to stop asserting the false
claim and point at this entry instead.

**Result**: `npm run verify:traceability` now reports per feature — `001-engine: OK: all 20
CA-IDs fully traced` and `002-agents: OK: all 17 CA-IDs fully traced`, `OK: all 37 CA-IDs fully
traced across 2 feature(s)` overall. `npm test` unaffected throughout (63/63 green both before
and after this fix — this was a tooling-only change, no production or test code touched).

**Lesson**: same underlying pattern as BUG-003 and BUG-004, one level further out — a derived
artifact (`plan.md`) made a factual claim about a *shared tool's* behavior instead of about
spec/plan/tasks consistency, and no process step exists whose job is to verify claims of that
shape. `/speckit-analyze` checks artifacts against each other; it does not execute tooling to
confirm a plan's description of that tooling is accurate. Any future plan that asserts "no change
needed" about a piece of existing tooling should be treated as a claim requiring verification —
by reading or running the tool — before being marked "✅ Pass", not assumed true because a
previous feature already built the tool.

---

## BUG-005: T-046's CA-A-09 fixture was an unwinnable fork, not a fair test position

**Found**: 2026-07-27 | **Status**: Fixed

**Detection**: While implementing T-047 (continuous-mode minimax + horizon cutoff), running the
real search against T-046's committed CA-A-09 fixture (`O` owning `{0,1,6,7}` from an earlier
draft, later `{1,4,6}`) returned a move that still lost to the opponent's very next reply — for
every one of the 9 legal moves available to the complex level, minimax's own evaluation (verified
with a standalone debug script, both with and without a depth-preference tie-break on the
terminal scores) returned `LOSS_SCORE`. The real search agreed unanimously that the position was
lost no matter what; this was not a search bug.

**Diagnosis**: Not a spec-first bug — CA-A-09 itself is fine. The fixture was the defect. `O`'s
three pieces were chosen to form a threat at one cell (e.g. via line `[1,4,7]`), but the same
pieces also shared the center cell with a second, unnoticed pair on a different line (e.g.
`[2,4,6]`), producing two independent one-move wins for `O` on two different cells. A single `X`
move can occupy only one cell, so this is a genuine fork: unblockable in one ply, and (as
confirmed by the exhaustive search) unrecoverable within the horizon either. `plan.md`'s
calibration-position guidance explicitly calls for positions "with no immediate win or forced
loss present" precisely to avoid this — the fixture violated its own design constraint, and
nothing before T-047 actually ran a real search against it to catch that (T-046's RED check only
needed the naive stub to fail, which it did, for the wrong reason: any move loses, so the stub's
arbitrary first move losing proved nothing about blocking specifically).

**Fix**: Rebuilt the fixture from scratch with a documented, hand-verified single-threat
position (`O` at `{0,3,7}` with a movement-only threat completed by moving the piece at `7` to
`6`, keeping `0` and `3` in place; `X` at `{1,4,8}`) and checked by exhaustive enumeration of the
8 winning lines that no other 2-owned/1-empty pattern exists for either side before writing the
assertions — the same discipline BUG-002's fix established for `001-engine`'s movement-phase
fixtures. Verified with a standalone script that the real minimax search (a) finds a fully safe
move (blocking cell `6`) and (b) that this differs from the arbitrary first legal move in
`legalMoves` enumeration order, so the RED state before T-047 is a genuine test of the missing
search, not an artifact of an unwinnable position. `tests/agents/us-a1-complex.test.js` updated
in a commit separate from T-047's GREEN commit, T-046 itself left untouched (same convention as
BUG-002's T-023).

**Result**: Re-run against the committed T-046 stub: fails as expected (`moves[0]` doesn't block,
opponent wins). Re-run against the real T-047 search: passes, resolves in ~11 ms. `npm test`
green throughout except for the intentional RED window.

**Lesson**: same underlying lesson as BUG-002, now recurring for the agents feature — a
hand-built board fixture that involves 2+ marks of the same player on a shared line needs an
exhaustive check against all 8 winning lines (not just the one line the fixture author had in
mind) before it's trustworthy, especially once a mark sits on a highly-connected cell like the
center. This applies doubly to continuous-mode fixtures, where an unnoticed second threat doesn't
just make a test fixture wrong — it can make the *position itself* uncoverable by any level,
silently turning a "does the agent search correctly" test into "is this position lost," which is
a different and unintended question.

---

## BUG-004: `tasks.md`'s T-041 pseudocode described an algorithm that cannot satisfy CA-A-16

**Found**: 2026-07-27 | **Status**: Fixed

**Detection**: While implementing T-041 (medium block-next-turn), the pseudocode in `tasks.md`
was followed literally: for each candidate move, apply it, then check whether *any* of the
opponent's `legalMoves` on the resulting state would set `result` to the opponent's mark; return
the first candidate for which *none* do. The CA-A-16 test (double-threat fixture: two distinct
cells, each independently completing a line for the opponent) failed after this implementation —
`chooseMove` returned an arbitrary non-blocking cell instead of one of the two threat cells.

**Diagnosis**: Not a spec-first bug — `spec.md`'s CA-A-05, CA-A-15, and CA-A-16 were all correct
and unambiguous. The defect was in `tasks.md`'s implementation description: under a genuine
double threat, occupying one threatened cell never clears the other, so the opponent can always
still win through the remaining cell on their next turn. The condition "none of the opponent's
replies would set `result`" is therefore never true for *any* candidate once two or more real
threats exist, so the described two-ply lookahead always falls through to the arbitrary
`moves[0]` fallback — which has no reason to be a threat cell. The algorithm was never viable for
the double-threat case it was written to cover; single-threat (CA-A-05) worked only by
coincidence, since with exactly one threat, blocking it does make "none do" true.

**Fix**: `specs/002-agents/tasks.md`'s T-041 description rewritten to match the algorithm
actually implemented in `src/agents.js` (commit `c94095d`): a direct, single-ply check — for each
candidate move, ask whether that same cell, played by the opponent instead, would immediately set
`result` to the opponent's mark; return the first candidate for which it does. This blocks
whichever threat is encountered first by construction (CA-A-16, "blocks exactly one of those
opponent moves"), and is behaviorally identical to the discarded two-ply version whenever there is
only one threat (CA-A-05). A correction note was added directly under T-041 in `tasks.md`
explaining why the two-ply pseudocode was discarded. **CA-A-05, CA-A-15, and CA-A-16 in
`spec.md` did not change** — only the derived implementation-plan description did.

**Result**: `npm test` remained green throughout (the fix was applied before T-041's GREEN commit
was made, so no regression was ever committed); `tasks.md` and `src/agents.js` are now
consistent. `npm run verify:traceability` unaffected (still validates only `001-engine`'s 20
CA-IDs; `002-agents`'s `traceability.md` is filled at T-057).

**Lesson**: same pattern as BUG-003, one level lower in the artifact hierarchy — there,
`plan.md`/`contracts/agents-api.md` had drifted from the constitution; here, the actual
implementation correctly satisfies `spec.md` while `tasks.md`'s own suggested algorithm does not.
`tasks.md` pseudocode is a *plan*, not the spec — when an implementer finds it doesn't actually
satisfy the criterion it claims to cover, the fix is to correct the plan-level artifact (with a
note explaining why), not to force a non-viable algorithm into working, and not to weaken the
test until it passes.

---

## BUG-003: `/speckit-analyze` found a derived artifact contradicting the ratified constitution

**Found**: 2026-07-27 | **Status**: Fixed

**Detection**: Running `/speckit-analyze` on `002-agents` (spec, plan, tasks, traceability, and
`contracts/agents-api.md` all complete, no code written yet) surfaced a CRITICAL finding: P2 of
`.specify/memory/constitution.md` (v1.0.0) states verbatim `chooseMove(state, level, memory) →
{move, memory'} — MUST be deterministic`, with no per-level qualification. `plan.md` and
`contracts/agents-api.md` had already declared a "contract change" — a 4-field `Decision` return
shape plus an optional `options` parameter, and a `simple` level that is intentionally
non-deterministic (uniform random pick, D-R-01) — but both documents only addressed superseding
`CLAUDE.md`'s informal sketch of the same contract, never the identical text embedded in the
constitution itself. `plan.md`'s Complexity Tracking section, where any exception to a principle
must be documented per Governance, was left empty ("No constitution violations").

**Diagnosis**: This is not a spec-first bug in the gameplay sense — no test was wrong and no
criterion was ambiguous. The root cause is procedural: the constitution is supposed to be the
highest artifact in the hierarchy (`Constitution > spec.md > plan.md > tasks.md > code`), but a
downstream artifact (`plan.md`) had drifted from it without going through the Amendment Procedure
(Governance § Amendment Procedure: issue with `governance` label, ≥3/4 approval, semver bump).
Two options were on the table: (a) document the mismatch as an exception in `plan.md`'s
Complexity Tracking section, or (b) amend the constitution itself, since it was the one asserting
a contract the project had already stopped honoring. The group chose (b): per Governance's own
rationale (constitution is the source of truth), leaving it stating something false is worse than
correcting it through the defined procedure.

**Fix**: `.specify/memory/constitution.md` amended to v2.0.0 (MAJOR — backward-incompatible
redefinition of an existing principle's normative contract): P2's `chooseMove` contract updated
to `(state, level, memory, options?) → {move, memory, nodesEvaluated, resolvedFromMemory}`, MUST
be deterministic narrowed to `medium`/`complex` only, with `simple`'s non-determinism (CA-A-02,
D-R-01) and the `nodesEvaluated`/`resolvedFromMemory` fields (D7) called out by name. A new
`SYNC IMPACT REPORT` addendum and a new "Amendment History" section under Governance record the
version change, the date, and the motivating decision (D7, `specs/002-agents/spec.md`). No
exception was added to `plan.md`'s Complexity Tracking — the constitution was corrected instead,
per explicit group instruction. Commit `f6a8c62798c595e634cd07b37105587ff4580f9e`.

Separately (not a constitution issue, but found in the same analysis pass): `tasks.md`'s original
T-047 bundled a new code layer (continuous-mode static evaluation + horizon cutoff, CA-A-09) with
an open-ended calibration loop, flagged as the task most likely to exceed a single commit. Split
into T-047 (implementation) and T-048 (calibration); every task after it renumbered by one
(23 → 24 tasks, T-034–T-057). Recorded in this same commit as this log entry.

**Result**: The constitution and `tasks.md` are internally consistent again — P2 now describes
the contract `plan.md`/`contracts/agents-api.md` already implement, and every criterion in
`spec.md` still maps to exactly one RED task and one GREEN task in `tasks.md` (verified by the
Coverage Audit table). No code exists yet for `002-agents`, so no `npm test`/`verify:traceability`
run was affected.

**Lesson**: a spec-first workflow's derived artifacts (`plan.md`, contracts) can legitimately
declare a "supersedes" note against an *informal* sketch like `CLAUDE.md`'s Contracts section, but
the same text living inside the *ratified constitution* is not informal — it is the artifact
Governance calls authoritative. `/speckit-analyze` should be run against the constitution
explicitly, not only against spec/plan/tasks consistency, whenever a plan declares any contract
change — the drift here existed for a full planning cycle before being caught.

---

## BUG-002: CA-M-16 test fixture (T-023) used a movement that completed a winning line

**Found**: 2026-07-26 | **Status**: Fixed

**Detection**: While implementing T-026 (winner scan in the movement path, CA-M-17), the
previously green D3 sub-test of `CA-M-16 — legal movement` (from T-023) broke: it started
returning `{error: true, reason: 'game_over'}` on its second `applyMove` call instead of a
new state.

**Diagnosis**: Unlike BUG-001, this is **not** a spec-first correction — the spec and the
engine were both correct. The defect was in the test fixture itself. T-023's `CA-M-16` test
used `reachMovementPhase()` (X at {0,2,4}, O at {1,3,5}, turn X) and then moved X from cell 0
to cell 6. Nobody checked, at the time that fixture was written, whether that move completed
one of the 8 fixed winning lines — it does: X ends up at {2,4,6}, the anti-diagonal. Before
T-026 existed, the movement path did not scan for a winner at all, so the test passed anyway,
for the wrong reason: it never exercised the "does this move complete a line" question it
implicitly assumed the answer to (no). Once T-026 added the winner scan the engine correctly
set `result: 'X'` after that move, and the D3 sub-test's next `applyMove` call — which assumed
the game was still ongoing — was correctly rejected with `game_over`.

**Fix**: `tests/engine/us-m3-phases.test.js` (`CA-M-16` describe block) rewritten to use a
neutral move (X from 0 to 7, landing at {2,4,7} — not one of the 8 lines) for both the base
"legal movement" test and the D3 return-to-vacated-cell sequence (X 0→7, O 1→6, X 7→0). Every
intermediate board in the new sequence was verified with a small brute-force script (checking
`result` against all 8 `WINNING_LINES` after each move) *before* the assertions were written,
the same discipline used for CA-M-17's states. Commit `bfe0a61`.

**Result**: `npm test` green again, 31/31, including both `CA-M-16` sub-tests and the CA-M-17
win-detection test added alongside T-026. No production code changed — only the test fixture.

**Lesson**: a test that passes before the behavior it exercises has been implemented may be
passing for the wrong reason. Winner-detection didn't exist yet when T-023 was written, so the
test's implicit assumption ("this move doesn't win") was never actually checked by anything —
it just happened to not matter yet. The fix in BUG-002's report for CA-M-17 (T-025) — verifying
against `WINNING_LINES` with a script before writing assertions — should be standard practice
for any fixture in movement-phase tests going forward, not just for CA-M-17.

---

## BUG-001: Traceability verifier accepted `docs:` commits as implementation evidence

**Found**: 2026-07-26 | **Status**: Fixed

**Detection**: After implementing T-001–T-010 and running `npm run verify:traceability`,
the orphan report showed `CA-M-15` and `CA-M-20` missing only from `tests` (not from
`git log`), even though neither criterion had any implementation or RED-test commit yet.
Every other unimplemented criterion (CA-M-07 through CA-M-19, excluding CA-M-15/CA-M-20)
correctly showed as missing from both `tests` and `git log`. The inconsistency was the tell:
two specific IDs looked "half traced" for no implementation reason.

**Diagnosis**: Step 4 of the verifier algorithm, as specified in `plan.md` §
"Traceability Verifier Design", was `git log --pretty=format:"%s" | extract /CA-M-\d+/` —
an unfiltered substring match over every commit subject in history. Two earlier `docs:`
commits happened to mention these IDs in passing while documenting the `/speckit-analyze`
corrections (one about fixing CA-M-15's redundancy in the spec, one about adding CA-M-20):
neither commit implemented anything, but the verifier could not tell the difference between
"this ID was implemented" and "this ID was merely typed in a commit message." The algorithm
was too permissive: it treated commit-subject substring presence as proof of coverage, when
the actual requirement (constitution P6) is proof of an implementing commit.

**Fix**:
- `specs/001-engine/plan.md` step 4 rewritten to filter `git log` subjects to only those
  matching `/^T-\d+:/` or `/^test\(.+\):/` (the task/RED commit-message conventions from
  `CLAUDE.md` § Naming Conventions) before extracting CA-IDs — commit `706bafc`.
- `scripts/verify-traceability.mjs` regenerated to match the corrected algorithm (added
  `TASK_COMMIT_RE` filter before the `extractIds` call on commit subjects) — commit `809f0d8`.
- Per constitution P3/P7, the plan was corrected first and the script regenerated from it
  second, in two separate commits — the tooling is held to the same spec-first discipline
  as game logic, not patched ad hoc.

**Result**: Re-running `npm run verify:traceability` after the fix shows `CA-M-15` and
`CA-M-20` correctly listed as `missing in: tests, git log`, consistent with every other
unimplemented criterion. `CA-M-01`–`CA-M-06` (implemented in T-003–T-010) remain correctly
absent from the orphan list. `npm test` unaffected (7/7 green throughout).
