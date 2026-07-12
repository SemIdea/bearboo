# Feature 004 — Plan

> **Spec:** [`./spec.md`](./spec.md)
> **Status do plan:** approved e implementado (2026-07-12)
> **Stack inferido:** Next.js 15 App Router + tRPC v11 + Prisma 6 + Zod (`docs/ach.md` § 1) — sem stack nova.
> **Data:** 2026-07-12

## 1. Approach em 3 frases

`Post` ganha um campo `status PostStatus @default(PUBLISHED)` no schema Prisma (enum `DRAFT`/`PUBLISHED`/`ARCHIVED`, migration nova). As leituras públicas (`PostModel.readRecents`, `PostModel.readUserPosts`) filtram `status: "PUBLISHED"` na própria query; `PostModel.readBySlug` continua sem filtro (usado também na checagem de unicidade de slug), e é `domain_readPostBySlug` quem trata um post não-`PUBLISHED` como `NOT_FOUND`. `createPostSchema`/`updatePostSchema` ganham `status` opcional, com o domain de criação decidindo o default (`PUBLISHED`) explicitamente em vez de depender do default do banco — zero mudança de frontend.

## 2. Componentes afetados

| Componente-tipo | Arquivo / módulo | Novo ou edita | Por quê |
| --- | --- | --- | --- |
| Schema (Prisma) | `prisma/schema.prisma` | edita | novo `enum PostStatus` + campo `status` em `Post`, com migration |
| Model | `src/server/models/post.ts` | edita | `IPostEntity` ganha `status`; `readRecents`/`readUserPosts` filtram `where: { status: "PUBLISHED" }` |
| Schema (Zod) | `src/server/features/post/schema.ts` | edita | novo `postStatusSchema`; `postEntitySchema` ganha `status`; `createPostSchema`/`updatePostSchema` ganham `status` opcional |
| Domain-like | `src/server/features/post/domain/create.ts` | edita | resolve `status: input.status ?? "PUBLISHED"` antes de chamar `repositories.post.create` |
| Domain-like | `src/server/features/post/domain/update.ts` | edita | repassa `status: input.status` pro `repositories.post.update` |
| Domain-like | `src/server/features/post/domain/readBySlug.ts` | edita | trata post com `status !== "PUBLISHED"` como `NOT_FOUND` (mesmo erro de slug inexistente) |
| Test helper | `src/test/context/testContext.ts` | edita | `createPost` ganha override opcional de `status` (default `PUBLISHED`), pra testes construírem fixtures `DRAFT`/`ARCHIVED` |
| Test | `src/server/models/__test__/prismaModels.ts` | edita | assert do filtro `status: "PUBLISHED"` em `readRecents`/`readUserPosts` |
| Test | `src/server/features/post/procedures/__test__/create.ts` | edita | status default `PUBLISHED` quando omitido; status explícito respeitado |
| Test | `src/server/features/post/procedures/__test__/update.ts` | edita | dono consegue mudar status do próprio post |
| Test | `src/server/features/post/procedures/__test__/readBySlug.ts` | edita | post `DRAFT`/`ARCHIVED` por slug retorna `NOT_FOUND` |
| Test | `src/server/features/post/procedures/__test__/readRecent.ts` | edita | posts não-`PUBLISHED` não aparecem na listagem paginada |
| Test | `src/server/features/user/procedures/__test__/readPosts.ts` | edita | posts não-`PUBLISHED` não aparecem na lista pública de um autor |

## 3. Modelo de dados (delta)

```prisma
enum PostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

model Post {
  // ...campos existentes
  status PostStatus @default(PUBLISHED)
}
```

Migration nova (`npx prisma migrate dev --name add_post_status`). Default `PUBLISHED` no schema serve de rede de segurança pra dado inserido fora da aplicação (ex.: seed, migração manual) — a aplicação em si nunca depende desse default implícito (ver § 4).

## 4. Decisões arquiteturais

