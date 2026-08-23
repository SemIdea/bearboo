# ADR-0020 — `DomainError` renomeado para `AppError`

> **Status:** Aceita
> **Data:** 2026-08-23
> **Decidido por:** SemIdea
> **Refina:** ADR-0017, ADR-0019 (naming; não muda comportamento)

## Contexto

O tipo `DomainError` (`src/shared/error/domainError.ts`) nasceu na ADR-0017 como o erro de domínio namespaced — lançado por funções `domain_*` quando uma regra de negócio é violada. O nome refletia essa origem.

Depois da ADR-0019 (feature 024), a realidade divergiu do nome. O tipo é lançado de **seis lugares que não são domínio**: os cinco guards do `createRouter.ts` (`session_expired`, `too_many_attempts`, `user_not_logged_in`, `user_not_verified`, `insufficient_role`) e a procedure `refreshSession` (`missing_token`). Todos são boundary, não regra de negócio. O tipo também deixou de carregar qualquer coisa além do `code` (ADR-0019): virou o **erro catalogado e recuperável da aplicação**, traduzido pelo middleware — não algo exclusivo do domínio.

O nome `DomainError` passou a mentir por generalização: promete "domínio" e entrega "erro catalogado da app, lançável em qualquer camada". Um leitor que encontra `throw new DomainError(...)` numa procedure estranha — corretamente, porque o nome sugere que aquilo é lugar errado. O atrito não estava no código (consistente com os 6 guards), estava no nome.

## Decisão

**Renomear o tipo `DomainError` → `AppError`.** Um nome neutro de camada, que diz "erro da aplicação com código registrado" sem prometer origem. Identificadores derivados acompanham:

| Antes | Depois |
| --- | --- |
| `DomainError` (classe) | `AppError` |
| `src/shared/error/domainError.ts` | `src/shared/error/appError.ts` |
| `findDomainError` | `findAppError` |
| `domainErrorToTRPCError` (fn + arquivo) | `appErrorToTRPCError` |
| `domainErrorTransport` (const + arquivo) | `appErrorTransport` |
| `withDomainErrors` (middleware) | `withAppErrors` |

**O que NÃO muda** — a fronteira entre o tipo e o conceito é o ponto inteiro:

- **`defineDomainErrors`** fica. Ela define catálogos **namespaced por domínio** (o primeiro parâmetro é `domain`); os códigos são domain-scoped (`auth.*`, `session.*`) e o folder `catalog/` embute essa organização. Aqui "domain" é correto — este identificador está exatamente no lugar que é domínio.
- **O conceito "erro de domínio"** (violação de regra de negócio) segue existindo, agora como uma **subcategoria** de `AppError`: os que nascem no domínio. A regra dura 15 ("Domain ≠ Transport") não muda — ela é sobre a camada, não sobre o tipo.
- **`domainCode`** (campo do `errorFormatter` lido pelo client via `sessionRefreshLink`) fica — é contrato de wire, e o código É domain-namespaced.
- **`DomainInput` / `createDomain`** ficam — são a infra das funções de domínio, não o tipo de erro.

Puramente naming: zero mudança de comportamento. Suíte 395/395 intacta, `tsc` verde, sem migração de dados.

## Alternativas consideradas

- **`RecoverableError`** — amarraria ao modelo bug-vs-recuperável (ADR-0018, regra 33, `classifyBoundaryError` retorna `kind: "recoverable"`). Rejeitada: alguns códigos (`session.session_create_error`, "Failed to create session") não soam "recuperável" a um leitor casual, e "recoverable" faz uma afirmação semântica sobre o modelo de erro em vez de descrever o que o tipo é.
- **`CodedError`** — descreve o mecanismo (carrega um código). Rejeitada: mais seco, não conecta à intenção.
- **Manter `DomainError`** — rejeitada: é a fonte do atrito. O tipo cresceu além da origem que o nome nomeia.
- **Jogar `TRPCError` direto do refreshSession** (evitar o rename tratando o caso como anomalia) — rejeitada antes de chegar aqui: viola a regra 33 (procedure não constrói `TRPCError`), re-acopla ao transporte e duplica o catálogo. O refreshSession não é anômalo — os 6 sites são consistentes; ou todos estão certos, ou o nome está errado pros 6. Este ADR escolhe a segunda.

## Consequência

**Fica fácil:** `throw new AppError(...)` lê natural em qualquer camada — domínio, guard, procedure. O nome deixa de sugerir que boundary-guards estão no lugar errado.

**Fica difícil / gotcha:** ADRs 0016-0019 e os resumos de `docs/learn/` continuam dizendo `DomainError` — são registro de época (a decisão foi tomada com aquele nome). Não foram reescritos (seria reescrever história); esta ADR é a ponte. Ao ler um ADR antigo, `DomainError` = o hoje-`AppError`.

## Referências

- Refina: ADR-0017 (ErrorRegistry), ADR-0019 (centralização + inversão de transporte).
- Feature: `docs/features/026-rename-domain-error/` (se materializada) / branch `feature/026-rename-domain-error`.
- Regra dura relacionada: 15 (Domain ≠ Transport — conceito, inalterado), 33 (bug vs. recuperável).
