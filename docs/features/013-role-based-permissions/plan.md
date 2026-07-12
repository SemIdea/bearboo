# Feature 013 — Plan

> **Spec:** [`./spec.md`](./spec.md)
> **Status:** done (implementado e verificado 2026-07-12, gate "Executa até o fim")

## 1. Resumo técnico

Três fios que fecham os critérios de sucesso da § 2 do spec:

1. **Papel persistido** — `enum Role { ADMIN EDITOR AUTHOR }` no Prisma + `User.role Role @default(AUTHOR)`. Migração backfila todos os usuários existentes (default cobre isso automaticamente) e promove `codorkman@gmail.com` a `ADMIN` via `UPDATE` explícito na própria migration.
2. **Helper de permissões + guard de procedure** — `src/lib/permissions/` (mesmo padrão adapter+implementation de `rateLimit`/`slug`) com a matriz completa da Fase 3; `createRouter.ts` ganha `roleProcedure(allowedRoles)`, nova camada de guard no mesmo nível de `verifiedProcedure`.
3. **Aplicação da matriz nos call sites existentes** — post update/delete ganham bypass de ownership pra `ADMIN`/`EDITOR`; `category.create` passa a exigir `roleProcedure(["ADMIN","EDITOR"])`; painel `/post/mine` fica site-wide pra `ADMIN`/`EDITOR`; nova procedure `user.updateRole` (admin-only, sem UI).

## 2. Componentes afetados

| Componente | Mudança |
| --- | --- |
| `prisma/schema.prisma` | `enum Role { ADMIN EDITOR AUTHOR }`; `User` ganha `role Role @default(AUTHOR)` |
| **NOVA migration** `prisma/migrations/<ts>_add_user_role/migration.sql` | `ALTER TYPE`/`CREATE TYPE "Role"`, `ALTER TABLE "User" ADD COLUMN "role" ... DEFAULT 'AUTHOR'`, seguido de `UPDATE "User" SET role = 'ADMIN' WHERE email = 'codorkman@gmail.com'` |
| `src/server/models/user.ts` | `IUserEntity` ganha `role: Role` (import do tipo `Role` gerado pelo Prisma client) |
| `src/server/features/auth/domain/readUserAndSessionByAccessToken.ts` | o objeto retornado (pick explícito de campos) ganha `role: user.role` — sem isso `ctx.user.role` fica `undefined` mesmo com o campo no schema/tipo |
| **NOVO** `src/lib/permissions/adapter.ts` | porta pura: `type Action = "post:editAny" \| "post:deleteAny" \| "category:manage" \| "user:manageRoles"`; `IPermissionAdapter = { can(role: Role, action: Action): boolean }` |
| **NOVO** `src/lib/permissions/implementations/matrix.ts` | `class MatrixPermission implements IPermissionAdapter` — tabela fixa da Fase 3 (`docs/roadmap.md`), sem I/O |
| **NOVO** `src/lib/permissions/__test__/matrix.ts` | cobre as 4 ações × 3 papéis (12 combinações) contra a matriz do roadmap |
| `src/server/createRouter.ts` | novo `roleProcedure = (allowed: Role[]) => verifiedProcedure.use(...)` — lança `FORBIDDEN` se `!allowed.includes(ctx.user.role)`; usa `permissions.can` só nos call sites que precisam de bypass de ownership (post), não no guard genérico (que é allowlist de papel puro) |
| `src/server/infra/container/helpers.ts` | registra `permissions: new MatrixPermission()` em `IHelpers` |
| `src/server/features/post/procedures/update.ts`, `delete.ts` | passam `role: ctx.user.role` pro domain além de `userId` |
| `src/server/features/post/domain/update.ts`, `delete.ts` | `if (post.userId !== input.userId && !ctx.helpers.permissions.can(input.role, "post:editAny"))` (idem `"post:deleteAny"` no delete) antes de lançar `FORBIDDEN` |
| `src/server/features/category/procedures/create.ts` | troca `verifiedProcedure` → `roleProcedure(["ADMIN", "EDITOR"])` |
| `src/server/features/post/procedures/readOwn.ts` | passa `role: ctx.user.role` pro domain |
| `src/server/features/post/domain/readOwn.ts` | se `ctx.helpers.permissions.can(input.role, "post:editAny")` (proxy de "vê tudo"), chama `readOwnPosts(null, ...)`; senão `readOwnPosts(input.userId, ...)` |
| `src/server/models/post.ts` (`readOwnPosts`) | assinatura muda `userId: string` → `userId: string \| null`; `where` só inclui `userId` quando não-null |
| **NOVO** `src/server/features/user/schema.ts` (`updateUserRoleSchema`) | `{ userId: string, role: z.enum(["ADMIN","EDITOR","AUTHOR"]) }` |
| **NOVO** `src/server/features/user/domain/updateRole.ts` (`domain_updateUserRole`) | valida usuário-alvo existe, chama `ctx.repositories.user.update(userId, { role })` |
| **NOVO** `src/server/features/user/procedures/updateRole.ts` | `roleProcedure(["ADMIN"]).input(updateUserRoleSchema).mutation(...)` |
| `src/server/features/user/index.ts` | registra `updateRole: procedure_updateUserRole` no `UserRouter` |
| `src/server/features/user/schema.ts` (`userWithoutPasswordSchema`) | ganha `role: z.enum(["ADMIN","EDITOR","AUTHOR"])` — propaga pra `login`/`register`/`readUserFromSession`/`resetPassword` output (todos reusam esse schema) |
| `src/context/auth/index.hook.tsx` | `IClientSession` deriva de `IUserEntity` (já ganha `role` automaticamente, sem mudança de código — só o tipo importado muda de shape) |
| `src/app/(half)/post/mine/page.client.tsx` | esconde nada de novo (o backend já filtra); ajuste cosmético opcional: mostrar nome do autor na listagem quando `session.user.role !== "AUTHOR"` (múltiplos donos visíveis) |
| `src/app/(half)/category/*` (formulário de criar categoria, se existir componente de UI) | esconde o botão/form de criar categoria quando `session.user.role === "AUTHOR"` — **verificar em discovery de task se esse componente existe** (categoria pode só ser criada inline no formulário de post; se for o caso, o `<select>`/input de "nova categoria" some pra `AUTHOR`) |

