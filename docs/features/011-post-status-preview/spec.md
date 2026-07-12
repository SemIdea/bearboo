# Feature 011 — Seletor de status e preview de post não publicado

> **Spec:** o quê e o porquê. Sem decisão de tecnologia.
> **US relacionada(s):** nenhuma US formal em `docs/ust.md` — item do roadmap (`docs/roadmap.md` Fase 2 "Admin/CMS").
> **Status:** done (2026-07-12 — `tsc --noEmit` limpo, `vitest` 157/157 verdes; `next build --debug-prerender` sem erro novo em `/post/[slug]`; achado mid-flight sobre caching/cookies documentado em `plan.md` § 9)
> **Data de abertura:** 2026-07-12

## 1. Problema (do PRD/UST)

`enum PostStatus { DRAFT PUBLISHED ARCHIVED }` já existe no schema e `post.create`/`post.update` já aceitam `status` opcional (`docs/features/004-post-status/`), mas não há seletor na UI de criar/editar — todo post criado pela UI nasce `PUBLISHED` (default do domain) e não há como o autor mudar o status depois sem chamar a API direto. Além disso, `readBySlug` trata qualquer post não-`PUBLISHED` como não encontrado pra **qualquer** chamador, inclusive o próprio dono — não existe hoje um jeito de o autor ver como o próprio rascunho vai ficar antes de publicar.

## 2. Critério de sucesso observável

- [x] Ao criar ou editar um post, o autor escolhe o status (Draft/Published/Archived) num seletor na UI.
- [x] O autor consegue abrir a URL real do próprio post (`/post/<slug>`) mesmo quando o status não é `PUBLISHED`, e vê um aviso de que o post não está público.
- [x] Qualquer outra pessoa (não-dono, ou visitante não logado) continua recebendo 404 pra um post não-`PUBLISHED`.

## 3. Cenários

```gherkin
Scenario: Autor cria post como rascunho
  Given um usuário autenticado no formulário de criar post
  When ele seleciona status "Draft" e salva
  Then o post é criado com status DRAFT
  And o post não aparece na listagem pública nem seria indexável

Scenario: Autor visita a própria URL de rascunho
  Given um post DRAFT pertencente ao usuário logado
  When esse usuário acessa /post/<slug-do-rascunho>
  Then a página carrega normalmente com um aviso "Draft — só você vê isso"

Scenario: Outra pessoa tenta ver o rascunho de alguém
  Given um post DRAFT pertencente ao usuário A
  When o usuário B (ou um visitante não logado) acessa /post/<slug-do-rascunho>
  Then a resposta é 404, igual ao comportamento atual pra slug inexistente
```

## 4. Out of scope

- Workflow de aprovação/revisão (`IN_REVIEW`, papéis) — Fase 4 do roadmap.
- Indicador visual de status na listagem pública (posts não-`PUBLISHED` já não aparecem lá, `docs/features/004-post-status/`).
- Corrigir o status HTTP 200-vs-404 de streaming (`docs/features/009-post-404-status/`, aceito como limitação conhecida) — este item usa o mesmo `notFound()` de sempre, sem mudar esse comportamento.

## 5. Assumptions / Open questions

- Owner-preview usa `ctx.user` que `publicProcedure` já popula opcionalmente quando há sessão válida (`src/server/createRouter.ts`) — não precisa de novo tipo de procedure nem de rota separada de preview.
- Sem `[NEEDS CLARIFICATION:]`.

## 6. Dependências

Nenhuma. Independente de `012-my-posts-panel` (mas ambas compõem a Fase 2 do roadmap).

## 7. Clarifications

_(vazio)_

---

*Spec NÃO contém: decisão de stack, nomes de função, schema de DB, ordem de tasks. Isso vai pro `plan.md`.*
