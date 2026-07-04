# ADR-0010 — DTOs substituídos por schemas Zod no boundary de input/output

> **Status:** Aceita e implementada para input/output de procedure
> **Data:** 2026-07-01
> **Decidido por:** dono do produto

## Contexto

Na data da decisão, cada action tinha um `DTO.ts` com types TypeScript puros descrevendo, no mesmo arquivo, os dados de negócio de input/output **e** as dependências injetadas (`repositories`, `helpers`) — ex: `ICreatePostDTO` misturava `title`/`content` com `repositories.database`/`helpers.uid`. O dono do produto quis usar Zod pra validar/tipar os dados de negócio no boundary da procedure (input e output), eliminando o arquivo `DTO.ts`, mantendo o "conceito" de contrato por operação via schema Zod em vez de type TS puro.

## Decisão

Substituir `DTO.ts` por:
1. Schema Zod de **input**, declarado no `schema.ts` da feature (ADR-0006), usado via `.input()` no procedure — consolidação do que hoje já existe em `src/server/schema/`.
2. Schema Zod de **output**, também no `schema.ts` da feature, usado via `.output()` no procedure.

`repositories`/`helpers` **não** entram no schema Zod — não são dados serializáveis vindos de fora, são dependências injetadas. No código atual, chegam ao domain via `ctx` em `DomainInput<T>` (`src/server/createDomain.ts`). A DSL de injeção automática segue decisão futura, não feita nesta conversa — ver ADR-0006.

## Alternativas consideradas

- **Manter DTOs como types TS puros** — rejeitada: só valida em compile-time, não runtime.
- **Também tentar tipar `repositories`/`helpers` via Zod** — rejeitada: não são dados, são funções/adapters injetados; Zod não tem o que validar aí.

## Consequência

- **Fica fácil:** elimina destructuring manual de campos sensíveis (ex: `const { password, ...userWithoutPassword } = user`) — `.output()` do Zod poda o shape antes de responder ao client.
- **Fica difícil:** a tipagem de `repositories`/`helpers` fica sem um mecanismo unificado de validação enquanto a DSL não existe — continua manual, feature por feature.
- **Dependência explícita com decisão futura:** a injeção automática de `repositories`/`helpers` é responsabilidade da DSL de procedures ainda não desenhada (regra dura 11 — mudança arquitetural pára e pergunta). Este ADR decide o destino do DTO de dados de negócio, não a DSL.

## Referências

- `docs/rubrics/validation-boundary.md`.
- DSL de controllers/injeção de dependências — decisão futura, não registrada ainda (ver ADR-0006, nota final).
