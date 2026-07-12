# Feature 003 — Paginação da listagem de posts

> **Spec:** o quê e o porquê. Sem decisão de tecnologia.
> **US relacionada(s):** nenhuma US formal ainda — item de checklist em `docs/roadmap.md` Fase 1 ("paginação").
> **Status:** done (2026-07-12 — verificado ao vivo contra Postgres real via `curl` na rota `post.readRecent`; `tsc --noEmit` e `vitest` 115/115 verdes)
> **Data de abertura:** 2026-07-12

## 1. Problema (do PRD/UST)

`post.readRecent` (`src/server/features/post/domain/readRecent.ts`) sempre retorna os 30 posts mais recentes, sem forma de pedir a próxima página. Passado o 30º post, o resto do conteúdo fica inacessível pela home — o blog "some" conteúdo assim que cresce. É o primeiro item não feito da Fase 1 do roadmap (`docs/roadmap.md` linha 119) e o mais fundamental, porque os outros itens da fase (tags, categorias, capa, tempo de leitura, relacionados) são aditivos, mas este bloqueia acesso a posts existentes.

## 2. Critério de sucesso observável

- [ ] A home mostra a primeira página de posts (mais recentes primeiro), igual hoje.
- [ ] Existe uma forma de pedir a próxima página de posts sem repetir nem pular nenhum post, mesmo se um post novo for criado entre uma página e outra.
- [ ] Quando não há mais posts, fica claro que chegou ao fim (não existe forma de pedir "mais uma página vazia" indefinidamente).
- [ ] O contrato de paginação (parâmetros de entrada/saída) é o mesmo usado por qualquer client futuro do endpoint — não é uma solução amarrada só ao componente atual da home.

## 3. Cenários (Gherkin)

```gherkin
Scenario: Primeira página sem cursor
  Given existem mais posts do que o tamanho de uma página
  When a listagem de posts é pedida sem cursor
  Then os posts mais recentes são retornados, no tamanho de uma página
  And um cursor pra próxima página é retornado

Scenario: Página seguinte via cursor
  Given uma primeira página já foi lida e retornou um cursor
  When a listagem é pedida de novo com esse cursor
  Then os posts retornados são exatamente os seguintes, sem repetir nem pular nenhum

Scenario: Última página
  Given o cursor aponta pro penúltimo post mais antigo
  When a listagem é pedida com esse cursor
  Then os posts restantes são retornados
  And nenhum cursor de próxima página é retornado

Scenario: Post novo criado entre páginas não duplica nem desloca resultado
  Given uma primeira página já foi lida
  When um post novo é criado
  And a segunda página é pedida com o cursor da primeira
  Then a segunda página continua a partir de onde a primeira parou, sem repetir o post que agora seria o novo 1º da lista
```

## 4. Out of scope

- **Filtro por tag/categoria/status na paginação.** Não existem esses campos ainda (Fase 1 ainda não implementou); paginação aqui é só sobre a listagem cronológica atual.
- **Paginação de outras listagens** (posts de um usuário, comentários). Só `post.readRecent`, que é o único caso com o limite hardcoded de 30 hoje.
- **UI de números de página.** Ver `plan.md` — decisão de cursor-based não pede essa UI.
- **Refatoração de front-end.** Por diretriz do dono do produto (2026-07-11), mudanças de front ficam mínimas/aditivas até a refatoração de front planejada acontecer — ver `docs/roadmap.md` § Nota de sequenciamento. O componente novo aqui segue o padrão já existente (`page.client.tsx` com `trpc` client hook, igual `CommentArea`), sem introduzir gerenciador de estado novo.

## 5. Assumptions / Open questions

- Premissa: paginação é **cursor-based**, não offset — decisão tomada com o dono do produto (2026-07-11) porque é mais estável sob concorrência (não duplica/pula post se a lista mudar entre requisições) e não empurra pra uma UI de números de página, mantendo a mudança de front mínima.
- Premissa: tamanho de página default é menor que os 30 atuais (ver `plan.md` § decisão) — 30 era um limite de segurança, não um tamanho de página pensado pra UX de "carregar mais".

## 6. Dependências

- Nenhuma feature bloqueante. Não depende de `docs/features/002-post-slug/` nem `001-auth-hardening/`.
- `docs/roadmap.md` Fase 1 — primeiro item pendente da fase.

## 7. Clarifications

*(vazio — única decisão de design (cursor vs offset) já resolvida com o dono do produto antes de abrir esta spec.)*

---

*Spec NÃO contém: decisão de stack, nomes de função, schema de DB, ordem de tasks. Isso vai pro `plan.md`.*
