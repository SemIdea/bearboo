# Feature 026 — Integration test harness (Testcontainers + Postgres)

> **Spec:** the what and the why. Technology decision in [ADR-0026](../../adr/0026-integration-tests-testcontainers.md).
> **Related:** Roadmap Phase 9 (integration tests) — unblocks Phase 6 (native full-text search, feature 027).
> **Status:** done
> **Opened:** 2026-08-26

## 1. Problem (from the roadmap)

Phase 9 lists integration tests as a gap. The unit suite runs against `prisma-mock` (ADR-0011), which has no SQL engine — so raw SQL (`$queryRaw`), Postgres full-text search (`to_tsvector`/`ts_rank`), and whether the real migration set applies are all untested. A broken migration passes all 411 unit tests and only fails in production. Native full-text search (Phase 6) stayed deferred precisely because the mock cannot test it.

## 2. Scope

**In:**
- A **separate** integration suite (own config + `npm run test:integration`) that boots a real `postgres:16` via Testcontainers, applies the real migrations, and runs the domain/repository layer against it — reusing the existing driver seam (no separate repository construction).
- First integration tests on `post`: round-trip persistence, the real search query against real SQL, raw `$queryRaw`, and a `to_tsvector`/`plainto_tsquery` smoke that proves feature 027 is unblocked.
- A CI `integration` job.

**Out (explicit):**
- Native `tsvector` search rewrite → **feature 027** (this harness unblocks it).
- E2E tests → deferred with the frontend refactor.
- Migrating the unit suite to real Postgres → the mock stays the default for logic.
- A coverage gate → rejected by the owner (coverage is a metric, not a goal).

## 3. Acceptance criteria

- `npm run test:integration` boots a real Postgres, applies migrations, runs green, and tears the container down.
- `npm test` (unit, prisma-mock) is unchanged and still green (85 files / 411 tests) — the `*.integration.ts` files are never picked up by the unit glob.
- The suite proves at least one thing the mock cannot: raw SQL runs, and `to_tsvector`/`plainto_tsquery` are available on the real engine.
- CI runs the integration job on every PR/push.
- `tsc --noEmit` and `biome check` clean.

## 4. Notes

- Discovery correction (2026-08-26): the plan assumed `prisma-mock` could not enforce unique constraints or `mode: "insensitive"`. Empirically it does both correctly — so the genuine gap is **raw SQL / migrations**, and the tests target that instead. ADR-0011's claim ("unique constraints enforced, P2002") was right.
