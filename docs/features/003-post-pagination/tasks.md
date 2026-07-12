# Feature 003 — Tasks

> **Spec:** [`./spec.md`](./spec.md)
> **Plan:** [`./plan.md`](./plan.md)
> **Convenção:** TDD-ordenadas. `[P]` = paralelizável (sem dependência da task imediatamente anterior). Cada task é um ciclo de `afm.md` § 2 (RED → GREEN → REFACTOR → COMMIT).
> **Pré-requisito:** `plan.md` sem `[NEEDS CLARIFICATION:]` aberto — confirmado vazio.

## Phase 1 — Model

- [X] T001 — Teste em `src/server/models/__test__/prismaModels.ts` — `PostModel.readRecents(limit)` sem cursor chama `findMany` sem `cursor`/`skip`; `PostModel.readRecents(limit, cursorId)` chama com `cursor: { id: cursorId }, skip: 1`.
- [X] T002 — `PostModel.readRecents` em `src/server/models/post.ts` aceita `cursor?: string`; `IPostModel` atualizado.

## Phase 2 — Boundary (`post.readRecent`)

- [X] T003 [P] — `readRecentPostsSchema` (`cursor?`, `limit?`, `.optional()` no objeto todo) + `readRecentPostsOutputSchema` (`{ posts, nextCursor }`) em `schema.ts`.
- [X] T004 — Teste em `procedures/__test__/readRecent.ts` — primeira página sem cursor retorna `limit` posts + `nextCursor` não-nulo quando há mais.
- [X] T005 — Teste no mesmo arquivo — pedir a próxima página com o `nextCursor` retorna os posts seguintes, sem repetir os da primeira.
- [X] T006 — Teste no mesmo arquivo — última página retorna `nextCursor: null`.
- [X] T007 — Teste no mesmo arquivo — chamada sem nenhum argumento (`.readRecent()`) continua funcionando (regressão do contrato antigo).
- [X] T008 — `domain_readRecentPosts` em `domain/readRecent.ts`: pede `limit + 1`, corta o extra, calcula `nextCursor`; `DEFAULT_PAGE_SIZE = 10`.
- [X] T009 — `procedure_readRecentPosts` normaliza `input ?? {}` antes de chamar o domain.
- [X] T010 — REFACTOR + `tsc --noEmit` + `vitest` afetados — `tsc --noEmit` limpo, `vitest` 115/115 verde.

## Phase 3 — Frontend (mudança mínima, ver `plan.md` § 4)

- [X] T011 — `postFeed.tsx`: busca primeira página (`caller.post.readRecent()`), passa `initialPosts`/`initialNextCursor` pro client component.
- [X] T012 — `postFeed.client.tsx` (novo): estado local da lista (padrão de `addLocalComment` em `page.client.tsx`) + botão "Carregar mais" que busca a próxima página via `trpc.post.readRecent` e faz append; botão some quando `nextCursor` é `null`.
- [X] T013 — `grep -rn "readRecent" src` confirmado — nenhum outro consumidor do shape antigo (array direto) sobrou.

## Phase 4 — Reconciliação

- [X] T014 — `docs/roadmap.md` Fase 1: checklist "paginação" marcado, com nota do tamanho de página default e do contrato cursor-based.
- [X] T015 — Status de `spec.md`/`plan.md` marcado `done` após verificação ao vivo: `tsc`/`vitest` verdes + `curl` direto na rota `post.readRecent` contra Postgres real (dev server local), confirmando página 1 (`limit=2`) → `nextCursor` não-nulo, página 2 com esse cursor → post restante exato, `nextCursor: null`. Browser real (visual) não usado nesta verificação — a verificação via `curl` no HTML servido + na rota tRPC direta é equivalente ao padrão já usado na feature 002 desta sessão.

---

*Toda task referencia esta feature no commit. Commits só depois de aprovação explícita do user, como no padrão já estabelecido nesta sessão.*
