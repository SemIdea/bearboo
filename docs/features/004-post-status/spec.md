# Feature 004 — Status do post (draft/published/archived)

> **Spec:** o quê e o porquê. Sem decisão de tecnologia.
> **US relacionada(s):** nenhuma US formal ainda — item de checklist em `docs/roadmap.md` Fase 1 ("regras importantes: somente posts `PUBLISHED` aparecem no blog público") e Fase 2 ("arquivar post").
> **Status:** done (2026-07-12 — verificado ao vivo contra Postgres real via `curl` nas rotas `post.readRecent`/`post.readBySlug`; `tsc --noEmit` e `vitest` 123/123 verdes)
> **Data de abertura:** 2026-07-12

## 1. Problema (do PRD/UST)

`Post` não tem campo de status (`prisma/schema.prisma`) — todo post criado é implicitamente publicado, sem forma de marcar rascunho ou arquivar. O roadmap já documenta a regra "somente posts `PUBLISHED` aparecem no blog público" (Fase 1) e "arquivar post" (Fase 2), mas nenhuma das duas é aplicável hoje porque o campo não existe (`docs/prd.md` linha 70). Sem esse campo, não há como um usuário guardar um post pela metade sem publicá-lo, nem tirar um post de circulação sem deletar de vez.

## 2. Critério de sucesso observável

- [x] Um post criado sem informar status aparece no blog público exatamente como hoje (sem regressão de comportamento) — confirmado: posts existentes viraram `PUBLISHED` no backfill da migration, novos posts sem `status` saem `PUBLISHED`.
- [x] Um post com status `DRAFT` ou `ARCHIVED` não aparece na listagem paginada da home, nem na página pública de posts de um autor, nem é acessível pela URL do slug (mesmo tratamento de "não encontrado" de um slug inexistente) — testado (`vitest`) e verificado ao vivo via `curl`.
- [x] O dono de um post consegue mudar o status de um post que já criou usando a mutation de update já existente.
- [x] A checagem de unicidade de slug considera posts de qualquer status (não é possível dois posts com o mesmo slug só porque um está em rascunho).

## 3. Cenários (Gherkin)

```gherkin
Scenario: Post criado sem status explícito é publicado
  Given um usuário autenticado cria um post sem informar status
  When o post é lido pela listagem pública
  Then o post aparece normalmente

Scenario: Post em rascunho não aparece na listagem pública
  Given um post com status DRAFT
  When a listagem paginada da home é pedida
  Then esse post não está entre os resultados

Scenario: Post arquivado não aparece na página pública do autor
  Given um post com status ARCHIVED de um autor
  When a lista pública de posts desse autor é pedida
  Then esse post não está entre os resultados

Scenario: Post em rascunho não é acessível pelo slug
  Given um post com status DRAFT e slug conhecido
  When esse slug é pedido pela rota pública de leitura por slug
  Then a resposta é "não encontrado", igual a um slug que não existe

Scenario: Dono muda o status do próprio post
  Given um post PUBLISHED de um usuário autenticado
  When esse usuário chama a mutation de update com status ARCHIVED
  Then o post passa a ter status ARCHIVED

Scenario: Slug duplicado é bloqueado mesmo entre statuses diferentes
  Given um post DRAFT já existe com slug "meu-post"
  When um novo post é criado com título que geraria o mesmo slug
  Then o slug do novo post recebe um sufixo numérico, igual ao comportamento atual entre posts publicados
```

## 4. Out of scope

- **Workflow editorial completo** (`IN_REVIEW`, `SCHEDULED`, `PostRevision`, comentários de revisão) — é a Fase 4 do roadmap ("Não iniciada"), que depende de papéis de usuário (Fase 3, também não iniciada). Esta feature entrega só o enum simples de 3 estados já descrito na Fase 1.
- **Gate de permissão por papel** ("só admin/editor pode publicar") — não existe `UserRole` ainda (Fase 3). Qualquer dono de post pode mudar o status do próprio post, sem distinção de papel, igual ao resto das mutations de post hoje.
- **UI de seletor de status nos formulários de criar/editar post.** Por diretriz do dono do produto (2026-07-11), mudanças de front ficam mínimas/aditivas até a refatoração de front planejada — ver `docs/roadmap.md` § Nota de sequenciamento. A UI de rascunho/publicar é item explícito da Fase 2 (Admin/CMS, não iniciada), não desta feature. O campo fica setável via a mutation `post.update` já existente (ex.: chamada direta, sem tela dedicada ainda).
- **Preview de rascunho pelo próprio autor via a rota pública de slug.** Sem papéis/admin, não há como distinguir "autor vendo o próprio rascunho" de "visitante qualquer" nessa rota — fica pra quando a Fase 2/3 existirem.

## 5. Assumptions / Open questions

- Premissa: status default de post novo é `PUBLISHED`, decidido explicitamente no domain (não via default implícito do banco) — porque hoje não existe nenhuma UI de "publicar" (Fase 2), então um default `DRAFT` tornaria todo post criado pelo formulário atual invisível sem forma de corrigir. Ver `plan.md` § 4.
- Premissa: o enum é o simples de 3 estados da Fase 1 (`DRAFT`/`PUBLISHED`/`ARCHIVED`), não o de 5 estados da Fase 4 — resolvido por leitura direta do roadmap, que já separa as duas fases e suas dependências.

## 6. Dependências

- Nenhuma feature bloqueante. Não depende de `002-post-slug/` nem `003-post-pagination/`, mas toca os mesmos pontos de leitura que `003` criou (`readRecent`) — sem conflito, adiciona filtro na mesma query.
- Bloqueia (parcialmente): Fase 2 (Admin/CMS) precisa deste campo pra "publicar"/"salvar como rascunho"/"filtro por status"; Fase 4 (workflow editorial) estende este enum.

## 7. Clarifications

*(vazio — discovery convergiu sem decisão irredutível; ver `plan.md` § 4 para o raciocínio de cada decisão.)*

---

*Spec NÃO contém: decisão de stack, nomes de função, schema de DB, ordem de tasks. Isso vai pro `plan.md`.*
