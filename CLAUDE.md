# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Documentação canônica — qual doc consultar pra qual trabalho

Este projeto adotou o AFM (Agent Flow Methodology) **retroativamente em 2026-06-30** via plugin `afm` v3.1.0-rc.6 (`/afm:refactor`). Os docs em `/docs/` não são leitura-de-uma-vez — são **referência consultada no momento da tarefa**. Mapa situação→doc:

| Quando você está… | Consulte |
| --- | --- |
| começando uma tarefa (qual RF/US ela serve, critérios de aceitação) | [`/docs/prd.md`](./docs/prd.md) (§ RFs) + [`/docs/ust.md`](./docs/ust.md) (a US é o oráculo) |
| decidindo **onde** o código vai (qual componente/camada) | [`/docs/ach.md`](./docs/ach.md) § 3.1 (mapa componente→onde) |
| escrevendo código que pode violar regra dura | [`/docs/afm.md`](./docs/afm.md) § 3 (gatilho executável por regra) **+ § 3.1 forward-only** (regras herdadas do código legado aplicam só a código novo + boy-scout — ver `afm.md` § 3.1) |
| tomando decisão de design (SOLID, erro, enum vs union, criar lib/módulo/DSL, validação no boundary) | [`/docs/rubrics/`](./docs/rubrics/) (tabelas de decisão runnable) |
| tocando uma área com pegadinha conhecida | [`/docs/gotchas.md`](./docs/gotchas.md) (campo `Gatilho` = "se você está editando X") |
| querendo o porquê de uma decisão arquitetural | [`/docs/adr/`](./docs/adr/) (inclui ADRs retroativos da adoção — ADR-0001 a ADR-0004) |
| entregando uma feature complexa | [`/docs/features/`](./docs/features/) — `NNN-slug/` com `spec.md`+`plan.md`+`tasks.md` (critério em `afm.md § 2.1`) |
| checando o plano de fases futuras do produto (admin/CMS, roles, SEO, busca, analytics, CI/CD…) | [`/docs/roadmap.md`](./docs/roadmap.md) — 12 fases, referenciado por `prd.md` § 6 |

> O plugin `afm` instala um hook `SessionStart` que injeta um digest destes docs (regras § 3 + doutrina) no começo de cada sessão, e um hook `PreToolUse` que relembra as regras/gotchas que casam o arquivo que você está editando. Os docs acima são a fonte; o hook é o lembrete no momento certo.

## Doutrina — onde conhecimento vive

`/docs/` é fonte viva, não artefato congelado de bootstrap/refactor. Critério único pra decidir onde algo vai:

> *"Se outro dev — ou outro agente sem minha memória — precisa saber pra não quebrar, é doc, não memória."*

`/docs/` ← regras, decisões, gotchas, arquitetura, persona, fluxos, contratos. Memória do Claude ← só estilo do user, preferências durávels, contexto pessoal.

**Toda sessão Claude observa sinais** listados em `framework-template/interview/triggers.md` (decisão arquitetural, surpresa runtime 2×, correção com regra reutilizável, etc.) e propõe edit no `/docs` apropriado — sem comando explícito. Procedure passiva em `framework-template/ops/reconcile.md`. O hook `SessionStart` do plugin injeta essa doutrina no começo da sessão pra que o reconcile seja de fato always-on.

## Meta-framework

Meta-framework vive no plugin `afm` (versão registrada em `/docs/.afm-version`). Modificações da metodologia = PR no repo do plugin, não aqui.

**Comandos (skills atômicas v2.0.0+, modo ativo sob demanda):**
- `/afm:refactor` — adoção retroativa em codebase brownfield (já rodou pra criar este doc, 2026-06-30). Ativa só por invocação explícita.
- `/afm:deliver <feature>` — **entrega autônoma fim-a-fim (porta da frente pra "faz a feature X")**: discovery → 1 aprovação → executa até o fim. Resumível (retoma de spec/plan/tasks já existentes).
- `/afm:gotcha`, `/afm:adr`, `/afm:rule`, `/afm:promote` — sub-flows operacionais pontuais.
- `/afm:specify <slug>` → `/afm:plan` → `/afm:tasks` — delivery loop à-la-carte (rodar um passo isolado; cria `/docs/features/NNN-slug/` com `spec.md`, `plan.md`, `tasks.md`). Heurística de quando usar em `/docs/afm.md` § 2.1.
- `/afm:clarify [<feature>]`, `/afm:analyze [<feature>]`, `/afm:research <topic>` — auxiliares do delivery loop.
- `/afm:export-template` — converte este projeto em template arquitetural reutilizável.

**Modo passivo (sempre-on, sem comando):**
- `/afm:reconcile` — observa sinais de `framework-template/interview/triggers.md` em QUALQUER sessão (mesmo durante trabalho normal de código) e propõe edits no `/docs/`. Não auto-aplica. Doutrina contínua mora aqui.

## Reference docs (libs instaladas)

- Next.js 15 (App Router): `node_modules/next/dist/...` (versão exata em `package.json`).
- tRPC v11: `node_modules/@trpc/*` (versão RC — checar changelog ao atualizar).
- Prisma 6: `node_modules/prisma/`, `node_modules/@prisma/client/`.
- {{lib}}: {{onde a doc/typedefs vivem — completar conforme instala}}.
