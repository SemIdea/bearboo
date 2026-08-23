# ADR-0019 — Tradução de erro centralizada em middleware + transporte fora do vocabulário de domínio

> **Status:** Aceita
> **Data:** 2026-08-22
> **Decidido por:** SemIdea
> **Substitui:** ADR-0016 · **Estende:** ADR-0017, ADR-0018

## Contexto

ADR-0016 (2026-07-26) **decidiu** centralizar o mapeamento `DomainError` → `TRPCError` num único ponto e nomeou o `errorFormatter` como esse ponto. Ela nunca foi implementada. ADR-0017 a substituiu com o `ErrorRegistry` e deixou a centralização explicitamente pendente — *"candidato natural a virar o `errorFormatter` do ADR-0016, agora trivial"* — apresentando como padrão o bloco de 4 linhas em cada procedure. ADR-0018 acrescentou metadata (`retryable`/`level`) e a convenção bug-vs-recuperável, sem tocar na duplicação.

O resultado, medido em 2026-08-22: o bloco de tradução aparece em **26 das 45 procedures** e mais **6 vezes** nos guards do `createRouter.ts` — 32 cópias. As outras 19 procedures não traduzem nada; como o tRPC embrulha qualquer throw não-`TRPCError` em `INTERNAL_SERVER_ERROR` (`getTRPCErrorFromUnknown`), o status correto dependia de alguém lembrar de escrever o bloco. Não havia bug ativo — nenhum dos 19 domains alcançados lança `DomainError` hoje — mas a correção era mantida à mão.

A US-017 pede na própria story *"sem switch/if-chain repetido traduzindo `DomainError` em `TRPCError`"* e estava marcada `done` com a duplicação intacta.

Em paralelo, `ErrorEntry` declarava `httpCode: TRPC_ERROR_CODE_KEY` e `src/shared/error/registry.ts` importava esse tipo de `@trpc/server`. O `DomainError` copiava o campo pra si, e o domínio passou a **carregar transporte** — com consequência concreta: `src/server/createContext.ts:66` decidia limpar os cookies de sessão lendo `error.httpCode === "UNAUTHORIZED"`, condição satisfeita por 5 códigos distintos e por qualquer código futuro mapeado pra `UNAUTHORIZED`.

## Decisão

**(1) A tradução vive num middleware montado num `baseProcedure`,** não em cada procedure e não no `errorFormatter`. `src/server/http/domainErrorToTRPCError.ts` guarda a função pura; `createRouter.ts` a monta como primeiro `.use()`, de modo que ela envolve guards e resolver. As 26 procedures e os 6 guards perdem o bloco; guards passam a `throw new DomainError(...)`.

**(2) `httpCode` sai do catálogo e vira `Record<ErrorCode, TRPC_ERROR_CODE_KEY>`** em `src/server/http/domainErrorTransport.ts`. `src/shared/error/**` deixa de importar `@trpc/*` (regra dura 35). A projeção de 29 códigos de domínio sobre 7 códigos de transporte é opinião de **um** consumidor, então mora com ele — um segundo consumidor (job runner, CLI) ganha a própria tabela em vez de adicionar coluna ao catálogo.

**(3) `DomainError` carrega só `code`.** `httpCode`/`message`/`retryable`/`level` eram cópias de uma função estática do código; consumidores resolvem via `resolveErrorEntry` (política) ou `domainErrorTransport` (transporte). `super(code)` torna o código a mensagem do `Error`; a mensagem humana é resolvida no boundary.

**(4) O registry ganha o lookup que faltava.** Até aqui os catálogos só eram escritos, nunca lidos — `defineDomainErrors` devolvia as entradas e o `DomainError` copiava os campos. `resolveErrorEntry` (em `src/shared/error/index.ts`) fecha isso e aplica os defaults uma vez.

**(5) `createContext` decide por código de domínio,** `session.access_token_invalid` — o único que aquele lookup lança — em vez de por código de transporte.

## Alternativas consideradas

