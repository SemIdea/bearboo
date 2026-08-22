# Roadmap — Blog/CMS nível pleno

## Progresso geral

> Atualizado em 2026-06-30, a partir de auditoria de código (não de memória) na adoção do AFM. Cada fase abaixo tem checklist próprio nas seções correspondentes — isto é só o resumo executivo. Reconciliar esta tabela sempre que uma tarefa mudar de estado (ver `CLAUDE.md` § Doutrina).

| Fase | Status | Nota |
| --- | --- | --- |
| 0 — Organização inicial | ✅ Concluída | — |
| 1 — Blog público bem feito | ✅ Concluída (com 1 pendência residual) | todos os itens do checklist implementados: slug, paginação, status/publicação, tags/categorias (`docs/features/002` a `005`), tempo de leitura (`006`), posts relacionados (`007`), imagem de capa (`010`); pendência residual: status HTTP de `/post/[slug]` continua `200` em vez de `404` pra slug inexistente — limitação de framework (Cache Components), aceita como conhecida por ora (`docs/features/009-post-404-status/`) |
| 2 — Admin/CMS | ✅ Concluída (com 1 pendência adiada) | seletor de status, preview de rascunho na URL real (`docs/features/011-post-status-preview/`), painel "meus posts" com filtros por status/categoria/tag (`docs/features/012-my-posts-panel/`, escopado sem roles — ver nota na fase); pendência adiada: upload de arquivo de imagem de capa vai pra Fase 8 (decisão do dono, 2026-07-12) — capa via URL já existe (`docs/features/010-post-cover-image/`) |
| 3 — Autenticação e permissões | ✅ Concluída (com 1 pendência adiada pra Fase 4) | `docs/features/013-role-based-permissions/`: papéis ADMIN/EDITOR/AUTHOR, `roleProcedure`, `src/lib/permissions/` (matrix); pré-requisito `001-auth-hardening` (2026-07-12) satisfeito. Pendência (restringir publish/archive a Admin/Editor) fechada pela Fase 4 |
| 4 — Workflow editorial | ✅ Concluída (com 1 pendência adiada) | `docs/features/014-post-review-workflow/`: `IN_REVIEW`/`SCHEDULED`, enviar/aprovar/rejeitar (motivo obrigatório)/publicar direto/agendar/arquivar, `PostReviewComment`; restrição de publish/archive a Admin/Editor (fecha a pendência da Fase 3); agendamento via checagem lazy no read, sem scheduler novo. Pendência adiada: histórico de diffs de edição (`PostRevision`) — mesmo padrão da Fase 2, que adiou upload de imagem pra Fase 8 |
| 5 — SEO e publicação profissional | ✅ Concluída | `docs/features/015-seo-metadata/`: sitemap.xml, robots.txt, RSS feed, canonical, Twitter Card, schema.org — todos computados de campos já existentes, sem migration. `docs/features/018-seo-overrides-slug-redirect/`: campos editáveis de override de SEO (`seoTitle`/`seoDescription`/`canonicalUrl`) e slug editável com redirect 301 automático (`previousSlug`, 1 nível de histórico) — as 2 pendências que ficavam essa fase parcial |
| 6 — Busca e descoberta | ✅ Concluída | `docs/features/016-search-content/`: busca por título/conteúdo via `contains`/`insensitive` (não `tsvector` nativo — ADR-0011), autocomplete no header; filtro por tag/categoria e posts relacionados já existiam de fases anteriores. `docs/features/019-search-sort-by-views/`: ordenação por mais acessado (`sortBy: "mostViewed"`), desbloqueada pelo `Post.viewCount` da Fase 7 — a pendência que deixava essa fase parcial |
| 7 — Analytics interno | ✅ Concluída | `docs/features/017-post-view-analytics/`: registrar view (dedup por visitante 24h via Redis/cookie, ADR-0013), contar total, posts mais acessados, dashboard Admin/Editor. `docs/features/020-view-analytics-breakdown/`: contagem por período (7/30 dias), origem de tráfego e navegador/SO — pendências que deixavam a fase parcial, fechadas com retenção de 30 dias (deleção lazy) e sem persistir IP |
| 8 — Upload e gerenciamento de mídia | ✅ Concluída (com 1 pendência adiada) | `docs/features/021-media-upload/`: upload real de imagem (FormData via tRPC, `ADR-0015`), biblioteca de mídia, apagar (dono ou `media:deleteAny`), alt text, validação de formato/tamanho, capa de post a partir de mídia enviada. Pendência adiada: compressão/otimização de imagem (explicitamente opcional no roadmap; some sozinha se o storage final for um CDN de imagem) |
| 9 — Qualidade de produção | 🟡 Parcial | Zod, migrations, seed, alguns testes/error pages já existem; rate limiting em memória cobre login/registro/reset/refresh (`docs/features/001-auth-hardening/`) — não é rate limiting geral de toda a API; falta logs estruturados, cobertura de teste (~8.6% hoje) |
| 10 — CI/CD e deploy | ⬜ Não iniciada | sem `.github/workflows/`, sem deploy configurado |
| 11 — Observabilidade | ⬜ Não iniciada | sem `/api/health`, sem tracing/métricas |

