# Feature 013 — Papéis e permissões (RBAC)

> **Spec:** o quê e o porquê. Sem decisão de tecnologia.
> **US relacionada(s):** US-010 (novo, Épico Autenticação) — RF-08.
> **Status:** done (2026-07-12 — `tsc --noEmit` limpo, `vitest` 214/214 verdes incl. testes novos de matriz de permissão/bypass de ownership/role-gate; migração aplicada e verificada ao vivo contra Postgres real — `codorkman@gmail.com` promovido a `ADMIN`, demais usuários `AUTHOR`)
> **Data de abertura:** 2026-07-12

## 1. Problema (do PRD/UST)

O Bearboo não tem conceito de papel/permissão hoje — qualquer usuário verificado pode criar categoria, e só o dono de um post pode editá-lo/deletá-lo (comparação direta `userId !== ownerId`, sem noção de "admin bypassa"). `docs/roadmap.md` Fase 3 pede controle de acesso real via 3 papéis (`ADMIN`/`EDITOR`/`AUTHOR`) com uma matriz de permissões fixa. `RF-07` (painel "meus posts", `012-my-posts-panel`, done) já registrou a pendência explícita: "painel escopado por dono, não site-wide — depende de RF novo (roles) quando Fase 3 começar". `ADR-0005` também rastreia esse gap como débito técnico aceito.

## 2. Critério de sucesso observável

- [x] `User` tem um campo `role` (`ADMIN`/`EDITOR`/`AUTHOR`), default `AUTHOR`; usuários existentes recebem `AUTHOR` via migração, exceto a conta indicada pelo dono (`codorkman@gmail.com`), promovida a `ADMIN`.
- [x] `ADMIN`/`EDITOR` conseguem editar e deletar post de **qualquer** usuário (hoje só o dono consegue); `AUTHOR` continua só podendo editar/deletar o **próprio** post — verificável tanto no backend (chamada direta rejeitada/aceita conforme o papel) quanto na UI (botão de editar/deletar não aparece pra quem não tem permissão).
- [x] Criar categoria exige `ADMIN`/`EDITOR` (hoje qualquer usuário verificado cria) — `AUTHOR` não vê o formulário/botão e, se chamar a procedure direto, é rejeitado.
- [x] `AUTHOR` continua podendo publicar/arquivar o **próprio** post (comportamento herdado de `011-post-status-preview`, preservado por decisão explícita desta rodada — ver § 7).
- [x] O painel de posts (`/post/mine`) mostra **todos** os posts do site pra `ADMIN`/`EDITOR`, e só os do próprio usuário pra `AUTHOR` — fecha a pendência do RF-07.
- [x] Existe uma operação de backend (sem UI nova) que permite `ADMIN` promover/rebaixar o papel de outro usuário.
- [x] Nenhuma regra de permissão depende só de esconder botão no frontend — toda checagem crítica (editar/deletar post alheio, criar categoria, promover papel) é validada no backend, verificável chamando a procedure direto com um papel sem permissão.

## 3. Cenários (Gherkin)

```gherkin
Scenario: Migração atribui papéis
  Given usuários existentes sem campo role
  When a migração roda
  Then todos recebem AUTHOR, exceto a conta indicada pelo dono, que recebe ADMIN

Scenario: Admin edita post de outro usuário
  Given um post pertencente ao usuário A
  When um usuário com papel ADMIN chama post.update nesse post
  Then a operação é aceita

Scenario: Author tenta editar post de outro usuário
  Given um post pertencente ao usuário A
  When um usuário com papel AUTHOR (não dono) chama post.update nesse post
  Then a operação é rejeitada (FORBIDDEN)

Scenario: Editor cria categoria
  Given um usuário com papel EDITOR
  When ele chama category.create
  Then a categoria é criada

Scenario: Author tenta criar categoria
  Given um usuário com papel AUTHOR
  When ele chama category.create
  Then a operação é rejeitada (FORBIDDEN)

Scenario: Author publica o próprio post
  Given um post DRAFT pertencente ao usuário logado (papel AUTHOR)
  When ele chama post.update mudando status pra PUBLISHED
  Then a operação é aceita

Scenario: Painel de posts é site-wide pra Admin/Editor
  Given um usuário com papel ADMIN ou EDITOR
  When ele abre o painel de posts
  Then vê posts de todos os usuários, não só os próprios

Scenario: Painel de posts continua escopado pro Author
  Given um usuário com papel AUTHOR
  When ele abre o painel de posts
  Then vê só os próprios posts

Scenario: Admin promove outro usuário
  Given um usuário com papel ADMIN
  When ele chama a operação de trocar o papel de outro usuário pra EDITOR
  Then o papel do outro usuário é atualizado

Scenario: Não-admin tenta promover outro usuário
  Given um usuário com papel EDITOR ou AUTHOR
  When ele tenta trocar o papel de outro usuário
  Then a operação é rejeitada (FORBIDDEN)
```

