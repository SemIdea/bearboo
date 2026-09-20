# Feature 030 — Plan

> **Spec:** [`./spec.md`](./spec.md) · **Status:** done — delivered 2026-09-16 (all tasks closed).

## 1. Approach

Extract the metadata into a small pure module (`src/lib/seo/metadata.ts`) so the Open Graph set, the home canonical and the optional Google verification are unit-testable; wire it into `src/app/layout.tsx` and `src/app/page.tsx`. Add the `<h1>`s (home and post) and the generated OG route (`src/app/opengraph-image.tsx`). Extend `buildArticleJsonLd` with `publisher`, `inLanguage` and the image fallback, then update its tests. No new layer (the Proxy stays out by decision) — no ADR.

## 2. Components

| Component | File | Kind |
| --- | --- | --- |
| Metadata builders | `src/lib/seo/metadata.ts` | lib |
| Root layout wiring | `src/app/layout.tsx` | boundary |
| Home metadata + `<h1>` | `src/app/page.tsx` | boundary |
| Post `<h1>` | `src/app/(half)/post/[slug]/page.tsx` | boundary |
| JSON-LD fields | `src/server/http/buildArticleJsonLd.ts` | lib |
| OG image route | `src/app/opengraph-image.tsx` | route (boundary) |
| Config | `src/lib/env/index.ts` (`googleSiteVerification`) | config |
| Tests | `src/lib/seo/__test__/metadata.ts`, `src/server/http/__test__/buildArticleJsonLd.ts` | test |
| Docs | `docs/gotchas/012-*`, `docs/ust.md` (US-021) | doc |

## 3. Key decisions

- **Pure builders + unit tests** instead of inline metadata objects. Rule 1 is satisfiable for the data; the JSX `<h1>` placement stays structural (the repo has no UI test harness — the frontend is the documented forward-only gap in `afm.md § 3.1`), verified by the build and the preview.
- **`verification.google` from env** (`GOOGLE_SITE_VERIFICATION`): the code is complete before the Search Console code exists, and no literal enters the repo (rule 13).
- **`og:image` via `next/og` ImageResponse** with the default font — self-contained, no asset pipeline; per-post images are a later iteration.
- **Locale `en-US` kept**; `<html lang="en">` unchanged.
- **Soft-404: Proxy implemented** (2026-09-16, after the corrected evidence reopened the gate): `src/proxy.ts` migrates the old `x-url` header behavior, probes `PostModel.existsBySlug` for `/post/:slug`, and rewrites missing slugs to `/404` with status `404`; it fails open on a probe error.

## 4. Validation against afm.md § 3

- **Rule 1:** unit tests for the builders and the JSON-LD; the structural `<h1>`/route changes are covered by `next build` + the Vercel preview (documented gap).
- **Rules 4 / 6:** biome, `tsc`, `npm test`, `next build` in the § 6.1 ritual.
- **Rule 11:** no new layer, no Proxy.
- **Rule 13:** no secret; the verification token lives in env.
- **Rule 16:** N/A (no boundary input).
- **Rules 17 / 40:** docs land as deltas; no dead path citations (the research dossiers and the scorecard live in PRs #238/#239, cited by number).

## 5. Contract

```
/            → <link rel=canonical href="https://…/">, 1× <h1>, complete OG set, /opengraph-image → 200 image/png
/post/<slug> → 1× <h1>, OG title/description/url/type(+ inherited siteName/locale)/image,
               Article { publisher.name, inLanguage: "en-US", image }
GOOGLE_SITE_VERIFICATION set → <meta name="google-site-verification" content="…">
```

## 6. Risks

- **Metadata inheritance** (layout `openGraph` + page `openGraph`): if Next does not merge field-by-field on this version, the post would miss `siteName`/`locale`. Verification: curl the preview; the fallback is to pass both fields explicitly in the post's `openGraph` (a one-line change).
- **`next/og` on Vercel**: the build fails fast if unsupported; the recorded fallback is a static asset.
- **Scope drift into content**: post title/meta lengths and word counts are content (DB), not code — they stay `/seo-write`.
