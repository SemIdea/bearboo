---
type: research
description: 'How to get a site hosted on the free *.vercel.app host indexed by Google, what verification is possible without owning a domain, and the limits of not buying one.'
load: cold
fires_on: op-call
fires_when: 'can a blog on a free vercel.app domain be indexed by Google, and how — Search Console property, verification, canonical setup, limits.'
consumed_by: ''
---

# Research — Indexing a site on the free `*.vercel.app` host

> **Location:** `docs/research/006-vercel-app-indexing.md`
> **Date:** 2026-09-16
> **Trigger:** free investigation: "como eu poderia indexar um site da vercel? É possível? sem comprar um domínio" (owner, 2026-09-16)
> **Status:** draft
> MCP unavailable this session — WebFetch mode (the `research` MCP is absent under opencode; normal mode with direct web search).

## 1. Can a production site on the free `*.vercel.app` host be indexed by Google?

**Decision (proposed):** Yes. `your-project.vercel.app` is a normal public hostname; Google crawls and indexes it like any other site. What you **cannot** do without owning a domain is verify a **Domain property** (DNS-only, and `vercel.app` DNS belongs to Vercel) — but a **URL-prefix property** has five verification methods that do not need DNS, and two of them (HTML meta tag, HTML file) are fully available on a Next.js project you deploy yourself.

