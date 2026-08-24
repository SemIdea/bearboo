# ADR-0021 — `/docs/` adota Simplified Technical English (nível "espírito"), em inglês

> **Status:** Aceita
> **Data:** 2026-08-23
> **Decidido por:** SemIdea

## Contexto

Os `/docs/` são **fonte normativa lida por agente** — o hook `SessionStart` injeta um digest deles a cada sessão, e o loop de tarefa (`afm.md § 2`) relê `prd`/`ust`/`ach`/`gotchas` a cada task. O custo em token desse conteúdo **compõe**: paga toda sessão, não uma vez.

Hoje os docs são pt-BR, e o `afm.md § 1.3` fixa a política "Código em inglês, doc em português". O dono levantou o **ASD-STE100 (Simplified Technical English)** — uma controlled natural language da indústria aeroespacial (AECMA, anos 1980; mantida pelo STEMG; Issue 9, jan/2025: 53 regras + dicionário de ~900 palavras aprovadas) — como possível caminho pra economizar token.

O estudo (ver `docs/learn/`, coleção de structured logging à parte) mostrou que "STE" não é uma coisa só, e que o objetivo do spec (compreensão inequívoca por humano não-nativo + traduzibilidade) **não é** minimizar token — uma das 53 regras proíbe explicitamente omitir palavra/artigo pra encurtar. Foi preciso medir antes de decidir.

## Medição (dado real, não estimativa)

Reescrevemos trechos **reais** do `afm.md` em quatro variantes e medimos com proxy `chars/4` (proxy relativo robusto; o pt-BR real custa *acima* de chars/4 por causa de acento/subword, o que só reforça o sentido dos resultados):

| Variante | trecho ~100 palavras (§ 1.3) | trecho ~700 palavras (§ 1) |
| --- | ---: | ---: |
| pt-BR original | baseline | baseline |
| inglês simples (tradução) | **+0%** | **+0%** |
| **STE-espírito** (curto/ativo/uma-ideia/termo-consistente/listas, sem floreio) | **−32%** | **−26%** |
| STE-letra completa (53 regras + dicionário + artigos obrigatórios) | **+19%** | **+11%** |

Três conclusões, robustas nos dois tamanhos:
1. **Traduzir sozinho economiza ~nada.** Inglês é pré-requisito do STE, não o economizador.
2. **STE-espírito economiza de verdade (−26% a −32%).** O corte vem de tirar oração subordinada, metáfora e hedge.
3. **STE-letra completa custa MAIS que o pt-BR** (+11% a +19%) — verboso por design.

Ajuste de realidade: § 1 é prosa-pesada (melhor caso). Seções densas de código (ex. `afm.md § 3`, gatilhos `grep`/identificadores que não mudam) economizam menos. A economia realista no normativo vivo inteiro é **−15% a −25%**.

## Decisão

**(1) `/docs/` é escrito em inglês, no nível "espírito" do STE.** Frase curta e ativa; uma ideia por frase; o mesmo termo para o mesmo conceito; listas verticais; zero floreio/metáfora/hedge. Isto **não** é a letra completa do ASD-STE100 — sem o dicionário de ~900 palavras aprovadas e sem os artigos/repetições obrigatórios que medimos em +11%.

**(2) A política "doc em português" (afm.md § 1.3) é substituída.** Passa a valer "tudo em inglês" (código + docs); as exceções de conteúdo-de-produto (copy de UI, `err.message` na tela, seed, fixture com acento) **permanecem** em português.

**(3) A conversão é forward-only.** Doc novo nasce em inglês STE-espírito. O normativo vivo (`afm`/`ach`/`prd`/`ust`/`gotchas`/`roadmap`/`rubrics`) converte **doc-a-doc, em PR próprio** (regra 17 — sem colapso). Registro histórico **não** é reescrito: ADRs e `features/` entregues ficam como estão; o ledger append-only (`docs/sessions/`, `docs/.afm-log/`) é proibido de reescrever pela regra 18.

## Alternativas consideradas

- **Só traduzir pra inglês (sem STE)** — rejeitada: medimos **+0%** de token. O único ganho é consistência com o código; não justifica o trabalho sozinho.
- **STE-letra completa (53 regras + dicionário)** — rejeitada: medimos **+11% a +19%** de token — o oposto do objetivo. O spec otimiza compreensão de humano não-nativo e tradução, não economia de máquina; o dicionário de 900 palavras é de manutenção aeroespacial, não de software, e aplicar/manter as 53 regras é custo alto e contínuo. Guardamos como referência, não como alvo.
- **Manter pt-BR** — rejeitada: abre mão de uma economia que compõe toda sessão, por doc lido por agente.
- **Converter tudo, inclusive histórico** — rejeitada: viola a regra 18 (ledger append-only) e reescreveria história de ADR/feature (mesmo princípio da nota da ADR-0020: reescrever ADR = reescrever história).

## Consequência

**Fica fácil:** doc novo já nasce enxuto e em inglês; o custo por sessão cai ~15–25% no normativo vivo conforme a conversão avança; o padrão casa com o código (já inglês).

**Fica difícil / gotcha:** (a) o `afm.md` continua pt-BR até o próprio PR de conversão (o piloto) — durante a transição o acervo é bilíngue por doc, não por linha. (b) "STE-espírito" é julgamento de revisão, não gatilho mecânico binário — vive em `afm.md § 1.3` como princípio, não como regra dura § 3 (um guard opcional de comprimento de frase pode ser adicionado depois). (c) A conversão precisa respeitar a regra 17 (um doc por PR, sem colapso) e a regra 18 (ledger intocado).

## Referências

- Fonte do spec: `asd-ste100.org` (Issue 9, jan/2025); Wikipedia "Simplified Technical English".
- Prior art (STE como skill de agente): `github.com/danyuchn/asd-ste100-skill`, `github.com/nuelcyoung/asd-ste100`.
- Regras duras relacionadas: 17 (edit não colapsa doc), 18 (ledger append-only), 34 (PR em inglês — mecaniza o subconjunto de processo).
- Princípio emendado: `afm.md § 1.3` ("Código em inglês, doc em português" → "Tudo em inglês; `/docs/` em STE-espírito").
