# Feature 015 — Plan

> **Spec:** [`./spec.md`](./spec.md)
> **Status:** done (implementado e verificado 2026-07-14, gate "Executa até o fim")

## 1. Resumo técnico

Três fios que fecham os critérios de sucesso da § 2 do spec, todos computados de dados já existentes (sem migration):

1. **Três arquivos especiais novos do App Router** — `src/app/sitemap.ts` (`MetadataRoute.Sitemap`), `src/app/robots.ts` (`MetadataRoute.Robots`) e `src/app/feed.xml/route.ts` (RSS 2.0 hand-rolled). Sitemap e feed reusam a mesma regra de visibilidade pública já centralizada em `publicVisibilityFilter()` (`014`) via uma procedure nova (`post.readSitemapEntries`) e a já existente `post.readRecent`, respectivamente.
2. **Metadata rica na página de post** — `generateMetadata` (`post/[slug]/page.tsx`) ganha `alternates.canonical`, Open Graph com `images`/`url`, e `twitter` card. `metadataBase` novo no root layout (`env.siteUrl`) resolve URLs relativas de imagem/canonical em toda a árvore de metadata.
3. **JSON-LD `schema.org/Article`** embutido em `PostView` (mesmo arquivo `page.tsx`) — computado dos campos já existentes do post (`title`, `content`, `coverImageUrl`, `createdAt`, `updatedAt`, autor).

Efeito colateral corrigido no mesmo lote (§ 5 do spec): `siteConfig.name`/`description` tinham o placeholder do template inicial ("Next.js + HeroUI"), que vaza pro `<title>` de toda página e `og:site_name` — trocado pro nome/descrição reais do produto.

## 2. Componentes afetados

| Componente | Mudança |
| --- | --- |
| `src/lib/env/index.ts` | ganha `siteUrl: getStrEnv("SITE_URL", "http://localhost:3000")` |
| `.env.example` | ganha `SITE_URL="http://localhost:3000"` |
| `src/config/site.ts` | `name`/`description` trocam do placeholder do boilerplate pro nome/descrição reais (README) |
| `src/app/layout.tsx` | `metadata.metadataBase = new URL(env.siteUrl)` |
| `src/server/models/post.ts` | **NOVO** método `readAllPublicSlugs(): Promise<{ slug: string; updatedAt: Date }[]>` — reusa `publicVisibilityFilter()`, sem `include` de relations (lean, só o necessário pro sitemap) |
| `src/server/features/post/schema.ts` | **NOVO** `sitemapEntrySchema { slug, updatedAt }`, `readSitemapEntriesOutputSchema` (array) |
| **NOVO** `src/server/features/post/domain/readSitemapEntries.ts` (`domain_readSitemapEntries`) | `ctx.repositories.post.readAllPublicSlugs()` — sem input, sem regra de permissão (dado público) |
| **NOVO** `src/server/features/post/procedures/readSitemapEntries.ts` | `publicProcedure`, sem input, output `readSitemapEntriesOutputSchema` |
| `src/server/features/post/index.ts` | registra `readSitemapEntries` no `PostRouter` |
| **NOVO** `src/app/sitemap.ts` | `"use cache"` + `cacheLife("hours")` + `cacheTag("posts")` (mesmo padrão de `generateMetadata`/`PostContent` em `post/[slug]/page.tsx`); monta `[{url: env.siteUrl}, ...posts.map(p => ({url: `${env.siteUrl}/post/${p.slug}`, lastModified: p.updatedAt}))]` via `post.readSitemapEntries` |
| **NOVO** `src/app/robots.ts` | sem leitura de DB, sem directive de cache; `rules: {userAgent: "*", allow: "/", disallow: [...]}`, `sitemap: `${env.siteUrl}/sitemap.xml`` |
| **NOVO** `src/app/feed.xml/route.ts` | `GET` route handler; `"use cache"` + `cacheLife("hours")` + `cacheTag("posts")`; chama `post.readRecent({count: 20})`, monta XML RSS 2.0 à mão (sem dependência nova), retorna `Response` com `Content-Type: application/rss+xml; charset=utf-8` |
| `src/app/(half)/post/[slug]/page.tsx` (`generateMetadata`) | ganha `alternates: {canonical}`, `openGraph.images`/`openGraph.url`, `twitter: {card, title, description, images?}` |
| `src/app/(half)/post/[slug]/page.tsx` (`PostView`) | embute `<script type="application/ld+json">` com `Article` schema.org (JSON.stringify com escape de `<` pra evitar quebra de tag) |

