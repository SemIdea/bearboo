---
type: gotcha
description: 'Hooks (pre-commit/pre-push) — run scoped tests, not the full suite'
load: warm
fires_on: event
fires_when: 'if you are committing or pushing a change and want to know which tests run (or why a red test blocks the commit itself).'
---

# Hooks (pre-commit/pre-push) — run scoped tests, not the full suite

**Trigger:** if you are committing or pushing a change and want to know which tests run (or why a red test blocks the commit itself).

**Behavior:** both hooks read the same `.lintstagedrc.json`:
- `.husky/pre-commit` runs `lint-staged`, which calls `vitest related <staged files>` on every staged `src/**/*.ts` — **a test that fails for the staged change blocks the commit itself**. TDD consequence: a commit cannot carry a red test; RED and GREEN for one task share one commit.
- `.husky/pre-push` (since 2026-07-16) runs `lint-staged --diff "origin/main...HEAD"` instead of `yarn test` (the full suite) — that is, **it only runs tests linked to the changed files**. Benefit: pre-push stays fast (seconds instead of minutes). Risk: it does not catch breaks in files that are not directly related — especially relevant in a project with **shared mocks in serial state** (`src/test/setup.ts` seam, ADR-0011). Example: a test for `src/server/features/user/procedures/login.ts` is changed; pre-push **does not run** the tests for `src/server/features/auth/procedures/verifyToken.ts` if there is no direct import.
- The `lint-staged` key inside `package.json` is **dead config**: when `.lintstagedrc.json` exists, `lint-staged` uses the file and ignores the key.

**Solution:** Phase 10 (CI/CD) is live — `.github/workflows/ci.yml` runs the full suite (`test` job) plus `lint`, `typecheck`, `build`, and `integration` at the PR, so the cross-module break the scoped hooks miss is caught before merge. Locally:
- Run `yarn test` (full suite) before a push when the change touches several modules or something used by the shared mocks (`src/test/setup.ts`, ADR-0011).
- Do not try to commit a failing test to "prove RED" — the hook rejects it; keep RED and GREEN in one commit.

**Ref:** `docs/research/003-pre-push-scoped-tests.md` (decision: Option 2 — lint-staged + vitest related); the pre-commit behavior lived in `docs/features/028-health-check/` (2026-09-16, the T004 commit was rejected by the hook).
