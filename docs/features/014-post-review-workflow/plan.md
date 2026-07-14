# Feature 014 — Plan

> **Spec:** [`./spec.md`](./spec.md)
> **Status:** done (implementado e verificado 2026-07-14, gate "Executa até o fim")

## 1. Resumo técnico

Três fios que fecham os critérios de sucesso da § 2 do spec:

1. **Status novos + regra de criação** — `PostStatus` ganha `IN_REVIEW`/`SCHEDULED`; `Post` ganha `scheduledAt DateTime?`. `domain_createPost` força `DRAFT` pra quem não tem `post:publish`; quem tem, mantém o default atual (`PUBLISHED`) e pode escolher outro status.
2. **Quatro ações de domínio novas** (`submitForReview`, `publish`, `reject`, `archive`), cada uma validando estado de origem + permissão antes de transicionar — mesmo padrão de `update`/`delete` (bypass de ownership via `ctx.helpers.permissions.can`), mas aqui a permissão nova (`post:publish`) não depende de dono nenhuma vez (todas as 4 ações passam pelo mesmo helper, só `submitForReview` também checa ownership). `publish` grava `PostReviewComment` (`APPROVAL`) se vier comentário; `reject` grava sempre (`REJECTION`, obrigatório no schema).
3. **Visibilidade lazy de `SCHEDULED`** — `PostModel.readRecents`/`readRelated`/`readUserPosts` trocam o filtro fixo `status: "PUBLISHED"` por `OR(status PUBLISHED, AND(status SCHEDULED, scheduledAt <= now))`; `domain_readPostBySlug` ganha a mesma condição (post virtualmente publicado) **e** um bypass de leitura pra quem tem `post:publish` (revisor vê rascunho/em-revisão de qualquer um, não só o próprio).

## 2. Componentes afetados

