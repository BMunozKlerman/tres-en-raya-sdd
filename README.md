# Tres en Raya SDD

Tic-tac-toe built with the Spec-Driven Development workflow of Spec Kit
(`constitution → specify → plan → tasks → implement`). See `CLAUDE.md` for process rules
and `specs/001-engine/` for the current feature's artifacts.

## Technical Notes

- **`npm audit` — 4 known vulnerabilities (2 moderate, 1 high, 1 critical), accepted**:
  `npm audit` reports vulnerabilities inherited from the `esbuild` dependency of Vite 5.x /
  Vitest 1.x, limited to the Vite dev server (a malicious website could send requests to a
  locally running dev server and read the response). These are not fixed because the only
  available fix (`npm audit fix --force`) upgrades to Vite 8, a breaking change that
  contradicts the fixed stack mandated by constitution P1 (Vite 5.x / Vitest 1.x, as recorded
  in `specs/001-engine/plan.md`). This is a conscious decision, not an oversight: changing the
  pinned stack requires a governance amendment (constitution § Amendment Procedure), not an
  unreviewed dependency bump. The risk is accepted because the dev server is never exposed
  outside the local machine during this project.
