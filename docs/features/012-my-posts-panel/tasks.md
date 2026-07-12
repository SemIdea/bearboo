# Feature 012 — Tasks

> **Plan:** [`./plan.md`](./plan.md)

## Setup

- [X] T001 — Ler `src/server/features/post/{schema,index}.ts`, `src/server/models/post.ts`, `src/app/(half)/post/create/{page,page.client}.tsx`, `src/components/header/index.client.tsx` a fresco.

## Backend

- [X] T002 — `schema.ts`: `readOwnPostsSchema` (`status`/`categoryId`/`tagId` opcionais), `readOwnPostsOutputSchema`, `ReadOwnPostsInput`.
- [X] T003 — `src/server/models/post.ts`: `readOwnPosts(userId, status?, categoryId?, tagId?)`. Adicionado ao tipo `IPostModel`.
- [X] T004 — `src/server/features/post/domain/readOwn.ts`: `domain_readOwnPosts`.
- [X] T005 — `src/server/features/post/procedures/readOwn.ts`: `procedure_readOwnPosts` (`protectedProcedure`, `userId: ctx.user.id`).
- [X] T006 — `src/server/features/post/index.ts`: `readOwn` registrado no `PostRouter`.
- [X] T007 [P] — Teste `procedures/__test__/readOwn.ts`: retorna todos os status do dono; filtra por status/categoria/tag; isola entre usuários; rejeita chamada sem sessão (6 testes).

## Frontend

- [X] T008 — `post/mine/page.tsx` + `page.client.tsx`: lista + filtros (status/categoria/tag) via `<select>` nativo, auth client-side (`useAuth` + redirect, mesmo padrão de `post/create`).
- [X] T009 — `src/components/header/index.client.tsx`: link "My posts" no `AuthenticatedHeader`.

## Verificação

- [X] T010 — `npx tsc --noEmit` limpo + `npx vitest run` 163/163 verdes.
- [X] T011 — `next build --debug-prerender`: sem erro novo (só o baseline conhecido de `/`). `npx biome check --write` limpo nos arquivos tocados. **Não verificado em browser real** — sem ferramenta de automação de browser disponível neste ambiente; validação visual fica pendente pro dono.

## Reconciliação (8.5)

- [X] T012 — `docs/roadmap.md` Fase 2: "listagem de posts no admin", "filtros por status", "filtros por categoria/tag" → `[x]` (com nota do escopo "meus posts"). `spec.md` status → `done`.
- [ ] T013 — Commit(s): 1 commit `feat:`, 1 commit `docs:`. Sem push.
