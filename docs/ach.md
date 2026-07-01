# ACH — Architecture Guide

> Guia vivo de arquitetura do Bearboo.
> **Autor:** dono da arquitetura. Mudanças passam por validação antes do merge.
>
> Este documento responde: "onde ponho essa lógica?", "como estruturo esse módulo novo?", "até que nível de teste levo essa mudança?".
>
> **Docs relacionados:** [`/docs/afm.md`](./afm.md) (processo + regras duras), [`/docs/gotchas.md`](./gotchas.md) (surpresas contraintuitivas), [`/docs/adr/`](./adr/) (decisões versionadas).

---

## 1. Arquitetura Macro

```
Browser
  │
  ▼
Next.js App Router (src/app/**)  ──── SSR/ISR/PPR ────►  React (client components)
  │                                                          │
  ▼                                                          ▼
tRPC route handler (src/app/api/trpc/[trpc]/route.ts)   tRPC client (src/context/trpc/*)
  │
  ▼
tRPC Router (src/server/routers/<feature>.routes.ts)  — Procedure-like
  │
  ▼
Controller (src/server/features/<feature>/<action>/controller.ts)  — orquestra
  │
  ▼
Service (src/server/features/<feature>/<action>/service.ts)  — Domain-like
  │
  ▼
Entity (src/server/entities/<entity>/entity.ts)  — encapsula acesso a repositório
  │
  ├──► Repository adapter (src/server/entities/<entity>/repositories/prisma.ts) ──► Postgres (Prisma)
  └──► Cache adapter (src/server/integrations/repositories/cache/implementations/*) ──► Redis

Integrations transversais (adapters tipados, injetados via DI container):
  - Helpers: uidGenerator, passwordHashing (src/server/integrations/helpers/*)
  - Gateway: mailer (src/server/integrations/gateway/mailer/*)
  - Composition root: src/server/container/{gateways,helpers,repositories}.ts
  - Drivers (clients singleton): src/server/drivers/{prisma,redis}.ts
```

**Entidades canônicas** (de `prisma/schema.prisma`):
- **User** — conta autenticável; dono de posts, comentários e sessões.
- **Session** — sessão de autenticação (`accessToken`/`refreshToken`) de um User.
- **Post** — conteúdo publicado por um User.
- **Comment** — comentário de um User em um Post.
- **VerificationToken** — token de verificação de email de um User.
- **ResetToken** — token de reset de senha de um User.

**Mini-ER (relações declaradas no schema):**
```
User 1───N Session
User 1───N Post
User 1───N Comment
Post 1───N Comment
User 1───N VerificationToken   (userId sem @relation declarada no schema)
User 1───N ResetToken          (userId sem @relation declarada no schema)
```

**Dataflow:**
- **Postgres (Prisma)** — source of truth de todas as entidades (User, Session, Post, Comment, VerificationToken, ResetToken).
- **Redis** — cache de leitura sobre sessão/post/user, feature-flagged (`src/config/featureFlags.ts`: `enableSessionCaching`, `enablePostCaching`, `enableUserCaching`). Postgres permanece autoritativo; Redis nunca é a única fonte de um dado.

---

## 2. Arquitetura de Pastas

