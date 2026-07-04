# ADR-0007 — Entidades Prisma centralizadas em `src/server/models/`

> **Status:** Aceita e implementada
> **Data:** 2026-07-01
> **Decidido por:** dono do produto

## Contexto

Na data da decisão, `BaseEntity` vivia em `src/server/entities/base/entity.ts` (320 linhas — flagado forward-only por exceder o limite de 300 linhas, `docs/afm.md` § 3.1), com cada entidade concreta em `src/server/entities/<entity>/entity.ts` chamando um `repositories/prisma.ts` próprio. A seleção de qual model do Prisma corresponde a cada entidade estava espalhada nesses repositórios. O dono do produto queria uma classe base CRUD explícita e genérica, cuidando dessa seleção centralizadamente.

## Decisão

Relocar `src/server/entities/` → `src/server/models/`. `models/base.ts` contém a classe CRUD abstrata (genérica sobre o model Prisma correto de cada entidade); cada entidade concreta (`models/post.ts`, `models/user.ts`, etc.) estende essa base. **Sem conceito de cache na base nova** — a base CRUD cuida só de Prisma; cache volta como decisão separada quando o Redis novo (ADR-0009) for desenhado, sem slot/interface reservado hoje (evita acoplar duas decisões ainda imaturas).

## Alternativas consideradas

- **Manter `entities/<entity>/{entity.ts,repositories/prisma.ts}` separados** — rejeitada: espalha a seleção de model Prisma por múltiplos arquivos por entidade, em vez de centralizar na base genérica.
- **Já prever slot de cache na base nova** — rejeitada por agora: acoplaria a decisão de entidades à decisão de Redis (ADR-0009) antes de o Redis novo ter desenho.

## Consequência

- **Fica fácil:** adicionar entidade nova (menos arquivos por entidade); resolver a seleção de model num único lugar.
- **Fica difícil:** resolver corretamente a tipagem genérica de "qual model Prisma corresponde a essa entidade" dentro da base é a parte tecnicamente mais delicada da migração — o próprio dono do produto já sinalizou essa atenção.
- **Débito temporário aceito:** a base nova nasce sem cache. `Session`/`Post`/`User` perdem a camada de cache Redis até uma decisão futura trazê-la de volta — aceitável porque o cache atual já seria descartado por ADR-0009.
- **Load-bearing:** muda onde a regra dura 30 (`afm.md` — Domain/Procedure não importa `PrismaClient`/driver Prisma direto) se verifica.

## Referências

- `docs/afm.md` regra dura 6 (≤300 linhas — motivador da relocação), regra dura 30.
- ADR-0009 (Redis reconstruído do zero — motivo de não prever cache aqui ainda).
