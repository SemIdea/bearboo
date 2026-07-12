# Feature 004 — Tasks

> **Spec:** [`./spec.md`](./spec.md)
> **Plan:** [`./plan.md`](./plan.md)
> **Convenção:** TDD-ordenadas. `[P]` = paralelizável (sem dependência da task imediatamente anterior). Cada task é um ciclo de `afm.md` § 2 (RED → GREEN → REFACTOR → COMMIT).
> **Pré-requisito:** `plan.md` sem `[NEEDS CLARIFICATION:]` aberto — confirmado vazio.

## Phase 1 — Schema e Model

- [X] T001 — `prisma/schema.prisma`: `enum PostStatus { DRAFT PUBLISHED ARCHIVED }` + campo `status PostStatus @default(PUBLISHED)` em `Post`; roda `npx prisma migrate dev --name add_post_status`.
- [X] T002 — Teste em `src/server/models/__test__/prismaModels.ts` — `PostModel.readRecents`/`readUserPosts` chamam `findMany` com `where: { status: "PUBLISHED", ... }`.
- [X] T003 — `src/server/models/post.ts`: `IPostEntity` ganha `status`; `readRecents`/`readUserPosts` filtram `status: "PUBLISHED"`; `IPostModel` atualizado.

## Phase 2 — Boundary (`post.create`, `post.update`, `post.readBySlug`)

- [X] T004 [P] — `postStatusSchema` + `postEntitySchema.status` + `status` opcional em `createPostSchema`/`updatePostSchema` (`schema.ts`).
- [X] T005 — `src/test/context/testContext.ts`: `createPost` ganha override opcional `status` (default `"PUBLISHED"`). Achado durante a execução: o mesmo shape estava duplicado em `src/test/context/types.ts` (`ITestContextDTO.createPost`), sem `status` — corrigido junto (senão `tsc` quebrava nos testes novos).
- [X] T006 — Teste em `procedures/__test__/create.ts` — post criado sem `status` sai `PUBLISHED`; post criado com `status: "DRAFT"` sai `DRAFT`.
- [X] T007 — `domain/create.ts`: resolve `status: input.status ?? "PUBLISHED"` antes de chamar `repositories.post.create`.
- [X] T008 — Teste em `procedures/__test__/update.ts` — dono muda o status do próprio post via `update`.
- [X] T009 — `domain/update.ts`: repassa `status: input.status` pro `repositories.post.update`.
- [X] T010 — Teste em `procedures/__test__/readBySlug.ts` — post `DRAFT` e post `ARCHIVED` por slug retornam `NOT_FOUND`, igual slug inexistente.
- [X] T011 — `domain/readBySlug.ts`: trata `post.status !== "PUBLISHED"` como `NOT_FOUND`.
- [X] T012 — Teste em `procedures/__test__/readRecent.ts` — posts `DRAFT`/`ARCHIVED` não aparecem na listagem paginada.
- [X] T013 [P] — Teste em `user/procedures/__test__/readPosts.ts` — posts `DRAFT`/`ARCHIVED` não aparecem na lista pública de um autor.
- [X] T014 — Teste em `procedures/__test__/create.ts` — slug duplicado recebe sufixo numérico mesmo quando o post existente é `DRAFT` (regressão de `resolveAvailableSlug` — confirma que `readBySlug` não ficou filtrado).
- [X] T015 — REFACTOR + `tsc --noEmit` + `vitest` completo — `tsc` limpo, `vitest` 123/123 verde (de 115/115 antes desta feature).

## Phase 3 — Reconciliação

- [X] T016 — `grep -rn "readRecents\|readUserPosts\|readBySlug" src/server` re-confirmado — nenhum ponto de leitura pública novo ficou sem o tratamento de status (só os 3 já mapeados no plan).
- [X] T017 — `docs/roadmap.md`: Fase 1 (regra "somente `PUBLISHED` aparecem", checklist "status do post") e Fase 2 (item "publicar/rascunho/arquivar") atualizados; `docs/prd.md` linha 70 atualizada.
- [X] T018 — Status de `spec.md`/`plan.md` marcado `done`. Verificação: `npx prisma migrate dev` aplicado contra o Postgres real do dev (posts existentes viraram `PUBLISHED` via backfill do `@default`, confirmado por query direta); `tsc --noEmit` e `vitest` (123/123) verdes; verificação ao vivo via `curl` contra o dev server (reiniciado pra pegar o Prisma Client regenerado — o processo antigo ainda tinha o client sem `status` em memória, `Unknown argument status`, não era bug de código): post `DRAFT` criado direto no banco não aparece em `post.readRecent` (18 posts publicados, nenhum `DRAFT`) e `post.readBySlug` retorna `POST_NOT_FOUND` (404) pro slug desse post — post de verificação removido depois.

---

*Toda task referencia esta feature no commit. Commits só depois de aprovação explícita do user, como no padrão já estabelecido nesta sessão — usuário já aprovou "executa até o fim" pra esta feature via `/afm:deliver`, então a execução das tasks segue sem pausa adicional, mas o commit final continua respeitando o padrão de pedir confirmação antes de commitar (ver histórico da sessão).*
