# Feature 013 — Tasks

> **Plan:** [`./plan.md`](./plan.md)

## Setup

- [X] T001 — Reler `src/server/createRouter.ts`, `createContext.ts`, `src/server/models/user.ts`, `src/server/features/{post,category,user}/**`, `src/lib/rateLimit/**` (padrão de lib a seguir) a fresco (feito no discovery — sem lacuna nova).

## Schema

- [X] T002 — `prisma/schema.prisma`: `enum Role { ADMIN EDITOR AUTHOR }`, `User.role Role @default(AUTHOR)`. Migration (`prisma migrate diff` schema-to-schema, mesma limitação de sandbox sem `DATABASE_URL` funcional documentada em features anteriores) + `UPDATE "User" SET role = 'ADMIN' WHERE email = 'codorkman@gmail.com'` na própria migration SQL.

## Backend — fundação (helper de permissões + guard)

- [X] T003 [P] — `src/lib/permissions/adapter.ts` (`type Action`, `IPermissionAdapter`) + `implementations/matrix.ts` (`MatrixPermission`) + `__test__/matrix.ts` cobrindo as 4 ações × 3 papéis contra a matriz da Fase 3 (`docs/roadmap.md`).
- [X] T004 — `src/server/infra/container/helpers.ts`: registra `permissions: new MatrixPermission()` em `IHelpers` (depende de T003).
- [X] T005 — `src/server/models/user.ts`: `IUserEntity` ganha `role: Role` (import de `@prisma/client`) (depende de T002).
- [X] T006 — `src/server/features/auth/domain/readUserAndSessionByAccessToken.ts`: objeto de retorno (pick explícito) ganha `role: user.role` + teste que falha se `ctx.user.role` vier `undefined` numa sessão válida (depende de T005).
- [X] T007 — `src/server/createRouter.ts`: novo `roleProcedure = (allowed: Role[]) => verifiedProcedure.use(...)`, lança `FORBIDDEN` se `!allowed.includes(ctx.user.role)` + teste (depende de T005).
- [X] T008 — `src/server/features/user/schema.ts`: `userWithoutPasswordSchema` ganha `role: z.enum(["ADMIN","EDITOR","AUTHOR"])` — propaga pra output de `login`/`register`/`readUserFromSession`/`resetPassword`; ajusta fixtures de teste que constroem usuário sem `role` (depende de T005).

## Backend — aplicação da matriz

- [X] T009 — `src/server/features/post/procedures/{update,delete}.ts` passam `role: ctx.user.role`; `domain/{update,delete}.ts` ganham bypass de ownership (`post.userId !== input.userId && !ctx.helpers.permissions.can(input.role, "post:editAny"|"post:deleteAny")`) + testes (Admin edita/deleta post alheio; Author não-dono é rejeitado; Author dono continua aceito) (depende de T004, T006).
- [X] T010 — `src/server/features/category/procedures/create.ts`: troca `verifiedProcedure` → `roleProcedure(["ADMIN","EDITOR"])` + teste (Author rejeitado, Editor aceito) (depende de T007).
- [X] T011 — `src/server/models/post.ts` (`readOwnPosts`): assinatura `userId: string` → `userId: string | null` (where só inclui `userId` quando não-null) + `src/server/features/post/procedures/readOwn.ts` passa `role`; `domain/readOwn.ts` chama com `null` quando `permissions.can(role, "post:editAny")`, senão `userId` + testes (Admin/Editor veem site-wide, Author só os próprios) (depende de T004, T006).
- [X] T012 — `src/server/features/user/schema.ts` (`updateUserRoleSchema`) + `domain/updateRole.ts` (`domain_updateUserRole`, valida usuário-alvo existe) + `procedures/updateRole.ts` (`roleProcedure(["ADMIN"])`) + registra `updateRole` em `user/index.ts` + testes (Admin promove, Editor/Author rejeitados, usuário-alvo inexistente → `NOT_FOUND`) (depende de T007).

## Frontend

- [X] T013 — Confirma `src/context/auth/index.hook.tsx` (`IClientSession`) propaga `role` sem mudança de código (deriva de `IUserEntity`) — `tsc --noEmit` como verificação, não assunção. `src/app/(half)/post/mine/page.client.tsx`: quando `session.user.role !== "AUTHOR"`, mostra o nome do autor em cada card (painel agora é site-wide, precisa distinguir dono). **Nota de discovery:** `category.create` não é chamado de nenhuma UI hoje (`grep` confirmou zero call sites em `src/app`) — sem botão/form a esconder, task de UI de categoria removida do escopo.

## Verificação

- [X] T014 — `npx tsc --noEmit` limpo + `npx vitest run` verde (suíte completa, não só os testes novos).

## Reconciliação (8.5)

- [X] T015 — `docs/roadmap.md` Fase 3: marca `[x]` em "proteger rotas admin" (via `roleProcedure` nos call sites), "criar middleware de autorização", "criar helper de permissões", "adicionar testes das regras de permissão"; nota sobre publish/archive ficar pra Fase 4 (já registrada no `spec.md` § 4, referenciar). `docs/ach.md` § 3.1: registra `src/lib/permissions/` (Adapter-like) e `roleProcedure` (Procedure guard, extensão de `verifiedProcedure`) como componentes novos. `spec.md`/`ust.md` (US-010) status → `done`.
- [ ] T016 — Commit(s): schema+migration, backend (helper+guard+enforcement), frontend (painel site-wide), docs. Sem push.
