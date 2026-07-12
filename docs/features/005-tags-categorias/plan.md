# Feature 005 — Plan

> **Spec:** [`./spec.md`](./spec.md)
> **Status do plan:** approved e implementado (2026-07-12)
> **Stack inferido:** Next.js 15 App Router + tRPC v11 + Prisma 6 + Zod (`docs/ach.md` § 1) — sem stack nova.
> **Data:** 2026-07-12

## 1. Approach em 3 frases

`Category` (N:1 com `Post` via `Post.categoryId?`) e `Tag` (N:N com `Post` via tabela de junção explícita `PostTag`, no mesmo estilo de todo relacionamento hoje no schema) entram como dois entidades novas, cada uma com feature própria (`category`, `tag`) seguindo exatamente o shape já usado por `comment`/`post` (schema.ts + domain/ + procedures/ + index.ts): só `create` (idempotente por `name`) e `readAll`. `post.create`/`post.update` ganham `categoryId?`/`tagIds?` opcionais que referenciam entidades já existentes por ID (mesmo padrão de `comment.create` referenciando `postId`); `post.readRecent` ganha `categoryId?`/`tagId?` opcionais pra filtrar a listagem paginada, e `post.readBySlug` passa a incluir categoria/tags do post lido. Zero UI nova.

## 2. Componentes afetados

| Componente-tipo | Arquivo / módulo | Novo ou edita | Por quê |
| --- | --- | --- | --- |
| Schema (Prisma) | `prisma/schema.prisma` | edita | `model Category`, `model Tag`, `model PostTag` novos; `Post` ganha `categoryId String?` + relations `category`/`postTags` |
| Model | `src/server/models/category.ts` | novo | `CategoryModel` (`BaseModel<ICategoryEntity>` + `readByName`, `readAll`) |
| Model | `src/server/models/tag.ts` | novo | `TagModel` (`BaseModel<ITagEntity>` + `readByName`, `readAll`) |
| Model | `src/server/models/post.ts` | edita | `IPostEntity.categoryId`; `IPostEntityWithRelations`/novo `IPostEntityWithTaxonomy` ganham `category`/`tags`; `readRecents` ganha filtro `categoryId`/`tagId` + include; `readBySlug` ganha include; novo método `setTags(postId, tagIds)` |
| Composition root | `src/server/infra/container/repositories.ts` | edita | registra `category`/`tag` no `IRepositories` |
| Schema (Zod) | `src/server/features/category/schema.ts` | novo | `createCategorySchema`, `categoryEntitySchema`, outputs |
| Domain-like | `src/server/features/category/domain/create.ts` | novo | find-or-create por `name` |
| Domain-like | `src/server/features/category/domain/readAll.ts` | novo | lista todas |
| Procedure | `src/server/features/category/procedures/create.ts` | novo | `verifiedProcedure` |
| Procedure | `src/server/features/category/procedures/readAll.ts` | novo | `publicProcedure` |
| Procedure-like | `src/server/features/category/index.ts` | novo | `CategoryRouter` |
| Schema (Zod) | `src/server/features/tag/schema.ts` | novo | espelha `category/schema.ts` |
| Domain-like | `src/server/features/tag/domain/create.ts` | novo | find-or-create por `name` |
| Domain-like | `src/server/features/tag/domain/readAll.ts` | novo | lista todas |
| Procedure | `src/server/features/tag/procedures/create.ts` | novo | `verifiedProcedure` |
| Procedure | `src/server/features/tag/procedures/readAll.ts` | novo | `publicProcedure` |
| Procedure-like | `src/server/features/tag/index.ts` | novo | `TagRouter` |
| Procedure-like | `src/server/routers/app.routes.ts` | edita | registra `category`/`tag` no `appRouter` |
| Schema (Zod) | `src/server/features/post/schema.ts` | edita | `createPostSchema`/`updatePostSchema` ganham `categoryId?`/`tagIds?`; `postEntitySchema` ganha `categoryId`; `postEntityWithRelationsSchema` ganha `category`/`tags`; novo `postEntityWithTaxonomySchema` (post + category + tags, sem user/comments) pro output de `readBySlug`; `readRecentPostsSchema` ganha `categoryId?`/`tagId?` |
| Domain-like | `src/server/features/post/domain/create.ts` | edita | passa `categoryId` no `create`; se `tagIds` não vazio, chama `setTags` depois |
| Domain-like | `src/server/features/post/domain/update.ts` | edita | passa `categoryId` no `update`; se `tagIds` presente (incl. vazio), chama `setTags` (substituição) |
| Domain-like | `src/server/features/post/domain/readRecent.ts` | edita | repassa `categoryId`/`tagId` pro `readRecents` |
| Domain-like | `src/server/features/post/domain/readBySlug.ts` | edita | tipo de retorno passa a `IPostEntityWithTaxonomy` (checagem de status inalterada) |
| Test helper | `src/test/context/testContext.ts` | edita | `createPost` ganha overrides `categoryId`/tags via `setTags`; novos `createCategory`/`createTag` |
| Test helper | `src/test/context/types.ts` | edita | espelha as assinaturas novas (lição da feature 004 — os dois arquivos duplicam o mesmo shape) |
| Test | `src/server/models/__test__/prismaModels.ts` | edita | novos casos pra `CategoryModel`/`TagModel`/`PostModel.setTags`/filtro em `readRecents` |
| Test | `src/server/features/category/procedures/__test__/create.ts` | novo | idempotência por nome |
| Test | `src/server/features/category/procedures/__test__/readAll.ts` | novo | lista todas |
| Test | `src/server/features/tag/procedures/__test__/create.ts` | novo | idempotência por nome |
| Test | `src/server/features/tag/procedures/__test__/readAll.ts` | novo | lista todas |
| Test | `src/server/features/post/procedures/__test__/create.ts` | edita | post com categoryId/tagIds; post sem nenhum dos dois continua igual |
| Test | `src/server/features/post/procedures/__test__/update.ts` | edita | dono troca tags (substituição) e categoria |
| Test | `src/server/features/post/procedures/__test__/readRecent.ts` | edita | filtro por categoryId/tagId |
| Test | `src/server/features/post/procedures/__test__/readBySlug.ts` | edita | retorno inclui categoria/tags |

