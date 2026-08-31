# Feature 025 — Structured logging (canonical log line)

> **Spec:** the what and the why. No technology decision.
> **Related US:** US-018 (Dev observes one wide event per operation) — Phase 9.
> **Status:** done
> **Opened:** 2026-08-24

## 1. Problem (from the roadmap / PRD)

Phase 9 (production quality) lists structured logs as a gap. Today the app logs
only errors. `logBoundaryError` (`src/shared/error/boundaryLog.ts`) builds a
string and calls `console.*`, wired into two `onError` hooks
(`src/app/api/trpc/[trpc]/route.ts`, `src/server/caller.ts`). A successful
request logs nothing. There is no per-request event, no machine-parseable format,
and no way to see what one operation did.

A study of 5 references (`docs/learn/resumo-20..24`) grounded a design the owner
chose: the **canonical log line** — accumulate fields during the call and emit
one wide structured event at the boundary; JSON in prod, pretty in dev.

## 2. Observable success criterion

- [ ] Every procedure call emits exactly one structured line at the boundary,
  success or failure (not only on error).
- [ ] The line is JSON in production and human-readable (pretty) in development,
  chosen by `env.nodeEnv` — the app writes one stream to stdout.
- [ ] The line carries a safe base set (`path`, `durationMs`, `ok`, and `userId`/
  `visitorId` when present); on failure it also carries `error.code`,
  `error.kind` (recoverable|bug), `error.level`, `error.retryable`.
- [ ] Code can enrich the line during the call via `ctx.log.add(...)`.
- [ ] **A token, password, or secret never appears in the output** — even if a
  field with such a key name is added, it is dropped (rule 13).
- [ ] The 4-level `ErrorLevel` and the `ErrorRegistry` classification (ADR-0017/
  0018) are unchanged; `boundaryLog` no longer calls `console`.
- [ ] No stray `console.*` remains in `src/server/**` except the sanctioned mock
  mailer transport.

## 3. Scenarios (Gherkin)

```gherkin
Scenario: A successful call emits one canonical line
  Given a procedure that resolves without error
  When the procedure is called
  Then exactly one structured line is emitted at the boundary
  And it carries path, durationMs and ok=true
```

```gherkin
Scenario: A failing call carries the error classification
  Given a procedure whose domain throws an AppError
  When the procedure is called
  Then the canonical line carries ok=false
  And it carries error.code, error.kind, error.level and error.retryable
```

```gherkin
Scenario: A secret is never logged
  Given code that adds a field named accessToken to ctx.log
  When the canonical line is emitted
  Then the accessToken key is absent from the output
```

```gherkin
Scenario: JSON in production, pretty in development
  Given env.nodeEnv is "production"
  When a line is emitted
  Then the output is a single JSON object
  And when env.nodeEnv is "development" the output is a human-readable line
```

## 4. Out of scope

- **OpenTelemetry / tracing / spans** — Phase 11. The wide-event fields are
  forward-compatible (they become span attributes), but no tracer is built here.
- **Log shipping / aggregation / a log backend** — Phase 10 and the environment's
  job (12-Factor: the app only writes stdout).
- **General API rate limiting** and the **test-coverage sweep** — separate Phase 9
  items, not this feature.
- **Exposing the log to the client** — server-side only.
- **A logging library (pino/winston)** — rejected in the ADR (YAGNI); a small
  pure lib covers the need.
- **Frontend** — no frontend change (backend-first).

## 5. Assumptions / open questions

- **Per procedure call, not per HTTP request.** tRPC batches calls; the logging
  middleware runs per call. Each call is one operation with its own path/outcome.
  Resolved by scan → ADR content.
- **Middleware, not `onError`.** `onError` fires only on failure. The middleware
  sees both the ok result and the error, so it is the only seam that can emit on
  success. `caller.ts` keeps `onError` for the session redirect.
- **A fresh per-call logger.** `createContext` gives a base logger; the middleware
  binds a fresh logger per call (structlog bind pattern), so fields from one call
  in a batch do not leak into another.
- **Allowlist by type.** `LogFields` accepts scalars only, so a raw `input`/`ctx`
  object cannot be added; a sensitive-key scrub is the backstop.

## 6. Dependencies

- **ADR-0017** (ErrorRegistry) and **ADR-0018** (metadata + bug/recoverable) — the
  `level`/`retryable`/`kind` fields come from there; ADR-0022 extends both.
- US-018 (`docs/ust.md`), Phase 9 (`docs/roadmap.md`).
- Hard rules: 13 (secrets do not leak — **the crux**), 15 (Domain ≠ Transport),
  33 (bug vs. recoverable), 11 (architectural change — approved at the gate
  2026-08-24), 1 (test), 5 (one responsibility), 6 (≤300 lines), 35 (`src/shared`
  no `@trpc`).

## 7. Clarifications

### Session 2026-08-24 (`/afm:deliver` gate)

- Design fixed by the owner before the gate: canonical log line, JSON/pretty by
  env, keep the 4 levels where they live, optional debug play-by-play only in dev.
- Resolved by discovery (not asked): the emission seam (middleware, not
  `onError`), the granularity (per procedure call), the file placement
  (`src/lib/log/` pure lib + middleware wiring in `createRouter.ts`), and the
  redaction discipline (allowlist + key scrub).

---

*Spec does NOT contain: stack decision, function names, task order. That lives in
`plan.md`.*
