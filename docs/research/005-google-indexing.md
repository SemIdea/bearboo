---
type: research
description: 'How to get this blog crawled and indexed by Google: the discovery channels that work, the Search Console operations, and the priorities after the basic SEO.'
load: cold
fires_on: op-call
fires_when: 'how to index the blog on Google: which discovery channels work today, the Search Console checklist, and what compounds after the basic SEO.'
consumed_by: ''
---

# Research — Google indexing for a Next.js blog

> **Location:** `docs/research/005-google-indexing.md`
> **Date:** 2026-09-16
> **Trigger:** free investigation: "como eu poderia indexar meu blog no Google — fazer researchs e entender" (owner, 2026-09-16)
> **Status:** draft
> MCP unavailable this session — WebFetch mode (the `research` MCP is absent under opencode; deep mode dispatched web-research subagents instead of `web_read`).

## 1. How Google discovers and indexes a page today (crawl → index → serve)

**Decision (proposed):** The channel that works is crawlable links (homepage → posts, post → related post) plus an accurate `lastmod` in a `sitemap.xml` referenced by `robots.txt` and submitted once in Search Console. Then wait: Google's own docs promise no timeline ("a week or so" to start, "a few weeks" to crawl), and indexing is never guaranteed — indexing and ranking are separate stages.

