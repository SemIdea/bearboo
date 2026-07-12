# Roadmap — Blog/CMS nível pleno

## Progresso geral

> Atualizado em 2026-06-30, a partir de auditoria de código (não de memória) na adoção do AFM. Cada fase abaixo tem checklist próprio nas seções correspondentes — isto é só o resumo executivo. Reconciliar esta tabela sempre que uma tarefa mudar de estado (ver `CLAUDE.md` § Doutrina).

| Fase | Status | Nota |
| --- | --- | --- |
| 0 — Organização inicial | ✅ Concluída | — |
| 1 — Blog público bem feito | 🟡 Parcial | slug (`docs/features/002-post-slug/`), paginação (`docs/features/003-post-pagination/`), status/publicação (`docs/features/004-post-status/`) e tags/categorias (`docs/features/005-tags-categorias/`) implementados e verificados; falta capa, tempo de leitura, relacionados |
| 2 — Admin/CMS | 🟡 Parcial | CRUD de post já existe, campo `PostStatus` pronto pro workflow de rascunho/publicar (`docs/features/004-post-status/`), mas sem painel `/admin` dedicado (listagem/filtros/preview) |
| 3 — Autenticação e permissões | ⬜ Não iniciada | bloqueada até `docs/features/001-auth-hardening/` fechar (ver nota na fase) |
| 4 — Workflow editorial | ⬜ Não iniciada | — |
| 5 — SEO e publicação profissional | 🟡 Parcial | metadata + Open Graph por post já existem; falta sitemap/robots/RSS/canonical/Twitter Card/schema.org |
| 6 — Busca e descoberta | ⬜ Não iniciada | — |
| 7 — Analytics interno | ⬜ Não iniciada | — |
| 8 — Upload e gerenciamento de mídia | ⬜ Não iniciada | — |
| 9 — Qualidade de produção | 🟡 Parcial | Zod, migrations, seed, alguns testes/error pages já existem; falta logs estruturados, cobertura de teste (~8.6% hoje), rate limiting |
| 10 — CI/CD e deploy | ⬜ Não iniciada | sem `.github/workflows/`, sem deploy configurado |
| 11 — Observabilidade | ⬜ Não iniciada | sem `/api/health`, sem tracing/métricas |

**Fora do roadmap numerado, em andamento:** `docs/features/001-auth-hardening/spec.md` — hardening de segurança da sessão/auth atual (pré-requisito da Fase 3, não uma fase nova).

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

## Fase 1 — Blog público bem feito 🟡 Parcial

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
* [ ] posts relacionados;
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

## Fase 2 — Admin/CMS próprio 🟡 Parcial

### Objetivo

Criar um painel administrativo para gerenciar posts.

### Funcionalidades

* [x] login (existe, mas não há área `/admin` separada — é a auth geral);
* [x] criar post (`src/app/(half)/post/create/`);
* [x] editar post (`src/app/(half)/post/edit/[id]/`);
* [x] deletar post;
* [ ] publicar post / salvar como rascunho / arquivar — `PostStatus` já existe no schema e é setável via `post.update` (`docs/features/004-post-status/`), mas sem seletor na UI de criar/editar ainda (essa UI é desta fase, não da 004);
* [ ] upload de imagem de capa;
* [ ] preview antes de publicar;
* [ ] listagem de posts no admin (existe listagem pública, não um painel admin com filtros);
* [ ] filtros por status — leitura já filtra por `PUBLISHED`; falta o painel admin pra escolher outros status;
* [ ] filtros por categoria/tag.

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

## Fase 3 — Autenticação e permissões

> **Pré-requisito (2026-06-30):** antes de empilhar papéis/permissões em cima da sessão atual, ver `docs/features/001-auth-hardening/spec.md` — sessão sem expiração no servidor, cookies sem `HttpOnly`/CSRF, sem rate limiting. Adicionar roles sobre essa base propagaria a mesma superfície de ataque pra cada papel novo.

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
* [ ] proteger rotas admin (não existem rotas `/admin` dedicadas hoje);
* [ ] criar middleware de autorização (`src/middleware.tsx` hoje só seta o header `x-url`, sem lógica de authz);
* [ ] criar helper de permissões;
* [ ] adicionar testes das regras de permissão.

### Critério de conclusão

Essa fase está pronta quando o sistema impede ações indevidas tanto no frontend quanto no backend.

