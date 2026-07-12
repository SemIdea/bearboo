# Feature 002 — Tasks

> **Spec:** [`./spec.md`](./spec.md)
> **Plan:** [`./plan.md`](./plan.md)
> **Convenção:** TDD-ordenadas. `[P]` = paralelizável (sem dependência da task imediatamente anterior). Cada task é um ciclo de `core/afm.md` § 2 (RED → GREEN → REFACTOR → COMMIT).
> **Pré-requisito:** `plan.md` sem `[NEEDS CLARIFICATION:]` aberto — confirmado vazio.
>
> ⚠️ **Parcialmente verificado (2026-07-11, sessão de continuação com `node`/`npm` instalados).** `npx prisma generate`, `npx tsc --noEmit` e `npx vitest run` (111/111) rodam **verde**. `npx biome check` mostra só ruído pré-existente de CRLF (confirmado via `git stash` que os mesmos ~222 erros já existiam antes desta feature — não é regressão). **Ainda não verificado:** aplicar a migration num Postgres real e exercitar a rota `/post/[slug]` no browser — este ambiente não tem `docker`/Postgres disponível. **Nada foi commitado.**
>
> **Bugs achados e corrigidos nesta verificação** (não cobertos pelos testes existentes, então passaram pela implementação original sem sinalizar):
> - `prisma/seed.ts` chamava `prisma.post.create` direto (bypassando `domain_createPost`) sem passar `slug` — `tsc` acusava `slug` faltando (`PostUncheckedCreateInput`). Corrigido: importa `KebabCaseSlugGenerator` e gera slug por título; `console.log` dos links de post também migrado de `/post/${id}` pra `/post/${slug}`.
> - `src/server/models/__test__/prismaModels.ts` ("CommentModel reads comments by post and user") não tinha sido atualizado pro novo `include: { post: { select: { slug } } } }` de `CommentModel.readAllByUserId` — teste falhava comparando a chamada do mock sem o `include`. Corrigido o assert.
> - `prisma/migrations/20250711120000_add_post_slug/` tinha timestamp **anterior** à última migration existente (`20250731144606_`), o que quebraria a ordem de aplicação em `prisma migrate dev`/`deploy`. Renomeada pra `20250731144607_add_post_slug` (logo após a última).

## Phase 1 — Setup

- [X] T001 [P] Adiciona `slug String @unique` ao model `Post` em `prisma/schema.prisma` + migration `prisma/migrations/20250731144607_add_post_slug/` com backfill (nullable → `UPDATE` a partir do `id` → `NOT NULL` + unique index) — ver `plan.md` § 3. `npx prisma validate` passa; `npx prisma generate` roda limpo. **Ainda não aplicada num Postgres real** (sem `docker` neste ambiente).
- [X] T002 [P] `src/lib/slug/adapter.ts` (`ISlugGeneratorHelperAdapter`) + `src/lib/slug/implementations/kebabCase.ts`.
- [X] T003 Wire `slug: new KebabCaseSlugGenerator()` em `src/server/infra/container/helpers.ts` + tipo `IHelpers`.

## Phase 2 — Foundation (geração de slug no create)

- [X] T004 — Teste em `src/lib/slug/__test__/kebabCase.ts` (espaço/acento/maiúscula/truncamento).
- [X] T005 — `KebabCaseSlugGenerator.generate` implementado (NFD + strip de diacríticos + kebab-case + truncamento em 80 chars).
- [X] T006 — Teste em `procedures/__test__/create.ts` — post criado tem `slug` derivado do título.
- [X] T007 — `domain_createPost` gera `baseSlug` via `ctx.helpers.slug.generate(input.title)`.
- [X] T008 — Teste em `procedures/__test__/create.ts` — dois posts com mesmo título, segundo recebe sufixo `-2`.
- [X] T009 — Loop de resolução de colisão (`resolveAvailableSlug`, local não-exportado em `domain/create.ts`) via `ctx.repositories.post.readBySlug`.
- [X] T010 — REFACTOR + `tsc --noEmit` + testes afetados — `tsc --noEmit` limpo, `vitest` 111/111 verde (após corrigir `seed.ts` e `prismaModels.ts`, ver caveat).

