# ADR-0018 — Metadata rico de erro (`retryable`/`level`) + convenção bug vs. recuperável

> **Status:** Aceita
> **Data:** 2026-08-22
> **Decidido por:** SemIdea
> **Estende:** ADR-0017 (não substitui)

## Contexto

ADR-0017 fechou a classificação Domain≠Transport: todo erro de domínio é um `DomainError` com `code` namespaced, que resolve `httpCode`/`message` sozinho e é traduzido pra `TRPCError` no boundary (regra 15). Mas o `DomainError` carrega só o mínimo pra virar resposta HTTP — não diz **se o erro é transiente/retryable** nem **quão severo é**. E o projeto não distinguia, em lugar nenhum central, um **erro recuperável esperado** (credencial errada, `not_found`) de um **bug** (null deref, falha inesperada): o `onError` do fetch adapter (`app/api/trpc/[trpc]/route.ts`) estava **comentado**, sem logging central; a distinção existia só implícita nos 25 `catch (DomainError) … else throw` das procedures.

Uma sessão de estudo de error models (10 resumos em `docs/learn/`) fundamentou duas melhorias, que o dono do projeto avaliou e escolheu conscientemente:

1. **Metadata rico** no erro-como-valor — a filosofia "error as a value" que o `DomainError` já encarna, completada com `retryable`/`level`.
2. A **distinção bug vs. erro recuperável** de Joe Duffy (*The Error Model*, `docs/learn/resumo-01`): bug e erro recuperável são categorias diferentes e merecem tratamento diferente (bug = falha alto/visível; recuperável = esperado, tratado).

## Decisão

**(1) Metadata aditivo no catálogo.** `ErrorEntry` (`src/shared/error/registry.ts`) ganha `retryable?: boolean` e `level?: ErrorLevel` (`type ErrorLevel = "fatal" | "error" | "warn" | "info"`). `DomainError` resolve e expõe `readonly retryable`/`readonly level` com defaults `retryable=false`/`level="warn"`. É **puramente aditivo** — os 52 códigos existentes seguem válidos sem tocar em nada; o preenchimento é forward-only/boy-scout. O tipo de retorno de `defineDomainErrors` passa a expor os campos opcionais (mantendo `httpCode`/`message` literais) pra o resolver lê-los sem cast.

**(2) Convenção bug vs. recuperável num choke point.** Um helper puro `classifyBoundaryError` (`src/shared/error/boundaryLog.ts`) separa **recuperável** (é `DomainError`, ou o embrulha como `.cause` do `TRPCError`) de **bug** (qualquer outro throw → `level="error"`). `logBoundaryError` roteia por `level` (`fatal`/`error` → `console.error` + stack pro bug; `warn` → `console.warn`; `info` → `console.info`). Ativado no `onError` do fetch adapter e alinhado em `src/server/caller.ts`. O `errorFormatter` **continua puro** (só shaping da resposta); o efeito colateral de log vive no `onError`, o hook desenhado pra isso.

**(3) Regra dura 33** formaliza a convenção com gatilho executável: todo procedure que constrói um `TRPCError` também ramifica em `instanceof DomainError` (distingue recuperável de bug — não faz wrap cego de um throw inesperado como erro de domínio).

## Alternativas consideradas

- **Migração pra `Result<T,E>` / return-error-as-value** — **rejeitada.** Foi a peça que o dono mais gostou no estudo, mas a análise (`docs/learn/resumo-04-railway-oriented-programming.html`) mostrou que não encaixa no formato do bearboo: call depth raso (domain → 1 procedure), 52 domains, e procedures que são **pipelines lineares** (ex. `register.ts` com 7 chamadas) onde `throw` + catch único no boundary já é ótimo e `Result` só adicionaria cerimônia (TS não tem operador `?` nem do-notation; tRPC/Prisma lançam exceções nativamente). O `throw`/`catch` do JS já é a *exception monad* (`docs/learn/resumo-05`), então a propagação automática já existe sem `Result`. A filosofia "error as a value" foi capturada pelo metadata (o `DomainError` como valor rico), não pelo mecanismo de retorno. ADR-0017 permanece válida.
- **Expor `retryable`/`level` ao cliente via `errorFormatter`** (junto do `domainCode`) — **adiada.** É ~1 linha, mas não há consumidor no frontend hoje (YAGNI; postura backend-first). Entra quando surgir consumidor.
- **Tornar `retryable`/`level` obrigatórios em `ErrorEntry`** — rejeitada: quebraria os 52 códigos de uma vez e forçaria decisão semântica em todos antes de shippar. Defaults deixam o preenchimento incremental.
- **Default `level="error"` pro recuperável** (proposta inicial do brief) — rejeitada no gate: erro esperado (ex. `not_found`) no nível `error` polui o log e esconde o bug real. Default `warn`; benignos declaram `info`; bug loga `error`.
- **Logging no `errorFormatter`** — rejeitada: o formatter deve ficar puro (shaping); `onError` é o hook de efeito colateral.

## Consequência

**Fica fácil:** classificar um erro é declarar dados no catálogo (`retryable: true`, `level: "info"`), sem tocar em código de resolução; bugs **se destacam** no log (`error` + stack) e não se disfarçam de erro de domínio; adicionar a distinção não custou reescrever os 25 boundaries (mora num helper).

**Fica difícil / gotcha:** (a) recuperável no nível `info` loga em **todo** request que o dispara — barulho tunável (ajustar `level` no catálogo), não silenciável globalmente por ora. (b) `retryable`/`level` são **advisory** — nada auto-retenta ainda; retry automático, `cause` tipado e **cadeia causal navegável / error tracer** (pilar 5-a do estudo) ficam pra **feature futura separada** (explicitamente fora de escopo desta ADR). (c) o metadata é server-side; o cliente ainda não vê `retryable`/`level`.

## Referências

- Estende: ADR-0017 (ErrorRegistry). Não substitui.
- Feature: `docs/features/023-error-metadata-classification/`.
- Estudo: `docs/learn/` (resumos 01 Duffy, 04 ROP, 05 Wadler, 09 Dapper — este último orienta o futuro tracer 5-a).
- Regra dura relacionada: `docs/afm.md § 3` regra 33; regra 15 (Domain≠Transport).