**Fora do roadmap numerado, concluído (2026-07-12):** `docs/features/001-auth-hardening/` — hardening de segurança da sessão/auth atual (pré-requisito da Fase 3, não uma fase nova). Camada de aplicação fechada; hardening de infra (TLS/HTTPS via nginx+certificado, remoção de credenciais hardcoded do `docker-compose.yml`, porta do Postgres exposta ao host sem necessidade) foi escopado fora desta rodada — natureza operacional diferente (depende de domínio/certificado, não testável por `vitest`), decisão do dono em 2026-07-12 (`docs/features/001-auth-hardening/spec.md` § 7). Candidato natural: Fase 10 (CI/CD e deploy) quando essa fase começar.

**Nota de sequenciamento (2026-07-11):** o back-end já passou por uma refatoração grande (models com delegate pluggável, camada domain/procedure, etc. — ver `docs/adr/`). Uma refatoração equivalente está planejada para o front-end, mas o desenho ainda não existe. Até lá, o foco é entregar funcionalidades de **back-end** (ex.: paginação); mudanças de front continuam aceitas quando a feature exige (ex.: renderizar os controles de paginação), mas evitando decisão estrutural nova do lado do front (padrão de state management, nova camada de componentes, reorganização de pastas) que a futura refatoração teria que desfazer.

---

## Objetivo final

Construir uma **plataforma de publicação técnica** com:

* blog público;
* painel administrativo;
* autenticação;
* permissões;
* fluxo editorial;
* SEO;
* analytics interno;
* busca;
* testes;
* Docker;
* CI/CD;
* deploy.

A ideia não é fazer “mais um blog”, mas sim uma aplicação que mostre que você sabe construir, organizar, proteger, publicar e manter um sistema real.

## Fase 0 — Organização inicial ✅ Concluída

### Objetivo

Transformar o projeto atual em uma base minimamente organizada para crescer.

### Tarefas

* [x] revisar o CRUD atual;
* [x] definir stack final;
* [x] organizar estrutura de pastas;
* [x] criar README inicial;
* [x] configurar `.env.example`;
* [x] configurar Docker com PostgreSQL;
* [x] configurar Prisma;
* [x] configurar lint/format;
* [x] configurar scripts básicos.

### Stack sugerida

> **Decisão (2026-06-30, ver `docs/adr/0005-manter-auth-propria.md`):** Auth.js/Better Auth **não foi adotado** — a auth própria já implementada é mantida, com hardening incremental. Playwright/GitHub Actions também não foram adotados até aqui (`vitest` sem CI).

```txt
Next.js
TypeScript
PostgreSQL
Prisma
Zod
Auth.js ou Better Auth
Docker
Vitest
Playwright
GitHub Actions
```

### Estrutura inicial sugerida

```txt
src/
  app/
    (public)/
    admin/
    api/

  modules/
    post/
    auth/
    user/
    media/
    analytics/
```

### Critério de conclusão

Essa fase está pronta quando outra pessoa consegue clonar o projeto, rodar um comando e subir a aplicação localmente.

Exemplo:

```bash
docker compose up -d
pnpm install
pnpm dev
```

## Fase 1 — Blog público bem feito ✅ Concluída (com 1 pendência residual)

### Objetivo

Ter a parte pública do blog funcionando bem.

### Funcionalidades

