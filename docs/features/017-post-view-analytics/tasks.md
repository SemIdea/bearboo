# Feature 017 — Tasks

> **Spec:** [`./spec.md`](./spec.md)
> **Plan:** [`./plan.md`](./plan.md)
> **ADR:** [`../../adr/0013-gateway-redis-view-counter.md`](../../adr/0013-gateway-redis-view-counter.md)
> **Convenção:** TDD-ordenadas. `[P]` = paralelizável. Cada task é um ciclo de `core/afm.md` § 2 (RED → GREEN → REFACTOR → COMMIT).
> **Pré-requisito:** `plan.md` sem `[NEEDS CLARIFICATION:]` aberto — confirmado.

## Phase 1 — Setup

- [X] T001 — Migration: `Post.viewCount Int @default(0)` em `prisma/schema.prisma`, roda `npx prisma migrate dev --name add_post_view_count` (RF-12).
- [X] T002 [P] — `src/lib/env/index.ts`: adiciona `redisUrl` (`REDIS_URL`, default `redis://localhost:6379/0` — já presente no `.env` local) e `disableRedis` (`DISABLE_REDIS`, default `false` — idem, já presente no `.env` local); mesmo padrão de `mail.useProductionMailer` (RF-12).
- [X] T003 [P] — `src/server/integrations/gateway/viewCounter/adapter.ts`: `IViewCounterGatewayAdapter` (`recordView(postId, visitorId): Promise<{ counted: boolean }>`, `drainPendingCounts(): Promise<Record<string, number>>`) (RF-12, ADR-0013).

## Phase 2 — Foundation (testes vermelhos primeiro, por cenário Gherkin de `spec.md § 3`)

- [X] T004 — RED: teste `domain_recordView` registra view pra post `PUBLISHED` (`src/server/features/analytics/domain/__test__/recordView.ts`) (US-014 cenário "Visualização de post público é registrada").
- [X] T005 — GREEN: `src/server/features/analytics/domain/recordView.ts` (`domain_recordView`) — chama `ctx.gateways.viewCounter.recordView` (US-014).
- [X] T006 — RED: teste `domain_recordView` NÃO registra view pra post `DRAFT`/`ARCHIVED` (mesmo arquivo de T004) (US-014 cenário "View de post não-público não é registrada").
- [X] T007 — GREEN: `domain_recordView` valida visibilidade pública (mesma regra de `publicVisibilityFilter()`) via `ctx.repositories.post` antes de chamar o gateway (US-014).
- [X] T008 — RED: teste `domain_recordView` retorna `counted: false` numa 2ª chamada do mesmo visitante dentro de 24h (US-014 cenário "Visualização duplicada do mesmo visitante não é recontada").
- [X] T009 — GREEN: dedup no `FakeViewCounterGateway` (Map `postId:data` → `Set<visitorId>`), integrado ao fluxo de `domain_recordView` (US-014).
- [X] T010 — RED: teste `domain_readDashboard` retorna `totalViews` correto após aplicar increments pendentes (US-014 cenário "Admin/Editor vê o total de views de um post").
- [X] T011 — GREEN: `src/server/features/analytics/domain/readDashboard.ts` (`domain_readDashboard`) + `PostModel.applyViewIncrements(deltas)` (US-014).
- [X] T012 — RED: teste `domain_readDashboard` retorna posts ordenados desc por `viewCount` (US-014 cenário "Dashboard lista posts mais acessados").
- [X] T013 — GREEN: `PostModel.readMostViewed(limit)`, integrado a `domain_readDashboard` (US-014).
- [X] T014 — RED: teste de procedure `analytics.readDashboard` rejeita usuário Author (`FORBIDDEN`) (US-014 cenário "Dashboard é restrito a Admin/Editor").
- [X] T015 — GREEN: `src/server/features/analytics/procedures/readDashboard.ts`, `roleProcedure(["ADMIN","EDITOR"])` (mesmo guard de `category.create`) (US-014).

## Phase 3 — Boundary

- [X] T016 — `src/server/integrations/gateway/viewCounter/implementations/redis.ts` (`RedisViewCounterGateway`) + teste via `vi.mock("ioredis")` (`implementations/__test__/redis.ts`, mesmo padrão de `mailer/implementations/__test__/nodemailer.ts`) (RF-12, ADR-0013).
- [X] T017 [P] — `src/server/integrations/gateway/viewCounter/implementations/inMemory.ts` (`InMemoryViewCounterGateway`, fallback de dev quando `DISABLE_REDIS=true` — mesmo padrão de `ConsoleMailTransport`) + teste (RF-12).
- [X] T018 [P] — `src/test/gateways/viewCounter.ts` (`FakeViewCounterGateway`) + registra em `src/test/gateways/index.ts` (`createFakeGateways`) (RF-12, ADR-0013).
- [X] T019 — `src/server/infra/container/gateways.ts`: registra `viewCounter` (`RedisViewCounterGateway` ou `InMemoryViewCounterGateway` conforme `env.disableRedis`, mesmo padrão de `mail.useProductionMailer`); depende de T016/T017 (RF-12).
- [X] T020 — `src/server/features/analytics/schema.ts`: `recordViewSchema`/`recordViewOutputSchema`, `readDashboardOutputSchema` (regra 16); depende de T005/T011 pro shape (RF-12).
- [X] T021 — `src/server/features/analytics/procedures/recordView.ts` (`publicProcedure`, lê/gera `visitorId` via `ctx.resCookies`) + teste (`procedures/__test__/recordView.ts`); depende de T005, T020 (US-014).
- [X] T022 — `src/server/createContext.ts`: extrai cookie `visitorId` (mesmo `parseCookie` já usado pra `accessToken`/`refreshToken`); depende de T021 (RF-12).
- [X] T023 — `src/server/features/analytics/index.ts` (`AnalyticsRouter`) + registra `analytics: AnalyticsRouter` em `src/server/routers/app.routes.ts`; depende de T015, T021 (RF-12).
- [X] T024 [P] — `src/components/viewTracker.tsx` (client component, `trpc.analytics.recordView.useMutation` no mount, renderiza `null`); depende de T023 (US-014).
- [X] T025 — `src/app/(half)/post/[slug]/page.tsx`: monta `<ViewTracker postId={post.id} />`; depende de T024 (US-014).
- [X] T026 — `src/app/(half)/analytics/page.tsx` + `page.client.tsx` (dashboard Admin/Editor — total + ranking); depende de T023 (US-014).

## Phase 4 — Reconciliação (8.5)

- [X] T027 — `docs/ach.md § 3.1`: nota sobre `viewCounter` (Gateway-like, dev/prod toggle `disableRedis`, mesmo padrão de `mailer`) — componente concreto além da decisão já em ADR-0013 (RF-12).
- [X] T028 — `docs/roadmap.md` Fase 7: marca `[x]` registrar view / contar total / posts mais acessados / dashboard admin; mantém `[ ]` período/origem/UA/referrer com nota "adiado" (já parcialmente anotado). `docs/ust.md` US-014 status → `done`. `spec.md`/`plan.md` status → `done` (RF-12).
- [X] T029 — Commit(s): migration + backend (gateway/model/domain/procedure/context/router), frontend (`ViewTracker`/página do post/dashboard), docs. Sem push (RF-12).

---

*Toda task referencia US-014 ou RF-12 no commit (regra de `core/afm.md` § 2.7).*
*Toda task é executada como ciclo do `core/afm.md` § 2 — não pula RED (regra 1 — TDD).*
