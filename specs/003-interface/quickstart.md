# Quickstart: Game Interface

**Branch**: `main` (003-interface) | **Date**: 2026-07-27 | **Phase**: 1

Validates that `003-interface`, once implemented, actually works end-to-end. This is a run guide,
not an implementation spec — see `data-model.md`, `contracts/`, and `research.md` for the design.

## Prerequisites

- `001-engine` and `002-agents` complete (`src/engine.js`, `src/agents.js` exist and export
  `createGame`/`legalMoves`/`applyMove`/`chooseMove` per their contracts). Confirmed: both
  closed, `npm test` 64/64 green as of this plan (see `CLAUDE.md` Current Status).
- `jsdom` added to `devDependencies` (`research.md` D-I-02) — required once, at the first task
  that adds a UI test file.

## Setup

```bash
npm install        # picks up the new jsdom devDependency once package.json is updated
npm test           # full suite: engine (node env) + agents (node env) + interface (jsdom env)
```

## Automated validation

```bash
npm test                     # all CA-I-nn / CA-N-02 / CA-N-03 automated tests, plus the
                              # responsive-static structural checks (research.md D-I-04)
npm run verify:traceability  # must report "003-interface: OK: all 34 CA-IDs fully traced"
                              # (32 CA-I-nn + CA-N-02 + CA-N-03) once implementation closes
```

## Manual validation (required — see `manual-verification.md`)

```bash
npm run dev
```

Follow `manual-verification.md`'s checklist at each listed viewport width. This is the
authoritative check for CA-I-28–CA-I-32's rendered layout and CA-I-17's rendered focus
visibility — the automated suite only proves a necessary subset (see `research.md` D-I-04).

## End-to-end scenario (manual, mirrors US-I-2's independent test)

1. Load the app fresh — `CONFIGURATION` state, all four controls visible, start disabled.
2. Select human vs. human, marks X/O, classic mode. Start — transitions to `IN_GAME`.
3. Play a full game to a win. Verify: turn indicator updates every move; an illegal move (click
   an occupied cell) is rejected with a stated reason and the board is unchanged; the winning
   line highlights with a non-color marker and further clicks are blocked; the scoreboard's
   winning mark count increments by one.
4. Restart. Verify: back in `CONFIGURATION`; scoreboard counts unchanged.
5. Configure human vs. complex agent, continuous mode. Start; make a placement; verify the state
   machine enters `WAITING_FOR_AGENT`, the board disables, and it stays disabled for a
   perceivable moment (not instantaneous) before returning to `IN_GAME` with the agent's move
   applied. Play into the movement phase; verify own-mark selection highlights legal destination
   cells (CA-I-07/CA-I-25), and reselecting the same mark cancels the selection (CA-I-27).
6. Using only the keyboard, repeat step 2–3 for a fresh game: Tab through configuration with
   visible focus, arrow-key across the board, Enter/Space to place, and confirm a screen-reader
   announcement fires on each turn change without focus leaving the board.

## Expected outcome

`npm test` fully green, `npm run verify:traceability` reports 0 orphans for `003-interface`,
and the manual scenario above completes without any step contradicting a `CA-I-nn` criterion in
`spec.md`.