- **Decisão:** enum simples de 3 estados (`DRAFT`/`PUBLISHED`/`ARCHIVED`), igual ao exemplo já na Fase 1 do roadmap. **Alternativa rejeitada:** o enum de 5 estados da Fase 4 (`+ IN_REVIEW, SCHEDULED`). **Por quê:** a Fase 4 depende de `UserRole` (Fase 3) e de modelos novos (`PostRevision`, `PostReviewComment`) que não existem — implementar o enum maior agora criaria estados (`IN_REVIEW`, `SCHEDULED`) sem nenhum fluxo capaz de os usar.
- **Decisão:** default `PUBLISHED` decidido explicitamente em `domain_createPost` (`input.status ?? "PUBLISHED"`), não confiado ao `@default` do Prisma. **Alternativa rejeitada:** deixar o banco aplicar o default sozinho (omitir `status` da chamada de `create` quando não informado). **Por quê:** mesmo padrão já usado pra `id`/`slug` em `domain_createPost` (o domain decide, não implicitamente o driver) — deixa a política de default testável e explícita no lugar certo (regra de negócio), e evita que outro caller do model (ex.: um script) receba um post sem status por engano, já que `IPrismaDelegate.create` exige o campo.
- **Decisão:** `PostModel.readBySlug` fica sem filtro de status; quem decide "não encontrado" pra post não-publicado é `domain_readPostBySlug`. **Alternativa rejeitada:** filtrar `status: "PUBLISHED"` dentro do próprio `readBySlug`. **Por quê:** `readBySlug` também é usado por `resolveAvailableSlug` (checagem de unicidade em `domain_createPost`), que precisa enxergar posts de qualquer status pra não permitir dois posts com o mesmo slug só porque um está em rascunho — filtrar no model quebraria essa checagem.
- **Decisão:** sem seletor de status na UI de criar/editar post nesta feature. **Alternativa rejeitada:** adicionar um `<select>` nos forms existentes. **Por quê:** diretriz vigente de foco em back-end (`docs/roadmap.md` § Nota de sequenciamento); a UI de rascunho/publicar é escopo explícito da Fase 2 (Admin/CMS), que ainda nem tem painel `/admin`. O campo já fica setável via `post.update` (API), suficiente pra fechar o critério de sucesso da spec sem tocar frontend.
- **Decisão:** sem gate de permissão por papel na mudança de status. **Alternativa rejeitada:** restringir "publicar"/"arquivar" a um papel Admin/Editor, como o roadmap da Fase 3 descreve. **Por quê:** `UserRole` não existe (Fase 3 não iniciada); a mutation `update` já restringe por dono (`post.userId === input.userId`), mesma regra que qualquer outro campo editável hoje.

## 5. Contratos (boundaries externos)

### Boundary `post.create` (tRPC mutation — input muda)

```ts
// input
{ title: string; content: string; status?: "DRAFT" | "PUBLISHED" | "ARCHIVED" }
// output (postEntitySchema) ganha `status` no shape de sempre
```

### Boundary `post.update` (tRPC mutation — input muda)

```ts
// input
{ id: string; title?: string; content?: string; status?: "DRAFT" | "PUBLISHED" | "ARCHIVED" }
```

### Boundary `post.readBySlug` / `post.readRecent` / `user.readPosts` (output muda de shape via `postEntitySchema`/`postEntityWithRelationsSchema`)

`status` passa a existir no post retornado; posts não-`PUBLISHED` somem de `readRecent`/`user.readPosts` e viram `NOT_FOUND` em `readBySlug`. Único consumidor de cada um hoje é o próprio frontend do projeto (`postFeed.tsx`, `post/[slug]/page.tsx`, página pública de autor) — nenhum muda de forma nesta feature, só passam a nunca receber um post não-publicado.

## 6. Complexity tracking

| Complexidade aceita | Alternativa simples rejeitada | Por quê não foi simples |
| --- | --- | --- |
| Domain decide o default de status em vez de confiar no `@default` do Prisma | Omitir `status` na chamada de `create` e deixar o banco aplicar o default | Manter a política de default testável e no mesmo lugar que já decide `id`/`slug`, em vez de espalhar a regra entre domain e schema |
| `readBySlug` sem filtro + checagem de status no domain (em vez de filtrar no model) | Filtrar `status: "PUBLISHED"` direto no `readBySlug` do model | Quebraria a checagem de unicidade de slug em `resolveAvailableSlug`, que precisa ver posts de qualquer status |

## 7. Validação contra invariantes

- [x] Regra 16 (validação no boundary) — `status` validado só no `.input()` de `create`/`update` (`schema.ts`); domain/model recebem o valor já resolvido, sem `z.*`.
- [x] Regra 30 (domain não importa Prisma) — nenhum domain importa `@prisma/client`; `PostStatus` como union de string literal (`"DRAFT" | "PUBLISHED" | "ARCHIVED"`) evita esse import mesmo no `schema.ts`/model.
- [x] Regra 15 forward-only — `domain/update.ts` e `domain/readBySlug.ts` já lançam `TRPCError` hoje (débito pré-existente, ver `afm.md` § 3.1); esta feature não piora nem melhora essa métrica, só adiciona lógica dentro do padrão já existente de cada arquivo.
- [x] Não é regra 11 (mudança arquitetural) — extensão de entidade/enum existente, mesmo padrão de model/domain/procedure já usado; nenhuma camada, diretório de 1ª classe ou contrato cross-módulo novo.
- [x] `[NEEDS CLARIFICATION:]` zerado — spec § 7 vazia.

## 8. Riscos

- **Esquecer um ponto de leitura pública e vazar post não-publicado.** Mitigação: `grep -rn "readRecents\|readUserPosts\|readBySlug" src/server` confirmado no discovery — só 3 pontos de leitura pública existem hoje (`readRecent`, `user.readPosts`, `readBySlug`), todos cobertos nesta feature; task de reconciliação re-confirma o grep depois da mudança.
- **`TestContext.createPost` quebrar testes existentes ao adicionar o override de status.** Mitigação: override é opcional com default `"PUBLISHED"` — chamadas existentes (sem passar `status`) continuam produzindo exatamente o mesmo post de antes.

## 9. Open questions

*(vazio.)*

---

*Plan NÃO contém: lista granular de tasks (vai pro `tasks.md`).*
