# Feature 006 — Tasks

> **Spec:** [`./spec.md`](./spec.md)
> **Plan:** [`./plan.md`](./plan.md)
> **Convenção:** TDD-ordenadas. `[P]` = paralelizável (sem dependência da task imediatamente anterior). Cada task é um ciclo de `afm.md` § 2 (RED → GREEN → REFACTOR → COMMIT).
> **Pré-requisito:** `plan.md` sem `[NEEDS CLARIFICATION:]` aberto — confirmado vazio.

## Phase 1 — Schema (boundary de output)

- [X] T001 — Teste em `procedures/__test__/create.ts` — output de `create` inclui `readingTimeMinutes >= 1`.
- [X] T002 — `src/server/features/post/schema.ts`: `postFieldsSchema` (base sem transform) + `calculateReadingTimeMinutes` + `withReadingTime`; `postEntitySchema`, `postEntityWithRelationsSchema`, `postEntityWithTaxonomySchema` passam a computar `readingTimeMinutes`.
- [X] T003 — Teste em `procedures/__test__/readRecent.ts` — post mais longo tem `readingTimeMinutes` maior ou igual ao mais curto.
- [X] T004 — Teste em `procedures/__test__/readBySlug.ts` — output inclui `readingTimeMinutes`.
- [X] T005 [P] — Teste em `user/procedures/__test__/readPosts.ts` — lista pública de posts de um autor também inclui `readingTimeMinutes`.
- [X] T006 — REFACTOR + `tsc --noEmit` + `vitest` completo.

## Phase 2 — Reconciliação

- [X] T007 — `docs/roadmap.md` (checklist "tempo estimado de leitura" da Fase 1) e `docs/prd.md` (linha do MVP) atualizados.
- [X] T008 — Status de `spec.md`/`plan.md` marcado `done`. Verificação: `tsc --noEmit` e `vitest` verdes; verificação ao vivo via `curl` contra `post.readRecent`/`post.readBySlug` confirmando `readingTimeMinutes` no payload real.

---

*Toda task referencia esta feature no commit. Usuário já aprovou "executa até o fim" via `/afm:deliver`, então a execução das tasks segue sem pausa adicional; o commit final continua respeitando o padrão de pedir confirmação antes de commitar.*
