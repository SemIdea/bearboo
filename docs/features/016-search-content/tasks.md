# Feature 016 — Tasks

> **Plan:** [`./plan.md`](./plan.md)
> Toda task refere US-013/RF-11.

## Setup

- [X] T001 — Reler `src/server/features/post/**`, `src/server/models/post.ts`, `src/components/postFeed.client.tsx`, `src/components/header/**` a fresco (feito no discovery — sem lacuna nova).

## Backend — model, schema, domain, procedure

- [X] T002 — `src/server/models/post.ts`: **NOVO** método `search(query, count, cursor?, categoryId?, tagId?): Promise<IPostEntityWithRelations[]>` — mesmo shape de `readRecents`, filtro extra `OR: [{title: {contains: query, mode: "insensitive"}}, {content: {contains: query, mode: "insensitive"}}]` combinado com `publicVisibilityFilter()`; teste em `prismaModels.ts` (encontra por título, encontra por conteúdo, não vaza DRAFT/ARCHIVED, filtra por categoryId/tagId) (US-013/RF-11).
- [X] T003 — `src/server/features/post/schema.ts`: **NOVO** `searchPostsSchema { query: z.string().min(2), cursor?, limit? (1-50), categoryId?, tagId? }`, `searchPostsOutputSchema` (mesmo shape de `readRecentPostsOutputSchema`) (depende de T002) (US-013/RF-11).
- [X] T004 — **NOVO** `src/server/features/post/domain/search.ts` (`domain_searchPosts`): mesma forma de `domain_readRecentPosts` (limit+1, `hasNextPage`, `nextCursor`); teste (depende de T003) (US-013/RF-11).
- [X] T005 — **NOVO** `src/server/features/post/procedures/search.ts` (`publicProcedure`, input `searchPostsSchema`, output `searchPostsOutputSchema`) + registra `search` no `PostRouter` (`src/server/features/post/index.ts`) + teste de procedure (paginação, filtro de visibilidade, categoryId/tagId, rejeita query < 2 chars) (depende de T004) (US-013/RF-11).

## Frontend — componente compartilhado + página de busca + campo no header

- [X] T006 [P] — **NOVO** `src/components/postCard.tsx`: extrai o componente `Post` de dentro de `postFeed.client.tsx` (linhas 58-91) sem mudar o markup; `postFeed.client.tsx` passa a importar `PostCard` (US-013/RF-11).
- [X] T007 — **NOVO** `src/app/(half)/search/page.tsx` (server) + `src/app/(half)/search/page.client.tsx` (`SearchResults`, mesmo padrão de `PostFeedList` mas chamando `post.search`); lê `searchParams.q` via `useSearchParams`, mostra "No posts found" se vazio (depende de T005, T006) (US-013/RF-11).
- [X] T008 — **NOVO** `src/components/searchBox.tsx`: `Input` controlado no header; submit navega pra `/search?q=<termo>`; `onChange` com debounce (~300ms, `useEffect`/`setTimeout`, sem lib nova) dispara `utils.post.search.fetch({query, limit: 5})` e mostra dropdown de sugestões (título → link pro post) (depende de T005) (US-013/RF-11).
- [X] T009 — `src/components/header/index.tsx`: monta `<SearchBox />` no header (depende de T008) (US-013/RF-11).

## Verificação

- [X] T010 — `npx tsc --noEmit` limpo + `yarn test` verde (268/268, suíte completa) + `yarn build` verde (`/search` prerenderou) + verificação ao vivo (`next dev` + `curl` no `/api/trpc/post.search` contra Postgres real): busca por título encontra post ("trpc" → "Por que escolhemos tRPC neste projeto"), busca por termo só no conteúdo encontra post ("markdown" → também retorna "Bem-vindo ao Bearboo", que menciona markdown só no corpo).

## Reconciliação (8.5)

- [X] T011 — `docs/roadmap.md` Fase 6: marcado `[x]` busca por título, busca por conteúdo, filtro por tag, filtro por categoria (já existiam via `readRecent`), posts relacionados (já existia via `007`), autocomplete opcional; deixado `[ ]` só ordenação por mais acessado com nota "adiado pra Fase 7"; atualizada a linha da Fase 6 na tabela de progresso geral. `docs/ust.md` ganhou US-013, `docs/prd.md` ganhou RF-11. `spec.md`/`plan.md` status → `done`.
- [X] T012 — Commit(s): backend (model/schema/domain/procedure), frontend (`PostCard`, página de busca, `SearchBox`, header), docs. Sem push.
