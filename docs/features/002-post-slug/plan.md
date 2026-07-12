# Feature 002 — Plan

> **Spec:** [`./spec.md`](./spec.md)
> **Status do plan:** approved
> **Stack inferido:** Next.js 15 App Router + tRPC v11 + Prisma 6 + Zod (`docs/ach.md` § 1) — sem stack nova.
> **Data:** 2026-07-11

## 1. Approach em 3 frases

Adiciona `slug` (String, único) ao model `Post` do Prisma. No `create`, o Domain gera o slug a partir do título via um novo Adapter-like `src/lib/slug/` (mesmo padrão de `uidGenerator`), resolvendo colisão com um loop de sufixo incremental checado contra `PostModel.readBySlug`. Expõe um novo endpoint público `post.readBySlug` (mesmo formato de `UserModel.readByEmail`) e migra a rota pública `/post/[id]` → `/post/[slug]`, atualizando todos os pontos que hoje linkam por `id`.

## 2. Componentes afetados

| Componente-tipo | Arquivo / módulo | Novo ou edita | Por quê |
| --- | --- | --- | --- |
| Schema DB | `prisma/schema.prisma` (model `Post`) | edita | campo `slug String @unique` |
| Migration | `prisma/migrations/<ts>_add_post_slug/` | novo | adiciona coluna + backfill dev + unique index |
| Adapter-like (helper puro) | `src/lib/slug/adapter.ts` + `implementations/kebabCase.ts` | novo | transforma título → slug base (mesmo padrão de `uidGenerator`) |
| Composition root | `src/server/infra/container/helpers.ts` | edita | wire `slug: new KebabCaseSlugGenerator()` |
| Model | `src/server/models/post.ts` | edita | novo método `readBySlug(slug)`, tipo `IPostModel` atualizado |
| Schema (Zod) | `src/server/features/post/schema.ts` | edita | `postEntitySchema` ganha `slug`; novo `readPostBySlugSchema`/`ReadPostBySlugInput` |
| Domain-like | `src/server/features/post/domain/create.ts` | edita | gera slug único antes de persistir |
| Domain-like | `src/server/features/post/domain/readBySlug.ts` | novo | `domain_readPostBySlug` (espelha `read.ts`, por slug) |
| Domain-like | `src/server/features/post/domain/revalidate.ts` | edita | `revalidatePath` passa a usar `post.slug` |
| Procedure | `src/server/features/post/procedures/readBySlug.ts` | novo | expõe `post.readBySlug` |
| Procedure-like (router) | `src/server/features/post/index.ts` | edita | registra `readBySlug` |
| Model | `src/server/models/comment.ts` | edita | `readAllByUserId` passa a incluir `post: { select: { slug } } }` |
| Schema (Zod) | `src/server/features/user/schema.ts` | edita | `commentEntitySchema`/output de `readComments` ganha `post.slug` |
| Domain-like | `src/server/features/user/domain/readComments.ts` | não edita | shape já vem do repository, sem lógica nova |
| App Router (página pública) | `src/app/(half)/post/[id]/` → `src/app/(half)/post/[slug]/` | renomeia + edita | lê por slug em vez de id |
| Componente | `src/components/postFeed.tsx` | edita | link usa `post.slug` |
| Componente | `src/app/(half)/user/[id]/page.client.tsx` | edita | link de post usa `post.slug`; link de comentário usa `comment.post.slug` |
| Componente | `src/app/(half)/post/create/page.client.tsx` | edita | redirect pós-criação usa `data.slug` |
| Test helper | `src/test/context/testContext.ts` + `types.ts` | edita | `createPost` passa a gerar `slug` (único via sufixo de `postId`) |
| Erro compartilhado | `src/shared/error/post.ts` | edita | mensagem de `POST_NOT_FOUND` deixa de mencionar "ID" (agora serve id e slug) |

## 3. Modelo de dados (delta)

```
Post {
  ...
  slug String @unique   // NOVO — gerado no create, imutável
}
```

Migration em duas etapas dentro do mesmo arquivo SQL (evita quebrar linhas existentes de dev/seed):
1. Adiciona `slug` como nullable.
2. Backfill: `UPDATE "Post" SET slug = <kebab-case do id> WHERE slug IS NULL` (SQL puro, determinístico o suficiente pra dev — não há produção hoje, ver spec § 4).
3. Altera pra `NOT NULL` + cria unique index.

## 4. Decisões arquiteturais

