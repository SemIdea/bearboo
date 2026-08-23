# Rubrica — classificação de erros (Domain ≠ Procedure ≠ Infra)

## Os 3 níveis

### Domain error — regra de negócio violada

**Quem joga:** funções `domain_*` (regra de negócio pura).

**Como representa:** `throw new AppError("<domain>.<code>")` — código namespaced do `ErrorRegistry`.

```ts
// O domain nomeia o que aconteceu. Nada mais.
throw new AppError("post.not_found");
```

O `AppError` carrega **só o código** (ADR-0019). Mensagem, `retryable` e `level` são resolvidos por quem consome, via `resolveErrorEntry(code)`; o código de transporte, via `appErrorTransport` — que vive em `src/server/`, não no catálogo.

**Code é literal derivado do registry** (`ErrorCode = keyof typeof Errors`) — typo quebra `tsc`, não o runtime.

> **`Result<T, E>` foi avaliado e rejeitado** (ADR-0017 § alternativas, reafirmado em ADR-0018): o call depth do projeto é raso (domain → 1 procedure) e as procedures são pipelines lineares, então `throw` + tradução única no boundary já é o ótimo; `Result` só adicionaria cerimônia sem operador `?` nem do-notation. Esta rubrica apresentava `Result` como opção preferida até 2026-08-22 — não é mais.

### Procedure error — boundary de transport

**Quem joga:** procedures (handlers tRPC / route handlers / controllers).

**Como representa:** `TRPCError` (ou equivalente do framework — `HTTPException` no FastAPI, `BadRequestException` no Nest).

**Boundary é unidirecional:** o transporte CONHECE o domínio e mapeia código → código de transporte. O domínio não importa `TRPCError` (regra 15) e não declara código de transporte (regra 35).

**A procedure não escreve tradução nenhuma.** Ela vive num middleware montado no `baseProcedure` (ADR-0019):

```ts
// a procedure inteira — sem try/catch, sem switch
.mutation(async ({ input, ctx }) =>
  domain_createComment({ ctx, input: { ...input, userId: ctx.user.id } }),
);
```

Se você está escrevendo `if (error instanceof AppError) throw new TRPCError(...)` numa procedure, pare: isso é a duplicação que a feature 024 removeu de 32 lugares.

### Infra error — falha de recurso externo

**Quem joga:** ninguém intencionalmente — sobe de cliente HTTP, ORM, fila.

**Como propaga:**
- Em **Task-like** (Trigger.dev, BullMQ): deixa subir. Retry policy do orquestrador resolve.
- Em **Procedure-like**: cathc no boundary final, log, mapeia pra `INTERNAL_SERVER_ERROR`. Não vaza stack pro client.

## Anti-patterns

- ❌ **Domain importando `TRPCError`.** Domain vira acoplado ao transport. Regra dura 15: `grep -rn "TRPCError" src/server/modules/**/domain/` retorna 0.
- ❌ **`throw new Error("string genérica")` em domain.** Sem code literal, caller não consegue tratar specificamente. Use `AppError({ code: "..." as const })`.
- ❌ **Try/catch genérico em todo await.** Erros tipados > catch genérico. Catch só se você vai tratar (mapear, logar specificamente, fazer fallback consciente). Senão deixa subir.
- ❌ **Procedure que retorna `{ error: "..." }` em vez de jogar.** Quebra contrato do framework, força client a checar `data.error` em vez do mecanismo padrão.
- ❌ **Misturar Domain error e Infra error no mesmo switch.** Domain code é fechado (sei todos os casos); Infra é aberto (rede pode falhar de N formas). Trate separado.

## Decision flow

```
Onde estou?
├── domain function → throw new AppError("<domain>.<code>"); nada de transporte
├── procedure        → não traduz nada; deixa subir (o middleware traduz)
├── boundary novo    → resolve via resolveErrorEntry + sua própria tabela de transporte
├── task             → leva idempotência; deixa Infra subir (retry resolve)
└── lib pura         → AppError com code do registry
```