Ponto importante: **não confie só no botão escondido no frontend**. A regra precisa estar protegida no backend também.

## Fase 4 — Workflow editorial ⬜ Não iniciada

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

* [ ] enviar post para revisão;
* [ ] aprovar post;
* [ ] rejeitar post;
* [ ] publicar imediatamente;
* [ ] agendar publicação;
* [ ] arquivar post;
* [ ] histórico de alterações;
* [ ] comentários internos de revisão.

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

## Fase 5 — SEO e publicação profissional 🟡 Parcial

### Objetivo

Fazer o blog ser indexável e bem apresentado quando compartilhado.

### Funcionalidades

* [x] metadata dinâmica por post (`generateMetadata` em `src/app/(half)/post/[id]/page.tsx`);
* [x] title e description por post;
* [x] Open Graph (title/description/type — sem `ogImageUrl`, pois não há imagem de capa);
* [ ] Twitter Card;
* [ ] canonical URL;
* [ ] sitemap.xml dinâmico;
* [ ] robots.txt;
* [ ] RSS feed;
* [ ] schema.org para artigo;
* [ ] slug amigável (depende do slug da Fase 1);
* [ ] redirect quando slug mudar.

### Campos novos no post

```ts
seoTitle
seoDescription
canonicalUrl
ogImageUrl
publishedAt
updatedAt
```

### Regras importantes

* todo post publicado precisa ter metadata;
* slug antigo deve redirecionar para slug novo;
* sitemap só inclui posts publicados;
* posts arquivados não entram no sitemap.

### Critério de conclusão

Essa fase está pronta quando cada post tem SEO completo e pode ser compartilhado corretamente no Discord, LinkedIn, WhatsApp, etc.

## Fase 6 — Busca e descoberta de conteúdo ⬜ Não iniciada

### Objetivo

Melhorar navegação e descoberta dos posts.

### Funcionalidades

* [ ] busca por título;
* [ ] busca por conteúdo;
* [ ] filtro por tag;
* [ ] filtro por categoria;
* [x] ordenação por mais recente (`readRecent` já ordena assim);
* [ ] ordenação por mais acessado;
* [ ] posts relacionados;
* [ ] autocomplete opcional.

### Primeira implementação

Use PostgreSQL full-text search.

Depois, se quiser evoluir:

```txt
Meilisearch
Typesense
Elasticsearch
```

Mas eu começaria com Postgres mesmo. Menos infra, mais chance de terminar.

### Critério de conclusão

Essa fase está pronta quando o usuário consegue encontrar posts facilmente sem depender só da listagem cronológica.

## Fase 7 — Analytics interno ⬜ Não iniciada

### Objetivo

Criar um painel para acompanhar desempenho dos posts.

### Funcionalidades

* [ ] registrar visualização de post;
* [ ] contar views totais;
* [ ] contar views por período;
* [ ] posts mais acessados;
* [ ] origem do tráfego;
* [ ] user agent;
* [ ] referrer;
* [ ] dashboard administrativo.

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

## Fase 8 — Upload e gerenciamento de mídia ⬜ Não iniciada

### Objetivo

Permitir que o sistema lide com imagens de forma organizada.

### Funcionalidades

* [ ] upload de imagem;
* [ ] listagem de mídias;
* [ ] remover mídia;
* [ ] imagem de capa para post;
* [ ] alt text;
* [ ] validação de tamanho;
* [ ] validação de formato;
* [ ] compressão/otimização opcional.

### Implementação sugerida

Comece com armazenamento local em desenvolvimento.

Depois evolua para:

```txt
Cloudflare R2
AWS S3
MinIO local
```

### Modelo

```ts
Media {
  id
  url
  filename
  mimeType
  size
  altText
  uploadedById
  createdAt
}
```

### Critério de conclusão

Essa fase está pronta quando posts conseguem usar imagens gerenciadas pelo próprio sistema.

## Fase 9 — Qualidade de produção 🟡 Parcial

### Objetivo

Adicionar práticas que empresas esperam de um projeto sério.

### Tarefas

* [ ] logs estruturados (hoje é `console.log` pontual, sem lib estruturada);
* [~] tratamento de erro padronizado — existe classificação por domínio em `src/shared/error/*` mas violada em 18/19 `service.ts` (ver `docs/afm.md` § 3.1);
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
