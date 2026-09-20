# SEO audit — scorecard (2026-09-16)

> **Mode:** post-deploy · **Target:** `https://bearboo-eight.vercel.app` · **Engine:** `@seo-mcp/*` rc.15 (opencode wiring: `~/.config/opencode/opencode.json`, symlink `~/.config/opencode/seo-mcp`).
> **How to re-run:** `node /tmp/opencode/mcp-call.mjs <server>/dist/index.js <calls.json>` (or natively after the opencode restart through the `seo-*` tools).

## Scorecard (`orchestrator.audit_score`, mode `post-deploy`)

**health 7/100 · band "poor"** — 0 pass / 13 warn / 7 fail / 0 error · `unknownCheckIds: []` · 20 falsifiable recommendations.

### Google-official (factual)
| checkId | status | evidence |
| --- | --- | --- |
| `structure.no-canonical` | fail | home has no `rel=canonical` (the post does) |

### Performance tier
| checkId | status | evidence |
| --- | --- | --- |
| `structure.no-jsonld` | warn | home has no JSON-LD (the post has `Article`) |

### Advisory (labeled heuristic — never hard fails)
| checkId | status | evidence |
| --- | --- | --- |
| `metadata.h1-missing` | fail | home 0 `<h1>`; post 0 `<h1>` (5× `h2`) |
| `metadata.og-missing-required` | fail | home: no OG at all; post: missing `og:locale`, `og:site_name` |
| `metadata.word-count-low` | fail | home 5 words (client-rendered feed); post 509 (min 600) |
| `metadata.og-missing-recommended` | warn | no `og:image` on either page |
| `metadata.title-short` | warn | home title `Bearboo` = 7 chars |
| `metadata.title-long` | warn | post title = 71 chars (truncates ~65) |
| `metadata.meta-long` | warn | post description = 165 chars (truncates ~155) |
| `schema.missing-recommended-field` | warn | `Article` lacks `image`, `publisher` |
| `schema.inlanguage-missing` | warn | `Article` has no `inLanguage` |
| `structure.heading-not-question` | warn | home 0/1; post 1/5 headings are questions |
| `structure.passage-too-long` | warn | post has a 5-sentence passage (>4) |
| `eeat.signals-absent` | warn | E-E-A-T weighted **38** (weak): expertise 0 (no credentials/citations), experience 50, trust 50 |
| `geo.citability-low` | warn | GEO citability **33** (0/13 passages in the 100-180 word band); structuralReadability 100 |
| `content.quality-low` | warn | quality **51**: lowDensity (0.07), highRepetition (200) |

### Supporting engine outputs
- `analyze_sitemap`: 2 URLs; heatmap `missingH1 100%`, `missingTitle 50%`, `missingCanonical 50%`, `missingSchema 50%`.
- `validate_robots_txt`: valid; `Sitemap:` present; AI-crawler matrix all `allowed` (info, weight 0).
- `crawl_site`: 1 node, 3 edges, `robotsBlockedCount 2`, `orphanRate 1` — the served home HTML exposes no post links.
- `semantic_index`: corpus `bearbooeightvercelapp` indexed (2 docs, 384 dims, model `Xenova/all-MiniLM-L6-v2`, local — no API key). `semantic_dedupe`: 0 pairs ≥ 0.86.
- Soft-404 (no registry checkId): `/post/<missing>` answers **HTTP 200** (soft 404 → excluded from the index); non-post missing routes answer 404. Documented in `docs/ust.md` (owner decision 2026-07-12: "reopen if SEO starts requiring a real 404").

## Checks that could not run (honest gaps — not installation)
- `pagespeed.run_pagespeed_audit`: **429 — daily quota exhausted** for the calling Google project (the API was reached).
- `gsc.*`: `authenticated: false` (token path `~/.config/seo-mcp/gsc-tokens.json`); needs OAuth + a verified property (research 006).
- `bing.*`: no `BING_WMT_API_KEY` in the environment.

## Next actions
1. Code (via `/afm-deliver`): home canonical, H1 on home + post, complete OG, schema `image`/`publisher`/`inLanguage`, `verification.google` (env-driven), soft-404 if approved.
2. Content (via `/seo-write`): post title/meta length, word count, shorter passages, question headings, author page.
3. Ops (owner): Search Console property + OAuth; PageSpeed quota reset.
