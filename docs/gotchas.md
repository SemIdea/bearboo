# Gotchas — surpresas que travam outro dev

> Cada item é uma surpresa contraintuitiva descoberta na prática. Nasce vazio, cresce sob demanda.
>
> **Regra de entrada:** só vira gotcha o que travou alguém pelo menos 2× ou tem alta probabilidade de travar (gotcha de SDK/runtime/lib externa). Não inventa gotcha — descobre.
>
> **Formato:** cada gotcha tem **gatilho** ("se você está editando X, leia antes") + **comportamento contraintuitivo** + **solução** + link pro ADR ou doc canônico se houver.
>
> **Ordem:** por área (não cronológica). Use Ctrl-F com nome de arquivo ou symbol.

---

## Next.js — `cookies()` / `headers()` só em Server Component / route handler

**Gatilho:** se você está usando `cookies()` ou `headers()` de `next/headers` numa lib pura ou em Client Component.

**Comportamento:** ambos só funcionam no contexto de request — Server Component, route handler, server action. Em qualquer outro lugar joga error em runtime.

**Solução:** ler cookies no Server Component / route handler, passar pro componente client como prop. Nunca importar `next/headers` em código que pode rodar no browser.

**Ref:** confirmado pelo time na adoção retroativa (`/afm:refactor`, 2026-06-30) como já mordido.

---

## Next.js — `revalidatePath` / `revalidateTag` não invalida React Query

**Gatilho:** se você está em route handler ou server action e quer refresh do cache do client.

**Comportamento:** `revalidatePath` invalida o cache do Next (RSC + fetch), mas o React Query no cliente tem cache próprio. Mutation via server action precisa também invalidar a query no cliente — não chega automático.

**Solução:** retorna sinal pro client que dispara `queryClient.invalidateQueries(...)`. Ou usa cliente do stack que já integra (ex: `@trpc/tanstack-react-query` invalida automático em `onSuccess`).

**Ref:** confirmado pelo time na adoção retroativa (`/afm:refactor`, 2026-06-30) como já mordido. Ver `src/server/features/post/procedures/revalidate.ts` + `src/server/features/post/domain/revalidate.ts` (revalidação de ISR, estrutura por-feature do ADR-0006).

---

## Node ESM nativo (`prisma/*.ts` via `node`) — não dá pra reimportar `src/lib/*`

**Gatilho:** se você está escrevendo um script em `prisma/` (seed, script de teste manual, etc.) que roda via `node --env-file=.env prisma/algo.ts` — não via Next.js/webpack.

**Comportamento:** `tsconfig.json` usa `moduleResolution: "bundler"`, que permite import relativo sem extensão (`from "../adapter"`) em todo `src/`. Node's execução nativa de TS não aceita isso — exige extensão em todo import relativo. Um script em `prisma/` que importa algo de `src/lib/` quebra assim que esse módulo (ou qualquer coisa que ele importa, em cadeia) tiver um import relativo sem extensão — o que é a convenção padrão do projeto inteiro em `src/`. Mordido 2× (`prisma/seed.ts`, `2026-07-11`; `prisma/seed-pagination-test.ts`, `2026-07-12`) — as duas vezes a "solução" virou duplicar a lógica no script, o que por sua vez duplicou a duplicação.

**Solução:** lógica pura reaproveitada por scripts de `prisma/` vive em `prisma/*.ts` (não em `src/`), sem import relativo próprio (arquivo-folha) — assim outro script de `prisma/` pode importar com extensão explícita (`from "./slug.ts"`) sem cair na cadeia quebrada. Precisa de `"allowImportingTsExtensions": true` no `tsconfig.json` (seguro com `noEmit: true`, que já era o caso). Ver `prisma/slug.ts` (fonte única de `generateSlug`, usada por `seed.ts` e `seed-pagination-test.ts`).

**Ref:** `docs/features/003-post-pagination/` (achado durante a criação de `seed-pagination-test.ts`, 2026-07-12).

---

## Next.js — Cache Components (`cacheComponents: true`) proíbe rota sem `<Suspense>`, mesmo que você não queira PPR

**Gatilho:** se você está tentando fazer uma rota bloquear a resposta inteira até os dados chegarem (ex: pra `notFound()` setar status HTTP 404 de verdade antes do shell ser enviado) removendo o `<Suspense>` que envolve a leitura dinâmica.

**Comportamento:** com `cacheComponents: true` (`next.config.ts`), toda leitura assíncrona não-`"use cache"` (inclusive `await params`, `cookies()`, query de DB) precisa estar dentro de um `<Suspense>` — senão o build falha com `Error: Route "...": Uncached data was accessed outside of <Suspense>` (`next build --debug-prerender` aponta o componente exato). Não existe mais `export const dynamic = "force-dynamic"` como escape hatch por rota — essa route segment config foi removida junto da adoção de Cache Components (Next 16). Ou seja: **não dá pra ter uma rota totalmente bloqueante/dinâmica sob Cache Components** — o shell sempre é enviado antes do conteúdo dinâmico resolver, então o status HTTP do shell (200) não pode mais mudar depois. Mordida em `docs/features/009-post-404-status/` (2026-07-12): tentativa de tirar o `Suspense` de `/post/[slug]` pra corrigir o 404 quebrou o `next build` inteiro.

