# Feature 003 — Plan

> **Spec:** [`./spec.md`](./spec.md)
> **Status do plan:** approved e implementado (2026-07-12)
> **Stack inferido:** Next.js 15 App Router + tRPC v11 + Prisma 6 + Zod (`docs/ach.md` § 1) — sem stack nova.
> **Data:** 2026-07-12

## 1. Approach em 3 frases

`post.readRecent` passa a aceitar `{ cursor?, limit? }` e retornar `{ posts, nextCursor }`, usando paginação por keyset do Prisma (`cursor: { id }, skip: 1`, ordenado por `createdAt desc`) — não precisa de coluna nova nem migration. `PostFeed` (Server Component) continua buscando a primeira página via `createCaller()`; um novo componente cliente (`postFeed.client.tsx`, mesmo padrão de `CommentArea`) recebe essa primeira página como estado inicial e busca páginas seguintes sob demanda via `trpc.post.readRecent` quando o usuário clica "Carregar mais".

## 2. Componentes afetados

| Componente-tipo | Arquivo / módulo | Novo ou edita | Por quê |
| --- | --- | --- | --- |
| Model | `src/server/models/post.ts` | edita | `readRecents(limit, cursor?)` usa `cursor`/`skip` do Prisma em vez de só `take` |
| Schema (Zod) | `src/server/features/post/schema.ts` | edita | novo `readRecentPostsSchema` (`cursor?`, `limit?`, schema opcional pra manter chamada sem args) e `readRecentPostsOutputSchema` vira `{ posts, nextCursor }` |
| Domain-like | `src/server/features/post/domain/readRecent.ts` | edita | pede `limit + 1` pro model, decide `nextCursor` a partir do item extra |
| Procedure | `src/server/features/post/procedures/readRecent.ts` | edita | passa `input` pro domain, normaliza `undefined` → `{}` no boundary |
| Test | `src/server/models/__test__/prismaModels.ts` | edita | assert do novo shape de chamada (`cursor`/`skip` quando presente) |
| Test | `src/server/features/post/procedures/__test__/readRecent.ts` | edita | cenários da spec § 3 (primeira página, próxima página, última página) |
| Componente (Server) | `src/components/postFeed.tsx` | edita | busca primeira página, delega renderização + "carregar mais" pro client component |
| Componente (Client, novo) | `src/components/postFeed.client.tsx` | novo | estado local da lista + botão "Carregar mais" via `trpc.post.readRecent` (mesmo padrão de `page.client.tsx`/`CommentArea`) |

## 3. Modelo de dados (delta)

Nenhum. Cursor usa o `id` (já `@unique`/PK) do `Post` — sem coluna nova, sem migration.

## 4. Decisões arquiteturais

- **Decisão:** cursor-based (via `id`), não offset. **Alternativa rejeitada:** `page`/`pageSize` com `skip: page * pageSize`. **Por quê:** decidido com o dono do produto (2026-07-11) — offset duplica/pula post se a lista mudar entre requisições e tende a puxar uma UI de números de página, que é mais mudança de front do que o momento atual (foco em back-end, ver `docs/roadmap.md` § Nota de sequenciamento) permite.
- **Decisão:** tamanho de página default 10 (`DEFAULT_PAGE_SIZE`), máximo 50 aceito via `limit` opcional no input. **Alternativa rejeitada:** manter 30 fixo. **Por quê:** 30 era um teto de segurança pra uma listagem sem paginação, não um tamanho pensado pra UX de "carregar mais"; 10 é convencional pra esse padrão e o client pode pedir mais via `limit` sem mudar o contrato.
- **Decisão:** determinar `nextCursor` pedindo `limit + 1` registros ao model e cortando o extra (`hasNextPage = fetched.length > limit`), em vez de um `count()` separado. **Alternativa rejeitada:** query de contagem total. **Por quê:** uma query só, sem depender de contagem total (que muda constantemente com posts novos e não é necessária pra saber "existe próxima página").
- **Decisão:** endpoint `input` schema é `.optional()` no nível do objeto (schema aceita ser chamado sem nenhum argumento), normalização de `undefined → {}` acontece na procedure, não no domain. **Alternativa rejeitada:** exigir `{}` explícito em toda chamada. **Por quê:** mantém `caller.post.readRecent()` funcionando sem argumento (uso atual em `postFeed.tsx` e no teste existente) e mantém a normalização no boundary (regra dura 16 — domain recebe shape já resolvido, nunca `undefined`).
- **Decisão:** `PostFeed` continua Server Component pra primeira página (SSR, sem loading flash inicial); só o "carregar mais" vira client component. **Alternativa rejeitada:** converter a listagem inteira pra client component com `useQuery` desde o início. **Por quê:** troca SSR por um estado de loading inicial sem necessidade — o padrão já visto em `post/[slug]/page.tsx` + `page.client.tsx` (server busca o que pode ser SSR'd, client só cuida do que é genuinamente interativo) é reaproveitado, não um padrão novo.

## 5. Contratos (boundaries externos)

### Boundary `post.readRecent` (tRPC query, público — input e output mudam)

```ts
// input (tudo opcional; chamável sem argumento nenhum)
{ cursor?: string; limit?: number } | undefined

// output (sucesso)
{ posts: PostEntityWithRelations[]; nextCursor: string | null }
```

Breaking change de shape (antes retornava array direto). Único consumidor hoje é `postFeed.tsx`, atualizado na mesma feature — sem consumidor externo pra migrar.

## 6. Complexity tracking

| Complexidade aceita | Alternativa simples rejeitada | Por quê não foi simples |
| --- | --- | --- |
| Buscar `limit + 1` e cortar o extra pra saber se há próxima página | `count()` separado | Uma query a mais por request, sempre, só pra um booleano que o próprio `limit + 1` já responde |
| Novo `postFeed.client.tsx` (client boundary) | Manter tudo em `postFeed.tsx` com `"use client"` no topo | Perderia SSR da primeira página sem necessidade — mesma razão do padrão já usado em `post/[slug]` |

## 7. Validação contra invariantes

- [x] Regra 16 (validação no boundary) — `cursor`/`limit` validados só no `.input()` da procedure; domain/model recebem `{ limit: number, cursor?: string }` já resolvido.
- [x] Regra 30 (domain não importa Prisma) — `domain_readRecentPosts` continua usando `ctx.repositories.post`, sem tocar `@prisma/client`.
- [x] Regra 15 forward-only — `readRecent.ts` (domain) não lança `TRPCError` hoje e continua sem lançar; não piora a métrica de `afm.md` § 3.1.
- [x] Não é regra 11 (mudança arquitetural) — `postFeed.client.tsx` segue exatamente o padrão já existente de `page.client.tsx` (Server Component + Client Component com `trpc` hook), não introduz camada nova.
- [x] `[NEEDS CLARIFICATION:]` zerado — spec § 7 vazia.

## 8. Riscos

- **Quebrar a chamada sem argumento (`caller.post.readRecent()`).** Mitigação: input schema `.optional()` no nível do objeto, testado explicitamente (§ 5 acima).
- **Cursor inválido/de post já deletado.** Mitigação: Prisma lança erro se o `cursor.id` não existir mais — aceito como comportamento padrão do Prisma (mesmo tratamento que qualquer outro erro não mapeado da procedure); não é cenário da spec (post deletado entre páginas é raro e não foi pedido tratamento especial).

## 9. Open questions

*(vazio.)*

---

*Plan NÃO contém: lista granular de tasks (vai pro `tasks.md`).*
