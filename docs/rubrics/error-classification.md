# Rubric — error classification (Domain ≠ Procedure ≠ Infra)

## The 3 levels

### Domain error — a violated business rule

**Who throws it:** `domain_*` functions (pure business rule).

**How it is represented:** `throw new AppError("<domain>.<code>")` — a namespaced code from the `ErrorRegistry`.

```ts
// The domain names what happened. Nothing else.
throw new AppError("post.not_found");
```

`AppError` carries **only the code** (ADR-0019). The message, `retryable`, and `level` are resolved by the consumer, via `resolveErrorEntry(code)`; the transport code, via `appErrorTransport` — which lives in `src/server/`, not in the catalog.

**The code is a literal derived from the registry** (`ErrorCode = keyof typeof Errors`) — a typo breaks `tsc`, not the runtime.

> **`Result<T, E>` was evaluated and rejected** (ADR-0017 § alternatives, reaffirmed in ADR-0018): the project's call depth is shallow (domain → 1 procedure) and the procedures are linear pipelines, so `throw` + a single translation at the boundary is already the optimum; `Result` would only add ceremony with no `?` operator or do-notation. This rubric presented `Result` as the preferred option until 2026-08-22 — no longer.

### Procedure error — the transport boundary

**Who throws it:** procedures (tRPC handlers / route handlers / controllers).

**How it is represented:** `TRPCError` (or the framework equivalent — `HTTPException` in FastAPI, `BadRequestException` in Nest).

**The boundary is one-way:** transport KNOWS the domain and maps a code → a transport code. The domain does not import `TRPCError` (rule 15) and does not declare a transport code (rule 35).

**The procedure writes no translation.** It lives in a middleware mounted on `baseProcedure` (ADR-0019):

```ts
// the whole procedure — no try/catch, no switch
.mutation(async ({ input, ctx }) =>
  domain_createComment({ ctx, input: { ...input, userId: ctx.user.id } }),
);
```

If you are writing `if (error instanceof AppError) throw new TRPCError(...)` in a procedure, stop: that is the duplication feature 024 removed from 32 places.

### Infra error — an external-resource failure

**Who throws it:** nobody intentionally — it comes up from an HTTP client, ORM, queue.

**How it propagates:**
- In a **Task-like** (Trigger.dev, BullMQ): let it rise. The orchestrator's retry policy handles it.
- In a **Procedure-like**: catch at the final boundary, log, map it to `INTERNAL_SERVER_ERROR`. Do not leak the stack to the client.

## Anti-patterns

- ❌ **Domain importing `TRPCError`.** The domain becomes coupled to transport. Hard rule 15: `grep -rn "TRPCError" src/server/modules/**/domain/` returns 0.
- ❌ **`throw new Error("generic string")` in domain.** With no literal code, the caller cannot handle it specifically. Use `AppError({ code: "..." as const })`.
- ❌ **A generic try/catch on every await.** Typed errors > a generic catch. Catch only if you will handle it (map, log specifically, do a conscious fallback). Otherwise let it rise.
- ❌ **A procedure that returns `{ error: "..." }` instead of throwing.** It breaks the framework contract, forces the client to check `data.error` instead of the standard mechanism.
- ❌ **Mixing a Domain error and an Infra error in the same switch.** A domain code is closed (I know all the cases); Infra is open (the network can fail in N ways). Handle them separately.

## Decision flow

```
Where am I?
├── domain function → throw new AppError("<domain>.<code>"); no transport
├── procedure        → translate nothing; let it rise (the middleware translates)
├── new boundary     → resolve via resolveErrorEntry + your own transport table
├── task             → carry idempotency; let Infra rise (retry handles it)
└── pure lib         → AppError with a code from the registry
```
