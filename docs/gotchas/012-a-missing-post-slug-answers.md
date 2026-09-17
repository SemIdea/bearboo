---
type: gotcha
description: 'A missing `/post/<slug>` answers HTTP 200 with `noindex` — streamed 404 behavior, accepted on 2026-09-16'
load: warm
fires_on: event
fires_when: 'if you test a missing `/post/<slug>` and see HTTP 200, or you are about to add a real 404 to a streamed route.'
---

# A missing `/post/<slug>` answers HTTP 200 with `noindex` — streamed 404 behavior (accepted 2026-09-16)

**Trigger:** if you check a missing `/post/<slug>` and it answers HTTP `200`, or you are about to make a streamed route return a real `404`.

**Behavior:** with `cacheComponents` and streaming, `notFound()` commits the response headers as `200` before the error is reached; Next renders the not-found UI and injects `<meta name="robots" content="noindex">`. Verified live on 2026-09-16: `/post/nao-existe-xyz-999` → `200` + `noindex` (non-post missing routes answer `404` normally). Next's own docs state a streamed 404 cannot change its status, and that a true `404` requires deciding **before** the stream starts — the Proxy layer (Next 16 runs it on the Node.js runtime).

**Solution:**
- Treat `200`+`noindex` as equivalent to excluded from the index for SEO purposes: Google sees the `noindex` and drops the URL. It costs crawl budget and monitoring accuracy, not indexation of real pages.
- The owner decision on 2026-09-16 (feature `030-seo-metadata-fixes`) is **accept and document**; a Proxy-layer existence check stays the documented follow-up, to be approved as an architectural change (hard rule 11) if Page Indexing ever reports it as a problem.

**Ref:** `docs/features/030-seo-metadata-fixes/spec.md` § 4; `docs/ust.md` (the `/post/[slug]` 200 entry).