* [x] listar posts publicados (`readRecent`, paginado, filtrado por `status: PUBLISHED` — `docs/features/004-post-status/`);
* [x] visualizar post por slug — código escrito e verificado (`docs/features/002-post-slug/`, rota pública `/post/[slug]`, `Post.slug` único gerado no `create` via `src/lib/slug/`); `tsc --noEmit` e `vitest` (111/111) verdes; **2026-07-11: migration aplicada num Postgres real e `/post/<slug>` testado ao vivo no browser** — fechado. Achado durante a verificação: seed (`prisma/seed.ts`) estava quebrado por import de `src/lib/slug` incompatível com execução nativa `node`, e slug inexistente caía num `error.tsx` genérico em vez de `notFound()` — ambos corrigidos (commit `a620cde`). Pendência residual: status HTTP da resposta de `notFound()` continua `200`, não `404` (streaming/`Suspense` — ver `docs/ust.md` § Pendências Técnicas);
* [x] paginação — cursor-based (`Post.id`), tamanho de página default 10, `post.readRecent({ cursor?, limit? })` retorna `{ posts, nextCursor }`; front (`postFeed.client.tsx`) tem botão "Carregar mais" (`docs/features/003-post-pagination/`);
* [x] status do post — `enum PostStatus { DRAFT PUBLISHED ARCHIVED }`, default `PUBLISHED` (decidido no domain, não no banco); `post.create`/`post.update` aceitam `status` opcional; leituras públicas (`readRecent`, `user.readPosts`, `readBySlug`) só expõem `PUBLISHED` (`docs/features/004-post-status/`). Sem UI de seletor de status ainda — fica pra Fase 2 (Admin/CMS);
* [x] tags — `Tag`/`PostTag` (N:N), features `tag.create`/`tag.readAll`; `post.create`/`post.update` aceitam `tagIds` opcionais; `post.readRecent` filtra por `tagId`, `post.readBySlug` retorna as tags do post (`docs/features/005-tags-categorias/`);
* [x] categorias — `Category` (`Post.categoryId?`, N:1), features `category.create`/`category.readAll`; `post.create`/`post.update` aceitam `categoryId` opcional; `post.readRecent` filtra por `categoryId`, `post.readBySlug` retorna a categoria do post (`docs/features/005-tags-categorias/`). Sem UI de seletor ainda — fica pra Fase 2 (Admin/CMS);
* [x] autor (post/comentário mostram o `user` relacionado);
* [x] imagem de capa — `Post.coverImageUrl?` (migration `add_post_cover_image`); `post.create`/`post.update` aceitam URL opcional (validada com `z.string().url()`); exibida no card da listagem e no topo da página do post (`<img>` simples, sem `next/image` — repo não usa, evita configurar `images.remotePatterns` pra URL arbitrária de usuário) (`docs/features/010-post-cover-image/`). Sem upload de arquivo — fica pra Fase 2 (Admin/CMS);
* [x] tempo estimado de leitura — `readingTimeMinutes` calculado on-the-fly a partir do `content` (200 palavras/minuto, mínimo 1 min), via `z.transform()` no schema de output de post; aparece em todo endpoint que retorna post (`create`, `read`, `readBySlug`, `update`, `revalidate`, `readRecent`, `user.readPosts`) sem tocar domain/model (`docs/features/006-tempo-leitura/`). Sem UI mostrando o valor ainda — fica pra depois da refatoração de front;
* [x] posts relacionados — `post.readRelated` (mesma categoria OU pelo menos uma tag em comum, exclui o próprio post, só `PUBLISHED`, ordena por mais recente); seção "Related posts" na página do post (`docs/features/007-posts-relacionados/`). Sem ranking ponderado — fica pra Fase 6 (busca/descoberta);
* [x] página pública do autor (`src/app/(half)/user/[id]/`).

### Modelos principais

```ts
User
Post
Category
Tag
PostTag
```

### Exemplo de status inicial do post

