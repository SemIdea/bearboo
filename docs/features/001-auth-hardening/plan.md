# Feature 001 — Plan

> **Spec:** [`./spec.md`](./spec.md)
> **Status:** approved (gate 2026-07-12, "Cookie jar + responseMeta no tRPC" + "Executa até o fim")

## 1. Resumo técnico

Escopo desta rodada = só camada de aplicação (infra/TLS adiado, `spec.md` § 4). Cinco fios que fecham juntos os critérios de sucesso da § 2 do spec:

1. **Sessão real** — substitui o `EXPIRES = 1000 * 20` (debug leftover, sem coluna `expiresAt`) por uma política de dois tempos: idle timeout (`updatedAt`) + vida máxima absoluta (`createdAt`), ambos computados (sem migration pra isso).
2. **Rotação com detecção de reuse** — `refreshSession` já rotaciona `accessToken`/`refreshToken` a cada uso; falta reter o token anterior por 1 geração pra detectar reuse (token roubado + já rotacionado por outra parte) e revogar a sessão inteira. Precisa de 1 coluna nova (`previousRefreshToken`).
3. **Cookies HttpOnly de verdade** — hoje `document.cookie`/`localStorage` (client-side, JS-readable) é o único jeito de persistir token; o server nunca seta cookie. Isso exige uma peça nova: um mecanismo do server pra emitir `Set-Cookie` a partir de uma procedure tRPC (ver § 4, decisão central desta rodada).
4. **Rate limiting** — não existe nenhum. Novo helper pluggable (`src/lib/rateLimit/`, mesmo padrão de `uidGenerator`/`passwordHashing`), em memória (sem depender da reconstrução do Redis, ADR-0009), aplicado via middleware tRPC em login/registro/reset/refresh.
5. **Mensagens genéricas** — login e reset param de vazar "email não existe" vs "senha errada"/"token inválido". Registro mantém como está (decidido em `spec.md` § 7).

## 2. Componentes afetados

