# Feature 017 — Plan

> **Spec:** [`./spec.md`](./spec.md)
> **Status do plan:** approved (implementado e verificado 2026-07-16, gate "Executa até o fim")
> **Stack inferido:** Next.js 15 App Router + tRPC v11 + Prisma 6 + Postgres (source of truth) + Redis (`ioredis@^5.5.0`, já dependência, sem adapter ativo hoje — `docs/ach.md` § 1, `ADR-0003`/`ADR-0009`).
> **Data:** 2026-07-15

## 1. Approach em 3 frases

Um Gateway-like novo (`viewCounter`, Redis-backed) resolve dedup por visitante (SADD+EXPIRE, janela 24h) e contagem (INCR) na mesma chamada — sem scheduler novo, o flush Redis→Postgres é lazy, disparado quando o dashboard de Admin/Editor é lido (mesmo padrão já usado pra visibilidade de `SCHEDULED`, `014-post-review-workflow/plan.md § 4.1`). Uma feature nova `analytics` (mesmo formato `index.ts`+`schema.ts`+`domain/`+`procedures/` de qualquer outra feature) expõe `recordView` (público, disparado por um client component na página do post) e `readDashboard` (`roleProcedure(["ADMIN","EDITOR"])`); persistência agregada vive num campo novo `Post.viewCount`, sem tabela de log de evento (fora de escopo — `spec.md § 4`).

## 2. Componentes afetados

| Componente-tipo | Arquivo / módulo | Novo ou edita | Por quê |
| --- | --- | --- | --- |
| Gateway-like (porta) | `src/server/integrations/gateway/viewCounter/adapter.ts` (`IViewCounterGatewayAdapter`) | novo | dedup + contagem, mesmo nível de `mailer/adapter.ts` |
| Gateway-like (impl.) | `src/server/integrations/gateway/viewCounter/implementations/redis.ts` (`RedisViewCounterGateway`) | novo | `recordView(postId, visitorId)` via `SADD`/`EXPIRE`/`INCR`; `drainPendingCounts()` pro flush |
| Gateway fake (teste) | `src/test/gateways/viewCounter.ts` (`FakeViewCounterGateway`) | novo | mesmo padrão de `FakeMailerGateway`, injetado em `createFakeGateways()` |
| Composition root | `src/server/infra/container/gateways.ts` | edita | registra `viewCounter: new RedisViewCounterGateway(env.redisUrl)` |
| Env | `src/lib/env/index.ts` | edita | adiciona `redisUrl` (lê `REDIS_URL`, já setado em `docker-compose.yml`, hoje não lido em lugar nenhum) |
| Feature-like (router) | `src/server/features/analytics/index.ts` (`AnalyticsRouter`) | novo | agrega `recordView`/`readDashboard` |
| Schema | `src/server/features/analytics/schema.ts` | novo | `recordViewSchema`/output, `readDashboardOutputSchema` |
| Domain-like | `src/server/features/analytics/domain/recordView.ts` (`domain_recordView`) | novo | valida visibilidade pública via `ctx.repositories.post` (`publicVisibilityFilter()`), chama `ctx.gateways.viewCounter.recordView` |
| Domain-like | `src/server/features/analytics/domain/readDashboard.ts` (`domain_readDashboard`) | novo | drena `viewCounter.drainPendingCounts()`, aplica no Postgres via `ctx.repositories.post`, lê ranking |
| Procedure | `src/server/features/analytics/procedures/recordView.ts` | novo | `publicProcedure`; lê/gera `visitorId` via `ctx.resCookies` (mesmo mecanismo de `001-auth-hardening`) |
| Procedure | `src/server/features/analytics/procedures/readDashboard.ts` | novo | `roleProcedure(["ADMIN","EDITOR"])`, mesmo guard de `category.create` |
| Router aggregator | `src/server/routers/app.routes.ts` | edita | registra `analytics: AnalyticsRouter` |
| Context | `src/server/createContext.ts` | edita | extrai cookie `visitorId` (mesmo parse já usado pra `accessToken`/`refreshToken`) |
| Model | `src/server/models/post.ts` | edita | `applyViewIncrements(deltas: Record<string, number>)` (batch update, API padrão Prisma) + `readMostViewed(limit)` |
| Migration | `prisma/migrations/` | novo | `Post.viewCount Int @default(0)` |
| Frontend | `src/components/viewTracker.tsx` | novo | client component, `trpc.analytics.recordView.useMutation` no mount, renderiza `null` |
| Frontend | `src/app/(half)/post/[slug]/page.tsx` | edita | monta `<ViewTracker postId={post.id} />` |
| Frontend | `src/app/(half)/analytics/page.tsx` + `page.client.tsx` | novo | dashboard Admin/Editor — total + ranking de mais acessados |

