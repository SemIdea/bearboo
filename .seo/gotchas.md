# SEO gotchas (project-specific)

> Provenance + date on every entry (the plugin's honesty rule: an editable observation, never a Google fact). `watch` proposes entries here.

## The homepage feed is client-rendered — crawlers see an empty shell (2026-09-16, evidence: `crawler.crawl_site` + `analyze_page`)

`analyze_page` reads **5 words** on `/` and the crawler found **1 node / 0 post links** (`robotsBlockedCount 2`, `orphanRate 1`). The feed is rendered by React Query on the client, so the served HTML carries no post links and almost no text. Consequence: link discovery relies on the sitemap alone, and AI crawlers (which do not execute JS) see an empty page. Fix direction: server-render the first page of the feed.

## `analyze_page` under-reports `<title>` on Next 16 pages (2026-09-16, evidence: raw HTML 71 chars vs tool 0)

The tool reads the title with the strict selector `head > title`; on this Next 16 output the parsed DOM fails it (cheerio: `title: 1`, `head > title: 0`). The post title exists and is 71 chars. Cross-check with raw HTML before reporting "title missing"; upstream fix candidate: `$("title").first()`.

## `pagespeed` server is missing from the plugin's `.mcp.json` (2026-09-16)

`packages/pagespeed` builds and registers `run_pagespeed_audit`, but `.mcp.json` does not list it. Wired manually in the opencode config (`seo-pagespeed`). Upstream fix candidate: add the server to the plugin manifest.

## `local_sources_collect` returns app source as `kind: "markdown"` on a CMS-backed project (2026-09-16)

With `output.kind: "cms"` (content in Postgres), the local reader globs `src/app/**/*.tsx` and returns TSX as "markdown". The LOCAL half of the audit must read the served HTML instead; the metadata linters never see real content from disk in this stack.
