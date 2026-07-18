# Feature 020 — Tasks

> **Spec:** [`./spec.md`](./spec.md)
> **Plan:** [`./plan.md`](./plan.md)
> **Convenção:** TDD-ordenadas. `[P]` = paralelizável. Cada task é um ciclo de `core/afm.md` § 2 (RED → GREEN → REFACTOR → COMMIT).
> **Pré-requisito:** `plan.md` sem `[NEEDS CLARIFICATION:]` aberto — confirmado.

## Phase 1 — Setup

- [X] T001 — `prisma/schema.prisma`: novo model `PostView` (`postId`, `referrerBucket: ReferrerBucket`, `userAgent`, `createdAt`, índices `[postId, createdAt]`/`[createdAt]`) + enum `ReferrerBucket` (`DIRECT`/`SEARCH`/`SOCIAL`/`OTHER`); roda migration (RF-12, US-014).
- [X] T002 [P] — `src/server/features/analytics/schema.ts`: `readDashboardOutputSchema` ganha `viewsLast7Days`, `viewsLast30Days`, `trafficOrigin: { bucket, count }[]`, `browsers: { name, count }[]` (RF-12).

## Phase 2 — Foundation (testes vermelhos primeiro, por cenário Gherkin de `spec.md § 3`)

- [X] T003 — RED: `src/lib/referrerClassifier/__test__/regex.ts` — `classify()` mapeia `google.com`/`bing.com` → `SEARCH`, `twitter.com`/`facebook.com` → `SOCIAL`, `null`/vazio → `DIRECT`, domínio desconhecido → `OTHER` (US-014 cenário "Dashboard mostra origem de tráfego").
- [X] T004 — GREEN: `src/lib/referrerClassifier/{adapter.ts,implementations/regex.ts}`.
- [X] T005 [P] — RED: `src/lib/userAgentClassifier/__test__/regex.ts` — `classify()` reconhece Chrome/Firefox/Safari/Edge × Windows/Mac/Linux/iOS/Android a partir de strings de UA reais; string não reconhecida → `{ browser: "Unknown", os: "Unknown" }` (US-014 cenário "Dashboard mostra breakdown de navegador/SO").
- [X] T006 [P] — GREEN: `src/lib/userAgentClassifier/{adapter.ts,implementations/regex.ts}`.
- [X] T007 — Registra os dois helpers em `src/server/infra/container/helpers.ts` (`IHelpers.referrerClassifier`/`.userAgentClassifier`); nenhum teste próprio (wiring puro, mesmo padrão de `rateLimit`).
- [X] T008 — RED: `src/server/integrations/gateway/viewCounter/implementations/__test__/{redis,inMemory}.ts` — `recordView(postId, visitorId, event)` bufferiza `event` só quando `counted: true`; `drainPendingEvents()` retorna e limpa os eventos bufferizados por post (US-014 cenários de período/origem/UA).
- [X] T009 — GREEN: estende `adapter.ts` (3º parâmetro `event: { referrerBucket, userAgent }` + método `drainPendingEvents()`) e as duas implementações (`redis.ts` via `RPUSH`/`LRANGE`+`DEL`; `inMemory.ts` via array por post).
- [X] T010 — Espelha a mesma extensão em `src/test/gateways/viewCounter.ts` (`FakeViewCounterGateway`) — necessário pra `TestContext` sustentar os testes de domain/procedure das próximas tasks; sem teste próprio (fake de teste, não produção).
- [X] T011 — RED: `src/server/models/__test__/postView.ts` — `PostViewModel.create` grava uma linha; `countSince`/`readReferrerBreakdown`/`readUserAgents` filtram pela janela; `deleteOlderThan(sinceDays)` remove só as linhas fora da janela (US-014 cenário "Views antigas não contam mais pro breakdown").
- [X] T012 — GREEN: `src/server/models/postView.ts` (`IPostViewModel`) + registra em `src/server/infra/container/repositories.ts` (`IRepositories.postView`).
- [X] T013 — RED: `src/server/features/analytics/domain/__test__/recordView.ts` — atualiza teste existente pra esperar que `domain_recordView` resolve `referrerBucket` via `ctx.helpers.referrerClassifier` e chama `ctx.gateways.viewCounter.recordView(postId, visitorId, { referrerBucket, userAgent })`.
- [X] T014 — GREEN: edita `src/server/features/analytics/domain/recordView.ts`.
- [X] T015 — RED: `src/server/features/analytics/domain/__test__/readDashboard.ts` — atualiza/estende teste existente: drena `pendingEvents`, persiste via `repositories.postView.create`, chama `repositories.postView.deleteOlderThan(30)`, retorna `viewsLast7Days`/`viewsLast30Days`/`trafficOrigin`/`browsers` (categorizados via `ctx.helpers.userAgentClassifier` sobre o `userAgent` bruto salvo) além do `totalViews`/`posts` já existentes, sem regressão (US-014 cenários "views dos últimos 7/30 dias", "breakdown de navegador/SO", "comportamento existente sem regressão").
- [X] T016 — GREEN: edita `src/server/features/analytics/domain/readDashboard.ts`.

## Phase 3 — Boundary

- [X] T017 — RED+GREEN: `src/server/features/analytics/procedures/__test__/recordView.ts` — procedure extrai `ctx.headers.get("referer")`/`.get("user-agent")` e repassa pro domain (US-014).
- [X] T018 — RED+GREEN: `src/server/features/analytics/procedures/__test__/readDashboard.ts` — output inclui os 4 campos novos; `FORBIDDEN` pra papel insuficiente continua igual (regressão) (US-014).
- [ ] T019 [P] — `src/app/(half)/analytics/page.client.tsx`: cards "últimos 7 dias"/"últimos 30 dias" + listas de origem de tráfego e navegador/SO, consumindo o novo shape de `analytics.readDashboard`. Verificado ao vivo via `next dev` (sem teste unitário — mesmo padrão de UI de `019-search-sort-by-views/tasks.md` T011).

`yarn test`, `npx tsc --noEmit`, `yarn lint` e `yarn build` verdes ao fim da Phase 3.

## Phase 4 — Reconciliação (8.5)

- [ ] T020 — `docs/ust.md` US-014: adiciona os cenários Gherkin novos (período, origem, UA, retenção) aos critérios de aceitação; adiciona `docs/features/020-view-analytics-breakdown/` aos *Test ref*/*Spec*. `docs/prd.md` RF-12: atualiza a nota que citava o detalhamento adiado pro `plan.md` de 017. `docs/roadmap.md` Fase 7: marca `[x]` contar views por período / origem do tráfego / user agent / referrer; Fase 7 vira ✅ Concluída (sem pendências adiadas) na tabela de progresso geral e na seção detalhada. `spec.md` status → `done`.
- [ ] T021 — ADR documentando a decisão de retenção de 30 dias + não persistir IP + buffer de eventos no Redis via `viewCounter` (decisão load-bearing de privacidade/arquitetura, mesmo nível da ADR-0013) — via `/afm:adr`.
- [ ] T022 — Commit(s) em `feature/020-view-analytics-breakdown` (criada a partir de `develop`, regra dura 32). Sem push (RF-12).

---

*Toda task referencia US-014 ou RF-12 no commit (regra de `core/afm.md` § 2.7).*
*Toda task é executada como ciclo do `core/afm.md` § 2 — não pula RED (regra 1 — TDD).*
