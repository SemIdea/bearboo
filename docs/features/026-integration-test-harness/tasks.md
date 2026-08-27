# Feature 026 — Tasks

> **Spec:** [`./spec.md`](./spec.md) · **Plan:** [`./plan.md`](./plan.md)
> `[P]` = parallelizable. Each task is a § 2 cycle. Refs Phase 9 (integration tests).

## Setup

- [X] **T001** `package.json` — add devDeps `testcontainers` + `@testcontainers/postgresql` (`^12.1.0`) and script `test:integration`; regenerate `package-lock.json` with Node 20 (avoid the npm-version lock divergence).

## Foundation — the harness (`src/test/integration/`)

- [X] **T002** `src/test/integration/globalSetup.ts` — start a `postgres:16` container, `getConnectionUri()` → `DATABASE_URL`, run `prisma migrate deploy` against it; `teardown` stops the container.
- [X] **T003** `src/test/integration/setup.ts` — `beforeEach` TRUNCATE all tables except `_prisma_migrations` (real reset); `afterAll` `$disconnect`.
- [X] **T004** `vitest.integration.config.ts` — glob `src/**/*.integration.ts`, `globalSetup` + `setupFiles`, `pool: forks`, `maxWorkers: 1`, no driver mock, generous timeouts.

## Boundary — the first tests

- [X] **T005** `src/server/features/post/__itest__/post.integration.ts` — round-trip persistence, the real `post.search` against real SQL, a raw `$queryRaw` count, and a `to_tsvector`/`plainto_tsquery` smoke (proves 027 is unblocked). RED→GREEN against the real container.
- [X] **T006** Verify the unit suite is untouched (`npm test` → 85 files / 411 tests green; the `.integration.ts` file is not picked up by the unit glob).

## CI

- [X] **T007** `.github/workflows/ci.yml` — add the `integration` job (Node 20, `npm ci`, `npm run test:integration`; Testcontainers uses the runner's Docker).

## Reconciliation (§ 8.5)

- [X] **T008** ADR-0026 (extends ADR-0011); this feature folder (spec/plan/tasks).
- [X] **T009** Update `roadmap.md` Phase 9 (integration tests → done) + note Phase 6 native search unblocked; `ach.md` (integration harness component); `ust.md` status. Correct `resumo-25` (mock does fake unique/insensitive).
