# UST — User Stories

> Backlog vivo de stories. Toda feature/mudança nova nasce como uma US.
> Status flui: `draft` → `ready` → `in_progress` → `done` (ou `cancelled` com motivo).
>
> Stories abaixo foram **reverse-engineered de tests existentes** (`controller.test.ts`) na adoção retroativa via `/afm:refactor` em 2026-06-30. Persona em `[A DEFINIR]` — vem da entrevista.

## Convenções

- **ID:** `US-NNN` (3 dígitos, zero-padded — `US-001` até `US-999`).
- **Referência cruzada:** sempre por ID (`RF-NN`, `RNF-NN`, `US-NNN`).
- **Critérios:** Gherkin (`Given/When/Then`). 1+ cenário por US.
- **Status:** atualizado in-place no commit que muda o estado real.

## Sumário

| ID | Título | Categoria | RF | Status |
| --- | --- | --- | --- | --- |
| US-001 | Registro de usuário | Autenticação | RF-01 | done |
| US-002 | Login e criação de sessão | Autenticação | RF-01 | done |
| US-003 | Refresh e logout de sessão | Autenticação | RF-01 | done |
| US-004 | Verificação de email por token | Autenticação | RF-02 | done |
| US-005 | Recuperação de senha via token | Autenticação | RF-03 | done |
| US-006 | Criar e ler post | Posts | RF-04 | done |
| US-007 | Atualizar, revalidar (ISR) e deletar post | Posts | RF-04 | done |
| US-008 | Criar, listar, atualizar e deletar comentário | Comentários | RF-05 | done |
| US-009 | Ver e editar perfil de usuário | Perfil | RF-06 | done |
| US-010 | Atuar conforme papel (Admin/Editor/Author) | Autenticação | RF-08 | done |
| US-011 | Publicar post via workflow de revisão | Posts | RF-09 | done |
| US-012 | Compartilhar e indexar post com SEO completo | Posts | RF-10 | done |
| US-013 | Busca posts por título ou conteúdo | Posts | RF-11 | done |
| US-014 | Analytics de visualizações por post | Analytics | RF-12 | done |
| US-015 | Autor/Editor customiza SEO e URL amigável do post | Posts | RF-10 | done |

## Pendências Técnicas

- ~~Investigar se o mesmo padrão de transport pluggável usado no mailer pode ser aplicado ao Prisma, para reduzir duplicação entre runtime, testes e outros adaptadores.~~ **Resolvido em 2026-07-06** — adotado `prisma-mock` (fake do PrismaClient gerado do schema) no seam do driver; fakes à mão de `src/test/repositories/` deletados. Ver ADR-0011 e `docs/research/001-teste-prisma-sem-banco-real.md`.
- ~~Investigar por que o token enviado nos emails não está funcionando quando o link é aberto. O fluxo de cadastro/verificação parece montar o link corretamente, mas a rota final não completa a ação esperada.~~ **Resolvido em 2026-07-11** — bug de mismatch entre o link montado (`?token=`, query param) e a rota `src/app/(smal)/auth/verify/[token]/page.tsx` (path param); corrigido em `register.ts` e `resendVerificationEmail.ts` pra montar o link como `/auth/verify/${token}`, no mesmo padrão já usado pelo fluxo de reset de senha (`sendResetPasswordEmail.ts`). Testes de regressão adicionados nos dois `controller.test.ts`.
- ~~`src/context/trpc/fetcher.ts` (`customFetcher`) reimplementava na mão o parsing do envelope de erro do `httpBatchLink` (array + `error.json.message` do superjson) pra decidir se refaz a sessão.~~ **Resolvido em 2026-07-12** — lógica movida pra `src/context/trpc/sessionRefreshLink.ts`, um link customizado do tRPC (`opts.next(op)`) que recebe o erro já tipado (`TRPCClientError.data.code`/`.message`) em vez de JSON cru; `fetcher.ts` deletado. Ver `docs/features/008-trpc-error-link/`. Tratado como item avulso (não dobrado em `001-auth-hardening`, que segue `draft` e cobre um escopo de segurança diferente — ver `008-trpc-error-link/spec.md` § 6).
- `/post/[slug]` (`docs/features/002-post-slug/`) agora chama `notFound()` corretamente quando o slug não existe (**2026-07-11**, antes caía no `error.tsx` genérico — ver commit `a620cde`), mas o status HTTP da resposta continua `200`, não `404`. **Investigado e reclassificado em 2026-07-12** (`docs/features/009-post-404-status/`): a hipótese original ("tirar o post de dentro do `<Suspense>` resolve, só perde o fallback de loading") **estava errada** — com `cacheComponents: true` (`next.config.ts`), Next.js exige um `<Suspense>` em volta de qualquer leitura dinâmica não-cacheada; removê-lo quebra o `next build` inteiro (`Uncached data was accessed outside of <Suspense>`), não é uma troca de UX. Não existe mais `export const dynamic = "force-dynamic"` como escape hatch (removido junto do Cache Components no Next 16). Ver `docs/gotchas.md` § Cache Components. Corrigir de verdade exigiria checagem de slug **fora** do pipeline de Cache Components (ex: `middleware`/`proxy` no Edge) — infra nova, não fix pontual. **Decisão do dono (2026-07-12): aceitar como limitação conhecida por ora**, sem investir na infra nova; reabrir se virar bloqueio real (ex. SEO passar a exigir 404 de verdade). Relevante pra Fase 5 (SEO) do roadmap — bots que checam status HTTP não veem 404 real.

