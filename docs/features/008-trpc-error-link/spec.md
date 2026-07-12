# Feature 008 — Parsing de erro de sessão via link tRPC tipado

> **Spec:** o quê e o porquê. Sem decisão de tecnologia.
> **US relacionada(s):** US-003 (Refresh e logout de sessão)
> **Status:** done (2026-07-12 — `tsc --noEmit` limpo, `vitest` 147/147 verdes incl. 6 testes novos de `sessionRefreshLink` cobrindo as 4 branches + passthrough; `next build` confirma compilação/bundling do client sem erro novo (o erro de prerender de `/` é pré-existente, reproduzido também em `main` antes desta feature); dev server + curl confirmam boot sem erro relacionado ao client tRPC)
> **Data de abertura:** 2026-07-12

## 1. Problema (do PRD/UST)

O Bruno (persona única do Bearboo — dev + avaliador do próprio código, `prd.md` § 3) mantém em `docs/ust.md` § Pendências Técnicas uma pendência aberta: `src/context/trpc/fetcher.ts` (`customFetcher`) reimplementa na mão o parsing do envelope de erro do `httpBatchLink` (array + `error.json.message` do superjson) pra decidir se a sessão deve ser renovada. Um bug nesse parsing já quebrou em produção uma vez (2026-07-11, corrigido) porque o código lia `body.error.code`, formato que não existe no batch. O desenho continua frágil: qualquer mudança no formato interno de serialização do tRPC quebra esse parsing de novo, **silenciosamente** (sem erro de tipo, só comportamento errado em runtime). O próprio `ust.md` já aponta o caminho: mover a lógica pra um link customizado do tRPC, que recebe o erro já tipado (`TRPCClientError`) em vez de JSON cru.

## 2. Critério de sucesso observável

- [x] `src/context/trpc/fetcher.ts` (parsing manual de JSON) deixa de existir — a decisão de renovar sessão/redirecionar usa `TRPCClientError.data.code` e `.message`, tipados pelo próprio tRPC.
- [x] Os 4 comportamentos hoje cobertos pelo `customFetcher` continuam idênticos do ponto de vista do usuário: (a) sessão expirada → renova token 1x e repete a chamada; (b) token inválido → limpa auth e redireciona pra `/auth/login`; (c) credenciais inválidas no login → erro passa adiante sem redirecionar; (d) usuário não verificado (403) → redireciona pra `/auth/verify`.
- [x] Uma mudança futura no formato interno de serialização do tRPC (ex: shape do erro) não pode mais quebrar esse fluxo silenciosamente — o código depende de campos tipados pelo próprio `@trpc/client`, não de parsing manual de array/JSON.

## 3. Cenários (Gherkin, herda da US-003)

```gherkin
Scenario: Sessão expirada renovada automaticamente
  Given uma sessão cujo accessToken expirou no servidor
  When o cliente faz uma chamada tRPC qualquer
  Then o link detecta o erro UNAUTHORIZED/SESSION_EXPIRED tipado
  And chama refreshTokens() e repete a chamada original 1 vez
  And o usuário não percebe interrupção (retry transparente)

Scenario: Refresh falha (refresh token também inválido)
  Given uma sessão cujo refresh token não é mais válido
  When o link tenta renovar a sessão após um 401
  Then os dados de auth locais são limpos
  And o usuário é redirecionado para /auth/login
```

## 4. Out of scope

- Mover a lógica de refresh do `src/server/caller.ts` (RSC/server-side caller) — usa `onError` do `createCaller`, é um mecanismo server-side completamente separado do link client-side, não usa `fetch`/`customFetcher`.
- Qualquer hardening de segurança de sessão (expiração real no servidor, cookie `HttpOnly`, CSRF) — isso é escopo de `docs/features/001-auth-hardening/spec.md`, que segue `draft` e não é tocado aqui. Ver § 6.
- Mudar o formato de erro emitido pelo servidor (`createRouter.ts` `errorFormatter`) — a feature só troca onde/como o cliente lê o erro que já existe hoje.

## 5. Assumptions / Open questions

- Assunção: `err.data.code` (tipado como `TRPC_ERROR_CODE_KEY`) e `err.message` (a string passada em `new TRPCError({ message })` no servidor) já carregam exatamente a informação que o `customFetcher` hoje extrai manualmente de `error.json.message` — confirmado lendo `TRPCClientError.from` em `node_modules/@trpc/client` (usa `cause.error.message` e `cause.error.data`) e `errorFormatter` em `src/server/createRouter.ts` (não reescreve `message`, só estende `data`).
- Sem `[NEEDS CLARIFICATION:]` — discovery resolveu via leitura de código/tipos instalados, sem decisão de produto pendente.

## 6. Dependências

- US-003 (refresh/logout de sessão) — `done`, esta feature só troca a implementação client-side do mecanismo de refresh, não seu comportamento.
- **Não depende de nem bloqueia** `docs/features/001-auth-hardening/spec.md` (`draft`) — decisão de escopo: esta feature é robustez de parsing (bug de design já registrado em `ust.md`), não hardening de segurança. Ver § 4.

## 7. Clarifications

_(vazio — discovery convergiu sem irredutíveis; ver § 5.)_

---

*Spec NÃO contém: decisão de stack, nomes de função, schema de DB, ordem de tasks. Isso vai pro `plan.md`.*