## 3. Fora de escopo

Ver `spec.md` § 4 — campos editáveis `seoTitle`/`seoDescription`/`canonicalUrl`, redirect de slug, `ogImageUrl` dedicado, sitemap paginado, localização.

## 4. Decisões arquiteturais

### 4.1 — Sitemap/RSS ganham 1 procedure lean nova em vez de reusar `readRecent` pros dois

`post.readRecent` já existe e devolve posts com todas as relations (`user`, `comments`, `category`, `tags`) — adequado pro RSS (precisa de título/conteúdo/autor), mas over-fetch pro sitemap (só precisa `slug`+`updatedAt`, potencialmente da base inteira de posts, não paginado). Em vez de forçar o sitemap a pagar o custo do include completo (ou de generalizar `readRecent` com paginação sem `take` — mudança de contrato numa procedure já usada em produção), o sitemap ganha uma procedure própria e enxuta (`readSitemapEntries`, sem paginação, sem relations). Não é um componente de 1ª classe novo (mesmo padrão de query já existente em `post.ts`), então não cruza regra 11.

### 4.2 — `readAllPublicSlugs` sem cap de contagem

Google aceita até 50.000 URLs por sitemap; na escala atual do blog (dezenas de posts, não milhares) um único `findMany` sem `take` é suficiente e mais simples que paginar `generateSitemaps` (feature do Next pra sitemaps multi-arquivo, fora de escopo — spec § 4). Se o volume crescer, é um `[NEEDS CLARIFICATION:]` pra rodada futura, não desta.

### 4.3 — `sitemap.ts`/`feed.xml/route.ts` seguem o padrão `"use cache"` já estabelecido, não o "cached by default" nativo do Next

A doc do Next (`node_modules/next/dist/docs/.../sitemap.md`) diz que `sitemap.js`/`robots.js` são cacheados por padrão a menos que usem uma Request-time API. Mas com `cacheComponents: true` (`next.config.ts`), o padrão observado no restante do projeto (`generateMetadata`, `PostContent` em `post/[slug]/page.tsx`) é precisar de `"use cache"` explícito pra qualquer leitura assíncrona (inclusive de DB) fora de `<Suspense>` — e `sitemap.ts`/`route.ts` não têm árvore de Suspense (não são componentes React). Pra evitar depender de um comportamento "cached by default" não confirmado sob Cache Components nesta versão do Next (16.2.10) e manter consistência com o padrão já provado no codebase, `sitemap.ts` e `feed.xml/route.ts` (ambos leem posts do DB) usam a mesma tríade `"use cache"` + `cacheLife("hours")` + `cacheTag("posts")` — mesmo `cacheTag` já invalidado por `revalidateTag("posts", "hours")` em `create`/`publish`/`archive` (`014`), então sitemap/feed ficam frescos nos mesmos eventos que já invalidam o resto do cache de posts. `robots.ts` não lê DB (só monta a partir de `env.siteUrl`), então não precisa de directive nenhuma.

## 5. Contratos

