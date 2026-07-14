# Feature 015 — Tasks

> **Plan:** [`./plan.md`](./plan.md)
> Toda task refere US-012/RF-10.

## Setup

- [X] T001 — Reler `src/server/features/post/**`, `src/server/models/post.ts`, `src/lib/env/**`, `src/app/layout.tsx`, `src/app/(half)/post/[slug]/page.tsx` a fresco (feito no discovery — sem lacuna nova).

## Backend — fundação (env, config, model, schema, domain, procedure)

- [X] T002 [P] — `src/lib/env/index.ts` ganha `siteUrl: getStrEnv("SITE_URL", "http://localhost:3000")`; `.env.example` ganha `SITE_URL="http://localhost:3000"` (US-012/RF-10).
- [X] T003 [P] — `src/config/site.ts`: `name`/`description` trocam do placeholder do boilerplate ("Next.js + HeroUI") pro nome/descrição reais do produto (README) (US-012/RF-10).
- [X] T004 — `src/server/models/post.ts`: **NOVO** método `readAllPublicSlugs(): Promise<{ slug: string; updatedAt: Date }[]>` reusando `publicVisibilityFilter()`; teste (público aparece, DRAFT/IN_REVIEW/ARCHIVED/SCHEDULED-futuro não) (US-012/RF-10).
- [X] T005 — `src/server/features/post/schema.ts`: **NOVO** `sitemapEntrySchema { slug, updatedAt }`, `readSitemapEntriesOutputSchema` (array) (depende de T004) (US-012/RF-10).
- [X] T006 — **NOVO** `src/server/features/post/domain/readSitemapEntries.ts` (`domain_readSitemapEntries`): `ctx.repositories.post.readAllPublicSlugs()`, sem input, sem regra de permissão; teste (depende de T005) (US-012/RF-10).
- [X] T007 — **NOVO** `src/server/features/post/procedures/readSitemapEntries.ts` (`publicProcedure`, sem input, output `readSitemapEntriesOutputSchema`) + registra `readSitemapEntries` no `PostRouter` (`src/server/features/post/index.ts`) + teste de procedure (depende de T006) (US-012/RF-10).

## Transporte — RSS builder puro (testável sem servidor)

- [X] T008 — **NOVO** `src/server/http/buildRssXml.ts`: função pura `buildRssXml({ siteUrl, title, description, posts })` → string XML RSS 2.0 (`<rss><channel>` com `title`/`link`/`description`/`item` por post: `title`, `link`, `description`, `pubDate`, `guid`); escapa entidades XML (`&`, `<`, `>`) nos campos de texto do usuário; teste unitário (posts viram `<item>`, campos escapados, `Content-Type`-friendly output) (US-012/RF-10).

## App Router — arquivos especiais + rotas

- [X] T009 — `src/app/layout.tsx`: `metadata.metadataBase = new URL(env.siteUrl)` (depende de T002) (US-012/RF-10).
- [X] T010 — **NOVO** `src/app/sitemap.ts`: `"use cache"` + `cacheLife("hours")` + `cacheTag("posts")`; monta `MetadataRoute.Sitemap` com a home + `post.readSitemapEntries` (depende de T007, T003) (US-012/RF-10).
- [X] T011 — **NOVO** `src/app/robots.ts`: `MetadataRoute.Robots`, `allow: "/"`, `disallow` de rotas privadas (`/post/create`, `/post/edit/`, `/post/mine`, `/user/profile`, `/auth/`, `/api/`), `sitemap: `${env.siteUrl}/sitemap.xml`` (depende de T002) (US-012/RF-10).
- [X] T012 — **NOVO** `src/app/feed.xml/route.ts`: `GET` route handler, `"use cache"` + `cacheLife("hours")` + `cacheTag("posts")`; chama `post.readRecent({ count: 20 })`, monta XML via `buildRssXml` (T008), retorna `Response` com `Content-Type: application/rss+xml; charset=utf-8` (depende de T008) (US-012/RF-10).
- [X] T013 — `src/app/(half)/post/[slug]/page.tsx` (`generateMetadata`): ganha `alternates.canonical`, `openGraph.images`/`openGraph.url`, `twitter: { card, title, description, images? }` (`summary_large_image` quando há `coverImageUrl`, senão `summary`) (depende de T009) (US-012/RF-10).
- [X] T014 — `src/app/(half)/post/[slug]/page.tsx` (`PostView`): embute `<script type="application/ld+json">` com `Article` schema.org (`headline`, `image`, `datePublished: createdAt`, `dateModified: updatedAt`, `author`); escapa `<` no JSON serializado pra prevenir quebra de tag (US-012/RF-10).

## Verificação

- [X] T015 — `npx tsc --noEmit` limpo + `npx vitest run` verde (suíte completa) + verificação ao vivo (`next dev` + `curl`): `GET /sitemap.xml` lista só posts publicamente visíveis; `GET /robots.txt` bloqueia rotas privadas e aponta pro sitemap; `GET /feed.xml` é RSS válido com posts publicados recentes; `view-source` de `/post/[slug]` mostra `<link rel="canonical">`, Open Graph com imagem, Twitter Card e JSON-LD válido (validar com `JSON.parse` do bloco extraído).

## Reconciliação (8.5)

- [X] T016 — `docs/roadmap.md` Fase 5: marca `[x]` nos itens cobertos (sitemap/robots/RSS/canonical/Twitter Card/schema.org); nota que "slug amigável + redirect" e os campos editáveis de SEO ficam pendentes. `docs/ust.md`: adiciona US-012 (Épico Posts). `docs/prd.md`: adiciona RF-10. `docs/ach.md`: registra os arquivos especiais novos do App Router (`sitemap.ts`/`robots.ts`/`feed.xml/route.ts`) e `src/server/http/` como local de helpers de transporte/formatação puros. `spec.md`/`plan.md` status → `done`.
- [X] T017 — Commit(s): backend (env/config/model/schema/domain/procedure + http builder), App Router (sitemap/robots/feed/metadata/JSON-LD), docs. Sem push.