| Componente | Mudança |
| --- | --- |
| `prisma/schema.prisma` | `enum PostStatus` ganha `IN_REVIEW`, `SCHEDULED`; `Post` ganha `scheduledAt DateTime?`; **NOVO** `enum ReviewCommentType { APPROVAL REJECTION }`; **NOVO** `model PostReviewComment { id, postId, post relation, reviewerId, reviewer relation(User), type ReviewCommentType, content String?, createdAt }` |
| **NOVA migration** `prisma/migrations/<ts>_add_post_review_workflow/migration.sql` | `ALTER TYPE "PostStatus" ADD VALUE ...` (x2), `ALTER TABLE "Post" ADD COLUMN "scheduledAt" TIMESTAMP(3)`, `CREATE TYPE "ReviewCommentType"`, `CREATE TABLE "PostReviewComment"` com FKs pra `Post`/`User` |
| `src/server/models/post.ts` (`IPostStatus`) | union literal ganha `"IN_REVIEW" \| "SCHEDULED"`; `IPostEntity` ganha `scheduledAt: Date \| null` |
| `src/server/models/post.ts` (`readRecents`, `readRelated`, `readUserPosts`) | filtro de visibilidade pública troca `status: "PUBLISHED"` por `OR: [{ status: "PUBLISHED" }, { status: "SCHEDULED", scheduledAt: { lte: new Date() } }]` |
| `src/server/models/post.ts` (`readBySlug`) | sem mudança de assinatura — a decisão de visibilidade continua no domain (mesmo padrão atual) |
| **NOVO** `src/server/models/reviewComment.ts` | `IReviewCommentEntity`, `IReviewCommentType`; `ReviewCommentModel extends BaseModel<IReviewCommentEntity>` + `readAllByPostId(postId): Promise<IReviewCommentEntityWithReviewer[]>` (include reviewer `{id,name}`) |
| `src/server/infra/container/repositories.ts` | registra `reviewComment: ReviewCommentModel` em `IRepositories` |
| `src/lib/permissions/adapter.ts` (`IPermissionAction`) | ganha `"post:publish"` |
| `src/lib/permissions/implementations/matrix.ts` | `"post:publish": ["ADMIN", "EDITOR"]` |
| `src/lib/permissions/__test__/matrix.ts` | cobre a ação nova × 3 papéis |
| `src/shared/error/post.ts` | ganha `POST_INVALID_STATUS_TRANSITION` (+ mensagem) |
| `src/server/features/post/schema.ts` (`postStatusSchema`) | ganha `IN_REVIEW`, `SCHEDULED` |
| `src/server/features/post/schema.ts` (`updatePostSchema`) | **remove** `status` — transições de status passam a ser exclusivas das ações novas (fecha o furo que deixava Author mudar status via `update` livremente) |
| `src/server/features/post/schema.ts` | **NOVO** `submitForReviewPostSchema { id }`, `publishPostSchema { id, scheduledAt?: coerce.date, comment?: string }`, `rejectPostSchema { id, comment: string.min(1) }`, `archivePostSchema { id }`, `readReviewCommentsSchema { postId }`; outputs reusando `postEntitySchema` pras 4 ações + `reviewCommentsOutputSchema` (array) |
| **NOVO** `src/server/features/post/domain/submitForReview.ts` (`domain_submitForReviewPost`) | lê post, exige `post.userId === input.userId` (dono) e `post.status === "DRAFT"`, senão erro; atualiza pra `IN_REVIEW` |
| **NOVO** `src/server/features/post/domain/publish.ts` (`domain_publishPost`) | exige `permissions.can(role, "post:publish")`; exige `status ∈ {DRAFT, IN_REVIEW}`; calcula status alvo (`SCHEDULED` se `scheduledAt` futuro, senão `PUBLISHED`) + grava `scheduledAt`; se veio de `IN_REVIEW` e `comment`, cria `PostReviewComment` tipo `APPROVAL` |
| **NOVO** `src/server/features/post/domain/reject.ts` (`domain_rejectPost`) | exige `permissions.can(role, "post:publish")`; exige `status === "IN_REVIEW"`; volta pra `DRAFT`; sempre cria `PostReviewComment` tipo `REJECTION` com `comment` |
| **NOVO** `src/server/features/post/domain/archive.ts` (`domain_archivePost`) | exige `permissions.can(role, "post:publish")`; exige `status !== "ARCHIVED"`; atualiza pra `ARCHIVED` |
| **NOVO** `src/server/features/post/domain/readReviewComments.ts` (`domain_readReviewComments`) | lê post; exige dono OU `permissions.can(role, "post:publish")`; retorna `reviewComment.readAllByPostId(postId)` |
| `src/server/features/post/domain/create.ts` | `status = permissions.can(role, "post:publish") ? (input.status ?? "PUBLISHED") : "DRAFT"` (ignora `input.status` se o papel não tiver a permissão) |
| `src/server/features/post/domain/update.ts` | remove `status` do objeto passado pro repository (schema já não manda mais) |
| `src/server/features/post/domain/readBySlug.ts` | visível se `status === "PUBLISHED"` OU (`status === "SCHEDULED"` e `scheduledAt <= now`) OU dono OU `permissions.can(role, "post:publish")` — precisa de `role?: IRole` no `DomainInput` (opcional, leitura pública não autenticada continua funcionando) |
| **NOVO** `src/server/features/post/procedures/submitForReview.ts`, `publish.ts`, `reject.ts`, `archive.ts`, `readReviewComments.ts` | `verifiedProcedure` (não `roleProcedure` — a checagem de permissão depende de ownership em `submitForReview`/`readReviewComments`, mesma decisão arquitetural de `013` § 4.2); passam `role: ctx.user.role` (+ `userId` onde aplicável) pro domain |
| `src/server/features/post/procedures/create.ts` | passa `role: ctx.user.role` pro domain |
| `src/server/features/post/procedures/readBySlug.ts` | passa `role: ctx.user?.role` (leitura pública é `publicProcedure`, `ctx.user` pode não existir) |
| `src/server/features/post/index.ts` | registra as 5 procedures novas no `PostRouter` |
| `src/app/(half)/post/edit/[id]/page.client.tsx` | remove o `<select>` de status bruto do `updatePostSchema` (campo não existe mais); adiciona botões de ação condicionais por papel/status (Submit for review pro dono em `DRAFT`; Publish/Reject/Archive pra quem tem `post:publish` — reusa `session.user.role` já exposto por `013`) + lista os `PostReviewComment` do post (motivo de rejeição visível pro dono) |
| `src/app/(half)/post/mine/page.client.tsx` | filtro de status ganha `IN_REVIEW`/`SCHEDULED` nas opções do `<select>` |

