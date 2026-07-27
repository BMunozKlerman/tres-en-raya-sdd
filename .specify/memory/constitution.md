<!--
SYNC IMPACT REPORT
==================
Version change: (template, 0.0.0) → 1.0.0
Bump rationale: MAJOR — first adoption from blank template; 9 governance principles defined
where none existed before. Future changes that remove or redefine a principle are MAJOR;
adding one is MINOR; clarifications and wording fixes are PATCH.

Base language: English (all generated artifacts). Game UI displayed in Spanish to the player.

Principles added (all new — no prior content):
  P1 · Fixed Stack
  P2 · Pure Layered Architecture
  P3 · Spec as the Source of Truth
  P4 · EARS Requirements
  P5 · Verification Gate (NON-NEGOTIABLE)
  P6 · Traceability (NON-NEGOTIABLE)
  P7 · Spec-First Debugging (NON-NEGOTIABLE)
  P8 · Human Review
  P9 · Non-Functional Requirements

Sections added:
  - Core Principles (P1–P9)
  - Non-Functional Requirements
  - Development Workflow
  - Governance

Templates reviewed:
  ✅ .specify/templates/plan-template.md — reviewed; "Constitution Check" aligned with P1–P9.
     No changes required in the template text (gates are filled at execution time).
  ✅ .specify/templates/spec-template.md — updated to EARS + CA-IDs format; Given/When/Then
     replaced with EARS tables; Functional Requirements preserved as a consolidated index.
  ✅ .specify/templates/tasks-template.md — reviewed; phase model and test-first requirement
     (P5) are compatible with the current template.

Follow-up TODOs:
  - TODO(INTERFACE_MAPPING): specs/003-interface/spec.md must include a table mapping the
    5 mandatory interface criteria (in Spanish, from the assignment) to their English CA-I-nn
    IDs, quoting the original Spanish text for auditability.
-->

# Tic-Tac-Toe SDD — Project Constitution

## Core Principles

### P1 · Fixed Stack

The technology stack is **Vite + vanilla JavaScript (ES modules) + Vitest**.

- MUST NOT introduce UI frameworks (React, Vue, Svelte, etc.) or additional runtime
  dependencies. Only `devDependencies` are permitted: those required for Vite and Vitest.
- The project MUST be cloneable and runnable in three steps or fewer; those steps MUST be
  documented in `README.md` and verified after every configuration change.
- Any proposal to add a dependency requires explicit group approval and documentation in the
  `plan.md` of the relevant feature with a technical justification.

**Rationale**: A minimal stack ensures all team members can review and run the code without
special setup, and that the process evaluation is reproducible.

### P2 · Pure Layered Architecture

Code MUST be distributed across three layers with dependencies flowing in one direction only:

```
UI  →  Agents  →  Engine
```

- `src/engine.js` — pure engine: rules, modes, phases. MUST NOT access the DOM or timers.
  MUST NOT import agents or UI.
- `src/agents.js` — pure agents (simple, medium, complex levels). MUST NOT access the DOM or
  timers. MUST NOT import UI.
- `src/ui.js` — rendering and events. MUST consume the engine and agents API; MUST NOT
  reimplement any game rule.

**Immutable state**: `applyMove(state, move)` MUST return a new state object. An illegal move
MUST return `{error, reason}` and leave the original state intact (no mutation).

**Public engine contracts**:
- `legalMoves(state) → Move[]`
- `applyMove(state, move) → state' | {error, reason}`
- `chooseMove(state, level, memory) → {move, memory'}` — MUST be deterministic.

**Rationale**: The separation ensures the engine and agents are testable in Vitest without a
browser, and that the UI can be replaced without affecting game logic.

### P3 · Spec as the Source of Truth

The accepted behavior of the system lives exclusively in `specs/<feature>/spec.md`.
Plan, tasks, tests, and code are **derived** artifacts of the spec.

- MUST NOT start any behavioral change by modifying code or tests directly.
- The work sequence is, always and in this order:
  `specify → clarify → plan → tasks → analyze → implement`.
- One feature at a time: `001-engine → 002-agents → 003-interface`.
- Any ambiguity detected in any artifact MUST be recorded as a pending decision in the spec
  before continuing (see P4).

**Rationale**: The diploma evaluation weights process at 60%. The spec is the audited evidence
that every decision was made before writing code.

### P4 · EARS Requirements

Every acceptance criterion MUST:

