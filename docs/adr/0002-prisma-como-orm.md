# ADR-0002 — Prisma como ORM

> **Status:** Aceita (retroativo, originado em `/afm:refactor`)
> **Data:** 2026-06-30
> **Decidido por:** dono do produto (adoção retroativa)

## Contexto

O Bearboo persiste em Postgres via Prisma (`prisma/schema.prisma`, `@prisma/client`, `@prisma/extension-accelerate`). Todas as 6 entidades (User, Session, Post, Comment, VerificationToken, ResetToken) e suas migrations (`prisma/migrations/`) vivem sob esse schema único desde o início observável do histórico.

## Decisão

Schema declarativo único em `prisma/schema.prisma`; migrations geradas via Prisma CLI. Cada entidade tem um repository adapter dedicado (`src/server/entities/<entity>/repositories/prisma.ts`) que implementa a porta tipada (`adapter.ts`), isolando o client Prisma do restante do domínio (regra dura 30 do `afm.md`: Entity/Service não importa `PrismaClient` direto).

## Alternativas consideradas

- **Drizzle / query builder manual** — não avaliada no código; sem vestígio de migração ou experimento.

Decisão direta — sem alternativa avaliada no código.

## Consequência

- **Fica fácil:** migrations versionadas e reproduzíveis; tipos gerados automaticamente do schema.
- **Fica difícil:** trocar de ORM exige reescrever todos os `repositories/prisma.ts` (6 entidades) e o `driver` (`src/server/drivers/prisma.ts`), mas o impacto fica contido nessa camada — o resto do domínio já depende só da porta tipada, não do Prisma direto.
- **Load-bearing:** schema declarativo + migrations geradas são a fonte de verdade do modelo de dados; trocar de ORM hoje é reescrita de infraestrutura, não de regra de negócio.

## Referências

- Doc canônico: `/docs/ach.md` § 2 (regras de import), § 3.1 (Adapter-like), `afm.md` regra dura 30.
- RF relacionado: todas (persistência é transversal).
