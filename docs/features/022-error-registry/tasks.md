# Feature 022 — Tasks

> **Spec:** [`./spec.md`](./spec.md)
> **Plan:** [`./plan.md`](./plan.md)
> **Convenção:** TDD-ordenadas. `[P]` = paralelizável. Cada task é um ciclo de `core/afm.md` § 2 (RED → GREEN → REFACTOR → COMMIT). Tasks T008-T012 são migrações batched por feature (múltiplos throw-sites pequenos e uniformes por grupo) — RED = atualiza os testes existentes que hoje asserem `TRPCError` cru pra asserir o novo catch/`DomainError`; GREEN = reescreve domain+boundary do grupo.
> **Pré-requisito:** `plan.md` sem `[NEEDS CLARIFICATION:]` aberto — confirmado.

## Phase 1 — Setup

- [X] T001 [P] — RED: testes de `src/shared/error/__test__/registry.ts` — `defineDomainErrors` remapeia chave (`"auth.invalid_credentials"`), segundo `defineDomainErrors` com mesmo domínio lança (US-017)
- [X] T002 — GREEN: implementa `src/shared/error/registry.ts` (`defineDomainErrors` + `Set` de domínios registrados) (US-017)

## Phase 2 — Foundation (prova o pattern na fatia já migrada — media)

- [X] T003 — Migra `src/shared/error/media.ts` pro formato `defineDomainErrors("media", {...})` (US-017)
- [X] T004 — Cria `src/shared/error/index.ts` agregando `media.ts` (`Errors`, `ErrorCode = keyof typeof Errors`) (US-017)
- [X] T005 — RED: teste `src/shared/error/__test__/domainError.ts` — `DomainError(code)` resolve `httpCode`/`message` do registry (US-017)
- [X] T006 — GREEN: reescreve `src/shared/error/domainError.ts` (US-017)
- [X] T007 — Atualiza `media/domain/delete.ts` (`new DomainError("media.not_found")` etc.) + `media/procedures/delete.ts` (catch genérico, sem if/switch) + `media/domain/__test__/delete.ts` (US-017 cenário 1)

## Phase 3 — Boundary (migração coordenada, regra dura 15)

- [X] T008 — auth+session: migra `auth.ts`+`session.ts` pra `defineDomainErrors`; reescreve `user/domain/login.ts`, `auth/domain/{createAuthSession,deleteSession,readSessionByRefreshToken,readUserAndSessionByAccessToken,refreshSession}.ts`; catch genérico em `user/procedures/login.ts`, `auth/procedures/{logoutUserFromSession,refreshSession}.ts`, `src/server/createContext.ts` (troca `instanceof TRPCError` por `instanceof DomainError`); atualiza testes correspondentes (US-017)
- [X] T009 — reset/verify token: migra `resetToken.ts`+`verifyToken.ts`; reescreve `auth/domain/{resetPassword,verifyToken}.ts`; catch genérico em `auth/procedures/{resetPassword,verifyToken}.ts`; atualiza testes (US-017)
- [X] T010 — user: migra `user.ts`; reescreve `user/domain/{getUserByEmailOrThrow,getUserOrThrow,register}.ts`; catch genérico em `user/procedures/register.ts`, `auth/procedures/resendVerificationEmail.ts` (via `reCreateToken.ts`), `user/procedures/{readProfile,readComments,updateRole,readPosts}.ts` (via `getUserOrThrow`); atualiza testes (US-017)
- [X] T011 [P] — comment: migra `comment.ts`; reescreve `comment/domain/{delete,update}.ts`; catch genérico em `comment/procedures/{delete,update}.ts`; atualiza testes (US-017)
- [X] T012 [P] — post: migra `post.ts`; reescreve os 10 `post/domain/{archive,delete,publish,readBySlug,readReviewComments,read,reject,revalidate,submitForReview,update}.ts`; catch genérico nos 10 `post/procedures/*` correspondentes; atualiza testes (US-017)
- [X] T013 — Simplifica `src/lib/error.ts` (`getErrorMessage` vira lookup-com-pass-through: resolve code legado se reconhece, senão devolve como está); atualiza `src/lib/__test__/backendSupport.ts` (US-017 cenário 3). **Divergência do plan:** os ~13 call-sites do frontend não precisaram mudar — o pass-through em `getErrorMessage` já cobre os dois formatos transparentemente, então `onError: (error) => setErrorMessage(getErrorMessage(error.message))` continua funcionando sem edição.

## Phase 4 — Reconciliação (8.5)

- [X] T014 — `ach.md` § 3.2 remove a nota "Estado atual — violação difundida"; `afm.md` § 3 regra 15 (verificação passa a vazio) + § 3.1 remove a linha da tabela forward-only (regra 15 resolvida) (RF-14)
- [X] T015 [P] — `docs/roadmap.md` Fase 9 marca "tratamento de erro padronizado" `[x]` (RF-14)
- [X] T016 — `ust.md` US-017 → `done`; `spec.md`/`plan.md` status → `done` (RF-14)

---

*Toda task referencia US-017 ou RF-14 no commit.*
*Toda task é executada como ciclo do `core/afm.md` § 2 — não pula RED (regra 1).*