```ts
enum PostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

### Regras importantes

* somente posts `PUBLISHED` aparecem no blog público — implementado (`docs/features/004-post-status/`): `readRecent`, `user.readPosts` filtram na query, `readBySlug` trata post não-`PUBLISHED` como não encontrado;
* slug deve ser único;
* post arquivado não aparece em listagens públicas — implementado junto do item acima;
* post sem título não pode ser publicado;
* post sem conteúdo não pode ser publicado.

### Critério de conclusão

Essa fase está pronta quando o usuário consegue acessar o blog público, ver posts, navegar por tags/categorias e abrir posts individuais.

## Fase 2 — Admin/CMS próprio ✅ Concluída (com 1 pendência adiada)

### Objetivo

Criar um painel administrativo para gerenciar posts.

### Funcionalidades

* [x] login (existe, mas não há área `/admin` separada — é a auth geral);
* [x] criar post (`src/app/(half)/post/create/`);
* [x] editar post (`src/app/(half)/post/edit/[id]/`);
* [x] deletar post;
* [x] publicar post / salvar como rascunho / arquivar — seletor de status (`<select>`) nos formulários de criar/editar; `PostStatus` já existia no schema (`docs/features/004-post-status/`) (`docs/features/011-post-status-preview/`);
* [ ] upload de imagem de capa — adiado pra Fase 8 (decisão do dono, 2026-07-12): capa via URL já existe (`docs/features/010-post-cover-image/`), upload de arquivo real exige decisão de storage que pertence à Fase 8 (Upload e mídia), não faz sentido decidir só pro post;
* [x] preview antes de publicar — dono consegue abrir a URL real do próprio post (`/post/<slug>`) mesmo em DRAFT/ARCHIVED e vê um banner "só você vê isso"; qualquer outra pessoa continua recebendo 404 (`docs/features/011-post-status-preview/`);
* [x] listagem de posts no admin — escopado como painel **"meus posts"** (`/post/mine`), não site-wide: sem roles (Fase 3 ainda não iniciada), a única regra de autorização hoje é "dono edita/deleta o próprio post", então o painel só lista os posts do usuário logado; quando Fase 3 trouxer roles, um `ADMIN` pode ganhar acesso a ver posts de outros usuários como extensão desta tela (`docs/features/012-my-posts-panel/`);
* [x] filtros por status — painel "meus posts" filtra por qualquer status, não só `PUBLISHED` (`docs/features/012-my-posts-panel/`);
* [x] filtros por categoria/tag — idem, no mesmo painel (`docs/features/012-my-posts-panel/`).

### Telas

```txt
/admin/login
/admin/posts
/admin/posts/new
/admin/posts/:id/edit
/admin/posts/:id/preview
/admin/categories
/admin/tags
```

### Regras importantes

* usuário não autenticado não acessa `/admin`;
* somente usuário autorizado pode criar post;
* somente admin/editor pode publicar;
* autor pode editar os próprios rascunhos;
* post publicado precisa passar por validação.

### Critério de conclusão

Essa fase está pronta quando você consegue gerenciar todo o conteúdo pelo admin, sem mexer direto no banco.

## Fase 3 — Autenticação e permissões ✅ Concluída (com 1 pendência adiada pra Fase 4)

> **Pré-requisito (2026-06-30):** antes de empilhar papéis/permissões em cima da sessão atual, ver `docs/features/001-auth-hardening/spec.md` — sessão sem expiração no servidor, cookies sem `HttpOnly`/CSRF, sem rate limiting. Adicionar roles sobre essa base propagaria a mesma superfície de ataque pra cada papel novo. **Satisfeito (2026-07-12)** — `001-auth-hardening` done.
>
> **Implementação:** `docs/features/013-role-based-permissions/` (RF-08). "Publicar post"/"Arquivar post" na tabela abaixo continuam liberados pro Author sobre o próprio post nesta rodada — restringir a Admin/Editor exigiria o workflow de revisão da Fase 4 (`enviar pra revisão` → `aprovar`), que ainda não existe; aplicar a restrição sem esse workflow travaria qualquer Author sem Admin/Editor com posts presos em `DRAFT`. Decisão do dono, 2026-07-12 (`013-role-based-permissions/spec.md` § 4/§ 7).

### Objetivo

Adicionar controle real de acesso.

### Papéis sugeridos

```ts
enum UserRole {
  ADMIN
  EDITOR
  AUTHOR
}
```

### Permissões

| Ação                 | Admin | Editor | Author |
| -------------------- | ----: | -----: | -----: |
| Criar post           |   Sim |    Sim |    Sim |
| Editar qualquer post |   Sim |    Sim |    Não |
| Editar próprio post  |   Sim |    Sim |    Sim |
| Publicar post        |   Sim |    Sim |    Não |
| Arquivar post        |   Sim |    Sim |    Não |
| Gerenciar usuários   |   Sim |    Não |    Não |
| Gerenciar categorias |   Sim |    Sim |    Não |

### Tarefas

* [x] configurar autenticação (existe — sem papéis ainda, ver `docs/adr/0005-manter-auth-propria.md`);
* [x] proteger rotas admin — `roleProcedure(allowed)` (`src/server/createRouter.ts`) gateia `category.create` e `user.updateRole` a `ADMIN`/`EDITOR`; post edit/delete de terceiros liberado pra `ADMIN`/`EDITOR` via bypass de ownership (013);
* [x] criar middleware de autorização — `roleProcedure`, camada de guard tRPC (mesmo nível de `verifiedProcedure`), não `src/middleware.tsx`/Edge (checagem de role depende do DB, ver `013-role-based-permissions/spec.md` § 5);
* [x] criar helper de permissões — `src/lib/permissions/` (`MatrixPermission`, mesmo padrão adapter+implementation de `rateLimit`/`slug`);
* [x] adicionar testes das regras de permissão — `src/lib/permissions/__test__/matrix.ts` + testes de bypass em `post`/`category`/`user` procedures.

### Critério de conclusão

Essa fase está pronta quando o sistema impede ações indevidas tanto no frontend quanto no backend.

Ponto importante: **não confie só no botão escondido no frontend**. A regra precisa estar protegida no backend também.

## Fase 4 — Workflow editorial ✅ Concluída (com 1 pendência adiada)

> **Implementação:** `docs/features/014-post-review-workflow/` (RF-09). Fecha a pendência deixada pela Fase 3 (`013-role-based-permissions/spec.md` § 4): Author não publica/arquiva mais o próprio post direto, precisa passar pelo workflow de revisão. "Histórico de alterações" (diff de cada edição, `PostRevision`) fica adiado — decisão do dono, 2026-07-14 (`014-post-review-workflow/spec.md` § 4), mesmo padrão da Fase 2 (upload de imagem adiado pra Fase 8).

### Objetivo

Deixar o blog mais próximo de uma plataforma real de publicação.

### Novos status

```ts
enum PostStatus {
  DRAFT
  IN_REVIEW
  SCHEDULED
  PUBLISHED
  ARCHIVED
}
```

### Funcionalidades

* [x] enviar post para revisão — `post.submitForReview` (dono, só a partir de `DRAFT`);
* [x] aprovar post — `post.publish` a partir de `IN_REVIEW` (Admin/Editor);
* [x] rejeitar post — `post.reject`, motivo obrigatório, volta pra `DRAFT` (Admin/Editor);
* [x] publicar imediatamente — `post.publish` a partir de `DRAFT`, pulando revisão (Admin/Editor);
* [x] agendar publicação — `post.publish` com `scheduledAt` futuro → `SCHEDULED`; visibilidade pública resolvida via checagem lazy no read (`scheduledAt <= now`), sem scheduler/job novo;
* [x] arquivar post — `post.archive`, qualquer status exceto já arquivado (Admin/Editor; Author perde o bypass que tinha na Fase 3);
* [ ] histórico de alterações — adiado (diff de cada edição, `PostRevision`), ver nota acima;
* [x] comentários internos de revisão — `PostReviewComment`, lido via `post.readReviewComments` (dono do post ou Admin/Editor).

### Modelos novos

```ts
PostRevision
PostReviewComment
```

### Regras importantes

* author cria post como `DRAFT`;
* author pode enviar para `IN_REVIEW`;
* editor/admin pode aprovar;
* editor/admin pode publicar;
* post agendado só aparece publicamente depois da data;
* alterações importantes geram revisão.

### Critério de conclusão

Essa fase está pronta quando existe um fluxo real:

```txt
DRAFT -> IN_REVIEW -> SCHEDULED/PUBLISHED
```

Aqui o projeto começa a ficar com cara de pleno, porque deixa de ser CRUD e passa a ter **regra de negócio**.

## Fase 5 — SEO e publicação profissional ✅ Concluída

> **Implementação:** `docs/features/015-seo-metadata/` (RF-10). SEO automático — sitemap/robots/RSS/canonical/Twitter Card/schema.org — tudo computado dos campos já existentes do post (`title`/`content`/`slug`/`coverImageUrl`/`createdAt`/`updatedAt`), sem migration. Decisão do dono, 2026-07-14 (`015-seo-metadata/spec.md` § 4/§ 7): campos editáveis de override (`seoTitle`/`seoDescription`/`canonicalUrl`) e "slug amigável + redirect quando slug mudar" ficavam adiados por falta de demanda — fechadas em `docs/features/018-seo-overrides-slug-redirect/` (2026-07-18, US-015): slug agora é editável (Autor/Editor, mesma regra de `post.update`), com resolução de colisão via sufixo numérico (mesmo algoritmo do create) e redirect 301 automático do slug antigo pro novo (`Post.previousSlug`, 1 nível de histórico — ver `docs/ach.md § 3.1`); `seoTitle`/`seoDescription`/`canonicalUrl` editáveis no form de edição, com fallback pro comportamento computado quando vazios.

### Objetivo

Fazer o blog ser indexável e bem apresentado quando compartilhado.

### Funcionalidades

* [x] metadata dinâmica por post (`generateMetadata` em `src/app/(half)/post/[slug]/page.tsx`);
* [x] title e description por post;
* [x] Open Graph (title/description/type/image — `coverImageUrl` já wireado como `ogImageUrl`, `015`);
* [x] Twitter Card (`summary_large_image` com capa, `summary` sem capa, `015`);
* [x] canonical URL (self-referencial via `alternates.canonical` + `metadataBase`, `015`);
* [x] sitemap.xml dinâmico (`src/app/sitemap.ts`, só posts publicamente visíveis, `015`);
* [x] robots.txt (`src/app/robots.ts`, bloqueia rotas privadas, aponta pro sitemap, `015`);
* [x] RSS feed (`src/app/feed.xml/route.ts`, hand-rolled RSS 2.0, `015`);
* [x] schema.org para artigo (JSON-LD `Article` embutido em `PostView`, `015`);
* [x] slug amigável (editável pelo Autor/Editor, `018`);
* [x] redirect quando slug muda (301 automático via `previousSlug`, `018`).

### Campos novos no post

```ts
seoTitle
seoDescription
canonicalUrl
ogImageUrl
publishedAt
updatedAt
```

> **Nota (`015`, 2026-07-14):** nenhum desses campos foi adicionado ao schema nesta rodada — `ogImageUrl` reusa `coverImageUrl` (`010`) já existente; `seoTitle`/`seoDescription`/`canonicalUrl` como colunas editáveis ficaram adiados (sem pedido de UI pra customizar SEO diferente do conteúdo do post); `publishedAt` não foi necessário — `lastModified`/`pubDate` usam `updatedAt`/`createdAt` já existentes.
>
> **Nota (`018`, 2026-07-18):** `seoTitle`/`seoDescription`/`canonicalUrl` adicionados ao schema (nullable) + editáveis no form de edição do post; `Post.previousSlug` (nullable, `@unique`) adicionado pra suportar o redirect — não estava listado acima porque a decisão de como implementar o redirect (coluna única vs. tabela de histórico) só foi tomada nesta rodada (ver `018-seo-overrides-slug-redirect/plan.md § 4`).

### Regras importantes

* todo post publicado precisa ter metadata — ✅ (`generateMetadata` roda pra qualquer slug lido);
* slug antigo deve redirecionar para slug novo — ✅ (`018`, `previousSlug` + `post.readRedirectSlug` + `permanentRedirect` em `PostContent`; só 1 nível de histórico — ver `018-seo-overrides-slug-redirect/spec.md § 4`);
* sitemap só inclui posts publicados — ✅ (reusa `publicVisibilityFilter()` de `014`, inclui `SCHEDULED` já vencido);
* posts arquivados não entram no sitemap — ✅ (mesma regra).

### Critério de conclusão

Essa fase está pronta quando cada post tem SEO completo e pode ser compartilhado corretamente no Discord, LinkedIn, WhatsApp, etc. **Satisfeito** — itens automáticos (`015`) e slug amigável + redirect + overrides de SEO editáveis (`018`).

## Fase 6 — Busca e descoberta de conteúdo ✅ Concluída

> **Implementação:** `docs/features/016-search-content/` (RF-11). `post.search` busca por título/conteúdo (`contains`/`insensitive` do Prisma, não `tsvector` nativo — ver nota abaixo), com sugestões enquanto digita no header reusando o mesmo endpoint. `docs/features/019-search-sort-by-views/` (2026-07-18): `post.search` ganhou `sortBy: "recent" | "mostViewed"` (default `"recent"`, comportamento inalterado), com tiebreak por `id` no `orderBy` pra manter a paginação cursor-based determinística sob empate de `viewCount`; `<select>` em `/search` deixa o leitor escolher. Fechou a pendência que a Fase 7 (contador de views) desbloqueou.

### Objetivo

Melhorar navegação e descoberta dos posts.

### Funcionalidades

* [x] busca por título (`post.search`, `016`);
* [x] busca por conteúdo (`post.search`, `016`);
* [x] filtro por tag (já existia via `readRecent`/`readOwn`/`readRelated`; `016` estende o mesmo parâmetro pro `search`);
* [x] filtro por categoria (idem);
* [x] ordenação por mais recente (`readRecent` já ordena assim; `post.search` também tem isso como default — `019`);
* [x] ordenação por mais acessado (`post.search` com `sortBy: "mostViewed"`, `019-search-sort-by-views`, 2026-07-18 — desbloqueado pelo `Post.viewCount` da Fase 7);
* [x] posts relacionados (`post.readRelated`, já implementado na Fase 1 — `007-posts-relacionados`);
* [x] autocomplete opcional (`016` — sugestões no `SearchBox` do header, reusando `post.search` com `limit` pequeno, sem endpoint dedicado).

### Primeira implementação

Use PostgreSQL full-text search.

Depois, se quiser evoluir:

```txt
Meilisearch
Typesense
Elasticsearch
```

Mas eu começaria com Postgres mesmo. Menos infra, mais chance de terminar.

> **Nota (`016`, 2026-07-14):** a busca desta rodada usa `contains`/`insensitive` do Prisma, não `tsvector`/`ts_rank` nativo do Postgres. O test harness do projeto (`ADR-0011`) roda contra `prisma-mock`, um fake em JS sem parser SQL — `$queryRaw`/`to_tsvector` ficaria sem cobertura de teste automatizada (regra dura 1). Full-text search nativo (com ranking por relevância) fica pra quando existir teste de integração contra Postgres real (já cogitado em `ADR-0011` como candidato de Fase 9/10).

### Critério de conclusão

Essa fase está pronta quando o usuário consegue encontrar posts facilmente sem depender só da listagem cronológica.

## Fase 7 — Analytics interno ✅ Concluída

> **Implementação:** `docs/features/017-post-view-analytics/` (RF-12). `analytics.recordView` registra visualização de post público (dedup por visitante em 24h via cookie de primeira parte + Redis, `ADR-0013`), `analytics.readDashboard` (Admin/Editor) mostra total de views e ranking de mais acessados. `docs/features/020-view-analytics-breakdown/` (2026-07-18) fechou a pendência adiada em `017-post-view-analytics/spec.md § 4`: breakdown por período (últimos 7/30 dias), origem de tráfego (classificada do header `Referer`) e navegador/SO (classificado do `User-Agent` bruto). Decisão de retenção/privacidade (owner, 2026-07-18): eventos brutos retidos 30 dias com deleção lazy no read (sem cron), nenhum IP persistido.

### Objetivo

Criar um painel para acompanhar desempenho dos posts.

### Funcionalidades

* [x] registrar visualização de post (`017`, dedup por visitante em 24h);
* [x] contar views totais (`017`);
* [x] contar views por período (últimos 7/30 dias, `020-view-analytics-breakdown`, 2026-07-18);
* [x] posts mais acessados (`017`);
* [x] origem do tráfego (classificada do header `Referer` em direto/busca/social/outro, `020-view-analytics-breakdown`, 2026-07-18);
* [x] user agent (categorizado em navegador/SO por regex na leitura, sem lib nova, `020-view-analytics-breakdown`, 2026-07-18);
* [x] referrer (mesmo mecanismo do item "origem do tráfego" acima — um único breakdown, não dois separados);
* [x] dashboard administrativo (`/analytics`, restrito a Admin/Editor via `roleProcedure`, `017`).

### Modelo inicial

```ts
PostView {
  id
  postId
  visitorId
  ipHash
  userAgent
  referrer
  createdAt
}
```

> Esboço original da fase, anterior à implementação — mantido por histórico. O modelo real (`020-view-analytics-breakdown/plan.md § 3`) difere por decisão de privacidade do dono: sem `ipHash`/`visitorId` na tabela (dedup já resolvido via Redis, `ADR-0013`), `referrer` vira `referrerBucket` (classificado em DIRECT/SEARCH/SOCIAL/OTHER na escrita, não guarda a URL bruta), e retenção de 30 dias com deleção lazy no read.

### Dashboard

```txt
/admin/analytics
/admin/analytics/posts/:id
```

### Métricas

* total de views;
* views dos últimos 7 dias;
* views dos últimos 30 dias;
* posts mais acessados;
* fontes de tráfego;
* crescimento por período.

### Critério de conclusão

Essa fase está pronta quando você consegue abrir o admin e ver quais posts estão performando melhor.

Essa parte é muito boa para portfólio porque mostra que você pensa além do CRUD.

## Fase 8 — Upload e gerenciamento de mídia ✅ Concluída (com 1 pendência adiada)

> **Implementação:** `docs/features/021-media-upload/` (RF-13, US-016). Upload real de arquivo via `media.upload` (FormData pela mesma rota tRPC — `ADR-0015`), biblioteca "minha mídia" (`media.readOwn`, Admin/Editor veem de todo mundo), apagar (`media.delete`, dono ou `media:deleteAny`), alt text opcional, validação de formato (jpeg/png/webp/gif) e tamanho (5MB default) no boundary. Imagem de capa do post passa a poder vir de uma mídia enviada — a UI só preenche o `coverImageUrl` já existente (`010-post-cover-image`), sem migration em `Post`. Pendência adiada: compressão/otimização automática de imagem (decisão do dono, 2026-07-26, `021-media-upload/spec.md § 4`) — explicitamente opcional no roadmap; se o storage final vier a ser um CDN de imagem com transformação nativa (cogitado: Cloudinary), a compressão deixa de ser necessária e a pendência fecha sozinha.

### Objetivo

Permitir que o sistema lide com imagens de forma organizada.

### Funcionalidades

* [x] upload de imagem (`021`);
* [x] listagem de mídias (`021`, `/media`);
* [x] remover mídia (`021`);
* [x] imagem de capa para post (`021`, reusa `coverImageUrl` de `010`);
* [x] alt text (`021`);
* [x] validação de tamanho (`021`, 5MB default via `MEDIA_MAX_UPLOAD_SIZE_BYTES`);
* [x] validação de formato (`021`, jpeg/png/webp/gif);
* [ ] compressão/otimização opcional — adiada, ver nota acima.

### Implementação sugerida

Comece com armazenamento local em desenvolvimento.

Depois evolua para:

```txt
Cloudflare R2
AWS S3
MinIO local
```

> **Nota (`021`, 2026-07-26):** armazenamento local implementado (`public/uploads/`, volume Docker pra persistir entre restarts). O gateway `mediaStorage` (`ADR-0015`) é pluggável — trocar por Cloudinary/S3/R2 depois é só uma implementação nova, sem tocar domain/procedure.

### Modelo

```ts
Media {
  id
  url
  storageKey
  filename
  mimeType
  size
  altText
  uploadedById
  createdAt
}
```

> **Nota (`021`, 2026-07-26):** `storageKey` foi adicionado ao esboço original — identificador opaco de storage (caminho local hoje, `public_id` num CDN de imagem depois), distinto da `url` pública. Decisão registrada em `ADR-0015`.

### Critério de conclusão

Essa fase está pronta quando posts conseguem usar imagens gerenciadas pelo próprio sistema. **Satisfeito** — upload, biblioteca, remoção e uso como capa (`021`); compressão/otimização fica pra quando houver demanda real ou o storage final resolver isso nativamente.

## Fase 9 — Qualidade de produção 🟡 Parcial

### Objetivo

Adicionar práticas que empresas esperam de um projeto sério.

### Tarefas

* [ ] logs estruturados (hoje é `console.log` pontual, sem lib estruturada);
* [x] tratamento de erro padronizado — `ErrorRegistry` (`ADR-0017`, `022-error-registry`, RF-14): `DomainError` namespaced resolve `httpCode`/`message` sozinho, regra dura 15 fechada (`docs/afm.md` § 3);
* [x] página de erro (`src/app/error.tsx`, `src/app/not-found.tsx`);
* [ ] loading states (sem `loading.tsx` do App Router; não auditado como convenção sistemática);
* [~] empty states — confirmado em `src/components/postFeed.tsx` ("No posts found."), não auditado em todos os componentes;
* [x] validação com Zod (`src/server/schema/*.schema.ts`);
* [x] testes unitários (18 arquivos `vitest` — cobertura ~8.6%, ver `docs/afm.md` § 3.1);
* [ ] testes de integração;
* [ ] testes e2e básicos;
* [x] seed de desenvolvimento (`prisma/seed.ts` — 3 usuários, posts, comentários, tokens de verify/reset);
* [x] migrations organizadas (`prisma/migrations/`);
* [ ] rate limiting em endpoints sensíveis (ver `docs/features/001-auth-hardening/spec.md`).

### Testes importantes

* criar post;
* editar post;
* publicar post;
* impedir author de publicar;
* impedir acesso ao admin sem login;
* gerar slug único;
* buscar posts;
* registrar view;
* gerar sitemap.

### Critério de conclusão

Essa fase está pronta quando o projeto tem uma cobertura mínima das regras mais importantes e não depende de teste manual para tudo.

## Fase 10 — CI/CD e deploy ⬜ Não iniciada

### Objetivo

Colocar o projeto no ar com pipeline minimamente profissional. Hoje não há `.github/workflows/` nem deploy configurado — validação é só via `.husky/` local (ver `docs/afm.md` § 6).

### Pipeline sugerido

Ao abrir PR ou fazer push:

```txt
install
lint
typecheck
test
build
```

### Deploy

Opções boas:

```txt
Vercel + PostgreSQL externo
Railway
Render
Fly.io
VPS com Docker
```

Para portfólio, Vercel + banco externo é o caminho mais simples.

Para mostrar mais infra, VPS com Docker é mais interessante.

### Docker Compose final

```txt
app
postgres
redis
minio opcional
```

**Pendência herdada de `001-auth-hardening` (2026-07-12):** `docker-compose.yml` de produção hoje tem credenciais Postgres hardcoded (`postgres`/`postgres`) e expõe a porta do Postgres ao host sem necessidade (app e Postgres já estão na mesma rede Docker). Endereçar junto do hardening de infra desta fase — não é regressão nova, é debt pré-existente que o hardening de aplicação (feature 001) deliberadamente não cobriu (fora de escopo, decisão do dono).

### Critério de conclusão

Essa fase está pronta quando:

* o projeto está online;
* o README explica como rodar;
* o pipeline valida o código;
* o banco tem migrations;
* existe ambiente de produção minimamente estável.

## Fase 11 — Observabilidade ⬜ Não iniciada

### Objetivo

Mostrar maturidade técnica.

### Funcionalidades

* [ ] logs estruturados;
* [ ] request ID;
* [ ] tempo de resposta das rotas;
* [ ] tracing básico com OpenTelemetry;
* [ ] métricas simples;
* [ ] health check;
* [ ] endpoint `/api/health` (hoje só existe `/api/trpc/[trpc]`).

### Exemplo

```txt
GET /api/health
```

Retorno:

```json
{
  "status": "ok",
  "database": "connected",
  "version": "1.0.0"
}
```

### Critério de conclusão

Essa fase está pronta quando você consegue entender o que está acontecendo no sistema sem precisar ficar dando `console.log` aleatório.

## Ordem recomendada

Eu faria exatamente nessa ordem:

```txt
Fase 0 — Organização inicial
Fase 1 — Blog público
Fase 2 — Admin/CMS
Fase 3 — Auth e permissões
Fase 4 — Workflow editorial
Fase 5 — SEO
Fase 6 — Busca
Fase 7 — Analytics
Fase 8 — Mídia/upload
Fase 9 — Qualidade de produção
Fase 10 — CI/CD e deploy
Fase 11 — Observabilidade
```

## MVP mínimo

Para não se perder, o primeiro grande objetivo deveria ser:

```txt
Blog público + Admin + Auth + Publicação
```

Ou seja:

* usuário loga;
* cria post;
* edita post;
* publica post;
* post aparece publicamente;
* slug funciona;
* banco funciona;
* projeto roda com Docker.

Isso já é uma entrega fechada.

## Versão boa para portfólio

Depois do MVP, mire nisso:

```txt
Blog público
Admin/CMS
Auth
Roles
Workflow editorial
SEO completo
Busca
Analytics
Upload de imagens
Testes
CI/CD
Deploy
README técnico
```

Essa versão já é bem forte para nível pleno.

## Versão excelente

Para deixar acima da média:

```txt
OpenTelemetry
Logs estruturados
Preview de post
Agendamento de publicação
Histórico de revisões
Redirect de slug antigo
RSS feed
Dashboard de analytics
Rate limiting
Docker production-ready
```

Isso já passa uma imagem muito melhor do que um CRUD comum.

## O que colocar no README

Quando o projeto estiver mais maduro, o README precisa vender bem o projeto.

Estrutura boa:

```txt
# Nome do projeto

## Sobre
## Funcionalidades
## Stack
## Arquitetura
## Decisões técnicas
## Como rodar localmente
## Variáveis de ambiente
## Scripts disponíveis
## Testes
## Deploy
## Roadmap
## Screenshots
```

A parte mais importante é **Decisões técnicas**.

Exemplo:

```txt
Decidi separar regras de publicação em uma camada de domínio para evitar que regras importantes ficassem espalhadas entre rotas, componentes e chamadas diretas ao Prisma.
```

Isso mostra maturidade.

## Recomendação direta

Não tente fazer tudo de uma vez.

Primeiro, entregue isso:

```txt
1. Blog público funcionando
2. Admin funcionando
3. Auth funcionando
4. Publicação funcionando
5. README decente
6. Deploy online
```

Depois você adiciona SEO, busca, analytics, workflow, testes e observabilidade.

O projeto começa simples, mas pode virar uma aplicação bem próxima de produção. O diferencial não vai ser a ideia. Vai ser a execução.
