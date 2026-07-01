# Rubrica — quando criar uma DSL (sugere, não constrói)

> DSL aqui = qualquer mini-linguagem de domínio que colapsa boilerplate repetido de chamadas primitivas: builder fluente, pipeline de combinadores, objeto declarativo interpretado, ou linguagem parseada. **DSL-first é o complemento do Rule of Three, não o oposto do KISS:** não abstrai cedo — mas quando o boilerplate de primitivas escala E tem gramática, uma DSL paga o próprio custo. O agente **sugere** (propõe + esboça); **não constrói sozinho** (regra dura 11 — DSL é camada/abstração de 1ª classe → pára e pergunta).

## Decisão binária

**Sugere DSL quando os DOIS sinais forem verdade (ambos, não um):**

- ✅ **Repetição (Rule-of-Three de sequência):** ≥ 3 call-sites repetem a **mesma sequência de ≥ N chamadas primitivas em ordem fixa** (não 3 chamadas avulsas — a *sequência* que se repete). Varia só os parâmetros, não a estrutura.
- ✅ **Boilerplate domina a intenção (ratio):** nesses sites, a maior parte das linhas é wiring/setup/glue mecânico, não a lógica de negócio real — o leitor não enxerga *o que* o código quer através do *como* ele liga as primitivas.

**E uma terceira condição que distingue DSL de "extrair função":**

- ✅ **Há gramática reusável** — composição, ordenação obrigatória, ramificação, ou encadeamento que se repete. É isso que faz uma DSL pagar mais que um helper. Sem gramática (só "chamar 5 funções em sequência sempre igual"), **um helper nomeado vence** — não é DSL.

**NÃO sugere DSL quando:**

- ❌ **< 3 sequências repetidas** — Rule of Three não bateu. Espera a terceira (YAGNI).
- ❌ **Um helper/builder simples já colapsa o boilerplate** — KISS > DSL. Função nomeada (`stripe_createCheckoutSession`) ou builder de 1 nível vence a mini-linguagem. DSL só quando o helper não captura a gramática.
- ❌ **O "boilerplate" é lógica per-site real** — variação genuína entre sites não é boilerplate; abstrair esconde diferença que importa.
- ❌ **"Vai escalar / dá pra parametrizar tudo"** — YAGNI. Não constrói DSL especulativa pro caso geral antes dos 3 casos reais.

## Por que essas regras

- **Os dois sinais juntos, não um.** Repetição sem boilerplate dominante → helper resolve. Boilerplate alto sem repetição (1 site) → é só uma função grande, parte ou inline. DSL é cara (nova camada, indireção, curva de aprendizado, debugging através da abstração) — só vale no cruzamento dos dois.
- **Gramática é o discriminador DSL-vs-helper.** Extrair função remove duplicação; DSL dá uma *linguagem* pra expressar a intenção. Se não há nada pra "compor", uma função basta — e é mais barata.
- **Sugere, não constrói (regra 11 / autonomia #6 bright line d).** Criar DSL é introduzir camada/abstração de 1ª classe — decisão arquitetural load-bearing. O agente leva a proposta (com esboço da API + ADR candidato), o dono da arquitetura decide. Construir uma DSL autônomo seria cruzar a bright line.

## Forma — escolhe a mais leve que remove o boilerplate (KISS dentro da DSL)

Em ordem crescente de custo — **pára na primeira que captura a gramática:**

1. **Builder fluente / função de fábrica** — encadeamento simples (`q().where().limit()`). Mais barato; cobre a maioria dos casos.
2. **Combinadores / pipeline** — funções pequenas que compõem (`pipe(parse, validate, persist)`). Quando a gramática é composição.
3. **Objeto declarativo interpretado** — config data-driven que um runner percorre. Quando a "linguagem" é uma estrutura de dados.
4. **Mini-linguagem parseada** (string → AST → exec) — **último recurso**, raramente justificado num app de produto. Exige parser, erros, testes do próprio parser — só quando os 3 acima genuinamente não expressam a gramática.

## Antes de propor — auto-crítica (corolário de verificação #6)

1. Os 3 sites repetem mesmo a *sequência*, ou só usam as mesmas primitivas em ordens diferentes? (ordens diferentes → não é uma DSL única)
2. Um helper de 1 nível colapsaria 80% do boilerplate? Se sim, propõe o helper, não a DSL.
3. A DSL proposta esconde diferença real entre os sites? (se sim, ela vai vazar — repensa a fronteira)
4. Qual a forma mais leve (lista acima) que captura a gramática? Não proponha parser se um builder resolve.

## Antiexemplos

- ❌ Construir um query-DSL autônomo no 2º call-site — Rule of Three não bateu; espera o terceiro (ou usa helper).
- ❌ Propor mini-linguagem parseada pra 3 sequências que um builder fluente de 20 linhas resolveria — forma cara demais (use o nível 1).
- ❌ Chamar de "boilerplate" 3 handlers que validam coisas diferentes — é lógica per-site, não wiring repetido; DSL esconderia a diferença.
- ❌ Materializar a DSL sozinho porque "é óbvio que precisa" — é regra 11: propõe + esboça a API + abre ADR candidato; o humano aprova a nova camada.
- ❌ DSL pro caso geral ("suporta qualquer provider futuro") com 3 providers reais — YAGNI; modela os 3, generaliza quando o 4º divergir.
