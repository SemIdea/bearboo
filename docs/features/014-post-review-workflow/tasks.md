# Feature 014 — Tasks

> **Plan:** [`./plan.md`](./plan.md)
> Toda task refere US-011/RF-09.

## Setup

- [X] T001 — Reler `src/server/features/post/**`, `src/server/models/post.ts`, `src/lib/permissions/**`, `src/server/createRouter.ts` a fresco (feito no discovery — sem lacuna nova).

## Schema

- [X] T002 — `prisma/schema.prisma`: `enum PostStatus` ganha `IN_REVIEW`, `SCHEDULED`; `Post` ganha `scheduledAt DateTime?`; **NOVO** `enum ReviewCommentType { APPROVAL REJECTION }`; **NOVO** `model PostReviewComment { id, postId, post, reviewerId, reviewer, type, content String?, createdAt }`. Migration correspondente.

## Backend — fundação (permissão, erro, model, schemas)

- [X] T003 [P] — `src/lib/permissions/adapter.ts` (`IPermissionAction` ganha `"post:publish"`) + `implementations/matrix.ts` (`"post:publish": ["ADMIN","EDITOR"]`) + `__test__/matrix.ts` cobrindo a ação nova × 3 papéis (US-011/RF-09).
- [X] T004 [P] — `src/shared/error/post.ts`: `POST_INVALID_STATUS_TRANSITION` + mensagem (US-011/RF-09).
- [X] T005 — `src/server/models/post.ts`: `IPostStatus` ganha `"IN_REVIEW" | "SCHEDULED"`; `IPostEntity` ganha `scheduledAt: Date | null` (depende de T002) (US-011/RF-09).
- [X] T006 — **NOVO** `src/server/models/reviewComment.ts`: `IReviewCommentEntity`, `IReviewCommentType`, `IReviewCommentEntityWithReviewer`; `ReviewCommentModel extends BaseModel<IReviewCommentEntity>` + `readAllByPostId(postId)` (include reviewer `{id,name}`) + teste (depende de T002) (US-011/RF-09).
- [X] T007 — `src/server/infra/container/repositories.ts`: registra `reviewComment: ReviewCommentModel` (depende de T006) (US-011/RF-09).
- [X] T008 — `src/server/features/post/schema.ts`: `postStatusSchema` ganha `IN_REVIEW`/`SCHEDULED`; **remove** `status` de `updatePostSchema`; **NOVO** `submitForReviewPostSchema`, `publishPostSchema` (`scheduledAt` via `z.coerce.date().optional()`, `comment` opcional), `rejectPostSchema` (`comment: z.string().min(1)`), `archivePostSchema`, `readReviewCommentsSchema`, `reviewCommentsOutputSchema` (depende de T005) (US-011/RF-09).

## Backend — ações de domínio (state machine)

- [X] T009 — `src/server/features/post/domain/create.ts`: `status` força `DRAFT` quando o papel não tem `post:publish`; testes — Author sem status vira `DRAFT`, Admin/Editor mantêm default `PUBLISHED` (ajusta o teste existente `"Should default to PUBLISHED status when none is provided"` pra contexto `ADMIN`) (depende de T003, T008) (US-011/RF-09).
- [X] T010 — **NOVO** `src/server/features/post/domain/submitForReview.ts` (`domain_submitForReviewPost`): exige dono + `status === "DRAFT"` → `IN_REVIEW`; testes (dono aceito, não-dono rejeitado, status inválido rejeitado) (depende de T008) (US-011/RF-09).
- [X] T011 — **NOVO** `src/server/features/post/domain/publish.ts` (`domain_publishPost`): exige `post:publish` + `status ∈ {DRAFT, IN_REVIEW}`; calcula `PUBLISHED`/`SCHEDULED` por `scheduledAt`; grava `PostReviewComment` `APPROVAL` se veio de `IN_REVIEW` com `comment`; testes (aprova+publica, agenda com data futura, publica direto de `DRAFT`, Author rejeitado, status inválido rejeitado) (depende de T003, T006, T007, T008) (US-011/RF-09).
- [X] T012 — **NOVO** `src/server/features/post/domain/reject.ts` (`domain_rejectPost`): exige `post:publish` + `status === "IN_REVIEW"` → `DRAFT`; sempre grava `PostReviewComment` `REJECTION`; testes (rejeita com motivo, Author rejeitado, status inválido rejeitado) (depende de T003, T006, T007, T008) (US-011/RF-09).
- [X] T013 — **NOVO** `src/server/features/post/domain/archive.ts` (`domain_archivePost`): exige `post:publish` + `status !== "ARCHIVED"` → `ARCHIVED`; testes (Admin arquiva post alheio, Author rejeitado) (depende de T003, T008) (US-011/RF-09).
- [X] T014 — **NOVO** `src/server/features/post/domain/readReviewComments.ts` (`domain_readReviewComments`): exige dono OU `post:publish`; testes (depende de T003, T006, T007, T008) (US-011/RF-09).
- [X] T015 — `src/server/features/post/domain/update.ts`: remove `status` do objeto passado pro repository; teste de regressão (update não muda mais status mesmo se alguém tentasse mandar) (depende de T008) (US-011/RF-09).

