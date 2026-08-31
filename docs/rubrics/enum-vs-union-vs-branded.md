# Rubric — enum vs literal union vs branded type vs Zod schema

## Decision table

| Case | Choice | Anti-pattern |
| --- | --- | --- |
| A value exists in the DB (status, role, plan) — **in this repo** | `enum` in `schema.prisma` for persistence **+ a hand-rolled literal union** in the app model (`src/server/models/<entity>.ts`, e.g. `IPostStatus`/`IRole`), never the generated type imported from `@prisma/client` outside `infra/drivers/`/`test/prisma/` | Importing the Prisma-client type (`import { Role } from "@prisma/client"`) in domain/procedure/lib — it couples the app to the generated client where the rest of the code already does not |
| ≤ 5 closed values, live only in code | **Literal union** (`"latest" \| "next" \| "beta"`) | A pure TS enum — it generates transpilation garbage, not tree-shakeable |
| An open string with a rule (user-input, a free dist-tag) | **Schema parser** (Zod) + parse at the boundary | Validating inside the domain (violates hard rule 16) |
| A primitive with a semantic invariant (sha256, userId ≠ sessionId, currency cents) | **Branded type** (`type Hash = string & { __brand: "Hash" }`) | Raw `string` — loses the check at the call site |
| An opaque value from an external SDK (Stripe price id) | The SDK type + Zod at the boundary | Re-typing as branded — duplicates the SDK |

## When a branded type wins

- A function accepts 2 strings with different semantics (`copy(from: string, to: string)`) — branded avoids swapping the order.
- Hash, ID, currency in cents, timestamp in ms vs s — branded makes the conversion explicit.
- A different domain ID (UserId vs SessionId vs OrgId) — branded avoids passing a UserId where it asked for an OrgId.

## When a branded type is NOT worth it

- A string that goes to a log, UI, network — the reader gains nothing.
- The type already comes from the SDK as an opaque string — re-typing duplicates.
- A function has 1 parameter — no ambiguity to resolve.

## Anti-examples

- ❌ `enum Plan { FREE = "FREE", PRO = "PRO" }` in TS (a real enum, not a union) when Prisma already has `enum Plan { FREE, PRO }` — use a hand-rolled literal union (`"FREE" | "PRO"`) in the model, not a mirrored TS enum nor the type imported from `@prisma/client` (see the table row above — fixed 2026-07-12 after finding the real precedent, `IPostStatus`/`IRole`, during `013-role-based-permissions`).
- ❌ `type DistTag = string` accepting anything — use a literal union if closed, or Zod if open with a rule.
- ❌ `copy(src: string, dst: string)` called as `copy(dst, src)` by mistake — branded `SrcPath` and `DstPath` resolve it.
- ❌ Branded on every `string` "for consistency" — overhead with no check gain.