## 3. Fora de escopo

Ver `spec.md` § 4 — `PostRevision`/histórico de diffs, scheduler/job real, dashboard de revisão dedicado, notificação por email, edição de comentário de revisão.

## 4. Decisões arquiteturais

### 4.1 — `SCHEDULED` via checagem lazy, sem componente de scheduler novo

`afm.md` § 3 regra 12 registra que o projeto não tem nenhum componente Task-like hoje, e que introduzir um promove a regra dura de idempotência. Em vez de um job que flipa `status: SCHEDULED → PUBLISHED` no banco numa data futura, a visibilidade pública é computada na query (`scheduledAt <= now`) — o critério de sucesso do spec ("post agendado aparece quando a data chega") é satisfeito sem escrever no banco em background. Trade-off aceito: o campo `status` no banco continua `SCHEDULED` até a próxima escrita naquele post (não é auto-corrigido), mas isso é invisível pro usuário público, que só vê o resultado da query. Documentado como decisão consciente, não bug — evita cruzar regra 11 (novo componente de 1ª classe) nesta rodada.

### 4.2 — `publish`/`reject`/`archive` ficam em `verifiedProcedure`, não em `roleProcedure`

Mesma lógica de `013` § 4.2: a checagem de permissão (`post:publish`) não depende de dono pra essas 3 ações (sempre Admin/Editor, em post de qualquer um), então em tese caberia `roleProcedure(["ADMIN","EDITOR"])`. Mas `readReviewComments` (dono OU revisor) e `submitForReview` (só dono) do mesmo grupo de procedures **dependem** de dado, então ficam em `verifiedProcedure` por consistência — evita 2 camadas de guard diferentes na mesma feature pra ações irmãs, e o custo (`permissions.can` chamado no domain em vez de no guard) é o mesmo já pago por `update`/`delete`.

### 4.3 — `updatePostSchema` perde o campo `status`

Hoje `post.update` aceita `status` livre pra qualquer dono (o buraco que deixava Author se auto-publicar/arquivar, que `013` conscientemente preservou). Com as 4 ações novas cobrindo toda transição válida, manter `status` em `update` duplicaria a superfície de validação (2 caminhos pra mudar status, um com regra de state machine e outro sem) — removido. Frontend (`edit/[id]/page.client.tsx`) troca o `<select>` de status por botões de ação, que já é o formulário certo pra uma state machine (cada botão só aparece quando a transição é válida pro estado atual + papel do usuário).

### 4.4 — `PostReviewComment` é uma entidade própria, não um campo em `Post`

Cada ação de aprovação/rejeição pode gerar um comentário (histórico leve de "quem disse o quê, quando") — um campo único (`Post.reviewNote`) sobrescreveria o anterior a cada rejeição/aprovação repetida (um post pode ser rejeitado, corrigido, reenviado, rejeitado de novo). Model + tabela própria, mesmo padrão de `Comment` (post) já existente no schema.

## 5. Contratos

- `post.create`: input não muda de schema; `status` continua opcional, mas o comportamento passa a depender do papel do chamador (documentado como mudança de comportamento intencional, não breaking change de schema).
- `post.update`: **breaking change de schema** — `status` sai do input. Nenhuma UI própria manda esse campo depois desta rodada (só o form de edição manda hoje, ajustado na mesma rodada).
- **NOVO** `post.submitForReview`: `{ id }` → post atualizado. Dono-only.
- **NOVO** `post.publish`: `{ id, scheduledAt?, comment? }` → post atualizado. `post:publish`-only.
- **NOVO** `post.reject`: `{ id, comment }` → post atualizado. `post:publish`-only, `comment` obrigatório.
- **NOVO** `post.archive`: `{ id }` → post atualizado. `post:publish`-only.
- **NOVO** `post.readReviewComments`: `{ postId }` → lista de comentários. Dono OU `post:publish`.
- `post.readRecent`, `post.readRelated`, `user.readPosts`: sem mudança de schema; passam a incluir posts `SCHEDULED` com data já passada (mudança de comportamento, coberta por teste).
- `post.readBySlug`: sem mudança de schema de input/output; visibilidade estendida (agendado passado + bypass de revisor).

