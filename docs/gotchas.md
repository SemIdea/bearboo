# Gotchas — surprises that block another dev

> Each item is a counterintuitive surprise found in practice. It starts empty and grows on demand.
>
> **Entry rule:** only what blocked someone at least 2× or has a high chance of blocking (an SDK/runtime/external-lib gotcha) becomes a gotcha. Do not invent a gotcha — discover it.
>
> **Format:** each gotcha has a **trigger** ("if you are editing X, read first") + **counterintuitive behavior** + **solution** + a link to the ADR or canonical doc if any.
>
> **Order:** by area (not chronological). Use Ctrl-F with a file name or symbol.

---

## Next.js — `cookies()` / `headers()` only in a Server Component / route handler

**Trigger:** if you are using `cookies()` or `headers()` from `next/headers` in a pure lib or a Client Component.

**Behavior:** both work only in the request context — Server Component, route handler, server action. Anywhere else they throw at runtime.

**Solution:** read cookies in the Server Component / route handler, pass them to the client component as a prop. Never import `next/headers` in code that can run in the browser.

**Ref:** confirmed by the team in the retroactive adoption (`/afm:refactor`, 2026-06-30) as already bitten.

---

## Next.js — `revalidatePath` / `revalidateTag` does not invalidate React Query

**Trigger:** if you are in a route handler or server action and want to refresh the client cache.

**Behavior:** `revalidatePath` invalidates the Next cache (RSC + fetch), but React Query on the client has its own cache. A mutation via a server action must also invalidate the query on the client — it does not arrive automatically.

**Solution:** return a signal to the client that triggers `queryClient.invalidateQueries(...)`. Or use a stack client that already integrates it (e.g. `@trpc/tanstack-react-query` invalidates automatically in `onSuccess`).

**Ref:** confirmed by the team in the retroactive adoption (`/afm:refactor`, 2026-06-30) as already bitten. See `src/server/features/post/procedures/revalidate.ts` + `src/server/features/post/domain/revalidate.ts` (ISR revalidation, per-feature structure from ADR-0006).

---

## Native Node ESM (`prisma/*.ts` via `node`) — you cannot re-import `src/lib/*`

**Trigger:** if you are writing a script in `prisma/` (seed, manual test script, etc.) that runs via `node --env-file=.env prisma/algo.ts` — not via Next.js/webpack.

**Behavior:** `tsconfig.json` uses `moduleResolution: "bundler"`, which allows an extensionless relative import (`from "../adapter"`) across all of `src/`. Node's native TS execution does not accept it — it requires an extension on every relative import. A script in `prisma/` that imports something from `src/lib/` breaks as soon as that module (or anything it imports, in a chain) has an extensionless relative import — which is the whole project's default convention in `src/`. Bitten 2× (`prisma/seed.ts`, `2026-07-11`; `prisma/seed-pagination-test.ts`, `2026-07-12`) — both times the "solution" became duplicating the logic in the script, which in turn duplicated the duplication.

**Solution:** pure logic reused by `prisma/` scripts lives in `prisma/*.ts` (not in `src/`), with no relative import of its own (a leaf file) — so another `prisma/` script can import it with an explicit extension (`from "./slug.ts"`) without falling into the broken chain. It needs `"allowImportingTsExtensions": true` in `tsconfig.json` (safe with `noEmit: true`, which was already the case). See `prisma/slug.ts` (single source of `generateSlug`, used by `seed.ts` and `seed-pagination-test.ts`).

**Ref:** `docs/features/003-post-pagination/` (found while creating `seed-pagination-test.ts`, 2026-07-12).

---

## Next.js — Cache Components (`cacheComponents: true`) forbids a route without `<Suspense>`, even if you do not want PPR

**Trigger:** if you are trying to make a route block the whole response until the data arrives (e.g. for `notFound()` to set a real HTTP 404 status before the shell is sent) by removing the `<Suspense>` that wraps the dynamic read.

**Behavior:** with `cacheComponents: true` (`next.config.ts`), every non-`"use cache"` async read (including `await params`, `cookies()`, a DB query) must be inside a `<Suspense>` — otherwise the build fails with `Error: Route "...": Uncached data was accessed outside of <Suspense>` (`next build --debug-prerender` points to the exact component). There is no more `export const dynamic = "force-dynamic"` as a per-route escape hatch — that route segment config was removed with the Cache Components adoption (Next 16). So: **you cannot have a fully blocking/dynamic route under Cache Components** — the shell is always sent before the dynamic content resolves, so the shell's HTTP status (200) can no longer change afterward. Bitten in `docs/features/009-post-404-status/` (2026-07-12): trying to remove the `Suspense` from `/post/[slug]` to fix the 404 broke the whole `next build`.

**Solution:** accept that, under Cache Components, `notFound()`/`redirect()` inside a `Suspense` boundary changes the content but not the HTTP status of the already-sent shell. For a real HTTP status (bots/SEO), the check must happen **before** the page render pipeline — e.g. `middleware`/`proxy` (Edge) doing the lookup and returning 404 directly, outside Cache Components. This is new infra (a data route on the Edge), not a point fix — stop and validate with the owner before you implement it.

**Ref:** `docs/features/009-post-404-status/`, `docs/ust.md` § Pendências Técnicas. Official doc: https://nextjs.org/docs/messages/blocking-route.

---

## Next.js — a `"use cache"` page never knows who is asking (no cookies)

