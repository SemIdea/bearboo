# Feature 016 — Plan

> **Spec:** [`./spec.md`](./spec.md)
> **Status:** done (implementado e verificado 2026-07-14, gate "Executa até o fim")

## 1. Resumo técnico

Um fio único que fecha os critérios de sucesso da § 2 do spec, seguindo o mesmo shape de `readRecent` (cursor-based, `publicVisibilityFilter()`, `postEntityWithRelationsSchema`):

1. **`post.search`** — nova procedure pública. Filtra `Post` por `OR: [{title: {contains, mode: insensitive}}, {content: {contains, mode: insensitive}}]` combinado (AND) com `publicVisibilityFilter()` e, opcionalmente, `categoryId`/`tagId` (mesmo padrão já usado em `readRecent`/`readOwn`). Ordena por `createdAt desc` (sem ranking por relevância — decisão documentada em `spec.md § 4`, já que não há `tsvector`).
2. **UI mínima** — campo de busca no `Header`, navega pra `/search?q=<termo>` no submit; página `/search` lista resultados reusando o mesmo card de post já usado no feed (extraído pra componente compartilhado, evita duplicar o card entre `postFeed.client.tsx` e a nova página). O mesmo campo do header também dispara `post.search` com `limit` pequeno (5) num dropdown de sugestões enquanto digita (debounce manual de 300ms via `useEffect`/`setTimeout`, sem lib nova) — é o "autocomplete opcional" do roadmap, sem endpoint dedicado.

## 2. Componentes afetados

| Componente | Mudança |
| --- | --- |
| `src/server/models/post.ts` | **NOVO** método `search(query: string, count: number, cursor?: string, categoryId?: string, tagId?: string): Promise<IPostEntityWithRelations[]>` — mesmo shape de `readRecents`, filtro extra `OR: [{title: {contains, mode:"insensitive"}}, {content: {contains, mode:"insensitive"}}]` |
| `src/server/features/post/schema.ts` | **NOVO** `searchPostsSchema { query: z.string().min(2), cursor?, limit?, categoryId?, tagId? }`, `searchPostsOutputSchema` (mesmo shape de `readRecentPostsOutputSchema`: `{ posts, nextCursor }`) |
| **NOVO** `src/server/features/post/domain/search.ts` (`domain_searchPosts`) | mesma forma de `domain_readRecentPosts` — chama `ctx.repositories.post.search(...)`, monta `hasNextPage`/`nextCursor` |
| **NOVO** `src/server/features/post/procedures/search.ts` | `publicProcedure`, input `searchPostsSchema`, output `searchPostsOutputSchema` |
| `src/server/features/post/index.ts` | registra `search: procedure_searchPosts` no `PostRouter` |
| **NOVO** `src/components/postCard.tsx` | extrai o card de post (`Post`) de dentro de `postFeed.client.tsx` pra componente compartilhado — reusado por `postFeed.client.tsx` e pela nova página de busca, evita duplicar o markup do card |
| `src/components/postFeed.client.tsx` | usa `PostCard` importado em vez do componente `Post` local |
| **NOVO** `src/app/(half)/search/page.tsx` | server component, lê `searchParams.q`, chama `caller.post.search({ query })`, renderiza `SearchResultsList` |
| **NOVO** `src/app/(half)/search/page.client.tsx` | client component `SearchResultsList` — mesmo padrão de `PostFeedList` (estado + "Carregar mais"), mas chamando `post.search` em vez de `post.readRecent` |
| **NOVO** `src/components/searchBox.tsx` | client component — `Input` controlado, submit navega pra `/search?q=`, `onChange` com debounce dispara `post.search({query, limit: 5})` via `utils.post.search.fetch` e mostra dropdown de sugestões (link direto pro post) |
| `src/components/header/index.tsx` ou `index.client.tsx` | monta `<SearchBox />` no header |

## 3. Fora de escopo

Ver `spec.md` § 4 — full-text search nativo do Postgres (`tsvector`/`ts_rank`), ordenação por mais acessado (Fase 7), filtro de tag/categoria na UI de busca, endpoint de autocomplete dedicado.

## 4. Decisões arquiteturais

### 4.1 — `contains`/`insensitive` do Prisma em vez de `$queryRaw`/`tsvector`

Já registrado em `spec.md § 4/§ 7`: `prisma-mock` (ADR-0011) é um fake em JS do `PrismaClient` sem parser SQL — confirmado por leitura de `node_modules/prisma-mock/lib/utils/queryMatching.js`, que implementa `contains`/`mode: "insensitive"` mas não teria como interpretar `$queryRaw`. Usar `$queryRaw` deixaria `domain_searchPosts` sem cobertura de teste rodável (regra dura 1). `contains`/`insensitive` é padrão Prisma normal, roda igual em produção (Postgres real via `ILIKE`) e em teste (via `prisma-mock`), sem migration e sem preview feature nova do Prisma (que seria mudança de configuração mais sensível, território de regra 11 se alterasse `previewFeatures`).