**Rationale:**
- Search Console property types: a Domain property requires DNS record verification and cannot be created for a host you do not control; a URL-prefix property covers exactly `https://your-project.vercel.app/` and accepts HTML file, HTML meta tag, Google Analytics, and Tag Manager ([add a property](https://support.google.com/webmasters/answer/34592), [verify ownership](https://support.google.com/webmasters/answer/9008080)).
- Next.js exposes the meta tag through the Metadata API: `export const metadata = { verification: { google: "<code>" } }` in the **root** `app/layout.tsx` (Google checks the homepage for it; a nested page's metadata does not count) ([Next.js Metadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata), [GSC for Next.js](https://devstacked.tech/blog/google-search-console-setup-nextjs)).
- Vercel's `noindex` defaults do **not** apply to the production alias: Preview deployments and outdated Production deployments get `X-Robots-Tag: noindex` automatically, while the current Production deployment (the `*.vercel.app` alias) is indexable ([Vercel KB](https://vercel.com/kb/guide/are-vercel-preview-deployment-indexed-by-search-engines), [vercel/vercel discussion](https://github.com/vercel/vercel/discussions/5038)).
- The Hobby plan is free for **personal, non-commercial** projects and indexing is not gated by plan; the restriction is a commercial-use policy (ads/affiliate/payments/donations are commercial), not an SEO restriction ([fair use guidelines](https://vercel.com/docs/limits/fair-use-guidelines.md), [Hobby plan](https://vercel.com/docs/plans/hobby)).

**Alternatives considered:**
- **Domain property for `vercel.app`** — impossible: DNS verification only, and the zone is Vercel's.
- **HTML file in `public/`** — works for a URL-prefix property, but a file in the repo is a heavier artifact than the metadata field; keep it only as a fallback.
- **Waiting for the platform to submit you / using IndexNow for Google** — rejected: no platform submission exists, and IndexNow does not serve Google (see research 005).

**Sources:** the six URLs cited above.

---

## 2. How to do it on this repo (concrete, evidence-based)

**Decision (proposed):** One code change plus manual Search Console work — (1) the production env sets `SITE_URL=https://<project>.vercel.app`; (2) add `verification.google` (URL-prefix) to the root layout; (3) create the URL-prefix property in Search Console and verify; (4) submit `https://<project>.vercel.app/sitemap.xml`. Everything else (canonical, sitemap, robots) is already generated from `env.siteUrl` and needs no change.

**Rationale:**
- **The canonical triangle must agree**: GSC property host == sitemap URLs == `rel=canonical` == `metadataBase`. This repo derives all of them from `env.siteUrl` (`src/app/layout.tsx` sets `metadataBase`; `src/app/sitemap.ts` and `src/app/robots.ts` use it; the post page falls back to `/post/{slug}` resolved against `metadataBase`), so the only failure mode is the env value itself — the default is `http://localhost:3000`, which must be overridden in the Vercel Production environment. Mismatched host signals are the documented cause of "Discovered – currently not indexed" on Next/Vercel sites ([tedagentic case](https://tedagentic.com/posts/vercel-www-redirect-indexing), [Medium case](https://medium.com/@johnakande/next-js-and-vercel-why-your-pages-arent-indexing-d829c44b0e91)).
- The repo has **no verification token anywhere** today (`rg google-site-verification` is empty), and the root layout's `metadata` is the correct single place to add it.
- `robots.txt` already declares the sitemap and allows crawling of public routes (private routes and `/api/` are disallowed) — nothing to change.
- `sitemap.ts` already emits an accurate `lastModified` from `updatedAt`; Google reads `lastmod` and ignores `changeFrequency`/`priority` (research 005).
- Vercel's Preview deployments are `noindex` by default, so previews will not pollute the index; the only host that should be canonical is the production `*.vercel.app` alias.
- If a custom domain is ever added, Vercel's own guide prescribes the migration: one canonical host (noindex on the other, redirect to it) ([Vercel KB — duplicate content](https://vercel.com/kb/guide/avoiding-duplicate-content-with-vercel-app-urls)).

**Checklist (in order):**
1. Confirm the Vercel Production env has `SITE_URL=https://<project>.vercel.app` (not localhost); redeploy if changed.
2. Add the verification code to `src/app/layout.tsx` metadata (`verification: { google: "<code from GSC>" }`), commit, deploy.
3. Search Console → Add property → **URL prefix** → `https://<project>.vercel.app/` → verify by HTML tag.
4. Submit `https://<project>.vercel.app/sitemap.xml`; inspect the homepage and 2-3 posts (URL Inspection → Request indexing, sparingly).
5. Optional: Bing Webmaster Tools (import from GSC) — same URL-prefix + `msvalidate.01` meta.
6. Watch the Page Indexing report; expect the soft-404 bucket from the known `/post/[slug]` 200-for-missing defect (research 005, `docs/ust.md`).

**Alternatives considered:**
- **Skipping GSC and waiting for organic discovery** — rejected: on a brand-new host with no backlinks, the sitemap + manual inspection are the only accelerators; without a property there is no diagnosis.
- **Verifying by HTML file instead of the meta tag** — rejected as the default: the metadata field is versioned in the repo and survives deploys; a file works but adds an artifact with no benefit here.

**Sources:** the six URLs cited above plus [Search Console URL Inspection](https://support.google.com/webmasters/answer/9012289).

---

## 3. Limits and risks of staying on the free host

**Decision (proposed):** Acceptable for a personal, non-commercial blog — with four named risks and one migration path. Indexing itself is not limited; stability and control are.

**Rationale:**
- **URL stability:** the hostname is the project name. Renaming the Vercel project changes `*.vercel.app`, and every indexed URL breaks with no automatic redirect — the classic migration cost lands on you later.
- **No DNS control:** no Domain property (no unified protocol/subdomain data), no custom email, no platform-level DNS features. Verification and canonical control are per-origin only.
- **Trust/velocity:** the host is new; indexing can take weeks even when everything is correct (community reports months on brand-new hosts). Nothing to fix by code — sitemap + links + patience ([reddit thread](https://www.reddit.com/r/nextjs/comments/1nzdvjf/vercel_blocking_my_nextjs_app_form_being_indexed/)).
- **Policy dependence:** Hobby requires non-commercial use; monetization (ads, affiliate-primary, payments, donations) forces a Pro plan or a move ([fair use](https://vercel.com/docs/limits/fair-use-guidelines.md)).
- **No evidence of a platform-wide penalty:** Google treats `vercel.app` subdomains as ordinary hosts; no source found claims a blanket ranking penalty. The real risks are the four above, not a hidden demotion.
- **Migration path when a domain is bought:** add the custom domain as the canonical host (update `SITE_URL`), `noindex` or redirect the `vercel.app` host, re-verify the new property, resubmit the sitemap — per Vercel's duplicate-content guide.

**Alternatives considered:**
- **Buy a cheap domain now** — deferred by the owner's choice; the migration above stays available whenever desired.
- **Move to another free host (GitHub Pages user site, Netlify subdomain)** — rejected: same class of constraints (no DNS ownership, project-name coupling), no gain.
- **Free third-level domains from a registry** — not evaluated (out of the stated scope); different trust/abuse profile, would need its own research.

**Sources:** the four URLs cited above plus [add a domain](https://vercel.com/docs/domains/working-with-domains/add-a-domain).

---

## Where this repo stands (scan 2026-09-16)

- **Ready:** `sitemap.ts` (accurate `lastmod`), `robots.ts` (sitemap declared, private routes disallowed), absolute canonical + OpenGraph + `Article` JSON-LD on posts, `metadataBase` wired to `env.siteUrl`, RSS feed.
- **Missing for the vercel.app path:** a production `SITE_URL` value confirmed (default is localhost), the `verification.google` metadata field (no token in the repo today), and the Search Console property itself (manual).
- **Known sibling issue:** the soft-404 on `/post/[slug]` (research 005 § 2) — it will appear in the Page Indexing report as a soft 404; fix it as a follow-up feature if indexing quality becomes a blocker.

## Suggested next steps

1. Human/ops: confirm `SITE_URL` in Vercel Production, then create the URL-prefix property and verify.
2. Code, small: add `verification.google` to `src/app/layout.tsx` (needs the code from step 1) — could ride with the SEO feature suggested in research 005.
3. Fold this into the same feature (real-404, BreadcrumbList, author/publisher, About) when you decide to execute the SEO round; then set this file's `Status` to `applied` and fill `consumed_by`.

---

*Global research (not tied to a feature) feeds future PRD/ACH decisions or cross-project ADRs. To incorporate it:*
*1. Cite this research in any project doc that decides based on it (e.g. `prd.md` § 4 RFs, `ach.md` § 1 stack, a specific ADR).*
*2. If it becomes a load-bearing decision, turn it into an ADR via `/afm:<skill> adr`.*
*3. After you incorporate it, change this file's `Status` from `draft` to `applied`.*
