# Feature 018 — Tasks

> **Spec:** [`./spec.md`](./spec.md)
> **Plan:** [`./plan.md`](./plan.md)
> **Convenção:** TDD-ordenadas. `[P]` = paralelizável. Cada task é um ciclo de `core/afm.md` § 2 (RED → GREEN → REFACTOR → COMMIT).
> **Pré-requisito:** `plan.md` sem `[NEEDS CLARIFICATION:]` aberto — confirmado.

## Phase 1 — Setup

- [X] T001 — Migration: `Post.previousSlug String? @unique`, `seoTitle String?`, `seoDescription String?`, `canonicalUrl String?` em `prisma/schema.prisma`, roda `npx prisma migrate dev --name add_post_seo_overrides_and_previous_slug` (RF-10). Executado via migração escrita a mão + `migrate deploy` (ambiente não-interativo não suporta `migrate dev` puro).
- [X] T002 [P] — `src/server/features/post/schema.ts`: `updatePostSchema` ganha `slug`/`seoTitle`/`seoDescription`/`canonicalUrl` opcionais; `postFieldsSchema` ganha `previousSlug`/`seoTitle`/`seoDescription`/`canonicalUrl` nullable (saída — `previousSlug` também exposto pra manter `IPostEntity` estruturalmente compatível com os componentes de frontend que já tipam props direto pelo model type). Usa `z.url()` (Zod v4), não `z.string().url()` deprecated — ver `docs/gotchas.md`. `IPostEntity`/`IPostModel` em `src/server/models/post.ts` também estendidos + `readByPreviousSlug` (RF-10, US-015).

## Phase 2 — Foundation (testes vermelhos primeiro, por cenário Gherkin de `spec.md § 3`)

- [X] T003 — RED: teste `domain_resolveAvailableSlug` retorna o slug base quando disponível e sufixo incremental quando colide, ignorando o próprio post ao editar (`src/server/features/post/domain/__test__/resolveAvailableSlug.ts`) (US-015 cenário "Novo slug colide com um já existente").
- [X] T004 — GREEN: extrai `src/server/features/post/domain/resolveAvailableSlug.ts` (`domain_resolveAvailableSlug`) do algoritmo hoje inline em `create.ts`, com parâmetro opcional `excludePostId` pra edição; `create.ts` passa a importar e usar essa função.
- [X] T005 — RED: teste `domain_updatePost` com `slug` diferente do atual grava o slug novo e move o antigo pra `previousSlug` (`src/server/features/post/domain/__test__/update.ts`) (US-015 cenário "Editar o slug de um post gera um novo slug válido e único").
- [X] T006 — GREEN: `domain_updatePost` resolve colisão via `domain_resolveAvailableSlug` (excluindo o próprio post) quando `input.slug` difere do slug atual, grava `previousSlug` = slug atual antes de trocar.
- [X] T007 — RED: teste `domain_updatePost` sem `slug` no input não mexe em `slug`/`previousSlug` (mesmo arquivo de T005) — regressão do comportamento hoje.
- [X] T008 — GREEN: coberto pela mesma implementação de T006 (`slug`/`previousSlug` ficam `undefined` quando não muda, Prisma ignora campo `undefined` no update).
- [X] T009 — RED: teste `domain_updatePost` grava `seoTitle`/`seoDescription`/`canonicalUrl` quando presentes no input, e normaliza string vazia (`""`) pra `null` (limpar override) (mesmo arquivo de T005) (US-015 cenário "Override de SEO é usado na metadata").
- [X] T010 — GREEN: `domain_updatePost` passa os 3 campos pro repository com a normalização `"" → null` via helper `normalizeOverride`.
- [X] T011 — RED: teste `domain_readRedirectSlug` retorna `{ slug: <atual> }` quando o slug consultado é o `previousSlug` de algum post, e `null` quando não é slug de ninguém (`src/server/features/post/domain/__test__/readRedirectSlug.ts`) (US-015 cenário "Slug antigo redireciona pro slug novo").
- [X] T012 — GREEN: `src/server/features/post/domain/readRedirectSlug.ts` (`domain_readRedirectSlug`) + `PostModel.readByPreviousSlug(slug)` em `src/server/models/post.ts`.

## Phase 3 — Boundary

- [X] T013 — RED: teste de procedure `post.update` aceita `slug`/`seoTitle`/`seoDescription`/`canonicalUrl` no input e retorna no output (`src/server/features/post/procedures/__test__/update.ts`, estende o existente) (US-015).
- [X] T014 [P] — RED: teste de procedure `post.readRedirectSlug` pública, retorna `{ slug }` ou `null` (`src/server/features/post/procedures/__test__/readRedirectSlug.ts`) (US-015).
- [X] T015 — GREEN: `src/server/features/post/procedures/readRedirectSlug.ts` (`publicProcedure`) + registra `readRedirectSlug` em `src/server/features/post/index.ts`; depende de T012, T014.
- [X] T016 — `src/app/(half)/post/[slug]/page.tsx`: `generateMetadata` usa `post.seoTitle ?? post.title`, `post.seoDescription ?? description`, `post.canonicalUrl ?? "/post/${slug}"` (fallback preserva comportamento atual); depende de T002.
- [X] T017 — `src/app/(half)/post/[slug]/page.tsx`: `PostContent`, no catch de `POST_NOT_FOUND`, chama `caller.post.readRedirectSlug({ slug })` antes de renderizar `OwnerPreview`; se achar, `permanentRedirect(`/post/${result.slug}`)` (`next/navigation`); depende de T015.
- [X] T018 [P] — `src/app/(half)/post/edit/[id]/page.client.tsx`: `InputField` novos — `slug`, `seoTitle`, `seoDescription`, `canonicalUrl` — no `UpdatePostForm`; depende de T002.

`yarn test` (302/302), `npx tsc --noEmit` e `yarn lint` verdes ao fim da Phase 3.

## Phase 4 — Reconciliação (8.5)

- [X] T019 — `docs/ach.md § 3.1`: nota sobre `domain_resolveAvailableSlug` como domain helper compartilhado (mesmo padrão de `getUserOrThrow`) e sobre o redirect de slug em `PostContent` (RF-10).
- [X] T020 — `docs/roadmap.md` Fase 5: marca `[x]` slug amigável / redirect quando slug muda; nota que `seoTitle`/`seoDescription`/`canonicalUrl` agora são editáveis; Fase 5 vira ✅ Concluída. `docs/prd.md` RF-10: atualiza a nota que citava as pendências. `docs/ust.md` US-015 status → `done`. `spec.md` status → `done` (RF-10).
- [ ] T021 — Commit(s): migration + backend (schema/model/domain/procedure/router), frontend (página do post + form de edição), docs. Sem push (RF-10).

---

*Toda task referencia US-015 ou RF-10 no commit (regra de `core/afm.md` § 2.7).*
*Toda task é executada como ciclo do `core/afm.md` § 2 — não pula RED (regra 1 — TDD).*