---

## Épico Autenticação

### US-001 — [Persona] registra uma conta nova

- **Persona:** `[A DEFINIR]`.
- **Story:** Como `[persona]`, quero criar uma conta com email/senha/nome para publicar posts e comentar.

**Critérios de aceitação:**

```gherkin
Scenario: Registro bem-sucedido
  Given um email ainda não cadastrado
  When o usuário registra com email, senha e nome válidos
  Then a conta é criada e um email de verificação é enviado

Scenario: Email de verificação falha ao enviar
  Given um registro válido
  When o envio do email de verificação falha
  Then o registro ainda é concluído com sucesso (falha de envio não bloqueia o cadastro)

Scenario: Email já cadastrado
  Given um email já existente
  When o usuário tenta registrar com esse email
  Then a operação é rejeitada com erro de conflito
```

**Metadata:** RF-01. *Test ref:* `src/server/features/user/register/controller.test.ts`.

---

### US-002 — [Persona] faz login

- **Persona:** `[A DEFINIR]`.
- **Story:** Como `[persona]`, quero logar com email/senha para criar uma sessão autenticada.

**Critérios de aceitação:**

```gherkin
Scenario: Login com credenciais válidas
  Given um usuário existente com senha correta
  When o usuário faz login
  Then uma sessão é retornada

Scenario: Login com usuário inexistente
  Given um email não cadastrado
  When o usuário tenta logar
  Then a operação é rejeitada
```

**Metadata:** RF-01. *Test ref:* `src/server/features/user/login/controller.test.ts`. *Spec:* `docs/features/001-auth-hardening/spec.md`.

---

### US-003 — [Persona] atualiza (refresh) ou termina (logout) a sessão

- **Persona:** `[A DEFINIR]`.
- **Story:** Como `[persona]`, quero renovar minha sessão automaticamente e poder sair (logout) explicitamente.

**Critérios de aceitação:**

```gherkin
Scenario: Refresh de sessão válida
  Given uma sessão existente com refresh token válido
  When o cliente solicita refresh
  Then uma nova sessão é emitida

Scenario: Refresh com token inválido
  Given um refresh token inválido
  When o cliente solicita refresh
  Then a operação é rejeitada

Scenario: Logout
  Given uma sessão autenticada
  When o usuário faz logout
  Then a sessão é encerrada

Scenario: Logout com sessão ou usuário inexistente
  Given uma sessão ou usuário que não existe mais
  When o logout é solicitado
  Then a operação é rejeitada com erro apropriado
```

**Metadata:** RF-01. *Test ref:* `src/server/features/auth/session/controller.test.ts`. *Spec:* `docs/features/001-auth-hardening/spec.md`.

---

### US-004 — [Persona] verifica o email da conta

- **Persona:** `[A DEFINIR]`.
- **Story:** Como `[persona]`, quero verificar meu email via token para desbloquear a conta, e reenviar o token se necessário.

**Critérios de aceitação:**

```gherkin
Scenario: Verificação bem-sucedida
  Given um token de verificação válido e não usado
  When o usuário verifica o token
  Then a conta é marcada como verificada

Scenario: Token não encontrado / já usado / expirado
  Given um token inválido, já usado, ou expirado
  When o usuário tenta verificar
  Then a operação é rejeitada com o erro correspondente

Scenario: Reenvio de token de verificação
  Given um usuário não verificado
  When o usuário solicita reenvio
  Then um novo email de verificação é enviado

Scenario: Reenvio com email inexistente
  Given um email não cadastrado
  When o reenvio é solicitado
  Then a operação é rejeitada
```