- **Decisão:** slug gerado automaticamente no `domain_createPost`, resolução de colisão via loop incremental (`titulo`, `titulo-2`, ...) checando `PostModel.readBySlug`. **Alternativa rejeitada:** sufixo aleatório/hash. **Por quê:** URL mais legível; volume de posts do projeto é baixo, loop incremental não é gargalo; consistente com o tom "menos infra" do `roadmap.md`.
- **Decisão:** slug é imutável após criado (update de título não regenera slug). **Alternativa rejeitada:** regenerar slug a cada update de título. **Por quê:** evitaria quebrar link já compartilhado sem a infra de redirect, que é explicitamente Fase 5 (fora de escopo aqui).
- **Decisão:** gerador de slug vira Adapter-like em `src/lib/slug/` (mesmo padrão de `uidGenerator`/`passwordHashing`), não uma lib externa (`slugify` npm). **Alternativa rejeitada:** dependência nova. **Por quê:** kebab-case de um título é transformação trivial (~15 linhas), YAGNI/KISS de `afm.md` § 1.3, e evita justificar dependência nova (`afm.md` § 4.4) pra algo que não precisa.
- **Decisão:** estende `comment` → `user.readComments` pra incluir o slug do post relacionado, em vez de manter o link comentário→post apontando pro `id` antigo. **Alternativa rejeitada:** deixar esse link específico quebrado ou manter `/post/[id]` vivo só pra esse caso. **Por quê:** "broken windows" (`afm.md` § 1.2) — link morto é regressão; manter duas rotas pra mesma entidade é complexidade sem pedido do roadmap.
- **Decisão:** rota `/post/edit/[id]` continua por `id`. **Alternativa rejeitada:** migrar edição pra slug também. **Por quê:** é fluxo autenticado de dono do post (não precisa de URL bonita) e usar `id` mantém a operação estável mesmo se o slug mudar no futuro (Fase 5).

## 5. Contratos (boundaries externos)

### Boundary `post.readBySlug` (tRPC query, público)

```ts
// input
{ slug: string }

// output (sucesso)
{ id: string; userId: string; title: string; content: string; slug: string; createdAt: Date; updatedAt: Date }

// errors (codes)
"NOT_FOUND" // PostErrorCode.POST_NOT_FOUND
```

### Boundary `post.create` (tRPC mutation, autenticado — output muda)

```ts
// output (sucesso) — ganha o campo `slug`
{ id: string; userId: string; title: string; content: string; slug: string; createdAt: Date; updatedAt: Date }
```

### Boundary `user.readComments` (tRPC query, público — output muda)

```ts
// output (sucesso) — cada item ganha `post: { slug: string }`
{ id: string; postId: string; userId: string; content: string; createdAt: Date; updatedAt: Date; post: { slug: string } }[]
```

## 6. Complexity tracking

| Complexidade aceita | Alternativa simples rejeitada | Por quê não foi simples |
| --- | --- | --- |
| Loop de resolução de colisão de slug no `domain_createPost` | Confiar que títulos nunca colidem | Dois posts com o mesmo título são um caso real e o unique constraint quebraria o create sem esse tratamento |
| Estender `user.readComments` com `post.slug` | Deixar o link comentário→post por `id` | Critério de sucesso da spec exige "nenhum link quebrado"; ver Decisões § 4 |

## 7. Validação contra invariantes

- [x] Não viola regras duras de `afm.md` § 3 — regra 16 (validação no boundary: slug validado como `z.string()` no schema da procedure, não em domain/model), regra 30 (domain não importa Prisma direto — continua usando `ctx.repositories`), regra 15 forward-only (domain novo/editado não lança `TRPCError` a mais do que já existe hoje — `readBySlug`/`create` seguem exatamente o padrão de `read.ts` já em uso, sem piorar a métrica).
- [x] Não é regra 11 (mudança arquitetural) — Adapter-like `slug` segue o mesmo padrão já existente (`uidGenerator`), não introduz camada nova.
- [x] Princípios universais de `PRINCIPLES.md` respeitados — discovery resolveu tudo por scan, gate único, escreve artefatos só após aprovação.
- [x] `[NEEDS CLARIFICATION:]` zerado — spec § 7 vazia, nenhum marker aberto.

## 8. Riscos

- **Migration com dado existente (seed dev).** Mitigação: backfill determinístico na própria migration (§ 3) antes do `NOT NULL`/`UNIQUE`; sem banco de produção hoje, risco é só re-rodar `db:seed` se algo sair errado localmente.
- **Esquecer algum link `/post/${id}` residual.** Mitigação: já mapeado por `grep` no discovery (postFeed, user posts, user comments, create redirect, revalidate) — task de boundary confere com novo `grep` no fim.

## 9. Open questions

*(vazio.)*

---

*Plan NÃO contém: lista granular de tasks (vai pro `tasks.md`).*