```
src/
├── app/                        # Next.js App Router — rotas, layouts, route groups
│   ├── (half)/                 # Route group: páginas de post/user (layout largo) — nome herdado, não redocumentar semântica sem confirmar com o time
│   ├── (smal)/                 # Route group: páginas de auth (layout estreito) — idem
│   └── api/trpc/[trpc]/        # Handler HTTP único do tRPC
├── components/                 # Componentes React reutilizáveis + components/ui (shadcn-style)
├── config/                     # site.ts, fonts.ts, featureFlags.ts
├── constants/                  # constantes cross-cutting (cache keys, mail)
├── context/                    # Providers React (auth, trpc client)
├── lib/                        # libs isoladas (error, featureFlags, utils, validation) — arquivos flat, não pastas
├── server/                     # Camada backend
│   ├── routers/                # tRPC routers — Procedure-like (1 arquivo por feature)
│   ├── features/<feature>/<action>/  # controller.ts + service.ts + DTO.ts (+ .test.ts)
│   ├── entities/<entity>/      # entity.ts + DTO.ts + repositories/prisma.ts
│   ├── integrations/
│   │   ├── helpers/<name>/     # adapter.ts + implementations/  (uidGenerator, passwordHashing)
│   │   ├── gateway/<name>/     # adapter.ts + implementations/  (mailer)
│   │   └── repositories/cache/ # adapter.ts + implementations/  (Redis)
│   ├── container/               # Composition root — liga implementação concreta ao adapter
│   ├── drivers/                 # Clients singleton (prisma.ts, redis.ts)
│   ├── schema/                  # Zod schemas de input — boundary de validação
│   └── createContext.ts, createRouter.ts, caller.ts
├── shared/error/<domínio>.ts   # ErrorCode enum + mensagens, por domínio (auth/post/comment/user/session/resetToken/verifyToken/validation)
├── test/context/                # TestContext — helper de setup pra testes de controller
└── utils/                       # authStorage, env, error, validation (client-side helpers)
```

### Regras de import

```
routers/          → pode importar: features/*/controller
                     NUNCA importa: entities/*, integrations/* direto (delega pro controller)

features/*/controller.ts → pode importar: features/*/service, schema/, createContext types
                            NUNCA importa: repositories/prisma direto (recebe via ctx.repositories)

features/*/service.ts    → pode importar: entities/*/entity, DTO.ts local
                            NUNCA importa: zod/schema (validação já ocorreu no boundary)

entities/*/entity.ts      → pode importar: entities/base/entity, DTO.ts local
                             NUNCA importa: server/schema (zod), tipos de erro de transport

integrations/**/adapter.ts → interface pura (porta tipada), zero import de implementação concreta
integrations/**/implementations/* → implementa a porta; pode importar drivers/*
```

**Promoção pra `domain/shared/`:** ainda não há necessidade observada (Rule of Three) — nenhuma lógica duplicada em 3+ módulos identificada no scan. Cresce sob demanda.

---

## 3. Componentes

### 3.1 Componentes de 1ª classe

#### Procedure-like — handler sync request/response

- **Implementação no stack:** tRPC procedure em `src/server/routers/<feature>.routes.ts`, delegando pro controller.
- **Convenção de nome:** router `<Feature>Router`; procedure = verbo (`create`, `read`, `update`, `delete`, `readRecent`, `revalidate`).
- **Exemplo canônico:** `src/server/routers/post.routes.ts`.

#### Controller — orquestrador thin (variante local de Procedure-like)

- **Conceito:** camada extra entre o router tRPC e o Service — recebe `input` + `ctx`, monta o DTO do Service (injeta `repositories`/`helpers` do `ctx`), chama o Service, retorna o resultado.
- **Implementação:** `src/server/features/<feature>/<action>/controller.ts`, export `<action><Feature>Controller`.
- **Quando NÃO usar:** lógica de negócio real → delega pro Service.
- **Exemplo canônico:** `src/server/features/post/create/controller.ts`.

#### Domain-like — função pura de regra de negócio (variante local: "Service")

- **Conceito universal:** função que aplica regra de negócio, recebendo repositórios/helpers já resolvidos (injeção explícita, não IO direto).
- **Implementação no stack:** `src/server/features/<feature>/<action>/service.ts`, export único `<Verbo><Entidade>Service`.
- **UMA função exportada por arquivo** — confirmado no scan (100% dos `service.ts` auditados exportam exatamente 1 símbolo).
- **Quando NÃO usar:** validação de schema (fica no `schema/`, boundary), transport glue (fica no controller).
- **Exemplo canônico:** `src/server/features/post/create/service.ts`.

#### Entity — encapsula acesso a repositório (camada local, não do vocabulário universal)

