# Feature 005 — Tasks

> **Spec:** [`./spec.md`](./spec.md)
> **Plan:** [`./plan.md`](./plan.md)
> **Convenção:** TDD-ordenadas. `[P]` = paralelizável (sem dependência da task imediatamente anterior). Cada task é um ciclo de `afm.md` § 2 (RED → GREEN → REFACTOR → COMMIT).
> **Pré-requisito:** `plan.md` sem `[NEEDS CLARIFICATION:]` aberto — confirmado vazio.

## Phase 1 — Schema e Models

- [X] T001 — `prisma/schema.prisma`: `model Category`, `model Tag`, `model PostTag` novos; `Post` ganha `categoryId String?` + relations. Roda `npx prisma migrate dev --name add_tags_categories`.
- [X] T002 [P] — `src/server/models/category.ts`: `CategoryModel` (`BaseModel<ICategoryEntity>` + `readByName`, `readAll`).
- [X] T003 [P] — `src/server/models/tag.ts`: `TagModel` (`BaseModel<ITagEntity>` + `readByName`, `readAll`).
- [X] T004 — `src/server/models/post.ts`: `IPostEntity.categoryId`; `IPostEntityWithRelations` ganha `category`/`tags`; novo `IPostEntityWithTaxonomy`; `readRecents` ganha filtro `categoryId`/`tagId` + include; `readBySlug` ganha include; novo método `setTags(postId, tagIds)`.
- [X] T005 — `src/server/infra/container/repositories.ts`: registra `category`/`tag` no `IRepositories`.

## Phase 2 — Features `category` e `tag`

- [X] T006 [P] — `src/server/features/category/schema.ts`: `createCategorySchema`, `categoryEntitySchema`, outputs.
- [X] T007 — `src/server/features/category/domain/create.ts`: find-or-create por `name` (busca via `readByName`; se ausente, gera slug via `ctx.helpers.slug.generate` e cria).
- [X] T008 — `src/server/features/category/domain/readAll.ts`: lista todas.
- [X] T009 — `src/server/features/category/procedures/create.ts` (`verifiedProcedure`).
- [X] T010 — `src/server/features/category/procedures/readAll.ts` (`publicProcedure`).
- [X] T011 — `src/server/features/category/index.ts`: `CategoryRouter`.
- [X] T012 — Teste `category/procedures/__test__/create.ts` — criar com nome novo cria; criar com nome repetido retorna a existente (idempotência).
- [X] T013 — Teste `category/procedures/__test__/readAll.ts` — lista todas as categorias criadas.
- [X] T014 [P] — `src/server/features/tag/schema.ts`: espelha `category/schema.ts`.
- [X] T015 — `src/server/features/tag/domain/create.ts`: find-or-create por `name`.
- [X] T016 — `src/server/features/tag/domain/readAll.ts`: lista todas.
- [X] T017 — `src/server/features/tag/procedures/create.ts` (`verifiedProcedure`).
- [X] T018 — `src/server/features/tag/procedures/readAll.ts` (`publicProcedure`).
- [X] T019 — `src/server/features/tag/index.ts`: `TagRouter`.
- [X] T020 — Teste `tag/procedures/__test__/create.ts` — idempotência por nome.
- [X] T021 — Teste `tag/procedures/__test__/readAll.ts` — lista todas as tags criadas.
- [X] T022 — `src/server/routers/app.routes.ts`: registra `category`/`tag` no `appRouter`.

## Phase 3 — Integração com `post`

- [X] T023 — `src/server/features/post/schema.ts`: `createPostSchema`/`updatePostSchema` ganham `categoryId?`/`tagIds?`; `postEntitySchema` ganha `categoryId`; `postEntityWithRelationsSchema` ganha `category`/`tags`; novo `postEntityWithTaxonomySchema`; `readRecentPostsSchema` ganha `categoryId?`/`tagId?`.
- [X] T024 — `src/test/context/testContext.ts` **e** `src/test/context/types.ts` na mesma task (lição da feature 004 — os dois duplicam o mesmo shape): `createPost` ganha override `categoryId` + chamada a `setTags` se `tagIds` for passado; novos helpers `createCategory`/`createTag`.
- [X] T025 — Teste `post/procedures/__test__/create.ts` — post criado com `categoryId`/`tagIds` existentes reflete os dois; post sem nenhum dos dois continua igual a antes.
- [X] T026 — `post/domain/create.ts`: passa `categoryId` no `repositories.post.create`; se `tagIds` não vazio, chama `setTags` depois.
- [X] T027 — Teste `post/procedures/__test__/update.ts` — dono troca tags (substituição completa) e categoria do próprio post.
- [X] T028 — `post/domain/update.ts`: passa `categoryId` no `update`; se `tagIds` presente (inclusive vazio), chama `setTags`.
- [X] T029 — Teste `post/procedures/__test__/readRecent.ts` — filtro por `categoryId` e por `tagId` retornam só os posts esperados.
- [X] T030 — `post/domain/readRecent.ts` + `post/procedures/readRecent.ts`: repassam `categoryId`/`tagId` pro `readRecents`.
- [X] T031 — Teste `post/procedures/__test__/readBySlug.ts` — retorno inclui `category`/`tags` do post.
- [X] T032 — `post/domain/readBySlug.ts`: tipo de retorno passa a `IPostEntityWithTaxonomy` (checagem de status inalterada).
- [X] T033 — Teste `src/server/models/__test__/prismaModels.ts` — `CategoryModel`/`TagModel`/`PostModel.setTags`/filtro novo em `readRecents`.
- [X] T034 — REFACTOR + `tsc --noEmit` + `vitest` completo.

## Phase 4 — Reconciliação

- [X] T035 — `grep -rn "readRecents\|readUserPosts\|readBySlug" src/server` re-confirmado; `docs/roadmap.md` Fase 1 (checklist "tags"/"categorias" + critério de conclusão) atualizado; `docs/prd.md` linha do MVP atualizada se aplicável.
- [X] T036 — Status de `spec.md`/`plan.md` marcado `done`. Verificação: `npx prisma migrate dev` aplicado contra o Postgres real do dev; `tsc --noEmit` e `vitest` verdes; verificação ao vivo via `curl` (category/tag create + post com categoria/tags + readRecent filtrado + readBySlug com taxonomia).

---

*Toda task referencia esta feature no commit. Usuário já aprovou "executa até o fim" via `/afm:deliver`, então a execução das tasks segue sem pausa adicional; o commit final continua respeitando o padrão de pedir confirmação antes de commitar.*
