# Feature 012 — Painel "meus posts"

> **Spec:** o quê e o porquê. Sem decisão de tecnologia.
> **US relacionada(s):** nenhuma US formal em `docs/ust.md` — item do roadmap (`docs/roadmap.md` Fase 2 "Admin/CMS").
> **Status:** done (2026-07-12 — `tsc --noEmit` limpo, `vitest` 163/163 verdes; `next build --debug-prerender` sem erro novo; sem verificação em browser real — sem ferramenta de automação disponível neste ambiente)
> **Data de abertura:** 2026-07-12

## 1. Problema (do PRD/UST)

Hoje não existe nenhum jeito de o autor ver a própria lista completa de posts (incluindo `DRAFT`/`ARCHIVED`) — a única listagem existente por usuário (`user.readPosts`, usada na página pública do autor) filtra por `PUBLISHED`, porque é uma página pública. Sem essa listagem, o autor só descobre que tem um rascunho esquecido se lembrar do slug de cabeça. `docs/roadmap.md` Fase 2 lista "listagem de posts no admin" e "filtros por status/categoria/tag" como pendentes.

**Escopo decidido no gate desta sessão (2026-07-12):** como papéis (`ADMIN`/`EDITOR`/`AUTHOR`, Fase 3 do roadmap) ainda não existem, a única regra de autorização hoje é "dono edita/deleta o próprio post" (`docs/features/*/domain/{update,delete}.ts`). Um painel que listasse posts de **todos** os usuários não teria como restringir quem vê o quê. Por isso este painel é escopado como **"meus posts"** — cada usuário logado só vê os próprios posts, em qualquer status. Quando a Fase 3 trouxer roles, um `ADMIN` pode ganhar acesso a ver posts de outros usuários como extensão desta mesma tela.

## 2. Critério de sucesso observável

- [x] Usuário logado acessa uma página que lista **todos** os próprios posts, independente de status.
- [x] A lista pode ser filtrada por status, categoria e tag.
- [x] Usuário não vê posts de outros usuários nessa lista, mesmo alterando os filtros.
- [x] Visitante não logado é redirecionado pro login ao tentar acessar a página.

## 3. Cenários

```gherkin
Scenario: Autor vê todos os próprios posts
  Given um usuário autenticado com posts DRAFT, PUBLISHED e ARCHIVED
  When ele acessa o painel "meus posts"
  Then vê os 3 posts, independente de status

Scenario: Filtro por status
  Given um usuário autenticado com posts em status diferentes
  When ele filtra por "Draft"
  Then só os posts DRAFT dele aparecem

Scenario: Isolamento entre usuários
  Given dois usuários autenticados, cada um com posts próprios
  When o usuário A acessa o painel
  Then só os posts do usuário A aparecem, nunca os do usuário B

Scenario: Acesso sem sessão
  Given um visitante sem sessão ativa
  When ele tenta acessar o painel "meus posts"
  Then é redirecionado pra /auth/login
```

## 4. Out of scope

- Ver posts de outros usuários (mesmo como admin) — bloqueado até Fase 3 (roles) existir.
- Paginação — volume esperado por autor é baixo (blog pessoal); lista completa sem cursor, revisitar se isso deixar de ser verdade.
- Ações em lote (arquivar vários de uma vez, etc.).
- Edição inline na lista — link pra `/post/edit/[id]` já existente é suficiente.

## 5. Assumptions / Open questions

- Sem `[NEEDS CLARIFICATION:]`.

## 6. Dependências

Nenhuma. Independente de `011-post-status-preview` (mas ambas compõem a Fase 2 do roadmap).

## 7. Clarifications

_(vazio)_

---

*Spec NÃO contém: decisão de stack, nomes de função, schema de DB, ordem de tasks. Isso vai pro `plan.md`.*