- **Conceito:** classe que estende `BaseEntity<Entity, Model>` (`src/server/entities/base/entity.ts`), fornecendo CRUD genérico (`create/read/update/delete`) + métodos extras específicos da entidade (ex: `PostEntity.readRecent`, `PostEntity.readUserPosts`).
- **Implementação:** `src/server/entities/<entity>/entity.ts`, instância singleton exportada (`const <Entity>Entity = new <Entity>EntityClass({})`).
- **Quando usar:** toda entidade do `prisma/schema.prisma` que precisa de acesso a dado + lógica de leitura/escrita específica.
- **Nota:** Service chama Entity, que chama o repository adapter — Entity é quem sabe orquestrar `repositories.database`/`repositories.cache`.

#### Adapter-like — implementação de porta tipada

- **Conceito universal:** implementação concreta de uma porta (`adapter.ts`) — mesmo shape de retorno entre implementações (LSP).
- **Implementação no stack:**
  - Repository de entidade: `src/server/entities/<entity>/repositories/prisma.ts`.
  - Helper cross-cutting: `src/server/integrations/helpers/<name>/adapter.ts` + `implementations/<concreto>.ts` (ex: `uidGenerator`, `passwordHashing`).
  - Gateway externo: `src/server/integrations/gateway/<name>/adapter.ts` + `implementations/<concreto>.ts` (ex: `mailer`).
  - Cache: `src/server/integrations/repositories/cache/adapter.ts` + `implementations/<concreto>.ts` (Redis).
- **OCP em ação:** provider novo (ex: outro mailer) = arquivo novo em `implementations/`, sem `switch (provider)` espalhado.

#### Composition root — wiring de implementações concretas (camada local)

- **Implementação:** `src/server/container/{gateways,helpers,repositories}.ts` — resolve qual `implementations/*` concreta cada adapter usa, injeta nos `drivers/*`.
- **Drivers:** `src/server/drivers/{prisma,redis}.ts` — clients singleton crus, consumidos só pelo container/pelos adapters.

### 3.2 Componentes de suporte (2ª classe)

#### Schema — validação no boundary

`src/server/schema/<feature>.schema.ts` — Zod schemas de input de procedure. Confirmado no scan: zero `import zod` dentro de `entities/*/entity.ts` ou `features/*/service.ts` (regra dura 16 já respeitada).

#### Shared error — classificação por domínio (intenção) vs. estado atual

`src/shared/error/<domínio>.ts` — `<Domínio>ErrorCode` enum + `<Domínio>ErrorMessages`, um arquivo por domínio (auth, post, comment, user, session, resetToken, verifyToken, validation). **Intenção arquitetural:** Domain nunca importa tipo de erro de transport (regra dura 15); Controller mapeia `DomainErrorCode` → `TRPCError` no boundary.

**Estado atual (violação difundida — ver `afm.md` § 3.1 forward-only):** `grep -rl "TRPCError" src/server/features/` retorna **18 de 19** arquivos `service.ts` — o Service (Domain-like) importa `@trpc/server` e lança `TRPCError` diretamente, em vez de lançar um erro de domínio e deixar o Controller mapear. Além disso, o `message` passado ao `TRPCError` é o **código** do enum (`UserErrorCode.USER_NOT_FOUND`), não a mensagem amigável de `<Domínio>ErrorMessages` — os mapas de mensagem existem mas não são consumidos onde o erro é lançado. Ver `src/server/features/user/login/service.ts` como exemplo representativo.

#### UI primitives

`src/components/ui/` — componentes Radix + `class-variance-authority` (estilo shadcn). Sem fetch direto; dados via tRPC + React Query (`src/context/trpc/`).

---

## 4. Estratégia de Testes

### 4.1 Níveis observados

| Nível | O que testa | Onde vive | Estado atual |
| ----- | ----------- | --------- | ------------- |
| **Unit/Controller** | Controller + Service + Entity via `TestContext` | `src/server/features/**/*.test.ts` | 18 arquivos de teste (`vitest`) |
| **Integration** | [A DEFINIR — não identificado no scan] | — | — |
| **E2E** | [A DEFINIR — não identificado no scan] | — | — |

