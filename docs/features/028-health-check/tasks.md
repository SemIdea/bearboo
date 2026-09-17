# Feature 028 — Tasks

> **Spec:** [`./spec.md`](./spec.md) · **Plan:** [`./plan.md`](./plan.md)
> Each task is one `core/afm.md` § 2 cycle (RED → GREEN → REFACTOR → COMMIT). `[P]` = no dependency on the task right before it.
> **Prerequisite:** met — no open `[NEEDS CLARIFICATION:]`; gate answered 2026-09-16 (thin non-tRPC route, `plan.md` § 6).

## Phase 1 — Setup

- [X] **T001** [P] `docs/ust.md` + `docs/prd.md` — register US-019 (an operator checks liveness) and RF-15 (Observability); mark the accepted option in `plan.md` § 6 and commit the feature docs (`spec.md`, `plan.md`, `tasks.md`) (US-019, RF-15)
- [X] **T002** [P] `src/server/infra/health/checkHealth.ts` — create the module with the exported `HealthProbeResult` type and the `checkHealth` signature (stub; no probe logic yet) (US-019)
- [X] **T003** [P] `src/lib/env/index.ts` — add `version` (from `package.json`, `APP_VERSION` override) (RF-15)

## Phase 2 — Foundation (failing tests first)

- [X] **T004** RED: `src/server/infra/health/__test__/checkHealth.ts` — probe resolves → `{ database: "connected" }`; probe rejects → `{ database: "disconnected" }`, stubbing `$queryRaw` at the prisma-mock seam (spec § 3, criterion 4) (US-019)
- [X] **T005** GREEN: minimal `checkHealth()` — `SELECT 1` via `prisma.$queryRaw`, any driver error caught as `"disconnected"`, that passes T004 (US-019)

## Phase 3 — Boundary

- [X] **T006** RED: `src/app/api/health/__test__/route.ts` — `GET` returns `200` `{ status: "ok", database: "connected", version: <pkg> }` with `Cache-Control: no-store`; a probe throw returns `503` `{ status: "degraded", database: "disconnected" }` with no stack or secret in the body (spec § 3, criteria 1-2) (US-019)
- [X] **T007** GREEN: thin `src/app/api/health/route.ts` — `GET` delegates to `checkHealth()`, adds `env.version` and the status mapping; no tRPC envelope (rule 31 spirit, `plan.md` § 3) (US-019)
- [X] **T008** [P] `plan.md` § 4 — record that rule 16 has no call here: the route takes no input (GET, no params/body), so there is no boundary schema to validate (RF-15)

## Phase 4 — Reconciliation (8.5)

- [X] **T009** `docs/adr/0028-health-liveness-route.md` — record the non-tRPC liveness route and the forward-only note on rule 31; regenerate the docs index (US-019)
- [ ] **T010** `docs/ach.md` § 3.1 — add the health probe (infra) and the second route kind on the public non-tRPC surface (US-019)
- [ ] **T011** Close the loop — US-019 → `done` in `docs/ust.md`, spec header status → `done` (US-019)
- [ ] **T012** Full validation before the push boundary — `npx tsc --noEmit`, `npm test`, and `npm run build` if the environment allows (RF-15)

---

*Every task references US-019 or RF-15 in the commit (rule in `core/afm.md` § 2, step 7 COMMIT).*
*Never skip RED (rule 1 — TDD).*