**Metadata:** RF-02. *Test ref:* `src/server/features/auth/verifyToken/controller.test.ts`.

---

### US-005 — [Persona] recupera a senha esquecida

- **Persona:** `[A DEFINIR]`.
- **Story:** Como `[persona]`, quero solicitar um reset de senha por email e definir uma nova senha via token.

**Critérios de aceitação:**

```gherkin
Scenario: Solicitação de reset bem-sucedida
  Given um usuário existente
  When o usuário solicita reset de senha
  Then um token de reset é criado e um email é enviado

Scenario: Solicitação com usuário inexistente
  Given um email não cadastrado
  When o reset é solicitado
  Then a operação é rejeitada

Scenario: Reset de senha bem-sucedido
  Given um token de reset válido e senhas coincidentes
  When o usuário define a nova senha
  Then a senha é atualizada

Scenario: Reset com token inválido, usado, expirado, ou senhas não coincidentes
  Given qualquer uma dessas condições
  When o usuário tenta resetar
  Then a operação é rejeitada com o erro correspondente
```

**Metadata:** RF-03. *Test ref:* `src/server/features/auth/resetToken/controller.test.ts`.

---

### US-010 — [Persona] atua conforme seu papel (Admin/Editor/Author)

- **Persona:** `[A DEFINIR]`.
- **Story:** Como `[persona]` com um papel (`ADMIN`/`EDITOR`/`AUTHOR`), quero que o sistema só me deixe fazer o que meu papel permite — e deixe Admin/Editor agirem sobre conteúdo de qualquer usuário quando o Author só age sobre o próprio.

**Critérios de aceitação:**

```gherkin
Scenario: Admin edita post de outro usuário
  Given um post de outro usuário
  When um Admin chama a edição
  Then a operação é aceita

Scenario: Author tenta editar post de outro usuário
  Given um post de outro usuário
  When um Author (não dono) chama a edição
  Then a operação é rejeitada

Scenario: Author cria categoria
  Given um usuário com papel Author
  When ele tenta criar uma categoria
  Then a operação é rejeitada

Scenario: Admin promove outro usuário
  Given um usuário com papel Admin
  When ele troca o papel de outro usuário
  Then o papel é atualizado
```

**Metadata:** RF-08. *Test ref:* `src/lib/permissions/__test__/matrix.ts`, `src/server/features/post/domain/__test__/*`, `src/server/features/category/procedures/__test__/create.ts`, `src/server/features/user/procedures/__test__/updateRole.ts`. *Spec:* `docs/features/013-role-based-permissions/spec.md`.

---

## Épico Posts

### US-011 — [Persona] publica post via workflow de revisão

- **Persona:** `[A DEFINIR]`.
- **Story:** Como `[persona]` com um papel (`ADMIN`/`EDITOR`/`AUTHOR`), quero que a publicação de um post siga um workflow de revisão — Author envia pra revisão, Admin/Editor aprova/rejeita/publica/agenda/arquiva — em vez de qualquer dono publicar/arquivar o próprio post livremente.

**Critérios de aceitação:**

```gherkin
Scenario: Author cria post e ele nasce DRAFT
  Given um usuário com papel AUTHOR
  When ele cria um post sem informar status
  Then o post é persistido como DRAFT

Scenario: Author envia o próprio rascunho pra revisão
  Given um post DRAFT pertencente ao usuário logado
  When ele envia o post pra revisão
  Then o post fica IN_REVIEW

Scenario: Editor aprova e publica um post em revisão
  Given um post IN_REVIEW
  When um Editor aprova o post sem data de agendamento
  Then o post fica PUBLISHED imediatamente

Scenario: Admin agenda a publicação de um post em revisão
  Given um post IN_REVIEW
  When um Admin aprova o post informando uma data futura
  Then o post fica SCHEDULED, e passa a aparecer publicamente só quando a data chega

Scenario: Editor rejeita um post em revisão com motivo
  Given um post IN_REVIEW
  When um Editor rejeita informando um motivo
  Then o post volta pra DRAFT e o motivo fica visível pro dono

Scenario: Admin arquiva um post de qualquer usuário
  Given um post de outro usuário
  When um Admin arquiva o post
  Then o post fica ARCHIVED

Scenario: Author tenta publicar ou arquivar o próprio post direto
  Given um post pertencente ao usuário logado (papel AUTHOR)
  When ele tenta publicar ou arquivar esse post diretamente
  Then a operação é rejeitada (FORBIDDEN)
```

