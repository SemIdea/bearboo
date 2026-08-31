# Feature 022 — ErrorRegistry: código de domínio namespaced sem switch na procedure

> **Spec:** o quê e o porquê. Sem decisão de tecnologia.
> **US relacionada(s):** US-017 (Dev resolve erro de domínio sem código duplicado por procedure)
> **Status:** done
> **Data de abertura:** 2026-07-26

## 1. Problema (do PRD/UST)

Como dev mantendo o backend (RF-14, `docs/roadmap.md` Fase 9), a classificação de erro Domain/Procedure/Infra já documentada em `docs/rubrics/error-classification.md` está só parcialmente implementada: dos ~42 procedures do projeto, apenas 1 (`src/server/features/media/procedures/delete.ts`) faz o catch-and-map descrito na rubrica, via if/switch manual local — os outros repassam o que o domain lançou direto ou não tratam erro de domínio nenhum. Não existe hoje nenhum ponto único de resolução de erro, e o `DomainError`/`<Feature>ErrorCode` atual não carrega o `httpCode` — cada eventual mapeamento reinventaria o mesmo if/switch. `docs/research/004-error-handler-patterns.md` audita o estado atual em detalhe; `ADR-0017` formaliza o desenho de correção (substitui `ADR-0016`).

## 2. Critério de sucesso observável

- [ ] Nenhuma procedure precisa de switch/if-chain manual pra traduzir `DomainError` em `TRPCError` — só o bloco genérico (`if (error instanceof DomainError) throw new TRPCError({code: error.httpCode, message: error.message})`).
- [ ] Um `code` de erro inexistente no registry quebra `tsc --noEmit` (não é descoberto em runtime).
- [ ] Dois arquivos de domínio registrando o mesmo namespace (ex: dois arquivos chamando `defineDomainErrors("auth", ...)`) falham explicitamente ao carregar, em vez de um sobrescrever o outro silenciosamente.
- [ ] `TRPCError.message` carrega o texto humano final (`entry.message` do `DomainError`) em toda procedure, de forma consistente — os ~13 call-sites do frontend que hoje fazem `getErrorMessage(error.message)` passam a exibir `error.message` direto, sem re-lookup. Nenhuma regressão de mensagem exibida pro usuário, incluindo o bug pré-existente do `media/procedures/delete.ts` (hoje provavelmente cai no fallback genérico — passa a mostrar a mensagem certa, igual aos demais).
- [ ] `grep -rl "TRPCError" src/server/features/*/domain/*.ts` retorna vazio — regra dura 15 deixa de ser violação forward-only rastreada e vira invariante ativo (decisão do gate, ver § 7).

## 3. Cenários (Gherkin, herda da US-017)

```gherkin
Scenario: Domain lança erro namespaced e a procedure traduz sem switch
  Given uma função domain_* que detecta uma violação de regra de negócio
  When ela lança `new DomainError("auth.invalid_credentials")`
  Then a procedure captura o erro e relança um TRPCError com httpCode e message resolvidos automaticamente pelo DomainError, sem nenhum switch/if-chain local
  And o cliente recebe o TRPCError com o code HTTP-ish e a mensagem corretos
```

```gherkin
Scenario: Dois domínios não podem reivindicar o mesmo namespace
  Given dois arquivos de erro diferentes chamando defineDomainErrors com o mesmo nome de domínio
  When o segundo módulo é carregado
  Then o ErrorRegistry lança um erro de duplicação
  And nada de sobrescrita silenciosa de erros do primeiro domínio
```

```gherkin
Scenario: Frontend exibe o texto do TRPCError direto, sem re-lookup
  Given um erro de domínio disparado em qualquer procedure migrada
  When o tRPC client recebe o TRPCError e o componente chama onError
  Then o texto exibido ao usuário é error.message direto (já é o texto final vindo do ErrorRegistry)
  And nenhum call-site precisa mais chamar getErrorMessage(error.message) pra resolver a mensagem
```

## 4. Out of scope

