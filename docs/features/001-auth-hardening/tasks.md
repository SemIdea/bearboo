# Feature 001 — Tasks

> **Plan:** [`./plan.md`](./plan.md)

## Setup

- [X] T001 — Reler `src/server/createContext.ts`, `createRouter.ts`, `src/app/api/trpc/[trpc]/route.ts`, `src/server/features/auth/{schema,domain,procedures}/*`, `src/server/features/user/domain/{login,register}.ts`, `src/context/{auth,trpc}/*`, `src/utils/authStorage.ts` a fresco (feito no discovery — sem lacuna nova).

## Schema

- [X] T002 — `prisma/schema.prisma`: `Session` ganha `previousRefreshToken String?` (nullable). Migration via `prisma migrate diff` schema-to-schema (sandbox sem `DATABASE_URL` funcional — mesma limitação documentada em `008-trpc-error-link`/`010-post-cover-image`, não aplicada contra Postgres real).

## Backend — fundação (cookie jar, rate limit, constantes)

- [X] T003 [P] — `src/server/features/auth/constants.ts`: `SESSION_IDLE_TIMEOUT_MS`, `SESSION_MAX_LIFETIME_MS`, `LOGIN_RATE_LIMIT`, `REGISTER_RATE_LIMIT`, `RESET_RATE_LIMIT`, `REFRESH_RATE_LIMIT`.
- [X] T004 [P] — `src/lib/rateLimit/adapter.ts` (`IRateLimitHelperAdapter`) + `implementations/inMemory.ts` (fixed-window `Map`) + teste (`__test__/inMemory.ts`): permite até `max` no window, rejeita `max+1`, reseta após o window (fake timers).
- [X] T005 [P] — `src/server/http/serializeCookie.ts` (função pura) + teste: `HttpOnly; Path=/; SameSite=Lax` sempre; `Secure` só quando `NODE_ENV=production`; `Max-Age`/expiração pra clear.
- [X] T006 [P] — `src/server/http/cookieJar.ts` (`class CookieJar`, `.set`/`.clear`) + teste.
- [X] T007 — `src/server/infra/container/helpers.ts`: registra `rateLimit: new InMemoryRateLimit()` em `IHelpers` (depende de T004).
- [X] T008 — `src/server/createContext.ts`: `IBaseContextDTO.resCookies: CookieJar` instanciado por request; parse do cookie `refreshToken` → `ctx.refreshToken?: string` (mesmo padrão do `accessToken` já existente) (depende de T006).
- [X] T009 — `src/app/api/trpc/[trpc]/route.ts`: captura a `ctx` criada, `responseMeta` serializa `ctx.resCookies.pending` em headers `set-cookie` (depende de T005, T008).
- [X] T010 — `src/server/createRouter.ts`: substitui `EXPIRES=20000` por `SESSION_IDLE_TIMEOUT_MS` + checagem de `SESSION_MAX_LIFETIME_MS` contra `session.createdAt`; novo middleware factory `rateLimited(opts)` usando `ctx.helpers.rateLimit` (depende de T003, T007).

## Backend — sessão, rotação, reuse-detection

- [X] T011 — `src/server/features/auth/domain/refreshSession.ts`: rotação desloca `refreshToken` atual → `previousRefreshToken` antes de gerar os novos + teste (depende de T002).
- [X] T012 — `src/server/features/auth/domain/readSessionByRefreshToken.ts`: fallback pra `previousRefreshToken`; se achar aí → deleta a sessão inteira, lança erro de token inválido (mesmo código, sem sinal diferente) + teste cobrindo reuse (depende de T002, T011).
- [X] T013 — `src/server/features/auth/procedures/refreshSession.ts`: input vira `{}` (lê `ctx.refreshToken`), seta cookies no sucesso via `ctx.resCookies`, `.use(rateLimited(REFRESH_RATE_LIMIT))` + teste (depende de T009, T010, T012).
- [X] T014 — `src/server/features/auth/procedures/logoutUserFromSession.ts`: limpa `accessToken`/`refreshToken` via `ctx.resCookies.clear(...)` + teste (depende de T009).

