# Feature 024 — Centralização do erro no boundary + inversão da dependência de transporte

> **Spec:** o quê e o porquê. Sem decisão de tecnologia.
> **US relacionada(s):** US-017 (Dev resolve erro de domínio sem código duplicado por procedure) — **fecha o que ficou aberto**.
> **Status:** done
> **Data de abertura:** 2026-08-22

## 1. Problema (do PRD/UST)

A US-017 pede, na própria story, *"escrever/ler qualquer procedure sem precisar de switch/if-chain repetido traduzindo `DomainError` em `TRPCError`"*. Ela está marcada `done` — mas a duplicação continua no código. O bloco

```ts
} catch (error) {
    if (error instanceof DomainError) {
        throw new TRPCError({ code: error.httpCode, message: error.message, cause: error });
    }
    throw error;
}
```

aparece em **26 das 45 procedures** e mais **6 vezes** nos guards do `createRouter.ts` — 32 cópias do mesmo invariante. A ADR-0016 já tinha **decidido** centralizar esse mapeamento e nunca foi implementada; a ADR-0017 a substituiu e deixou a centralização explicitamente pendente (*"candidato natural a virar o `errorFormatter` do ADR-0016, agora trivial"*). Esta feature cobra essa dívida.

O problema não é só volume. As 19 procedures **sem** o bloco deixam o `DomainError` escapar, e o tRPC embrulha qualquer throw não-`TRPCError` em `INTERNAL_SERVER_ERROR` (`getTRPCErrorFromUnknown`) — ou seja, o status HTTP correto depende de alguém lembrar de escrever o bloco. Hoje isso não produz bug ativo (nenhum dos 19 domains alcançados lança `DomainError`), mas é uma correção mantida à mão: o primeiro `throw new DomainError` adicionado a um desses domains vira 500 silencioso.

Em paralelo, o `DomainError` carrega `httpCode` (`TRPC_ERROR_CODE_KEY`), e `src/shared/error/registry.ts` importa esse tipo direto de `@trpc/server`. O domínio passou a **carregar transporte**, o que já produziu acoplamento real: `src/server/createContext.ts:66` decide **limpar os cookies de sessão** inspecionando `error.httpCode === "UNAUTHORIZED"` — condição que 5 códigos distintos satisfazem hoje e qualquer código futuro mapeado pra `UNAUTHORIZED` passará a satisfazer sem que ninguém perceba.

## 2. Critério de sucesso observável

- [ ] Nenhuma procedure em `src/server/features/*/procedures/*.ts` constrói `TRPCError` pra traduzir erro de domínio — a tradução acontece em **um** ponto (`rg -l "instanceof DomainError" src/server/features/*/procedures/*.ts` retorna vazio).
- [ ] O status/código de transporte devolvido por cada procedure é **idêntico** ao de hoje para os erros já cobertos, e passa a ser correto (não mais 500) para as 19 procedures que hoje não traduzem.
- [ ] `src/shared/error/**` não importa nada de `@trpc/*` (`rg -n "@trpc" src/shared/` retorna 0).
- [ ] `DomainError` expõe apenas `code` (+ `message` herdado de `Error`); `httpCode`, `retryable` e `level` deixam de ser campos da instância e passam a ser resolvidos pelo consumidor via registry.
- [ ] O mapeamento `ErrorCode → TRPC_ERROR_CODE_KEY` é **total e checado em compile-time**: adicionar um código de erro novo sem mapeá-lo quebra `tsc --noEmit`, não vira 500 em runtime.
- [ ] `createContext` decide limpar cookies por **código de domínio explícito**, não por código de transporte.
- [ ] A regra dura 33 volta a ter gatilho que verifica algo (hoje ela ficaria vacuous com zero `TRPCError` nas procedures).

## 3. Cenários (Gherkin, fecha US-017)

```gherkin
Scenario: Procedure sem try/catch devolve o código de transporte correto
  Given uma procedure cujo domain lança new DomainError("post.not_found")
  And a procedure não tem nenhum bloco try/catch de tradução
  When a procedure é chamada
  Then o cliente recebe NOT_FOUND, não INTERNAL_SERVER_ERROR
  And a mensagem é a mensagem declarada no catálogo para esse código
```

```gherkin
Scenario: Throw inesperado continua sendo tratado como bug
  Given uma procedure cujo domain sofre um throw que não é DomainError
  When a procedure é chamada
  Then o cliente recebe INTERNAL_SERVER_ERROR
  And o boundary loga como bug, com stack, sem dressá-lo de erro de domínio
```

```gherkin
Scenario: Código de erro novo sem mapeamento de transporte quebra o build
  Given um código adicionado a um catálogo de domínio
  And nenhuma entrada correspondente na tabela de transporte
  When o projeto roda tsc --noEmit
  Then o build falha, porque a tabela é um Record total sobre ErrorCode
```

