---
type: gotcha
description: 'Pre-push hook — runs scoped tests, not the full suite'
load: warm
fires_on: event
fires_when: 'if you are pushing and want to understand why pre-push did not run your favorite test.'
---

# Pre-push hook — runs scoped tests, not the full suite

**Trigger:** if you are pushing and want to understand why pre-push did not run your favorite test.

**Behavior:** `.husky/pre-push` (since 2026-07-16) runs `lint-staged --diff "origin/main...HEAD"` instead of `yarn test` (the full suite). `lint-staged` uses the `.lintstagedrc.json` config that calls `vitest related <files>` — that is, **it only runs tests linked to the changed files**. Benefit: pre-push stays fast (seconds instead of minutes). Risk: it does not catch breaks in files that are not directly related — especially relevant in a project with **shared mocks in serial state** (`src/test/setup.ts` seam, ADR-0011). Example: a test for `src/server/features/user/procedures/login.ts` is changed; pre-push **does not run** the tests for `src/server/features/auth/procedures/verifyToken.ts` if there is no direct import.

**Solution:** **Pre-push is a fast local gate, and today it is the only automated gate that exists** — `docs/roadmap.md` Phase 10 (CI/CD) has not started (no `.github/workflows/`), so there is no full-suite gate running at merge to catch cross-module breaks later. Mitigation until Phase 10 exists:
- Run `yarn test` locally (full suite) before a push when the change touches several modules or touches something used by the shared mocks (`src/test/setup.ts`, ADR-0011).
- When Phase 10 (CI/CD) is built, the full suite should ideally run there as the real gate — until then, the full suite only runs if someone runs `yarn test` by hand.

**Ref:** `docs/research/003-pre-push-scoped-tests.md` (decision: Option 2 — lint-staged + vitest related; the research already recorded this trade-off, this note corrects the gotcha that had assumed CI/CD as an existing backstop).
