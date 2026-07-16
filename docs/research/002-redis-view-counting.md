# Research — Redis para contagem de views de post (sem Kafka)

> **Localização:** `docs/research/002-redis-view-counting.md`
> **Data:** 2026-07-15
> **Disparado por:** investigação livre — dono cogitou Kafka pra contar views (Fase 7 — Analytics interno), descartou e pediu pesquisa de como usar Redis em vez disso.
> **Status:** draft

## Como contar views de post usando Redis, de forma testável e sem scheduler novo?

**Decision (proposta):** Redis como *write-behind buffer* — `INCR` por `postId` em produção, com flush batched (assíncrono) pro Postgres. Nenhum componente de fila/broker dedicado (Kafka etc.).

**Rationale:**
- Este projeto já tem o padrão `adapter.ts` + `implementations/<impl>.ts` injetado via composition root (`src/server/infra/container/`) usado em `src/lib/rateLimit/`, `src/lib/passwordHashing/`, `src/lib/uidGenerator/` — um `IViewCounterAdapter` (`recordView`, `flush`) com implementação `inMemory` (testável sob `vitest`/`prisma-mock`, mesmo molde de `InMemoryRateLimit`) e implementação `redis` (produção, via `ioredis`) se encaixa sem inventar camada nova.
- `ioredis@^5.5.0` já é dependência do `package.json` e o serviço `cache` (Redis) já roda via `docker-compose` — não é infra nova, só um adapter que hoje não existe (`ADR-0009` removeu a implementação anterior de cache Redis por não ter nada reaproveitável; `ADR-0003` mantém Redis como tecnologia aceita).
- `INCR` é atômico e de baixíssima latência (~1-2ms local) — não há necessidade de ordenação/garantia de entrega de um message broker pra esta escala (blog pessoal, tráfego baixo).
- O flush Redis→Postgres não precisa de um scheduler novo: o projeto já resolveu um problema análogo (`SCHEDULED` posts, Fase 4) checando `scheduledAt <= now` **na leitura**, em vez de introduzir um componente Task/cron (nenhum existe hoje — nota em `docs/afm.md` § 3 regra 12). O mesmo princípio se aplica aqui: flush pode ser disparado sob demanda (lazy, quando o dashboard de analytics é lido) em vez de por cron.
- O domain nunca importaria `ioredis` diretamente — só o adapter, mantendo `domain_<action>` livre de detalhe de infra (regra dura 15/16, mesmo padrão dos outros adapters).

**Alternativas consideradas:**
- **Redis Sorted Set (`ZINCRBY` por post, ranking sempre ordenado)** — rejeitada por ora: "mais acessados" é uma pergunta de leitura (`ORDER BY count DESC LIMIT N` no Postgres já resolve na escala do projeto), fazer double-write em `ZINCRBY` + Postgres antecipa uma otimização sem necessidade comprovada.
- **Redis Set/HyperLogLog pra dedup de visitante único por post/dia** — rejeitada por ora: conta visitante único, não total de views; a Fase 7 do roadmap pede "contar views totais" primeiro, dedup de visitante é refinamento posterior, não bloqueante.
- **Escrita direta e assíncrona no Postgres (fire-and-forget, fila em memória, sem Redis)** — rejeitada: fila só em RAM do processo perde dados em crash/restart, sem persistência; também abandonaria a decisão já tomada (`ADR-0003`) de usar Redis quando fizer sentido.
- **Kafka/message broker dedicado** — rejeitada pelo próprio dono antes desta pesquisa: overhead operacional (rodar/manter um broker) desproporcional a um blog com tráfego de dezenas/centenas de views por dia; ordenação/garantia de entrega forte não é requisito real aqui.

**Sources:**
- https://redis.io/commands/incr/ — atomicidade e throughput de `INCR`.
- https://github.com/luin/ioredis#readme — lib já usada no projeto (`ioredis@^5.5.0`).
- https://martinfowler.com/bliki/WriteThrough.html — padrão write-behind (Redis como buffer transiente antes do flush pro store definitivo).
- https://www.prisma.io/docs/orm/prisma-client/queries/crud#create-multiple-records — `createMany` pro flush batched.
- `docs/adr/0003-redis-para-cache-e-sessao.md` — Redis segue como tecnologia aceita.
- `docs/adr/0009-reconstruir-redis-do-zero.md` — motivo de não haver adapter Redis ativo hoje (implementação anterior removida, não a decisão de tecnologia).
- `docs/afm.md` § 3 regra 12 — ausência de componente Task/scheduler no projeto hoje; mesmo racional já aplicado a `SCHEDULED` posts (Fase 4) evita introduzir um agora.
- **Evidência insuficiente:** benchmark público específico de "Redis INCR pra view counter em blog de baixo tráfego" — não encontrado; é padrão amplamente aceito na indústria mas sem fonte formal citável pra esta escala exata.

---

*Research global (não atrelada a feature) é insumo pra decisões futuras de PRD/ACH ou pra ADRs cross-projeto. Pra incorporar:*
*1. Cita esta research em qualquer doc do projeto que decide com base nela (ex: `prd.md` § 4 RFs, `ach.md` § 1 stack, ADR específico).*
*2. Se virar decisão load-bearing, materializa como ADR via `/afm:<skill> adr`.*
*3. Após incorporar, mude `Status` deste arquivo de `draft` pra `applied`.*