## 3. Modelo de dados (delta)

`Post` ganha `viewCount Int @default(0)`. Sem entidade nova — `PostView` (log por evento, sugerido no roadmap) fica fora de escopo desta rodada (`spec.md § 4`): sem breakdown por período/origem/referrer/UA nesta rodada, um contador agregado já cobre "total" + "mais acessados".

## 4. Decisões arquiteturais

- **Decisão:** `viewCounter` é **Gateway-like**, não Helper-like. **Alternativa rejeitada:** registrar em `IHelpers` junto de `rateLimit`/`permissions`/`hashing`/`uid`/`slug`. **Por quê:** todo helper atual é puro/local, sem I/O externo — por isso `TestContext.helpers = helpers` usa a implementação REAL até em teste (`src/test/context/testContext.ts`), o que é seguro hoje só porque nenhum helper depende de rede. Se `viewCounter` (Redis real) entrasse como helper, todo teste que tocasse a feature quebraria por falta de Redis no ambiente de teste (`ach.md § 4.1`: "testes de procedure rodam sem Postgres/Redis"). `IGateways` já resolve exatamente esse problema — `mail` é I/O externo e tem `FakeMailerGateway` injetada via `createFakeGateways()`; `viewCounter` reusa a mesma categoria, sem inventar mecanismo novo.
- **Decisão:** dedup e contagem vivem no mesmo gateway/método (`recordView`), não em dois adapters separados. **Alternativa rejeitada:** gateway de contagem + helper de dedup separados (era a sugestão inicial do `research.md` desta feature). **Por quê:** as duas operações acontecem na mesma chamada lógica ("esse visitante já viu esse post nas últimas 24h?"), contra a mesma conexão Redis — separar só duplicaria wiring de composition root sem ganho. Mesmo critério de granularidade já usado por `mailer` (1 gateway, responsabilidades relacionadas).
- **Decisão:** flush Redis→Postgres é lazy, disparado por `readDashboard` (não scheduler/cron). **Alternativa rejeitada:** job periódico. **Por quê:** projeto não tem componente Task-like hoje (`afm.md § 3` regra 12) e já resolveu um problema estruturalmente idêntico assim — visibilidade de `SCHEDULED` é resolvida na leitura, não por job (`014-post-review-workflow/plan.md § 4.1`). "Views desatualizadas até alguém abrir o dashboard" é folga aceitável (não é SLA de tempo real).
- **Decisão:** contador agregado (`Post.viewCount`) em vez de tabela de log (`PostView` por evento). **Alternativa rejeitada:** `PostView { id, postId, visitorId, createdAt, ... }` (sugestão original do roadmap). **Por quê:** esta rodada não entrega breakdown por período/origem (decisão do dono, `spec.md § 4`) — log de evento só se justifica quando esses breakdowns entrarem em pauta; até lá, contador incrementado é mais simples (YAGNI).
- **Decisão:** view registrada via client component (`ViewTracker`) chamando uma mutation tRPC pública, não durante o render do Server Component. **Alternativa rejeitada:** setar cookie/registrar view direto em `post/[slug]/page.tsx` (Server Component). **Por quê:** Next.js App Router não permite `Set-Cookie` durante render de Server Component — só em Route Handler/Server Action. O mecanismo de cookie já existente (`CookieJar`/`resCookies`, `001-auth-hardening`) só é aplicado no `route.ts` do tRPC via `responseMeta` — reusar isso via mutation é a rota já pavimentada, zero mecanismo novo.

> Decisão 1 (Gateway-like + primeiro uso real de `ioredis` em runtime de app) é candidata a ADR — ver § 9.

## 5. Contratos (boundaries externos)

### Boundary `analytics.recordView`

```ts
// input
{ postId: string }

// output (sucesso)
{ counted: boolean } // true = view nova computada; false = dedup (mesmo visitante, últimas 24h)

// errors (codes)
"NOT_FOUND" // post não existe ou não é publicamente visível (publicVisibilityFilter())
```