- Catch de erro de Infra na borda, logging estruturado e correlation ID (itens 2-3 da recomendação em `docs/research/004-error-handler-patterns.md`) — fora desta rodada.
- `global-error.tsx` / robustecer `src/app/error.tsx` (item 5 da mesma recomendação) — fora desta rodada.
- Redesenhar a UI de exibição de erro (toast global, error boundary novo) — os ~13 call-sites existentes de `onError` só trocam `getErrorMessage(error.message)` por `error.message` direto, sem mudar como/onde o texto é mostrado.

## 5. Assumptions / Open questions

- `httpCode` usa o tipo `TRPC_ERROR_CODE_KEY`, importado direto de `@trpc/server` (export público confirmado em `node_modules/@trpc/server/dist/index.d.mts`) — sem necessidade de alias local.
- **Escopo expandido no gate do `/afm:deliver` (2026-07-27):** além do `media/domain/delete.ts` já migrado, os 23 arquivos `domain/*.ts` que hoje lançam `TRPCError` direto (regra dura 15) entram no escopo — migração coordenada, conforme `afm.md` § 3.1 já exigia ("não boy-scout arquivo-a-arquivo"). Inventário exato (23 arquivos, ~43 throw sites, 7 catálogos, 24 boundaries) levantado via discovery e detalhado em `plan.md` § 2.
- Premissa: o `errorFormatter` de `src/server/createRouter.ts:15-27` é o lugar certo pra também centralizar esse catch (em vez de cada procedure repetir o bloco de 4 linhas) — a decidir em plan.md se compensa nesta rodada ou fica pra depois.
- `TRPCError.message` carrega o texto humano (`entry.message`), confirmando o desenho original do ADR-0017 — ver § 7. Como consequência, `src/lib/error.ts` (`getErrorMessage`) e os ~13 call-sites que o chamam entram no escopo desta migração (deixam de re-buscar mensagem por code); não é mais "fora de escopo" como o rascunho inicial do spec assumia.

## 6. Dependências

- ADR-0017 (decisão de design já aceita — este spec não reabre o desenho, só organiza a execução).
- US-017 (`docs/ust.md`).
- Nenhuma feature em andamento bloqueia esta migração.

## 7. Clarifications

### Session 2026-07-26

- Q: qual o tipo do `httpCode` e de onde vem? → A: `TRPC_ERROR_CODE_KEY`, export público de `@trpc/server` — sem alias local necessário. *(inferido do discovery)*
- Q: quantos call-sites de `new DomainError(...)` (forma antiga) existem pra migrar? → A: só 2 arquivos (`media/domain/delete.ts` + seu teste), 4 ocorrências no total — não os ~42 procedures. *(inferido do discovery)*
- Q: `TRPCError.message` deve carregar o `code` namespaced ou o texto humano? Discovery achou 13 call-sites do frontend + 1 teste dedicado esperando `error.message` = code (contrato dominante hoje); só `media/procedures/delete.ts` manda texto humano, provável bug ao vivo. → A: texto humano — mantém o desenho original do ADR-0017. Os 13 call-sites + `getErrorMessage()` entram no escopo da migração (§ 2, § 4, § 5 atualizados).

### Session 2026-07-27 (gate do `/afm:deliver`)

- Q: sem migrar os ~18-24 arquivos `domain/*.ts` que violam a regra 15, o frontend precisa de um resolver dual-mode (decide por `httpCode` entre texto pronto e lookup legado) pra não regredir — confirma essa abordagem, ou prefere migrar os arquivos agora e fechar a regra 15 de vez? → A: migrar os 23 arquivos agora, fechando a regra 15. Elimina a necessidade do resolver dual-mode inteiramente — `getErrorMessage` simplifica pra exibição direta, sem lookup nenhum. `afm.md` § 3.1 já registrava que essa migração precisa ser coordenada (não boy-scout) — esta feature passa a ser exatamente essa migração coordenada.

---

*Spec NÃO contém: decisão de stack, nomes de função, schema de DB, ordem de tasks. Isso vai pro `plan.md`.*
*Marker `[NEEDS CLARIFICATION:]` ≠ `[A DEFINIR]`. Use o primeiro pra gap que bloqueia execução (resolvido via `/afm:<skill> clarify`); o segundo pra decisão que user adia conscientemente.*
