# Feature 002 — Visualizar post por slug

> **Spec:** o quê e o porquê. Sem decisão de tecnologia.
> **US relacionada(s):** US-006 (Criar e ler posts) — amendada com cenários de leitura por slug.
> **Status:** in_progress (código escrito, `tsc`/`vitest` verdes; falta aplicar a migration num Postgres real + checar no browser — ver `tasks.md`)
> **Data de abertura:** 2026-07-11

## 1. Problema (do PRD/UST)

Hoje a página pública de um post vive em `/post/[id]` — a URL expõe um UUID sem sentido pro leitor e não é amigável pra compartilhar/indexar (`docs/prd.md` linha 70, `docs/roadmap.md` Fase 1: "hoje a rota usa `id`, não slug"). O leitor do blog (persona ainda `[A DEFINIR]` em `ust.md`, mas o objetivo do PRD é uma plataforma de publicação técnica apresentável) precisa de uma URL legível (`/post/como-fiz-x`) tanto pra navegação quanto porque a Fase 5 (SEO — canonical URL, compartilhamento) depende de slug existir primeiro.

## 2. Critério de sucesso observável

- [ ] Abrir `/post/<slug-do-post>` renderiza o post correto (título, conteúdo, autor, comentários).
- [ ] Todo post novo criado recebe um slug derivado do título, único no banco, sem intervenção do autor.
- [ ] Todo link interno que aponta pra um post (feed da home, lista de posts do perfil, lista de comentários do perfil, redirect pós-criação) usa a URL por slug — nenhum link quebrado apontando pra `/post/<uuid>`.
- [ ] Dois posts com o mesmo título não colidem — o segundo recebe um slug com sufixo (`titulo`, `titulo-2`, ...).

## 3. Cenários (Gherkin, herda da US-006)

```gherkin
Scenario: Ler post por slug
  Given um post existente com slug "como-fiz-x"
  When o post é lido pelo slug "como-fiz-x"
  Then os dados do post são retornados

Scenario: Ler post por slug inexistente
  Given um slug que não corresponde a nenhum post
  When o post é lido por esse slug
  Then a operação é rejeitada com "post não encontrado"

Scenario: Criar post gera slug derivado do título
  Given um usuário autenticado e verificado
  When ele cria um post com título "Como fiz X"
  Then o post persistido tem um slug no formato "como-fiz-x"

Scenario: Título duplicado gera slug com sufixo
  Given um post existente com slug "como-fiz-x"
  When um novo post é criado com o mesmo título "Como fiz X"
  Then o novo post recebe o slug "como-fiz-x-2"
```

## 4. Out of scope

- **Editar/alterar o slug manualmente pelo autor.** Slug é imutável após a criação nesta feature — evita quebrar links já compartilhados. Se o produto quiser permitir edição, é feature nova com redirect (ligada à Fase 5 do roadmap: "redirect quando slug mudar").
- **Redirect de slug antigo → novo.** Não existe alteração de slug nesta feature, então não há "antigo" a redirecionar. Fica pra Fase 5.
- **Paginação, tags, categorias, imagem de capa, tempo de leitura, posts relacionados.** Outros itens da Fase 1 do roadmap, não tocados aqui.
- **Rota `/post/edit/[id]`.** Continua por `id` — é fluxo autenticado de dono do post, não a URL pública compartilhável.
- **Migração de slugs de posts já existentes no banco de produção.** Não há banco de produção hoje (roadmap Fase 10 não iniciada); a migração só precisa lidar com dados de dev/seed.

## 5. Assumptions / Open questions

- Premissa: colisão de slug é resolvida por sufixo numérico incremental (`titulo`, `titulo-2`, `titulo-3`...) — é o padrão mais simples e prevvisível, sem precisar de sufixo aleatório.
- Premissa: slug é gerado automaticamente no `create`, sem input do usuário no formulário — menor superfície, consistente com o form atual (`title`/`content` apenas).
- Premissa: o link comentário→post na página de perfil (`user/[id]/page.client.tsx`, hoje usa `comment.postId`) passa a precisar do slug do post — isso estende `user.readComments` pra incluir o slug do post relacionado. Alternativa rejeitada: manter esse link específico apontando pro `id` antigo (violaria o critério de sucesso "nenhum link quebrado" e deixaria uma rota morta viva só por esse caso).

## 6. Dependências

- US-006 (done) — a leitura por `id` já existe e continua existindo internamente (edição, revalidate); esta feature adiciona a leitura por slug como caminho público.
- `docs/roadmap.md` Fase 1 — este item é o primeiro dos pendentes ("visualizar post por slug").
- `docs/ach.md` § 3.1 (Adapter-like, Model) — a implementação segue os padrões já estabelecidos (`uidGenerator`, `UserModel.readByEmail`).

## 7. Clarifications

*(vazio — discovery convergiu sem pergunta irredutível na rodada 1/2.)*

---

*Spec NÃO contém: decisão de stack, nomes de função, schema de DB, ordem de tasks. Isso vai pro `plan.md`.*
