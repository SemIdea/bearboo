# Feature 005 — Tags e categorias

> **Spec:** o quê e o porquê. Sem decisão de tecnologia.
> **US relacionada(s):** nenhuma US formal ainda — itens de checklist em `docs/roadmap.md` Fase 1 ("tags", "categorias") e critério de conclusão da fase ("navegar por tags/categorias").
> **Status:** done (2026-07-12 — verificado ao vivo contra Postgres real via `curl` em `category.readAll`/`tag.readAll`/`post.readRecent` (filtro por `categoryId`/`tagId`)/`post.readBySlug`; `create` de categoria/tag confirmado rejeitando requisição sem sessão (401); `tsc --noEmit` e `vitest` 142/142 verdes)
> **Data de abertura:** 2026-07-12

## 1. Problema (do PRD/UST)

`Post` não tem forma de ser classificado. O roadmap já lista `Category`, `Tag` (e a tabela de junção `PostTag`) em "Modelos principais" da Fase 1, e o critério de conclusão da fase inclui "navegar por tags/categorias" — mas nenhum dos dois campos existe hoje (`prisma/schema.prisma`). Sem eles, todo post fica numa lista cronológica única, sem forma de agrupar por assunto nem de filtrar a listagem pública por tema.

## 2. Critério de sucesso observável

- [x] Um post pode ser criado/atualizado com uma categoria (`categoryId`, opcional) e uma lista de tags (`tagIds`, opcional) já existentes — testado (`vitest`) e verificado ao vivo via `curl`.
- [x] `category.readAll`/`tag.readAll` listam as categorias/tags existentes (base pra um seletor de UI futuro) — verificado ao vivo via `curl` (lista pública, sem sessão).
- [x] Criar uma categoria/tag com um `name` já usado retorna a categoria/tag existente em vez de duplicar ou falhar — testado (`vitest`, idempotência por nome).
- [x] `post.readRecent` aceita `categoryId`/`tagId` opcionais e retorna só os posts publicados daquele filtro, respeitando a mesma paginação já existente (`docs/features/003-post-pagination/`) — testado e verificado ao vivo.
- [x] `post.readBySlug` retorna a categoria (se houver) e as tags do post junto com o resto do post — testado e verificado ao vivo.

## 3. Cenários (Gherkin)

```gherkin
Scenario: Post criado com categoria e tags existentes
  Given uma categoria e duas tags já cadastradas
  When um usuário autenticado cria um post informando categoryId e tagIds
  Then o post lido de volta mostra a categoria e as duas tags associadas

Scenario: Post criado sem categoria nem tags continua funcionando
  Given nenhuma categoria/tag informada
  When um usuário autenticado cria um post normalmente
  Then o post é criado como hoje, sem categoria e sem tags

Scenario: Categoria com nome repetido não duplica
  Given uma categoria "Backend" já existe
  When alguém tenta criar outra categoria "Backend"
  Then a categoria existente é retornada, nenhuma nova linha é criada

Scenario: Listagem pública filtrada por categoria
  Given 3 posts publicados, 2 na categoria "Backend" e 1 sem categoria
  When a listagem paginada é pedida com categoryId da categoria "Backend"
  Then só os 2 posts dessa categoria aparecem

Scenario: Listagem pública filtrada por tag
  Given 2 posts publicados com a tag "prisma" e 1 sem essa tag
  When a listagem paginada é pedida com tagId dessa tag
  Then só os 2 posts com essa tag aparecem

Scenario: Dono troca as tags do próprio post
  Given um post do usuário autenticado já tem 2 tags
  When esse usuário chama update com uma lista nova de tagIds
  Then o post passa a ter exatamente as tags da lista nova (substituição, não soma)
```

## 4. Out of scope

- **UI de seletor/gerenciamento de tags e categorias.** Mesma diretriz de `docs/features/004-post-status/spec.md` § 4 — mudanças de front ficam mínimas até a refatoração de front planejada (`docs/roadmap.md` § Nota de sequenciamento). `category.create`/`tag.create` ficam chamáveis via API, sem tela dedicada ainda.
- **Gate de permissão por papel em quem cria categoria/tag.** Não existe `UserRole` (Fase 3, não iniciada) — mesmo raciocínio já aplicado em `004-post-status/plan.md` § 4: qualquer usuário verificado pode criar categoria/tag, igual pode criar post.
- **`update`/`delete` de categoria e tag.** Só `create` (idempotente por nome) e `readAll` nesta feature — YAGNI; entra quando o admin/CMS (Fase 2) precisar editar a taxonomia.
- **Filtro de categoria/tag em `user.readPosts`** (lista pública de posts de um autor). Fica só em `post.readRecent` (a listagem da home) nesta feature; estender a outras listagens é aditivo e não bloqueia o critério de conclusão da Fase 1.
- **Múltiplas categorias por post.** O roadmap só nomeia `PostTag` como tabela de junção (não `PostCategory`) — resolvido por leitura direta do roadmap: categoria é `Post.categoryId` opcional (N:1), só tag é N:N.
- **Criação implícita de tag/categoria a partir de texto livre no `post.create`.** `tagIds`/`categoryId` referenciam entidades já existentes por ID, no mesmo padrão que `comment.create` referencia um `postId` já existente (não cria o post junto). Criar-se-a-não-existir fica pra quando houver UI de autocomplete.

## 5. Assumptions / Open questions

- Premissa: categoria é relação N:1 (`Post.categoryId?`), tag é relação N:N via `PostTag` — resolvido por leitura de `docs/roadmap.md` § Fase 1 "Modelos principais", que já nomeia `PostTag` mas não `PostCategory`.
- Premissa: criar categoria/tag com nome repetido é idempotente (retorna a existente) em vez de erro — decisão de design registrada em `plan.md` § 4, não há precedente direto no código pra esse caso específico, mas segue o espírito de "não vazar erro de constraint do Prisma pro usuário" já observado em outras partes do domain.
- Premissa: sem pré-validação de existência de `categoryId`/`tagIds` no domain antes de gravar — mesmo padrão já aceito em `comment/domain/create.ts` (não valida `postId` antes de criar o comentário); débito pré-existente, não piorado nem corrigido por esta feature (regra 15 forward-only).

## 6. Dependências

- Nenhuma feature bloqueante. Não depende de `002`/`003`/`004`, mas estende o mesmo `post.readRecent` que `003` criou (filtro novo na mesma query) e o mesmo `Post` que `004` já deu `status`.
- Bloqueia (parcialmente): Fase 2 (Admin/CMS) vai precisar de tela de gerenciar categorias/tags e de `update`/`delete` nelas.

## 7. Clarifications

*(vazio — discovery convergiu sem decisão irredutível; ver `plan.md` § 4 para o raciocínio de cada decisão.)*

---

*Spec NÃO contém: decisão de stack, nomes de função, schema de DB, ordem de tasks. Isso vai pro `plan.md`.*
