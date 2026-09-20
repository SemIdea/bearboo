---
type: gotcha
description: 'Next.js — a `"use cache"` page never knows who is asking (no cookies)'
load: warm
fires_on: event
fires_when: 'if you need to personalize the content of a route that is today `"use cache"`/`cacheLife(...)` based on who is logged in (e.g. the owner sees something a visito'
---

# Next.js — a `"use cache"` page never knows who is asking (no cookies)

**Trigger:** if you need to personalize the content of a route that is today `"use cache"`/`cacheLife(...)` based on who is logged in (e.g. the owner sees something a visitor does not).

**Behavior:** `src/server/caller.ts` has two callers: `createCaller()` (used inside `"use cache"` components, builds the context with `headers: new Headers()` **always empty, no cookies**) and `createDynamicCaller()` (reads real cookies, but **redirects to `/auth/login` if there is no session** — only for a 100% authenticated page). Neither works alone for "a public page that sometimes needs to know the owner": `createCaller()` never sees `ctx.user` (bitten in `docs/features/011-post-status-preview/plan.md` § 9 — passing `ctx.user?.id` to the domain inside a `"use cache"` component simply never resolves, because the caller used there never had cookies in the first place). And you cannot just call `cookies()` inside the `"use cache"` component — Cache Components forbids a dynamic read in that scope (the same rule family as the previous gotcha).

**Solution:** create a third caller — `createOptionalDynamicCaller()` (`src/server/caller.ts`) — that reads cookies like `createDynamicCaller` but **does not redirect** if there is no session. Structure the page in two components: the cached one (`"use cache"`, the public/common path, via `createCaller()`) tries first; only when it finds nothing, a **new, non-cached component, inside the same `<Suspense>`**, tries again with `createOptionalDynamicCaller()`. This keeps the cache for the common path and pays the dynamic cost only in the rare case that needs identity. You cannot remove `"use cache"` from the whole page without losing the cache for common traffic — only do that if the "personalized" case is the majority of traffic, not the exception.

**Ref:** `docs/features/011-post-status-preview/plan.md` § 9, `src/server/caller.ts`.



<!--
Additional module SEED candidate found in the scan (Next.js App Router), not yet confirmed as bitten — activate only if it happens.