## Backend — visibilidade lazy de SCHEDULED

- [X] T016 — `src/server/models/post.ts` (`readRecents`, `readRelated`, `readUserPosts`): filtro `status: "PUBLISHED"` vira `OR: [{status: PUBLISHED}, {status: SCHEDULED, scheduledAt: {lte: now}}]`; testes (agendado passado aparece, agendado futuro não aparece) (depende de T005) (US-011/RF-09).
- [X] T017 — `src/server/features/post/domain/readBySlug.ts` + `procedures/readBySlug.ts`: visível se `PUBLISHED` OU `SCHEDULED` passado OU dono OU `post:publish`; `role?: IRole` opcional no `DomainInput` (leitura anônima continua funcionando); testes (revisor vê rascunho alheio, Author não vê rascunho alheio, agendado passado visível a anônimo) (depende de T003, T016) (US-011/RF-09).

## Boundary — procedures + router

- [X] T018 — **NOVO** `src/server/features/post/procedures/{submitForReview,publish,reject,archive,readReviewComments}.ts` (`verifiedProcedure`, passam `role`/`userId` pro domain) + registra as 5 no `PostRouter` (`src/server/features/post/index.ts`) + testes de procedure (mesmo nível dos testes de domain, via `TestContext`) (depende de T009–T014) (US-011/RF-09).
- [X] T019 — `src/server/features/post/procedures/create.ts`: passa `role: ctx.user.role` (depende de T009) (US-011/RF-09).

## Frontend (toque mínimo)

- [X] T020 — `src/app/(half)/post/edit/[id]/page.client.tsx`: remove o `<select>` de status (`status` não existe mais em `updatePostSchema`); adiciona botões condicionais por papel/status (`Submit for review` pro dono em `DRAFT`; `Publish`/`Reject`/`Archive` pra quem tem `post:publish`) + lista os `PostReviewComment` do post via `post.readReviewComments` (depende de T018) (US-011/RF-09).
- [X] T021 — `src/app/(half)/post/mine/page.client.tsx`: `<select>` de filtro de status ganha `IN_REVIEW`/`SCHEDULED` (depende de T005) (US-011/RF-09).

## Verificação

- [X] T022 — `npx tsc --noEmit` limpo + `npx vitest run` verde (suíte completa) + verificação ao vivo (`next dev` + `curl`/browser): criar post como Author (nasce DRAFT) → submit for review → aprovar/publicar como Admin/Editor → aparece em `readRecent`; rejeitar com motivo → volta DRAFT + motivo visível; agendar com data futura → não aparece; agendar com data passada → aparece.

## Reconciliação (8.5)

- [X] T023 — `docs/roadmap.md` Fase 4: marca `[x]` nos itens cobertos (enviar/aprovar/rejeitar/publicar/agendar/arquivar, comentários internos de revisão); nota explícita que "histórico de alterações" fica pendente. `docs/ust.md`: adiciona US-011 (Épico Posts). `docs/prd.md`: adiciona RF-09. `docs/ach.md` § 3.1: registra `post:publish` na nota de `permissions`, e `PostReviewComment`/`ReviewCommentModel` na seção de Model. `spec.md`/`plan.md` status → `done`.
- [X] T024 — Commit(s): schema+migration, backend (permissão+erro+model+domain+procedures), frontend (ações mínimas), docs. Sem push.
