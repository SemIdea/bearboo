---
type: rule
description: '`src/shared/**` does not import `@trpc/*`.'
load: warm
rule_number: 35
fires_on: event
fires_when: '`src/shared/**` does not import `@trpc/*`.'
---

# Hard rule 35 — `src/shared/**` does not import `@trpc/*`.

`shared/` is vocabulary common to server and client; transport is one specific consumer's opinion. The error catalog declares only what is agnostic (`message`/`retryable`/`level`); the projection to the tRPC code lives in `src/server/http/appErrorTransport.ts` as `Record<ErrorCode, TRPC_ERROR_CODE_KEY>` — total, checked at compile time. A new consumer (job, CLI, webhook) gets its **own** table, not a column in the domain catalog. See ADR-0019.
*Verification:* `rg -n "from \"@trpc" src/shared/` returns 0. **Compliant today** — inversion done in `024-error-boundary-centralization` (2026-08-22). *(The trigger targets the `import`: a raw `@trpc` grep would also match a mention in a comment.)*
