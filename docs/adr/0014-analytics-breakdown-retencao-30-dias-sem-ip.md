# ADR-0014 — Breakdown de analytics: eventos brutos retidos 30 dias, sem IP persistido

> **Status:** Aceita
> **Data:** 2026-07-18
> **Decidido por:** dono do produto

## Contexto

A feature 017 (Analytics de visualizações, RF-12/US-014) entregou total de views e ranking de mais acessados, mas adiou explicitamente contagem por período (7/30 dias), origem de tráfego e user agent — `017-post-view-analytics/spec.md § 4` registrava que capturar esses dados brutos "levanta questão de retenção/privacidade que não foi discutida ainda". A feature 020 fecha essa lacuna e precisa de uma decisão explícita: hoje não existe nenhuma tabela de evento por-view (só `Post.viewCount` agregado), então qualquer breakdown exige persistir algum dado bruto por visita.

## Decisão

**Eventos brutos (`PostView`) retêm por 30 dias via deleção lazy no read; nenhum IP (bruto ou hasheado) é persistido em nenhum momento.**

- `prisma/schema.prisma`: `PostView { postId, referrerBucket: ReferrerBucket, userAgent, createdAt }` — sem coluna de IP, sem `visitorId` (dedup já resolvido via Redis, `ADR-0013`).
- Origem de tráfego é resolvida (bucket `DIRECT`/`SEARCH`/`SOCIAL`/`OTHER`) **na escrita**, a partir do header `Referer` — a URL bruta do referrer nunca é persistida, só a classificação.
- User agent é persistido **bruto**, categorizado (navegador/SO) sob demanda **na leitura**, via regex simples (`src/lib/userAgentClassifier/`) — sem lib de parsing dedicada.
- Retenção: `src/server/features/analytics/domain/readDashboard.ts` chama `repositories.postView.deleteOlderThan(30)` a cada leitura do dashboard, antes de agregar os breakdowns — mesmo princípio já usado pra posts `SCHEDULED` (checagem lazy no read, sem scheduler novo, `afm.md § 3` regra 12).
- O evento é bufferizado no Redis (`RPUSH viewcounter:<postId>:events`, junto do `INCR` já existente do Gateway `viewCounter`) e só chega ao Postgres no flush lazy — não é um `INSERT` por request pública, pelo mesmo motivo de latência que já justificou o buffer de contagem em `ADR-0013`.

## Alternativas consideradas

- **Reter indefinidamente (sem deleção)** — rejeitada: mais simples de implementar, mas contraria diretamente a preocupação de privacidade que motivou o adiamento original em `017`.
- **Armazenar hash do IP** — rejeitada: abriria porta pra geolocalização futura, mas nenhum critério de aceitação hoje pede isso, e dedup já está resolvido via cookie — adicionar um identificador re-identificável sem uso concreto não se justifica.
- **Capturar parâmetros UTM além do `Referer`** — rejeitada por ora: mais preciso pra campanhas, mas exige padronizar/mudar os links de divulgação do blog, escopo maior do que o roadmap pedia.

## Consequência

- **Fica fácil:** adicionar novos breakdowns derivados de `userAgent`/`referrerBucket` no futuro sem tocar em retenção/privacidade de novo (a política já está centralizada em `deleteOlderThan`).
- **Fica difícil / débito aceito:** sem breakdown de geolocalização (nenhum IP persistido) — se um dia for pedido, exige nova decisão de privacidade, não é extensão trivial do que existe hoje. Classificação de UA/referrer por regex é aproximada (bots e navegadores raros caem em "Unknown"/"OTHER") — aceitável para dashboard interno de baixo tráfego, não para analytics de billing/compliance.
- **Gotcha pra outros devs:** se o buffer de eventos no Redis (`viewcounter:<postId>:events`) não for drenado por muito tempo (dashboard não lido), ele cresce sem limite — mesmo perfil de risco que `pendingCounts` já tinha desde `017`, não é regressão nova.

## Referências

- US/RF relacionado: US-014 / RF-12.
- Doc canônico: `docs/features/020-view-analytics-breakdown/spec.md § 4/§ 7`, `docs/features/020-view-analytics-breakdown/plan.md § 3/§ 4`.
- ADRs relacionados: `ADR-0013` (Gateway Redis pra contagem/dedup de views — o buffer que esta ADR estende).