**Metadata:** RF-09. *Test ref:* `src/server/features/post/procedures/__test__/{submitForReview,publish,reject,archive,readReviewComments}.ts`. *Spec:* `docs/features/014-post-review-workflow/spec.md`.

---

### US-012 — [Persona] compartilha e indexa um post com SEO completo

- **Persona:** `[A DEFINIR]` (leitor externo/buscador — não um papel autenticado do sistema).
- **Story:** Como leitor que compartilha um link de post (Discord/LinkedIn/WhatsApp) ou como buscador indexando o site, quero que cada post publicado tenha metadata completa (canonical, Open Graph com imagem, Twitter Card, schema.org) e que o site exponha sitemap/robots/RSS, pra que o preview seja rico e a indexação funcione.

**Critérios de aceitação:**

```gherkin
Scenario: Sitemap lista só posts publicamente visíveis
  Given um post PUBLISHED, um DRAFT, um IN_REVIEW, um ARCHIVED, um SCHEDULED no futuro e um SCHEDULED no passado
  When o sitemap é gerado
  Then aparecem só o PUBLISHED e o SCHEDULED no passado

Scenario: Robots.txt bloqueia rotas privadas
  When robots.txt é gerado
  Then rotas de criar/editar/meus-posts, perfil, auth e api aparecem em Disallow
  And o robots.txt referencia a URL do sitemap

Scenario: RSS feed reflete posts recentes publicados
  Given 3 posts PUBLISHED e 1 DRAFT
  When o feed.xml é lido
  Then contém os 3 posts publicados, não contém o DRAFT

Scenario: Post compartilhado tem preview rico
  Given um post PUBLISHED com imagem de capa
  When a página do post é carregada
  Then a metadata inclui canonical, Open Graph com imagem, Twitter Card summary_large_image e JSON-LD Article válido
```

**Metadata:** RF-10. *Test ref:* `src/server/models/__test__/prismaModels.ts` (`readAllPublicSlugs`), `src/server/features/post/procedures/__test__/readSitemapEntries.ts`, `src/server/http/__test__/{buildRssXml,buildArticleJsonLd}.ts`. *Spec:* `docs/features/015-seo-metadata/spec.md`.

---

### US-013 — [Persona] busca posts por título ou conteúdo

- **Persona:** `[A DEFINIR]` (leitor do blog público — não um papel autenticado do sistema).
- **Story:** Como leitor navegando o blog, quero buscar posts por uma palavra-chave presente no título ou no conteúdo, com sugestões enquanto digito, pra encontrar um post específico sem depender de rolar a listagem cronológica.

**Critérios de aceitação:**

```gherkin
Scenario: Busca encontra post pelo título
  Given um post PUBLISHED com título "Guia de Prisma"
  When o leitor busca por "prisma"
  Then o post aparece no resultado

Scenario: Busca encontra post pelo conteúdo
  Given um post PUBLISHED cujo conteúdo menciona "tsvector" mas o título não
  When o leitor busca por "tsvector"
  Then o post aparece no resultado

Scenario: Busca não vaza posts não-públicos
  Given um post DRAFT com título "Rascunho Secreto"
  When o leitor busca por "secreto"
  Then o post não aparece no resultado

Scenario: Busca é paginada
  Given 15 posts PUBLISHED cujo título contém "teste"
  When o leitor busca por "teste" com limit 10
  Then a primeira página retorna 10 posts e um nextCursor não nulo

Scenario: Busca ordenada por mais acessado
  Given um post PUBLISHED com título "A" e viewCount 5
  And um post PUBLISHED com título "B" (mesmo termo de busca) e viewCount 20
  When o leitor busca pelo termo comum com sortBy "mostViewed"
  Then o post "B" aparece antes do post "A"
```

**Metadata:** RF-11. *Test ref:* `src/server/features/post/procedures/__test__/search.ts`, `src/server/models/__test__/prismaModels.ts` (`search`). *Spec:* `docs/features/016-search-content/spec.md`, `docs/features/019-search-sort-by-views/spec.md`.

---

### US-014 — Admin/Editor acompanha visualizações de post

