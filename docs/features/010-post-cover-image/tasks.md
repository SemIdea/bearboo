# Feature 010 — Tasks

> **Plan:** [`./plan.md`](./plan.md)

## Setup

- [X] T001 — Ler `prisma/schema.prisma`, `src/server/features/post/{schema,domain/create,domain/update}.ts`, `src/server/models/post.ts` a fresco.

## Backend

- [X] T002 — `prisma/schema.prisma`: `coverImageUrl String?` em `Post`.
- [X] T003 — Migration gerada via `prisma migrate diff --from-schema-datamodel <schema antigo> --to-schema-datamodel prisma/schema.prisma --script` → `prisma/migrations/20260712105236_add_post_cover_image/migration.sql`. `npx prisma generate --no-engine --no-hints` rodado.
- [X] T004 — `schema.ts`: `coverImageUrl: z.string().url().optional()` em `createPostSchema`/`updatePostSchema`; `coverImageUrl: z.string().nullable()` em `postFieldsSchema`.
- [X] T005 — `src/server/models/post.ts`: `IPostEntity.coverImageUrl: string | null`.
- [X] T006 — `domain/create.ts`: `coverImageUrl: input.coverImageUrl ?? null`.
- [X] T007 — `domain/update.ts`: `coverImageUrl: input.coverImageUrl`.
- [X] T008 [P] — Testes em `__test__/create.ts` (2 casos: com/sem capa) e `__test__/update.ts` (1 caso). `src/test/context/testContext.ts` (`createPost` helper) ganhou `coverImageUrl` no `Pick`.

## Frontend

- [X] T009 [P] — `post/create/page.client.tsx`: `InputField name="coverImageUrl"`.
- [X] T010 [P] — `post/edit/[id]/page.client.tsx`: idem.
- [X] T011 [P] — `postFeed.client.tsx`: `<img>` condicional no card.
- [X] T012 [P] — `post/[slug]/page.tsx`: `<img>` condicional no topo do conteúdo.

## Verificação

- [X] T013 — `npx tsc --noEmit` limpo + `npx vitest run` 150/150 verdes.
- [X] T014 — `next build`: sem erro novo (só o erro pré-existente de `/`, `new Date()` em `post.ts`). `npx biome check` limpo nos arquivos tocados.

## Reconciliação (8.5)

- [X] T015 — `docs/roadmap.md` Fase 1: "imagem de capa" → `[x]`. `spec.md` status → `done`.
- [ ] T016 — Commit(s): 1 commit `feat:` (schema+migration+backend+frontend+testes), 1 commit `docs:` (roadmap/spec). Sem push.