- **`errorFormatter` como ponto de centralização (a escolha da ADR-0016)** — **rejeitada com evidência nova.** O `errorFormatter` participa só do shaping da resposta HTTP e **não roda no `createCaller`** (`src/server/caller.ts`), o caminho in-process usado pelos RSCs. Centralizar ali consertaria o HTTP e deixaria o caminho in-process recebendo `INTERNAL_SERVER_ERROR`. O middleware roda dentro da chamada da procedure e cobre os dois. (Vale registrar que o `errorFormatter` *conseguiria* trocar o status — `getHTTPStatusCode` lê `error.data.httpStatus` antes de derivar do code — então a rejeição é pelo alcance, não por impossibilidade.)
- **Helper explícito por call site (`runDomain(fn)`)** — rejeitada: exige que cada procedure lembre de chamar, mantendo o problema de disciplina manual. Já tinha sido rejeitada como escolha principal na ADR-0016; segue valendo.
- **Builder no domain (`createDomain` que traduz)** — rejeitada: violaria a regra 15 e acoplaria o domain ao tRPC, quebrando o `createCaller` e qualquer consumidor futuro não-tRPC. A intuição por trás dela (não tocar as procedures) é atendida pelo middleware, na camada certa.
- **Segundo registry pra transporte** — rejeitada: um registry gerencia registro em runtime e unicidade; o mapa de transporte não tem nenhum dos dois. `Record<ErrorCode, …>` dá exaustividade em compile-time — exatamente o teste que a ADR-0016 § Consequência pediu.
- **Map populado por `defineDomainErrors` pro lookup** — tentada e rejeitada durante a implementação: resolveria corretamente só depois de todos os catálogos terem sido importados, trocando garantia de compile-time por dependência de ordem de import. `Errors` é a tabela estática completa, então o lookup mora no agregado.
- **Mover `message`/`retryable`/`level` junto com `httpCode`** — rejeitada: são agnósticos de transporte (texto, propriedade da falha, observabilidade). Só o que é opinião de um transporte migra.
- **Expor `retryable` ao cliente** — segue **adiada** (gate 2026-08-22), mantendo a decisão da ADR-0018: sem consumidor no front.

## Consequência

**Fica fácil:** procedure nova ganha a tradução correta sem escrever nada — o comportamento vem do transporte, não da disciplina individual. Adicionar erro é uma entrada no catálogo do domínio, sem responder "qual código tRPC?" (pergunta que era feita ao autor errado: `NOT_FOUND` vs. `FORBIDDEN` é decisão de segurança do dono da fronteira). Um segundo transporte é uma tabela nova, zero arquivo de domínio tocado.

**Fica difícil / gotcha:** (a) a tradução agora é invisível no call site — quem lê uma procedure não vê onde o erro vira status; o `baseProcedure` é o lugar a olhar. (b) Procedure construída fora da cadeia (`t.procedure` direto) **não** recebe a tradução — foi exatamente o que aconteceu com `refreshSession`, pego pela suíte como um `TOO_MANY_REQUESTS` virando 500. (c) `DomainError.message` agora é o código, não o texto: qualquer caminho que escape sem passar pelo middleware mostra o código. (d) O gatilho da regra 33 precisou ser reescrito — com zero `TRPCError` nas procedures, o `comm` original passaria vacuously.

**Débito fechado:** a centralização decidida em ADR-0016 (2026-07-26) foi implementada em 2026-08-22, feature `024-error-boundary-centralization`.

## Referências

- Substitui: ADR-0016. Estende: ADR-0017 (ErrorRegistry), ADR-0018 (metadata + convenção).
- Feature: `docs/features/024-error-boundary-centralization/`.
- Estudo que fundamentou o desenho: `docs/learn/` resumos 11-19 (Mernik/Hudak/Fowler — não é DSL; Cockburn/Evans/Bernhardt/King — é adapter/anti-corruption layer; Metz/Dodds — extrair a tradução, não um framework).
- Regras duras relacionadas: 15 (Domain ≠ Transport), 33 (bug vs. recuperável — gatilho reescrito), **35** (`src/shared/**` não importa `@trpc/*`).
