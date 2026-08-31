# ADR-0013 — Gateway-like Redis pra contagem/dedup de views (não Helper-like)

> **Status:** Aceita
> **Data:** 2026-07-15
> **Decidido por:** dono do produto

## Contexto

A feature 017 (Analytics de visualizações por post, RF-12/US-014) precisa contar views de post e deduplicar por visitante (janela de 24h, cookie de primeira parte) sem introduzir um message broker (Kafka foi descartado pelo dono — `docs/research/002-redis-view-counting.md`). A solução escolhida usa Redis (`INCR`/`SADD`/`EXPIRE`) como buffer de write-behind, já pesquisada e aprovada. O projeto tem hoje dois "slots" pra integração plugável: `IHelpers` (`src/server/infra/container/helpers.ts`) e `IGateways` (`src/server/infra/container/gateways.ts`). Todo helper atual (`hashing`, `uid`, `slug`, `rateLimit`, `permissions`) é puro/local, sem I/O de rede — por isso `TestContext.helpers = helpers` usa a implementação REAL até em teste, sem override (`src/test/context/testContext.ts`). `ach.md § 4.1` declara explicitamente que "os testes de procedure rodam sem Postgres/Redis". Se o `viewCounter` (que precisa de uma conexão Redis real) fosse registrado como helper, todo teste que tocasse a feature quebraria por falta de Redis no ambiente de teste.

## Decisão

**`viewCounter` é um Gateway-like, registrado em `IGateways`, não em `IHelpers`.**

- `src/server/integrations/gateway/viewCounter/adapter.ts` — `IViewCounterGatewayAdapter`, mesmo nível de `mailer/adapter.ts`.
- `src/server/integrations/gateway/viewCounter/implementations/redis.ts` — `RedisViewCounterGateway`, implementação de produção via `ioredis`.
- `src/test/gateways/viewCounter.ts` — `FakeViewCounterGateway` (in-memory), injetada em `createFakeGateways()`, mesmo padrão de `FakeMailerGateway`.
- Registrado em `src/server/infra/container/gateways.ts` (`gateways.viewCounter = new RedisViewCounterGateway(env.redisUrl)`), não em `helpers.ts`.
- Método único `recordView(postId, visitorId): Promise<{ counted: boolean }>` faz dedup (`SADD postId:visitors:<data> <visitorId>` + `EXPIRE 86400`) e contagem (`INCR`) na mesma chamada — não dois adapters separados.
- Testado via `vi.mock("ioredis")` (mesmo padrão já usado por `nodemailer/implementations/__test__/nodemailer.ts` pra mockar a lib externa em vez de abrir conexão real).

## Alternativas consideradas

- **Registrar como Helper-like, junto de `rateLimit`/`permissions`/`hashing`/`uid`/`slug`** — rejeitada porque `TestContext` usa a implementação real de `helpers` sem nenhum mecanismo de override hoje; um Redis real quebraria todo teste de procedure que tocasse a feature, violando `ach.md § 4.1`.
- **Dois adapters separados (um pra contagem, outro pra dedup)** — rejeitada por duplicar wiring de composition root sem ganho; as duas operações resolvem a mesma pergunta lógica ("esse visitante já viu esse post nas últimas 24h?") na mesma chamada Redis.

## Consequência

- **Fica fácil:** testar sob `vi.mock("ioredis")` sem precisar de Redis real rodando em CI/dev-sem-docker; `TestContext` continua sem precisar de nenhum mecanismo novo de override — reusa exatamente o que `createFakeGateways()` já resolve pra `mail`.
- **Fica difícil / débito aceito:** sem teste de integração real contra Redis (mesma lacuna que `mailer` já tem hoje contra SMTP real) — aceitável no nível atual do projeto, candidato a Fase 9/10 se um dia precisar.
- **Precedente pra próximos adapters:** qualquer integração futura que dependa de I/O real (rede, disco, processo externo) vai em `IGateways`, não `IHelpers` — a distinção "puro/local vs. I/O externo" fica formalizada aqui em vez de decidida de novo caso a caso.

## Referências

- US/RF relacionado: US-014 / RF-12.
- Doc canônico: `docs/features/017-post-view-analytics/plan.md` § 4 (decisão original), `docs/features/017-post-view-analytics/spec.md`, `docs/research/002-redis-view-counting.md`, `docs/features/017-post-view-analytics/research.md`.
- ADRs relacionados: `docs/adr/0003-redis-para-cache-e-sessao.md` (Redis como tecnologia aceita), `docs/adr/0009-reconstruir-redis-do-zero.md` (motivo de não haver adapter Redis ativo antes desta ADR).
