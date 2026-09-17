---
type: rule
description: 'A boundary error is classified: recoverable (`AppError`) vs. bug.'
load: warm
rule_number: 33
fires_on: event
fires_when: 'A boundary error is classified: recoverable (`AppError`) vs. bug.'
---

# Hard rule 33 — A boundary error is classified: recoverable (`AppError`) vs. bug.

An expected business failure is an `AppError` (thrown in the domain, translated at the boundary — rule 15); an unexpected throw is a bug. The boundary **distinguishes the two** — it translates `AppError` → `TRPCError` and **rethrows the rest** — and never dresses a bug as a recoverable domain error. The classification feeds the canonical log line: the logging middleware (`withCanonicalLog` in `src/server/createRouter.ts`) calls `depositBoundaryError` to add `error.kind`/`error.level`/`error.retryable`/`error.code` to `ctx.log`, and a bug also carries its stack (rule 36, ADR-0022). Metadata (`retryable`/`level`, `ErrorLevel = fatal|error|warn|info`) lives in the catalogs `src/shared/error/catalog/*.ts` and is resolved by `AppError` with defaults `retryable=false`/`level=warn`. See ADR-0018 (extends ADR-0017; `Result<T,E>` was evaluated and rejected).
*Verification:* `rg -l "new TRPCError" src/server/features/*/procedures/*.ts` returns empty — the translation no longer lives in the procedure, but in the single choke point `src/server/http/appErrorToTRPCError.ts`, which returns `null` for a non-`AppError` throw (a bug stays a bug, never wrapped as a domain error). **Compliant today** — centralized in `024-error-boundary-centralization` (2026-08-22, ADR-0019).
*Note 2026-08-22:* the previous trigger (`comm -23` between who builds a `TRPCError` and who branches on `instanceof AppError`) measured the discipline **inside** each procedure. With the translation centralized, the first set became empty and the `comm` would pass **vacuously** — verifying nothing. The new trigger targets where the convention now lives.

