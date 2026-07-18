# Feature 019 — Plan

> **Spec:** [`./spec.md`](./spec.md)
> **Status do plan:** approved
> **Stack inferido:** Next.js 15 (App Router) / tRPC v11 / Prisma 6 / Zod — lido de `docs/ach.md`, sem reabrir discussão.
> **Data:** 2026-07-18

## 1. Approach em 3 frases

Adiciona um parâmetro opcional `sortBy: "recent" | "mostViewed"` em `searchPostsSchema` (default `"recent"`, comportamento atual inalterado). `repositories.post.search` passa a montar `orderBy` condicionalmente — `[{ createdAt: "desc" }, { id: "asc" }]` ou `[{ viewCount: "desc" }, { id: "asc" }]` — com `id` como tiebreak determinístico em ambos os casos (necessário pra paginação cursor-based não duplicar/pular linhas em empate). Sem migration, sem model novo: `Post.viewCount` já existe (`017-post-view-analytics`). Frontend: `/search` ganha um `<select>` (mesmo padrão de `/post/mine`) que passa `sortBy` pro `trpc.post.search.useQuery`.

## 2. Componentes afetados

| Componente-tipo | Arquivo / módulo | Novo ou edita | Por quê |
| --- | --- | --- | --- |
| Model | `src/server/models/post.ts` | edita | `search()` ganha parâmetro `sortBy?: "recent" \| "mostViewed"`; `orderBy` vira array condicional com tiebreak por `id`; `IPostModel["search"]` reflete a assinatura nova |
| Boundary (Zod) | `src/server/features/post/schema.ts` | edita | `searchPostsSchema` ganha `sortBy: z.enum(["recent", "mostViewed"]).optional()` |
| Domain-like | `src/server/features/post/domain/search.ts` | edita | repassa `input.sortBy` pro repository (sem lógica nova — decisão de ordenação vive só no boundary de dados) |
| Procedure | `src/server/features/post/procedures/search.ts` | — | sem mudança — já faz spread do `input` validado |
| Frontend | `src/app/(half)/search/page.client.tsx` | edita | novo `<select>` de ordenação (state `sortBy`), passado pro `trpc.post.search.useQuery` e pro `utils.post.search.fetch` do "carregar mais" |

## 3. Modelo de dados (delta)

*(nenhum — `Post.viewCount` já existe desde `017-post-view-analytics`; feature é só ordenação de leitura, sem migration)*

## 4. Decisões arquiteturais

- **Decisão:** `orderBy` de `search()` ganha `id` como tiebreak secundário em **ambos** os modos (`recent` e `mostViewed`), não só no novo. **Alternativa rejeitada:** deixar `createdAt desc` sem tiebreak (como está hoje) e só adicionar tiebreak no caminho novo. **Por quê:** `prisma-mock` (`node_modules/prisma-mock/lib/delegate.js`) implementa cursor-based pagination fazendo `findIndex` do cursor no array já ordenado — sob empate de campo de sort, a posição de um registro entre duas chamadas só é estável se o `orderBy` for uma tupla totalmente determinística. Ordenar só o modo novo deixaria uma inconsistência arbitrária entre os dois caminhos do mesmo método; adicionar `id asc` como tiebreak nos dois é uma correção simétrica de 1 linha, sem mudar o resultado observável do modo `recent` em nenhum teste hoje passando (só desempata casos hoje ambíguos).
- **Decisão:** ordenação por mais acessado fica restrita a `post.search`, não estendida a `readRecents`/`readOwn`. **Alternativa rejeitada:** adicionar `sortBy` também nesses métodos. **Por quê:** o item do roadmap (Fase 6) é especificamente sobre busca; generalizar sem requisito registrado seria escopo não pedido (spec § 4).
- **Decisão:** `sortBy` é `z.enum(["recent", "mostViewed"])` com default implícito `"recent"` no domain (não no schema), igual ao padrão já usado por `limit`/`cursor` opcionais nesse mesmo schema. **Alternativa rejeitada:** tornar `sortBy` obrigatório no client. **Por quê:** mantém `post.search({ query })` (sem `sortBy`) funcionando sem quebra — nenhum call site existente (incluindo `SearchBox` de autocomplete) precisa mudar.

## 5. Contratos (boundaries externos)

### Boundary `post.search` (edita — delta)

```ts
// input (delta)
{ sortBy?: "recent" | "mostViewed" }   // default: "recent" (comportamento atual)

// output — sem mudança de shape, só a ordem dos itens muda conforme sortBy

// errors (codes) — sem mudança
```

## 6. Complexity tracking

*(vazio — nenhuma complexidade extra aceita além do que a spec já pede)*

## 7. Validação contra invariantes

- [x] Regra dura 1 (nenhum código novo sem teste) — `search()` (model), `domain_searchPosts` e a procedure ganham casos de teste novos pra `sortBy: "mostViewed"` e pro tiebreak de empate.
- [x] Regra dura 7 (domain-like = 1 export) — `domain/search.ts` continua com só `domain_searchPosts`, sem export novo.
- [x] Regra dura 11 (mudança arquitetural pára e pergunta) — nenhuma camada/componente novo; é um parâmetro a mais num método/endpoint já existente.
- [x] Regra dura 15 (Domain ≠ Transport) — `domain_searchPosts` não lança erro novo, só repassa parâmetro.
- [x] Regra dura 16 (validação no boundary) — `sortBy` validado só em `schema.ts`; model recebe union já validada.
- [x] `[NEEDS CLARIFICATION:]` zerado — spec § 5 sem markers abertos.

## 8. Riscos

- **`viewCount` sem breakdown por período:** "mais acessado" aqui é sempre lifetime, não "mais acessado esta semana" — mesma limitação já aceita em `017-post-view-analytics` (spec § 4 desta feature já documenta isso como out of scope, não é risco novo introduzido).

## 9. Open questions

*(vazio — discovery convergiu, ver spec § 7)*

---

*Plan NÃO contém: lista granular de tasks (vai pro `tasks.md`). Plan NÃO escolhe stack — lê de `ach.md`. Se camada relevante de `ach.md` está como `[A DEFINIR]`, marca aqui e bloqueia tasks até resolver.*
