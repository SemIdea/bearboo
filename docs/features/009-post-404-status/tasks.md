# Feature 009 — Tasks

> **Plan:** [`./plan.md`](./plan.md)

- [X] T001 — Ler `src/app/(half)/post/[slug]/page.tsx` a fresco (LER do ciclo `afm.md § 2`).
- [X] T002 — Fundir `PostContent` em `Page` (implementado, testado, e **revertido** — ver T004/plan.md § 9).
- [X] T003 — `npx tsc --noEmit` limpo, `npx vitest run` 147/147 verdes (com a mudança de T002 aplicada).
- [X] T004 — Verificação: `next build` **quebrou** (`Uncached data was accessed outside of <Suspense>`), confirmado não-pré-existente via `git stash` + rebuild contra `main`. Investigado via `next build --debug-prerender` + docs oficiais do Next — é limitação de framework (`cacheComponents: true`), não bug de implementação. T002 revertido (`git checkout -- src/app/(half)/post/[slug]/page.tsx`); `next build` volta ao baseline conhecido (só o erro pré-existente de `/`). Ver `plan.md` § 9.
- [X] T005 — Reconciliação: `docs/ust.md` § Pendências Técnicas — achado registrado (não "resolvido"; reclassificado de "fix pontual" pra "infra nova, decisão pendente"). `docs/gotchas.md` — gotcha novo de Cache Components. `spec.md` status → `blocked`.
- [X] T006 — Commit: 1 commit `docs:` registrando a investigação (spec/plan/tasks + gotcha + ust.md). Sem código de produto mudado (revertido). Sem push.
- [ ] T007 — **Aguardando decisão do dono** (não é blocker pras outras 2 features desta rodada): qual caminho seguir — middleware/Edge (infra nova), aceitar 200 como limitação conhecida, ou outra alternativa. Ver `plan.md` § 9 "Caminhos possíveis".
