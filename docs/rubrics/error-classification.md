# Rubrica — classificação de erros (Domain ≠ Procedure ≠ Infra)

## Os 3 níveis

### Domain error — regra de negócio violada

**Quem joga:** funções `domain_*` (regra de negócio pura).

**Como representa:**

```ts
// Opção A: Result<T, E> (preferido pra controle de fluxo limpo)
type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; code: E };

const result = await domain_createUserAuth({ ctx, input });
if (!result.ok) {
  switch (result.code) {
    case "EMAIL_TAKEN": ...
    case "WEAK_PASSWORD": ...
  }
}

// Opção B: throw DomainError quando o caller raramente trata cada caso
class DomainError<C extends string> extends Error {
  constructor(public readonly code: C, message?: string) { super(message); }
}
throw new DomainError("MAGIC_LINK_INVALID");
```

**Code é literal `as const`** — exhaustive switch garante cobertura no caller. Sem code literal, refactor quebra silenciosamente.

### Procedure error — boundary de transport

**Quem joga:** procedures (handlers tRPC / route handlers / controllers).

**Como representa:** `TRPCError` (ou equivalente do framework — `HTTPException` no FastAPI, `BadRequestException` no Nest).

**Boundary é unidirecional:** procedure CONHECE Domain, mapeia code → status HTTP. Domain NÃO importa `TRPCError` (regra dura 15).

```ts
// procedure faz a tradução
const result = await domain_createUserAuth({ ctx, input });
if (!result.ok) {
  if (result.code === "EMAIL_TAKEN") {
    throw new TRPCError({ code: "CONFLICT", message: "Email já cadastrado" });
  }
  if (result.code === "WEAK_PASSWORD") {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Senha fraca" });
  }
}
```

### Infra error — falha de recurso externo

**Quem joga:** ninguém intencionalmente — sobe de cliente HTTP, ORM, fila.

**Como propaga:**
- Em **Task-like** (Trigger.dev, BullMQ): deixa subir. Retry policy do orquestrador resolve.
- Em **Procedure-like**: cathc no boundary final, log, mapeia pra `INTERNAL_SERVER_ERROR`. Não vaza stack pro client.

## Anti-patterns

- ❌ **Domain importando `TRPCError`.** Domain vira acoplado ao transport. Regra dura 15: `grep -rn "TRPCError" src/server/modules/**/domain/` retorna 0.
- ❌ **`throw new Error("string genérica")` em domain.** Sem code literal, caller não consegue tratar specificamente. Use `DomainError({ code: "..." as const })`.
- ❌ **Try/catch genérico em todo await.** Erros tipados > catch genérico. Catch só se você vai tratar (mapear, logar specificamente, fazer fallback consciente). Senão deixa subir.
- ❌ **Procedure que retorna `{ error: "..." }` em vez de jogar.** Quebra contrato do framework, força client a checar `data.error` em vez do mecanismo padrão.
- ❌ **Misturar Domain error e Infra error no mesmo switch.** Domain code é fechado (sei todos os casos); Infra é aberto (rede pode falhar de N formas). Trate separado.

## Decision flow

```
Onde estou?
├── domain function → Result<T, E> com code literal as const
├── procedure        → mapeia code Domain → TRPCError; deixa Infra subir
├── task             → leva idempotência; deixa Infra subir (retry resolve)
└── lib pura         → Result<T, E> ou DomainError com code discriminante
```