### 4.2 — Sem ranking por relevância, ordena por `createdAt desc`

Sem `tsvector`/`ts_rank` não há score de relevância nativo do Postgres pra ordenar por "melhor match" — `ORDER BY createdAt DESC` é a mesma âncora já usada em `readRecent`/`readRelated`/`readOwn`, mantém o resultado paginável de forma estável (cursor por `id`, igual aos outros). Se a busca precisar de ranking de verdade, isso é parte do trabalho adiado de full-text search (§ 4.1).

### 4.3 — `PostCard` extraído em componente compartilhado

`postFeed.client.tsx` já tem o card de post (`Post`, linhas 58-91) inline. A página de busca precisa do mesmo card. Em vez de duplicar o JSX (ou criar uma abstração maior tipo "lista genérica com render prop", que seria over-engineering pra 2 usos), extrai só o componente de apresentação (`PostCard`) pra `src/components/postCard.tsx` — mesmo nível de granularidade dos componentes `ui/` já existentes, sem introduzir camada nova.

### 4.4 — Autocomplete reusa `post.search`, sem endpoint dedicado

Um endpoint `searchSuggestions` separado exigiria decidir um schema de saída diferente e duplicaria a query do `search` só pra truncar a lista — reusar `post.search({query, limit: 5})` no `onChange` do `SearchBox` cobre o mesmo resultado (título + link) sem superfície nova, e mantém a regra "menos infra, mais chance de terminar" do roadmap.

## 5. Contratos

- **NOVO** `post.search`: `{ query: string (min 2), cursor?, limit? (1-50), categoryId?, tagId? }` → `{ posts: PostEntityWithRelations[], nextCursor: string | null }`. Público, sem regra de permissão (mesma visibilidade de `readRecent`).

## 6. Riscos

- **`contains` sem índice dedicado** — Postgres faz sequential scan em `ILIKE '%termo%'` sem um índice trigram (`pg_trgm`) ou GIN. Aceitável na escala atual do blog (dezenas de posts, mesma escala já aceita em `015-seo-metadata/plan.md § 4.2` pro sitemap sem paginação); se o volume crescer, é candidato a `[NEEDS CLARIFICATION:]` futuro junto com o full-text search nativo (§ 4.1).
- **Termo de busca não sanitizado além do Zod `min(2)`** — `contains` do Prisma é parametrizado (não é SQL string concatenada), sem risco de injection; sem sanitização adicional necessária.

## 7. Validação contra invariantes (regras duras)

- Regra 1 (teste): `domain_searchPosts`, procedure `search` (contrato + filtro de visibilidade + paginação), model `search` (mesmo nível de cobertura de `readRecents` em `prismaModels.ts`).
- Regra 2 (zero `any`/`unknown`): tipos derivados do Prisma/Zod, sem `any` novo.
- Regra 4 (`tsc --noEmit`): checar após cada task.
- Regra 5 (nome específico): `domain/search.ts`, `procedures/search.ts`, sem "helpers"/"utils" genérico.
- Regra 6 (≤300 linhas): nenhum arquivo novo se aproxima do limite.
- Regra 7 (domain-like exporta 1 função): `domain_searchPosts` é a única exportada do arquivo novo.
- Regra 11 (mudança arquitetural): nenhum componente de 1ª classe novo — `search` é mais uma procedure no mesmo `PostRouter` existente, `PostCard`/`SearchBox` são componentes de apresentação no mesmo nível dos já existentes em `src/components/`.
- Regra 13 (segredos): não aplicável, sem segredo novo.
- Regra 15 (Domain ≠ Transport): `domain_searchPosts` não lança `TRPCError` (leitura pública sem regra de permissão, mesmo formato de `domain_readRecentPosts`).
- Regra 16 (validação no boundary): `query`/`cursor`/`limit`/`categoryId`/`tagId` validados em `searchPostsSchema` no `.input()` da procedure; domain recebe shape já validado.

## 8. Dependências

`004-post-status` (done) — `publicVisibilityFilter()` reusado tal qual. `ADR-0011` — motivo da escolha de `contains`/`insensitive` em vez de raw SQL (§ 4.1).

## 9. Gate desta sessão

Resolvido no gate consolidado (2026-07-14): balde (b) vazio (sem pergunta earned — a decisão de tech de busca foi resolvida por evidência de scan, não por escolha de produto/intenção), sem CRITICAL. `AUTONOMY=normal` — apresentado resumo consolidado + `AskUserQuestion` de destino; user escolheu "Executa até o fim".
