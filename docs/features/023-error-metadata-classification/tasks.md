# Feature 023 — Tasks

> **Spec:** [`./spec.md`](./spec.md) · **Plan:** [`./plan.md`](./plan.md)
> **Convenção:** TDD-ordenadas. `[P]` = paralelizável. Cada task é um ciclo de `core/afm.md § 2` (RED → GREEN → REFACTOR → COMMIT).

## Phase 1 — Foundation (metadata aditivo)

- [ ] T001 — RED: estende `src/shared/error/__test__/domainError.ts` — `DomainError` resolve `retryable`/`level` do catálogo (valor declarado) e cai nos defaults (`retryable=false`, `level="warn"`) quando não declarado (US-017)
- [ ] T002 — GREEN: `src/shared/error/registry.ts` (`ErrorLevel` type + `retryable?`/`level?` em `ErrorEntry`) + `src/shared/error/domainError.ts` (resolve/expõe com defaults) (US-017)
- [ ] T003 — Declara `retryable`/`level` nos 8 catálogos onde difere do default (ex.: `auth.too_many_attempts` retryable=true; `*.not_found`/validação level="info"; infra/token level conforme severidade) (US-017)

## Phase 2 — Boundary (convenção bug vs. recuperável)

- [ ] T004 — RED: teste `src/shared/error/__test__/boundaryLog.ts` — `classifyBoundaryError` retorna recuperável(level do DomainError) pra `DomainError` direto E pra erro com `cause` DomainError; retorna bug(level "error") pra qualquer outro throw (US-017)
- [ ] T005 — GREEN: `src/shared/error/boundaryLog.ts` (`classifyBoundaryError` puro + `logBoundaryError` roteando por level) (US-017)
- [ ] T006 — Ativa `onError` em `src/app/api/trpc/[trpc]/route.ts` (classifica + loga) + alinha `src/server/caller.ts` ao mesmo helper (US-017)
- [ ] T007 — Regra dura 33 em `docs/afm.md § 3` com gatilho executável (boundary distingue bug de recuperável) (RF-14)

## Phase 3 — Reconciliação (8.5)

- [ ] T008 — `docs/adr/0018-*.md` (metadata + convenção bug/recuperável; reafirma rejeição do Result, estende ADR-0017) + `docs/ach.md § 3.2` (contrato de erro atualizado) (RF-14)
- [ ] T009 — `spec.md`/status → done; nota em `ust.md` US-017 se o contrato de erro evoluiu (RF-14)

---

*Toda task referencia US-017 ou RF-14 no commit. Cada task é ciclo do § 2 — não pula RED (regra 1).*
