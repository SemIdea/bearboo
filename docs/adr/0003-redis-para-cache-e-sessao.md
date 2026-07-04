# ADR-0003 — Redis para cache e sessão

> **Status:** Aceita como tecnologia; implementação antiga removida pela ADR-0009
> **Data:** 2026-06-30
> **Decidido por:** dono do produto (adoção retroativa)

## Contexto

O Bearboo usava Redis (`ioredis`, antigo `src/server/drivers/redis.ts`) como cache sobre o Postgres, com granularidade por entidade controlada via feature flags (`src/config/featureFlags.ts`: `enableSessionCaching`, `enablePostCaching`, `enableUserCaching`). Em 2026-07-01, a ADR-0009 decidiu remover essa implementação e reconstruir a camada do zero quando houver desenho concreto.

## Decisão

Postgres permanece **source of truth** de todas as entidades (incluindo `Session`, que tem tabela própria via Prisma). Redis permanece tecnologia aceita para cache de leitura futuro, nunca como única fonte de um dado. **Estado atual do código (2026-07-04):** não há porta/adapters Redis ativos em `src/server/`; a reconstrução é trabalho futuro da ADR-0009.

## Alternativas consideradas

- **Cache em memória (in-process)** — não escalaria entre múltiplas instâncias do app; não avaliada no código.
- **Sem cache (só Postgres)** — README indica que Redis foi escolha desde o início para performance de sessão/perfil.

## Consequência

- **Fica fácil:** manter Postgres como fonte única enquanto a camada nova não existe.
- **Fica difícil:** reintroduzir cache exige redesenhar feature flags, invalidação e pontos de leitura/escrita; não há adapter atual para reaproveitar.
- **Load-bearing:** qualquer Redis futuro deve respeitar a invariável: divergência resolve-se sempre lendo do Postgres (ver `ach.md` § 5).

## Referências

- Doc canônico: `/docs/ach.md` § 1 (Dataflow), § 5 (Princípios transversais).
- RF relacionado: RF-01 (sessão), RF-04 (posts), RF-06 (perfil).