| Componente | Mudança |
| --- | --- |
| `prisma/schema.prisma` | `Session` ganha `previousRefreshToken String?` (nullable — só populado após a 1ª rotação) |
| **NOVO** `src/server/http/cookieJar.ts` | `class CookieJar` — `pending: PendingCookie[]`; `.set(name, value, opts)` / `.clear(name)` |
| **NOVO** `src/server/http/serializeCookie.ts` | função pura: `PendingCookie → string` do header `Set-Cookie` (`HttpOnly; Path=/; SameSite=Lax` sempre; `Secure` só quando `env.NODE_ENV === "production"`, mesmo padrão de `src/server/infra/container/gateways.ts:13`) |
| `src/server/createContext.ts` | `IBaseContextDTO` ganha `resCookies: CookieJar` (instanciado por request); parse do cookie `refreshToken` (mesmo padrão do `accessToken` já existente) → `ctx.refreshToken?: string`, usado só por `refreshSession` |
| `src/app/api/trpc/[trpc]/route.ts` | captura a `ctx` criada (variável fechada sobre o `createContext` do handler) e adiciona `responseMeta` que serializa `ctx.resCookies.pending` em headers `set-cookie` |
| `src/server/createRouter.ts` | remove `EXPIRES = 1000 * 20`; usa `SESSION_IDLE_TIMEOUT_MS`/`SESSION_MAX_LIFETIME_MS` de `auth/constants.ts`; adiciona checagem de vida máxima (`createdAt`); novo middleware factory `rateLimited(opts)` |
| **NOVO** `src/server/features/auth/constants.ts` | `SESSION_IDLE_TIMEOUT_MS`, `SESSION_MAX_LIFETIME_MS`, `LOGIN_RATE_LIMIT`, `REGISTER_RATE_LIMIT`, `RESET_RATE_LIMIT`, `REFRESH_RATE_LIMIT` |
| **NOVO** `src/lib/rateLimit/adapter.ts` + `implementations/inMemory.ts` | porta `IRateLimitHelperAdapter = { consume(key, {max, windowMs}): Promise<{allowed: boolean}> }`; implementação fixed-window em `Map` |
| `src/server/infra/container/helpers.ts` | registra `rateLimit: new InMemoryRateLimit()` em `IHelpers` |
| `src/server/features/auth/domain/refreshSession.ts` | rotação desloca `refreshToken` atual → `previousRefreshToken` antes de gerar os novos |
| `src/server/features/auth/domain/readSessionByRefreshToken.ts` | se não achar por `refreshToken`, tenta achar por `previousRefreshToken`; se achar aí = reuse → deleta a sessão inteira, lança erro genérico (mesmo código de token inválido — não dá sinal diferente pro atacante) |
| `src/server/features/auth/procedures/refreshSession.ts` | não recebe mais `refreshToken` no input (lê de `ctx.refreshToken`, cookie); no sucesso, chama `ctx.resCookies.set(...)` pros 2 tokens novos |
| `src/server/features/auth/procedures/logoutUserFromSession.ts` | além de deletar a sessão (já faz), chama `ctx.resCookies.clear("accessToken")` / `.clear("refreshToken")` |
| `src/server/features/user/procedures/login.ts` | no sucesso, `ctx.resCookies.set(...)` pros 2 tokens; **response body para de incluir `accessToken`/`refreshToken`** (só o necessário pro client saber "logado", nunca o valor do token) |
| `src/server/features/user/domain/login.ts` | não usa mais `domain_getUserByEmailOrThrow` (que joga 404 distinguível); busca direto via `ctx.repositories.user.readByEmail`; se não achar OU senha errada → **mesmo** `AuthErrorCode.INVALID_CREDENTIALS`. Faz `compare` contra hash dummy mesmo quando usuário não existe (fecha o vetor de timing, não só o de mensagem) |
| `src/server/features/auth/domain/createResetToken.ts` | não lança mais se usuário não existe — retorna `null`; a procedure decide se manda email |
| `src/server/features/auth/procedures/sendResetPasswordEmail.ts` | sempre responde `{ success: true }`, manda email só se `createResetToken` achou usuário — nunca revela a diferença |
| `src/server/features/auth/procedures/login.ts`, `register.ts`, `sendResetPasswordEmail.ts`, `refreshSession.ts` | cada uma ganha `.use(rateLimited(...))` com o limite correspondente de `constants.ts` |
| `src/utils/authStorage.ts` | **deletado** — client não seta mais cookie/localStorage nenhum, o server faz isso via `Set-Cookie` |
| `src/context/trpc/session.ts` | `refreshTokens()` para de setar `document.cookie`/`localStorage` — só chama a mutation (sem input) e deixa o browser aplicar o `Set-Cookie` sozinho |
| `src/context/trpc/sessionRefreshLink.ts` | idem — para de chamar `clearAuthData` (arquivo não existe mais); no caminho de falha, só limpa estado em memória (`clearSession()` do hook) e redireciona |
| `src/context/auth/index.hook.tsx`, `index.tsx` | `AuthProvider` para de fazer `JSON.parse` do cookie `session` (não existe mais, era JS-readable por design — o próprio vazamento que a spec pede pra fechar); no mount, chama `trpc.auth.readUserFromSession.useQuery()` (já existe, não muda) — `onError` (401) = deslogado, `onSuccess` = popula `session` |
| `src/app/(smal)/auth/login/page.client.tsx`, `register/page.client.tsx` (se aplicável) | `onSuccess` do `useMutation` já chama `updateAuthData(data)` — passa a receber só `{ user }` (sem tokens no body), continua funcionando pois o hook não lê mais token nenhum |

## 3. Fora de escopo

Ver `spec.md` § 4. TLS/HTTPS e credenciais do `docker-compose.yml` ficam pra depois (decisão do dono, `spec.md` § 7).

## 4. Decisões arquiteturais

### 4.1 — Mecanismo de emissão de cookie HttpOnly (decisão central — ver § 9, vai pro gate)

