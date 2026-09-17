---
type: gotcha
description: 'Zod v3 → v4 — string-format validators became top-level functions (deprecated, not an error)'
load: warm
fires_on: event
fires_when: 'if you are writing/reviewing a `z.object()` in any feature''s `schema.ts` and use `z.string().url()`, `.email()`, `.uuid()`, `.cuid()`/`.cuid2()`, `.ulid()`, `.d'
---

# Zod v3 → v4 — string-format validators became top-level functions (deprecated, not an error)

**Trigger:** if you are writing/reviewing a `z.object()` in any feature's `schema.ts` and use `z.string().url()`, `.email()`, `.uuid()`, `.cuid()`/`.cuid2()`, `.ulid()`, `.datetime()`, `.date()`, `.time()`, `.duration()`, `.ip()`/`.cidr()`, or `z.nativeEnum()`/`.merge()` in any Zod schema.

**Behavior:** the project is on `zod@^4.0.10` (`package.json`), but these methods still **compile and work** — they are v3 API kept for compat, with no type error or lint warning, so they slip past review. Zod v4 moved the string-format validators to top-level functions; the old form is **silently deprecated**. Caught in `018-seo-overrides-slug-redirect` (`post/schema.ts`): `coverImageUrl`/`canonicalUrl` used `z.string().url()`.

**Solution — a 1:1 swap, no behavior change:**

| v3 (deprecated, still works) | v4 (correct) |
| --- | --- |
| `z.string().url()` | `z.url()` |
| `z.string().email()` | `z.email()` |
| `z.string().uuid()` | `z.uuid()` |
| `z.string().cuid()` / `.cuid2()` | `z.cuid()` / `z.cuid2()` |
| `z.string().ulid()` | `z.ulid()` |
| `z.string().datetime()` | `z.iso.datetime()` |
| `z.string().date()` | `z.iso.date()` |
| `z.string().time()` | `z.iso.time()` |
| `z.string().duration()` | `z.iso.duration()` |
| `z.string().ip()` | `z.ipv4()` / `z.ipv6()` (v4 split the two) |
| `z.string().cidr()` | `z.cidrv4()` / `z.cidrv6()` |
| `z.nativeEnum(MyEnum)` | `z.enum(MyEnum)` (v4 accepts a native TS enum directly) |
| `schemaA.merge(schemaB)` | `schemaA.extend(schemaB.shape)` |
| `error.format()` / `.flatten()` | `z.treeifyError(error)` / `z.prettifyError(error)` |
| `{ message: "..." }` in refinements/checks | `{ error: "..." }` (v4 unified `message`/`invalid_type_error`/`required_error` into a single `error`) |

**Not found in the 2026-07-18 scan** (documented only as a preventive reference, YAGNI on the fix — the gotcha entry rule is satisfied by "documented behavior of an external SDK known to surprise", not by having bitten 2×): `nativeEnum`, `.merge()`, `.format()`/`.flatten()`, `email`/`uuid`/`cuid`/`datetime`/`ip`. Only `z.string().url()` was found and fixed (`post/schema.ts`).

**Ref:** confirmed by the owner (2026-07-18) reviewing `018-seo-overrides-slug-redirect`; the reason it became a gotcha instead of a silent fix is exactly that it gave no type error — without this entry, the old pattern leaks into a new schema again with nobody noticing.