## 3. Modelo de dados (delta)

```prisma
model Category {
  id    String @id
  name  String @unique
  slug  String @unique
  posts Post[]
}

model Tag {
  id       String    @id
  name     String    @unique
  slug     String    @unique
  postTags PostTag[]
}

model PostTag {
  postId String
  post   Post   @relation(fields: [postId], references: [id])
  tagId  String
  tag    Tag    @relation(fields: [tagId], references: [id])

  @@id([postId, tagId])
}

model Post {
  // ...campos existentes
  categoryId String?
  category   Category? @relation(fields: [categoryId], references: [id])
  postTags   PostTag[]
}
```

Migration nova (`npx prisma migrate dev --name add_tags_categories`). `Category`/`Tag` sem `createdAt`/`updatedAt` — mesma economia já aceita em `VerificationToken`/`ResetToken` (entidade sem necessidade observada de auditoria de timestamp).

## 4. Decisões arquiteturais

- **Decisão:** categoria é `Post.categoryId?` (N:1); tag é N:N via `PostTag` explícito. **Alternativa rejeitada:** `PostCategory` também N:N (post com várias categorias). **Por quê:** `docs/roadmap.md` § Fase 1 "Modelos principais" já nomeia `PostTag` mas não `PostCategory` — sinal direto de que só tag precisa de tabela de junção.
- **Decisão:** `category.create`/`tag.create` são idempotentes por `name` (encontra e retorna a existente em vez de erro/duplicata). **Alternativa rejeitada:** deixar o `@unique` do Prisma estourar e propagar erro cru. **Por quê:** nome de categoria/tag é um campo pequeno e previsível (ao contrário de título de post, que tolera duplicata com sufixo de slug); idempotência evita que um segundo autor tentando usar "Backend" tome um erro só porque outro post já criou essa tag — reduz fricção sem exigir UI de autocomplete.
- **Decisão:** `categoryId`/`tagIds` no `post.create`/`post.update` referenciam entidades já existentes por ID; nenhuma criação implícita a partir de texto livre. **Alternativa rejeitada:** aceitar `categoryName`/`tagNames: string[]` e criar on-the-fly dentro do `domain_createPost`. **Por quê:** mesmo padrão já usado por `comment.create` (recebe `postId` de um post que já existe, nunca cria o post junto) — mantém cada domain com uma responsabilidade (regra dura 7); criação implícita fica natural pra quando existir um componente de UI com autocomplete que decida quando criar vs reusar.
- **Decisão:** sem pré-validação de existência de `categoryId`/`tagIds` no domain (deixa o Prisma FK rejeitar se o ID não existir). **Alternativa rejeitada:** `ctx.repositories.category.read(categoryId)` antes de criar/atualizar o post, lançando `NOT_FOUND` de domínio se ausente. **Por quê:** é o mesmo débito já aceito em `comment/domain/create.ts` (não valida `postId`) — esta feature não piora nem resolve essa lacuna (regra 15 forward-only); tratar aqui exigiria decidir um padrão novo de validação cross-entidade que not é o escopo desta feature.
- **Decisão:** `update` com `tagIds` faz **substituição completa** (deleta as `PostTag` existentes do post, insere as novas), não soma. **Alternativa rejeitada:** endpoints separados `addTag`/`removeTag`. **Por quê:** espelha a cenário do spec ("dono troca as tags") e o formulário mental de "isso é a lista atual de tags" é mais simples pra uma futura UI de seletor múltiplo (envia a lista inteira) do que gerenciar adições/remoções incrementais — menos superfície de API pra uma primeira versão.
- **Decisão:** `category`/`tag` só têm `create`+`readAll` nesta feature (sem `update`/`delete`). **Alternativa rejeitada:** CRUD completo, espelhando `comment`. **Por quê:** YAGNI — nada no roadmap ainda pede editar/apagar uma categoria/tag (isso é tarefa de admin, Fase 2, que nem tem painel ainda); adicionar os dois verbos é aditivo e não quebra nada quando for necessário.
- **Decisão:** filtro `categoryId`/`tagId` entra só em `post.readRecent` (a listagem paginada da home), não em `user.readPosts`. **Alternativa rejeitada:** adicionar o mesmo filtro em `user.readPosts`. **Por quê:** o critério de conclusão da Fase 1 fala de "navegar por tags/categorias" no contexto do blog público (a home), que é `readRecent`; estender a listagem de um autor é aditivo, fora do que o critério pede agora.
- **Decisão:** sem gate de permissão por papel em `category.create`/`tag.create` — qualquer usuário verificado pode criar. **Alternativa rejeitada:** restringir a um papel Admin/Editor. **Por quê:** mesmo raciocínio já registrado em `docs/features/004-post-status/plan.md` § 4 — `UserRole` não existe (Fase 3 não iniciada).

