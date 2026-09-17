---
type: gotcha
description: 'A missing `/post/<slug>` answered HTTP 200 — fixed with a Proxy existence check on 2026-09-16'
load: warm
fires_on: event
fires_when: 'if you add streaming to a route that must answer 404, or you wonder how the real 404 for missing post slugs works.'
---

# A missing `/post/<slug>` answered HTTP 200 — fixed with a Proxy existence check (2026-09-16)

**Trigger:** if you check a missing `/post/<slug>` and it answers HTTP `200`, or you are about to make a streamed route return a real `404`.

**Behavior:** with `cacheComponents` and streaming, `notFound()` commits the response headers as `200` before the error is reached; Next renders the not-found UI. Verified live on 2026-09-16 in **production and locally on 16.3.5**: `/post/<missing>` → `200` with **no `noindex`** (the earlier `noindex` observation belonged to `/api/health`, a real 404 — the distinction matters). Non-post missing routes answer `404` normally. Next's own docs state a streamed 404 cannot change its status, and that a true `404` requires deciding **before** the stream starts — the Proxy layer (Next 16 runs it on the Node.js runtime).

**Solution:**
- **Fixed on 2026-09-16** (feature `030-seo-metadata-fixes`): `src/proxy.ts` (Next 16 Proxy, Node runtime) probes `PostModel.existsBySlug` for `/post/:slug` before the route renders and rewrites a missing slug to the `/404` route with status `404`; the migrated `x-url` header behavior from the old `src/middleware.tsx` also lives there, and a probe failure fails open (the page decides).
- Boundaries kept: a post that exists but is not publicly visible still flows through the page's own owner-preview/404 logic; `/post/create` and `/post/mine` are reserved and never probed.
- If streaming is ever added to another route that must answer `404`, it needs the same pre-render decision: a streamed `404` cannot change its status after the shell is committed (Next's documented behavior).

**Ref:** `docs/features/030-seo-metadata-fixes/spec.md` § 4; `docs/ust.md` (the `/post/[slug]` 200 entry).
