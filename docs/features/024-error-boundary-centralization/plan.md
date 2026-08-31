# Feature 024 — Plan

> **Spec:** [`./spec.md`](./spec.md) · **Tasks:** [`./tasks.md`](./tasks.md)
> Stack lida de `docs/ach.md` — não reabre discussão de stack.

## 1. Approach (3 frases)

Um middleware tRPC (`withDomainErrors`) montado num `baseProcedure` no topo da cadeia inspeciona o `MiddlewareResult`, e quando o erro embrulha um `DomainError` relança um `TRPCError` com o código de transporte resolvido de uma tabela — colapsando as 32 cópias da tradução em um ponto. Em seguida `httpCode` sai do `DomainError` e dos 8 catálogos e passa a viver só nessa tabela, em `src/server/`, deixando `src/shared/error/` sem nenhuma dependência de `@trpc/*`. O `DomainError` fica reduzido a identidade (`code`), e quem precisa de política (`message`/`retryable`/`level`) resolve pelo registry, que ganha a função de busca que o nome dele já prometia.

## 2. Componentes afetados (do scan)

| Componente | Path | Tipo | Ação |
| --- | --- | --- | --- |
| Middleware de tradução | `src/server/http/withDomainErrors.ts` | Adapter-like | **novo** |
| Tabela de transporte | `src/server/http/domainErrorTransport.ts` | Adapter-like | **novo** (29 entradas) |
| Router raiz | `src/server/createRouter.ts` | Boundary | `baseProcedure` + 6 guards simplificados |
| Registry | `src/shared/error/registry.ts` | Lib | `resolveErrorEntry` + `ErrorEntry` sem `httpCode` |
| `DomainError` | `src/shared/error/domainError.ts` | Lib | reduz a `code` |
| Catálogos | `src/shared/error/{auth,comment,media,post,resetToken,session,user,verifyToken}.ts` | Lib | −`httpCode` (29 linhas) |
| Classificação | `src/shared/error/boundaryLog.ts` | Lib | resolve via registry; exporta `findDomainError` |
| Contexto | `src/server/createContext.ts` | Boundary | decide por código de domínio |
| Procedures | `src/server/features/*/procedures/*.ts` (26) | Procedure | −try/catch |
| Procedure fora da cadeia | `src/server/features/auth/procedures/refreshSession.ts` | Procedure | `t.procedure` → `baseProcedure` |

## 3. Decisões (com alternativa rejeitada)

**D1 — Middleware, não `errorFormatter`.** A ADR-0016 escolheu o `errorFormatter`. Rejeitado agora com evidência: o `errorFormatter` só participa do shaping da resposta HTTP e **não roda no `createCaller`** (`src/server/caller.ts`), usado pelos RSCs. Centralizar ali deixaria o caminho in-process recebendo `INTERNAL_SERVER_ERROR`. O middleware roda dentro da chamada da procedure, então cobre os dois caminhos.

**D2 — Inspecionar `result.ok`, não `try/catch`.** Em tRPC v11 `callRecursive` captura o throw do resolver e retorna `{ ok: false, error: getTRPCErrorFromUnknown(cause) }` (`node_modules/@trpc/server/dist/initTRPC-*.mjs`). Um `try { await next() } catch` no middleware não pegaria nada. O erro chega já embrulhado, com o `DomainError` em `.cause` — o middleware **remapeia**.

**D3 — `Record<ErrorCode, TRPC_ERROR_CODE_KEY>`, não um segundo registry.** Um registry gerencia registro em runtime e unicidade; o mapa de transporte não tem nenhum dos dois — é função estática total. O `Record` dá exaustividade em compile-time de graça, que é exatamente o teste que a ADR-0016 § Consequência pediu (*"vale considerar um teste que force cobertura exaustiva… quebra em compile-time"*). Rejeitado: segundo `defineDomainErrors` (cerimônia sem ganho).

**D4 — Só `httpCode` migra.** `message` (texto agnóstico), `retryable` (propriedade da falha) e `level` (observabilidade) continuam no catálogo de domínio. Rejeitado: mover os quatro — transformaria o catálogo num shell vazio e espalharia política sem motivo.

**D5 — Teste de paridade temporário.** Enquanto tabela e catálogo coexistem (T003→T012), um teste afirma `transport[code] === Errors[code].httpCode` para todos os 29. Ele é o que torna a transcrição manual segura, e é **deletado** junto do `httpCode`. Rejeitado: transcrever sem rede (erro silencioso de status).

**D6 — `super(code)`.** `DomainError extends Error` precisa de um `message`. Usar o `code` mantém a stack legível e força a mensagem humana a ser resolvida no boundary — onde i18n vai morar. O que chega ao cliente não muda: o middleware injeta `entry.message`.

## 4. Contratos de boundary

- **Entrada do middleware:** `MiddlewareResult` do tRPC. Se `ok`, repassa intacto.
- **Saída:** `TRPCError { code: transport[domain.code], message: entry.message, cause: domainError }`. Manter `cause` é obrigatório — `errorFormatter` (`domainCode`), `logBoundaryError` e `caller.ts` (redirect de sessão) dependem dele.
- **Não-`DomainError`:** repassa o result sem tocar → continua `INTERNAL_SERVER_ERROR` e é logado como bug (ADR-0018).
- **Ordem:** `t.procedure.use(withDomainErrors)` primeiro; `.use(A).use(B)` faz A envolver B, então o middleware cobre guards **e** resolver.
- **`src/shared/` → `src/server/`:** proibido. A seta é sempre `server → shared`.

## 5. Validação binária contra `afm.md § 3`

| Regra | Como esta feature satisfaz |
| --- | --- |
| 1 — teste pra código novo | Middleware, tabela, lookup, `createContext` e paridade têm teste próprio (T002, T004, T006, T013) |
| 2 — zero `any`/`unknown` | `unknown` só na assinatura de `findDomainError`/`classifyBoundaryError`, que são fronteira por definição (já era assim) |
| 4 — type-check | `tsc --noEmit` a cada task |
| 5 — uma responsabilidade | Middleware e tabela em arquivos separados; não engordam `createRouter.ts` |
| 6 — ≤300 linhas | `createRouter.ts` **encolhe** (137 → ~110); arquivos novos < 60 |
| 11 — mudança arquitetural | Aprovada no gate de 2026-08-22 |
| 15 — Domain ≠ Transport | **Reforçada estruturalmente**: `rg -n "@trpc" src/shared/` passa a retornar 0 |
| 16 — validação no boundary | Não tocada |
| 32 — sem commit em develop | `feature/024-error-boundary-centralization` |
| 33 — bug vs. recuperável | **Gatilho reescrito** (ficaria vacuous) — T015 |

## 6. Complexity / risco

| Risco | Mitigação |
| --- | --- |
| Erro de transcrição nas 29 entradas muda um status | Teste de paridade D5 roda enquanto as duas fontes coexistem |
| Remover `httpCode` do `ErrorEntry` antes dos catálogos quebra o build em massa | Ordem fixa: tabela → middleware → procedures → só então enxugar catálogo/tipo |
| Alguma procedure dependia da tradução local pra um caso especial | Os 20 arquivos de teste de procedure que afirmam código de erro são a rede; devem passar sem edição |
| `createContext` estreitado deixa de limpar cookie num caso real | Evidência de scan: o domain chamado lança só `session.access_token_invalid`; teste de regressão em T013 |
| Regra 33 vacuous passa despercebida | T015 é task explícita, não boy-scout |

---

*Plan NÃO contém: código final. Isso vai nas tasks.*
