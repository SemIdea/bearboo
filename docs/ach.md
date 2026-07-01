# ACH — Architecture Guide

> Guia vivo de arquitetura do Bearboo.
> **Autor:** dono da arquitetura. Mudanças passam por validação antes do merge.
>
> Este documento responde: "onde ponho essa lógica?", "como estruturo esse módulo novo?", "até que nível de teste levo essa mudança?".
>
> **Docs relacionados:** [`/docs/afm.md`](./afm.md) (processo + regras duras), [`/docs/gotchas.md`](./gotchas.md) (surpresas contraintuitivas), [`/docs/adr/`](./adr/) (decisões versionadas).

> **⚠️ Refactor parcialmente implementado (2026-07-01).** ADR-0006 (reorganização do server por feature — `domain/`+`procedures/`) já foi aplicada em todo `src/server/features/` e é o que este documento descreve abaixo. **ADR-0007 a 0010 ainda não foram implementadas**: entidades continuam em `src/server/entities/` (não em `src/server/models/`), sem separação `src/lib/` vs `src/server/infra/`, Redis sem reconstrução, DTOs ainda TS puro (não Zod no boundary de output). Este doc é reescrito incrementalmente conforme cada ADR aterrissa — documentar o planejado como se já existisse inventaria estado que não está no código (princípio invariante #4).

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
tRPC Router (src/server/features/<feature>/index.ts)  — Procedure-like, agregador da feature
  │
  ▼
Procedure (src/server/features/<feature>/procedures/<action>.ts)  — orquestra
  │
  ▼
Domain (src/server/features/<feature>/domain/<action>.ts)  — Domain-like
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
│   ├── routers/app.routes.ts   # Agregador raiz — importa o router de cada feature (não é feature)
│   ├── features/<feature>/     # index.ts (router) + schema.ts + domain/ + procedures/
│   │   ├── index.ts            # tRPC router da feature — agrega procedures/<action>.ts
│   │   ├── schema.ts           # Zod schemas de input/output da feature (1 arquivo por feature)
│   │   ├── procedures/<action>.ts        # orquestra: valida via schema, chama domain/, retorna
│   │   ├── procedures/<action>.test.ts   # teste vizinho, sem __tests__/
│   │   ├── domain/<action>.ts             # regra de negócio — UMA função por arquivo (regra dura 7)
│   │   └── domain/<action>.dto.ts         # tipo de input/output + deps injetadas (repositories/helpers)
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
routers/app.routes.ts     → pode importar: features/<feature> (o index.ts de cada feature)
                             NUNCA importa: entities/*, integrations/* direto

features/<feature>/index.ts        → pode importar: procedures/*, schema.ts
                                      NUNCA importa: entities/*, integrations/* direto (delega pra procedure)

features/<feature>/procedures/*.ts → pode importar: domain/* (mesma feature ou outra), schema.ts, createContext types
                                      NUNCA importa: repositories/prisma direto (recebe via ctx.repositories)

features/<feature>/domain/*.ts     → pode importar: entities/*/entity, domain/*.dto.ts local, outro domain/* (mesma feature)
                                      NUNCA importa: zod/schema (validação já ocorreu no boundary)

entities/*/entity.ts      → pode importar: entities/base/entity, DTO.ts local
                             NUNCA importa: server/schema (zod), tipos de erro de transport

integrations/**/adapter.ts → interface pura (porta tipada), zero import de implementação concreta
integrations/**/implementations/* → implementa a porta; pode importar drivers/*
```

**Import cross-feature confirmado no código:** `features/user/procedures/login.ts` importa `features/auth/domain/createAuthSession`; `features/user/procedures/register.ts` importa `features/auth/domain/createToken` e `features/mail/domain/sendMail`; `features/auth/procedures/*.ts` importa `features/mail/domain/*`. Domain-a-domain cross-feature é aceito hoje (não há módulo isolado forçando boundary) — revisitar se a regra dura 11 (mudança arquitetural) apontar necessidade de portas explícitas entre features.

**Promoção pra `domain/shared/`:** ainda não há necessidade observada (Rule of Three) — nenhuma lógica duplicada em 3+ módulos identificada no scan. Cresce sob demanda.

---

## 3. Componentes

### 3.1 Componentes de 1ª classe

#### Procedure-like — handler sync request/response

- **Implementação no stack:** router tRPC em `src/server/features/<feature>/index.ts`, agregando as procedures da própria feature.
- **Convenção de nome:** router `<Feature>Router`; procedure = verbo (`create`, `read`, `update`, `delete`, `readRecent`, `revalidate`, `login`, `register`).
- **Exemplo canônico:** `src/server/features/post/index.ts`.
- **Nota:** `login`/`register` são expostos por `features/user/index.ts` (`trpc.user.login`/`trpc.user.register`) — fisicamente vivem em `user/` mesmo sendo conceitualmente "auth", decisão tomada durante a ADR-0006 pra eliminar o roteamento cruzado que existia antes (`auth.routes.ts` chamando controllers de `user/`).

#### Procedure — orquestrador thin

- **Conceito:** camada entre o router tRPC e o Domain — recebe `input` + `ctx`, monta o DTO da função de domain (injeta `repositories`/`helpers` do `ctx`), chama a função, retorna o resultado.
- **Implementação:** `src/server/features/<feature>/procedures/<action>.ts`, export `<action><Feature>Controller`.
- **Quando NÃO usar:** lógica de negócio real → delega pro `domain/`.
- **Exemplo canônico:** `src/server/features/post/procedures/create.ts`.

#### Domain-like — função pura de regra de negócio

- **Conceito universal:** função que aplica regra de negócio, recebendo repositórios/helpers já resolvidos (injeção explícita, não IO direto).
- **Implementação no stack:** `src/server/features/<feature>/domain/<action>.ts`, export único `<Verbo><Entidade>Service`; DTO co-locado em `domain/<action>.dto.ts`.
- **UMA função exportada por arquivo — compliant em todo `src/server/features/` desde a ADR-0006 (2026-07-01).** Auditoria original (retroativa, `/afm:refactor`) tinha reportado "compliant" por engano num grep que contava linhas de `export {...}` em vez de símbolos — a violação real (`auth/resetToken`, `auth/session`, `auth/verifyToken`, `user/profile`, `mail` bundlando 2-3 funções por arquivo) foi corrigida durante a implementação desta ADR, quebrando cada arquivo multi-export em um arquivo por função.
- **Quando NÃO usar:** validação de schema (fica no `schema.ts` da feature, boundary), transport glue (fica na procedure).
- **Exemplo canônico:** `src/server/features/post/domain/create.ts`.

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

`src/server/features/<feature>/schema.ts` — Zod schemas de input de procedure, um arquivo por feature (consolidado na ADR-0006; antes viviam espalhados em `src/server/schema/<nome>.schema.ts`, às vezes um arquivo por feature, às vezes um por sub-concern). Confirmado no scan: zero `import zod` dentro de `entities/*/entity.ts` ou `features/*/domain/*.ts` (regra dura 16 já respeitada).

#### Shared error — classificação por domínio (intenção) vs. estado atual

`src/shared/error/<domínio>.ts` — `<Domínio>ErrorCode` enum + `<Domínio>ErrorMessages`, um arquivo por domínio (auth, post, comment, user, session, resetToken, verifyToken, validation). **Intenção arquitetural:** Domain nunca importa tipo de erro de transport (regra dura 15); Controller mapeia `DomainErrorCode` → `TRPCError` no boundary.

**Estado atual (violação difundida — ver `afm.md` § 3.1 forward-only):** `grep -rl "TRPCError" src/server/features/*/domain/*.ts` retorna **20 de 28** arquivos de domain (número mudou de 18/19 pra 20/28 após a ADR-0006 quebrar os arquivos multi-export em um-por-função — mesma violação, granularidade nova) — a função de domain importa `@trpc/server` e lança `TRPCError` diretamente, em vez de lançar um erro de domínio e deixar a procedure mapear. Além disso, o `message` passado ao `TRPCError` é o **código** do enum (`UserErrorCode.USER_NOT_FOUND`), não a mensagem amigável de `<Domínio>ErrorMessages` — os mapas de mensagem existem mas não são consumidos onde o erro é lançado. Ver `src/server/features/user/domain/login.ts` como exemplo representativo. **Esta é exatamente a violação que a ADR-0010 (DTOs → Zod, ainda não implementada) planeja resolver** — o `.output()` do Zod no boundary da procedure é o ponto natural pra esse mapeamento.

#### UI primitives

`src/components/ui/` — componentes Radix + `class-variance-authority` (estilo shadcn). Sem fetch direto; dados via tRPC + React Query (`src/context/trpc/`).

---

## 4. Estratégia de Testes

### 4.1 Níveis observados

| Nível | O que testa | Onde vive | Estado atual |
| ----- | ----------- | --------- | ------------- |
| **Unit/Procedure** | Procedure + Domain + Entity via `TestContext` | `src/server/features/**/procedures/*.test.ts` | 23 arquivos de teste (`vitest`) |
| **Integration** | [A DEFINIR — não identificado no scan] | — | — |
| **E2E** | [A DEFINIR — não identificado no scan] | — | — |

Cobertura atual (proxy `tests/src`): 23 arquivos de teste / 234 arquivos `.ts`/`.tsx` em `src/` (~9.8% — número de arquivos mudou pós-ADR-0006, mesmos 55 testes, só mais granulares). Ver `afm.md` § 3.1 forward-only.

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
| Router (Procedure-like) | `<Feature>Router` | `features/<feature>/index.ts` |
| Procedure | `<action><Feature>Controller` | `features/<feature>/procedures/<action>.ts` |
| Domain-like | `<Verbo><Entidade>Service` | `features/<feature>/domain/<action>.ts` |
| Domain DTO | `I<Verbo><Entidade>DTO` | `features/<feature>/domain/<action>.dto.ts` |
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