## 5. Contratos (boundaries externos)

### Boundary `category.create` / `tag.create` (tRPC mutation, novo)

```ts
// input
{ name: string }
// output
{ id: string; name: string; slug: string }
```

### Boundary `category.readAll` / `tag.readAll` (tRPC query, novo)

```ts
// input: nenhum
// output
{ id: string; name: string; slug: string }[]
```

### Boundary `post.create` / `post.update` (tRPC mutation — input muda)

```ts
// input ganha, ambos opcionais
{ categoryId?: string; tagIds?: string[] }
```

### Boundary `post.readRecent` (tRPC query — input muda)

```ts
// input ganha, ambos opcionais
{ categoryId?: string; tagId?: string }
// output (postEntityWithRelationsSchema) ganha
{ category: { id: string; name: string; slug: string } | null; tags: { id: string; name: string; slug: string }[] }
```

### Boundary `post.readBySlug` (tRPC query — output muda de shape)

```ts
// output passa de postEntitySchema pra postEntityWithTaxonomySchema
// (post + categoryId já existente em postEntitySchema, + category/tags novos — SEM user/comments,
// que continuam fora do escopo desta feature)
{ category: { id: string; name: string; slug: string } | null; tags: { id: string; name: string; slug: string }[] }
```

Único consumidor de cada boundary hoje é o próprio frontend do projeto — nenhuma tela lê os campos novos ainda (zero UI nesta feature), então a mudança de shape é aditiva e não quebra nada existente.

