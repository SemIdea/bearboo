---
type: gotcha
description: 'A missing `/post/<slug>` answers HTTP 200 with `noindex` — streamed 404 behavior, accepted on 2026-09-16'
load: warm
fires_on: event
fires_when: 'if you test a missing `/post/<slug>` and see HTTP 200, or you are about to add a real 404 to a streamed route.'
---

# A missing `/post/<slug>` answers HTTP 200 with `noindex` — streamed 404 behavior (accepted 2026-09-16)

**Trigger:** if you check a missing `/post/<slug>` and it answers HTTP `200`, or you are about to make a streamed route return a real `404`.

**Behavior:** with `cacheComponents` and streaming, `notFound()` commits the response headers as `200` before the error is reached; Next renders the not-found UI. Verified live on 2026-09-16 in **production and locally on 16.3.5**: `/post/<missing>` → `200` with **no `noindex`** (the earlier `noindex` observation belonged to `/api/health`, a real 404 — the distinction matters). Non-post missing routes answer `404` normally. Next's own docs state a streamed 404 cannot change its status, and that a true `404` requires deciding **before** the stream starts — the Proxy layer (Next 16 runs it on the Node.js runtime).

**Solution:**
- A missing post URL is a soft 404 with not-found content and **no explicit robots directive**; Google's soft-404 detection usually excludes it, but nothing guarantees it. It also costs crawl budget and makes monitoring read `200`.
- The owner decision on 2026-09-16 (feature `030-seo-metadata-fixes`) was to **accept and document** on the (now corrected) evidence; a Proxy-layer existence check stays the documented follow-up and requires approval as an architectural change (hard rule 11).

**Ref:** `docs/features/030-seo-metadata-fixes/spec.md` § 4; `docs/ust.md` (the `/post/[slug]` 200 entry).
