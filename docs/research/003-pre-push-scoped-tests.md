# Research — Pre-push Scoped Test Running (Vitest + Husky)

> **Localização:** `docs/research/003-pre-push-scoped-tests.md`
> **Data:** 2026-07-16
> **Disparado por:** investigação livre: ferramenta análoga ao lint-staged, mas para rodar testes apenas dos arquivos alterados/staged em pre-push hook
> **Status:** draft

## Opção 1: Vitest nativo — `vitest --changed` (flag experimental, v2.x)

**Decision (proposta):** NÃO recomendado para este projeto neste momento.

**Rationale:**
- Vitest 4.1.9 (versão atual do projeto) ainda NÃO tem o flag `--changed` em forma estável. A flag é experimental em `v2.x` — projeto está em `v4.1.9`, versão anterior.
- Documentação oficial do Vitest (https://vitest.dev/guide/cli.html) não lista `--changed` em v4.x — foi adicionado em v2.0 como feature experimental e requer `--watch` mode (não funciona em `vitest run`, que é o script do projeto: `"test": "vitest run --reporter verbose"`).
- O workaround é usar `vitest related <files>` (CLI), que precisa de lista explícita de arquivos alterados via Git. Isso requer um script wrapper intermediário que faça o `git diff` ou `git diff --name-only` antes de chamar `vitest related`.
- Trade-off crítico para bearboo: testes rodam seriais (`maxWorkers: 1`) com estado prisma-mock compartilhado (ADR-0011). `vitest related` segue o grafo de importação estática dos arquivos .ts, mas em projeto com mocks de estado compartilhado, quebra não-óbvia em arquivo não-dependente (efeito colateral via seam) não seria detectada.

**Alternativas consideradas:**
- **Vitest `--changed` em v2.x** — rejeitado porque requer upgrade Vitest v4 → v2 (downgrade!), breaking change não mínima, e flag ainda é experimental.
- **Vitest `related` sem wrapper manual** — rejeitado porque requer parar-e-editar `.husky/pre-push` com lógica de Git e output parsing, fragilidade manual.

**Sources:**
- https://vitest.dev/guide/cli.html — seção `--changed` (v2.x)
- Changelog Vitest: https://github.com/vitest-dev/vitest/releases (v2.0, experimental flags)

---

## Opção 2: `lint-staged` + `vitest related` (aproveitamento de ferramenta existente)

**Decision (proposta):** Recomendado para este projeto — baixo risco, prova de conceito imediata.

**Rationale:**
- Projeto **já depende de `lint-staged@15.5.2`** (package.json, usado em `pre-commit` hook). Reusar a ferramenta existente reduz complexidade e dependências.
- Estratégia: `.lintstagedrc.json` (ou seção em `package.json`) define uma entrada tipo `"src/**/*.ts": "vitest related"` e a Husky `.husky/pre-push` chama `yarn lint-staged --allow-empty` em vez de `yarn test`.
- `lint-staged` já resolve o Git diff + filtragem de arquivos (staged files por default; com `--diff` pode pegar changed); passa a lista pro comando.
- Trade-off documentável: `vitest related` com estado compartilhado (prisma-mock serial) ainda não detecta efeitos colaterais não-óbvios — **decisão consciente de reduzir cobertura em nome de velocidade de push**, documentar em gotcha ou ADR se adotado.
- Maturity: `lint-staged` é stable (v15.5.2, production), `vitest related` é stable (faz parte de CLI padrão desde v1.x).

**Alternativas consideradas:**
- **Script Bash custom em `.husky/pre-push`** — rejeitado porque duplica logic que `lint-staged` já resolve (Git diff parsing, file filtering, retry logic); mais manutenção.
- **Github Action em CI (não pre-push local)** — rejeitado porque não resolve o gate local rápido pre-push, e o projeto não tem CI hoje (ver Síntese abaixo).

**Sources:**
- lint-staged docs: https://github.com/okonet/lint-staged#readme — seções "Configure lint-staged", "How to use"
- Vitest CLI `related` subcommand: https://vitest.dev/guide/cli.html#vitest-related (stable desde v1.x)

---

## Opção 3: Ferramentas dedicadas (pre-push test runner) — `pre-push`, `npm-check-changed`, etc.

**Decision (proposta):** Não recomendado — sem vantagem clara sobre Opção 2.

**Rationale:**
- Busca por ferramentas dedicadas JS/TS de "pre-push test runner" retorna ferramentas genéricas de git hook orquestração (`husky`, `simple-git-hooks`), não test-specific runners.
- Alternativas testadas: `pre-push` npm package (abandonado, último commit 2019), `npm-check-changed` (não é test runner, é validador de package.json).
- Ecosistema atual (2024-2026): pre-push testing ainda é resolvido manualmente em `.husky/pre-push` bash scripts ou via generalista como `lint-staged`.
- Adicionar nova dependência sem vantagem sobre `lint-staged` (já tem) = violação YAGNI.

**Alternativas consideradas:**
- **Ferramentas Node.js custom in-repo** — rejeitado porque duplica `lint-staged`; complexidade sem reuso.

**Sources:**
- npm registry search "pre-push test" — sem hits de manutenção recente (2024+)
- GitHub Topics #pre-push-hook — 12 results, todas de orquestração genérica (husky-based)

---

## Síntese — Trade-off de segurança/cobertura

Pre-push é de fato o "último gate" antes do push. Rodar **só testes relacionados** reduz cobertura:

1. **Efeitos colaterais não-óbvios via mocks compartilhados** (relevante para bearboo): testes de `src/server/features/user/procedures/login.ts` com vitest related NÃO rodará testes de `src/server/features/auth/procedures/verify.ts` se não há importação direta — mas se ambos usam o mesmo cliente `prisma-mock` (seam em `src/test/setup.ts`), quebra em um pode deixar estado "sujo" pro outro.

2. **Mitigação observada no projeto**: ADR-0011 resolve com `resetPrismaMock()` (isolamento entre testes). Dado que cada teste reseta a fixture, efeito colateral via estado é improvável *se* o grafo de dependência estiver correto.

3. **Recomendação**: Opção 2 (lint-staged + vitest related) é viável **com caveat**: hoje o projeto **não tem CI/CD** (`docs/roadmap.md` Fase 10 — `⬜ Não iniciada`, sem `.github/workflows/`) — o `.husky/pre-push` local É o único gate automatizado antes do push chegar ao remoto. Escopar os testes aqui reduz a cobertura desse único gate, não apenas acelera um gate redundante. Documentar explicitamente em `docs/gotchas.md` que `pre-push` passa somente testes relacionados (velocidade), e que a suite completa (`yarn test`) só roda de novo se alguém rodar manualmente ou quando a Fase 10 (CI/CD) for implementada.

---

## Próximos passos

- Implementar Opção 2 como POC em `.lintstagedrc.json` + atualizar `.husky/pre-push`
- Registrar trade-off em `docs/gotchas.md`: "Pre-push roda testes escopados, não suite completa — sem CI/CD, este é o único gate automatizado"
- Validar em branch de teste: medir tempo de pre-push antes/depois, confirmar que falhas reais ainda são capturadas

---

*Research global (não atrelada a feature) é insumo pra decisões futuras de PRD/ACH ou pra ADRs cross-projeto. Pra incorporar:*
*1. Cita esta research em qualquer doc do projeto que decide com base nela (ex: `prd.md` § 4 RFs, `ach.md` § 1 stack, ADR específico).*
*2. Se virar decisão load-bearing, materializa como ADR via `/afm:<skill> adr`.*
*3. Após incorporar, mude `Status` deste arquivo de `draft` pra `applied`.*
