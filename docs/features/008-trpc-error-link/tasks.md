# Feature 008 — Tasks

> **Plan:** [`./plan.md`](./plan.md)
> Toda task referencia US-003. `[P]` = paralelizável (sem dependência entre si).

## Setup

- [X] T001 — Ler `src/context/trpc/{fetcher,client,session}.ts` e `src/server/createRouter.ts` mais uma vez a fresco (já lidos no discovery; task só formaliza o "LER" do ciclo `afm.md § 2` antes do primeiro código).

## Foundation (RED → GREEN)

- [X] T002 [RED] — Criar `src/context/trpc/__test__/sessionRefreshLink.ts` com os 5 casos: (a) SESSION_EXPIRED + refresh ok → retry chama `next` de novo e propaga o `value` do retry; (b) SESSION_EXPIRED + refresh falha → `clearAuthData` + `window.location.href = "/auth/login"` + erro original propagado; (c) INVALID_TOKEN → `clearAuthData` + redirect login + erro propagado; (d) INVALID_CREDENTIALS → sem side effect, erro propagado; (e) FORBIDDEN/USER_NOT_VERIFIED → redirect `/auth/verify` + erro propagado; (f) sucesso sem erro → `value` passa direto, sem side effect. Mocka `refreshTokens`/`clearAuthData` via `vi.mock`, stub de `window` via `vi.stubGlobal`. Roda e confirma falha (módulo ainda não existe).
- [X] T003 [GREEN] — Criar `src/context/trpc/sessionRefreshLink.ts` implementando o `TRPCLink<AppRouter>` conforme plan.md § 5 (boundary) e § 4 (decisões). Roda os testes de T002 até verde.

## Boundary (wiring)

- [X] T004 — Editar `src/context/trpc/client.ts`: adiciona `sessionRefreshLink` ao array `links` (entre `loggerLink` e `httpBatchLink`), remove a opção `fetch: customFetcher` do `httpBatchLink`, remove o import de `customFetcher`.
- [X] T005 — Deletar `src/context/trpc/fetcher.ts` e `src/context/trpc/__test__/fetcher.ts`. Confirma via `grep -rn "customFetcher\|extractSessionErrorCode" src/` que não sobra referência.
- [X] T006 — `npx tsc --noEmit` limpo + `npx vitest run` verde (suíte inteira, não só o arquivo novo).
- [X] T007 — Verificação ao vivo: `next build` confirma que o client compila/bundla com a nova cadeia de links sem erro (comparado com `main` via `git stash`, o único erro de build é pré-existente e não relacionado — prerender de `/`, `new Date()` em `post.ts`). `npm run dev` + curl confirmam boot do server e da home (200) sem erro relacionado a `sessionRefreshLink`/trpc client nos logs. Login real fim-a-fim não foi possível neste ambiente (Postgres/`DATABASE_URL` não configurado no sandbox — erro pré-existente, não desta feature); comportamento de retry/redirect fica coberto pelos 6 testes unitários de T002/T003 (cobrem as 4 branches + passthrough), conforme previsto no plan.md § Riscos.

## Reconciliação (8.5)

- [X] T008 — Atualizar `docs/ust.md` § Pendências Técnicas: marcar o item do `fetcher.ts` como resolvido (strikethrough + nota, mesmo padrão dos 2 itens já resolvidos na mesma seção), referenciando `docs/features/008-trpc-error-link/`.
- [X] T009 — Atualizar `spec.md` (status → `done`, checkboxes do § 2 marcados) e `plan.md` (já `approved`, sem mudança adicional necessária) com a data/evidência de verificação.
- [ ] T010 — Commit(s): 1 commit `refactor:` pro código (novo link + wiring + deleção do fetcher antigo + testes), 1 commit `docs:` pra `ust.md`/`spec.md`. Sem push.
