# ADR-0012 — Cookie jar + `responseMeta` pra emitir cookies HttpOnly a partir de procedures tRPC

> **Status:** Aceita e implementada
> **Data:** 2026-07-12
> **Decidido por:** dono do produto (gate de `docs/features/001-auth-hardening/plan.md` § 4.1)

## Contexto

`001-auth-hardening` exigia que `accessToken`/`refreshToken` deixassem de ser lidos/escritos via `document.cookie`/`localStorage` (JS-readable, vetor de XSS) e passassem a ser cookies `HttpOnly` de verdade, setados pelo server. O adapter tRPC em uso (`fetchRequestHandler` de `@trpc/server/adapters/fetch`, `src/app/api/trpc/[trpc]/route.ts`) não tinha, até então, nenhum mecanismo pra uma procedure influenciar os headers da resposta HTTP — sem `responseMeta` configurado, sem `ctx.resHeaders`, sem convenção equivalente em nenhum lugar do código (confirmado por scan antes da decisão).

## Decisão

Introduzir um "cookie jar" por request: `src/server/http/cookieJar.ts` (`class CookieJar`, com `.set(name, value, opts)`/`.clear(name)`) instanciado dentro de `createTRPCContext` (`ctx.resCookies`, um por request). Procedures que precisam setar/limpar cookie (`login`, `refreshSession`, `session.logout`) chamam `ctx.resCookies.set(...)`/`.clear(...)` durante a execução. `src/app/api/trpc/[trpc]/route.ts` captura a `ctx` criada (variável fechada sobre o `createContext` do handler) e usa a opção `responseMeta` do `fetchRequestHandler` pra ler `ctx.resCookies.pending` **depois** que todas as procedures do batch resolveram, serializando cada cookie (`src/server/http/serializeCookie.ts` — função pura, `HttpOnly`/`SameSite=Lax` sempre, `Secure` só em produção) num header `set-cookie` próprio.

## Alternativas consideradas

- **(B) Route Handlers dedicados (`/api/auth/{login,refresh,logout}`)** fora do tRPC, usando `cookies().set()` nativo do Next — rejeitada porque quebra a convenção "tudo passa por tRPC" já estabelecida no projeto (`docs/ach.md` § 3.1), obrigando o client a ter 2 caminhos de auth (fetch cru + tRPC) e a reescrever o `TRPCLink` de retry-on-401 já construído em `docs/features/008-trpc-error-link/`. Custo maior de blast radius pro mesmo resultado.

## Consequência

- **Fica fácil:** qualquer procedure futura que precise setar/limpar cookie (ex: preferências de UI, se algum dia precisar) usa o mesmo `ctx.resCookies` — não precisa reabrir a decisão de mecanismo.
- **Fica difícil:** `responseMeta` só roda depois que **todas** as procedures do batch (`httpBatchLink`) resolvem — não dá pra emitir cookie parcial no meio de um batch com múltiplas mutations independentes; não é um problema hoje (nenhum fluxo bate 2 mutations que setam cookie no mesmo batch), mas é uma restrição a lembrar se isso mudar.
- **Risco técnico validado ao vivo (não só por `tsc`/`vitest`):** `Headers.append("set-cookie", ...)` duas vezes (accessToken + refreshToken) realmente produz 2 headers `Set-Cookie` distintos na resposta HTTP final no runtime do Next dev server (Node) — confirmado via `curl -v` contra `/api/trpc/user.login` em `docs/features/001-auth-hardening/tasks.md` T024. Não é garantia universal de toda implementação de `Headers`, mas é o comportamento no stack deste projeto.
- **Não introduz CSRF token separado:** a mitigação de CSRF desta feature é `SameSite=Lax` + `HttpOnly` (ver `plan.md` § 4.2), não um mecanismo adicional no cookie jar.

## Referências

- `docs/features/001-auth-hardening/plan.md` § 4.1 (decisão original, com as 2 opções detalhadas) e § 10 (achado de bug de rate-limit key encontrado na mesma verificação ao vivo, não relacionado ao cookie jar em si).
- `docs/gotchas.md` — nenhum gotcha novo registrado pra este mecanismo (sem surpresa contraintuitiva 2×; o achado de multi-`set-cookie` foi verificado e resolvido na própria implementação, não travou ninguém).
