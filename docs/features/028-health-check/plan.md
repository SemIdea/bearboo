# Feature 028 — Plan

> **Spec:** [`./spec.md`](./spec.md) · **ADR:** ADR-0028 (proposed — the non-tRPC liveness route)
> **Status:** done — delivered 2026-09-16 (thin non-tRPC route adopted at the gate, § 6; all tasks closed).

## 1. Approach

A thin `GET /api/health` route handler (`src/app/api/health/route.ts`) delegates to a new infra function `checkHealth()` (`src/server/infra/health/checkHealth.ts`). `checkHealth()` runs a cheap `SELECT 1` through the Prisma driver (infra is the sanctioned data-layer exception to rule 30) and returns `{ database: "connected" | "disconnected" }`, catching any driver error as `"disconnected"`. The route maps that to HTTP `200` / `503`, adds `version` (from `package.json` via `env`) and `status`, and returns JSON with `Cache-Control: no-store`. No tRPC envelope — an uptime monitor or deploy check reads a plain status.

## 2. Components

| Component | File | Kind |
| --- | --- | --- |
| Health probe (DB) | `src/server/infra/health/checkHealth.ts` | infra |
| Route handler | `src/app/api/health/route.ts` (`GET`) | route (boundary) |
| Version in config | `src/lib/env/index.ts` (`version` from `package.json`) | config |
| Probe unit test | `src/server/infra/health/__test__/checkHealth.ts` | test |
| US + RF (on approval) | `docs/ust.md` (US-019), `docs/prd.md` (RF-15) | product doc |
| Route decision | `docs/adr/0028-health-liveness-route.md` | ADR |

## 3. Key decisions

- **Thin non-tRPC route (the load-bearing one).** A liveness probe must answer plain HTTP `200` / `503` for uptime monitors and deploy checks — the tRPC/superjson envelope cannot. So `/api/health` is a second, sanctioned route kind that delegates to infra (still thin, no inline business rule — rule 31 spirit). Alternative rejected: a `health.check` tRPC procedure (forces a monitor to parse a tRPC batch envelope, with no clean `200`/`503`). Recorded in ADR-0028 with a forward-only note on rule 31.
- **Probe = `SELECT 1` in infra**, caught as connected/disconnected. Keeps Prisma out of domain/procedure (rule 30); testable via the prisma-mock seam (mock resolves → connected, mock rejects → disconnected).
- **DB only** in the payload (the roadmap example shows `database`; the blog tolerates Redis-down via `DISABLE_REDIS`). Redis is a possible future field, not app liveness.
- **Public, no auth, `no-store`.** Conventional for a liveness probe; the body carries no secret or stack (rule 13).
- **`version` from `package.json`** (single source) surfaced through `env`, optionally overridable by `APP_VERSION`.

## 4. Validation against afm.md § 3

- **Rule 30:** the driver is imported only in infra (`checkHealth.ts`), never in domain/procedure.
- **Rule 31:** the route handler stays < 80 lines and delegates to `checkHealth()` — but its literal wording ("delegates to the tRPC handler") gets a forward-only clarification (a liveness route is a sanctioned second kind). ADR-0028 records it.
- **Rule 1:** `checkHealth()` is covered by a unit test (both branches) via the mock seam.
- **Rule 13 / 36:** no secret or stack in the response body or logs; the route sits outside the tRPC canonical-line boundary (it is not a procedure call), so it emits no canonical line — acceptable (rule 36 scopes to procedure calls).
- **Rules 5 / 6 / 7:** `checkHealth.ts` is one small responsibility; it is infra, not a `domain_` file (rule 7 N/A).
- **Rule 16 (validation at the boundary):** no call — the route accepts no input (GET, no params, no body) and `checkHealth()` consumes no external payload, so there is no boundary schema to apply.

## 5. Contract

```
GET /api/health           (public, Cache-Control: no-store)
200 → { "status": "ok",       "database": "connected",    "version": "0.0.1" }
503 → { "status": "degraded", "database": "disconnected", "version": "0.0.1" }
```

## 6. Decision (bucket b — load-bearing) — resolved 2026-09-16

**Route architecture.** Recommended: a thin non-tRPC `/api/health` route + a forward-only note on rule 31 + ADR-0028. This changes the structural inventory (a new route pattern that bypasses the tRPC boundary, a new infra component, a rule clarification). If you would rather keep every route inside tRPC, the shape changes (a `health.check` procedure, monitors parse the envelope) — say so and I re-plan. Everything else is conventional or evidence-resolved, so this is the one thing to confirm before tasks/execution.

**Resolution (2026-09-16):** the recommended option was adopted — thin non-tRPC `GET /api/health`, forward-only clarification of rule 31, ADR-0028. Execution follows in [`./tasks.md`](./tasks.md).
