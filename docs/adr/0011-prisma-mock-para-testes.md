# ADR-0011 — `prisma-mock` como fake do PrismaClient nos testes

> **Status:** Aceita e implementada
> **Data:** 2026-07-06
> **Decidido por:** dono do produto

## Contexto

Pendência técnica de `ust.md`: os testes rodavam contra repositórios fake in-memory escritos à mão (`src/test/repositories/`, ~250 linhas), que duplicavam cada query customizada dos models — manutenção dupla insustentável (a "sujeira escondida atrás do tapete"). O padrão de transport pluggável do mailer não transfere de graça pro Prisma: o port do mailer é stateless/write-only; o de dados é stateful (testes de fluxo dependem de read-your-writes), então mock programado por teste (`mockResolvedValue`, recomendação oficial do Prisma) roteiriza cada leitura e acopla o teste à query. Research completa com alternativas e fontes em [`docs/research/001-teste-prisma-sem-banco-real.md`](../research/001-teste-prisma-sem-banco-real.md); dois candidatos de fake schema-driven foram validados empiricamente 8/8 contra a superfície Prisma real do projeto (spikes de 2026-07-05/06).

## Decisão

Adotar **`prisma-mock`** (devDependency) como implementação in-memory do `PrismaClient` nos testes, gerada do `schema.prisma`:

- Seam único: `src/test/setup.ts` (`setupFiles` do vitest) faz `vi.mock` de `src/server/infra/drivers/prisma.ts` → client de `src/test/prisma/`.
- Models/domain/procedures de produção rodam **intactos** nos testes; `src/test/repositories/` deletado; gateways continuam com fake manual.
- Isolamento por teste: `resetPrismaMock()` (`$setInternalState` com arrays vazios por model do DMMF) em `beforeEach` global.
- Uso obrigatório do entry **`prisma-mock/client`** passando `Prisma` + `Prisma.dmmf.datamodel`.

## Alternativas consideradas

- **`prismock`** — rejeitada: parado desde jun/2025, `@updatedAt` devolve `null` (exigiria `@default(now())` no schema) e não enforça unique constraints. `prisma-mock` (fev/2026, peer `^6 || ^7`, entry dedicado pra Prisma 7) cobre exatamente o risco de abandono que preocupava.
- **Manter fakes à mão** — rejeitada: é a duplicação que motivou a pendência.
- **Mock programado por teste (`vitest-mock-extended`, doc oficial)** — rejeitada como mecanismo principal: não sustenta fluxo stateful; segue válido pontualmente pra afirmar a forma exata de uma query.
- **Banco real efêmero** — adiada: PGlite quebra `prisma migrate` (P1017); rollback-por-transação (`vitest-environment-prisma-postgres`) exige Postgres rodando. Candidato pra camada fina de integração no CI (roadmap Fase 9/10), complementar — não substituto.

## Consequência

- **Fica fácil:** query nova no model funciona nos testes sem código extra; testes continuam comportamentais (`createAuthenticatedContext()`/`createPost()`); unique constraints enforçadas (P2002) — mais fidelidade que os fakes antigos.
- **Fica difícil / armadilhas conhecidas:**
  - O entry default do `prisma-mock` quebra com `@prisma/client` 6.x (`require("@prisma/client/default")` não exposto no exports map) — usar sempre `prisma-mock/client`.
  - `$clear()` da lib zera o estado **sem** as chaves dos models e `deleteMany`/`$transaction` explodem em model não recriado — usar só `resetPrismaMock()`.
- **Risco aceito:** dependência de terceiro num único seam. Plano B (custo ~1 dia): restaurar os fakes à mão do git (existiam até o commit `60700be`) ou trocar de lib no mesmo seam.
- **Load-bearing:** regra dura 30 ganha `src/test/prisma/` como exceção da camada de dados.

## Referências

- `docs/research/001-teste-prisma-sem-banco-real.md` (comparativo completo + sources).
- https://github.com/demonsters/prisma-mock
- ADR-0007 (models com delegate), padrão do mailer em `src/server/integrations/gateway/mailer/`.
