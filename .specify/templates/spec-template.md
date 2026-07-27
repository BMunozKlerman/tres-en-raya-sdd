# Feature Specification: [FEATURE NAME]

**Feature Branch**: `[###-feature-name]`
**ID Area**: `[M | A | I | N]` ← prefix used for all CA-<area>-<nn> IDs in this spec

**Created**: [DATE]

**Status**: Draft

**Input**: User description: "$ARGUMENTS"

<!--
  LANGUAGE: All content in this spec must be written in English.
  Exception: specs/003-interface/spec.md — see language convention in CLAUDE.md.
-->

## User Stories *(mandatory)*

<!--
  Label stories as US-<area>-<n> (e.g., US-M-1). Each story must be independently
  testable: implementing only one story must produce a verifiable MVP.
  Assign priorities P1 (most critical) → P2 → P3…

  PROHIBITED WORDS in criteria — P4 of the Constitution:
  correctly · intuitive · fast · reasonable · appropriate · user-friendly
  If a word does not name a concrete test assertion → rewrite the criterion.

  Valid EARS forms (exactly one per criterion):
    THE SYSTEM SHALL <response>
    WHEN <event>, THE SYSTEM SHALL <response>
    WHILE <state>, THE SYSTEM SHALL <response>
    IF <condition>, THEN THE SYSTEM SHALL <response>
    WHERE <feature>, THE SYSTEM SHALL <response>

  One criterion = exactly ONE observable result = exactly ONE test.
  Ambiguity → mark [NEEDS CLARIFICATION: <description>] in the Notes column
  and resolve in "Pending Decisions" before running /speckit-tasks.
-->

### US-[area]-1 · [Brief Title] (Priority: P1)

[Describe the user journey in plain language, without mentioning technology.]

**Why P1**: [Value delivered and reason for this priority]

**Independent test**: [How to verify this story alone, without the others]

**Acceptance criteria** (EARS notation):

| ID | EARS Criterion | Notes |
|----|----------------|-------|
| CA-[area]-01 | WHEN [event], THE SYSTEM SHALL [single observable response] | |
| CA-[area]-02 | IF [condition], THEN THE SYSTEM SHALL [single observable response] | [NEEDS CLARIFICATION: ...] if applicable |

---

### US-[area]-2 · [Brief Title] (Priority: P2)

[Describe the user journey in plain language.]

**Why P2**: [Value and priority]

**Independent test**: [How to verify this story alone]

**Acceptance criteria** (EARS notation):

| ID | EARS Criterion | Notes |
|----|----------------|-------|
| CA-[area]-NN | WHEN [event], THE SYSTEM SHALL [single observable response] | |

---

### US-[area]-3 · [Brief Title] (Priority: P3)

[Describe the user journey in plain language.]

**Why P3**: [Value and priority]

**Independent test**: [How to verify this story alone]

**Acceptance criteria** (EARS notation):

| ID | EARS Criterion | Notes |
|----|----------------|-------|
| CA-[area]-NN | THE SYSTEM SHALL [single observable response] | |

---

[Add more US-[area]-N as needed, each with an assigned priority.]

### Edge Cases

<!--
  Every edge case that produces behavior different from the happy path MUST have its own
  CA-ID. Do not describe handling "in general"; specify the exact system response.
-->

| ID | Edge Case | EARS Criterion |
|----|-----------|----------------|
| CA-[area]-NN | [boundary condition] | IF [condition], THEN THE SYSTEM SHALL [response] |
| CA-[area]-NN | [error scenario] | WHEN [error event], THE SYSTEM SHALL [response] |

### Out of Scope

<!--
  Explicitly list what this feature does NOT cover. Prevents scope creep during implement.
-->

- [Excluded behavior 1]
- [Excluded behavior 2]

### Pending Decisions [NEEDS CLARIFICATION]

<!--
  Every ambiguity marked with [NEEDS CLARIFICATION] in the criteria tables MUST be
  resolved here before running /speckit-tasks. No pending rows = spec ready.
-->

| # | Question | Decision | Owner | Date |
|---|----------|----------|-------|------|
| 1 | [Detected ambiguity] | _pending_ | | |

## Requirements *(mandatory)*

<!--
  This section is the consolidated index of all EARS criteria in the spec.
  Criteria live in the acceptance-criteria tables of each User Story and in Edge Cases above.
  This index exists so /speckit-plan and /speckit-tasks can reference all criteria without
  scanning each story individually.

  Instructions:
  1. Copy each CA-ID here with its full EARS criterion text.
  2. Indicate which US it belongs to.
  3. Do not paraphrase: the EARS text must be identical to the source table.
  4. Mark with ⚠️ any criterion that still has an unresolved [NEEDS CLARIFICATION].
-->

### Functional Requirements

| CA-ID | US | EARS Criterion | Status |
|-------|----|----------------|--------|
| CA-[area]-01 | US-[area]-1 | WHEN [event], THE SYSTEM SHALL [response] | ✅ ready |
| CA-[area]-02 | US-[area]-1 | IF [condition], THEN THE SYSTEM SHALL [response] | ⚠️ pending |
| CA-[area]-NN | US-[area]-2 | WHEN [event], THE SYSTEM SHALL [response] | ✅ ready |
| CA-[area]-NN | Edge Cases | IF [condition], THEN THE SYSTEM SHALL [response] | ✅ ready |

### Key Entities *(include if feature involves data)*

<!--
  Describe what each entity represents and its relationships. No implementation detail
  (data types, concrete field names → those go in plan.md).
-->

- **[Entity 1]**: [What it represents, attributes relevant to behavior]
- **[Entity 2]**: [Relationships to other entities]

## Success Criteria *(mandatory)*

<!--
  Mapped to CA-IDs where possible. Technology-agnostic and measurable.
  If a success criterion covers several CA-IDs, list all of them.
-->

| ID | Measurable Outcome | CA-IDs Covered |
|----|--------------------|----------------|
| SC-001 | [Concrete, verifiable metric] | CA-[area]-NN |
| SC-002 | [Concrete, verifiable metric] | CA-[area]-NN, CA-[area]-NN |

## Assumptions

<!--
  Assumptions that, if changed, would invalidate criteria in this spec. If an assumption
  changes, review the affected CA-IDs before continuing.
-->

- [Assumption about target users or usage context]
- [Assumption about scope boundaries]
- [Assumption about the environment or existing system]
- [Dependency on another feature or service]