- **NOVO** `post.readSitemapEntries`: sem input → `{ slug, updatedAt }[]`. Público, sem paginação.
- `post.readRecent`: sem mudança de contrato — reusado como está pro RSS (`count: 20`).
- Rotas HTTP novas (não-tRPC): `GET /sitemap.xml`, `GET /robots.txt` (special files do App Router, sem código de rota manual), `GET /feed.xml` (route handler manual).
- `generateMetadata` de `/post/[slug]`: mesmo formato de retorno (`Metadata` do Next), campos adicionais (`alternates`, `twitter`, `openGraph.images`/`url`) — não remove nenhum campo existente.

## 6. Riscos

- **`env.siteUrl` sem valor de produção configurado** — default `http://localhost:3000` é seguro pra dev, mas sitemap/canonical/RSS gerados em produção sem `SITE_URL` setado no ambiente vão apontar pro localhost. Fora do controle deste código (é config de deploy, `docs/roadmap.md` Fase 10, ainda não iniciada) — documentado em `.env.example`, mesmo padrão dos outros `MAIL_*`.
- **JSON-LD com conteúdo de post malicioso** — `content`/`title` vêm de usuário autenticado (não sanitização de output hoje além do que `MdView` já faz pro corpo). O JSON-LD usa só `JSON.stringify` (escapa aspas/barra invertida corretamente) mais um replace de `<` → `<` pra prevenir quebra de `</script>` — mesmo cuidado de qualquer embed de JSON em HTML.
- **`readAllPublicSlugs` sem paginação** — ver § 4.2, aceito na escala atual.

## 7. Validação contra invariantes (regras duras)

- Regra 1 (teste): `readAllPublicSlugs` (só público aparece), `domain_readSitemapEntries`, procedure `readSitemapEntries` (contrato), geração de RSS (posts publicados aparecem, draft não) — teste de unidade da função que monta o XML, não do route handler inteiro (Next não expõe route handlers facilmente a testes de unidade sem servidor rodando; verificação end-to-end fica pro `curl` ao vivo, mesmo padrão de `014`).
- Regra 2 (zero `any`/`unknown`): tipos do `MetadataRoute.Sitemap`/`MetadataRoute.Robots` vêm do próprio Next, sem `any` introduzido.
- Regra 4 (`tsc --noEmit`): checar após cada task.
- Regra 5 (nome específico): `domain/readSitemapEntries.ts`, sem "helpers"/"utils" genérico.
- Regra 6 (≤300 linhas): nenhum arquivo novo se aproxima do limite.
- Regra 7 (domain-like exporta 1 função): `domain_readSitemapEntries` é a única exportada do arquivo novo.
- Regra 11 (mudança arquitetural): nenhum componente de 1ª classe novo — `sitemap.ts`/`robots.ts`/`feed.xml/route.ts` são convenções de arquivo especial do próprio Next (mesmo nível de `page.tsx`/`route.ts` já existentes), não uma camada nova.
- Regra 13 (segredos): sem segredo novo — `SITE_URL` é URL pública, não sensível.
- Regra 15 (Domain ≠ Transport): `domain_readSitemapEntries` não lança `TRPCError` (não tem caminho de erro — leitura pública sem regra de permissão), então nem entra em conflito com a regra.
- Regra 16 (validação no boundary): `readSitemapEntries` não tem input (nada pra validar); saída via `sitemapEntrySchema` no boundary da procedure.

## 8. Dependências

`014-post-review-workflow` (done) — `publicVisibilityFilter()` reusado tal qual. `010-post-cover-image` (done) — `coverImageUrl` reusado como imagem de Open Graph/Twitter/schema.org. Nenhuma dependência externa nova (RSS é hand-rolled, sem pacote `feed`/`rss`).

## 9. Gate desta sessão

Resolvido no gate consolidado (2026-07-14): escopo aprovado via discovery batched (§ 7 do spec) — SEO automático sem campos novos no Post. Sem `[NEEDS CLARIFICATION:]`/balde (b) pendente após a resposta — verificação (1.D) não achou resíduo load-bearing adicional. Autonomia: `AUTONOMY=normal` — segue pro resumo consolidado + confirmação de execução antes de gerar tasks.