## 4. Out of scope

- **UI de gerenciar usuários** (tela pra listar usuários e trocar papel pelo botão). A operação de backend existe e é testada; a UI fica pra uma rodada futura — não é um dos 4 itens do checklist da Fase 3 (`proteger rotas admin`, `middleware de autorização`, `helper de permissões`, `testes`).
- **Restringir publish/archive a Admin/Editor.** A matriz do roadmap sugere isso, mas o workflow que substituiria a auto-publicação do Author (`enviar pra revisão` → `aprovar` → `publicar`) é escopo da **Fase 4 — Workflow editorial** (`docs/roadmap.md`, não iniciada). Aplicar a restrição agora, sem esse workflow, deixaria qualquer conta não-Admin/Editor com posts presos em `DRAFT` sem caminho pra publicar — regressão vs. `011-post-status-preview` (done). Decisão do dono, 2026-07-12 (ver § 7).
- **CRUD completo de categoria** (edit/delete). Só `create` está na superfície tocada hoje; a matriz da Fase 3 não pede edit/delete de categoria.
- **Moderação de comentário.** Não consta na matriz de permissões do roadmap Fase 3.
- **Workflow editorial completo** (`IN_REVIEW`, `SCHEDULED`, `PostRevision`, `PostReviewComment`) — Fase 4 do roadmap, feature própria futura.

## 5. Assumptions / Open questions

Sem `[NEEDS CLARIFICATION:]` aberto — as 2 decisões irredutíveis desta rodada (quem vira ADMIN; se a restrição de publish/archive entra agora) foram resolvidas por pergunta batched (discovery rodada 1/2, `/afm:deliver`) — ver § 7.

- **Premissa:** `Role` é um enum do Prisma (`ADMIN`/`EDITOR`/`AUTHOR`), não um enum TS espelhado nem union literal — valor persistido no DB, mesma convenção de `PostStatus` (ver `docs/rubrics/enum-vs-union-vs-branded.md`).
- **Premissa:** "middleware de autorização" (linguagem do roadmap) mapeia pra uma nova camada de guard no `createRouter.ts` tRPC (mesmo nível arquitetural de `verifiedProcedure`), não pro Next.js `middleware.tsx` (Edge) — o projeto já trata "session-checking middleware" como parte da cadeia de procedure (`docs/ach.md` § 3.1), e checagem de role depende do DB (papel do usuário), que o Edge runtime não acessa sem infra nova (mesma classe de problema documentada em `docs/gotchas.md` sobre Cache Components/Edge).

## 6. Dependências

- `docs/roadmap.md` Fase 3 — origem do requisito e da matriz de permissões.
- `RF-07` (`012-my-posts-panel`, done) — deixou a pendência de painel site-wide explicitamente amarrada a esta feature.
- `docs/adr/0005-manter-auth-propria.md` — rastreia o gap de papéis como débito aceito.
- `011-post-status-preview` (done) — comportamento de auto-publicação do Author que esta feature preserva conscientemente (§ 4).

## 7. Clarifications

**2026-07-12 (discovery rodada 1/2, `/afm:deliver`):**

- **Q: qual conta vira ADMIN na migração?** R: `codorkman@gmail.com` (SemIdeia_) — único usuário não-seed no banco dev, ativo (git user "SemIdeia", posts de teste "Tste"). `ana/bruno/carla@bearboo.dev` são fixtures de `db:seed`, ficam `AUTHOR`.
- **Q: aplico a restrição de publish/archive (só Admin/Editor) já nesta rodada?** R: **Não.** Author mantém a capacidade de publicar/arquivar o próprio post entregue por `011-post-status-preview`. Restringir isso é trabalho da Fase 4 (workflow editorial), que ainda não existe — aplicar agora regrediria a funcionalidade atual sem substituto.

---

*Spec NÃO contém: decisão de stack, nomes de função, schema de DB, ordem de tasks. Isso vai pro `plan.md`.*
