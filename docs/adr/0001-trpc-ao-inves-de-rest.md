# ADR-0001 — tRPC ao invés de REST

> **Status:** Aceita (retroativo, originado em `/afm:refactor`)
> **Data:** 2026-06-30
> **Decidido por:** dono do produto (adoção retroativa — decisão original já estava no código antes da adoção do AFM)

## Contexto

O Bearboo é full-stack Next.js com client e server no mesmo monorepo. O código já usa tRPC v11 (`@trpc/server`, `@trpc/client`, `@trpc/react-query`, `@trpc/next`) desde o início do histórico observável — não há vestígio de uma API REST anterior. A decisão é inferida do código (`src/server/routers/*.routes.ts`, `src/app/api/trpc/[trpc]/route.ts`, `src/context/trpc/*`), não de um registro original.

## Decisão

Toda comunicação client ↔ server passa por procedures tRPC, com um único route handler HTTP (`src/app/api/trpc/[trpc]/route.ts`) expondo o router agregado (`src/server/routers/app.routes.ts`).

Contrato: `router → controller → service → entity → repository`, com tipos inferidos ponta-a-ponta (sem geração de OpenAPI/schema separado hoje).

## Alternativas consideradas

- **REST tradicional** — não foi escolhida: perderia type-safety end-to-end entre client e server sem uma camada de geração de tipos adicional.

Decisão direta — sem alternativa avaliada no código; REST não deixou vestígio no histórico.

## Consequência

- **Fica fácil:** refactors de contrato entre client/server são pegos em compile-time (`tsc`).
- **Fica difícil:** consumir a API fora do ecossistema TS/tRPC (ex: app mobile nativo, integração externa) exigiria adaptar ou expor REST em paralelo.
- **Load-bearing:** trocar tRPC por REST hoje quebraria todos os clients tipados (`src/context/trpc/*`) e o padrão router→controller de toda a camada `server/features/`.

## Referências

- Doc canônico: `/docs/ach.md` § 1, § 3.1 (Procedure-like).
- RF relacionado: RF-01 a RF-06 (toda a API).