O adapter `fetchRequestHandler` (`@trpc/server/adapters/fetch`) usado em `route.ts` hoje não tem nenhum jeito de uma procedure influenciar os headers da resposta — não existe `responseMeta`, nem `ctx.resHeaders`, nem convenção equivalente em nenhum lugar do código (confirmado por scan). Pra emitir `Set-Cookie` de verdade a partir de `login`/`refreshSession`/`logout`, alguma peça nova é obrigatória. Duas opções:

- **(A) Cookie jar no `ctx` + `responseMeta` no adapter tRPC — recomendada.** `createContext` instancia um `CookieJar` mutável por request; procedures chamam `ctx.resCookies.set(...)`; `route.ts` lê o mesmo objeto (capturado por closure) dentro de `responseMeta` e emite os headers `set-cookie` depois que todas as procedures do batch rodaram. **Prós:** mantém "tudo passa por tRPC" (convenção atual, `ach.md` § 3.1); zero endpoint novo; é o padrão idiomático documentado pelo próprio tRPC pra esse problema. **Contras:** é uma peça nova (`src/server/http/`) com um contrato novo entre `createContext`/procedure/`route.ts` — aciona regra dura 11 por definição (nova camada + contrato cross-módulo). Risco técnico a validar: `Headers.append("set-cookie", ...)` duas vezes (accessToken + refreshToken) precisa realmente virar 2 headers `Set-Cookie` distintos na resposta HTTP final (runtime Node/Edge modernos tratam `set-cookie` como caso especial em `Headers`, mas isso entra em `tasks.md` como verificação explícita, não presunção).
- **(B) Route Handlers dedicados pra login/register/refresh/logout, fora do tRPC.** Endpoints `/api/auth/{login,refresh,logout}` chamando o router internamente (`createCaller`, já existe o padrão) e usando `NextResponse`/`cookies().set()` (API nativa do Next, já com suporte a `httpOnly` pronto). **Prós:** zero mudança na infra do tRPC; `cookies().set()` é a API padrão do framework, sem serialização manual. **Contras:** quebra "tudo é tRPC" — client passa a ter 2 caminhos de auth (fetch cru pra login/refresh/logout, tRPC pra tudo mais); `sessionRefreshLink.ts` (feature 008, `done`, o link de retry-on-401) teria que aprender a chamar um endpoint não-tRPC no meio do fluxo, mais mudança de superfície do que (A).

**Recomendação: (A).** Blast radius menor no client (o `TRPCLink` de retry continua funcionando sem reescrever), preserva a convenção arquitetural vigente, e o "custo" (peça nova) é proporcional ao problema (não tem como ter cookie HttpOnly setado por uma procedure sem *algum* mecanismo novo — a pergunta é só qual). Vai pro gate como confirmação explícita antes de implementar (regra 11).

### 4.2 — `SameSite=Lax`, não `Strict`, sem CSRF token separado

O critério de sucesso é "mutation tRPC autenticada não pode ser disparada por site de terceiro usando só o cookie". `SameSite=Lax` já bloqueia isso — mutations tRPC vão por POST (`httpBatchLink`), e `Lax` só permite cookie em navegação top-level GET cross-site, nunca em POST. `Strict` fecharia até mais (nem GET top-level cross-site manda cookie), mas custaria UX real: alguém clicando um link externo pra `/post/mine` chegaria "deslogado" no primeiro load. Como o threat model testável pela spec é POST (mutation), `Lax` fecha o critério sem essa fricção. Sem token CSRF de dupla-submissão separado — seria redundante em cima de `SameSite=Lax` + `HttpOnly` pra este threat model, e adicionaria uma peça a mais (geração/validação de token) sem fechar um vetor que já não está fechado.

### 4.3 — Rate limit em memória, chaveado por email (não por IP)

