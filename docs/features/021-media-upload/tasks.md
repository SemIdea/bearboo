# Feature 021 — Tasks

> **Spec:** [`./spec.md`](./spec.md)
> **Plan:** [`./plan.md`](./plan.md)
> **Convenção:** TDD-ordenadas. `[P]` = paralelizável (sem dependência da task imediatamente anterior). Cada task é um ciclo de `core/afm.md` § 2 (RED → GREEN → REFACTOR → COMMIT).
> **Pré-requisito:** `plan.md` sem `[NEEDS CLARIFICATION:]` aberto — ok.

## Phase 1 — Setup

- [x] T001 [P] Prisma: model `Media` + relação `User.media` em `prisma/schema.prisma`; migration via `prisma migrate diff` schema-to-schema (US-016)
- [x] T002 [P] `src/lib/env/index.ts`: `media.uploadDir`/`media.maxUploadSizeBytes` (US-016)
- [x] T003 [P] `src/lib/permissions/`: ação `media:deleteAny` → `["ADMIN", "EDITOR"]` (US-016, mesmo padrão de `post:deleteAny`)
- [x] T004 [P] `src/shared/error/domainError.ts` (`DomainError<C>` genérico) + `src/shared/error/media.ts` (`MediaErrorCode`) (US-016, regra 15 forward-only)

## Phase 2 — Foundation (testes vermelhos primeiro)

- [x] T005 — RED: `src/server/models/__test__/media.ts` — `MediaModel.readByUser(id)`/`readByUser(null)` (US-016)
- [x] T006 — GREEN: `src/server/models/media.ts` (`MediaModel`, mesmo padrão de `CategoryModel`)
- [x] T007 — RED: `src/server/integrations/gateway/mediaStorage/implementations/__test__/local.ts` — `save`/`delete` (US-016)
- [x] T008 — GREEN: `.../mediaStorage/adapter.ts` + `implementations/local.ts` (`LocalMediaStorage`)
- [x] T009 [P] — `src/test/gateways/mediaStorage.ts` (`FakeMediaStorageGateway`) + wire em `createFakeGateways`/`TestContext`
- [x] T010 — RED: `src/server/features/media/domain/__test__/upload.ts` (US-016 cenários "upload válido")
- [x] T011 — GREEN: `src/server/features/media/domain/upload.ts`
- [x] T012 — RED: `src/server/features/media/domain/__test__/readOwn.ts` (US-016 cenário "vê só a própria biblioteca" + bypass Admin/Editor)
- [x] T013 — GREEN: `src/server/features/media/domain/readOwn.ts`
- [x] T014 — RED: `src/server/features/media/domain/__test__/delete.ts` (US-016 cenários dono/forbidden/bypass)
- [x] T015 — GREEN: `src/server/features/media/domain/delete.ts`

## Phase 3 — Boundary

- [x] T016 — `src/server/features/media/schema.ts` (`uploadMediaSchema` com `.refine()` de mimeType/tamanho, `readOwnMediaOutputSchema`, `deleteMediaSchema`) (US-016, regra 16)
- [x] T017 — RED: `src/server/features/media/procedures/__test__/upload.ts` (US-016)
- [x] T018 — GREEN: `src/server/features/media/procedures/upload.ts` (mapeia `DomainError`→`TRPCError`)
- [x] T019 — RED: `src/server/features/media/procedures/__test__/readOwn.ts` (US-016)
- [x] T020 — GREEN: `src/server/features/media/procedures/readOwn.ts`
- [x] T021 — RED: `src/server/features/media/procedures/__test__/delete.ts` (US-016)
- [x] T022 — GREEN: `src/server/features/media/procedures/delete.ts`
- [x] T023 — `src/server/features/media/index.ts` (`MediaRouter`) + registra em `src/server/routers/app.routes.ts` + `src/server/infra/container/{gateways,repositories}.ts` (US-016)
- [x] T024 [P] — UI `src/app/(half)/media/{page.tsx,page.client.tsx}` (upload + grid + alt text + apagar) (US-016)
- [x] T025 [P] — UI: formulário de post ganha opção "usar mídia enviada" → preenche `coverImageUrl` (US-016 cenário "mídia enviada vira capa")
- [x] T026 [P] — `docker-compose.yml` (volume `uploads`), `.gitignore` (`public/uploads/*`), `public/uploads/.gitkeep` (US-016, plan § 8 risco)

## Phase 4 — Reconciliação (8.5)

- [x] T027 — Atualiza `docs/ach.md` § 3.1 (entrada `mediaStorage` gateway + `Media` model)
- [x] T028 — `docs/adr/0015-media-storage-gateway-pluggavel.md` (decisão do port `{url, storageKey}` + local-nesta-rodada)
- [x] T029 — Atualiza `docs/roadmap.md` Fase 8 (itens concluídos, compressão explicitamente fora de escopo)
- [x] T030 — Status US-016 → `done` em `docs/ust.md`; `spec.md`/`plan.md` cabeçalho → `done`
- [x] T031 — `npx tsc --noEmit` + `yarn vitest run` completos + checagem regra 13 (`git diff --staged`) antes de cada commit

---

*Toda task referencia US-016 ou RF-13 no commit (regra de `core/afm.md` § 2.7).*
*Toda task é executada como ciclo do `core/afm.md` § 2 — não pula RED (regra 1 — TDD).*
