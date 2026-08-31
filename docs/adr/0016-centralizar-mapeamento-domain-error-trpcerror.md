# ADR-0016 — Centralizar o mapeamento Domain error → TRPCError no boundary

> **Status:** Substituída por ADR-0017
> **Data:** 2026-07-26
> **Decidido por:** SemIdea

## Contexto

`docs/rubrics/error-classification.md` já documenta o desenho pretendido: `domain_*` lança/retorna erro de domínio com `code` literal; o procedure (boundary tRPC) traduz esse `code` pra `TRPCError`; `Domain` nunca importa `TRPCError` (regra dura 15).

O research `docs/research/004-error-handler-patterns.md` auditou o código e encontrou esse desenho só parcialmente implementado: dos ~42 procedures do projeto, **apenas 1** (`src/server/features/media/procedures/delete.ts:12-38`) faz o catch-and-map descrito na rubrica — via if/switch manual local. Os outros 41 ou repassam um `TRPCError` que o próprio domain já lançou direto (o que só "funciona" porque a camada domain já furou a regra 15, não por desenho), ou não tratam erro de domínio nenhum. Não existe hoje nenhum ponto único de mapeamento — cada procedure que eventualmente vier a tratar isso reinventaria o mesmo if/switch.

## Decisão

**Centralizar o mapeamento Domain error → `TRPCError` em um único ponto**, usando o `errorFormatter` já configurado em `src/server/createRouter.ts:15-27` (hoje só trata `ZodError`) como o lugar canônico — em vez de cada procedure escrever seu próprio catch-and-map.

Detalhes operacionais:
- `errorFormatter` passa a inspecionar `error.cause` / `error instanceof DomainError` (além do `ZodError` que já trata), e mapear o `code` literal do domain pro `TRPCError` code apropriado (`CONFLICT`, `BAD_REQUEST`, `FORBIDDEN`, `NOT_FOUND`, etc. — o mapeamento code→code segue o mesmo critério já usado no exemplo de `media/procedures/delete.ts`).
- Erro que não é nem `DomainError` nem `ZodError` (ou seja, Infra) vira `INTERNAL_SERVER_ERROR` genérico sem vazar detalhe — este ADR cobre a centralização do mapeamento; o catch de Infra na borda propriamente dito é um item separado da recomendação do research (item 2), não escopo deste ADR.
- Procedures individuais deixam de precisar de try/catch manual pra traduzir erro de domínio — só lançam/deixam subir o `DomainError` que o `domain_*` retornou/lançou, e o `errorFormatter` cuida da tradução.
- Este ADR **não resolve** a violação da regra dura 15 nos ~23-24 arquivos `domain/` que hoje lançam `TRPCError` direto — esses continuam furando a camada até serem tocados via boy-scout (dívida já registrada em `docs/afm.md` § 3.1, forward-only). A centralização aqui reduz o incentivo de continuar fazendo isso em código novo, mas não migra retroativamente o código existente.

## Alternativas consideradas

- **Cada procedure mapeando erro no próprio corpo** (se propagar o padrão do único exemplo atual pros outros 41) — rejeitada: é exatamente a inconsistência que o research encontrou; qualquer novo `code` de erro precisaria ser adicionado em N lugares em vez de um, e nada garante que um procedure novo lembre de fazer o mapeamento.
- **Helper `mapDomainErrorToTRPCError()` chamado explicitamente por cada procedure** (em vez de plugar no `errorFormatter` global) — rejeitada como escolha principal: ainda exige que cada procedure lembre de chamar o helper (mesmo problema de disciplina manual), só move o código duplicado pra uma função em vez de duplicar lógica. Fica como opção B se o `errorFormatter` global se mostrar limitado pra algum caso (ex. procedure que precisa de mapeamento diferente do padrão).

## Consequência

**Fica fácil:** qualquer procedure novo automaticamente ganha a tradução correta de `DomainError` pra `TRPCError` sem escrever try/catch — o comportamento é dado pelo transporte, não por disciplina individual de cada procedure.

**Fica difícil / gotcha:** um `code` de domínio sem entrada no mapeamento central cai num branch default (provavelmente `INTERNAL_SERVER_ERROR`) — se um dev adicionar um `code` novo em algum `<Feature>ErrorCode` e esquecer de registrar o mapeamento, o erro vira 500 genérico em vez do status HTTP-ish correto. Vale considerar um teste que force cobertura exaustiva (switch sem `default`, quebra em compile-time) quando isso for implementado.

**Débito aceito:** os ~23-24 arquivos `domain/` que já violam a regra 15 continuam violando até serem tocados individualmente — este ADR não é gatilho de mutirão de correção.

## Referências

- Commit: (a implementar)
- Doc canônico: `docs/rubrics/error-classification.md`, `docs/research/004-error-handler-patterns.md`
- Regra dura relacionada: `docs/afm.md` § 3 regra 15, § 3.1 (forward-only)
