# Feature 016 — Busca de conteúdo (título e conteúdo)

> **Spec:** o quê e o porquê. Sem decisão de tecnologia.
> **US relacionada(s):** US-013 (novo, Épico Posts) — RF-11.
> **Status:** done (2026-07-14 — `tsc --noEmit` limpo, `vitest` 268/268 verdes incl. 15 testes novos; `yarn build` verde (`/search` prerenderou); verificado ao vivo contra Postgres real via `next dev` — busca por título e por conteúdo confirmadas via `curl` no endpoint `post.search`)
> **Data de abertura:** 2026-07-14

## 1. Problema (do PRD/UST)

`docs/roadmap.md` Fase 6 pede melhorar navegação e descoberta de conteúdo. Hoje o único jeito de achar um post é rolar a listagem cronológica (`readRecent`) — sem busca por palavra-chave, o leitor (persona `[A DEFINIR]`, mesma do RF-10) não consegue localizar um post específico sem saber a data aproximada em que foi publicado.

## 2. Critério de sucesso observável

- [x] Leitor digita um termo e recebe posts cujo título ou conteúdo contém o termo (case-insensitive), respeitando a mesma visibilidade pública de `readRecent`/`readBySlug` (só `PUBLISHED` e `SCHEDULED` já vencido).
- [x] Resultado é paginado (mesmo padrão cursor-based de `readRecent`), não uma lista única sem limite.
- [x] Enquanto digita no campo de busca, o leitor vê sugestões (título) antes de confirmar a busca — sem endpoint novo dedicado, reusa a mesma busca com `limit` pequeno.

## 3. Cenários (Gherkin)

```gherkin
Scenario: Busca encontra post pelo título
  Given um post PUBLISHED com título "Guia de Prisma"
  When o leitor busca por "prisma"
  Then o post aparece no resultado

Scenario: Busca encontra post pelo conteúdo
  Given um post PUBLISHED cujo conteúdo menciona "tsvector" mas o título não
  When o leitor busca por "tsvector"
  Then o post aparece no resultado

Scenario: Busca não vaza posts não-públicos
  Given um post DRAFT com título "Rascunho Secreto"
  When o leitor busca por "secreto"
  Then o post não aparece no resultado

Scenario: Busca é paginada
  Given 15 posts PUBLISHED cujo título contém "teste"
  When o leitor busca por "teste" com limit 10
  Then a primeira página retorna 10 posts e um nextCursor não nulo
```

## 4. Out of scope

Decisão tomada durante o discovery desta feature (`/afm:deliver`, 2026-07-14 — ver § 7 e `docs/roadmap.md § Fase 6`):

- **Full-text search nativo do Postgres (`tsvector`/`ts_rank`, stemming, ranking por relevância).** O roadmap sugere isso como primeira implementação, mas o test harness do projeto (`ADR-0011`) roda contra `prisma-mock` — um fake em JS do `PrismaClient`, sem parser SQL — então `$queryRaw`/`to_tsvector` seria código sem cobertura de teste automatizada (viola regra dura 1). `ADR-0011` já cita teste de integração contra Postgres real como candidato de Fase 9/10, não hoje. Esta rodada usa filtro `contains`/`insensitive` do Prisma (testável sob `prisma-mock` hoje, sem migration). Fica pra quando a infra de teste de integração existir.
- **Ordenação por mais acessado.** Depende de contador de visualização que não existe — e o próprio `docs/roadmap.md § Fase 7` (Analytics interno) já lista "registrar visualização de post" e "contar views" como itens dessa fase. Construir agora duplicaria/anteciparia decisão que pertence à Fase 7 (o que conta como "view", dedup por sessão/IP, etc.).
- **Filtro de tag/categoria na UI de busca.** O backend já aceita `categoryId`/`tagId` (mesmo padrão de `readRecent`/`readOwn`/`readRelated`, reusado aqui), mas não há controle visual pra eles em nenhuma tela hoje — não é escopo desta rodada expor isso na UI, só a busca por palavra-chave.
- **Autocomplete como endpoint dedicado.** O item "autocomplete opcional" do roadmap é atendido reusando `post.search` com `limit` pequeno no `onChange` do campo — sem endpoint/índice separado.

## 5. Assumptions / Open questions

Sem `[NEEDS CLARIFICATION:]` aberto — a decisão irredutível desta rodada (tech de busca: `tsvector` nativo vs. `contains`/`insensitive`) foi resolvida por evidência de scan (ver § 4), não por pergunta ao dono.

- **Premissa:** posts arquivados (`ARCHIVED`) e em revisão (`IN_REVIEW`/`DRAFT`) não aparecem na busca pública — mesma regra de `publicVisibilityFilter()` já usada em `readRecent`/`readRelated`/`readAllPublicSlugs`.
- **Premissa:** termo de busca com menos de 2 caracteres é rejeitado no schema (evita varredura de tabela inteira por 1 char).

## 6. Dependências

- `docs/roadmap.md` Fase 6 — origem do requisito.
- `004-post-status` (done) — `publicVisibilityFilter()` reusado como fonte única de "o que é publicamente visível".
- `ADR-0011` (`prisma-mock`) — motivo pelo qual full-text search nativo fica fora de escopo desta rodada.

## 7. Clarifications

**2026-07-14 (discovery rodada 1/1, `/afm:deliver`):**

- **Q: full-text search nativo do Postgres (sugestão do roadmap) ou `contains`/`insensitive` do Prisma?** R: `contains`/`insensitive` — `$queryRaw`/`tsvector` seria untestable sob `prisma-mock` (ADR-0011), violando regra dura 1. Resolvido por evidência de scan (grep no código-fonte do `prisma-mock` confirmando suporte a `contains`/`mode: insensitive`, ausência de suporte a raw SQL), não precisou perguntar ao dono.
- **Q: "ordenação por mais acessado" entra nesta rodada?** R: Não — o próprio roadmap já aloca contador de views pra Fase 7 (Analytics interno); construir agora anteciparia decisão que pertence lá.

---

*Spec NÃO contém: decisão de stack, nomes de função, schema de DB, ordem de tasks. Isso vai pro `plan.md`.*
