# AFM — Agent Flow Methodology

> Playbook operacional do agente (humano ou LLM) neste projeto.
> Mistura **Extreme Programming** (Kent Beck) + **Pragmatic Programmer** (Hunt/Thomas) + práticas específicas do Bearboo.
>
> Esta é a **fonte canônica** de como executar tarefas aqui. Se `CLAUDE.md` e este doc divergirem, este doc vence.
>
> Adoção retroativa via `/afm:refactor` em 2026-06-30 (plugin `afm` v3.1.0-rc.6). Regras herdadas do código legado aplicam forward-only — ver § 3.1.

---

## 1. Princípios

### 1.1 Herdados de XP

- **TDD** — nenhum código novo sem teste que falha antes. Loop: red → green → refactor.
- **Refactor contínuo** — depois de verde, melhora o design imediatamente. Não acumular dívida.
- **Simple design (YAGNI/DRY/KISS)** — menor solução que resolve o problema atual; duplicação só após segundo caller (Rule of Three); inline beats abstract.
- **Integração contínua** — commits pequenos, merge rápido, testes rodam toda vez.
- **Pair via revisão** — toda mudança passa por revisão (humano ou LLM revisor) antes de ir pra branch principal.

### 1.2 Herdados de Pragmatic Programmer

- **DRY** (Don't Repeat Yourself) — cada pedaço de conhecimento existe em um único lugar.
- **Tracer Bullets** — pra entregar fim-a-fim rápido, começar pela casca que liga todas as camadas, depois engrossar. Melhor que big-bang.
- **Don't Live with Broken Windows** — erro/test flaky/lint warning conhecido vira tech debt. Ou consertar imediatamente ou abrir ticket nomeado.
- **Design by Contract** — funções públicas declaram pré-condições e pós-condições via tipos. Entrada inválida falha cedo.
- **Rubber Duck** — se não consegue explicar a mudança em 2 frases, não começa a implementar.
- **Prototipe pra aprender, descarte o protótipo** — código de exploração não vai pra branch principal.

### 1.3 Específicos deste projeto

- **Uma responsabilidade por arquivo.** Um arquivo faz **uma** coisa bem. Se o nome tem "e"/"And"/"Manager"/"Utils" vagos, o arquivo tem duas responsabilidades escondidas — parte. Um arquivo é uma unidade de raciocínio; ler ele inteiro deve caber em um diff mental.
- **Arquivo ≤ 300 linhas.** Limite rígido com exceções estritas (gerado, schema inteiro, fixture grande). Passou disso, divide.
- **Tipos explícitos nas fronteiras, inferência no resto.** Parâmetros e retornos de funções exportadas: tipos escritos. Variáveis locais, helper interno: deixa o TS inferir.
- **Zero `any` / `unknown` em helper próprio.** `unknown` só vale na fronteira de dados externos antes de validar com Zod e estreitar.
- **DRY após o terceiro caller** (Rule of Three). Dois pode ser coincidência; três é padrão. Nunca abstrai antes; nunca deixa duplicação viva depois do terceiro.
- **KISS vence YAGNI vence DRY.** Duplicação simples > abstração elegante com nota mental. Menos camadas, menos genéricos, menos opções de config.
- **Comentário é exceção.** Default = zero. Só quando lógica é genuinamente complexa (invariante escondida, workaround pra bug, escolha contraintuitiva). Antes de comentar: renomear, extrair, simplificar.
- **Doc é playbook que evolui por delta, não rewrite monolítico (ACE).** Atualização de `/docs/` é **append estruturado** na seção certa ou **update-in-place** de um item nomeado — nunca reescreve o doc inteiro.
- **Ingest é fan-out de cardinalidade, não append singular.** Ao redefinir um termo/conceito/contrato que aparece em vários docs, a atualização toca todas as páginas onde ele vive (`grep -rl "<termo>" docs/`), não só a óbvia.
- **Promover a doc durável passa pelo negative-filter.** Antes de virar `gotcha`/`learning`/`regra`/`procedure`, todo sinal passa pelo checklist [`rubrics/negative-filters.md`](rubrics/negative-filters.md).
- **Server Component é o default (Next.js App Router).** `"use client"` só onde há interatividade real (state, evento DOM, hook de browser). Hoje há 14 ocorrências em `src/app/` — revisão, não gatilho mecânico (não há grep que distinga "justificado" de "não justificado").
- **Migrations Prisma são forward-compatible.** Drop de coluna ou rename destrutivo precisa de fase de leitura dual antes de remover — sem isso, deploy em rolling cria janela de erro. Revisão, não gatilho.
- **Teste os limites onde a função pode quebrar, não só o caminho feliz.** Todo threshold (`.max()`/`.min()`, comparação numérica, tamanho de arquivo/string), boundary (exatamente no limite vs. um a mais/menos) e caminho de rejeição (`throw`/`ctx.addIssue`/`.reject`) precisa de teste próprio — o teste do caso válido passando não é evidência de que a rejeição funciona. Revisão, não gatilho mecânico: nenhum grep/contagem distingue "pensou nos limites reais" de "teste de rejeição genérico só pra bater a contagem" (mesmo problema do guard anti-Goodhart — um teste `.rejects` qualquer passa sem testar o limite específico). Lição de `021-media-upload` (2026-07-26): o cap de 300 caracteres do `altText`, presente no plan original, sumiu silenciosamente numa reescrita do schema pro shape de `FormData` — nenhum teste cobria essa branch, então nada acusou. Só apareceu quando o dono perguntou "você validou até onde isso quebra?" e a resposta honesta era não. Escrever o teste de boundary depois é o que revelou o bug — não o inverso.

*[A DEFINIR — princípios específicos de intenção de produto vêm da entrevista de adoção retroativa.]*

---

## 2. Flow de uma tarefa

```
1. LER        → 2. ENTENDER → 3. PLAN    → 4. RED
                                              ↓
8. REPEAT   ← 7. COMMIT   ← 6. REFACTOR ← 5. GREEN
                                              ↓
                                         8.5 RECONCILIAR
```

### 1. LER

- `/docs/prd.md` pra contexto de produto (qual RF a tarefa serve).
- `/docs/ust.md` pra story correspondente (US-NNN) — critérios de aceitação são o oráculo.
- `/docs/ach.md` pra estrutura (onde vai o código, qual componente).
- `/docs/gotchas.md` se a área tocada tem gatilho registrado.
- Código existente nos arquivos que vão mudar + vizinhos.

### 2. ENTENDER

- Reformular em 2 frases: *"o que vai mudar"* e *"por quê"*.
- Se não consegue em 2 frases → rubber duck ou pergunta.
- Listar 3-5 arquivos que vão ser tocados.

### 3. PLAN

- Mudança pequena (< ~50 linhas em 1-2 arquivos): plano mental + comentário no commit basta.
- Mudança média/grande: plan file explícito antes de tocar código.
- Mudança arquitetural: **parar e perguntar** (regra dura 11).

### 4. RED

- Escreve o teste (unit / integration / e2e) que falha pela razão certa.
- Ou a assinatura de tipo que não compila.
- Confirma que falha por motivo esperado antes do código.

### 5. GREEN

- Implementação mínima que passa.
- Não tenta otimizar, não antecipa. Só passa.
- Roda `tsc --noEmit` + `vitest` afetados.

### 5.1 GREEN falhou → reflect-retry capeado

Se o GREEN não fica verde, antes de haltar/perguntar, roda um loop curto de auto-correção ancorado na saída real do teste/`tsc` (nunca "reli e parece ok"). Cap 2 retries (3 tentativas no total); mesma falha 2× → para e escala. Cap esgotado → registra em `docs/.afm-log-failures/` antes de reportar.

### 6. REFACTOR

- Remove duplicação, melhora nomes, extrai constantes/tipos se ganhar clareza.
- Roda `tsc --noEmit` + testes afetados + `yarn lint`.

### 7. COMMIT

- Mensagem explica **porquê** (o diff já mostra o quê).
- Referencia story: `US-NNN: ...` ou requisito: `RF-NN: ...`.
- Um commit = uma mudança coerente.
- Segue Conventional Commits (`.commitlintrc` já gateia isso via hook `commit-msg`).

### 8. REPEAT

- Volta pro passo 4 pro próximo slice.

### 8.5 RECONCILIAR

Antes de fechar a tarefa, pergunta:

- **Aprendi algo que outro dev sem essa sessão precisa saber pra não quebrar?** Se sim → atualiza `/docs/`:
  - Decisão arquitetural inédita → `/docs/adr/NNNN-titulo.md` + linha em `ach.md`.
  - Surpresa contraintuitiva → `/docs/gotchas.md`.
  - Regra reutilizável que o user corrigiu → regra dura nova em `afm.md` (com gatilho mecânico).
  - Componente novo → atualiza `ach.md` § 3.
  - Mudança de escopo de produto → `prd.md` § 4.

---

## 2.1 Quando feature precisa de pasta própria

O loop em § 2 cobre mudança pequena. Pra feature que bate **qualquer um** dos critérios abaixo, abre `docs/features/NNN-slug/`:

- > 1 dia de trabalho OU > 200 linhas OU > 3 arquivos.
- Toca camada nova ou cria componente novo (gatilho da regra dura 11).
- Tem boundary externo novo (API, webhook, CLI, contrato pub/sub).
- Tem > 2 unknowns que precisariam ser `[NEEDS CLARIFICATION:]`.

Auxiliares disponíveis sob demanda: `/afm:clarify`, `/afm:analyze`, `/afm:research`. Senão (mudança pequena): direto no § 2.

---

## 3. Regras duras

Toda regra abaixo tem **gatilho executável** que o agente roda no teclado — pass/fail binário. Regra sem gatilho vive em § 1.3 como princípio.

1. **Nenhum código novo sem teste.** Inclui teste de tipo.
   *Verificação:* `vitest` cobre o caminho novo; diff mostra `.test.ts` correspondente.
2. **Zero `any` / `unknown` em helpers próprios.**
   *Verificação:* `grep -nE "\bany\b|\bunknown\b" src/` em arquivos não-fronteira.
4. **Não commita com type-check quebrado.**
   *Verificação:* `npx tsc --noEmit`.
5. **Uma responsabilidade por arquivo.** Nome vago ("manager", "utils", "helpers" sem prefixo de domínio) = parte.
   *Verificação:* `find src -type f \( -iname "*manager*" -o -iname "*utils*" -o -iname "*helpers*" \)` retorna 0 sem prefixo de domínio. Hoje retorna `src/lib/utils.ts` e `src/server/infra/container/helpers.ts` — ver § 3.1 forward-only.
6. **Arquivo ≤ 300 linhas.** Exceções com header explicando.
   *Verificação:* `find src -type f \( -name "*.ts" -o -name "*.tsx" \) -not -name "*.test.*" -print0 | xargs -0 wc -l | awk '$2 != "total" && $1 > 300'`. **Compliant hoje** (0 arquivos produtivos >300 linhas no scan de 2026-07-04).
7. **Domain-like exporta exatamente UMA função `domain_<action>`.** Domain é regra de negócio; query builder, schema/Zod e transport glue não vão aqui.
   *Verificação:* `for f in $(find src/server/features -path '*/domain/*.ts'); do n=$(rg -o '^export \{[^}]*\}' "$f" | tr ',' '\n' | wc -l); test "$n" -eq 1 || echo "$f: $n exports"; done` retorna vazio. **Compliant hoje** em 30 arquivos de domain.
10. **Sem backwards-compat shim.** Caller não existe → deleta. `// removed for X` polui.
    *Verificação:* `grep -rn "removed\|deprecated\|legacy" src/`. **Compliant hoje** (0 ocorrências).
11. **Mudança arquitetural pára e pergunta.** Nova camada / componente de 1ª classe / contrato entre módulos / refactor de pastas exige validação do dono da arquitetura.
    *Verificação (mid-flight):* `git status --porcelain` mostra `A` de diretório novo de 1ª classe sob `src/`, OU o diff move pastas / introduz import cross-módulo inédito → PARA e pergunta.
12. *(princípio — vive em § 1.3. Sem componente Task-like no projeto hoje — nenhum job/queue/scheduler detectado no scan A.1. Se um for introduzido, promove pra regra dura com gatilho de idempotência.)*
13. **Tokens e segredos não vazam.** Nunca logar token em claro. Redact em erros. Nunca commitar `.env`.
    *Verificação:* `git diff --staged | grep -nE "(token|secret|api[_-]?key|password|bearer)\s*[:=]\s*['\"][^'\"]+"` retorna 0; `git diff --staged --name-only | grep -E "(^|/)\.env"` vazio.
15. **Classificação de erros — Domain ≠ Transport.** Domain/Model não importa `TRPCError` (`@trpc/server`). Procedure mapeia erro de domínio → `TRPCError` no boundary, via `DomainError`/`ErrorRegistry` (`ADR-0017`).
    *Verificação:* `rg -l "TRPCError" src/server/features/*/domain/*.ts`. **Compliant hoje** — migração coordenada fechada em `022-error-registry` (2026-07-27). Ver `ach.md` § 3.2.
16. **Validação no boundary — schema só em input/output de procedure.** Zod valida em (a) `.input()`/`.output()` de procedure (`src/server/features/<feature>/schema.ts`), (b) payload externo. Domain/Model recebe shape já validado.
    *Verificação:* `rg -n "z\.|zod" src/server/models src/server/features/*/domain/*.ts` retorna 0. **Compliant hoje.**
17. **Edit em `/docs/` não colapsa o doc.** Rewrite que apaga mais da metade das linhas num só edit pára e exige revisão explícita.
    *Verificação:* `git diff --numstat -- docs/ | grep -vE '(^|/)\.afm-log|(^|/)_focus\.md$|(^|/)sessions/' | awk '$2 > 20 && $2/($1+$2+1) > 0.5 {print}'` retorna vazio.
18. **Substrato de captura é append-only.** `docs/.afm-log/` só recebe append.
    *Verificação:* `git log -p -- docs/.afm-log/events/ 2>/dev/null | grep -c '^-- \['` retorna `0`.
19. **Falha ancorada recorrente vira remediação.** Toda `sig=` que aparece ≥2× em `docs/.afm-log-failures/` deve ter artefato de remediação que a cite.
20. **`docs/_focus.md` é slot-state pequeno e sobrescrivível.**
    *Verificação:* `{ [ -f docs/_focus.md ] && wc -l < docs/_focus.md || echo 0; } | awk '$1 > 40 {print "INCHOU"}'` retorna vazio.

### Regras específicas do projeto (a partir de 30)

30. **Domain/Procedure NÃO importa `PrismaClient`/`@prisma/client`/driver Prisma direto.** Acesso a dados passa por `ctx.repositories` injetado; `src/server/models/*`, `src/server/infra/drivers/prisma.ts` e o seam de teste `src/test/prisma/` são a exceção intencional da camada de dados.
    *Verificação:* `rg -n "from.*@prisma/client|new PrismaClient|@/server/infra/drivers/prisma" src/server/features/*/domain/*.ts src/server/features/*/procedures/*.ts` retorna 0. **Compliant hoje.**
31. **Route handler (`src/app/api/**/route.ts`) é fino.** Delega pro tRPC handler; nenhuma regra de negócio inline.
    *Verificação:* `find src/app/api -name route.ts | xargs wc -l` — todos < 80 linhas. **Compliant hoje** (único route: `src/app/api/trpc/[trpc]/route.ts`).
32. **Nenhum commit direto em `main`/`develop`.** Todo trabalho de código acontece num branch de feature criado a partir de `develop` (nome em inglês, ex. `feature/016-search-content`), commits seguindo `.commitlintrc` (Conventional Commits, em inglês). PR contra `develop` usando `.github/pull_request_template.md`; só o dono aprova/faz merge no GitHub. `main` só recebe merge de `develop` em release/deploy, nunca commit ou merge de feature branch direto. Branch protection no GitHub (`main`/`develop`, PR obrigatório) é camada extra — o enforcement primário é este check antes de commitar.
    *Verificação:* `git rev-parse --abbrev-ref HEAD` não é `main` nem `develop`. Se for, cria/troca pra branch de feature antes de qualquer `git commit`.

{{Adicione regras duras específicas do projeto aqui — numere a partir de 33.}}

---

## 3.1 Regras forward-only

Adoção retroativa via `/afm:refactor` em **2026-06-30**. As regras abaixo se aplicam a **código novo a partir desta data** e a **arquivos modificados** (boy-scout rule). Código legado que viola é tech-debt rastreado, não bloqueio de PR.

| Regra | Razão pro forward-only | Violação encontrada | Tech-debt rastreado em |
| --- | --- | --- | --- |
| 1 — TDD/cobertura | Cobertura atual baixa: 23 arquivos de teste / 205 arquivos `src/` (~11.2%). Sweep retroativo seria semanas de trabalho. | 23/205 (~11.2%) | `[A DEFINIR — abrir issue]` |
| 2 — zero `any`/`unknown` | Volume pequeno, mas ainda existente em helpers/componentes legados; não bloqueia PRs em andamento até o boy-scout alcançar. | 5 ocorrências | `[A DEFINIR]` |
| 5 — naming vago | 2 arquivos sem prefixo de domínio (`src/lib/utils.ts`, `src/server/infra/container/helpers.ts`). Renomear/particionar exige revisão de todos os imports. | `src/lib/utils.ts`, `src/server/infra/container/helpers.ts` | `[A DEFINIR]` |
| 6 — arquivo ≤300 linhas | Resolvido pela migração `entities/` → `models/` (ADR-0007); manter como regra forward-only para código novo. | 0 arquivos produtivos >300 linhas | — |

**Critério de boy-scout:** ao editar arquivo legado que viola regra forward-only, traz pra conformidade no mesmo PR se o escopo justifica. Senão, abre issue separada e linka.

**Regra 15 removida desta tabela em 2026-07-27** — migração coordenada fechada em `022-error-registry`/`ADR-0017` (era exceção nesta tabela justamente por exigir migração coordenada, não boy-scout arquivo-a-arquivo; a migração aconteceu e a regra 15 voltou a ser universal em § 3).

---

## 4. Guidelines por tipo de mudança

### 4.1 Bug fix

1. Reproduzir o bug num teste. **Teste falha pela razão certa antes do fix.**
2. Implementar o fix mínimo que passa.
3. Rodar suíte inteira — bug fix frequentemente expõe outro.
4. Commit: `fix: US-NNN / RF-NN — <o porquê>`.

### 4.2 Feature nova

1. Identificar US correspondente. Se não existe, escrever primeiro (`/docs/ust.md`).
2. Critério de aceitação em Gherkin vira o primeiro teste.
3. Tracer bullet: ligar UI → router → procedure → domain → entity → DB com o mínimo, ver fluxo fim-a-fim.
4. Engrossar camadas via TDD.
5. Commit por slice.

### 4.3 Refactor

1. Suíte verde antes de começar.
2. Não muda comportamento observável. Se mudar, é feature/fix, não refactor.
3. Mudanças pequenas e frequentes.
4. Se descobrir falta de teste numa área que vai mexer, escreve antes.
5. Commit: `refactor: <o porquê>`.

### 4.4 Dependência nova

1. Justificar em 2 linhas no commit / PR (o quê + por quê + alternativa considerada).
2. Checar licença (MIT/Apache/BSD ok; GPL/AGPL avisar).
3. Checar tamanho (bundle size pra deps client-side).

---

## 5. Sinais de que você está off-track

- **Comentando código pra fazer teste passar.** Falsa confiança.
- **Mock que simula mais que o necessário.** Está testando o mock.
- **Adicionando `biome-ignore`, `@ts-ignore`, `@ts-expect-error` sem ticket.** Broken window.
- **Criando função `utils.ts` sem segundo caller.** Inline.
- **Duplicando lógica de negócio entre transports.** Move pra Domain/Model puro.
- **Escrevendo mais de uma implementação em paralelo.** Escolhe uma.
- **Cobrindo com try/catch todos os awaits.** Erros tipados > catch genérico.
- **Refatorando "enquanto estou aqui" sem teste prévio.** Outra tarefa.
- **Tarefa arrastando há horas sem um commit.** Slice maior que o ideal.
- **Teste que só serve pra subir % de cobertura.** Apaga. Cobertura é métrica, não meta.
- **Arquivo > 300 linhas.** "Mas é coeso!" — divide.
- **Nome com "and"/"manager"/"helper"/"utils" genérico.** Renomeia ou parte em dois.
- **`any` / `as any` aparecendo "por causa do TS".** Investiga inferência.
- **Código copiado 3×.** Abstrai.
- **Abstração com 1 caller.** Inline.
- **Domain-like com 2+ exports.** Parte.
- **Comentário narrando *o quê*.** Apaga; nome + tipo já dizem.
- **Comentário compensando código difícil.** Refatora primeiro.
- **Domain lançando `TRPCError` direto.** Violação da regra 15 (forward-only hoje) — não espalha mais; lança erro de domínio e deixa a Procedure mapear.

---

## 6. Definition of Done

Descoberto no scan A.7 (hooks locais — sem CI no repo hoje) e confirmado na entrevista de adoção retroativa (2026-06-30): `.husky/pre-commit` roda `lint-staged`, configurado no `package.json` para executar `biome check --write` nos arquivos staged suportados; `.husky/pre-push` roda `yarn lint` + `yarn test` (vitest); `.husky/commit-msg` roda `commitlint`. DoD de merge inclui **test runner + type check**, mesmo sem CI formal hoje — o agente roda os dois manualmente antes de considerar a tarefa pronta.

**Atualizado em 2026-07-04**: a suíte de testes deixou de depender de Postgres/Redis via Docker (`docker-compose-test.yml`, removido) — os testes de procedure agora rodam contra repositórios e gateways fake in-memory injetados via `TestContext` (`src/test/repositories/`, `src/test/gateways/`), o que também tornou o pre-push mais rápido (segundos, não um container build).

**Atualizado em 2026-07-06 (ADR-0011)**: os repositórios fake escritos à mão (`src/test/repositories/`) foram substituídos por **`prisma-mock`** — client fake gerado do `schema.prisma`, plugado no seam do driver via `vi.mock` em `src/test/setup.ts` (`setupFiles` do vitest). Os models de produção rodam intactos nos testes; só os gateways continuam com fake manual (`src/test/gateways/`). Isolamento por teste: `resetPrismaMock()` de `src/test/prisma/` (o `$clear()` da lib é bugado — ver comentário no seam). Racional e alternativas em `docs/research/001-teste-prisma-sem-banco-real.md`.

**Atualizado em 2026-08-20**: CI formal chegou (`.github/workflows/ci.yml`), gatilho `pull_request`/`push` em `develop`/`main`. Quatro jobs paralelos: `typecheck` (`npx tsc --noEmit`), `lint` (`npx biome check .` — sem `--write`, diferente do hook local, porque CI precisa falhar em vez de corrigir silenciosamente), `test` (`npm test`, `DISABLE_REDIS=true` pra não poluir log com retry de conexão — testes não dependem de Postgres/Redis real, ver nota 2026-07-04), `build` (`npm run build` contra um serviço `postgres:16` real, porque `prisma migrate deploy` — parte do script `build` desde #206 — exige um banco alcançável). O DoD abaixo deixa de ser "o agente roda manualmente" e passa a ser **verificado automaticamente em todo PR**; a checagem manual continua valendo como sinal antecipado antes do push.

- [ ] Testes novos cobrem o comportamento adicionado/modificado, e rodam verde.
- [ ] Suíte inteira roda verde (`yarn test`) — gateado por CI (job `test`).
- [ ] Type-check passa (`npx tsc --noEmit`) — gateado por CI (job `typecheck`).
- [ ] Lint passa sem warnings novos (`yarn lint`) — gateado por `.husky/pre-commit` localmente e por CI (job `lint`) no PR.
- [ ] Build de produção passa (`npm run build`) — gateado por CI (job `build`).
- [ ] Nenhum `any`/`unknown`/`@ts-ignore` novo sem justificativa.
- [ ] Nenhum arquivo tocado passou de 300 linhas (ou exceção documentada).
- [ ] Commit referencia US/RF e explica o *porquê*, segue Conventional Commits.
- [ ] Se contrato com outra camada mudou: ACH atualizado. Se escopo mudou: PRD atualizado.
- [ ] Se aprendi algo que outro dev precisa saber: doc atualizado (ADR/gotcha/regra/feature).

### 6.1 Pre-push validation (já gateado por hook — `.husky/pre-push`)

1. `yarn test` (vitest, sem dependência de Docker/Postgres — ver nota de 2026-07-04 acima).

Confirmado na entrevista: mantém só o test runner no pre-push (não adicionar type-check/build nesse hook — ficam no DoD de merge, § 6). Type-check/lint/build continuam fora do pre-push por serem mais lentos; a partir de 2026-08-20 rodam em paralelo no CI a cada PR, então o hook local segue leve de propósito — CI é a rede de segurança, não o hook.

---

*Mudanças neste doc seguem regra 11 (parar e perguntar) se afetarem processo.*
