# Feature 007 — Posts relacionados

> **Spec:** o quê e o porquê. Sem decisão de tecnologia.
> **US relacionada(s):** nenhuma US formal em `docs/ust.md` — item do roadmap (`docs/roadmap.md` Fase 1 "Blog público bem feito", também citado na Fase 6 "Busca e descoberta").
> **Status:** done (2026-07-12 — `tsc --noEmit` limpo, `vitest` 155/155 verdes incl. 5 testes novos de `readRelated` cobrindo os 3 cenários da spec + exclusão do próprio post; `next build` sem erro novo (baseline conhecido: só o erro pré-existente de `/`))
> **Data de abertura:** 2026-07-12

## 1. Problema (do PRD/UST)

`docs/roadmap.md` Fase 1 e Fase 6 listam "posts relacionados" como funcionalidade faltante. Hoje, ao terminar de ler um post, não há nenhum caminho de navegação pra outro conteúdo do blog além de voltar pra listagem geral — perde-se a chance de reter o leitor com conteúdo similar (mesma categoria/tags).

## 2. Critério de sucesso observável

- [x] Na página de um post, aparece uma lista de posts relacionados (mesma categoria ou pelo menos uma tag em comum), excluindo o próprio post.
- [x] Um post sem categoria e sem tags simplesmente não mostra a seção (sem erro, sem lista vazia estranha).
- [x] Só posts `PUBLISHED` aparecem como relacionados (mesma regra de visibilidade pública já aplicada em `readRecent`/`readBySlug`).

## 3. Cenários

```gherkin
Scenario: Post com categoria e tags em comum com outros
  Given um post "A" na categoria "Backend" com a tag "prisma"
  And um post "B" também na categoria "Backend"
  And um post "C" com a tag "prisma"
  And um post "D" sem relação nenhuma com "A"
  When alguém abre a página do post "A"
  Then "B" e "C" aparecem na lista de relacionados
  And "D" não aparece

Scenario: Post sem categoria e sem tags
  Given um post "E" sem categoria e sem tags
  When alguém abre a página do post "E"
  Then a seção de relacionados não aparece

Scenario: Post relacionado não publicado
  Given um post "F" DRAFT na mesma categoria de "A"
  When alguém abre a página do post "A"
  Then "F" não aparece nos relacionados
```

## 4. Out of scope

- Ranqueamento por relevância (nº de tags em comum, popularidade, etc.) — ordena por mais recente, mesmo critério de `readRecent`. Ranking ponderado é melhoria futura, não critério de sucesso desta rodada.
- Busca full-text / "conteúdo similar" via NLP — isso é Fase 6 (busca), item maior e separado.
- Componente de UI elaborado (carrossel, imagens grandes) — lista simples de links, consistente com o resto do blog (sem design system dedicado ainda).

## 5. Assumptions / Open questions

- "Relacionado" = mesma categoria OU pelo menos uma tag em comum (união, não interseção) — critério simples e observável, aproveitando taxonomia que já existe (`005-tags-categorias`). Não há métrica de "quão relacionado" pedida no roadmap, então união é suficiente pro critério de sucesso.
- Sem `[NEEDS CLARIFICATION:]`.

## 6. Dependências

- `docs/features/005-tags-categorias/` (`done`) — usa `Category`/`Tag`/`PostTag` já existentes, sem schema novo.
- Independente de `007-posts-relacionados`... (self) / `009-post-404-status` / `010-post-cover-image`.

## 7. Clarifications

_(vazio)_

---

*Spec NÃO contém: decisão de stack, nomes de função, schema de DB, ordem de tasks. Isso vai pro `plan.md`.*
