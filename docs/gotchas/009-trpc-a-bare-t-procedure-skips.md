---
type: gotcha
description: 'tRPC — a bare `t.procedure` skips the error-translation middleware'
load: warm
fires_on: event
fires_when: 'if you are creating a procedure with a bare `t.procedure` (instead of `baseProcedure`/`publicProcedure`/`protectedProcedure`/`verifiedProcedure`/`roleProcedure`'
---

# tRPC — a bare `t.procedure` skips the error-translation middleware

**Trigger:** if you are creating a procedure with a bare `t.procedure` (instead of `baseProcedure`/`publicProcedure`/`protectedProcedure`/`verifiedProcedure`/`roleProcedure`).

**Behavior:** the `AppError` → `TRPCError` translation lives in a middleware (`withAppErrors`) mounted on `baseProcedure` (ADR-0019). A procedure built outside that chain does not pass through the middleware — an `AppError` that escapes the resolver becomes `INTERNAL_SERVER_ERROR` (500) with the correct `httpCode` lost, **with no visible error** in type-check or local runtime. It bit `refreshSession` in `024-error-boundary-centralization` (a `TOO_MANY_REQUESTS` became a 500; caught by the suite, not the compiler).

**Solution:** derive from `baseProcedure`, not from `t.procedure` — even when you need to skip the session guards (that was the reason `baseProcedure` exists separately from `publicProcedure`: it carries only the translation, without the expired-session guard). A bare `t.procedure` is only for a case that provably throws no `AppError`.

**Ref:** ADR-0019 (§ Consequência, gotcha b). Translation choke point: `src/server/http/appErrorToTRPCError.ts`.
