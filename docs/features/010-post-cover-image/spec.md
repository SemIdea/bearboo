# Feature 010 — Imagem de capa do post

> **Spec:** o quê e o porquê. Sem decisão de tecnologia.
> **US relacionada(s):** nenhuma US formal em `docs/ust.md` — item do roadmap (`docs/roadmap.md` Fase 1 "Blog público bem feito").
> **Status:** done (2026-07-12 — `tsc --noEmit` limpo, `vitest` 150/150 verdes incl. 3 testes novos; `next build` sem erro novo (baseline conhecido: só o erro pré-existente de `/`); migration gerada via `prisma migrate diff` schema-to-schema, não aplicada contra Postgres ao vivo — sandbox sem `DATABASE_URL` funcional, mesma limitação já documentada em `008-trpc-error-link`)
> **Data de abertura:** 2026-07-12

## 1. Problema (do PRD/UST)

`docs/roadmap.md` Fase 1 lista "imagem de capa" como funcionalidade faltante do blog público (`[ ] imagem de capa (sem campo no schema)`), e Fase 5 (SEO) já antecipa a falta (`Open Graph (title/description/type — sem ogImageUrl, pois não há imagem de capa)`). Hoje não existe nenhum jeito de associar uma imagem de capa a um post.

## 2. Critério de sucesso observável

- [x] Ao criar ou editar um post, é possível informar a URL de uma imagem de capa (campo opcional).
- [x] A imagem de capa aparece no card do post na listagem (`postFeed`) e no topo da página do post, quando presente.
- [x] Posts sem imagem de capa continuam funcionando normalmente (campo é opcional em todo o fluxo).

## 3. Cenários

```gherkin
Scenario: Post criado com imagem de capa
  Given um usuário autenticado preenchendo o formulário de criar post
  When ele informa título, conteúdo e uma URL de imagem de capa válida
  Then o post é criado com a imagem de capa
  And a imagem aparece no card do post na listagem e na página do post

Scenario: Post sem imagem de capa
  Given um usuário criando um post sem informar imagem de capa
  When o post é criado
  Then o post é criado normalmente, sem imagem
  And nenhum espaço quebrado aparece no card/página onde a imagem iria
```

## 4. Out of scope

- Upload de arquivo de imagem (Fase 2 do roadmap, "upload de imagem de capa" — exige storage/CDN, item separado maior).
- `ogImageUrl`/Open Graph usando a capa (Fase 5, SEO — depende deste campo existir primeiro, mas o wiring de metadata fica pra depois).
- Validação de que a URL aponta pra uma imagem de verdade (content-type, dimensões) — só validação de formato de URL no schema.
- `next/image`/otimização de imagem — repo não usa `next/image` hoje (sem `images.remotePatterns` configurado); usar `<img>` simples é consistente com o padrão atual e evita configurar allowlist de domínio externo pra imagem arbitrária do usuário.

## 5. Assumptions / Open questions

- Campo é uma URL simples (`coverImageUrl: string | null`), não upload — decidido no gate desta sessão (2026-07-12): "só backend" foi a opção padrão, mas o dono pediu UI básica também; upload de arquivo continua fora de escopo (item separado do roadmap, Fase 2).
- Sem `[NEEDS CLARIFICATION:]`.

## 6. Dependências

Nenhuma. Independente de `007-posts-relacionados` e `009-post-404-status`.

## 7. Clarifications

_(vazio)_

---

*Spec NÃO contém: decisão de stack, nomes de função, schema de DB, ordem de tasks. Isso vai pro `plan.md`.*
