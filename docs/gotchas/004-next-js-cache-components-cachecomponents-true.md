---
type: gotcha
description: 'Next.js — Cache Components (`cacheComponents: true`) forbids a route without `<Suspense>`, even if you do not want PPR'
load: warm
fires_on: event
fires_when: 'if you are trying to make a route block the whole response until the data arrives (e.g. for `notFound()` to set a real HTTP 404 status before the shell is sent)'
---

# Next.js — Cache Components (`cacheComponents: true`) forbids a route without `<Suspense>`, even if you do not want PPR

**Trigger:** if you are trying to make a route block the whole response until the data arrives (e.g. for `notFound()` to set a real HTTP 404 status before the shell is sent) by removing the `<Suspense>` that wraps the dynamic read.

**Behavior:** with `cacheComponents: true` (`next.config.ts`), every non-`"use cache"` async read (including `await params`, `cookies()`, a DB query) must be inside a `<Suspense>` — otherwise the build fails with `Error: Route "...": Uncached data was accessed outside of <Suspense>` (`next build --debug-prerender` points to the exact component). There is no more `export const dynamic = "force-dynamic"` as a per-route escape hatch — that route segment config was removed with the Cache Components adoption (Next 16). So: **you cannot have a fully blocking/dynamic route under Cache Components** — the shell is always sent before the dynamic content resolves, so the shell's HTTP status (200) can no longer change afterward. Bitten in `docs/features/009-post-404-status/` (2026-07-12): trying to remove the `Suspense` from `/post/[slug]` to fix the 404 broke the whole `next build`.

**Solution:** accept that, under Cache Components, `notFound()`/`redirect()` inside a `Suspense` boundary changes the content but not the HTTP status of the already-sent shell. For a real HTTP status (bots/SEO), the check must happen **before** the page render pipeline — e.g. `middleware`/`proxy` (Edge) doing the lookup and returning 404 directly, outside Cache Components. This is new infra (a data route on the Edge), not a point fix — stop and validate with the owner before you implement it.

**Ref:** `docs/features/009-post-404-status/`, `docs/ust.md` § Pendências Técnicas. Official doc: https://nextjs.org/docs/messages/blocking-route.
