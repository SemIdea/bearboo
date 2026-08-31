# Feature 018 — SEO overrides e slug editável com redirect

> **Spec:** o quê e o porquê. Sem decisão de tecnologia.
> **US relacionada(s):** US-015 (Autor/Editor customiza SEO e URL amigável do post)
> **Status:** done (2026-07-18 — `tsc --noEmit` limpo, `yarn test` 302/302 verdes, `yarn lint` limpo; migration aplicada num Postgres real via `docker compose`)
> **Data de abertura:** 2026-07-18

## 1. Problema (do PRD/UST)

`docs/roadmap.md` Fase 5 fica 🟡 Parcial por duas pendências deixadas conscientemente de fora de `015-seo-metadata` por falta de demanda até então (`015-seo-metadata/spec.md § 4`): (1) o Autor/Editor não tem como customizar title/description/canonical de um post quando o conteúdo puro não é o ideal pra compartilhamento (ex: post republicado de outro lugar, título longo demais pro preview); (2) o slug de um post é imutável — se um Autor/Editor perceber um slug ruim (erro de digitação, título mudou), não há como corrigir sem quebrar todo link já compartilhado/indexado.

## 2. Critério de sucesso observável

- [ ] Um post com `seoTitle`/`seoDescription`/`canonicalUrl` preenchidos usa esses valores na metadata da página (`<title>`, meta description, Open Graph, canonical), não os computados de `title`/`content`/URL própria.
- [ ] Um post sem esses campos preenchidos continua com o comportamento de hoje (computado de `title`/`content`/URL própria) — zero regressão.
- [ ] O Autor/Editor consegue editar o slug de um post existente pelo formulário de edição.
- [ ] Acessar o slug antigo de um post editado devolve um redirect permanente (301) pro slug novo — link antigo nunca quebra.
- [ ] Editar o slug pra um valor que já existe em outro post não falha — recebe sufixo numérico, mesmo padrão do slug gerado na criação.

## 3. Cenários (Gherkin, herda da US)

```gherkin
Scenario: Override de SEO é usado na metadata em vez do conteúdo do post
  Given um post com seoTitle="Guia definitivo de X", seoDescription e canonicalUrl preenchidos
  When a página do post é carregada
  Then a metadata (title/description/Open Graph/canonical) usa os valores de override

Scenario: Editar o slug gera redirect automático do antigo pro novo
  Given um post publicado com slug "como-fiz-x"
  When o Autor/Editor edita o slug pra "como-fiz-x-parte-2"
  Then o post responde em "/post/como-fiz-x-parte-2"
  And "/post/como-fiz-x" faz redirect 301 pra "/post/como-fiz-x-parte-2"
```

```gherkin
Scenario: Slug editado colide com o de outro post
  Given um post PUBLISHED com slug "titulo-legal"
  When outro post é editado pro mesmo slug "titulo-legal"
  Then o slug persistido é "titulo-legal-2" (sufixo incremental), sem erro pro usuário
```

## 4. Out of scope

- **Histórico de múltiplos slugs anteriores.** Só o slug imediatamente anterior redireciona (1 coluna `previousSlug`, não uma tabela de histórico). Se o slug for editado 2x, o redirect do primeiro slug (2 edições atrás) deixa de funcionar. Decisão do dono (2026-07-17, discovery desta feature): cobre o caso real ("corrigi um slug ruim uma vez"), não o caso hipotético de reescritas repetidas — mesmo raciocínio YAGNI que já apareceu em `017-post-view-analytics` (sem scheduler) e `014-post-review-workflow` (sem `PostRevision`).
- **UI de preview de como o post aparece no Google/Discord/LinkedIn com os overrides.** Só os campos de texto: sem preview visual.
- **Redirect de slug pra posts deletados.** Fora de escopo — só cobre o caso "slug mudou", não "post não existe mais".
- **Editar slug de post ainda em DRAFT sem nunca ter sido publicado.** Não precisa de redirect (nunca teve link público), mas a edição de slug funciona igual pra qualquer status — só o redirect antigo→novo é condicionado a existir um `previousSlug`, que só existe depois da 1ª edição de slug, independente do status.
- **Validação de que `canonicalUrl` aponta pro próprio domínio ou externo.** Aceita qualquer URL válida — o caso de uso mais comum (cross-posting, ex. republicar no Medium apontando o canonical de volta pro original) é exatamente uma URL de domínio diferente.

## 5. Assumptions / Open questions

- Premissa: quem pode editar o slug é a mesma regra de `post.update` hoje — dono do post OU quem tem `post:editAny` (Admin/Editor). Não é restrito a um papel mais alto, pois mudar URL não é mais sensível que mudar o próprio conteúdo do post (que já é permitido pra esse mesmo grupo).
- Premissa: resolução de colisão de slug na edição reusa o mesmo algoritmo de sufixo numérico incremental já usado na criação (`domain_createPost`), extraído pra um helper compartilhado (`domain_resolveAvailableSlug`).
- Premissa: `seoTitle`/`seoDescription`/`canonicalUrl` são opcionais, sem validação de tamanho mínimo (diferente de `title`/`content`) — texto livre, fallback pro comportamento atual quando vazio.
- Premissa: o redirect acontece na renderização da página (`/post/[slug]/page.tsx`), não em `generateMetadata` — a metadata de uma URL que vai redirecionar fica com o fallback "Post Not Found" (mesmo comportamento de hoje pra slug não encontrado); o crawler segue o 301 real da resposta HTTP e re-lê a metadata correta na URL nova. Trade-off aceito pra não duplicar a lógica de resolução de redirect nos dois lugares.

## 6. Dependências

- `002-post-slug` (done) — introduziu o slug imutável e já previa esta feature como follow-up ("Se o produto quiser permitir edição, é feature nova com redirect").
- `015-seo-metadata` (done) — `generateMetadata` em `post/[slug]/page.tsx` é o ponto que passa a ler os campos de override.
- `docs/roadmap.md` Fase 5 — fecha as 2 pendências que ficavam essa fase em 🟡 Parcial.

## 7. Clarifications

### Session 2026-07-17 (discovery rodada 1/2, `/afm:deliver`)

- Q: a pendência de slug+redirect pressupõe permitir editar slug (capacidade que não existe hoje, deferida por falta de demanda em `015`) — implementar as duas pendências agora (SEO override + slug editável/redirect) ou só a de SEO override, deixando slug/redirect como pendência residual documentada (mesmo padrão da Fase 1)? → R: Implementar as duas agora, fechar a Fase 5 por completo.

---

*Spec NÃO contém: decisão de stack, nomes de função, schema de DB, ordem de tasks. Isso vai pro `plan.md`.*
*Marker `[NEEDS CLARIFICATION:]` ≠ `[A DEFINIR]`. Use o primeiro pra gap que bloqueia execução (resolvido via `/afm:<skill> clarify`); o segundo pra decisão que user adia conscientemente.*
