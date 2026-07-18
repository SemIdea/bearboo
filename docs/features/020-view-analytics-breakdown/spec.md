# Feature 020 — Breakdown de analytics por período, origem e user agent

> **Spec:** o quê e o porquê. Sem decisão de tecnologia.
> **US relacionada(s):** US-014 (Admin/Editor acompanha visualizações de post)
> **Status:** planned
> **Data de abertura:** 2026-07-18

## 1. Problema (do PRD/UST)

O Admin/Editor (persona autenticada de `013-role-based-permissions`) hoje só vê, no dashboard de analytics (`017-post-view-analytics`), o total acumulado de views e o ranking de mais acessados — sem nenhuma noção de tendência (a leitura cresceu ou caiu nas últimas semanas?) nem de onde os leitores vêm (busca, social, direto?) ou como acessam (navegador/SO). `docs/roadmap.md` Fase 7 pede fechar essa lacuna com contagem por período (7/30 dias), origem de tráfego e user agent — itens explicitamente adiados na rodada anterior (`017-post-view-analytics/spec.md § 4`) até decidir retenção/privacidade de dados brutos, decisão agora tomada (ver § 7).

## 2. Critério de sucesso observável

- [ ] Admin/Editor vê, no dashboard de analytics, o total de views dos últimos 7 dias e dos últimos 30 dias (além do total acumulado que já existia).
- [ ] Admin/Editor vê um breakdown de origem de tráfego (direto / busca orgânica / social / outro).
- [ ] Admin/Editor vê um breakdown de navegador/SO dos visitantes.
- [ ] Nenhum IP de visitante é armazenado em nenhum momento (raw ou hash).
- [ ] Eventos brutos de view (usados pro breakdown) mais velhos que 30 dias deixam de contar pra qualquer métrica — sem exigir job/cron novo (verificação: `afm.md § 3` regra 12).
- [ ] O comportamento existente (`totalViews`, ranking de mais acessados, dedup 24h por visitante, restrição a Admin/Editor) continua idêntico — nenhuma regressão.

## 3. Cenários (Gherkin, herda da US)

```gherkin
Scenario: Dashboard mostra views dos últimos 7 e 30 dias
  Given um post com views registradas em datas diferentes, algumas há mais de 30 dias
  When um Admin/Editor abre o dashboard de analytics
  Then o dashboard mostra a contagem de views dos últimos 7 dias e dos últimos 30 dias
  And views com mais de 30 dias não entram nessas contagens

Scenario: Dashboard mostra origem de tráfego
  Given visitas com header Referer de busca (ex: google.com), de rede social (ex: twitter.com), sem Referer (direto) e de outro site
  When um Admin/Editor abre o dashboard de analytics
  Then o dashboard mostra a contagem de views por categoria de origem (direto/busca/social/outro)

Scenario: Dashboard mostra breakdown de navegador/SO
  Given visitas de diferentes User-Agents (ex: Chrome/Windows, Safari/iOS)
  When um Admin/Editor abre o dashboard de analytics
  Then o dashboard mostra a contagem de views por navegador/SO reconhecido

Scenario: Views antigas não contam mais pro breakdown (retenção)
  Given uma view registrada há mais de 30 dias
  When o dashboard de analytics é lido novamente
  Then essa view não aparece em nenhum dos breakdowns nem é recontada nas métricas de período
  And o registro bruto correspondente deixa de existir (dado descartado, não só filtrado)

Scenario: Comportamento existente sem regressão
  Given o mesmo cenário de dedup/ranking/restrição de acesso já coberto por US-014
  When as ações equivalentes ocorrem
  Then o resultado é idêntico ao comportamento já testado em `017-post-view-analytics`
```

## 4. Out of scope

- Captura de parâmetros UTM (`utm_source` etc.) — origem de tráfego usa só o header `Referer` já disponível em toda request, sem exigir mudar links de divulgação (decisão do dono, ver § 7).
- Parsing de user agent via lib dedicada (ex: `ua-parser-js`) — categorização leve por regex, suficiente pra um dashboard interno de baixo tráfego (decisão do dono, ver § 7).
- Armazenamento de IP (bruto ou hash) — não há hoje nenhum critério de aceitação que dependa de geolocalização (decisão do dono, ver § 7).
- Breakdown por período customizável (date range picker) — só 7 e 30 dias fixos, como o roadmap descreve.
- Exportação/download dos dados de analytics.

## 5. Assumptions / Open questions

- **Premissa:** eventos brutos (referrer bucket + user agent) são retidos por 30 dias e descartados depois — decisão do dono, 2026-07-18 (ver § 7).
- **Premissa:** nenhum IP é persistido — decisão do dono, 2026-07-18 (ver § 7).
- **Premissa:** origem de tráfego é classificada a partir do header `Referer` em 4 buckets (direto/busca/social/outro), sem infra de UTM — decisão do dono, 2026-07-18 (ver § 7).
- **Premissa:** user agent é guardado como string bruta e categorizado sob demanda na leitura (regex leve, sem lib nova) — decisão do dono, 2026-07-18 (ver § 7).
- **Premissa:** a deduplicação de visitante em 24h (já existente, `017`) não muda — o novo evento bruto só é gravado quando o `viewCounter` já confirmou que é uma view nova (`counted: true`).

## 6. Dependências

- `017-post-view-analytics` (done) — dashboard, Gateway `viewCounter` (ADR-0013) e dedup que esta feature estende.
- `013-role-based-permissions` (done) — restrição do dashboard a Admin/Editor, sem mudança.
- `docs/research/002-redis-view-counting.md` — padrão de buffer Redis + flush lazy que esta feature reaproveita pro novo evento bruto.

## 7. Clarifications

### Session 2026-07-18

- Q: Quanto tempo reter os eventos brutos de view? → A: 30 dias, com deleção lazy no read (mesmo padrão já usado pra `SCHEDULED` posts — checa/limpa na leitura, sem cron novo).
- Q: Armazenar IP do visitante (bruto ou hasheado)? → A: Não armazenar IP algum — dedup já resolvido via cookie (ADR-0013), origem de tráfego vem do `Referer`, não de geoIP.
- Q: O que conta como "origem de tráfego"? → A: Classificar o header `Referer` em buckets (direto/busca orgânica/social/outro site), sem infra de UTM.
- Q: User agent — string bruta ou lib de parsing dedicada? → A: String bruta + categorização leve por regex na leitura, sem dependência nova.

---

*Spec NÃO contém: decisão de stack, nomes de função, schema de DB, ordem de tasks. Isso vai pro `plan.md`.*
*Marker `[NEEDS CLARIFICATION:]` ≠ `[A DEFINIR]`. Use o primeiro pra gap que bloqueia execução (resolvido via `/afm:<skill> clarify`); o segundo pra decisão que user adia conscientemente.*