1. Use exactly one of the five EARS forms:
   - `THE SYSTEM SHALL <response>`
   - `WHEN <event>, THE SYSTEM SHALL <response>`
   - `WHILE <state>, THE SYSTEM SHALL <response>`
   - `IF <condition>, THEN THE SYSTEM SHALL <response>`
   - `WHERE <feature>, THE SYSTEM SHALL <response>`
2. Carry a stable ID in the format `CA-<area>-<nn>` (areas: `M` engine · `A` agents ·
   `I` interface · `N` non-functional).
3. Describe **exactly one** observable, mechanically verifiable response.
4. MUST NOT contain the words: *correctly, intuitive, fast, reasonable, appropriate,
   user-friendly*, nor any term whose truth cannot be verified mechanically.

Any ambiguity detected MUST be marked `[NEEDS CLARIFICATION: <description>]` in the spec and
MUST be resolved with an explicit decision recorded in that same spec before generating tasks.

**Rationale**: An ambiguous criterion produces an ambiguous test. EARS forces the specification
of the observable response that the test must assert.

### P5 · Verification Gate (NON-NEGOTIABLE)

- **Red before Green**: the test covering a criterion MUST be written and committed in a
  failing state (RED) **before** writing the corresponding production code.
- MUST NOT commit production code with failing tests, except for the initial RED commit of the
  test before implementation.
- Every `CA-*` criterion MUST be covered by at least one automated test whose `describe` or
  test name contains the exact `CA-ID`, before closing the task that covers it.
- `npm test` MUST pass green before every implementation commit.

**Rationale**: Writing tests red first proves the test is actually verifying something; without
this step, a vacuously passing test provides no evidence.

### P6 · Traceability (NON-NEGOTIABLE)

Every `CA-*` criterion MUST appear in all four of the following artifacts:

| Artifact | Format |
|----------|--------|
| `specs/<feature>/spec.md` | Criterion with its `CA-ID` |
| `specs/<feature>/tasks.md` | Task covering it declares `CA-IDs` in its description |
| Commit | Message format `T-NNN: description (CA-X-NN, ...)` |
| Test | `describe('CA-X-NN', ...)` or test name contains `CA-X-NN` |

- MUST exist `specs/<feature>/traceability.md` recording for each task: `TaskID`,
  `CA-IDs covered`, and the **real** SHA of the commit (never invented).
- MUST exist `npm run verify:traceability` that cross-checks `spec.md`, `tasks.md`, tests,
  and git log, and **fails** if any `CA-ID` is absent from any of the four artifacts.
- MUST NOT squash commits. The commit history is the process evidence.

**Rationale**: Full traceability allows the evaluator to audit that every spec criterion has
its test and its commit, without relying on informal declarations.

### P7 · Spec-First Debugging (NON-NEGOTIABLE)

The bug-fix flow MUST follow this order, without exception:

1. Reproduce the bug as an automated failing test (RED).
2. Commit that test failing: `test(CA-X-NN): reproduce bug — expected failure`.
3. Identify the criterion in the spec that is incomplete or incorrect.
4. Correct `spec.md` with the right EARS wording.
5. Commit the corrected spec.
6. Regenerate the affected code so the test passes (Green).
7. Commit the implementation: `T-NNN: fix (CA-X-NN)`.

Manual edits to generated code are permitted **only** for non-behavioral details (UI text,
CSS, comments). Each manual edit MUST:
- Be recorded in the manual-edits table in `README.md`.
- Be reviewed by a team member other than the one who made it before committing.

MUST NOT patch any behavior covered by a `CA-*` criterion by hand.

**Rationale**: Treating bugs as spec gaps prevents the accumulation of invisible technical
debt and keeps the spec as the source of truth during maintenance as well.

### P8 · Human Review

- Every task closure MUST be reviewed by a team member other than the one who executed it,
  verifying: tests green, commit format correct, `traceability.md` updated.
- All four team members MUST be able to explain any spec and any section of the code.
- Every manual edit to generated code requires review by another team member (see P7).

**Rationale**: The evaluation includes a group presentation (10%). A team member who cannot
explain part of the code is evidence of a deficient process.

### P9 · Non-Functional Requirements

The following criteria are cross-cutting and MUST be verified before closing the feature
they belong to:

