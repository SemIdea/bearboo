# Feature 023 — Metadata rico de erro + convenção bug vs. recuperável

> **Spec:** o quê e o porquê. Sem decisão de tecnologia.
> **US relacionada(s):** US-017 (Dev resolve erro de domínio sem código duplicado por procedure) — estende.
> **Status:** in-progress
> **Data de abertura:** 2026-08-22

## 1. Problema (do PRD/UST)

A feature 022 (ADR-0017) fechou a classificação Domain≠Transport: todo erro de domínio é um `DomainError` com `code`/`httpCode`/`message`, traduzido no boundary (regra 15). Mas o `DomainError` carrega só o mínimo pra virar `TRPCError` — não diz **se o erro é retryable** nem **quão severo é** (`level`). E o projeto não distingue, no boundary, um **erro recuperável esperado** (credencial errada, not_found) de um **bug** (null deref, falha inesperada) — os dois viram log/resposta indistintos. O `onError` do fetch adapter (`app/api/trpc/[trpc]/route.ts`) está **comentado**: nenhum logging central hoje.

Estudo de error models (`docs/learn/`, 10 resumos) fundamentou duas melhorias que o usuário avaliou e escolheu conscientemente: (1) metadata rico no erro-como-valor; (2) a distinção bug-vs-recuperável do Duffy (`docs/learn/resumo-01-error-model-joe-duffy.html`). A migração pra `Result<T,E>` foi **avaliada e rejeitada** (mantém ADR-0017; análise em `docs/learn/resumo-04-railway-oriented-programming.html`).

## 2. Critério de sucesso observável

- [ ] `DomainError` expõe `retryable: boolean` e `level: ErrorLevel` (`"fatal" | "error" | "warn" | "info"`), resolvidos do catálogo com defaults `retryable=false`, `level="warn"` — sem quebrar nenhum dos 52 códigos existentes (`tsc --noEmit` verde, suíte verde).
- [ ] Um erro de catálogo pode declarar `retryable`/`level` e o `DomainError` reflete o valor declarado; onde não declara, cai no default.
- [ ] O boundary central (`onError`) distingue **recuperável** (é/tem-causa `DomainError` → loga no `level` do erro) de **bug** (qualquer outro throw → loga como `error`, alto, com stack). A classificação vive num helper puro testável, não espalhada nos 25 catches.
- [ ] Existe regra dura nova (33) com **gatilho executável** que garante que o boundary distingue bug de recuperável (não dressa bug como erro de domínio).
- [ ] ADR-0018 registra a decisão (metadata + convenção) e **reafirma a rejeição do `Result<T,E>`** como alternativa considerada.

## 3. Cenários (Gherkin, herda/estende US-017)

```gherkin
Scenario: DomainError resolve metadata do catálogo com defaults
  Given um código de erro que declara retryable=true e level="error" no catálogo
  When um DomainError é construído com esse code
  Then error.retryable é true e error.level é "error"
  And um código que não declara nada resolve retryable=false e level="warn"
```

```gherkin
Scenario: Boundary distingue erro recuperável de bug
  Given uma procedure que lança um DomainError (recuperável) e outra que sofre um throw inesperado (bug)
  When cada erro chega ao onError do boundary
  Then o recuperável é logado no seu próprio level (ex. warn) sem stack alarmante
  And o bug é logado como "error", alto, com o stack completo, sem se disfarçar de erro de domínio
```

## 4. Out of scope

- **`cause` tipado / cadeia causal / error tracer (pilar 5-a)** — feature futura separada. Esta rodada NÃO adiciona encadeamento de causa navegável.
- **Migração pra `Result<T,E>` / return-error-as-value** — REJEITADA (ADR-0017 permanece; call depth raso, 52 domains, pipelines lineares). ADR-0018 só registra a rejeição.
- **Expor `retryable`/`level` ao cliente via errorFormatter** — adiado (YAGNI: sem consumidor no front hoje; memória backend-first). É 1 linha quando surgir consumidor.
- **Logger estruturado (pino/winston) / correlation ID** — usa `console` por level; sem nova dependência.

## 5. Assumptions / Open questions

- `ErrorLevel = "fatal" | "error" | "warn" | "info"`; default do recuperável = `"warn"` (decisão de gate 2026-08-22: erro esperado no nível "error" polui o log). Bug loga `"error"`.
- O boundary central é o `onError` do fetch adapter (`route.ts`, hoje comentado) — resolvido por discovery, não o `errorFormatter` (que fica puro, só shaping).
- Os 25 procedures já têm o esqueleto da convenção (`if instanceof DomainError → traduz; else throw`); a feature materializa o logging e documenta a regra, não reescreve os 25.
- `caller.ts` (server-side in-process) é um boundary secundário — alinhado ao mesmo helper de classificação.

## 6. Dependências

- **Feature 022 / ADR-0017** (ErrorRegistry) — base direta. Branch empilhada em `feature/022-error-registry` (PR #207 ainda não mergeada em develop); rebaseia em develop quando a 022 mergear.
- US-017 (`docs/ust.md`), RF-14 (`docs/roadmap.md` Fase 9).

## 7. Clarifications

### Session 2026-08-22 (gate do `/afm:deliver`)

- Q: taxonomia de `level` e default do recuperável? → A: `fatal|error|warn|info`, recuperável default `"warn"`, bug `"error"` (motivo: erro esperado no nível error vira firehose e esconde bug real).
- Q: expor `retryable`/`level` ao cliente agora? → A: não — server-side only (YAGNI, sem consumidor; backend-first).

---

*Spec NÃO contém: decisão de stack, nomes de função, ordem de tasks. Isso vai pro `plan.md`.*
