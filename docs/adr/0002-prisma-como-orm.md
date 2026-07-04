# ADR-0002 — Prisma como ORM

> **Status:** Aceita (retroativo, originado em `/afm:refactor`)
> **Data:** 2026-06-30
> **Decidido por:** dono do produto (adoção retroativa)

## Contexto

O Bearboo persiste em Postgres via Prisma (`prisma/schema.prisma`, `@prisma/client`, `@prisma/extension-accelerate`). Todas as 6 entidades (User, Session, Post, Comment, VerificationToken, ResetToken) e suas migrations (`prisma/migrations/`) vivem sob esse schema único desde o início observável do histórico.

## Decisão

Schema declarativo único em `prisma/schema.prisma`; migrations geradas via Prisma CLI. Cada entidade tem um model dedicado (`src/server/models/<entity>.ts`) registrado no composition root (`src/server/infra/container/repositories.ts`), isolando o client Prisma do restante do domínio (regra dura 30 do `afm.md`: Domain/Procedure não importa `PrismaClient` nem o driver Prisma direto).

## Alternativas consideradas

- **Drizzle / query builder manual** — não avaliada no código; sem vestígio de migração ou experimento.

Decisão direta — sem alternativa avaliada no código.

## Consequência

- **Fica fácil:** migrations versionadas e reproduzíveis; tipos gerados automaticamente do schema.
- **Fica difícil:** trocar de ORM exige reescrever os models de dados (`src/server/models/*.ts`) e o driver (`src/server/infra/drivers/prisma.ts`), mas o impacto fica contido nessa camada — o resto do domínio já depende só de `ctx.repositories`, não do Prisma direto.
- **Load-bearing:** schema declarativo + migrations geradas são a fonte de verdade do modelo de dados; trocar de ORM hoje é reescrita de infraestrutura, não de regra de negócio.

## Referências

- Doc canônico: `/docs/ach.md` § 2 (regras de import), § 3.1 (Adapter-like), `afm.md` regra dura 30.
- RF relacionado: todas (persistência é transversal).