## 3. Fora de escopo

Ver `spec.md` § 4 — UI de gerenciar usuários, restrição de publish/archive, CRUD completo de categoria, moderação de comentário, workflow editorial completo (Fase 4).

## 4. Decisões arquiteturais

### 4.1 — `roleProcedure` como nova camada de guard (regra 11 — validada neste gate)

`createRouter.ts` hoje tem 3 camadas (`public` → `protected` → `verified`), cada uma um `.use()` sequencial. `roleProcedure(allowed: Role[])` seria uma 4ª camada, mas **parametrizada** (recebe a allowlist por call site) em vez de uma única camada fixa — porque diferentes procedures exigem papéis diferentes (`category.create` = `["ADMIN","EDITOR"]`, `user.updateRole` = `["ADMIN"]`). É consistente com o padrão existente (`.use()` sobre `verifiedProcedure`), não introduz mecanismo novo de composição — só parametriza o que já era fixo. Tratado como a decisão de regra 11 desta rodada, confirmada no gate consolidado (2026-07-12).

### 4.2 — Bypass de ownership fica no domain via helper, não no `roleProcedure`

Editar/deletar post exige "dono OU tem permissão de bypass" — uma decisão que depende do **dado** (quem é o dono do post), não só do papel do chamador. `roleProcedure` (allowlist pura de papel) não serve aqui — o guard de allowlist put fica só pra ações que **nunca** dependem de dono (`category.create`, `user.updateRole`). Post update/delete continuam em `verifiedProcedure` + o check condicional já existente no domain, estendido com `permissions.can(role, "post:editAny")` como segunda condição do `if`. Mantém a ownership-check no lugar onde ela já vive (domain, que já lê o post do banco) em vez de duplicar a leitura do post só pra decidir o guard antes da procedure rodar.

### 4.3 — `Role` é enum do Prisma no schema, mas `IRole` union literal hand-rolled no app (correção mid-flight, T005)

`docs/rubrics/enum-vs-union-vs-branded.md` diz "valor existe no DB → enum do ORM", mas o scan de T005 achou o precedente real do codebase: `IPostStatus` (`src/server/models/post.ts:4`) é um union literal (`"DRAFT" | "PUBLISHED" | "ARCHIVED"`) hand-rolled, não o tipo `PostStatus` importado de `@prisma/client` — e é reusado assim em toda a app, inclusive client-side (`post/mine/page.client.tsx`). Nenhum arquivo de `src/` fora de `infra/drivers/prisma.ts` e `test/prisma/` importa `@prisma/client` diretamente. Segue-se o precedente concreto do codebase em vez da rubrica genérica: `IRole = "ADMIN" | "EDITOR" | "AUTHOR"` definido em `src/server/models/user.ts` (mesma casa de `IUserEntity`), reexportado e importado onde precisar — schema Prisma continua com `enum Role` (persistência), app usa `IRole` (mesmo padrão de `PostStatus`/`IPostStatus`).

### 4.4 — `user.updateRole` sem UI nesta rodada, mas com procedure + teste

