# Feature 011 — Tasks

> **Plan:** [`./plan.md`](./plan.md)

## Setup

- [X] T001 — Ler `src/server/features/post/{schema,domain/readBySlug,procedures/readBySlug}.ts`, `src/app/(half)/post/{create/page.client,edit/[id]/page.client,[slug]/page}.tsx` a fresco.

## Backend

- [X] T002 — `domain/readBySlug.ts`: `isOwner = post.userId === input.callerId`; 404 só se `!post || (post.status !== "PUBLISHED" && !isOwner)`. `procedures/readBySlug.ts` passa `callerId: ctx.user?.id` (padrão de `update`/`delete`).
- [X] T003 [P] — Teste em `procedures/__test__/readBySlug.ts`: dono vê o próprio DRAFT/ARCHIVED; outro usuário logado recebe 404 pro DRAFT/ARCHIVED de terceiro; post PUBLISHED continua visível pra todos (4 testes novos/reescritos).

## Frontend

- [X] T004 [P] — `post/create/page.client.tsx`: `<select>` de `status` (Draft/Published/Archived), `defaultValues={{ status: "PUBLISHED" }}` no `FormBase`.
- [X] T005 [P] — `post/edit/[id]/page.client.tsx`: idem, valor inicial = status atual (via `defaultValues={{ ...post }}` já existente).
- [X] T006 — `post/[slug]/page.tsx`: achado durante implementação exigiu restructurar a busca (ver `plan.md` § 9) — `PostContent` (cacheado) → fallback `OwnerPreview` (dinâmico, novo) → `PostView` (JSX compartilhado) com banner condicional. `src/server/caller.ts` ganhou `createOptionalDynamicCaller()`.

## Verificação

- [X] T007 — `npx tsc --noEmit` limpo + `npx vitest run` 157/157 verdes.
- [X] T008 — `next build --debug-prerender`: sem erro novo em `/post/[slug]` (só o baseline conhecido de `/`, `new Date()` em `post.ts`). `npx biome check` limpo nos arquivos tocados.

## Reconciliação (8.5)

- [X] T009 — `docs/roadmap.md` Fase 2: "publicar post / salvar como rascunho / arquivar" → `[x]`. `spec.md` status → `done`.
- [ ] T010 — Commit(s): 1 commit `feat:`, 1 commit `docs:`. Sem push.