### Boundary `analytics.readDashboard`

```ts
// input
{} // sem filtro nesta rodada — período/origem ficam pra rodada futura (spec.md § 4)

// output (sucesso)
{
  totalViews: number,
  posts: { id: string, title: string, slug: string, viewCount: number }[] // ordenado desc por viewCount
}

// errors (codes)
"FORBIDDEN" // usuário autenticado sem papel Admin/Editor
```

## 6. Complexity tracking

| Complexidade aceita | Alternativa simples rejeitada | Por quê não foi simples |
| --- | --- | --- |
| Gateway Redis com dedup (SET+TTL) + contador (INCR) + flush lazy | Escrever direto no Postgres a cada view, sem Redis | Write amplification — toda leitura de post viraria um `UPDATE` concorrente no Postgres; `docs/research/002-redis-view-counting.md` já descartou isso |
| Cookie de visitante (`createContext.ts` + `ViewTracker`) | Sem dedup, contar toda visualização | Dono decidiu explicitamente incluir dedup nesta rodada (`spec.md § 7`, sessão 2026-07-15) |

## 7. Validação contra invariantes

- [x] regra 1 (teste): `domain_recordView`, `domain_readDashboard`, ambas procedures, `PostModel.applyViewIncrements`/`readMostViewed`, `RedisViewCounterGateway` (via `vi.mock("ioredis")`, mesmo padrão de `nodemailer/implementations/__test__/nodemailer.ts`), `FakeViewCounterGateway` — todos precisam de teste novo em `tasks.md`.
- [x] regra 2 (zero `any`/`unknown`): tipos explícitos em toda fronteira nova.
- [x] regra 4 (`tsc --noEmit`): checar a cada task.
- [x] regra 5 (nome específico): sem "manager"/"utils"/"helpers" genérico introduzido.
- [x] regra 6 (≤300 linhas): nenhum arquivo novo perto do limite.
- [x] regra 7 (domain exporta 1 função): `domain_recordView` e `domain_readDashboard`, cada um seu próprio arquivo.
- [x] regra 11 (mudança arquitetural) — confirmada com o dono e materializada em `docs/adr/0013-gateway-redis-view-counter.md` (Status: Aceita, 2026-07-15): `viewCounter` é Gateway-like (não Helper-like), primeiro uso real de `ioredis` em runtime de app.
- [x] regra 13 (segredos): `REDIS_URL` não é segredo (infra interna, mesmo padrão de `DATABASE_URL`), sem token/senha novo.
- [x] regra 15 (Domain ≠ Transport): `domain_recordView`/`domain_readDashboard` não lançam `TRPCError`.
- [x] regra 16 (validação no boundary): `postId` validado em `recordViewSchema`; `readDashboard` sem input.

## 8. Riscos

- **Redis indisponível** — `RedisViewCounterGateway.recordView` pode lançar se a conexão cair. Mitigação: `domain_recordView` engole erro do gateway e retorna `{ counted: false }` em vez de propagar — visualização "perdida" é aceitável, quebrar o carregamento da página pro leitor não é (nenhum precedente direto no código pra fail-open de adapter — decisão nova, registrada aqui, não achou evidência suficiente durante o `clarify`, ver spec.md § "Edge Cases" outstanding).
- **Cookie bloqueado pelo leitor** (privacy mode/extensão) — sem cookie, dedup não funciona pra aquele visitante (toda visualização conta como nova). Aceitável — mesmo trade-off já identificado em `docs/features/017-post-view-analytics/research.md`, sem PII em jogo.
- **Primeiro uso de `ioredis` em produção sem teste de integração** — só teste unitário via `vi.mock` (mesmo padrão de `nodemailer`, que também não tem integration test contra SMTP real). Aceitável no nível atual do projeto; candidato a Fase 9/10 se surgir necessidade de teste de integração real.

## 9. Open questions

Nenhum `[NEEDS CLARIFICATION:]` restante — escopo e dedup já resolvidos via `/afm:clarify` (2 sessões documentadas em `spec.md § 7`); classificação Gateway-like/regra 11 resolvida e materializada em `docs/adr/0013-gateway-redis-view-counter.md`. Pronto pra `/afm:tasks`.

---

*Plan NÃO contém: lista granular de tasks (vai pro `tasks.md`). Plan NÃO escolhe stack — lê de `ach.md`.*
