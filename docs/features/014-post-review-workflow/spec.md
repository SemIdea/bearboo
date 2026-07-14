# Feature 014 — Workflow editorial (revisão de posts)

> **Spec:** o quê e o porquê. Sem decisão de tecnologia.
> **US relacionada(s):** US-011 (novo, Épico Posts) — RF-09.
> **Status:** done (2026-07-14 — `tsc --noEmit` limpo, `vitest` 247/247 verdes incl. testes novos de state machine/permissão/visibilidade lazy; `yarn build` verde; verificado ao vivo contra Postgres real via `next dev` — fluxo completo criar→enviar→rejeitar→reenviar→publicar→arquivar, e agendamento futuro/passado)
> **Data de abertura:** 2026-07-14

## 1. Problema (do PRD/UST)

`013-role-based-permissions` (Fase 3) deu a Admin/Editor bypass de ownership pra editar/deletar posts de qualquer usuário, mas deliberadamente **não** restringiu publish/archive a Admin/Editor — Author continua publicando/arquivando o próprio post direto, porque o workflow que substituiria isso (`enviar pra revisão` → `aprovar`/`rejeitar` → `publicar`) ainda não existia (`013-role-based-permissions/spec.md` § 4, decisão do dono 2026-07-12). `docs/roadmap.md` Fase 4 pede exatamente esse workflow: novos status (`IN_REVIEW`, `SCHEDULED`), ação de enviar pra revisão, aprovar/rejeitar com motivo, publicar imediatamente (Admin/Editor pulando a revisão), agendar publicação, arquivar (agora restrito), e comentários internos de revisão.

Fase 4 completa também pede "histórico de alterações" (diff de cada edição, `PostRevision`) — **fora de escopo desta rodada**, ver § 4.

## 2. Critério de sucesso observável

- [x] `Post.status` ganha `IN_REVIEW` e `SCHEDULED` (além de `DRAFT`/`PUBLISHED`/`ARCHIVED` existentes).
- [x] Author cria post e ele nasce `DRAFT` (comportamento novo — hoje nasce `PUBLISHED` por padrão); Admin/Editor continuam podendo criar já `PUBLISHED` (ou qualquer status) diretamente.
- [x] Author (dono) envia o próprio post `DRAFT` pra `IN_REVIEW` — qualquer outra transição de status feita por Author é rejeitada (`FORBIDDEN`).
- [x] Admin/Editor aprova um post `IN_REVIEW` (ou publica um `DRAFT` direto, pulando revisão): vira `PUBLISHED` imediatamente, ou `SCHEDULED` se uma data futura for informada.
- [x] Post `SCHEDULED` aparece nas leituras públicas (`readRecent`, `readBySlug`, `readRelated`, `user.readPosts`) automaticamente quando a data agendada chega — sem depender de nenhum job/cron rodando (checagem no momento da leitura).
- [x] Admin/Editor rejeita um post `IN_REVIEW` com um motivo obrigatório — o post volta pra `DRAFT` e o motivo fica visível pro dono do post.
- [x] Admin/Editor arquiva qualquer post, de qualquer status — Author **não** consegue mais arquivar/publicar o próprio post direto (fecha a pendência deixada pela `013`).
- [x] Admin/Editor consegue ler (abrir a URL real / chamar a leitura) um post `IN_REVIEW`/`DRAFT` de **outro** usuário pra poder revisá-lo — hoje só o dono vê o próprio rascunho.
- [x] Nenhuma regra de transição de status depende só de esconder botão no frontend — toda checagem crítica é validada no backend.

## 3. Cenários (Gherkin)

```gherkin
Scenario: Author cria post e ele nasce DRAFT
  Given um usuário com papel AUTHOR
  When ele cria um post sem informar status
  Then o post é persistido como DRAFT

Scenario: Admin cria post já publicado
  Given um usuário com papel ADMIN
  When ele cria um post com status PUBLISHED
  Then o post é persistido como PUBLISHED

Scenario: Author envia o próprio rascunho pra revisão
  Given um post DRAFT pertencente ao usuário logado
  When ele envia o post pra revisão
  Then o post fica IN_REVIEW

Scenario: Author tenta enviar pra revisão um post que não é dele
  Given um post DRAFT de outro usuário
  When ele tenta enviar esse post pra revisão
  Then a operação é rejeitada (FORBIDDEN)

Scenario: Editor aprova e publica um post em revisão
  Given um post IN_REVIEW
  When um usuário com papel EDITOR aprova o post sem data de agendamento
  Then o post fica PUBLISHED imediatamente

Scenario: Admin agenda a publicação de um post em revisão
  Given um post IN_REVIEW
  When um Admin aprova o post informando uma data futura
  Then o post fica SCHEDULED com essa data

Scenario: Post agendado aparece publicamente quando a data chega
  Given um post SCHEDULED com data já passada
  When a listagem pública de posts é lida
  Then esse post aparece como se fosse PUBLISHED

Scenario: Post agendado no futuro não aparece publicamente
  Given um post SCHEDULED com data futura
  When a listagem pública de posts é lida
  Then esse post não aparece

Scenario: Admin publica um rascunho direto, pulando revisão
  Given um post DRAFT
  When um Admin publica esse post diretamente
  Then o post fica PUBLISHED

Scenario: Author tenta publicar o próprio rascunho direto
  Given um post DRAFT pertencente ao usuário logado (papel AUTHOR)
  When ele tenta publicar esse post
  Then a operação é rejeitada (FORBIDDEN)

Scenario: Editor rejeita um post em revisão com motivo
  Given um post IN_REVIEW
  When um Editor rejeita informando um motivo
  Then o post volta pra DRAFT e o motivo fica registrado

Scenario: Rejeitar sem motivo é inválido
  Given um post IN_REVIEW
  When um Editor tenta rejeitar sem informar motivo
  Then a operação é rejeitada por validação

Scenario: Admin arquiva um post de qualquer usuário
  Given um post PUBLISHED de outro usuário
  When um Admin arquiva o post
  Then o post fica ARCHIVED

Scenario: Author tenta arquivar o próprio post
  Given um post PUBLISHED pertencente ao usuário logado (papel AUTHOR)
  When ele tenta arquivar esse post
  Then a operação é rejeitada (FORBIDDEN)

Scenario: Admin/Editor lê o rascunho de outro usuário pra revisar
  Given um post DRAFT ou IN_REVIEW de outro usuário
  When um Admin/Editor lê esse post pelo slug
  Then os dados do post são retornados (não NOT_FOUND)

Scenario: Author não vê rascunho de outro usuário
  Given um post DRAFT de outro usuário
  When um Author lê esse post pelo slug
  Then a operação é rejeitada como não encontrado
```