- **Persona:** Admin/Editor (papel autenticado do sistema, ver `013-role-based-permissions`).
- **Story:** Como Admin/Editor, quero ver quantas visualizações cada post recebeu (total e ranking de mais acessados), a partir de views registradas automaticamente quando um leitor abre a página pública de um post, pra entender quais conteúdos performam melhor.

**Critérios de aceitação:**

```gherkin
Scenario: Visualização de post público é registrada
  Given um post PUBLISHED
  When um leitor abre a página do post
  Then uma view é registrada para aquele post

Scenario: View de post não-público não é registrada
  Given um post DRAFT ou ARCHIVED
  When alguém abre a URL do post (ex: preview do próprio dono)
  Then nenhuma view pública é registrada pra aquele acesso

Scenario: Admin/Editor vê o total de views de um post
  Given um post com N views registradas
  When um Admin/Editor abre o dashboard de analytics
  Then o total de views daquele post aparece

Scenario: Dashboard lista posts mais acessados
  Given múltiplos posts com contagens de view diferentes
  When um Admin/Editor abre o dashboard de analytics
  Then os posts aparecem ordenados por número de views, do mais pro menos acessado

Scenario: Dashboard é restrito a Admin/Editor
  Given um usuário Author autenticado (sem papel Admin/Editor)
  When ele tenta acessar o dashboard de analytics
  Then o acesso é negado
```

**Metadata:** RF-12. *Test ref:* `src/server/features/analytics/domain/__test__/{recordView,readDashboard}.ts`, `src/server/features/analytics/procedures/__test__/{recordView,readDashboard}.ts`, `src/server/integrations/gateway/viewCounter/implementations/__test__/{redis,inMemory}.ts`. *Spec:* `docs/features/017-post-view-analytics/spec.md`.

---

### US-015 — Autor/Editor customiza SEO e URL amigável do post

- **Persona:** Autor/Editor (dono do post ou quem tem `post:editAny` — mesma regra de `post.update` hoje).
- **Story:** Como Autor/Editor, quero poder sobrescrever o title/description/canonical usados no SEO de um post (quando o título/conteúdo não são o ideal pra compartilhamento ou o post é republicado de outro lugar) e poder corrigir o slug de um post já publicado sem quebrar links antigos, pra ter controle editorial completo sobre como o post é indexado e compartilhado (`docs/roadmap.md` Fase 5, pendências adiadas em `015-seo-metadata/spec.md § 4`).

**Critérios de aceitação:**

```gherkin
Scenario: Override de SEO é usado na metadata em vez do conteúdo do post
  Given um post com seoTitle/seoDescription/canonicalUrl preenchidos
  When a página do post é carregada
  Then <title>, meta description, Open Graph e canonical usam os valores de override, não title/content/URL própria

Scenario: Sem override, comportamento atual é preservado
  Given um post sem seoTitle/seoDescription/canonicalUrl (campos vazios)
  When a página do post é carregada
  Then a metadata é computada de title/content/URL própria, igual antes de 018

Scenario: Editar o slug de um post gera um novo slug válido e único
  Given um post existente com slug "como-fiz-x"
  When o Autor/Editor edita o slug pra "como-fiz-x-de-verdade"
  Then o post passa a responder em "/post/como-fiz-x-de-verdade"
  And o slug antigo "como-fiz-x" fica registrado como slug anterior

Scenario: Slug antigo redireciona pro slug novo
  Given um post cujo slug mudou de "como-fiz-x" pra "como-fiz-x-de-verdade"
  When alguém acessa "/post/como-fiz-x"
  Then a resposta é um redirect permanente (301) pra "/post/como-fiz-x-de-verdade"

Scenario: Novo slug colide com um já existente
  Given um post publicado com slug "titulo-legal"
  When o Autor/Editor edita outro post pro mesmo slug "titulo-legal"
  Then o post editado recebe um sufixo numérico ("titulo-legal-2"), mesmo padrão do slug gerado na criação
```

**Metadata:** RF-10. *Test ref:* `docs/features/018-seo-overrides-slug-redirect/`. *Spec:* `docs/features/018-seo-overrides-slug-redirect/spec.md`.

---

### US-006 — [Persona] cria e lê posts

- **Persona:** `[A DEFINIR]`.
- **Story:** Como `[persona]`, quero publicar um post e poder lê-lo (individualmente ou entre os recentes).

**Critérios de aceitação:**