```gherkin
Scenario: O domínio não alcança o vocabulário de transporte
  Given qualquer arquivo sob src/shared/error/
  When se busca por importações de @trpc/*
  Then não há nenhuma — httpCode não é mais campo do catálogo nem do DomainError
```

```gherkin
Scenario: Limpeza de cookie decide por código de domínio
  Given um access token inválido, que faz o domain lançar session.access_token_invalid
  When createContext resolve o contexto
  Then os cookies de sessão são limpos
  And um erro de domínio diferente que também mapearia pra UNAUTHORIZED não limpa cookies
```

## 4. Out of scope

- **Expor `retryable`/`level` ao cliente via `errorFormatter`** — segue adiado (decisão de gate 2026-08-22, mantém ADR-0018 § Alternativas). Continua sem consumidor no front; é ~1 linha quando surgir.
- **Migração pra `Result<T,E>`** — rejeitada em ADR-0017/0018, permanece rejeitada. Esta feature não reabre.
- **`cause` tipado / cadeia causal / error tracer (pilar 5-a)** — feature futura separada, igual ADR-0018 já registrou.
- **Segunda projeção de transporte** (job runner, CLI, webhook) — a feature deixa a estrutura pronta pra isso (uma tabela por consumidor), mas não cria nenhuma além da tRPC.
- **Reescrever `docs/rubrics/error-classification.md`** além do necessário pra tirar a contradição com a ADR vigente — a rubrica ainda apresenta `Result<T,E>` como "Opção A (preferido)", superada pela 0017/0018.

## 5. Assumptions / Open questions

- **Middleware, não `errorFormatter`.** A ADR-0016 escolheu o `errorFormatter` como ponto de centralização. Discovery mostrou que ele não roda no `createCaller` (`src/server/caller.ts`), o caminho in-process dos RSCs — centralizar ali consertaria o HTTP e deixaria o caminho in-process errado. Resolvido por scan, vira conteúdo de ADR.
- **`next()` do tRPC não lança.** `callRecursive` captura o throw do resolver e devolve `{ ok: false, error }` já embrulhado por `getTRPCErrorFromUnknown`. O middleware inspeciona `result.ok` e **remapeia**; não é um try/catch.
- **`refreshSession` usa `t.procedure` de propósito** — precisa escapar do guard de sessão expirada. Por isso o middleware vive num `baseProcedure` (`t.procedure.use(...)`) do qual `publicProcedure` deriva, e não no `publicProcedure`.
- **`DomainError.message`** passa a ser o próprio `code` (`super(code)`); a mensagem humana é resolvida no boundary a partir do registry. O que chega ao cliente não muda, porque o middleware substitui pela mensagem do catálogo.
- **Estreitamento em `createContext`**: `domain_readUserAndSessionByAccessToken` lança um único código (`session.access_token_invalid`, em ambos os pontos de throw), então trocar `httpCode === "UNAUTHORIZED"` por esse código preserva comportamento e é estritamente mais restrito.
- As 29 entradas da tabela de transporte são transcritas do catálogo atual à mão — risco de erro de transcrição coberto por teste de paridade temporário (ver `plan.md` § 3).

## 6. Dependências

- **ADR-0016** (centralização decidida, nunca implementada) — esta feature a executa e a substitui formalmente.
- **ADR-0017** (ErrorRegistry) e **ADR-0018** (metadata + convenção bug/recuperável) — base direta; a nova ADR estende ambas.
- US-017 (`docs/ust.md`), RF-14 (`docs/roadmap.md` Fase 9).
- Regras duras: 15 (Domain ≠ Transport), 33 (bug vs. recuperável — **gatilho precisa ser reescrito**), 11 (mudança arquitetural — aprovada no gate 2026-08-22), 1 (teste), 5 (uma responsabilidade), 6 (≤300 linhas).

## 7. Clarifications

### Session 2026-08-22 (gate do `/afm:deliver`)

- Q: expor `retryable` ao cliente nesta feature, revertendo o adiamento da ADR-0018? → A: **não** — mantém adiado, sem consumidor real no front.
- Q: destino dos 9 digests do `/learn` não commitados? → A: PR docs-only próprio primeiro (PR #213), pra manter o diff da 024 revisável.
- Resolvido por discovery (não perguntado): ponto de centralização (middleware vs. `errorFormatter`), conjunto de códigos que limpa cookie, e o motivo de `refreshSession` estar fora da cadeia do `publicProcedure`.

---

*Spec NÃO contém: decisão de stack, nomes de função, ordem de tasks. Isso vai pro `plan.md`.*
