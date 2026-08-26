# Feature 025 — Tasks

> **Spec:** [`./spec.md`](./spec.md) · **Plan:** [`./plan.md`](./plan.md)
> `[P]` = parallelizable (no shared file / no dependency). Each task is a § 2 cycle.
> Every task refs US-018 / Phase 9.

## Setup

- [X] **T001** Add `nodeEnv` to `src/lib/env/index.ts` — `getStrEnv("NODE_ENV", "development")`. It selects the renderer. (US-018)

## Foundation — the log lib (`src/lib/log/`)

- [X] **T002** `src/lib/log/types.ts` — `LogLevel`, `LogFields = Record<string, string | number | boolean | null>`, `Logger` (`{ readonly fields: LogFields; add(f: LogFields): void }`), `EmitMeta`. Types only. (US-018)
- [X] **T003 [P]** `src/lib/log/redact.ts` + test (RED→GREEN) — `scrub(fields)`: drop any key matching `/token|password|secret|authorization|cookie/i`; drop non-scalar values. Test: an `accessToken` key is absent from the result. (rule 13, US-018)
- [X] **T004 [P]** `src/lib/log/render.ts` + test (RED→GREEN) — `renderJson(meta, fields)` (one JSON object) and `renderPretty(meta, fields)` (human line); a `pickRenderer(env)` that returns JSON when `nodeEnv === "production"`, else pretty. Test both shapes. (US-018)
- [X] **T005** `src/lib/log/logger.ts` + test (RED→GREEN) — `createLogger(base?)` → `Logger`; `add` merges; `emit(logger, meta, env)` runs `scrub` then `pickRenderer` and writes one line to stdout. Test: `add` accumulates; `emit` writes exactly once; a scrubbed key never reaches the sink. Barrel `src/lib/log/index.ts`. (US-018)

## Integration

- [X] **T006** `src/server/createContext.ts` — add `log: Logger` to `IBaseContextDTO`; instantiate a base logger in `createTRPCContext`. Test: the built context exposes `log`. (US-018)
- [X] **T007** `src/server/createRouter.ts` — logging middleware on `baseProcedure` (wrapping `withAppErrors`): fork a fresh per-call logger, inject via `next({ ctx: { log } })`, time the call, on `!result.ok` deposit the classification, emit the canonical line once. Test: a success emits one line with `path`/`durationMs`/`ok=true`; a failure carries `error.code`/`error.kind`/`error.level`; two calls do not share fields. (US-018)
- [X] **T008** `src/shared/error/boundaryLog.ts` — replace `logBoundaryError` (console) with `depositBoundaryError(log, error, ctx?)` that writes the classification fields onto the logger; keep `classifyBoundaryError`/`findAppError` pure. Rewire `src/app/api/trpc/[trpc]/route.ts` (drop `onError` logging) and `src/server/caller.ts` (keep the redirect, drop the logging call). Update the boundaryLog test. (rules 15/35, US-018)
- [X] **T009 [P]** `src/server/features/user/procedures/register.ts` — boy-scout: replace the stray `console.error` (mail send failure) with `ctx.log.add({ mail_send_failed: true })`, still rethrow. (rule 36, US-018)

## Boundary

- [X] **T010** `docs/afm.md § 3` — add hard rule **36** (canonical log line + allowlist; no `console.*` in `src/server` except the mock mailer) with an executable trigger. (US-018)

## Reconciliation (§ 8.5)

- [X] **T011** `docs/ach.md § 3` — add the `src/lib/log/` component + the logging-middleware note. Add **US-018** to `docs/ust.md`; mark Phase 9 "structured logs" done in `docs/roadmap.md`. Set spec/plan status → done. ADR-0022 already materialized. (US-018)
