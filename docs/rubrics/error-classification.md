---
type: rubric
description: Separates a domain error from a procedure error and from an infrastructure error.
load: warm
fires_on: file-shape
trigger_path: '*/domain/*'
trigger_grep: '(\b(TRPCError|HttpException|HTTPException|ApiError|ResponseError)\b|throw[[:space:]]+new[[:space:]]+Error\()'
fires_when: 'a transport error type or a bare `Error` is raised inside a `domain/` path'
---

# Rubric — error classification (Domain vs. Procedure vs. Infra)

## The 3 levels

### Domain error — a business rule is violated

**Who throws it:** `domain_*` functions (pure business rules).

**How to represent it:**

```ts
// Option A: Result<T, E> (preferred for clean flow control)
type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; code: E };

const result = await domain_createUserAuth({ ctx, input });
if (!result.ok) {
  switch (result.code) {
    case "EMAIL_TAKEN": ...
    case "WEAK_PASSWORD": ...
    default: {
      const _exhaustive: never = result.code;
      throw new Error(`unhandled domain code: ${_exhaustive}`);
    }
  }
}

// Option B: throw DomainError when the caller rarely handles each case
class DomainError<C extends string> extends Error {
  constructor(public readonly code: C, message?: string) { super(message); }
}
throw new DomainError("MAGIC_LINK_INVALID");
```

**The code must be a literal `as const`.** The switch then guarantees coverage in the caller, as long as `default` assigns the rest to `never` (see example). Without a literal code, a refactor breaks silently.

### Procedure error — transport boundary

**Who throws it:** procedures (tRPC handlers, route handlers, controllers).

**How to represent it:** `TRPCError` (or the framework equivalent — `HTTPException` in FastAPI, `BadRequestException` in Nest).

**The boundary is one-way.** The procedure knows Domain and maps code to HTTP status. Domain never imports `TRPCError` (hard rule 15).

```ts
// the procedure does the translation
const result = await domain_createUserAuth({ ctx, input });
if (!result.ok) {
  switch (result.code) {
    case "EMAIL_TAKEN":
      throw new TRPCError({ code: "CONFLICT", message: "Email já cadastrado" });
    case "WEAK_PASSWORD":
      throw new TRPCError({ code: "BAD_REQUEST", message: "Senha fraca" });
    default: {
      const _exhaustive: never = result.code;
      throw new Error(`unhandled domain code: ${_exhaustive}`);
    }
  }
}
```

### Infra error — external resource failure

**Who throws it:** no one on purpose. It rises from the HTTP client, the ORM, or the queue.

**How it propagates:**
- In a **Task-like** context (Trigger.dev, BullMQ): let it rise. The orchestrator's retry policy handles it.
- In a **Procedure-like** context: catch at the final boundary, log it, and map it to `INTERNAL_SERVER_ERROR`. Never leak the stack trace to the client.

## Anti-patterns

- ❌ **Domain imports `TRPCError`.** This couples Domain to the transport layer. Hard rule 15 checks it: `grep -rn "TRPCError" src/server/modules/**/domain/` must return 0.
- ❌ **`throw new Error("generic string")` in domain code.** Without a literal code, the caller cannot handle the error specifically. Use `DomainError({ code: "..." as const })` instead.
- ❌ **A generic try/catch around every `await`.** Typed errors beat a generic catch. Catch only when you will act on the error — map it, log it specifically, or apply a deliberate fallback. Otherwise let it rise.
- ❌ **A procedure that returns `{ error: "..." }` instead of throwing.** This breaks the framework contract and forces the client to check `data.error` instead of using the standard mechanism.
- ❌ **Mixing Domain error and Infra error in the same switch.** Domain code is closed — you know every case. Infra is open — the network can fail in N ways. Handle them separately.
- ❌ **An "exhaustive" switch with no `never` branch.** When a new code is added to a Domain error, existing callers still compile. They silently ignore the new case. Hard rule 4 catches this only when `default` assigns the rest to `never`.

## Decision flow

```
Where am I?
├── domain function → Result<T, E> with a literal `as const` code
├── procedure        → maps Domain code to TRPCError; lets Infra rise
├── task             → carries idempotency; lets Infra rise (retry handles it)
└── pure library      → Result<T, E> or DomainError with a discriminant code
```