Cobertura atual (proxy `tests/src`): 18 arquivos de teste / 210 arquivos `.ts`/`.tsx` em `src/` (~8.6%). Ver `afm.md` § 3.1 forward-only.

### 4.2 TDD duro + types-as-test

Runner: `vitest run --reporter verbose` (script `test`). `tsconfig.json` tem `strict: true`.

### 4.3 Regressão

Padrão observado no `git log`: vários commits `test:` acompanham `fix:`/`refactor:` na mesma área (ex: "add error handling tests for non-existent posts and unauthorized updates"). Manter esse padrão.

### 4.4 Tipos como teste

`grep -rn ': any' src/` → 2 ocorrências. `grep '@ts-ignore\|@ts-expect-error' src/` → 0. Ver `afm.md` § 3.1.

### 4.5 Cobertura alvo por camada

[A DEFINIR — sem threshold definido hoje.]

---

## 5. Princípios transversais

- **XP + Pragmatic** — DRY, YAGNI, KISS, Broken Windows, Design by Contract, Rubber Duck. Práticas diárias em [`/docs/afm.md`](./afm.md).
- **Postgres = source of truth de todas as entidades; Redis = cache opcional feature-flagged.** Divergência resolve-se sempre lendo do Postgres.
- **Tipos no lugar de comentários.** Nome + tipo carregam o *o quê*. Comentário só pra justificar *porquê* surpreendente.
- **Injeção explícita de repositórios/helpers via DTO**, nunca acesso direto a driver dentro de Service/Entity — mantém a camada testável sem infra real (`TestContext` monta repositórios em memória).
- **Erro classificado por domínio, nunca genérico** — todo domínio tem seu próprio `<Domínio>ErrorCode` em `src/shared/error/`.

---

## 6. Convenções de código (cheat-sheet)

### Rubricas de decisão

Consulte as rubricas em [`docs/rubrics/`](./rubrics/) **antes** de escolher onde algo vai: `when-to-create-lib.md`, `when-to-create-module.md`, `when-to-create-dsl.md`, `enum-vs-union-vs-branded.md`, `error-classification.md`, `failure-classification.md`, `episodic-vs-semantic-boundary.md`, `negative-filters.md`, `solid-triggers.md`, `validation-boundary.md`, `when-to-evolve-methodology.md`, `template-vs-streaming-precedence.md`.

### Nomeação (observada no código)

| Camada | Padrão do export | Padrão do arquivo |
| ----- | ---- | ---- |
| Router (Procedure-like) | `<Feature>Router` | `<feature>.routes.ts` |
| Controller | `<action><Feature>Controller` | `controller.ts` (1 por pasta `<feature>/<action>/`) |
| Service (Domain-like) | `<Verbo><Entidade>Service` | `service.ts` |
| Entity | `<Entidade>Entity` (instância) | `entity.ts` |
| Repository adapter | `Prisma<Entidade>Model` | `repositories/prisma.ts` |
| Adapter (porta) | `I<Nome>Adapter` (tipo) | `adapter.ts` |
| Test file | mesmo nome + `.test.ts` | mesmo diretório, sem `__tests__/` |

### Tamanho e responsabilidade

- ≤ 300 linhas por arquivo (1 exceção conhecida hoje: `src/server/entities/base/entity.ts`, 320 linhas — ver `afm.md` § 3.1).
- Uma responsabilidade por arquivo.

### Tipos: explícitos nas fronteiras, inferência no resto

- **Explícito:** retorno de Services/Controllers exportados, DTOs, props de componentes exportados.
- **Nunca `any` / `unknown` em helper próprio** (2 exceções conhecidas hoje — ver `afm.md` § 3.1).

---

*Mudanças aqui seguem regra dura 11 (mudança arquitetural pára e pergunta).*