**Trigger:** if you need to personalize the content of a route that is today `"use cache"`/`cacheLife(...)` based on who is logged in (e.g. the owner sees something a visitor does not).

**Behavior:** `src/server/caller.ts` has two callers: `createCaller()` (used inside `"use cache"` components, builds the context with `headers: new Headers()` **always empty, no cookies**) and `createDynamicCaller()` (reads real cookies, but **redirects to `/auth/login` if there is no session** — only for a 100% authenticated page). Neither works alone for "a public page that sometimes needs to know the owner": `createCaller()` never sees `ctx.user` (bitten in `docs/features/011-post-status-preview/plan.md` § 9 — passing `ctx.user?.id` to the domain inside a `"use cache"` component simply never resolves, because the caller used there never had cookies in the first place). And you cannot just call `cookies()` inside the `"use cache"` component — Cache Components forbids a dynamic read in that scope (the same rule family as the previous gotcha).

**Solution:** create a third caller — `createOptionalDynamicCaller()` (`src/server/caller.ts`) — that reads cookies like `createDynamicCaller` but **does not redirect** if there is no session. Structure the page in two components: the cached one (`"use cache"`, the public/common path, via `createCaller()`) tries first; only when it finds nothing, a **new, non-cached component, inside the same `<Suspense>`**, tries again with `createOptionalDynamicCaller()`. This keeps the cache for the common path and pays the dynamic cost only in the rare case that needs identity. You cannot remove `"use cache"` from the whole page without losing the cache for common traffic — only do that if the "personalized" case is the majority of traffic, not the exception.

**Ref:** `docs/features/011-post-status-preview/plan.md` § 9, `src/server/caller.ts`.

---

<!--
Additional module SEED candidate found in the scan (Next.js App Router), not yet confirmed as bitten — activate only if it happens.

## Next.js — a root layout under a dynamic segment leaves `_not-found` orphaned

**Trigger:** if you delete `app/layout.tsx` and move `<html>`/`<body>` to a dynamic segment (e.g. `app/[lang]/layout.tsx`).

**Behavior:** Next generates an internal route `/_not-found` that lives outside the dynamic segment, with no root layout to compose the document.

**Solution:** `app/global-not-found.tsx` + `experimental.globalNotFound: true`. Does not apply to Bearboo today (no `[lang]` routes), but is registered in case i18n enters scope.
-->

---

*To add a new gotcha: copy the format above. Place it in alphabetical order by area. If there is no area for it, create a new H2 section.*

## Pre-push hook — runs scoped tests, not the full suite

**Trigger:** if you are pushing and want to understand why pre-push did not run your favorite test.

**Behavior:** `.husky/pre-push` (since 2026-07-16) runs `lint-staged --diff "origin/main...HEAD"` instead of `yarn test` (the full suite). `lint-staged` uses the `.lintstagedrc.json` config that calls `vitest related <files>` — that is, **it only runs tests linked to the changed files**. Benefit: pre-push stays fast (seconds instead of minutes). Risk: it does not catch breaks in files that are not directly related — especially relevant in a project with **shared mocks in serial state** (`src/test/setup.ts` seam, ADR-0011). Example: a test for `src/server/features/user/procedures/login.ts` is changed; pre-push **does not run** the tests for `src/server/features/auth/procedures/verifyToken.ts` if there is no direct import.

**Solution:** **Pre-push is a fast local gate, and today it is the only automated gate that exists** — `docs/roadmap.md` Phase 10 (CI/CD) has not started (no `.github/workflows/`), so there is no full-suite gate running at merge to catch cross-module breaks later. Mitigation until Phase 10 exists:
- Run `yarn test` locally (full suite) before a push when the change touches several modules or touches something used by the shared mocks (`src/test/setup.ts`, ADR-0011).
- When Phase 10 (CI/CD) is built, the full suite should ideally run there as the real gate — until then, the full suite only runs if someone runs `yarn test` by hand.

**Ref:** `docs/research/003-pre-push-scoped-tests.md` (decision: Option 2 — lint-staged + vitest related; the research already recorded this trade-off, this note corrects the gotcha that had assumed CI/CD as an existing backstop).

---

## Zod v3 → v4 — string-format validators became top-level functions (deprecated, not an error)

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

---

## tRPC — a bare `t.procedure` skips the error-translation middleware

**Trigger:** if you are creating a procedure with a bare `t.procedure` (instead of `baseProcedure`/`publicProcedure`/`protectedProcedure`/`verifiedProcedure`/`roleProcedure`).

**Behavior:** the `DomainError` → `TRPCError` translation lives in a middleware (`withDomainErrors`) mounted on `baseProcedure` (ADR-0019). A procedure built outside that chain does not pass through the middleware — a `DomainError` that escapes the resolver becomes `INTERNAL_SERVER_ERROR` (500) with the correct `httpCode` lost, **with no visible error** in type-check or local runtime. It bit `refreshSession` in `024-error-boundary-centralization` (a `TOO_MANY_REQUESTS` became a 500; caught by the suite, not the compiler).

**Solution:** derive from `baseProcedure`, not from `t.procedure` — even when you need to skip the session guards (that was the reason `baseProcedure` exists separately from `publicProcedure`: it carries only the translation, without the expired-session guard). A bare `t.procedure` is only for a case that provably throws no `DomainError`.

**Ref:** ADR-0019 (§ Consequência, gotcha b). Translation choke point: `src/server/http/domainErrorToTRPCError.ts`.
