# Feature 015 — SEO e publicação profissional (metadata automática)

> **Spec:** o quê e o porquê. Sem decisão de tecnologia.
> **US relacionada(s):** US-012 (novo, Épico Posts) — RF-10.
> **Status:** done (2026-07-14 — `tsc --noEmit` limpo, `vitest` 259/259 verdes incl. 12 testes novos; `yarn build` verde (`/sitemap.xml`, `/robots.txt`, `/feed.xml` prerenderam); verificado ao vivo contra Postgres real via `next dev` — sitemap/robots/feed corretos, canonical/Open Graph/Twitter Card/JSON-LD válidos na página de post, com e sem imagem de capa)
> **Data de abertura:** 2026-07-14

## 1. Problema (do PRD/UST)

`docs/roadmap.md` Fase 5 pede que o blog seja indexável e bem apresentado quando compartilhado: hoje só existem `title`/`description`/Open Graph básico por post (`docs/features/generateMetadata` em `post/[slug]/page.tsx`, sem imagem). Faltam `sitemap.xml`, `robots.txt`, RSS feed, canonical URL, Twitter Card e schema.org — sem eles o site não é bem indexado por buscadores nem renderiza preview rico ao ser compartilhado (Discord/LinkedIn/WhatsApp).

## 2. Critério de sucesso observável

- [x] `GET /sitemap.xml` lista a home e todo post publicamente visível (mesma regra de `publicVisibilityFilter` — `PUBLISHED` ou `SCHEDULED` já vencido), com `lastModified`; posts `DRAFT`/`IN_REVIEW`/`ARCHIVED`/`SCHEDULED` futuro **não** aparecem.
- [x] `GET /robots.txt` permite crawling das páginas públicas, bloqueia rotas privadas (criar/editar/meus posts, perfil, auth, api) e aponta pro sitemap.
- [x] `GET /feed.xml` retorna RSS 2.0 válido com os posts publicados mais recentes (título, link, descrição, data).
- [x] Página de post (`/post/[slug]`) expõe `<link rel="canonical">` self-referencial e metadata Open Graph completa (title/description/type/image quando houver capa/url).
- [x] Página de post expõe Twitter Card (`summary_large_image` quando há imagem de capa, senão `summary`).
- [x] Página de post embute JSON-LD `schema.org/Article` (headline, imagem, datas de publicação/atualização, autor).
- [x] `<title>` de toda página usa o nome real do produto (hoje mostra o boilerplate "Next.js + HeroUI" herdado do template inicial).

## 3. Cenários (Gherkin)

```gherkin
Scenario: Sitemap lista só posts publicamente visíveis
  Given um post PUBLISHED, um DRAFT, um IN_REVIEW, um ARCHIVED, um SCHEDULED no futuro e um SCHEDULED no passado
  When o sitemap é gerado
  Then aparecem só o PUBLISHED e o SCHEDULED no passado (mesma regra de visibilidade pública já usada em readRecent/readBySlug)

Scenario: Robots.txt bloqueia rotas privadas
  When robots.txt é gerado
  Then rotas de criar/editar/meus-posts, perfil, auth e api aparecem em Disallow
  And a home e páginas de post não aparecem em Disallow
  And o robots.txt referencia a URL do sitemap

Scenario: RSS feed reflete posts recentes publicados
  Given 3 posts PUBLISHED e 1 DRAFT
  When o feed.xml é lido
  Then contém os 3 posts publicados, não contém o DRAFT

Scenario: Post compartilhado tem preview rico
  Given um post PUBLISHED com imagem de capa
  When a página do post é carregada
  Then a metadata inclui canonical, Open Graph com imagem, Twitter Card summary_large_image e JSON-LD Article válido
```

## 4. Out of scope

Decisão do dono (2026-07-14, discovery desta feature — Fase 5 do roadmap é grande, ver `docs/roadmap.md § Fase 5`):

- **`seoTitle`/`seoDescription`/`canonicalUrl` como campos editáveis no Post.** Sem migration, sem UI nova — tudo é computado de `title`/`content`/`slug` já existentes. Nenhum pedido de editor querer customizar isso diferente do conteúdo do post ainda existe.
- **Redirect de slug antigo → novo.** Hoje o slug nunca muda depois de criado (`domain_updatePost` não regenera slug no update) — "redirect quando slug muda" pressupõe uma feature de slug-mutation-on-edit que não existe e não foi pedida. Fica pra rodada futura, se/quando slug passar a mudar.
- **`ogImageUrl` dedicado.** Reusa `coverImageUrl` já existente (`010-post-cover-image`), que já antecipava esse wiring.
- **Sitemap paginado / `generateSitemaps`.** Assume volume abaixo do limite de 50k URLs do Google — um único `sitemap.xml` basta na escala atual do blog.
- **Localização (hreflang, sitemap multi-idioma).** Site é mono-idioma.

## 5. Assumptions / Open questions

Sem `[NEEDS CLARIFICATION:]` aberto — a única decisão irredutível desta rodada (escopo: automático sem campos novos vs. com campos editáveis vs. escopo completo incl. redirect de slug) foi resolvida por pergunta batched (discovery rodada 1/1, `/afm:deliver`) — ver § 7.

- **Premissa:** `lastModified` do sitemap e `pubDate`/`lastBuildDate` do RSS usam `updatedAt`/`createdAt` já existentes — sem precisar de um campo `publishedAt` dedicado (que o roadmap cita, mas não é necessário pros critérios de sucesso desta rodada).
- **Premissa:** `siteConfig.name`/`description` (`src/config/site.ts`) estavam com o placeholder do boilerplate inicial do template ("Next.js + HeroUI") — corrigidos pro nome/descrição reais do produto (README) como parte desta feature, pois afetam o `<title>` e `og:site_name` de toda página, não só posts.

## 6. Dependências

- `docs/roadmap.md` Fase 5 — origem do requisito.
- `010-post-cover-image` (done) — `coverImageUrl` reusado como imagem de Open Graph/Twitter/schema.org.
- `014-post-review-workflow` (done) — `publicVisibilityFilter()` (`src/server/models/post.ts`) reusado como fonte única da regra "o que é publicamente visível", tanto pro sitemap quanto pro RSS.

## 7. Clarifications

**2026-07-14 (discovery rodada 1/1, `/afm:deliver`):**

- **Q: qual subconjunto da Fase 5 entra nesta rodada?** R: SEO automático sem campos novos no Post — sitemap.xml + robots.txt + RSS feed + canonical (self-URL) + Twitter Card + schema.org Article, tudo computado dos campos já existentes. Campos editáveis de override (`seoTitle`/`seoDescription`/`canonicalUrl`) e redirect de slug ficam adiados — mesmo padrão de adiar `PostRevision` (Fase 4) e upload de imagem (Fase 2 → Fase 8).

---

*Spec NÃO contém: decisão de stack, nomes de função, schema de DB, ordem de tasks. Isso vai pro `plan.md`.*