**Rationale:**
- The pipeline is crawl → index → serve. Discovery is link-first, sitemap-supplementary; indexing is conditional on quality, `robots` directives, and canonicalization — none of it is a submission API ([how search works](https://developers.google.com/search/docs/fundamentals/how-search-works)).
- The Page Indexing report vocabulary is not an error list: "Discovered – currently not indexed" = known, crawl rescheduled; "Crawled – currently not indexed" = fetched, deliberately left out; neither asks for a resubmit ([Page indexing report](https://support.google.com/webmasters/answer/7440203)).
- The sitemap ping endpoint is dead (deprecated June 2023, 404 since Jan 2024). Sitemaps go through Search Console/`robots.txt`, and `lastmod` is the one field Google reads — only if it is verifiably accurate ([sitemaps ping deprecation](https://developers.google.com/search/blog/2023/06/sitemaps-lastmod-ping), [build a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)).
- The Indexing API is documented only for `JobPosting`/`BroadcastEvent` — irrelevant to a blog ([Indexing API](https://developers.google.com/search/apis/indexing-api/v3/using-api)).
- RSS/Atom is a supplementary discovery channel, not a replacement; feeds must not be `robots`-blocked, and WebSub is the freshness mechanism named by Google ([RSS/Atom best practices](https://developers.google.com/search/blog/2014/10/best-practices-for-xml-sitemaps-rssatom)).
- IndexNow (Bing, Yandex, Seznam, Naver, Yep) has no Google adoption — it is a Bing-side accelerator only ([indexnow.org](https://www.indexnow.org/)).

**Alternatives considered:**
- **Instant-indexing pings / IndexNow for Google** — rejected: no effect on Google; the ping endpoint was removed.
- **Indexing API calls on publish** — rejected: restricted to two schema types, and quota-trivial for blogs.
- **Repeated "Request indexing"** — rejected: quota-limited and reserved for troubleshooting, not a bulk path.
- **Feed-only discovery** — rejected: supplementary by Google's own documentation.

**Sources:** the six URLs cited above.

---

## 2. Operational checklist: Search Console, sitemap, and debugging "not indexed"

**Decision (proposed):** In order — (1) create a **Domain property** in Search Console and verify it by **DNS TXT record** (covers http/https, www, all subdomains; a Vercel-managed DNS makes it a copy-paste record); (2) submit `https://<domain>/sitemap.xml` once; (3) keep `lastmod` real (W3C date-time, only significant edits); (4) use URL Inspection for the homepage and for each new post, "Request Indexing" sparingly (~10/property/day in the UI); (5) review the Page Indexing report weekly and map each reason to its cause; (6) add Bing Webmaster Tools as a secondary channel.

**Rationale:**
- Domain properties need only DNS verification and are protocol/subdomain-agnostic, unlike URL-prefix properties scoped per protocol/path ([Domain property](https://support.google.com/webmasters/answer/34592)).
- `changefreq` and `priority` are ignored; `lastmod` is trusted only when consistently accurate ([sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), [lastmod policy](https://developers.google.com/search/blog/2023/06/sitemaps-lastmod-ping)).
- "Request Indexing" is troubleshooting with a small UI quota; the API allows 2,000 QPD / 600 QPM ([URL Inspection](https://support.google.com/webmasters/answer/9012289), [quota limits](https://developers.google.com/webmaster-tools/limits)).
- **Soft 404s are real index risk:** a URL that returns HTTP `200` with "not found" content is classified as a soft 404 and excluded. This repo has exactly that on `/post/[slug]` (accepted 2026-07-12) — the research's conclusion is that SEO is now the reason to reopen it. Return real `404`/`410` ([crawling errors](https://developers.google.com/search/docs/crawling-indexing/troubleshoot-crawling-errors), [Page indexing report](https://support.google.com/webmasters/answer/7440203)).
- Remaining report reasons map cleanly: "Duplicate without user-selected canonical" → absolute `rel=canonical`; "Excluded by noindex" → remove the tag/header; "Crawled – currently not indexed" → quality, not a resubmit ([Page indexing report](https://support.google.com/webmasters/answer/7440203), [ask Google to recrawl](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl)).
- Bing: import the site from GSC, host an IndexNow key file, ping `api.indexnow.org` on publish; manual submission up to 10,000 URLs/day ([Bing URL submission](https://www.bing.com/webmasters/help/URL-Submission-62f2860b), [IndexNow](https://www.indexnow.org/)).

**Alternatives considered:**
- **URL-prefix property only** — rejected as the primary: per-protocol, path-scoped, and the meta-tag verification costs a code change; keep it optional.
- **HTML-file verification in `public/`** — rejected as the primary: works, but the domain property also covers `www` and future subdomains with one DNS record.
- **Fixing the soft 404 before discovery** — rejected in ordering: discovery first; the soft-404 fix is a follow-up feature.

**Sources:** the ten URLs cited above.

---

## 3. What compounds after the basic SEO (structured data, links, freshness, E-E-A-T, CWV)

**Decision (proposed):** Priority order for the next iteration — (1) internal linking: every indexable post gets ≥1 contextual in-body link from a related post (kill orphans); (2) `BreadcrumbList` JSON-LD and tag/category hub pages as link surfaces; (3) complete the article markup (`BlogPosting` + `author` `Person` with `url`/`sameAs`, `publisher` `Organization` + logo, honest `datePublished`/`dateModified`); (4) E-E-A-T: author page with a real bio linked from every byline, About page; (5) freshness: update high-impression old posts, bump `dateModified` only on significant edits; (6) CWV only where field data shows regressions; (7) monitoring via the Search Console API (striking-distance queries, content decay).

**Rationale:**
- Google: "Every page you care about should have a link from at least one other page on your site" — discovery is primarily link-following ([links crawlable](https://developers.google.com/search/docs/crawling-indexing/links-crawlable)).
- `Article`/`BlogPosting` markup has no required properties and is not a ranking factor; it buys eligibility and machine-readable metadata only ([article structured data](https://developers.google.com/search/docs/appearance/structured-data/article), [structured data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)).
- `BreadcrumbList` is cheap hierarchy and produces a visible breadcrumb in results ([breadcrumb structured data](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb)).
- `lastmod` honesty: wrong dates get the whole field ignored ([lastmod policy](https://developers.google.com/search/blog/2023/06/sitemaps-lastmod-ping)).
- Core Web Vitals thresholds are field-data p75: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1; page experience "aligns with what our core ranking systems seek to reward" — a ranking input, not an indexing gate ([CWV](https://developers.google.com/search/docs/appearance/core-web-vitals), [thresholds](https://web.dev/articles/defining-core-web-vitals-thresholds)).
- E-E-A-T: trust is the load-bearing axis; bylines should link to author background, and content should demonstrate first-hand experience ([helpful content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)).
- GSC API surfaces: `searchanalytics` (striking distance, CTR by position), `sitemaps`, `urlInspection` ([API reference](https://developers.google.com/webmaster-tools/v1/api_reference_index)).

**Alternatives considered:**
- **FAQ/HowTo schema** — rejected: deprecated rich results, no blog payout.
- **Extra schema types or posting for "freshness"** — rejected: false freshness erodes date trust.
- **Broad CWV work** — rejected: Next.js/Vercel already ships fonts, image sizing, and streaming; fix only measured regressions.
- **Client-injected JSON-LD (GTM)** — rejected: delays discovery; keep it server-rendered.

**Sources:** the eight URLs cited above.

---

## Where this repo stands (scan 2026-09-16)

**Already in place (evidence):**
- `src/app/sitemap.ts` — homepage + published posts, `lastModified` from `updatedAt` (the one field Google reads), and `changeFrequency`/`priority` (ignored by Google; harmless).
- `src/app/robots.ts` — allow-all with private routes and `/api/` disallowed, sitemap declared.
- `src/app/layout.tsx` — `metadataBase` from `env.siteUrl`, title template, description, icons.
- Post page (`src/app/(half)/post/[slug]/page.tsx`) — absolute canonical (`canonicalUrl ?? /post/{slug}`), OpenGraph, server-rendered `Article` JSON-LD (`src/server/http/buildArticleJsonLd.ts`).
- `src/app/feed.xml/route.ts` — RSS 2.0 feed.
- SEO overrides and slug redirect shipped in feature 018.

**Gaps (evidence):**
- No Search Console verification anywhere (`rg google-site-verification` is empty) and no visible property — the single highest-leverage action, and it is human/ops, not code.
- Soft 404 on `/post/[slug]`: missing slug returns `200` (documented in `docs/ust.md`; owner accepted 2026-07-12 "reopen if SEO starts requiring a real 404" — this research reopens it).
- No `BreadcrumbList`; `Article` JSON-LD has no `author`/`publisher` entities (no author/About pages exist in the route inventory).
- Hub pages for tags/categories do not exist as routes (category/tag filtering lives inside `/search`), so post-to-post links are the only link surface besides the homepage and related posts.
- No IndexNow key (Bing channel unused).

**Suggested next steps:**
1. Human/ops now: create the GSC Domain property by DNS TXT, submit `/sitemap.xml`, inspect the homepage and 2-3 posts.
2. Code, if you want it delivered: a feature for (a) the real-404 fix via middleware/proxy (the 2026-07-12 blocker), (b) `BreadcrumbList` + `author`/`publisher` in the JSON-LD, (c) an About page, (d) IndexNow key + ping on publish.
3. Fold this dossier into that feature's spec (then set this file's `Status` to `applied` and fill `consumed_by`).

---

*Global research (not tied to a feature) feeds future PRD/ACH decisions or cross-project ADRs. To incorporate it:*
*1. Cite this research in any project doc that decides based on it (e.g. `prd.md` § 4 RFs, `ach.md` § 1 stack, a specific ADR).*
*2. If it becomes a load-bearing decision, turn it into an ADR via `/afm:<skill> adr`.*
*3. After you incorporate it, change this file's `Status` from `draft` to `applied`.*
