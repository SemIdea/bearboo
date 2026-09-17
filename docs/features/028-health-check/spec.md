# Feature 028 — Health check endpoint (`/api/health`)

> **Spec:** the what and the why. The route decision lives in the plan + a new ADR.
> **Related:** Roadmap Phase 11 (Observability) — first slice. Seeds from the `health-request-id` candidate in `ust.md`. Request-id correlation is a separate follow-up (feature 029).
> **Status:** draft — materialized up to the plan for review (no `tasks.md`, no execution yet).
> **Opened:** 2026-09-16

## 1. Problem (from the roadmap)

Roadmap Phase 11 (Observability) is 🟡 Partial. There is no way to ask the running app "are you and your database alive?". The only route is `/api/trpc/[trpc]`, which speaks the tRPC/superjson envelope — not a plain HTTP liveness signal an uptime monitor or a deploy check can read. Phase 10's "confirmed stable production environment" criterion cannot be met without a health signal. `ust.md` records this as the `health-request-id` candidate.

## 2. Scope

**In:**
- A public `GET /api/health` route returning JSON `{ status, database, version }`.
- `200` when the Postgres connection answers a cheap probe; `503` when it does not (`status: "degraded"`, `database: "disconnected"`).
- The DB probe runs through the infra layer (a new `checkHealth()` in `src/server/infra/`), so no route/domain imports the Prisma driver beyond the sanctioned infra/model exception (rule 30).
- `version` sourced from `package.json` (single source), surfaced through `env`.
- A unit test on `checkHealth()` (DB up → connected; DB throws → disconnected) via the existing prisma-mock seam (rule 1).

**Out:**
- Request-id / log correlation (the other half of the Phase 11 candidate) → feature 029.
- Redis/cache in the payload (the roadmap example shows only `database`; the blog runs with `DISABLE_REDIS`, so Redis-down is not app-down). Deferrable as a future field.
- Tracing / metrics / OpenTelemetry (later Phase 11 slices).
- An auth-gated "deep" health report; this is a public liveness probe.

## 3. Acceptance criteria

- `GET /api/health` returns `200` with `{ "status": "ok", "database": "connected", "version": "<pkg>" }` when Postgres answers.
- When the DB probe throws, it returns `503` with `{ "status": "degraded", "database": "disconnected", "version": "<pkg>" }` — no stack or secret in the body (rule 13), `Cache-Control: no-store`.
- The route handler stays thin (rule 31): the probe and the status mapping live in a testable infra function, not inline.
- `checkHealth()` has a unit test for both branches; `npm test`, `tsc --noEmit`, and `biome check` are clean.

## 4. Notes

- Needs a new **US-019** (an operator / uptime monitor checks liveness) and starts **RF-15 (Observability)** per the prd § 4 "a new RF enters when the phase starts" convention — both are drafted in the plan and added to `ust.md` / `prd.md` on approval (deferred here to keep this a plan-only halt).
- Rule 31 today says a route handler "delegates to the tRPC handler"; a liveness route legitimately does not (it needs a plain HTTP `200`/`503`). The plan proposes a forward-only clarification to rule 31 + an ADR — this is the one load-bearing decision to confirm (see `plan.md` § 6).
