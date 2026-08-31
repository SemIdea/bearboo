# Feature 019 — Ordenação da busca por mais acessado

> **Spec:** o quê e o porquê. Sem decisão de tecnologia.
> **US relacionada(s):** US-013 (estende — Épico Posts) — RF-11.
> **Status:** done (2026-07-18 — `tsc --noEmit` limpo, `yarn test` 305/305 verdes, `yarn lint` limpo, `yarn build` verde (`/search` prerenderou); verificado ao vivo contra Postgres real via `next dev` — `sortBy: "mostViewed"` confirmado via `curl` no endpoint `post.search`)
> **Data de abertura:** 2026-07-18

## 1. Problema (do PRD/UST)

`docs/roadmap.md` Fase 6 lista "ordenação por mais acessado" como item de busca, mas `016-search-content` adiou explicitamente esse item pra quando existisse contador de visualização (`016-search-content/spec.md` § 4/§ 7) — dependência que a própria Fase 7 (Analytics interno) já possuía como escopo. A Fase 7 foi entregue (`017-post-view-analytics`: `Post.viewCount`, `repositories.post.readMostViewed`), então a dependência que bloqueava esse item não existe mais. Hoje `post.search` só ordena por `createdAt desc` — o leitor não consegue reordenar os resultados de uma busca pelos posts mais lidos.

## 2. Critério de sucesso observável

- [x] `post.search` aceita um parâmetro de ordenação opcional; com `sortBy: "mostViewed"`, os resultados vêm ordenados por `viewCount` decrescente (mantendo `createdAt desc` como comportamento padrão quando o parâmetro não é enviado — sem quebrar chamadas existentes).
- [x] A paginação cursor-based continua correta sob a nova ordenação, inclusive quando há empate de `viewCount` entre posts (tiebreak determinístico).
- [x] A página `/search` expõe um controle pro leitor alternar entre "mais recentes" e "mais acessados", no mesmo padrão de `<select>` já usado em `/post/mine`.

## 3. Cenários (Gherkin)

```gherkin
Scenario: Busca ordenada por mais acessado
  Given um post PUBLISHED com título "A" e viewCount 5
  And um post PUBLISHED com título "B" (mesmo termo de busca) e viewCount 20
  When o leitor busca pelo termo comum com sortBy "mostViewed"
  Then o post "B" aparece antes do post "A"

Scenario: Busca sem sortBy mantém o comportamento atual
  Given dois posts PUBLISHED que casam o termo de busca, criados em datas diferentes
  When o leitor busca sem informar sortBy
  Then os resultados vêm ordenados por mais recente primeiro (comportamento inalterado)

Scenario: Paginação é estável com empate de viewCount
  Given 15 posts PUBLISHED que casam o termo de busca, todos com viewCount 0
  When o leitor busca com sortBy "mostViewed" e limit 10, navegando pra página 2
  Then a página 2 não repete nem pula nenhum post da página 1
```

## 4. Out of scope

- **Ordenação por mais acessado em `readRecent`/`readOwn`/outras listagens.** O item do roadmap (Fase 6) fala especificamente de busca (`post.search`); as outras listagens não têm esse requisito registrado. Se surgir demanda, é feature própria.
- **Filtro por período pra "mais acessado" (ex.: mais acessado nos últimos 7 dias).** `Post.viewCount` é um contador total, sem quebra por período — a mesma limitação já registrada em `017-post-view-analytics/spec.md § 4` (contagem por período adiada por decisão de retenção/privacidade ainda não discutida).

## 5. Assumptions / Open questions

Sem `[NEEDS CLARIFICATION:]` aberto — a única incerteza técnica (paginação cursor-based com `orderBy` não-único sob `prisma-mock`) foi resolvida por evidência de scan (código-fonte do `prisma-mock` suporta `orderBy` array/composto — ver § 7).

- **Premissa:** o controle de ordenação na UI é um `<select>` simples (mesmo padrão de `/post/mine`), sem persistir preferência do usuário.

## 6. Dependências

- `docs/roadmap.md` Fase 6 — origem do requisito, item adiado.
- `016-search-content` (done) — `post.search` existente, esta feature estende.
- `017-post-view-analytics` (done) — dependência que desbloqueia este item (`Post.viewCount`).

## 7. Clarifications

**2026-07-18 (discovery, `/afm:deliver`):**

- **Q: cursor pagination do Prisma é confiável ordenando por `viewCount` (campo não-único, com empates prováveis) sob `prisma-mock`?** R: sim, com tiebreak — `node_modules/prisma-mock/lib/delegate.js` `sortFunc` suporta `orderBy` como array (múltiplos critérios, aplicados em ordem), então `orderBy: [{ viewCount: "desc" }, { id: "asc" }]` resolve empates de forma determinística e é testável sob o harness atual (ADR-0011). Resolvido por evidência de scan, sem pergunta ao dono.
- **Q: expõe UI pro leitor escolher a ordenação, ou fica só no backend?** R: expõe — o critério de conclusão da Fase 6 no roadmap é "usuário consegue encontrar posts facilmente", e as outras capacidades de `016` (filtro de tag/categoria no backend, mesmo sem UI) já eram exceção documentada como "não é escopo desta rodada expor". Aqui o requisito do roadmap é a ordenação em si, então expor o controle é o que fecha o item de verdade — sem UI, o backend sozinho não muda a experiência do leitor.

---

*Spec NÃO contém: decisão de stack, nomes de função, schema de DB, ordem de tasks. Isso vai pro `plan.md`.*