```gherkin
Scenario: Criar post
  Given um usuário autenticado e verificado
  When o usuário cria um post com título e conteúdo
  Then o post é persistido com o `userId` do autor

Scenario: Ler post por ID
  Given um post existente
  When o post é lido por ID
  Then os dados do post são retornados

Scenario: Ler post inexistente
  Given um ID que não existe
  When o post é lido
  Then a operação é rejeitada

Scenario: Listar posts recentes
  When os posts recentes são solicitados
  Then até 30 posts recentes são retornados

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

**Metadata:** RF-04. *Test ref:* `src/server/features/post/create/controller.test.ts`, `post/read`, `post/readRecent`, `post/readBySlug`. *Spec:* `docs/features/002-post-slug/spec.md` (amend — leitura por slug, `in_progress`).

---

### US-007 — [Persona] atualiza, revalida e deleta um post

- **Persona:** `[A DEFINIR]`.
- **Story:** Como `[persona]`, quero editar, revalidar (ISR) ou remover meus próprios posts.

**Critérios de aceitação:**

```gherkin
Scenario: Atualizar post próprio
  Given um post pertencente ao usuário autenticado
  When o usuário atualiza título/conteúdo
  Then o post é atualizado

Scenario: Atualizar post de outro usuário
  Given um post que não pertence ao usuário autenticado
  When o usuário tenta atualizar
  Then a operação é rejeitada como não autorizada

Scenario: Revalidar post (ISR)
  Given um post pertencente ao usuário
  When o usuário solicita revalidação
  Then a página do post é revalidada

Scenario: Deletar post próprio
  Given um post pertencente ao usuário
  When o usuário deleta
  Then o post é removido

Scenario: Post inexistente ou de outro usuário
  Given essas condições em update/revalidate/delete
  When a operação é tentada
  Then é rejeitada com o erro correspondente
```

**Metadata:** RF-04. *Test ref:* `src/server/features/post/update`, `post/revalidate`, `post/delete` `controller.test.ts`.

---

## Épico Comentários

### US-008 — [Persona] comenta em posts

- **Persona:** `[A DEFINIR]`.
- **Story:** Como `[persona]`, quero criar, listar, atualizar e deletar comentários em posts.

**Critérios de aceitação:**

```gherkin
Scenario: Criar comentário
  Given um usuário autenticado e um post existente
  When o usuário comenta
  Then o comentário é persistido

Scenario: Listar comentários de um post
  Given um post com ou sem comentários
  When os comentários são listados
  Then a lista (ou lista vazia) é retornada

Scenario: Atualizar comentário próprio
  Given um comentário do usuário autenticado
  When o usuário atualiza o conteúdo
  Then o comentário é atualizado

Scenario: Deletar comentário próprio
  Given um comentário do usuário autenticado
  When o usuário deleta
  Then o comentário é removido

Scenario: Comentário inexistente ou de outro usuário
  Given essas condições em update/delete
  When a operação é tentada
  Then é rejeitada com o erro correspondente
```

**Metadata:** RF-05. *Test ref:* `src/server/features/comment/{create,readAll,update,delete}/controller.test.ts`.

---

## Épico Perfil de Usuário

### US-009 — [Persona] visualiza e edita o próprio perfil

- **Persona:** `[A DEFINIR]`.
- **Story:** Como `[persona]`, quero ver meu perfil (com posts/comentários) e editar nome/bio.

**Critérios de aceitação:**

```gherkin
Scenario: Ler perfil de usuário
  Given um usuário existente
  When o perfil é solicitado
  Then os dados do perfil são retornados

Scenario: Perfil de usuário inexistente
  Given um ID que não existe
  When o perfil é solicitado
  Then a operação é rejeitada

Scenario: Atualizar perfil próprio
  Given um usuário autenticado
  When o usuário atualiza nome/bio
  Then o perfil é atualizado

Scenario: Listar posts do usuário
  Given um usuário com ou sem posts
  When os posts do usuário são solicitados
  Then a lista (ou lista vazia) é retornada

Scenario: Listar comentários do usuário
  Given um usuário com ou sem comentários
  When os comentários do usuário são solicitados
  Then a lista (ou lista vazia) é retornada
```

**Metadata:** RF-06. *Test ref:* `src/server/features/user/{profile,posts,comments}/controller.test.ts`.

---

*Adicionar US nova: copia o bloco acima abaixo do épico correspondente. Se o épico não existe, cria H2 novo. Numera o ID sequencialmente do último em uso.*
