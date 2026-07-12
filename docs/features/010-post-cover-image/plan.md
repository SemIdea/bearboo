# Feature 010 — Plan

> **Spec:** [`./spec.md`](./spec.md)
> **Status:** approved (gate 2026-07-12, "Quero UI básica também")

## 1. Resumo técnico

Campo `coverImageUrl String?` novo em `Post` (Prisma), propagado pelo caminho já estabelecido pelos campos opcionais existentes (`categoryId`, mesmo padrão): schema Zod → domain (create/update) → model (tipo, sem mudança de query — `findMany`/`findUnique` já retornam a coluna nova automaticamente) → output schema → frontend (`InputField` no form de criar/editar, `<img>` condicional no card e na página do post).

## 2. Componentes afetados

| Componente | Mudança |
| --- | --- |
| `prisma/schema.prisma` | `Post.coverImageUrl String?` |
| `prisma/migrations/<ts>_add_post_cover_image/migration.sql` | novo, gerado via `prisma migrate diff` (schema-to-schema, sem DB ao vivo) |
| `src/server/features/post/schema.ts` | `createPostSchema`/`updatePostSchema` ganham `coverImageUrl: z.string().url().optional()`; `postFieldsSchema` ganha `coverImageUrl: z.string().nullable()` |
| `src/server/features/post/domain/create.ts` | passa `coverImageUrl: input.coverImageUrl ?? null` pro `repositories.post.create` |
| `src/server/features/post/domain/update.ts` | passa `coverImageUrl: input.coverImageUrl` pro `repositories.post.update` |
| `src/server/models/post.ts` | `IPostEntity` ganha `coverImageUrl: string \| null` (sem mudança de query — coluna nova vem de graça no `findMany`/`findUnique`/`create`/`update` sem `select` explícito) |
| `src/app/(half)/post/create/page.client.tsx` | `InputField name="coverImageUrl"` opcional no form |
| `src/app/(half)/post/edit/[id]/page.client.tsx` | idem |
| `src/components/postFeed.client.tsx` | `<img>` condicional no card, se `post.coverImageUrl` |
| `src/app/(half)/post/[slug]/page.tsx` | `<img>` condicional no topo do conteúdo, se `post.coverImageUrl` |

## 3. Fora de escopo

Ver `spec.md` § 4.

## 4. Decisões arquiteturais

- **URL simples vs. upload:** URL simples. Upload exige storage/CDN (S3-like, presigned URL, etc.) — item de infra maior, já reconhecido como item separado no roadmap (Fase 2). Confirmado no gate.
- **`<img>` puro vs. `next/image`:** `<img>` puro. `next/image` com URL arbitrária de usuário exige `images.remotePatterns` com wildcard amplo (`hostname: "**"`), o que é uma escolha de segurança/config que não foi pedida — e o repo não usa `next/image` em nenhum lugar hoje (sem precedente a seguir). Mantém consistência com o padrão atual (`<By>`, `<MdView>` etc. não usam `next/image` pra nenhum asset).
- **Validação de URL no schema (`z.string().url()`) vs. string livre:** `.url()`. Já é o boundary certo pra essa validação (regra dura 16 — validação só em input de procedure); barato, evita salvar lixo óbvio (ex. texto sem protocolo) sem tentar validar que é de fato uma imagem (isso exigiria requisição de rede no boundary, fora de escopo).
- **Sem novo componente de exibição dedicado (`<PostCoverImage />`):** `<img>` inline com className compartilhada é suficiente pra 2 usos (card + página do post); um componente novo seria abstração prematura pra 2 call sites simples.

## 5. Contratos

`coverImageUrl` passa a fazer parte do output de todas as procedures de post que já retornam `postFieldsSchema` (`create`, `read`, `readBySlug`, `update`, `revalidate`, `readRecent`) — mudança aditiva, não quebra consumidores existentes (campo novo, `nullable`).

## 6. Riscos

- Migration não pode ser aplicada contra um Postgres ao vivo neste sandbox (mesma limitação de `DATABASE_URL` já documentada em `008-trpc-error-link/tasks.md` T007) — gerada via `prisma migrate diff --from-schema-datamodel <schema antigo> --to-schema-datamodel <schema novo> --script`, que não precisa de conexão com banco. Validação real (rodar a migration contra Postgres) fica pendente pro ambiente onde `DATABASE_URL` funciona — mesmo padrão do que já aconteceu com `002-post-slug`/`004-post-status`/`005-tags-categorias`.
- `<img>` sem fallback de erro de carregamento (URL quebrada) — aceito; não é requisito do critério de sucesso (§2 da spec só pede "aparece quando presente").

## 7. Validação contra invariantes (regras duras)

- Regra 1 (teste): domain create/update ganham asserção do campo novo nos testes existentes; schema.ts validado via teste de parse (padrão já usado nos testes de `create`/`update` existentes).
- Regra 4 (`tsc --noEmit` limpo): checar após a mudança.
- Regra 16 (validação no boundary): `.url()` fica em `schema.ts` (boundary de procedure), não no domain/model.
- Regra 11: campo novo em model existente, sem camada/componente novo — não aciona o gatilho.

## 8. Dependências

Nenhuma.
