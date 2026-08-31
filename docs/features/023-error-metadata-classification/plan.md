# Feature 023 — Plan

> **Spec:** [`./spec.md`](./spec.md)
> **Plan:** o como. Stack lida do `ach.md` — não reabre discussão de stack.

## 1. Approach (3 frases)

`ErrorEntry` (o objeto de catálogo) ganha `retryable?`/`level?` opcionais e o `DomainError` os resolve/expõe com defaults, de forma puramente aditiva. Um helper puro `classifyBoundaryError` separa recuperável (é/tem-causa `DomainError`) de bug (qualquer outro throw) e um `logBoundaryError` roteia por `level`; o `onError` do fetch adapter (hoje comentado) e o `caller.ts` passam a usá-los. A convenção vira regra dura 33 com gatilho executável, e a decisão é registrada na ADR-0018 (que reafirma a rejeição do `Result`).

## 2. Componentes afetados (do scan)

| Componente | Arquivo | Tipo | Mudança |
| --- | --- | --- | --- |
| Registry | `src/shared/error/registry.ts` | Lib (shared) | `ErrorLevel` type; `ErrorEntry` += `retryable?`/`level?` |
| DomainError | `src/shared/error/domainError.ts` | Lib (shared) | resolve/expõe `retryable`/`level` com defaults |
| Catálogos | `src/shared/error/{auth,comment,media,post,resetToken,session,user,verifyToken}.ts` | Lib (shared) | declara `retryable`/`level` onde difere do default |
| Boundary log | `src/shared/error/boundaryLog.ts` | Lib (shared) — **novo** | `classifyBoundaryError` (puro) + `logBoundaryError` |
| HTTP boundary | `src/app/api/trpc/[trpc]/route.ts` | Route handler | ativa `onError` → classifica + loga |
| In-process boundary | `src/server/caller.ts` | Adapter | alinha ao mesmo helper de log |
| Docs | `docs/adr/0018-*.md`, `docs/afm.md §3`, `docs/ach.md §3.2` | Doc | ADR + regra 33 + contrato |

## 3. Decisões (com alternativa rejeitada)

- **Metadata aditivo com defaults, não campos obrigatórios.** Alternativa rejeitada: tornar `retryable`/`level` obrigatórios em `ErrorEntry` — quebraria os 52 códigos de uma vez e forçaria decisão semântica em todos antes de shippar. Defaults (`retryable=false`, `level="warn"`) deixam o preenchimento forward-only/boy-scout.
- **Classificação num helper puro, logging separado.** Alternativa rejeitada: colocar o `instanceof` + `console` inline no `onError`. O helper puro é testável (regra 1) sem espionar `console`; o `onError` fica fino.
- **Boundary de logging = `onError`, não `errorFormatter`.** O `errorFormatter` fica puro (só shaping da resposta); efeito colateral de log vive no `onError`, que é o hook desenhado pra isso.
- **`Result<T,E>` rejeitado** (registrado na ADR-0018): call depth raso (domain→1 procedure), 52 domains, pipelines lineares onde `throw`+catch já é ótimo; ceremônia sem `?`-operator no TS. Análise em `docs/learn/resumo-04`.

## 4. Contratos de boundary

- `classifyBoundaryError(error: unknown) → { kind: "recoverable" | "bug"; level: ErrorLevel; retryable: boolean; code: string | null }`. Recuperável quando `error instanceof DomainError` OU `error.cause instanceof DomainError` (o boundary embrulha o DomainError como `cause` do TRPCError). Bug caso contrário → `level: "error"`.
- `DomainError` API pública ganha `readonly retryable: boolean` e `readonly level: ErrorLevel` (aditivo; nada removido).

## 5. Validação binária contra `afm.md § 3`

- Regra 1 (teste pra código novo): `boundaryLog.ts` e os campos novos do `DomainError` têm teste (RED antes de GREEN).
- Regra 5/6 (1 responsabilidade, ≤300 linhas): `boundaryLog.ts` novo e pequeno; nenhum arquivo tocado cresce perto de 300.
- Regra 15 (Domain≠Transport): preservada — nada muda na tradução; só adiciona metadata e logging no boundary.
- Regra 11 (mudança arquitetural pára e pergunta): satisfeita — decisão aprovada no gate.
- Regra 33 (nova): criada nesta feature com gatilho executável.

## 6. Complexity / risco

- Baixo. Tudo aditivo; defaults garantem não-regressão. Maior risco é log ruidoso — mitigado pelo default `warn` (não `error`) e pela decisão de gate.
