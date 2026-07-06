# Research — Testar código Prisma sem banco real (alternativas ao fake à mão)

> **Data:** 2026-07-06
> **Disparado por:** investigação livre: "estratégias de teste com Prisma sem banco real — alternativas ao prismock (mocks, fakes, in-memory, SQLite, testcontainers)" (pendência técnica de `ust.md`)
> **Status:** applied — decisão materializada na ADR-0011 (`prisma-mock` adotado em 2026-07-06). Aprendizados da adoção: entry `prisma-mock/client` é obrigatório com `@prisma/client` 6.x; `$clear()` é bugado (reset via `$setInternalState` — ver `src/test/prisma/`).
> **Método:** 3 agentes de pesquisa web em paralelo + 2 spikes empíricos locais (prismock e prisma-mock, 8 testes cada cobrindo a superfície Prisma real do projeto: findUnique em @unique, findFirst, findMany+include+orderBy+take, create/update/delete, deleteMany, $transaction interativo, @updatedAt)

## Contexto e requisitos

Testes atuais são fluxos stateful por procedure tRPC (read-your-writes via `TestContext`). Requisitos: (a) sem banco/Docker/serviço externo (docker de teste removido de propósito em 2026-07-04); (b) sem roteirizar mock por teste (`mockResolvedValue` acopla o teste à query e não sustenta fluxo); (c) sem manter fake in-memory à mão (a duplicação atual em `src/test/repositories/` é a dor).

## Fake schema-driven do PrismaClient (client in-memory gerado do schema)

**Decision (proposta):** adotar um fake gerado automaticamente do `schema.prisma` no seam do driver (`src/server/infra/drivers/prisma.ts` via `vi.mock`), eliminando os fakes à mão. Dois candidatos viáveis, ambos validados empiricamente 8/8:

| | `prismock@1.35.4` | `prisma-mock@1.1.0` |
| --- | --- | --- |
| Último release | jun/2025 | **fev/2026** |
| Peer deps | `*` (indefinido) | **`^6.0.0 \|\| ^7.0.0` explícito** (entry dedicado pra Prisma 7) |
| Spike 8/8 | ✔ (com `@default(now())` no `updatedAt` do schema + `prisma generate`) | ✔ (via entry `prisma-mock/client` passando `Prisma.dmmf`) |
| `@updatedAt` | ⛔ devolve `null` (workaround de schema necessário) | ✔ nativo |
| Unique constraints | ⛔ não enforça | ✔ enforça (P2002 — mais fidelidade) |
| Isolamento entre testes | ✔ `reset()` nativo — adoção trivial | ⛔ sem `reset()`; entry default quebrado com `@prisma/client@6.5` (`require("@prisma/client/default")` não exposto no exports map) — exige client novo por teste ou proxy no seam |
| `$transaction` interativo, include, orderBy/take | ✔ | ✔ |

**Rationale:**
- Testes continuam exatamente como estão (comportamentais, `createAuthenticatedContext()`/`createPost()`); `src/test/repositories/` (fakes à mão) é deletado — mata a duplicação na raiz.
- Consenso da comunidade (ver seção 3): fake stateful pra fluxo > mock programado por teste.
- Risco de abandono contido: devDependency num único seam; plano B = voltar aos fakes (no git) ou trocar de lib (mesmo seam).

**Alternativas consideradas (dentro desta família):**
- **`vitest-mock-extended`/`jest-mock-extended` (recomendação oficial do Prisma)** — rejeitada como mecanismo principal: mock programado por teste não sustenta fluxo read-your-writes (roteirização por teste, acoplamento à query — teste quebra trocando `findUnique`→`findFirst` sem mudança de comportamento). Útil pontualmente pra teste unitário de query exata.

## Banco real leve/efêmero

**Decision (proposta):** não adotar agora; candidato futuro pra uma camada fina de integração (CI), não substituto do unit.

**Rationale:**
- **PGlite (`pglite-prisma-adapter`)** — Postgres real em WASM sem Docker, mas `prisma migrate dev` falha (P1017, shadow database incompatível com WASM; issue prisma#29366); só `db push`, adapter em EA. Promissor, imaturo hoje.
- **`vitest-environment-prisma-postgres` (rollback por transação, v2.0.0 jun/2026)** — isolamento excelente e rápido, mas exige um Postgres rodando (local/Docker/nuvem) → viola o requisito sem-serviço pra dev local. Bom candidato pra CI.
- **SQLite in-memory** — rejeitada: provider mismatch com schema PostgreSQL (migrations divergem; falso negativo).
- **Testcontainers** — rejeitada: Docker obrigatório, removido de propósito.
- **`pg-mem`** — Postgres emulado em JS puro (SQL real, sem Docker); suporte a Prisma historicamente experimental — **evidência insuficiente** pra Prisma 6; não spikado.

## Consenso da comunidade sobre a dor ("fake duplicado é insustentável")

**Decision (proposta):** pirâmide — fake schema-driven pra testes de fluxo (rápidos, maioria) + futuramente poucos testes de integração contra Postgres real (constraints/SQL de verdade, ex. em CI com Testcontainers ou `vitest-environment-prisma-postgres`), quando a Fase 9/10 do roadmap (qualidade/CI) chegar.

**Rationale:**
- Posição classicist (Fowler, "Mocks Aren't Stubs" / "Practical Test Pyramid"): verificação de estado com objetos reais/fakes > verificação de interação; mock de ORM acopla o teste à implementação.
- Crítica recorrente a mockar Prisma (nico.fyi "Stop mocking Prisma in tests"; SimplyBlock): falsa confiança — constraint/SQL real nunca exercitado. Mitigação: fake com enforcement (prisma-mock enforça unique) + camada fina de integração real futura.
- A dor específica "manter fake espelhado à mão" aparece na comunidade resolvida exatamente por fakes **gerados do schema** (prismock/prisma-mock) — zero manutenção manual.

## Sources

- https://www.prisma.io/docs/orm/prisma-client/testing/unit-testing (recomendação oficial: jest-mock-extended)
- https://github.com/morintd/prismock
- https://github.com/demonsters/prisma-mock (release fev/2026; peer `^6 || ^7`)
- https://github.com/prisma/prisma/discussions/20244 (mock Prisma + Vitest + Next.js)
- https://www.npmjs.com/package/pglite-prisma-adapter · https://pglite.dev/docs/orm-support
- https://github.com/prisma/prisma/issues/29366 (`prisma migrate dev` × PGlite, P1017)
- https://github.com/codepunkt/vitest-environment-prisma-postgres · https://codepunkt.de/writing/blazing-fast-prisma-and-postgres-tests-in-vitest/
- https://github.com/prisma/prisma/discussions/3642 (SQLite × schema Postgres)
- https://martinfowler.com/articles/mocksArentStubs.html · https://martinfowler.com/articles/practical-test-pyramid.html
- https://www.nico.fyi/blog/stop-mocking-prisma-in-tests
- https://dev.to/oguimbal/how-to-really-unit-test-code-that-uses-a-db-3gmg (pg-mem)
- https://www.simplyblock.io/blog/database-testing-without-mocks/
- Spikes locais (2026-07-05/06, não commitados): prismock 8/8 com `@default(now())`; prisma-mock 8/8 via `prisma-mock/client` + `Prisma.dmmf` (entry default quebra com `@prisma/client@6.5`: `./default` ausente do exports map)
