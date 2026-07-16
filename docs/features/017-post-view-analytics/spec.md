# Feature 017 — Analytics de visualizações por post

> **Spec:** o quê e o porquê. Sem decisão de tecnologia.
> **US relacionada(s):** US-014 (Admin/Editor acompanha visualizações de post)
> **Status:** done (2026-07-16 — `tsc --noEmit` limpo, `vitest` 286/286 verdes incl. 18 testes novos; `yarn build` verde (`/analytics` prerenderou); verificado ao vivo contra Postgres/Redis reais via `next dev` — `analytics.recordView` conta a 1ª view, dedup confirmado na 2ª chamada com o mesmo cookie, `NOT_FOUND` pra post inexistente, chaves reais no Redis (`viewcounter:<id>:pending`/`:visitors:<data>`); `analytics.readDashboard` confirmado `FORBIDDEN`/`INSUFFICIENT_ROLE` pra usuário `AUTHOR` autenticado de verdade)
> **Data de abertura:** 2026-07-15

## 1. Problema (do PRD/UST)

Hoje o Admin/Editor (persona autenticada de `013-role-based-permissions`) não tem nenhuma visibilidade sobre quais posts performam melhor — não existe registro de visualização nem contagem de qualquer tipo. `docs/roadmap.md` Fase 7 (Analytics interno) pede fechar essa lacuna: registrar visualização de post público e dar ao Admin/Editor um dashboard com total de views e ranking de mais acessados, pra decidir onde investir esforço editorial sem depender de intuição.

## 2. Critério de sucesso observável

- [x] Toda vez que um leitor abre a página pública de um post `PUBLISHED` (ou `SCHEDULED` já vencido), uma visualização é registrada — sem bloquear/atrasar perceptivelmente o carregamento da página pro leitor.
- [x] Acessar a mesma URL em modo preview (dono vendo o próprio `DRAFT`/`ARCHIVED`, `011-post-status-preview`) não gera view pública.
- [x] Admin/Editor autenticado consegue ver, por post, o total de visualizações acumuladas.
- [x] Admin/Editor autenticado consegue ver um ranking dos posts mais visualizados.
- [x] Usuário sem papel Admin/Editor (ex: Author) não consegue acessar esse dashboard.
- [x] Um visitante que recarrega a mesma página do post dentro de uma janela de 24h não gera uma nova view (deduplicado via cookie de primeira parte, decisão do dono — ver § 7).

## 3. Cenários (Gherkin, herda da US)

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

Scenario: Visualização duplicada do mesmo visitante não é recontada
  Given um leitor que já abriu a página de um post PUBLISHED há 5 minutos
  When o mesmo leitor recarrega a mesma página do mesmo post
  Then nenhuma nova view é registrada pra aquele post
```

## 4. Out of scope

- **Contagem de views por período (últimos 7/30 dias).** Fica pra rodada futura — decisão do dono, 2026-07-15 (ver § 7). Esta rodada entrega só total acumulado + ranking de mais acessados.
- **Origem de tráfego, user agent, referrer.** Fica pra rodada futura — decisão do dono, 2026-07-15 (ver § 7). Além de escopo maior, capturar UA/referrer brutos levanta questão de retenção/privacidade que não foi discutida ainda; melhor resolver isso separadamente quando o item entrar em pauta.

## 5. Assumptions / Open questions

- **Premissa:** view é deduplicada por visitante dentro de uma janela de 24h (não por carregamento de página bruto) — decisão do dono, 2026-07-15 (ver § 7). Mecanismo (cookie de primeira parte, sem PII, sem tracking cross-site) já investigado em `docs/features/017-post-view-analytics/research.md`; **spec não decide o mecanismo exato**, cabe ao `plan.md`.
- **Premissa:** visibilidade de "o que conta como visualização pública" segue a mesma regra de `publicVisibilityFilter()` já usada em `readRecent`/`readBySlug`/`search` (`PUBLISHED` ou `SCHEDULED` já vencido) — preview do dono (`011-post-status-preview`) não deve inflar a contagem.
- Decisão de tecnologia (como a contagem é implementada — Redis como buffer de write-behind, evitando message broker dedicado tipo Kafka) já investigada em `docs/research/002-redis-view-counting.md`; **spec não decide isso**, cabe ao `plan.md`.

## 6. Dependências

- `004-post-status` (done) — `publicVisibilityFilter()` reusado pra decidir o que conta como visualização pública.
- `013-role-based-permissions` (done) — `roleProcedure`/matrix de permissões, base pra restringir o dashboard a Admin/Editor.
- `011-post-status-preview` (done) — preview do dono não deve gerar view pública.
- `docs/research/002-redis-view-counting.md` — insumo técnico pro `plan.md` (Redis já é dependência aceita via `ADR-0003`/`ADR-0009`, mas sem adapter ativo hoje).
- `docs/features/017-post-view-analytics/research.md` — insumo técnico pro `plan.md` sobre o mecanismo de dedup (cookie de primeira parte + Redis SET com TTL).

## 7. Clarifications

### Session 2026-07-15

- Q: Quais dos 8 itens da Fase 7 entram nesta rodada da feature 017? → A: Só o core — registrar view + total + posts mais acessados + dashboard restrito a Admin/Editor (já em § 2). Breakdown por período (7/30 dias) e origem de tráfego/referrer/user agent ficam pra rodada futura (§ 4).
- Q: A dedup de visitante (pesquisada em `research.md`) entra nesta rodada? → A: Sim — 1 view por visitante a cada 24h, via cookie de primeira parte (§ 2, § 3, § 5).

---

*Spec NÃO contém: decisão de stack, nomes de função, schema de DB, ordem de tasks. Isso vai pro `plan.md`.*
*Marker `[NEEDS CLARIFICATION:]` ≠ `[A DEFINIR]`. Use o primeiro pra gap que bloqueia execução (resolvido via `/afm:<skill> clarify`); o segundo pra decisão que user adia conscientemente.*
