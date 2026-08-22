# Feature 024 — Tasks

> **Spec:** [`./spec.md`](./spec.md) · **Plan:** [`./plan.md`](./plan.md)
> **Convenção:** TDD-ordenadas. `[P]` = paralelizável. Cada task é um ciclo de `core/afm.md § 2` (RED → GREEN → REFACTOR → COMMIT).
> **Ordem é load-bearing:** a tabela de transporte nasce antes de o `httpCode` morrer (plan § 6).

## Phase 1 — Foundation (tabela de transporte + lookup do registry)

- [X] T001 — RED: teste de paridade `src/server/http/__test__/domainErrorTransport.ts` — a tabela cobre exatamente `ErrorCode` e cada entrada bate com o `httpCode` do catálogo atual (rede de transcrição, deletado em T012) (US-017)
- [X] T002 — GREEN: `src/server/http/domainErrorTransport.ts` — `Record<ErrorCode, TRPC_ERROR_CODE_KEY>` com as 29 entradas transcritas do catálogo (US-017)
- [X] T003 — RED: teste `src/shared/error/__test__/registry.ts` — `resolveErrorEntry(code)` devolve `message`/`retryable`/`level` já normalizados (defaults `false`/`"warn"` aplicados no lookup, não no consumidor) (US-017)
- [X] T004 — GREEN: `src/shared/error/registry.ts` — `resolveErrorEntry` + tipo de saída com campos obrigatórios (US-017)

## Phase 2 — Boundary (centralização da tradução)

- [ ] T005 — RED: teste `src/server/http/__test__/withDomainErrors.ts` — `DomainError` do resolver vira o código de transporte correto; throw não-`DomainError` continua `INTERNAL_SERVER_ERROR`; `cause` preservado (US-017)
- [ ] T006 — GREEN: `src/server/http/withDomainErrors.ts` (inspeciona `result.ok`, remapeia via tabela + `resolveErrorEntry`) + `baseProcedure` em `src/server/createRouter.ts`; exporta `findDomainError` de `boundaryLog.ts` (US-017)
- [ ] T007 — Os 6 guards de `createRouter.ts` passam a `throw new DomainError(...)` direto (session_expired, rate limit, not_logged_in, not_verified, insufficient_role) (US-017)
- [ ] T008 — `refreshSession.ts` migra de `t.procedure` pra `baseProcedure` (mantendo o bypass intencional do guard de sessão) (US-017)
- [ ] T009 [P] — Remove o try/catch de tradução das 26 procedures (US-017)
- [ ] T010 — `classifyBoundaryError` resolve metadata via `resolveErrorEntry` em vez de ler campos da instância; assinatura pública inalterada (US-017)

## Phase 3 — Inversão (transporte sai do domínio)

- [ ] T011 — `DomainError` reduz a `code` (`super(code)`), sem `httpCode`/`retryable`/`level`; atualiza `src/shared/error/__test__/domainError.ts` (US-017)
- [ ] T012 — Remove `httpCode` dos 8 catálogos e de `ErrorEntry`; remove `import type { TRPC_ERROR_CODE_KEY } from "@trpc/server"` de `registry.ts`; **deleta o teste de paridade** do T001 (US-017)
- [ ] T013 — `createContext.ts` decide limpar cookie por `code === "session.access_token_invalid"` + teste de regressão cobrindo que outro código UNAUTHORIZED **não** limpa (US-017)

## Phase 4 — Reconciliação (8.5)

- [ ] T014 — `docs/adr/0019-*.md`: centralização no middleware (substitui ADR-0016, estende 0017/0018), inversão da dependência de transporte, `errorFormatter` rejeitado com a evidência do `createCaller` (RF-14)
- [ ] T015 — Reescreve o gatilho da regra dura 33 (`afm.md § 3`) — ficaria vacuous com zero `TRPCError` nas procedures; adiciona regra dura nova proibindo `@trpc/*` em `src/shared/**` (RF-14)
- [ ] T016 — `docs/ach.md § 3.2` (contrato de erro), US-017 em `ust.md` (critério menciona procedure traduzindo — atualizar), `docs/rubrics/error-classification.md` (ainda apresenta `Result<T,E>` como preferido, contradiz ADR-0018), `spec.md` status → done (RF-14)

---

*Toda task referencia US-017 ou RF-14 no commit. Cada task é ciclo do § 2 — não pula RED (regra 1).*
