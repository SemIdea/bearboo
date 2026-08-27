# ADR-0026 — Integration tests against real Postgres via Testcontainers

> **Status:** Accepted and implemented
> **Date:** 2026-08-26
> **Decided by:** product owner
> **Extends:** [ADR-0011](./0011-prisma-mock-para-testes.md) (which anticipated a thin real-database integration layer as a Phase 9/10 item)

## Context

The unit suite runs the domain/procedure/repository layer against `prisma-mock` (ADR-0011) — an in-memory fake with **no SQL engine**. It is fast and covers business logic well (~91% backend, 411 tests), but by construction it cannot validate anything that only a real engine runs: raw SQL (`$queryRaw`), Postgres full-text search (`to_tsvector`/`ts_rank`, deferred in Phase 6 exactly because the mock cannot test it), and whether the real migration set applies cleanly. A broken migration passes every unit test and only fails in production.

An integration test — the domain/repository layer against a **real Postgres** — closes that seam. Following the unit → integration → e2e order (e2e is deferred with the frontend refactor).

Empirical note (2026-08-26): `prisma-mock` *does* correctly fake unique constraints (P2002) and `mode: "insensitive"`, so those are **not** the gap; raw SQL and the migration set are.

## Decision

Adopt **Testcontainers** (`testcontainers` + `@testcontainers/postgresql`, devDependencies) for a **separate** integration suite, kept apart from the fast unit suite:

- **One container per run.** `src/test/integration/globalSetup.ts` starts a `postgres:16` container, applies the real migrations with `prisma migrate deploy` against its connection URI, and exposes that URI via `DATABASE_URL`.
- **Reuses the existing driver seam.** The unmodified Prisma driver (`src/server/infra/drivers/prisma.ts`) reads `DATABASE_URL`, so models/domains/procedures run **intact** against the container — no separate repository construction. This is the same seam the unit suite mocks (`src/test/setup.ts`), pointed at a real engine instead of the mock.
- **Real reset between tests.** `src/test/integration/setup.ts` `TRUNCATE`s every table (except `_prisma_migrations`) in `beforeEach` — the integration analogue of `resetPrismaMock`.
- **Separate config + script.** `vitest.integration.config.ts` (glob `src/**/*.integration.ts`, `pool: forks`, `maxWorkers: 1`, no driver mock); `npm run test:integration`. The plain `npm test` is untouched.
- **CI job.** A dedicated `integration` job runs `npm run test:integration`; Testcontainers boots its own container via the runner's Docker daemon (no `services:` block).

## Alternatives considered

- **Reuse the CI `services: postgres` for a shared DB** — rejected as the primary mechanism: it works only in CI, so local and CI would diverge; Testcontainers gives one consistent path in both, and manages lifecycle/teardown (Ryuk) itself.
- **PGlite / in-process Postgres** — rejected: ADR-0011 already recorded PGlite breaks `prisma migrate` (P1017); the point here is to test the *real* migration set.
- **Transaction-rollback isolation** instead of TRUNCATE — deferred: TRUNCATE is simpler and the suite is small/serial; revisit if the suite grows and speed matters.
- **Migrate the whole suite to real Postgres** — rejected: the mock stays the default for logic (fast); integration covers only what the mock cannot.

## Consequence

- **Easy now:** raw SQL / migration / real-engine behavior is testable; native full-text search (feature 027) is unblocked — a `to_tsvector`/`plainto_tsquery` smoke already runs green here.
- **Harder / watch out:**
  - Needs a **Docker daemon** (local dev and CI). No Docker → the integration suite cannot run; the unit suite is unaffected.
  - `DATABASE_URL` must reach the worker: the config uses `pool: forks` for that (globalSetup sets it before workers fork).
  - Integration tests use the `*.integration.ts` suffix and live **outside** `__test__/` so the unit glob never picks them up.
- **Load-bearing:** rule 30 gains `src/test/integration/` and the `*.integration.ts` files as a data-layer exception (they may import the real `prisma` driver), alongside the `src/test/prisma/` exception from ADR-0011.
