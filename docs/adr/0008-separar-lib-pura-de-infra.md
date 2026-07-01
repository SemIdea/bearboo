# ADR-0008 — Separar lib pura (`src/lib/`) de infra (`src/server/infra/`)

> **Status:** Aceita
> **Data:** 2026-07-01
> **Decidido por:** dono do produto

## Contexto

A proposta inicial do refactor do server era colocar Prisma, Redis, helpers e utils todos em `src/lib/`. A rubrica `docs/rubrics/when-to-create-lib.md` (já materializada no projeto) distingue **lib pura** (zero dependência de ORM/framework, publicável isoladamente) de **infra** (wrapper de client externo com config — Prisma, Redis, DI container), sendo explícita: *"❌ lib que importa o ORM → não é lib pura"*. Confrontada com a rubrica, a proposta foi revista.

## Decisão

`src/lib/` fica reservado pra código sem dependência de ORM/framework — candidatos confirmados: `uidGenerator`, `passwordHashing`, utils genéricos (hoje em `src/server/integrations/helpers/` e `src/lib/`). `src/server/infra/` recebe os clients externos com config e o container de DI — hoje em `src/server/drivers/` (Prisma/Redis client) e `src/server/container/` (wiring de implementações concretas).

## Alternativas consideradas

- **Pasta única `src/lib/` pra tudo** — rejeitada: mistura lib pura com infra, contrariando a distinção que o próprio projeto documentou na rubrica antes deste refactor.

## Consequência

- **Fica fácil:** saber, só pelo path, se um módulo é publicável isoladamente (`lib/`) ou depende do runtime do app (`infra/`).
- **Fica difícil:** migração toca `drivers/` e `container/` e todos os imports que apontam pra esses paths hoje.
- **Load-bearing:** define onde código futuro (novo helper, novo client externo) deve nascer — critério herda da rubrica, não é ad-hoc por PR.

## Referências

- `docs/rubrics/when-to-create-lib.md`.
