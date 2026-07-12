# Feature 007 — Tasks

> **Plan:** [`./plan.md`](./plan.md)

## Setup

- [X] T001 — Ler `src/server/features/post/{schema,index}.ts`, `src/server/models/post.ts`, `src/app/(half)/post/[slug]/{page.tsx,page.client.tsx}` a fresco.

## Backend

- [X] T002 — `schema.ts`: `readRelatedPostsSchema`, `readRelatedPostsOutputSchema`, `ReadRelatedPostsInput`.
- [X] T003 — `src/server/models/post.ts`: `readRelated(postId, categoryId, tagIds, limit)`. Adicionado ao tipo `IPostModel`.
- [X] T004 — `src/server/features/post/domain/readRelated.ts`: `domain_readRelatedPosts` (limit default 5).
- [X] T005 — `src/server/features/post/procedures/readRelated.ts`: `procedure_readRelatedPosts`.
- [X] T006 — `src/server/features/post/index.ts`: `readRelated` registrado no `PostRouter`.
- [X] T007 [P] — Teste `procedures/__test__/readRelated.ts`: 5 casos (categoria em comum, tag em comum, exclui o próprio post, exclui DRAFT, retorna `[]` sem categoria/tags).

## Frontend

- [X] T008 — `page.client.tsx`: componente `RelatedPosts({ postId, categoryId, tagIds })`, retorna `null` se lista vazia.
- [X] T009 — `page.tsx`: `<RelatedPosts postId={post.id} categoryId={post.category?.id ?? null} tagIds={post.tags.map((tag) => tag.id)} />` abaixo de `<CommentArea>`.

## Verificação

- [X] T010 — `npx tsc --noEmit` limpo + `npx vitest run` 155/155 verdes.
- [X] T011 — `next build`: sem erro novo (só o erro pré-existente de `/`). `npx biome check src/` limpo (2 arquivos auto-formatados por `biome check --write` durante a implementação).

## Reconciliação (8.5)

- [X] T012 — `docs/roadmap.md` Fase 1: "posts relacionados" → `[x]` (Fase 6 continua `[ ]` — ranking/busca fica de fora, ver spec § 4). `spec.md` status → `done`.
- [ ] T013 — Commit(s): 1 commit `feat:`, 1 commit `docs:`. Sem push.