- **CA-N-01** (agents feature): `WHEN the agent computes its move in the worst-case board
  position, THE SYSTEM SHALL return the move in under 1 000 ms, measured at any level
  (simple, medium, complex).` Belongs in `specs/002-agents/spec.md`; MUST be testable
  without DOM, by measuring execution time directly on the pure `chooseMove` function.
- **CA-N-02** (interface feature): `THE SYSTEM SHALL be fully operable with a mouse at any
  point in the game.` Belongs in `specs/003-interface/spec.md`.
- **CA-N-03** (interface feature, desirable goal): `WHERE the browser receives keyboard focus,
  THE SYSTEM SHALL allow completing a full game without using the mouse.` Belongs in
  `specs/003-interface/spec.md`.

CA-N-01 MUST be covered by tests before closing `002-agents`.
CA-N-02 and CA-N-03 MUST be covered by tests before closing `003-interface`.

## Non-Functional Requirements

Non-functional requirements are specified as `CA-N-*` criteria (see P9) and share the same
lifecycle as functional ones: spec → RED test → implementation → traceability.

The `npm run verify:traceability` script MUST validate `CA-N-*` criteria the same way as all
other criteria.

## Development Workflow

The work sequence per feature is, **in this order with no steps skipped**:

```
/speckit-specify → /speckit-clarify → /speckit-plan → /speckit-tasks
  → /speckit-analyze → /speckit-implement (one task per invocation)
```

### Inside each `/speckit-implement`

1. Write the RED test with the `CA-ID` in the `describe`; show it fails.
2. Commit: `test(CA-X-NN): RED — <brief description>`.
3. Minimum production code to make the test pass.
4. `npm test` green (full suite).
5. Commit: `T-NNN: <description> (CA-X-NN, ...)`.
6. Record in `specs/<feature>/traceability.md`: TaskID, CA-IDs covered, real SHA of commit.
7. **Stop and report.** Do not chain the next task without explicit group instruction.

### Naming Conventions

| Artifact | Format |
|----------|--------|
| User story | `US-<area>-<n>` |
| Acceptance criterion | `CA-<area>-<nn>` |
| Task | `T-NNN` |
| Commit | `T-NNN: description (CA-X-NN, ...)` |
| Test | `describe('CA-X-NN', ...)` |

### Language

All artifact content MUST be written in English (spec.md, plan.md, tasks.md, traceability.md,
README.md, file names, identifiers, test names, commit messages, comments).

Exception: the player-facing game UI is displayed in Spanish. The code and tests covering it
remain in English. `specs/003-interface/spec.md` must include a table mapping the 5 mandatory
interface criteria (in Spanish, from the assignment) to their English CA-I-nn IDs.

### Blocking Decisions

Before executing any spec for a sub-area, the decisions listed in `CLAUDE.md` (table "Pending
Group Decisions") MUST be resolved and documented in the corresponding spec. MUST NOT advance
on a spec with rows still marked as pending.

## Governance

### Artifact Hierarchy

This constitution **SUPERSEDES** any other guide, convention, or individual preference. In case
of conflict between artifacts, the hierarchy is:

```
Constitution > spec.md > plan.md > tasks.md > code
```

### Amendment Procedure

1. Any team member may propose an amendment by creating an issue in the repository with the
   `governance` label.
2. The amendment MUST be approved by an absolute majority (≥ 3/4 members) in a documented
   meeting.
3. The approving member updates this document incrementing the version per semver:
   - **MAJOR**: removal or backward-incompatible redefinition of an existing principle.
   - **MINOR**: new principle or section with materially new guidance.
   - **PATCH**: clarifications, wording, typo fixes without semantic change.
4. The amendment MUST also be documented in the `plan.md` of the feature that motivated it,
   explaining why it was necessary.

### Exceptions

Any exception to a principle MUST:
- Be documented in the `plan.md` of the feature requiring it, in the "Complexity Tracking"
  section.
- Explain why the alternative without an exception is not viable.
- MUST NOT weaken principles P4 (EARS), P5 (test gate), P6 (traceability), or P7
  (spec-first). These four are absolute non-negotiables; no exceptions are admitted.

### Compliance Policy

- At every task closure (P8): verify P5 and P6.
- At every feature closure: run `npm run verify:traceability` and document the result.
- At the final presentation: every team member MUST be able to cite the CA-ID of any
  criterion asked and point to its test and commit.

**Version**: 1.0.0 | **Ratified**: 2026-07-26 | **Last Amended**: 2026-07-26
