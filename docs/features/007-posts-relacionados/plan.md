# Feature 007 — Plan

> **Spec:** [`./spec.md`](./spec.md)
> **Status:** approved (gate 2026-07-12, "Quero UI básica também")

## 1. Resumo técnico

Nova procedure `post.readRelated`, seguindo exatamente a fatia de feature já estabelecida por `post` (`schema.ts` → `domain/` → `procedures/` → `model`). O cliente (página do post) já busca o post via `readBySlug`, que retorna `categoryId`/`tags` — a nova procedure recebe esses dados como input (evita um segundo lookup server-side só pra redescobrir a taxonomia do post de origem) e devolve posts publicados que compartilham categoria ou pelo menos uma tag, excluindo o próprio post.

## 2. Componentes afetados

| Componente | Mudança |
| --- | --- |
| `src/server/features/post/schema.ts` | `readRelatedPostsSchema`/`readRelatedPostsOutputSchema`/`ReadRelatedPostsInput` novos |
| `src/server/features/post/domain/readRelated.ts` | novo — `domain_readRelatedPosts` |
| `src/server/features/post/procedures/readRelated.ts` | novo — `procedure_readRelatedPosts` |
| `src/server/features/post/index.ts` | `readRelated: procedure_readRelatedPosts` no router |
| `src/server/models/post.ts` | `readRelated(postId, categoryId, tagIds, limit)` novo, mesmo padrão de `readRecents` (include user/comments/category/tags, `flattenTags`) |
| `src/app/(half)/post/[slug]/page.client.tsx` | novo componente `RelatedPosts` (client, `trpc.post.readRelated.useQuery`), no mesmo arquivo de `CommentArea` |
| `src/app/(half)/post/[slug]/page.tsx` | renderiza `<RelatedPosts postId=... categoryId=... tagIds=... />` abaixo do conteúdo |

## 3. Fora de escopo

Ver `spec.md` § 4.

## 4. Decisões arquiteturais

- **Input recebe `categoryId`/`tagIds` do cliente (que já tem, via `readBySlug`) vs. procedure recalcula a partir de `postId`:** cliente envia. Evita um segundo round-trip/lookup server-side pra descobrir taxonomia que o cliente já tem em mãos; não é um boundary de confiança sensível (o resultado é só uma lista de posts públicos — o pior caso de um cliente mentir sobre `categoryId`/`tagIds` é receber uma lista "errada" pra ele mesmo, sem side effect e sem vazar nada que `readRecent`/`readBySlug` já não exponham). Mesmo espírito de `comment.readAllByPost`, que já recebe `postId` puro do client sem revalidar contra o post carregado.
- **União (categoria OU tag) vs. interseção/ranking ponderado:** união, sem peso. Ranking por "quantidade de tags em comum" exigiria `groupBy`/agregação ou pós-processamento em memória — desproporcional ao critério de sucesso (spec § 4 já marca ranking como fora de escopo).
- **Sem novo componente de exibição dedicado tipo `<PostCard>`:** lista simples de `<Link>`s no mesmo arquivo `page.client.tsx`, reaproveitando `IPostEntityWithRelations` (mesmo shape de `readRecent`) — não introduz um novo padrão de card; virar `<PostCard>` compartilhado com `postFeed.client.tsx` é refactor de front fora do escopo desta sessão (nota de sequenciamento do roadmap: front aguarda refatoração própria).
- **Query única com `OR` (categoria + tags) vs. duas queries separadas:** uma query com `OR`, mesma estrutura de filtro já usada em `readRecents` (`categoryId ? {...} : {}` composability). Menos round-trips, resultado já vem deduplicado pelo próprio SQL (`id: { not: postId }` + `OR`).

## 5. Contratos

`post.readRelated`: `{ postId: string; categoryId?: string | null; tagIds?: string[]; limit?: number }` → `IPostEntityWithRelations[]` (mesmo shape de `readRecent().posts`, sem paginação — lista curta, `limit` default 5, máx 20).

## 6. Riscos

- Sem teste de UI automatizado pro componente `RelatedPosts` (sem jsdom configurado no repo, mesma limitação já documentada em `008-trpc-error-link`) — cobertura fica no backend (model/domain/procedure), consistente com o padrão já usado pra `CommentArea`/`sessionRefreshLink`.

## 7. Validação contra invariantes (regras duras)

- Regra 1 (teste): `procedures/__test__/readRelated.ts` novo, cobrindo os 3 cenários da spec (categoria+tag, sem taxonomia, exclui não-publicado) + exclusão do próprio post.
- Regra 4 (`tsc --noEmit` limpo): checar após a mudança.
- Regra 7 (domain exporta 1 função `domain_<action>`): `domain_readRelatedPosts`, único export.
- Regra 16 (validação no boundary): `readRelatedPostsSchema` em `schema.ts`.
- Regra 11: nova procedure segue a fatia de feature já existente (`post/`) — não é camada/componente novo, não aciona o gatilho.

## 8. Dependências

`docs/features/005-tags-categorias/` (`done`).
