# ADR-0028 — Liveness probe as a thin non-tRPC route

> **Status:** Accepted and implemented
> **Date:** 2026-09-16
> **Decided by:** product owner (single gate of feature 028)
> **Clarifies:** rule 31 (forward-only) — the route handler's prose

## Context

Roadmap Phase 11 (Observability) opens with a liveness signal: there was no way to ask the running app "are you and your database alive?". The only route was `/api/trpc/[trpc]`, which speaks the tRPC/superjson envelope — an uptime monitor or a deploy check cannot read a plain `200`/`503` from it, and Phase 10's "confirmed stable production environment" criterion cannot be met without one. Hard rule 31 said a route handler "delegates to the tRPC handler; no inline business rule" — written before a liveness probe existed, so its literal wording left this route kind undecided.

## Decision

`GET /api/health` is a second, sanctioned route kind: thin, non-tRPC, public, `Cache-Control: no-store`.

- It delegates to `checkHealth()` (`src/server/infra/health/checkHealth.ts`), which runs `SELECT 1` through the Prisma driver — infra is the sanctioned data-layer exception of rule 30 — and catches any driver error as `disconnected`.
- `200` → `{ "status": "ok", "database": "connected", "version": "<pkg>" }`; `503` → `{ "status": "degraded", "database": "disconnected", "version": "<pkg>" }`.
- `version` comes from `package.json` through `env.version` (single source, `APP_VERSION` override).
- The handler (`src/app/api/health/route.ts`) holds no business rule: only the status mapping and the response headers.

**Forward-only clarification of rule 31.** Its mechanical trigger is unchanged (every `src/app/api/**/route.ts` under 80 lines) and holds. The prose widens to: the handler delegates to the tRPC handler **or to an infra probe**, with no inline business rule. No earlier route is touched, so the clarification is forward-only.

## Alternatives considered

- **`health.check` tRPC procedure** — rejected: a monitor would have to parse the tRPC batch/superjson envelope, with no clean `200`/`503` to act on.
- **Redis in the payload** — rejected/deferred: the blog runs with `DISABLE_REDIS`, so Redis-down is not app-down; it is not app liveness.
- **Deep, auth-gated health report** — rejected: that is not a liveness probe; it belongs to a later Phase 11 slice.

## Consequence

- **Easy now:** an uptime monitor or deploy check reads plain HTTP; the probe is one small infra function, unit-tested at the prisma-mock seam; the body carries no stack or secret (rule 13).
- **Harder / watch out:**
  - A second route kind exists. A future public non-tRPC route is still an architectural decision — it goes through rule 11, not through this ADR.
  - The route sits outside the tRPC canonical-line boundary (rule 36 scopes to procedure calls), so health traffic emits no canonical line.
  - `prisma-mock` ships no SQL engine (ADR-0026), so the probe's `$queryRaw` is stubbed in the unit test; the real query runs in the integration suite.
- **Accepted debt:** none new.

## References

- Commits: `a3913ff` (probe), `150876c` (route)
- Related US/RF: US-019 / RF-15
- Canonical docs: `docs/rules/31-a-route-handler-src-app-api.md`, `docs/features/028-health-check/plan.md` § 6
- PR: the feature 028 branch (`feature/028-health-check`)