## 6. Complexity tracking

| Complexidade aceita | Alternativa simples rejeitada | Por quê não foi simples |
| --- | --- | --- |
| Duas features novas inteiras (`category`, `tag`) em vez de esconder tag/categoria dentro da feature `post` | Colocar tudo em `post/domain/`, sem router próprio | Cada entidade do `prisma/schema.prisma` já ganha sua própria feature no código hoje (`comment`, `user`, `auth`) — inconsistente criar `Category`/`Tag` como exceção |
| `readBySlug` ganha um schema de output novo (`postEntityWithTaxonomySchema`) em vez de reusar `postEntityWithRelationsSchema` | Migrar `readBySlug` inteiro pra `postEntityWithRelationsSchema` (ganhando também `user`/`comments`) | Adicionar `user`/`comments` no `readBySlug` é uma mudança fora do pedido desta feature (regra 15 forward-only) — só a taxonomia é o que foi pedido |

## 7. Validação contra invariantes

- [x] Regra 16 (validação no boundary) — `categoryId`/`tagIds`/`name` validados só nos `.input()` de `create`/`update`/`readRecent` (`schema.ts`); domain/model recebem valor já resolvido.
- [x] Regra 30 (domain não importa Prisma) — `IPostDelegate`/models continuam a única camada com `@prisma/client`/driver.
- [x] Regra 7 (domain-like exporta 1 função) — `category/domain/create.ts` exporta só `domain_createCategory`; idem pros outros 3 domains novos.
- [x] Regra 15 forward-only — `domain/create.ts`/`update.ts`/`readBySlug.ts` de `post` já lançam `TRPCError` hoje (débito pré-existente); os 2 domains novos de `category`/`tag` não lançam `TRPCError` nenhum (não têm caso de erro de domínio — idempotência resolve o único cenário de conflito), então não pioram a métrica.
- [x] Não é regra 11 (mudança arquitetural) — `category`/`tag` são instâncias novas do mesmo padrão de feature já usado por `comment`/`post`/`user`; nenhuma camada nova, nenhum diretório de 1ª classe fora de `src/server/features/`, nenhum contrato cross-módulo inédito (mesmo padrão de import já documentado em `ach.md` § 2 "Regras de import").
- [x] `[NEEDS CLARIFICATION:]` zerado — spec § 7 vazia.

## 8. Riscos

- **Migration `PostTag` com `@@id([postId, tagId])` composto — não usado antes no schema.** Mitigação: é sintaxe Prisma padrão (chave primária composta), sem risco de dado — schema novo, sem linhas existentes pra migrar nessa tabela.
- **`TestContext.createPost` ganhar `categoryId` opcional pode quebrar o mesmo tipo duplicado em `types.ts` de novo (aconteceu na feature 004).** Mitigação: já sabido — os dois arquivos são editados na mesma task desta vez (T0xx), não em tasks separadas, e o `tsc --noEmit` roda antes de qualquer commit.
- **`setTags` faz 2 queries (`deleteMany` + `createMany`) fora de uma transação Prisma explícita no `update`.** Mitigação: usa `prisma.$transaction([...])` (array form, já usado em outro lugar do código — `PostModel.delete`), garantindo atomicidade.
- **Corrida entre `readByName` e `create` em `category`/`tag`: duas criações concorrentes com o mesmo `name` podem ambas não encontrar nada e as duas tentarem criar, uma batendo no `@unique`.** Mitigação: aceito como risco baixo (projeto pessoal, sem carga concorrente real hoje); a segunda chamada recebe um erro cru do Prisma em vez de crashar silenciosamente — não corrompe dado. Resolver de verdade exigiria `upsert` atômico, fora do escopo desta feature (nenhuma entidade do código usa `upsert` hoje).

## 9. Open questions

*(vazio.)*

---

*Plan NÃO contém: lista granular de tasks (vai pro `tasks.md`).*
