# Feature 019 — Tasks

> **Spec:** [`./spec.md`](./spec.md)
> **Plan:** [`./plan.md`](./plan.md)
> **Convenção:** TDD-ordenadas. `[P]` = paralelizável. Cada task é um ciclo de `core/afm.md` § 2 (RED → GREEN → REFACTOR → COMMIT).
> **Pré-requisito:** `plan.md` sem `[NEEDS CLARIFICATION:]` aberto — confirmado.

## Phase 1 — Setup

- [X] T001 — `src/server/features/post/schema.ts`: `searchPostsSchema` ganha `sortBy: z.enum(["recent", "mostViewed"]).optional()` (RF-11, US-013).

## Phase 2 — Foundation (testes vermelhos primeiro, por cenário Gherkin de `spec.md § 3`)

- [X] T002 — RED: `src/server/models/__test__/prismaModels.ts` — teste `PostModel.search` com `sortBy: "mostViewed"` espera `orderBy: [{ viewCount: "desc" }, { id: "asc" }]`; teste existente de busca atualizado pra esperar `orderBy: [{ createdAt: "desc" }, { id: "asc" }]` (US-013 cenário "Busca ordenada por mais acessado").
- [X] T003 — GREEN: `src/server/models/post.ts` `search()` ganha parâmetro `sortBy?: IPostSearchSortBy`; monta `orderBy` array condicional com tiebreak por `id`; `IPostModel["search"]` e novo type `IPostSearchSortBy` exportado.
- [X] T004/T005 — Regressão do comportamento sem `sortBy` (mantém `createdAt desc`) coberta pelo mesmo teste de T002 (branch `"recent"` é o default) — sem task separada.
- [X] T006 — RED: `src/server/features/post/procedures/__test__/search.ts` — teste "Should paginate consistently when sortBy is mostViewed and results tie" com 3 posts de `viewCount: 0`, navegando 2 páginas, verificando que nenhum post repete/falta (US-013 cenário "Paginação é estável com empate de viewCount"). Testado no nível de procedure (via `createTestContext`, motor real do `prisma-mock`), não no nível de model mockado — é o nível que exercita de fato o `sortFunc`/cursor do `prisma-mock`.
- [X] T007 — GREEN: coberto pela mesma implementação de T003 (tiebreak `id asc` já resolve).
- [X] T008/T009 — RED+GREEN: `src/server/features/post/domain/search.ts` passa `input.sortBy` pro `repositories.post.search`; coberto pelos testes de procedure (T006 e o teste "Should order search results by most viewed...").

## Phase 3 — Boundary

- [X] T010 — RED+GREEN: teste de procedure `post.search` com `sortBy: "mostViewed"` retorna resultados ordenados por `viewCount` (`src/server/features/post/procedures/__test__/search.ts`) (US-013). Verificado também ao vivo contra Postgres real via `next dev` + `curl` (`sortBy: "mostViewed"` retornou `viewCount: 1` antes de `viewCount: 0`; sem `sortBy` manteve ordem por mais recente).
- [X] T011 [P] — `src/app/(half)/search/page.client.tsx`: novo `<select>` de ordenação (state `sortBy`, default `"recent"`, mesmo `selectClassName` de `/post/mine`), passado pro `trpc.post.search.useQuery` e pro `utils.post.search.fetch` do "carregar mais".

`yarn test` (305/305), `npx tsc --noEmit`, `yarn lint` e `yarn build` verdes ao fim da Phase 3.

## Phase 4 — Reconciliação (8.5)

- [X] T012 — `docs/ust.md` US-013: adiciona o cenário Gherkin "Busca ordenada por mais acessado" aos critérios de aceitação. `docs/prd.md` RF-11: atualiza a nota que citava a pendência adiada pra Fase 7. `docs/roadmap.md` Fase 6: marca `[x]` ordenação por mais acessado; Fase 6 vira ✅ Concluída na tabela de progresso geral e na seção detalhada. `spec.md` status → `done` (RF-11).
- [X] T013 — Commit(s) em `feature/019-search-sort-by-views` (criada a partir de `develop`, regra dura 32). Sem push (RF-11).

---

*Toda task referencia US-013 ou RF-11 no commit (regra de `core/afm.md` § 2.7).*
*Toda task é executada como ciclo do `core/afm.md` § 2 — não pula RED (regra 1 — TDD).*
