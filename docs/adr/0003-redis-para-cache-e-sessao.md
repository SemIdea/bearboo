# ADR-0003 — Redis para cache e sessão

> **Status:** Aceita (retroativo, originado em `/afm:refactor`)
> **Data:** 2026-06-30
> **Decidido por:** dono do produto (adoção retroativa)

## Contexto

O Bearboo usa Redis (`ioredis`, `src/server/drivers/redis.ts`) como cache sobre o Postgres, com granularidade por entidade controlada via feature flags (`src/config/featureFlags.ts`: `enableSessionCaching`, `enablePostCaching`, `enableUserCaching`). O README também cita Redis explicitamente ("Sessões seguras com Redis, utilizado como cache para sessões e perfis de usuário").

## Decisão

Postgres permanece **source of truth** de todas as entidades (incluindo `Session`, que tem tabela própria via Prisma). Redis é uma camada de **cache de leitura opcional**, acessada através da porta tipada `ICacheRepositoryAdapter` (`src/server/integrations/repositories/cache/adapter.ts`), nunca como única fonte de um dado. Cada tipo de cache é independentemente desligável via feature flag, sem exigir deploy de código.

## Alternativas consideradas

- **Cache em memória (in-process)** — não escalaria entre múltiplas instâncias do app; não avaliada no código.
- **Sem cache (só Postgres)** — README indica que Redis foi escolha desde o início para performance de sessão/perfil.

## Consequência

- **Fica fácil:** desligar cache de uma entidade específica em produção sem deploy (feature flag), útil pra debugar staleness.
- **Fica difícil:** qualquer bug de invalidação de cache é uma segunda fonte de verdade a considerar — divergência resolve-se sempre lendo do Postgres (ver `ach.md` § 5).
- **Load-bearing:** remover Redis hoje muda a estratégia de performance de sessão/post/user; reintroduzir exigiria reavaliar os feature flags e os pontos de invalidação em cada `service.ts` que escreve.

## Referências

- Doc canônico: `/docs/ach.md` § 1 (Dataflow), § 5 (Princípios transversais).
- RF relacionado: RF-01 (sessão), RF-04 (posts), RF-06 (perfil).
