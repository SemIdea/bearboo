# Feature 030 — SEO metadata fixes (the crawlability surface)

> **Spec:** the what and the why. The engine evidence is the audit scorecard (PR #239, `.seo/audit.md`).
> **Related:** RF-10 (SEO and professional publishing — closed in `015-seo-metadata`/`018-seo-overrides-slug-redirect`). The 2026-09-16 engine audit scored the site **7/100 (poor)**: `structure.no-canonical` fail on the home, `metadata.h1-missing` on home and post, incomplete Open Graph, `schema.missing-recommended-field` and `schema.inlanguage-missing`.
> **Status:** done — delivered 2026-09-16 (`npm test` 424/424; tasks T001-T010).
> **Opened:** 2026-09-16

## 1. Problem

The live site carries an incomplete crawl surface: the home has no `rel=canonical` and no `<h1>`, the post has no `<h1>`, the home has no Open Graph at all and the post misses `og:locale`/`og:site_name`/`og:image`, the `Article` JSON-LD lacks `publisher`, `image` and `inLanguage`, and there is no Search Console verification hook. These are eligibility/completeness defects (schema/meta are not ranking levers) — but they leave Google and AI crawlers with less than the page already knows.

## 2. Scope

**In:**
- Root metadata: complete Open Graph (`type`, `locale`, `siteName`, `url`, `title`, `description`) and an env-driven `verification.google`.
- Home: `alternates.canonical` and one `<h1>`.
- Post: the title becomes the `<h1>`.
- `buildArticleJsonLd`: `publisher` (Organization), `inLanguage: "en-US"`, and an `image` fallback to the generated OG route.
- `src/app/opengraph-image.tsx` (`next/og` ImageResponse, default font) → `og:image` for both pages.
- The real 404: `src/proxy.ts` (Next 16 Proxy, Node runtime) probes `PostModel.existsBySlug` for `/post/:slug` and rewrites a missing slug to the `/404` route with status `404`; it also carries the `x-url` header behavior migrated from the deleted `src/middleware.tsx`.
- A gotcha for the streamed-404 behavior and the decision.

**Out:**
- Per-post Open Graph cards (the generated route is site-wide).
- Content-level fixes (title/meta length, word count, passages, question headings) → `/seo-write`.
- Search Console OAuth/property and the PageSpeed quota (owner/ops).
- Locale migration to `pt-BR` (owner decision: keep `en-US`).

## 3. Acceptance criteria

- Home HTML carries `rel=canonical` (absolute) and exactly one `<h1>`; the post carries exactly one `<h1>`.
- Both pages carry the required OG set (`og:type`, `og:locale`, `og:site_name`, `og:url`, `og:title`, `og:description`) and `og:image` resolves to the generated route (`200`, `image/png`).
- `Article` JSON-LD includes `publisher.name`, `inLanguage: "en-US"` and `image` (cover when present, generated route otherwise).
- `<meta name="google-site-verification">` renders only when `GOOGLE_SITE_VERIFICATION` is set (no literal in the repo).
- `/post/<missing>` answers HTTP `404` with the app's not-found UI; real slugs and reserved paths (`/post/create`, `/post/mine`) are untouched.
- Unit tests cover the metadata builders and the JSON-LD; biome, `tsc`, `npm test` and `next build` are green; the Vercel preview shows the tags live.

## 4. Notes

- The soft-404 (`/post/<missing>` → HTTP 200) is Next's documented streamed-response behavior. **Correction (2026-09-16, end-to-end run): this route carries NO `noindex`** — verified in production and locally on 16.3.5; the earlier `noindex` observation belonged to `/api/health`, a real 404. With that corrected evidence the owner reopened the gate and approved the Proxy: `src/proxy.ts` probes existence and rewrites to `/404` with status `404` (verified end-to-end: 404 + the app's not-found UI; reserved slugs and real posts untouched; the probe fails open).
- Locale stays `en-US`; the PT content mismatch is known and recorded — the locale lint keeps flagging it until one side moves.
- References: the research dossiers live in PR #238; the scorecard and gotchas in PR #239.