A matriz da Fase 3 lista "Gerenciar usuários: Admin Sim" como permissão. Sem essa operação existir nem no backend, a promoção de `codorkman@gmail.com` feita na migration seria a única forma de qualquer usuário nesta base ter um papel != `AUTHOR` — futuro-hostil (qualquer novo colaborador ficaria travado em `AUTHOR` pra sempre, sem caminho). Adiciona-se a procedure (testada) sem a UI (fora de escopo explícito, `spec.md` § 4) — o botão vem numa rodada futura sem exigir mudança de contrato.

## 5. Contratos

- `post.update`, `post.delete`: input não muda no client (continuam `{ id, ... }`); `userId`/`role` continuam resolvidos server-side de `ctx.user`, nunca do body — sem breaking change de client.
- `post.readOwn`: sem mudança de contrato (input/output); o comportamento muda (site-wide pra Admin/Editor), documentado como parte do critério de sucesso, não como breaking change de schema.
- `category.create`: sem mudança de schema; passa a rejeitar `AUTHOR` com `FORBIDDEN` (antes aceitava qualquer verificado) — breaking change de **comportamento**, intencional, coberto por teste de regressão.
- `user.login`, `user.register`, `auth.readUserFromSession`, `auth.resetPassword`: output ganha `user.role` (campo novo, aditivo — não quebra client existente que ignora campos extras).
- **NOVO** `user.updateRole`: `{ userId: string, role: "ADMIN"|"EDITOR"|"AUTHOR" }` → `{ id, role }`. Admin-only.

## 6. Riscos

- **Esquecer de propagar `role` no pick explícito de `readUserAndSessionByAccessToken.ts`** — já é um bug conhecido de outra função similar (o próprio arquivo faz pick manual de campos, não spread). Task dedicada com teste que falha se `ctx.user.role` vier `undefined` numa sessão válida.
- **`readOwnPosts(userId: string | null, ...)`** muda uma assinatura de model consumida só por `domain_readOwnPosts` hoje (confirmado por scan) — sem outros call sites a quebrar, mas checar `tsc --noEmit` cobre qualquer um esquecido.
- **Categoria: formulário de criação pode não ser uma tela dedicada** (categoria pode ser criada inline no form de post) — task de UI faz discovery pontual do componente real antes de esconder, em vez de assumir a existência de uma página `/category/create`.
- **Seed script** (`prisma/seed.ts`) provavelmente cria `ana/bruno/carla` sem `role` explícito — o `@default(AUTHOR)` do schema cobre isso automaticamente, sem precisar tocar no seed; verificar se algum teste de integração assume ausência de `role` no fixture (não deveria, mas checar ao rodar a suíte completa).

## 7. Validação contra invariantes (regras duras)

- Regra 1 (teste): matriz de permissões (12 combinações), guard `roleProcedure` (aceita/rejeita por papel), bypass de ownership em post update/delete (Admin edita alheio, Author não), `category.create` rejeita Author, `user.updateRole` aceita só Admin, `readOwnPosts` site-wide vs escopado.
- Regra 2 (zero `any`/`unknown`): `Action` como union literal fechada, `Role` importado do Prisma client — sem `any` no helper novo.
- Regra 4 (`tsc --noEmit`): checar a cada task — mudança de assinatura em `readOwnPosts` e adição de campo em `IUserEntity`/schemas Zod tocam vários call sites.
- Regra 5 (nome específico): `src/lib/permissions/` — nome de domínio, não genérico.
- Regra 6 (≤300 linhas): `createRouter.ts` ganha ~10-15 linhas (`roleProcedure`); nenhum arquivo tocado se aproxima do limite.
- Regra 11 (mudança arquitetural): `roleProcedure` é a peça nova desta rodada — validada no gate consolidado (§ 4.1), não decidida em silêncio.
- Regra 13 (segredos): sem token/segredo novo nesta feature.
- Regra 15 (Domain ≠ Transport): domain de post já lança `TRPCError` direto hoje (débito forward-only conhecido, `afm.md` § 3.1) — esta feature estende o mesmo padrão existente nesses arquivos, não expande a violação pra arquivos novos limpos (`updateRole.ts` também segue o padrão majoritário atual, por consistência local, mesma decisão consciente de `001-auth-hardening` § 4.5).
- Regra 16 (validação no boundary): `role` em `updateUserRoleSchema` usa `z.enum(["ADMIN","EDITOR","AUTHOR"])` no schema.ts da feature; domain recebe o valor já validado.

## 8. Dependências

`012-my-posts-panel` (done) — painel que ganha o filtro site-wide. `011-post-status-preview` (done) — comportamento de auto-publicação do Author, preservado (`spec.md` § 4). Nenhuma dependência externa nova.

## 9. Gate desta sessão

Resolvido no gate consolidado (2026-07-12): escopo aprovado, "executa até o fim". `roleProcedure` (§ 4.1, regra 11) já validado nesse mesmo gate — sem pergunta adicional pendente.
