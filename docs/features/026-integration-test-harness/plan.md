# Feature 026 — Plan

> **Spec:** [`./spec.md`](./spec.md) · **ADR:** [ADR-0026](../../adr/0026-integration-tests-testcontainers.md)

## 1. Approach

Reuse the **same driver seam** the unit suite mocks. The unit suite `vi.mock`s `@/server/infra/drivers/prisma` with `prisma-mock`; the integration suite instead sets `DATABASE_URL` to a Testcontainers Postgres and lets the **unmodified** driver connect to it. Models/domains/procedures run intact against a real engine. One container per run (globalSetup), TRUNCATE between tests, separate config/script so the fast unit suite is untouched.

## 2. Components

| Component | File | Kind |
| --- | --- | --- |
| Container boot + migrate | `src/test/integration/globalSetup.ts` | test infra |
| Per-test reset | `src/test/integration/setup.ts` | test infra |
| Integration Vitest config | `vitest.integration.config.ts` | config |
| First integration tests | `src/server/features/post/__itest__/post.integration.ts` | test |
| Script + devDeps | `package.json` (`test:integration`, `testcontainers`, `@testcontainers/postgresql`) | config |
| CI job | `.github/workflows/ci.yml` (`integration`) | CI |

## 3. Key decisions

- **`pool: forks` + `maxWorkers: 1`** — forks so `DATABASE_URL` set in globalSetup reaches the worker; single serial worker so tests share the one container without racing on TRUNCATE. (`poolOptions.forks.singleFork` is not in Vitest 4's type; `maxWorkers: 1` is the type-valid equivalent already used by the unit config.)
- **TRUNCATE reset** (not transaction-rollback) — simplest for a small serial suite; revisit if it grows.
- **`postgres:16`** — matches the CI `build` job's Postgres service.
- **`*.integration.ts` outside `__test__/`** — keeps them off the unit glob (`src/**/__test__/**/*.ts`) while the integration glob (`src/**/*.integration.ts`) picks them up.
- **CI: Testcontainers boots its own container** (no `services:` block) — one consistent path local and CI.

## 4. Boundary contracts

- `globalSetup` sets `process.env.DATABASE_URL` → the driver's `env.databaseUrl` reads it at import in the worker.
- Integration tests may import the real `prisma` driver for raw assertions — a data-layer exception to rule 30 (like `src/test/prisma/`), recorded in ADR-0026.

## 5. Validation against afm.md § 3

- Rule 30 (domain/procedure ≠ PrismaClient): intact — the real client lives in the driver + test infra; domains still use `ctx.repositories`. The `__itest__` file is neither domain nor procedure.
- Rule 6 (≤300 lines), Rule 2 (no any/unknown): all harness files small and typed.
- Rule 1 (test for new code): the harness's value is proven by the integration tests it runs (green against real Postgres).
