# Feature 025 — Plan

> **Spec:** [`./spec.md`](./spec.md) · **Tasks:** [`./tasks.md`](./tasks.md)
> Stack read from `docs/ach.md` — does not re-open the stack.

## 1. Approach (3 sentences)

A new pure lib `src/lib/log/` builds a per-call logger that accumulates scalar
fields and renders one wide event — JSON in prod, pretty in dev, chosen by
`env.nodeEnv`. A logging middleware in `src/server/createRouter.ts` binds a fresh
logger per procedure call, times it, and emits the canonical line once at the
boundary — on success and on failure. `boundaryLog` stops calling `console` and
instead deposits the error classification it already computes (`code`/`kind`/
`level`/`retryable`) onto that logger, so a failing call's line carries the error
fields.

## 2. Affected components (from the scan)

| Component | Path | Type | Action |
| --- | --- | --- | --- |
| Log types | `src/lib/log/types.ts` | Lib | **new** — `LogFields` (scalar-only), `Logger`, `EmitMeta`, `LogLevel` |
| Renderer | `src/lib/log/render.ts` | Lib | **new** — `renderJson` / `renderPretty`, pick by env |
| Redaction | `src/lib/log/redact.ts` | Lib | **new** — scalar guard + sensitive-key scrub |
| Logger + emit | `src/lib/log/logger.ts` | Lib | **new** — `createLogger`/`add`, `emit` (one stdout line) |
| Barrel | `src/lib/log/index.ts` | Lib | **new** — re-exports |
| Env | `src/lib/env/index.ts` | Lib | `+ nodeEnv` (selects the renderer) |
| Context | `src/server/createContext.ts` | Boundary | `+ log` on `IBaseContextDTO`; base logger per request |
| Router | `src/server/createRouter.ts` | Boundary | logging middleware on `baseProcedure` (wraps `withAppErrors`) |
| Boundary log | `src/shared/error/boundaryLog.ts` | Lib | `logBoundaryError` → `depositBoundaryError(log, error)` (no `console`) |
| HTTP entry | `src/app/api/trpc/[trpc]/route.ts` | Boundary | drop the `onError` logging (middleware owns it) |
| RSC entry | `src/server/caller.ts` | Boundary | keep `onError` redirect; drop the logging call |
| Register | `src/server/features/user/procedures/register.ts` | Procedure | boy-scout: `console.error` → `ctx.log.add` |

## 3. Decisions (with rejected alternative)

**D1 — Pure lib in `src/lib/log/`, not `src/shared/`.** The logger is
framework-agnostic and has no transport opinion. `src/lib/` is the home for pure
libs (`ach.md`). This also keeps rule 35 trivially true (no `@trpc` anywhere near
it). Rejected: putting it in `src/shared/error/` — logging is not error
machinery, and mixing them blurs one responsibility (rule 5).

**D2 — Middleware, not `onError`.** `onError` (fetch adapter and `createCaller`)
fires only on failure, so it cannot emit the canonical line on success. The
middleware runs inside the call, inspects `result.ok`, and emits either way.
Rejected: `onError` — success would never log, defeating the wide event.

**D3 — Fresh per-call logger (bind pattern).** tRPC batches calls that share one
`ctx`. If the accumulator lived only on the shared `ctx`, fields from call A would
leak into call B's line. The middleware creates a fresh logger per call and
injects it via `next({ ctx: { log } })` (structlog bind, `resumo-24`).
`createContext` still provides a base logger so `ctx.log` always exists
(pre-middleware code and the type). Rejected: one shared accumulator — cross-call
field leakage.

**D4 — Three redaction layers, allowlist first.** `LogFields = Record<string,
string | number | boolean | null>` — the type forbids adding an object
(`input`/`ctx`/`user` cannot be dumped, which also covers PII, since PII lives on
those objects). On emit, `redact.ts` drops a field whose key matches
`/token|password|secret|authorization|cookie/i`, and masks a known credential
shape in a value (the rule-13 prefixes: OpenAI/GitHub/Google/Slack/JWT) that
slipped in under an innocent key. Rejected: a blocklist alone (forgets the next
sensitive field) and PII value-scanning (high false positives — the allowlist is
the right layer for PII). This is the rule-13 crux and has its own tests.

**D5 — One stdout stream, level as a field.** Every line goes to stdout via one
sink; `level` is a field (`info` on ok, the error's `level` on failure; a bug
carries `error` + a `stack` field). 12-Factor: the app writes one event stream and
does not split streams or manage routing. Rejected: `console.error` to stderr for
bugs — two streams complicate one queryable source.

**D6 — Inline middleware in `createRouter`, logic in the lib.** The middleware is
wiring (fork logger, time, call `next`, classify on failure, emit); it sits inline
next to `withAppErrors`, matching that precedent. The renderable/emit/scrub logic
lives in the lib and `boundaryLog`, so `createRouter` stays assembly-only and
under 300 lines. Rejected: a separate middleware file importing `t` — needless
circular-import risk for ~30 lines of wiring.

## 4. Boundary contracts

- **`ctx.log.add(fields: LogFields)`** — merges scalar fields into the per-call
  accumulator. Non-scalar is a type error; sensitive keys are scrubbed on emit.
- **`emit(logger, meta, env)`** — renders one line (`renderJson` if
  `env.nodeEnv === "production"`, else `renderPretty`) and writes it once to
  stdout.
- **Middleware output:** on `result.ok`, emit `{ level: "info", ok: true, path,
  durationMs, userId?, visitorId?, ...fields }`. On failure, deposit the
  classification via `depositBoundaryError`, then emit `{ level: error.level,
  ok: false, ..., error.code, error.kind, error.level, error.retryable }`. The
  middleware never changes the result — it only observes and re-throws unchanged.
- **`src/shared/` → `@trpc`:** still forbidden (rule 35). `boundaryLog` imports
  only the `Logger` type from `src/lib/log`, never transport.

## 5. Binary check against `afm.md § 3`

| Rule | How this feature satisfies it |
| --- | --- |
| 1 — test for new code | render, redact, logger, middleware, ctx, boundary deposit each have a test |
| 2 — zero `any`/`unknown` | `unknown` only where already a boundary (`classifyBoundaryError` input) |
| 4 — type-check | `tsc --noEmit` after each task |
| 5 — one responsibility | types/render/redact/logger split; middleware is wiring |
| 6 — ≤300 lines | each new file < 80; `createRouter` grows ~30 lines (stays < 200) |
| 11 — architectural change | approved at the gate 2026-08-24 |
| 13 — secrets do not leak | **the crux** — allowlist by type + key scrub, with a dedicated test |
| 15 — Domain ≠ Transport | logger is transport-free; the domain enriches via a pure port |
| 35 — `src/shared` no `@trpc` | `boundaryLog` imports only the lib `Logger` type |
| 32 — no commit to develop | `feature/025-structured-logging` |

## 6. Complexity / risk

| Risk | Mitigation |
| --- | --- |
| A secret slips into a line | Allowlist by type (no objects) + key scrub + a test asserting a token key is absent (D4) |
| Cross-call field leakage in a batch | Fresh per-call logger via `next({ ctx: { log } })` (D3); a test with two calls |
| The middleware swallows or mutates the result | It only reads `result.ok` and re-throws unchanged; existing procedure tests are the net |
| Noise: one line per call floods dev output | Pretty renderer is compact; a debug play-by-play stays opt-in, off by default |
| Removing `onError` logging drops error visibility | The middleware covers both entries (HTTP + RSC); error fields are richer than before |

---

*Plan does NOT contain: final code. That lives in the tasks.*