## 6. Riscos

- **Teste existente `"Should default to PUBLISHED status when none is provided"`** (`post/procedures/__test__/create.ts`) quebra de propósito — o contexto de teste padrão é `AUTHOR` (`createAuthenticatedContext()`), que agora força `DRAFT`. Ajustar esse teste (mover a asserção de "default PUBLISHED" pra um contexto `ADMIN`/`EDITOR`, e adicionar um teste novo "Author sem status vira DRAFT") é uma task explícita, não uma regressão.
- **`readOwnPosts`/painel `/post/mine`** já filtra por `status` livre (qualquer enum member) — `IN_REVIEW`/`SCHEDULED` passam a ser valores válidos no filtro sem mudança de código, só checar que o `<select>` do frontend lista as opções novas.
- **`domain_readPostBySlug` ganha um `role?` opcional no `DomainInput`** — checar todo call site (só a procedure pública, que hoje já passa `callerId?`); leitura anônima (sem sessão) continua funcionando com `role: undefined` (bypass de revisor só se aplica se `role` existir).
- **Migration de enum do Postgres** (`ALTER TYPE ... ADD VALUE`) não pode rodar dentro da mesma transação que outros comandos que usam o valor novo — mesma pegadinha já resolvida em `013` (`prisma migrate dev` gera isso corretamente sozinho; só checar se o Prisma precisa de 2 migrations separadas ao rodar `migrate dev` interativo).

## 7. Validação contra invariantes (regras duras)

- Regra 1 (teste): as 4 novas ações de domínio (transição válida/inválida, permissão ok/rejeitada), visibilidade lazy de `SCHEDULED` (passado aparece, futuro não), bypass de leitura pra revisor, `create` força `DRAFT` pra Author.
- Regra 2 (zero `any`/`unknown`): `IReviewCommentType`/`IPermissionAction` como union literal fechada.
- Regra 4 (`tsc --noEmit`): checar a cada task — `IPostStatus`/`IPostEntity` mudam de shape, tocam vários call sites (mesma classe de risco de `013`).
- Regra 5 (nome específico): `src/server/models/reviewComment.ts`, `src/server/features/post/domain/{submitForReview,publish,reject,archive,readReviewComments}.ts` — nomes de domínio.
- Regra 6 (≤300 linhas): nenhum arquivo tocado se aproxima do limite (feature nova segue o padrão de arquivo-por-ação já estabelecido).
- Regra 7 (domain-like exporta 1 função): cada arquivo novo de `domain/` exporta só `domain_<action>`.
- Regra 11 (mudança arquitetural): decisão de **não** introduzir scheduler (§ 4.1) e de não duplicar guard (§ 4.2) validadas no gate consolidado desta rodada — sem componente de 1ª classe novo.
- Regra 13 (segredos): sem token/segredo novo.
- Regra 15 (Domain ≠ Transport): domain novo desta feature segue o padrão majoritário já existente em `post/domain/*` (lança `TRPCError` direto) — mesma decisão consciente de `013` § 7 (consistência local com o débito forward-only já documentado, não expande pra um domínio limpo).
- Regra 16 (validação no boundary): `scheduledAt`/`comment` validados em `schema.ts` (`z.coerce.date()`, `z.string().min(1)`); domain recebe já validado.

## 8. Dependências

`013-role-based-permissions` (done) — `IRole`, `roleProcedure`, `src/lib/permissions/`, bypass de ownership em post update/delete (mesmo padrão estendido aqui). Nenhuma dependência externa nova.

## 9. Gate desta sessão

Resolvido no gate consolidado (2026-07-14): escopo aprovado via discovery batched (§ 7 do spec) — workflow de revisão + agendamento lazy, sem `PostRevision`. Decisões de regra 11 (§ 4.1, § 4.2 deste plano) tratadas como parte do mesmo gate, sem pergunta adicional pendente. Autonomia: `AUTONOMY=normal` (user respondeu a pergunta batched, não disse "go") — segue pro resumo consolidado + confirmação de execução antes de gerar tasks.