**Solução:** aceitar que, sob Cache Components, `notFound()`/`redirect()` dentro de um boundary `Suspense` muda o conteúdo mas não o status HTTP do shell já enviado. Pra status HTTP real (bots/SEO), a checagem precisa acontecer **antes** do pipeline de render de página — ex. `middleware`/`proxy` (Edge) fazendo o lookup e retornando 404 direto, fora do Cache Components. Isso é infra nova (rota de dados no Edge), não um fix pontual — parar e validar com o dono antes de implementar.

**Ref:** `docs/features/009-post-404-status/`, `docs/ust.md` § Pendências Técnicas. Doc oficial: https://nextjs.org/docs/messages/blocking-route.

---

## Next.js — página `"use cache"` nunca sabe quem está pedindo (sem cookies)

**Gatilho:** se você precisa personalizar o conteúdo de uma rota que hoje é `"use cache"`/`cacheLife(...)` com base em quem está logado (ex: dono vê algo que visitante não vê).

**Comportamento:** `src/server/caller.ts` tem dois callers: `createCaller()` (usado dentro de componentes `"use cache"`, monta o contexto com `headers: new Headers()` **sempre vazio, sem cookies**) e `createDynamicCaller()` (lê cookies de verdade, mas **redireciona pra `/auth/login` se não houver sessão** — só serve pra página 100% autenticada). Nenhum dos dois serve sozinho pra "página pública que às vezes precisa saber quem é o dono": `createCaller()` nunca vê `ctx.user` (mordida em `docs/features/011-post-status-preview/plan.md` § 9 — tentar passar `ctx.user?.id` pro domain dentro de um componente `"use cache"` simplesmente nunca resolve, porque o caller usado ali nunca teve cookies em primeiro lugar). E não dá pra só chamar `cookies()` dentro do componente `"use cache"` — Cache Components proíbe leitura dinâmica nesse escopo (mesma família de regra do gotcha anterior).

**Solução:** criar um terceiro caller — `createOptionalDynamicCaller()` (`src/server/caller.ts`) — que lê cookies como `createDynamicCaller` mas **não redireciona** se não houver sessão. Estruturar a página em dois componentes: o cacheado (`"use cache"`, caminho público/comum, via `createCaller()`) tenta primeiro; só quando ele não encontra nada, um componente **novo, não-cacheado, dentro do próprio `<Suspense>`**, tenta de novo com `createOptionalDynamicCaller()`. Isso preserva o cache pro caminho comum e paga o custo dinâmico só no caso raro que precisa de identidade. Não dá pra remover `"use cache"` da página inteira sem perder o cache pro tráfego comum — só faça isso se o caso "personalizado" for a maioria do tráfego, não a exceção.

**Ref:** `docs/features/011-post-status-preview/plan.md` § 9, `src/server/caller.ts`.

---

<!--
SEED candidato adicional de módulo detectado no scan (Next.js App Router), ainda não confirmado como mordido — ativar só se acontecer.

## Next.js — root layout sob segmento dinâmico deixa `_not-found` órfão

**Gatilho:** se você deletar `app/layout.tsx` e mover `<html>`/`<body>` pra um segmento dinâmico (ex: `app/[lang]/layout.tsx`).

**Comportamento:** o Next gera uma rota interna `/_not-found` que vive fora do segmento dinâmico, sem root layout pra compor o documento.

**Solução:** `app/global-not-found.tsx` + `experimental.globalNotFound: true`. Não se aplica hoje ao Bearboo (sem rotas `[lang]`), mas fica registrado caso i18n entre em escopo.
-->

---

*Adicionar gotcha novo: copia o formato acima. Coloca em ordem alfabética por área. Se não tem área pra colocar, cria seção H2 nova.*

## Pre-push hook — roda testes escopados, não suite completa

**Gatilho:** se você está fazendo push e quer entender por que o pre-push não rodou seu teste favorito.

**Comportamento:** `.husky/pre-push` (desde 2026-07-16) roda `lint-staged --diff "origin/main...HEAD"` em vez de `yarn test` (suite completa). `lint-staged` usa a configuração `.lintstagedrc.json` que chama `vitest related <files>` — ou seja, **só roda testes ligados aos arquivos alterados**. Benefício: pre-push fica rápido (segundos em vez de minutos). Risco: não detecta quebras em arquivos não diretamente relacionados — especialmente relevante em projeto com **mocks compartilhados em estado serial** (`src/test/setup.ts` seam, ADR-0011). Exemplo: teste de `src/server/features/user/procedures/login.ts` é alterado; o pre-push **não roda** testes de `src/server/features/auth/procedures/verifyToken.ts` se não há importação direta.