## 4. Out of scope

- **`PostRevision` / histórico de diffs de edição.** "Histórico de alterações" do roadmap fica pra uma rodada futura — decisão do dono (2026-07-14, discovery desta feature): superfície bem maior (novo model + lógica de diff) sem bloquear o workflow de revisão em si.
- **Scheduler/job real.** `SCHEDULED` funciona via checagem de `scheduledAt <= now` no momento da leitura pública, não por um processo em background que muda o status no banco — evita introduzir um componente de 1ª classe novo (nenhum Task-like existe no projeto hoje, `afm.md` § 3 regra 12) só pra isso. O status no banco continua `SCHEDULED` até a próxima escrita naquele post; a *visibilidade* pública é que reflete a data.
- **UI de dashboard de revisão** (lista de posts pendentes pra Admin/Editor revisar, com botões aprovar/rejeitar). Fica exposto via procedures testadas + os botões mínimos necessários no formulário de edição/painel "meus posts" existentes — sem tela nova dedicada (projeto está em fase backend-first, refatoração de frontend planejada mas ainda não desenhada).
- **Notificação ao Author quando o post é aprovado/rejeitado** (email, por exemplo). O motivo de rejeição fica legível via leitura do post (comentários de revisão), sem push ativo.
- **Editar comentários de revisão já criados.** Comentário de revisão é criado uma vez, na hora da ação (aprovar/rejeitar); sem edição/deleção depois.

## 5. Assumptions / Open questions

Sem `[NEEDS CLARIFICATION:]` aberto — as 2 decisões irredutíveis desta rodada (escopo do que entra nesta feature; motivo de rejeição obrigatório ou não) foram resolvidas por pergunta batched (discovery rodada 1/2, `/afm:deliver`) — ver § 7.

- **Premissa:** "aprovar" e "publicar imediatamente" (linguagem do roadmap) são a mesma ação de domínio (`publish`) chamada em status de origem diferente (`IN_REVIEW` vs `DRAFT`) — o roadmap não modela um estado "aprovado mas não publicado" separado (a lista de status da Fase 4 vai direto de `IN_REVIEW` pra `SCHEDULED`/`PUBLISHED`).
- **Premissa:** comentário de revisão (`PostReviewComment`) é criado só quando há conteúdo — obrigatório em rejeição (§ 7), opcional em aprovação (se o Admin/Editor não escrever nada, nenhuma linha é criada pra essa aprovação).

## 6. Dependências

- `docs/roadmap.md` Fase 4 — origem do requisito.
- `013-role-based-permissions` (done) — deixou a restrição de publish/archive e o workflow de revisão explicitamente amarrados a esta feature (`013/spec.md` § 4).
- `src/lib/permissions/` (`013`) — ganha uma ação nova (`post:publish`) na mesma matriz existente, sem mudar a forma do adapter.

## 7. Clarifications

**2026-07-14 (discovery rodada 1/2, `/afm:deliver`):**

- **Q: qual subconjunto da Fase 4 entra nesta rodada?** R: workflow de revisão completo (`IN_REVIEW`/`SCHEDULED`/aprovar/rejeitar/publicar direto/arquivar restrito) + `PostReviewComment`, com `SCHEDULED` resolvido via checagem lazy no momento da leitura (sem scheduler novo). `PostRevision` (histórico de diffs) fica pra depois — mesmo padrão da Fase 2, que adiou upload de imagem pra Fase 8.
- **Q: motivo de rejeição é obrigatório?** R: **Sim**, obrigatório ao rejeitar — mesma lógica de outras regras de negócio explícitas do roadmap ("post sem título não pode ser publicado"). Opcional em aprovação.

---

*Spec NÃO contém: decisão de stack, nomes de função, schema de DB, ordem de tasks. Isso vai pro `plan.md`.*
