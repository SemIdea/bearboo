# Rubrica — ciclo de evolução (`evolve`) vs. mecanismo único vs. fix pontual

> **O que "evolução" significa aqui:** refinar a **documentação local deste projeto** (a instância materializada da metodologia em `<consumer>/docs/`) — deixá-la mais enxuta, clara, atual e eficiente. **Nunca** o plugin AFM em si (`framework-template/`); ao plugin, só se **sugere** via `/afm:promote`. Toda menção a "metodologia"/"saúde da metodologia" abaixo é a doc local.

> Decisão em **3 vias**: o que apareceu pede (1) o **ciclo inteiro** do `/afm:evolve` (orquestrador: coleta de evidência → proposta → gate único → aplicação → registro), (2) **um mecanismo único à-la-carte** (`/afm:diagnose`, `/afm:reflect`, `/afm:generalize`, `/afm:restructure`), ou (3) **um fix pontual** que o `reconcile` propõe direto via skill atômica (`/afm:gotcha`, `/afm:rule`, `/afm:adr`)? Custo decrescente: o ciclo é o mais caro (compõe múltiplos mecanismos, gate consolidado, registro em `docs/evolution/`); o mecanismo único é escopado; o fix pontual é barato. Não rode o ciclo pra o que cabe num mecanismo, nem um mecanismo pra o que cabe num edit.

## As 3 vias

### 1. Ciclo `evolve` — quando os DOIS forem verdade:

- ✅ **O problema é da instância como um todo, não de um eixo isolado** — múltiplos achados de saúde, ou achados que cruzam modalidades (refs mortas **e** regra ambígua vivida **e** inflação espalhada). É um *sweep de saúde* que se beneficia do gate consolidado + lineage num só lugar.
- ✅ **Há evidência observável de "fora do 100%"** — sinal mecânico (do `diagnose`) OU comportamental (do `reflect`) OU sintoma articulado pelo user ("os docs estão uma bagunça"). Sem sinal, não roda (instância saudável → ciclo rende ~zero; cooldown recusa).

### 2. Mecanismo único à-la-carte — quando você sabe exatamente qual lente precisa:

- 🔍 **`/afm:diagnose`** — só o **relatório de saúde** (scan mecânico dos 7 eixos, read-only). "Como está a saúde da metodologia aqui?" sem querer propor/aplicar nada.
- 🪞 **`/afm:reflect`** — **um doc específico guiou mal** em apply-time (regra ambígua, seção que não guiou). Refino de instrutividade, evidência comportamental da sessão.
- 🧬 **`/afm:generalize`** — **≥2 gotchas similares** acumularam e pedem fusão numa regra abstrata (episódica→semântica). Anti-inflação na raiz.
- 🗂️ **`/afm:restructure`** — **staleness** (doc desatualizado vs código) ou **findability/partição** (info mal-localizada, doc que escalou).

> O mecanismo único ainda **auto-verifica e gateia** o que propõe (reflect/generalize/restructure têm gate próprio; diagnose é read-only). A diferença pro ciclo é o **escopo**: uma lente, não o sweep; sem o overhead de compor todos + registro de ciclo.

### 3. Fix pontual (reconcile → skill atômica) — quando é aditivo e local:

- ❌ **Aprendeu um fato/decisão/gotcha NOVO** — `/afm:adr` (decisão arquitetural), `/afm:rule` (regra de uma correção), `/afm:gotcha` (surpresa que mordeu 2×). O `reconcile` já cobre isso no fim do turn; abrir mecanismo/ciclo é overhead. (Distinção: `reconcile`/`gotcha`/`rule` **adicionam** conhecimento; `reflect`/`generalize`/`restructure` **refinam/consolidam/reorganizam** o que já existe.)
- ❌ **Validação de UMA feature** — coverage/consistência spec↔plan↔tasks → `/afm:analyze` (read-only, per-feature).
- ❌ **Entrega de feature** → `/afm:deliver`.
- ❌ **Promover aprendizado pro plugin** → `/afm:promote`.

## Por que essas regras

- **Sinal observável é obrigatório** (vias 1 e 2). Problema sistêmico sem evidência vira o agente auditando texto com base em texto (loop de auto-referência) — proibido. Mecânico (`diagnose`) e comportamental (`reflect`) são as duas modalidades de evidência (os dois lados do φ do Self-Harness); ambas valem.
- **Sinal > ritual** (Self-Harness / Autogenesis): em docs saudáveis o ciclo rende quase nada. Gatilho adaptativo por evidência bate budget/calendário fixo. O cooldown do `evolve` recusa ciclo sem sinal novo (o mecanismo único, sendo escopado e — no caso do diagnose — read-only, não tem cooldown).
- **Escopo decide a via** (ciclo vs mecanismo): se você sabe a lente, use o mecanismo; se é um sweep multi-modalidade que merece um gate consolidado, use o ciclo. Não componha todos os mecanismos (evolve) pra resolver um eixo só.
- **Diagnóstico vazio é resultado válido**: se o scan/reflexão não acha nada, reporta "100%" e encerra — **não** fabrica doença pra justificar a invocação.
- **Tamanho de doc é sinal de consolidação, nunca de poda** (ACE × Configuring): um doc core acima de ~500 linhas (`afm-health.sh` A6 tier soft) roteia pra **revisão de consolidação** — `/afm:generalize` (funde redundância) ou `/afm:restructure` (particiona por temperatura) —, **jamais** corte por tamanho. ACE: poda redundância, não linha; brevity bias joga fora detalhe load-bearing. O número é gatilho de revisão, não veredito de deleção.

## Antiexemplos

- ❌ **Rodar `/afm:evolve` semanalmente por ritual** — roda por sinal, não por calendário.
- ❌ **Abrir o ciclo pra registrar um gotcha novo** — é aditivo e local; `/afm:gotcha` (ou o reconcile propondo) resolve.
- ❌ **Rodar o ciclo inteiro só pra ver a saúde** — isso é `/afm:diagnose` (read-only, sem gate).
- ❌ **Achado "o doc parece inflado" sem `wc -l`/grep de duplicata** — sem evidência observável não é achado (#5).
- ❌ **`generalize` a partir de 1 gotcha** — sem batch (≥2) não há generalização; é fabricar abstração sem evidência.
- ❌ **`reflect` abrandar uma regra porque ela me constrangeu** — violação ≠ regra-errada; "agente em não-conformidade" é hipótese rival obrigatória.
- ❌ **`restructure` forçar tiering em doc pequeno** — partição por temperatura é opt-in, só quando o doc escalou (YAGNI).
- ❌ **Rodar de novo sem nada ter mudado** — cooldown (no ciclo); mecanismo sem sinal novo é teatro.
