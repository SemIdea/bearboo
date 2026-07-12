# Feature 012 — Plan

> **Spec:** [`./spec.md`](./spec.md)
> **Status:** approved (gate 2026-07-12, "Executa os 2 até o fim")

## 1. Resumo técnico

Nova query escopada por identidade do chamador (não por parâmetro de input — mesma disciplina de `update`/`delete`): `post.readOwn` (`protectedProcedure`) deriva `userId` de `ctx.user.id`, nunca do payload do cliente, e retorna todos os status. Filtros de `status`/`categoryId`/`tagId` compõem o `where` do Prisma, mesmo padrão de `readRecents`/`readRelated`. Frontend: página nova `/post/mine`, mesmo padrão de auth client-side (`useAuth` + redirect) já usado em `post/create`/`post/edit`.

## 2. Componentes afetados

| Componente | Mudança |
| --- | --- |
| `src/server/features/post/schema.ts` | `readOwnPostsSchema` (`status`/`categoryId`/`tagId` opcionais — **sem** `userId`, vem de `ctx.user.id`), `readOwnPostsOutputSchema = z.array(postEntityWithRelationsSchema)`, `ReadOwnPostsInput` |
| `src/server/models/post.ts` | novo `readOwnPosts(userId, status?, categoryId?, tagId?)` no `PostModelClass`, adicionado a `IPostModel` |
| `src/server/features/post/domain/readOwn.ts` | novo, `domain_readOwnPosts` |
| `src/server/features/post/procedures/readOwn.ts` | novo, `procedure_readOwnPosts` — `protectedProcedure`, `userId: ctx.user.id` no input do domain |
| `src/server/features/post/index.ts` | `readOwn: procedure_readOwnPosts` registrado no `PostRouter` |
| `src/app/(half)/post/mine/page.tsx` + `page.client.tsx` | nova página — lista + filtros (status/categoria/tag) via `<select>` nativo, populados por `category.readAll`/`tag.readAll` |
| `src/components/header/index.client.tsx` | link "My posts" no `AuthenticatedHeader`, ao lado do ícone de criar post |

## 3. Fora de escopo

Ver `spec.md` § 4.

## 4. Decisões arquiteturais

- **`userId` derivado de `ctx.user.id`, não do input do cliente:** ao contrário de `readRelated` (onde `categoryId`/`tagIds` do cliente eram aceitáveis porque o resultado é sempre público `PUBLISHED`), aqui o `userId` **é** o controle de acesso — se viesse do payload, qualquer usuário logado poderia listar posts (inclusive rascunhos) de qualquer outro só trocando o parâmetro. Mesmo padrão já usado em `update`/`delete` (`userId: ctx.user.id` passado pelo procedure, nunca aceito como input do cliente).
- **`protectedProcedure`, não `publicProcedure`:** a spec exige redirect pra login se não houver sessão — `protectedProcedure` já lança `UNAUTHORIZED` nesse caso, e o `onError` de `createDynamicCaller` (usado por páginas autenticadas) já redireciona pra `/auth/login`. Mas como o padrão de auth deste app é client-side (`useAuth`, ver decisão abaixo), o `protectedProcedure` é a rede de segurança do boundary, não o mecanismo de redirect em si.
- **Auth client-side (`useAuth` + `useEffect` redirect), não Server Component com `createDynamicCaller`:** mesmo padrão já usado em `post/create`/`post/edit` (`docs/roadmap.md` nota de sequenciamento 2026-07-11: mudança estrutural nova do lado do front deve esperar a refatoração futura — reusar o padrão existente em vez de introduzir Server Component com redirect é a opção que não abre decisão estrutural nova).
- **Sem paginação:** volume esperado por autor é baixo (post pessoal, não plataforma multi-tenant) — `readOwnPosts` retorna a lista inteira. Documentado como out of scope revisável.
- **Filtros como `<select>` nativo, populados via `trpc.category.readAll`/`trpc.tag.readAll`:** mesmas procedures já existentes (`docs/features/005-tags-categorias/`), sem UI de seleção nova — só agora ganham um primeiro consumidor de leitura no frontend.

## 5. Contratos

`post.readOwn` é uma procedure nova, aditiva — não muda nenhuma existente. Reusa `postEntityWithRelationsSchema` (mesmo shape de `readRecent`/`readRelated`), incluindo `readingTimeMinutes` via `withReadingTime` automaticamente.

## 6. Riscos

Nenhum identificado além do já coberto pelos testes (regra 1).

## 7. Validação contra invariantes (regras duras)

- Regra 1 (teste): `procedures/__test__/readOwn.ts` — retorna todos os status do dono, filtra por status/categoria/tag, isola entre usuários, rejeita chamada sem sessão.
- Regra 4 (`tsc --noEmit` limpo): checar após a mudança.
- Regra 7 (domain com 1 export): `domain/readOwn.ts` exporta só `domain_readOwnPosts`.
- Regra 16 (validação no boundary): filtros validados em `schema.ts`; `userId` nunca passa pelo Zod schema do cliente (não é input dele).
- Regra 11: `post/mine` é uma rota nova mas segue o padrão de página já estabelecido (mesma estrutura de `post/create`); `readOwn` é uma procedure nova mas no mesmo padrão de `readRelated`/`update`/`delete` — não introduz camada nem contrato cross-módulo inédito.

## 8. Dependências

Nenhuma.
