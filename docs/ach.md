# ACH — Architecture Guide

> Guia vivo de arquitetura do Bearboo.
> **Autor:** dono da arquitetura. Mudanças passam por validação antes do merge.
>
> Este documento responde: "onde ponho essa lógica?", "como estruturo esse módulo novo?", "até que nível de teste levo essa mudança?".
>
> **Docs relacionados:** [`/docs/afm.md`](./afm.md) (processo + regras duras), [`/docs/gotchas.md`](./gotchas.md) (surpresas contraintuitivas), [`/docs/adr/`](./adr/) (decisões versionadas).

> **Estado do refactor em 2026-07-04.** ADR-0006 a ADR-0010 já aterrissaram no código: server por feature (`domain/` + `procedures/`), entidades Prisma centralizadas em `src/server/models/`, separação `src/lib/` vs `src/server/infra/`, remoção da implementação Redis antiga e schemas Zod de input/output no boundary. O Redis permanece decisão tecnológica para reconstrução futura (ADR-0003/0009), mas hoje não há adapter/cache Redis em `src/server/`.

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
Model (src/server/models/<entity>.ts)  — encapsula acesso Prisma por entidade
  │
  ▼
Prisma driver (src/server/infra/drivers/prisma.ts) ──► Postgres

Integrations transversais (adapters tipados, injetados via DI container):
  - Helpers puros: uidGenerator, passwordHashing (src/lib/*)
  - Gateway: mailer (src/server/integrations/gateway/mailer/*)
  - Env: src/lib/env
  - Composition root: src/server/infra/container/{gateways,helpers,repositories}.ts
  - Drivers (clients singleton): src/server/infra/drivers/prisma.ts
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
- **Redis** — a implementação antiga de cache foi removida pela ADR-0009. Redis segue como tecnologia aceita para uma reconstrução futura, mas o código atual não consulta Redis nem mantém porta de cache ativa.

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
├── context/                    # Providers React (auth, trpc client)
├── lib/                        # libs puras sem ORM/framework: env, error, featureFlags, utils, validation, helpers
│   ├── env/                    # leitura tipada de env vars via dotenv
│   ├── passwordHashing/        # adapter + implementação bcrypt
│   └── uidGenerator/           # adapter + implementação uuid
├── server/                     # Camada backend
│   ├── routers/app.routes.ts   # Agregador raiz — importa o router de cada feature (não é feature)
│   ├── features/<feature>/     # index.ts (router) + schema.ts + domain/ + procedures/
│   │   ├── index.ts            # tRPC router da feature — agrega procedures/<action>.ts
│   │   ├── schema.ts           # Zod schemas de input/output da feature (1 arquivo por feature)
│   │   ├── procedures/<action>.ts        # orquestra: valida via schema, chama domain/, retorna
│   │   ├── procedures/<action>.test.ts   # teste vizinho, sem __tests__/
│   │   └── domain/<action>.ts             # regra de negócio — UMA função por arquivo (regra dura 7)
│   ├── models/                 # base.ts + model por entidade Prisma
│   ├── infra/
│   │   ├── container/           # Composition root — liga implementações concretas
│   │   └── drivers/             # Clients singleton (prisma.ts)
│   ├── integrations/
│   │   └── gateway/<name>/      # adapter.ts + implementations/  (mailer)
│   └── createContext.ts, createRouter.ts, caller.ts
├── shared/error/<domínio>.ts   # ErrorCode enum + mensagens, por domínio (auth/post/comment/user/session/resetToken/verifyToken/validation)
├── test/
│   ├── context/                 # TestContext — helper de setup pra testes de procedure
│   ├── gateways/                # gateways fake in-memory
│   ├── prisma/                  # client prisma-mock (fake schema-driven do PrismaClient) + reset
│   └── setup.ts                 # setupFiles do vitest — mocka o driver Prisma e reseta o estado por teste
└── utils/                       # authStorage, error, validation (client-side helpers)
```

### Regras de import

```
routers/app.routes.ts     → pode importar: features/<feature> (o index.ts de cada feature)
                             NUNCA importa: models/*, infra/*, integrations/* direto

features/<feature>/index.ts        → pode importar: procedures/*, schema.ts
                                      NUNCA importa: models/*, infra/*, integrations/* direto (delega pra procedure)

features/<feature>/procedures/*.ts → pode importar: domain/* (mesma feature ou outra), schema.ts, createContext/createRouter types
                                      NUNCA importa: Prisma/driver direto (recebe via ctx.repositories)

features/<feature>/domain/*.ts     → pode importar: createDomain, tipos inferidos do schema, outro domain/* (mesma feature)
                                      NUNCA importa: zod runtime, Prisma/driver ou implementation concreta

models/*.ts               → pode importar: models/base, infra/drivers/prisma
                             NUNCA importa: features/*, server/schema, tipos de erro de transport

integrations/**/adapter.ts → interface pura (porta tipada), zero import de implementação concreta
integrations/**/implementations/* → implementa a porta; pode receber config/env via constructor; não lê container
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

- **Conceito:** camada entre o router tRPC e o Domain — aplica `.input()`/`.output()`, recebe `input` + `ctx`, chama a função de domain com `DomainInput<T>` e retorna o resultado.
- **Implementação:** `src/server/features/<feature>/procedures/<action>.ts`, export `procedure_<action>`.
- **Quando NÃO usar:** lógica de negócio real → delega pro `domain/`.
- **Exemplo canônico:** `src/server/features/post/procedures/create.ts`.

#### Domain-like — função pura de regra de negócio

- **Conceito universal:** função que aplica regra de negócio, recebendo repositórios/helpers já resolvidos (injeção explícita, não IO direto).
- **Implementação no stack:** `src/server/features/<feature>/domain/<action>.ts`, export único `domain_<action>`.
- **UMA função exportada por arquivo — compliant em todo `src/server/features/` desde a ADR-0006 (2026-07-01).** Auditoria original (retroativa, `/afm:refactor`) tinha reportado "compliant" por engano num grep que contava linhas de `export {...}` em vez de símbolos — a violação real (`auth/resetToken`, `auth/session`, `auth/verifyToken`, `user/profile`, `mail` bundlando 2-3 funções por arquivo) foi corrigida durante a implementação desta ADR, quebrando cada arquivo multi-export em um arquivo por função.
- **Quando NÃO usar:** validação de schema (fica no `schema.ts` da feature, boundary), transport glue (fica na procedure).
- **Exemplo canônico:** `src/server/features/post/domain/create.ts`.

#### Model — encapsula acesso Prisma por entidade (camada local, não do vocabulário universal)

- **Conceito:** classe que estende `BaseModel<Entity>` (`src/server/models/base.ts`), fornecendo CRUD genérico (`create/read/update/delete`) + métodos extras específicos da entidade (ex: `PostModel.readRecents`, `PostModel.readUserPosts`, `PostModel.readBySlug`, `UserModel.readByEmail`).
- **Implementação:** `src/server/models/<entity>.ts`, instância singleton exportada (`const <Entity>Model = new <Entity>ModelClass()`).
- **Quando usar:** toda entidade do `prisma/schema.prisma` que precisa de acesso a dado + lógica de leitura/escrita específica.
- **Nota:** Domain acessa dados via `ctx.repositories.<entity>`; runtime e testes usam os **mesmos models** — nos testes o driver Prisma é substituído por um client `prisma-mock` gerado do `schema.prisma` (ADR-0011, seam em `src/test/setup.ts` + `src/test/prisma/`).

#### Adapter-like — implementação de porta tipada

- **Conceito universal:** implementação concreta de uma porta (`adapter.ts`) — mesmo shape de retorno entre implementações (LSP).
- **Implementação no stack:**
  - Models de dados: `src/server/models/<entity>.ts`.
  - Helper puro: `src/lib/<name>/adapter.ts` + `implementations/<concreto>.ts` (ex: `uidGenerator`, `passwordHashing`, `slug` — gerador determinístico de slug a partir de título, usado em `domain_createPost`; `rateLimit` — adicionado em `001-auth-hardening`, `IRateLimitHelperAdapter` + `InMemoryRateLimit`, key opaca prefixada por endpoint no call site, sem dependência de Redis; `permissions` — adicionado em `013-role-based-permissions`, `IPermissionHelperAdapter` + `MatrixPermission`, `can(role, action)` puro contra a matriz fixa da Fase 3, sem I/O; ganhou a ação `post:publish` em `014-post-review-workflow` — Fase 4, gateia `submitForReview`/`publish`/`reject`/`archive`).
  - Gateway externo: `src/server/integrations/gateway/<name>/adapter.ts` + `implementations/<concreto>.ts` (ex: `mailer`).
- **OCP em ação:** provider novo (ex: outro mailer) = arquivo novo em `implementations/`, sem `switch (provider)` espalhado.

#### Composition root — wiring de implementações concretas (camada local)

- **Implementação:** `src/server/infra/container/{gateways,helpers,repositories}.ts` — resolve qual `implementations/*` concreta cada adapter usa e injeta config/env quando necessário.
- **Drivers:** `src/server/infra/drivers/prisma.ts` — client singleton cru, consumido só por infra/model.

#### Response cookie jar — peça nova de `001-auth-hardening` (2026-07-12)

- **Conceito:** `src/server/http/cookieJar.ts` (`class CookieJar`) — acumula `Set-Cookie` pendentes durante o request; `src/server/http/serializeCookie.ts` — função pura que formata cada cookie (`HttpOnly`, `SameSite=Lax`, `Secure` condicional a `NODE_ENV=production`).
- **Contrato:** `createContext.ts` instancia um `CookieJar` por request (`ctx.resCookies`); procedures chamam `ctx.resCookies.set(...)`/`.clear(...)`; `src/app/api/trpc/[trpc]/route.ts` captura a `ctx` criada e usa `responseMeta` do `fetchRequestHandler` pra emitir os headers `set-cookie` depois que o batch resolve.
- **Por que existe:** o adapter tRPC (`@trpc/server/adapters/fetch`) não tem, por padrão, nenhum jeito de uma procedure influenciar headers da resposta — decisão de arquitetura validada em gate (`docs/features/001-auth-hardening/plan.md` § 4.1), não um padrão pré-existente do stack.

#### Guard de papel (`roleProcedure`) — peça nova de `013-role-based-permissions` (2026-07-12)

- **Conceito:** `src/server/createRouter.ts` — `roleProcedure(allowed: IRole[])`, 4ª camada da cadeia de guard tRPC (`public` → `protected` → `verified` → `role`), parametrizada por allowlist de papel em vez de fixa (cada call site passa os papéis que pode aceitar, ex. `roleProcedure(["ADMIN","EDITOR"])`). Lança `FORBIDDEN`/`AuthErrorCode.INSUFFICIENT_ROLE` se `ctx.user.role` não está na allowlist.
- **Quando usar:** ação que **nunca** depende de dono de recurso (`category.create`, `user.updateRole`). Ownership condicional (post update/delete: "dono OU tem permissão de bypass") fica em `verifiedProcedure` + checagem no domain via `ctx.helpers.permissions.can(role, action)` — `roleProcedure` não serve pra isso porque a decisão depende do dado (quem é o dono), não só do papel do chamador (`013-role-based-permissions/plan.md` § 4.2).
- **`IRole`:** union literal hand-rolled (`"ADMIN" | "EDITOR" | "AUTHOR"`) em `src/server/models/user.ts`, mesmo padrão de `IPostStatus`/`PostStatus` — não importa o enum gerado pelo Prisma client em código de app (só `infra/drivers/prisma.ts`/`test/prisma/` importam `@prisma/client` direto).

#### Workflow de status (state machine em domain, sem novo componente) — peça nova de `014-post-review-workflow` (2026-07-14)

- **Conceito:** transições de `Post.status` (`submitForReview`/`publish`/`reject`/`archive`) viram 4 domain functions dedicadas em vez de aceitar `status` livre em `post.update` — cada uma valida estado de origem + permissão antes de escrever. `updatePostSchema` **não** aceita mais `status` (regra dura 16 — validação no boundary continua em `schema.ts`, mas a *state machine* em si vive no domain).
- **`SCHEDULED` sem scheduler:** visibilidade pública de post `SCHEDULED` é resolvida com `scheduledAt <= now` no momento da query (`PostModel.readRecents`/`readRelated`/`readUserPosts`/`readBySlug`), não por um job que flipa o status no banco — evita introduzir o primeiro componente Task-like do projeto (`afm.md` § 3 regra 12) só pra isso (`014-post-review-workflow/plan.md` § 4.1).
- **`PostReviewComment`:** model novo (`src/server/models/reviewComment.ts`), mesmo padrão de `Comment` — guarda motivo de aprovação (opcional) ou rejeição (obrigatório), lido via `post.readReviewComments` (dono do post ou quem tem `post:publish`).

#### Superfície HTTP pública não-tRPC (App Router special files) — peça nova de `015-seo-metadata` (2026-07-14)

- **Conceito:** `sitemap.xml`, `robots.txt` e `feed.xml` não são endpoints tRPC — são convenções de arquivo especial do próprio Next.js (`src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/feed.xml/route.ts`), no mesmo nível de `page.tsx`/`layout.tsx` já existentes. Não é uma camada arquitetural nova: todos os 3 chamam `createCaller()` (mesmo caller usado por `generateMetadata`) pra ler dado via tRPC, e `sitemap.ts`/`feed.xml/route.ts` usam a mesma tríade `"use cache"` + `cacheLife("hours")` + `cacheTag("posts")` já estabelecida em `post/[slug]/page.tsx` (`014-post-review-workflow/plan.md`).
- **Pegadinha:** `"use cache"` não pode envolver uma função que retorna `NextResponse`/`Response` (classe, não serializável) — a leitura de dado cacheada fica numa função separada que retorna um valor plano (string/array), e o `Response` é construído fora do cache, no handler (`src/app/feed.xml/route.ts`: `readFeedXml()` cacheada retorna `string`; `GET()` não-cacheada monta o `NextResponse`).
- **`src/server/http/` deixa de ser só cookie jar:** ganhou `buildRssXml.ts` (RSS 2.0 hand-rolled) e `buildArticleJsonLd.ts` (JSON-LD `schema.org/Article`, com escape de `<` pra não quebrar a tag `<script>`) — funções puras de formatação de output, mesmo critério do `serializeCookie.ts` (transport glue, não regra de negócio — por isso não vivem em `domain/`).
- **`post.readSitemapEntries`:** procedure pública nova, enxuta (só `slug`+`updatedAt`, sem `include` de relations, sem paginação) — não reusa `post.readRecent` pro sitemap pra não pagar o custo do include completo nem generalizar uma procedure já usada em produção (`015-seo-metadata/plan.md` § 4.1).

### 3.2 Componentes de suporte (2ª classe)

#### Schema — validação no boundary

`src/server/features/<feature>/schema.ts` — Zod schemas de input e output de procedure, um arquivo por feature. Procedures aplicam `.input()` e `.output()` no boundary; domain recebe `DomainInput<T>` com tipos inferidos via `z.TypeOf`, sem validar runtime de novo. Confirmado no scan: zero `import zod` dentro de `models/*` ou `features/*/domain/*.ts` (regra dura 16 já respeitada).

#### Shared error — classificação por domínio (intenção) vs. estado atual

`src/shared/error/<domínio>.ts` — `<Domínio>ErrorCode` enum + `<Domínio>ErrorMessages`, um arquivo por domínio (auth, post, comment, user, session, resetToken, verifyToken, validation). **Intenção arquitetural:** Domain nunca importa tipo de erro de transport (regra dura 15); Procedure mapeia `DomainErrorCode` → `TRPCError` no boundary.

**Estado atual (violação difundida — ver `afm.md` § 3.1 forward-only):** `rg -l "TRPCError" src/server/features/*/domain/*.ts` retorna **17 de 30** arquivos de domain — a função de domain importa `@trpc/server` e lança `TRPCError` diretamente, em vez de lançar um erro de domínio e deixar a procedure mapear. Além disso, em vários casos o `message` passado ao `TRPCError` é o **código** do enum (`UserErrorCode.USER_NOT_FOUND`), não a mensagem amigável de `<Domínio>ErrorMessages`. Ver `src/server/features/user/domain/login.ts` como exemplo representativo. Schemas Zod de output já existem; o que ainda falta é a remediação de erro Domain ≠ Transport.

#### UI primitives

`src/components/ui/` — componentes Radix + `class-variance-authority` (estilo shadcn). Sem fetch direto; dados via tRPC + React Query (`src/context/trpc/`).

---

## 4. Estratégia de Testes

### 4.1 Níveis observados

| Nível | O que testa | Onde vive | Estado atual |
| ----- | ----------- | --------- | ------------- |
| **Unit/Procedure** | Procedure + Domain + Model via `TestContext` | `src/server/features/**/procedures/*.test.ts` | 23 arquivos de teste (`vitest`) |
| **Integration** | [A DEFINIR — não identificado no scan] | — | — |
| **E2E** | [A DEFINIR — não identificado no scan] | — | — |

Cobertura atual (proxy `tests/src`): 23 arquivos de teste / 205 arquivos `.ts`/`.tsx` em `src/` (~11.2%). Ver `afm.md` § 3.1 forward-only.

Os testes de procedure rodam sem Postgres/Redis: o vitest mocka o driver Prisma globalmente (`src/test/setup.ts`) com um client **`prisma-mock`** gerado do `schema.prisma` (`src/test/prisma/` — ADR-0011), então os models de produção rodam intactos contra um banco in-memory com unique constraints enforçadas; `createTestContext()` injeta só os gateways fake (`src/test/gateways/`). Isolamento por teste via `resetPrismaMock()` (não usar `$clear()` — ver comentário no seam). O hook de pre-push roda `yarn test` direto.

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
- **Postgres = source of truth de todas as entidades.** Redis cache antigo foi removido; reconstrução futura passa por ADR nova/continuação da ADR-0009.
- **Tipos no lugar de comentários.** Nome + tipo carregam o *o quê*. Comentário só pra justificar *porquê* surpreendente.
- **Injeção explícita via `ctx`/`DomainInput`**, nunca acesso direto a driver dentro de Domain/Procedure — mantém a camada testável sem infra real (nos testes o driver vira um client `prisma-mock` in-memory, ADR-0011).
- **Erro classificado por domínio, nunca genérico** — todo domínio tem seu próprio `<Domínio>ErrorCode` em `src/shared/error/`.

---

## 6. Convenções de código (cheat-sheet)

### Rubricas de decisão

Consulte as rubricas em [`docs/rubrics/`](./rubrics/) **antes** de escolher onde algo vai: `when-to-create-lib.md`, `when-to-create-module.md`, `when-to-create-dsl.md`, `enum-vs-union-vs-branded.md`, `error-classification.md`, `failure-classification.md`, `episodic-vs-semantic-boundary.md`, `negative-filters.md`, `solid-triggers.md`, `validation-boundary.md`, `when-to-evolve-methodology.md`, `template-vs-streaming-precedence.md`.

### Nomeação (observada no código)

| Camada | Padrão do export | Padrão do arquivo |
| ----- | ---- | ---- |
| Router (Procedure-like) | `<Feature>Router` | `features/<feature>/index.ts` |
| Procedure | `procedure_<action>` | `features/<feature>/procedures/<action>.ts` |
| Domain-like | `domain_<action>` | `features/<feature>/domain/<action>.ts` |
| Domain input | `DomainInput<T>` | `server/createDomain.ts` |
| Model | `<Entidade>Model` (instância) | `server/models/<entity>.ts` |
| Adapter (porta) | `I<Nome>Adapter` (tipo) | `adapter.ts` |
| Test file | mesmo nome (sem sufixo `.test.ts`) | pasta `__test__/` (singular) vizinha ao código — **corrigido em 2026-07-11**: a versão anterior desta linha ("sem `__tests__/`") divergia do `vitest.config.ts` real (`include: ["src/**/__test__/**/*.ts"]`) e de todo o código existente (`procedures/__test__/<action>.ts`, `src/lib/slug/__test__/kebabCase.ts`) |

### Tamanho e responsabilidade

- ≤ 300 linhas por arquivo (sem exceção produtiva conhecida no scan de 2026-07-04).
- Uma responsabilidade por arquivo.

### Tipos: explícitos nas fronteiras, inferência no resto

- **Explícito:** retorno de funções exportadas de domain/procedure, schemas/tipos de boundary, props de componentes exportados.
- **Nunca `any` / `unknown` em helper próprio** (5 ocorrências conhecidas hoje — ver `afm.md` § 3.1).

---

*Mudanças aqui seguem regra dura 11 (mudança arquitetural pára e pergunta).*