## Backend — mensagens genéricas, login, registro, reset

- [X] T015 — `src/server/features/user/domain/login.ts`: busca direto via `ctx.repositories.user.readByEmail` (sem `getUserByEmailOrThrow`); email inexistente OU senha errada → mesmo `AuthErrorCode.INVALID_CREDENTIALS`; `compare` contra hash dummy quando usuário não existe (fecha timing) + teste.
- [X] T016 — `src/server/features/user/procedures/login.ts`: seta cookies no sucesso via `ctx.resCookies`; output para de incluir `accessToken`/`refreshToken`; `.use(rateLimited(LOGIN_RATE_LIMIT))` + teste (depende de T009, T010, T015).
- [X] T017 — `src/server/features/auth/domain/createResetToken.ts`: retorna `null` se usuário não existe (em vez de lançar) + teste.
- [X] T018 — `src/server/features/auth/procedures/sendResetPasswordEmail.ts`: sempre `{success:true}`, manda email só se `createResetToken` achou usuário; `.use(rateLimited(RESET_RATE_LIMIT))` + teste (depende de T010, T017).
- [X] T019 [P] — `src/server/features/user/procedures/register.ts`: `.use(rateLimited(REGISTER_RATE_LIMIT))` + teste (depende de T010).

## Frontend — remove client-side token handling

- [X] T020 — Deleta `src/utils/authStorage.ts`; `src/context/trpc/session.ts` (`refreshTokens()`) para de setar `document.cookie`/`localStorage`, só chama a mutation sem input; `src/context/trpc/sessionRefreshLink.ts` para de chamar `clearAuthData` (não existe mais) — usa só o estado em memória do hook no caminho de falha.
- [X] T021 — `src/context/auth/index.hook.tsx` + `index.tsx`: `AuthProvider` para de fazer `JSON.parse` do cookie `session`; usa `trpc.auth.readUserFromSession.useQuery()` no mount (`onSuccess` popula `session`, erro 401 = deslogado) (depende de T020).
- [X] T022 — Confirma `src/app/(smal)/auth/login/page.client.tsx` (e `register`, se aplicável) continuam funcionando com o novo shape de output de `login` (só `{ user }`) — ajusta tipo se necessário (depende de T016, T021).

## Verificação

- [X] T023 — `npx tsc --noEmit` limpo + `npx vitest run` verde (todas as tasks acima já rodam seus testes locais; esta é a checagem full-suite final).
- [X] T024 — Verificação ao vivo (`next dev` + `curl -v`): login emite 2 headers `Set-Cookie` distintos (`accessToken`, `refreshToken`) com `HttpOnly`/`SameSite=Lax`, sem `Secure` em dev; refresh rotaciona; reuse do token antigo derruba a sessão; rate limit N+1 rejeita. Risco flagged em `plan.md` § 6 — não dá pra confiar só em `tsc`/`vitest` aqui.

## Reconciliação (8.5)

- [X] T025 — `docs/roadmap.md`: nota na Fase 3 confirmando o pré-requisito cumprido (`001-auth-hardening` concluída). `docs/prd.md`: RF novo ou nota em RF-01 sobre hardening. `docs/ach.md` § 3.1: registra `src/server/http/` (cookie jar) e `src/lib/rateLimit/` como componentes novos. `spec.md` status → `done`.
- [X] T026 — Considerar ADR novo pra § 4.1 (cookie jar + responseMeta) — decisão arquitetural aprovada em gate, candidata a registro formal (`docs/adr/`).
- [ ] T027 — Commit(s): backend (schema+cookie jar+rate limit+sessão+mensagens), frontend (client wiring), docs. Sem push.
