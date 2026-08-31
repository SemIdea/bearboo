# ADR-0022 — Structured logging: one canonical log line per call

> **Status:** Accepted
> **Date:** 2026-08-24
> **Decided by:** SemIdea
> **Extends:** ADR-0017, ADR-0018 (does not replace)

## Context

Phase 9 (production quality) lists structured logs as a gap. Today the app logs
only errors. `logBoundaryError` (`src/shared/error/boundaryLog.ts`) builds a
string and calls `console.*`, wired into two `onError` hooks
(`src/app/api/trpc/[trpc]/route.ts`, `src/server/caller.ts`). Success paths log
nothing. The 4 levels exist (`ErrorLevel`), but there is no per-request event.

A study of 5 references grounded the design (`docs/learn/resumo-20..24`):
Brandur canonical log lines (20), Majors wide structured events (21), Cheney
levels (22), 12-Factor stdout event stream (23), structlog context binding +
renderer chain (24).

The owner decided the design. This ADR records it; it does not re-open it.

## Decision

**(1) Canonical log line.** The app emits one wide structured event per procedure
call. Code accumulates fields on `ctx.log` during the call. A logging middleware
in `src/server/createRouter.ts` emits the event once, at the boundary. tRPC
batches calls, so the unit is the procedure call (each call has its own path and
outcome) — the tRPC analog of Brandur's per-request line.

**(2) Renderer by environment.** JSON in production, pretty in development,
chosen by `env.nodeEnv`. The app writes one stream to stdout (12-Factor). It does
not manage log files or routing — the environment does.

**(3) Allowlist, not blocklist (rule 13 — the crux).** The line emits only
fields added explicitly, plus a fixed safe base set (`path`, `durationMs`, `ok`,
`userId`, `visitorId`, `error.*`). Three layers, each catching a different vector: (i) `LogFields`
accepts scalars only (`string | number | boolean | null`), so code cannot add a
raw `input`/`ctx`/`user` object — this also covers PII, which lives on those
objects; (ii) a sensitive-key scrub drops a field whose key names a secret
(`token`/`password`/`secret`/`authorization`/`cookie`); (iii) a credential-value
scrub masks a known secret shape (OpenAI/GitHub/Google/Slack/JWT — the same
prefixes rule 13 checks in `docs/sessions/`) that slips into a value under an
innocent key. A token, password, or secret does not leak: it is never added,
dropped if named, and masked if its shape appears in a value.

**(4) Levels stay where they live.** The canonical line's own level is `info` on
success, or the error's `level` on failure. The 4-level `ErrorLevel` and the
`ErrorRegistry` classification (ADR-0017/0018) are untouched. `boundaryLog` stops
calling `console`; it deposits the error fields (`code`, `kind`, `level`,
`retryable` — which `classifyBoundaryError` already computes) onto `ctx.log`.

**(5) Hard rule 36** mechanizes the convention (`afm.md § 3`).

## Alternatives considered

- **Play-by-play (N lines per call)** — **rejected.** Majors and Brandur argue
  against it: you reconstruct one operation by grep + join across lines. The wide
  event holds the whole journey in one queryable row. A debug play-by-play stays
  possible in dev, off in prod.
- **Log via `onError`** — **rejected as the seam.** `onError` fires only on
  failure; it cannot emit the canonical line on success. The middleware sees both
  `result.ok` and the error. `caller.ts` keeps `onError` for its session redirect,
  not for logging.
- **Blocklist as the primary mechanism** — **rejected.** A blocklist forgets the
  next sensitive field added. The allowlist (scalar-only, explicit) fails safe;
  the key scrub is only a backstop.
- **Value-scanning for PII (emails, names, cards, IPs)** — **rejected.** PII value
  detection has a high false-positive rate (a legit `authorEmail` you meant to log
  gets masked; a name is just a string) and gives false security. PII lives on the
  `user`/`input` objects, which the allowlist already blocks by type — that is the
  right layer for it. Value-scanning is reserved for credential *shapes*, which are
  distinctive enough to match with near-zero false positives.
- **A full logging library (pino/winston/structlog port)** — **rejected (YAGNI).**
  A small pure lib covers JSON + pretty + the allowlist. Revisit if the field
  pipeline grows (sampling, sinks, async transport).

## Consequence

**Easy:** one queryable line per operation; success is observable, not only
errors; a new field is one `ctx.log.add(...)` call; secrets cannot leak by
construction.

**Hard / gotcha:** (a) the line is per procedure call, not per HTTP request — a
tRPC batch of 3 calls emits 3 lines (correct, but more lines than a REST
per-request model). (b) the fields go to stdout as advisory data; shipping and
aggregation are the environment's job (Phase 10), and tracing/spans are Phase 11
— both out of scope here. (c) a domain that adds nothing still gets the safe base
line; rich lines need explicit `ctx.log.add`.

## References

- Extends ADR-0017 (ErrorRegistry) and ADR-0018 (error metadata + bug/recoverable
  convention). Does not replace either.
- Feature: `docs/features/025-structured-logging/`.
- Study: `docs/learn/resumo-20..24`.
- Hard rules: `afm.md § 3` rule 36 (new); rule 13 (secrets do not leak), rule 15
  (Domain ≠ Transport), rule 33 (bug vs. recoverable).
- Forward path: the same wide-event fields become span attributes under
  OpenTelemetry (Phase 11).