Sem Redis reconstruído (ADR-0009 explícito: reconstrução é decisão futura separada) e app single-instance, um `Map` em processo é suficiente e não reabre essa decisão. Chave = email do input (disponível em login/registro/reset), não IP: IP confiável exigiria `X-Forwarded-For` do nginx configurado corretamente, que é peça de infra adiada nesta rodada (`spec.md` § 4). `refreshSession` não tem email no input — chaveia pelo próprio valor do `refreshToken` recebido. Assumido, não bloqueante: reinicia o processo, reseta os contadores — aceitável pro perfil de tráfego de um blog pessoal, documentado como trade-off (`[A DEFINIR]`: revisitar se/quando o Redis for reconstruído).

### 4.4 — Sem migration nova pra timeout de sessão, 1 coluna nova só pra reuse-detection

Idle timeout (`updatedAt`) e vida máxima (`createdAt`) já são colunas existentes — zero schema change pra política de expiração. Só a detecção de reuse do refresh token precisa reter o token anterior por 1 geração; `previousRefreshToken String?` nullable no `Session` é a menor mudança de schema que fecha o cenário Gherkin "token roubado e reutilizado após rotação" sem introduzir uma tabela de histórico (over-engineering pro volume de sessões de um blog pessoal — 1 coluna nullable é suficiente pra 1 geração de detecção, que é o que o cenário pede).

### 4.5 — Regra dura 15 (Domain ≠ Transport) permanece violada nos arquivos tocados — decisão consciente de escopo

`login.ts`, `refreshSession.ts`, `readSessionByRefreshToken.ts` já lançam `TRPCError` direto do domain hoje (3 dos 17 arquivos na violação forward-only conhecida, `afm.md` § 3.1). Esta feature os modifica mas **não** introduz o mecanismo `DomainError` + mapeamento no boundary que corrigiria isso — construir essa infra nova (classe de erro + tabela de mapeamento código-domínio → `TRPCError`) é um refactor transversal a 30 arquivos de domain, desproporcional a esta feature já grande. Mantém o padrão majoritário atual (throw direto), documentado aqui como débito consciente, não descoberto por acidente depois. Candidato a ADR/feature própria se o dono quiser fechar a violação inteira depois.

## 5. Contratos

- `auth.refreshSession`: **input muda de `{ refreshToken: string }` pra `{}` (vazio)** — breaking change intencional; único client (`src/context/trpc/session.ts`) é atualizado na mesma entrega. Token vem do cookie, nunca mais do body.
- `user.login` output: **para de incluir `accessToken`/`refreshToken`** no corpo da resposta — breaking change intencional, mesmo motivo (tokens só existem como cookie HttpOnly, nunca em JSON legível por JS). Continua incluindo `user`.
- `auth.readUserFromSession`: sem mudança de contrato — passa a ser o único jeito do client saber "quem está logado" (antes era client lendo o cookie `session` direto).

## 6. Riscos

- **`Headers.append("set-cookie", ...)` com múltiplos valores** — precisa verificação real (`curl -v` contra o dev server, checar 2 headers `Set-Cookie` distintos na resposta de `login`), não só `tsc`/`vitest`. Se o runtime não expuser múltiplos `set-cookie` via essa API, cai pra emitir 1 cookie combinado (`accessToken` + `refreshToken` no mesmo valor serializado, separados) — ajuste de implementação, não de desenho.
- **`SameSite=Lax` + `Secure` só em produção**: em dev (HTTP puro), cookie sai sem `Secure` (correto — `Secure` em HTTP silenciosamente descarta o cookie no browser, que já é o bug dormente encontrado em `session.ts:29` hoje). Precisa testar dev E produção-simulada (`NODE_ENV=production` local) pra não repetir esse bug.
- **Rate limit em memória reseta em cada deploy/restart** — aceitável (§ 4.3), mas documentar visivelmente pra não virar surpresa se o dono notar "por que consegui tentar de novo depois do deploy".
- **Mudança de contrato quebra qualquer client externo hipotético** — não existe hoje (é uso interno do próprio Next app), risco teórico.

## 7. Validação contra invariantes (regras duras)

