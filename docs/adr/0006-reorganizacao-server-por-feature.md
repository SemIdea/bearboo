# ADR-0006 — Reorganização do server por feature (domain + procedures)

> **Status:** Aceita
> **Data:** 2026-07-01
> **Decidido por:** dono do produto

## Contexto

Hoje `src/server/` organiza cada ação numa pasta `features/<feature>/<action>/{controller.ts,service.ts,DTO.ts}`, com as rotas tRPC separadas em `src/server/routers/<feature>.routes.ts` e os schemas Zod em `src/server/schema/<feature>.schema.ts`. Essa convenção (Controller/Service) foi documentada retroativamente em `ach.md` § 3.1 como variante própria do projeto, distinta do vocabulário universal do AFM (Procedure-like/Domain-like) e do módulo tRPC do plugin (convenção `procedure_*`/`domain_*`). Durante um refactor maior do server (2026-07-01), o dono do produto decidiu reorganizar por feature, com rotas e schemas centralizados na própria pasta.

## Decisão

Nova estrutura por feature:

```
src/server/features/<feature>/
  index.ts       # rotas tRPC da feature (substitui routers/<feature>.routes.ts)
  schema.ts      # schemas Zod de input/output da feature (substitui server/schema/<feature>.schema.ts)
  domain/        # funções de regra de negócio (substitui service.ts de cada action)
  procedures/    # handlers que orquestram domain (substitui controller.ts de cada action)
```

Cada `controller.ts`/`service.ts` das 19 actions existentes migra pra `procedures/`/`domain/` respectivamente, feature por feature.

## Alternativas consideradas

- **Manter a convenção atual (Controller/Service)** — rejeitada: mantém `ach.md` permanentemente "tradutor" de uma convenção própria em vez de usar o vocabulário universal já documentado no plugin AFM.

## Consequência

- **Fica fácil:** `ach.md`/`afm.md` alinham direto com o vocabulário universal do AFM e do módulo tRPC — menos tradução na doc.
- **Fica difícil:** migração toca as 19 features existentes (`controller.ts`+`service.ts`+`DTO.ts` cada) — é refactor grande, não incremental trivial.
- **Load-bearing:** muda o "onde o código vai" documentado em `ach.md` § 3.1 pra todo trabalho futuro.
- **Decisões relacionadas do mesmo refactor:** ADR-0007 (entidades), ADR-0008 (lib vs infra), ADR-0009 (Redis), ADR-0010 (DTOs → Zod). A DSL de controllers/injeção de dependências mencionada nesta conversa **não está decidida** — fica pendente pra sessão de design dedicada (regra dura 11).

## Referências

- Doc canônico: `docs/ach.md` § 3.1, `docs/afm.md` regra dura 11.