## Phase 3 — Boundary (`post.readBySlug`)

- [X] T011 — Teste em `procedures/__test__/readBySlug.ts` (novo arquivo) — lê post existente por slug.
- [X] T012 — Teste no mesmo arquivo — slug inexistente rejeita com `PostErrorCode.POST_NOT_FOUND`.
- [X] T013 — `PostModel.readBySlug` + `postEntitySchema.slug` + `readPostBySlugSchema`/`ReadPostBySlugInput` + `domain_readPostBySlug` (`domain/readBySlug.ts`) + `procedure_readPostBySlug` (`procedures/readBySlug.ts`) + registrado em `index.ts`.
- [X] T014 [P] — `PostErrorCode.POST_NOT_FOUND` em `src/shared/error/post.ts`: mensagem não menciona mais "ID".

## Phase 4 — Ripple (revalidate + comentário→post)

- [X] T015 — Teste em `procedures/__test__/revalidate.ts` — `revalidatePath` esperado com `` `/post/${post.slug}` ``.
- [X] T016 — `domain_revalidatePost` usa `post.slug`.
- [X] T017 — Teste em `user/procedures/__test__/readComments.ts` — output inclui `post.slug`.
- [X] T018 — `CommentModel.readAllByUserId` inclui `post: { select: { slug: true } } }` (retorna `ICommentEntityWithPost`); `commentEntityWithPostSchema` novo em `comment/schema.ts`, usado em `readUserCommentsOutputSchema`.

## Phase 5 — Frontend (sem cobertura automatizada — `ach.md` § 4.1; type-check passa, **ainda não rodado no browser** — ver caveat acima)

- [X] T019 — `src/app/(half)/post/[id]/` → `src/app/(half)/post/[slug]/` (via `git mv`); `page.tsx` usa `caller.post.readBySlug({ slug })`.
- [X] T020 [P] — `postFeed.tsx`: link por `post.slug`.
- [X] T021 [P] — `user/[id]/page.client.tsx`: link de post por `post.slug`; link de comentário por `comment.post.slug` (tipo trocado pra `ICommentEntityWithPost`).
- [X] T022 [P] — `post/create/page.client.tsx`: redirect por `data.slug`.
- [X] T023 — `grep -rn "/post/\${" src` confirmado limpo (só usos por slug; `post/edit/[id]` e `postId` de `CommentArea` são internos por id, não links públicos).

## Phase 6 — Reconciliação (8.5)

- [X] T024 — `ach.md` § 3.1 atualizado (Adapter `slug`, `PostModel.readBySlug`/`UserModel.readByEmail`) + correção da linha de convenção de test file (drift doc↔código encontrado: doc dizia "sem `__tests__/`", código real usa `__test__/` singular).
- [X] T025 — `ust.md` US-006 ganhou os 4 cenários novos + `Test ref`/`Spec` atualizados.
- [X] T026 — `docs/roadmap.md` Fase 1: linha da tabela + item do checklist marcados.
- [ ] T027 — Status de `spec.md`/`plan.md` mantido **`in_progress`** (não `done`) até rodar a migration contra um Postgres real e exercitar `/post/[slug]` no browser — ver caveat no topo. `tsc`/`vitest` verdes não são suficiente pro DoD completo (`afm.md` § 6) sem isso.

---

*Toda task referencia US-006 no commit — commits ainda não feitos (aguardando aprovação explícita do user antes de commitar).*
*Materializado + implementado via `/afm:deliver` (2026-07-11). Verificação de toolchain (T010, parte do T001) completada numa sessão de continuação (2026-07-11) após `npm install`. Falta: `docker compose -f docker-compose-dev.yml up -d` + `npx prisma migrate dev` + `pnpm db:seed` + abrir `/post/<slug>` no browser antes de marcar T027/`done`.*