**Solução:** **Pre-push é gate rápido local, e hoje é o único gate automatizado que existe** — `docs/roadmap.md` Fase 10 (CI/CD) ainda não começou (sem `.github/workflows/`), então não há um gate de suite completa rodando em merge pra pegar quebras cross-módulo depois. Mitigação até a Fase 10 existir:
- Roda localmente `yarn test` (full suite) antes de push quando a mudança toca múltiplos módulos ou mexe em algo usado pelos mocks compartilhados (`src/test/setup.ts`, ADR-0011).
- Quando a Fase 10 (CI/CD) for implementada, o ideal é a suite completa rodar lá como o gate real — até então, a suite completa só roda se alguém rodar `yarn test` manualmente.

**Ref:** `docs/research/003-pre-push-scoped-tests.md` (decision: Opção 2 — lint-staged + vitest related; a research já registrava esse trade-off, esta nota corrige o gotcha que tinha assumido CI/CD como backstop existente).

---

## Zod v3 → v4 — validators de formato de string viraram funções top-level (deprecated, não erro)

**Gatilho:** se você está escrevendo/revisando um `z.object()` em `schema.ts` de qualquer feature e usa `z.string().url()`, `.email()`, `.uuid()`, `.cuid()`/`.cuid2()`, `.ulid()`, `.datetime()`, `.date()`, `.time()`, `.duration()`, `.ip()`/`.cidr()`, ou `z.nativeEnum()`/`.merge()` em qualquer schema Zod.

**Comportamento:** o projeto está em `zod@^4.0.10` (`package.json`), mas esses métodos ainda **compilam e funcionam** — são API v3 mantida por compat, sem erro de tipo nem warning de lint, então passam despercebidos em review. Zod v4 moveu os validadores de formato de string pra funções top-level; a forma antiga fica **deprecated silenciosamente**. Pego em `018-seo-overrides-slug-redirect` (`post/schema.ts`): `coverImageUrl`/`canonicalUrl` usavam `z.string().url()`.

**Solução — troca 1:1, sem mudança de comportamento:**

| v3 (deprecated, ainda funciona) | v4 (correto) |
| --- | --- |
| `z.string().url()` | `z.url()` |
| `z.string().email()` | `z.email()` |
| `z.string().uuid()` | `z.uuid()` |
| `z.string().cuid()` / `.cuid2()` | `z.cuid()` / `z.cuid2()` |
| `z.string().ulid()` | `z.ulid()` |
| `z.string().datetime()` | `z.iso.datetime()` |
| `z.string().date()` | `z.iso.date()` |
| `z.string().time()` | `z.iso.time()` |
| `z.string().duration()` | `z.iso.duration()` |
| `z.string().ip()` | `z.ipv4()` / `z.ipv6()` (v4 separou os dois) |
| `z.string().cidr()` | `z.cidrv4()` / `z.cidrv6()` |
| `z.nativeEnum(MyEnum)` | `z.enum(MyEnum)` (v4 aceita TS native enum direto) |
| `schemaA.merge(schemaB)` | `schemaA.extend(schemaB.shape)` |
| `error.format()` / `.flatten()` | `z.treeifyError(error)` / `z.prettifyError(error)` |
| `{ message: "..." }` em refinements/checks | `{ error: "..." }` (v4 unificou `message`/`invalid_type_error`/`required_error` num único `error`) |

**Não achou no scan de 2026-07-18** (só documentado como referência preventiva, YAGNI de fix — regra de entrada de gotcha satisfeita por ser "comportamento documentado de SDK externo conhecido por surpreender", não por já ter mordido 2×): `nativeEnum`, `.merge()`, `.format()`/`.flatten()`, `email`/`uuid`/`cuid`/`datetime`/`ip`. Só `z.string().url()` foi achado e corrigido (`post/schema.ts`).

**Ref:** confirmado pelo dono (2026-07-18) revisando `018-seo-overrides-slug-redirect`; motivo de virar gotcha em vez de fix silencioso é exatamente não ter dado erro de tipo — sem essa entrada, o padrão antigo volta a vazar em schema novo sem ninguém notar.

---

## tRPC — `t.procedure` direto pula o middleware de tradução de erro

**Gatilho:** se você está criando uma procedure com `t.procedure` direto (em vez de `baseProcedure`/`publicProcedure`/`protectedProcedure`/`verifiedProcedure`/`roleProcedure`).

**Comportamento:** a tradução `DomainError` → `TRPCError` vive num middleware (`withDomainErrors`) montado no `baseProcedure` (ADR-0019). Uma procedure construída fora dessa cadeia não passa pelo middleware — um `DomainError` que escape do resolver vira `INTERNAL_SERVER_ERROR` (500) com o `httpCode` correto perdido, **sem erro visível** em type-check nem em runtime local. Mordeu no `refreshSession` em `024-error-boundary-centralization` (um `TOO_MANY_REQUESTS` virou 500; pego pela suíte, não pelo compilador).

**Solução:** derive de `baseProcedure`, não de `t.procedure` — mesmo quando precisa pular os guards de sessão (foi o motivo de o `baseProcedure` existir separado do `publicProcedure`: ele carrega só a tradução, sem o guard de sessão expirada). `t.procedure` cru só pra caso que comprovadamente não lança `DomainError` nenhum.

**Ref:** ADR-0019 (§ Consequência, gotcha b). Choke point da tradução: `src/server/http/domainErrorToTRPCError.ts`.