- Regra 1 (teste): cobre reuse-detection (token antigo rejeitado + sessão inteira sumiu), rotação normal, rate limit (N+1 rejeitado, N permitido), mensagem idêntica pra email-não-existe vs senha-errada, resetToken sempre `{success:true}`, cookie jar serializa `HttpOnly`/`SameSite`/`Secure` condicional corretamente (teste da função pura `serializeCookie`, sem precisar de servidor real).
- Regra 4 (`tsc --noEmit`): checar a cada task, contrato de `refreshSession`/`login` muda tipos usados no client.
- Regra 5 (uma responsabilidade por arquivo): `auth/constants.ts` é nome específico do domínio (não "utils"/"helpers" vago) — ok. `cookieJar.ts`/`serializeCookie.ts` cada um com 1 responsabilidade.
- Regra 6 (≤300 linhas): `createRouter.ts` ganha ~20-30 linhas (rate limit middleware), permanece bem abaixo do limite.
- Regra 11 (mudança arquitetural pára e pergunta): **§ 4.1 é exatamente esse caso** — vai pro gate explicitamente, não decidido em silêncio.
- Regra 13 (segredos não vazam): checar que nenhum teste novo loga token em claro; `serializeCookie` não deve aparecer em nenhum log.
- Regra 15: violação consciente documentada em § 4.5, não expandida nem escondida.
- Regra 16 (validação no boundary): `refreshToken` deixa de ser input Zod validado pelo client — passa a vir de `ctx` (cookie), parseado em `createContext.ts` igual o `accessToken` já é hoje (mesmo padrão, não um boundary novo).
- Regra 30 (Domain não importa Prisma/driver direto): sem mudança — `resCookies`/`rateLimit` são helpers/infra de request, não acesso a dado.

## 8. Dependências

Nenhuma nova além das já listadas em `spec.md` § 6. `docs/features/008-trpc-error-link/` (`done`) é o único acoplamento real — o `TRPCLink` de retry-on-401 que essa feature construiu continua funcionando, só perde as linhas que manipulavam cookie/localStorage manualmente.

## 9. Gate desta sessão

Pergunta central: **confirmar § 4.1 (mecanismo A, cookie jar + `responseMeta`)** antes de tocar em código — é a única decisão desta rodada que introduz camada nova sob `src/server/` (regra 11). O resto (§ 4.2-4.5) são decisões já tomadas com justificativa registrada acima, não bloqueantes.

## 10. Achado durante verificação ao vivo (2026-07-12) — chave de rate limit sem escopo por endpoint

`assertRateLimit(ctx, key, limit)` (§ 2/§ 4.3) foi implementado inicialmente com `key = input.email` cru em `login`/`register`/`sendResetPasswordEmail` — os 3 endpoints compartilham o **mesmo** `Map` (`ctx.helpers.rateLimit`, singleton do container). Como a chave era só o email, sem prefixo por endpoint, os 3 contadores colidiam: registrar um email consumia parte do orçamento de tentativas de login daquele mesmo email, e vice-versa — um efeito colateral tipo DoS (esgotar o rate limit de registro de uma vítima também bloqueava o login dela). `vitest` não pegou isso porque cada teste usa um `ctx`/email isolado por padrão; só apareceu ao testar ao vivo contra o dev server real (T024), reusando o mesmo email em sequência de login/refresh.

**Fix:** cada call site prefixa a chave com o nome do próprio endpoint — `` `login:${email}` ``, `` `register:${email}` ``, `` `reset:${email}` ``, `` `refresh:${refreshToken}` `` — isolando os buckets. Teste de regressão adicionado (`procedures/__test__/register.ts`, "Should not share the rate-limit counter with login for the same email") comprova que exaurir o limite de registro não afeta login do mesmo email. Verificado de novo ao vivo: 10 tentativas de login permitidas (`LOGIN_RATE_LIMIT.max`), 11ª rejeitada com `429`, usando um email nunca tocado por outro endpoint.

**Lição pro padrão:** qualquer novo call site de `assertRateLimit` deve prefixar a key com o nome do próprio endpoint/scope — a função não faz isso sozinha (key é opaca de propósito, pra permitir chavear por email, token, IP, etc. conforme o caso).
