# Feature 020 — Plan

> **Spec:** [`./spec.md`](./spec.md)
> **Status do plan:** approved
> **Stack inferido:** Next.js 15 / tRPC v11 / Prisma 6 / Postgres / Redis (`ioredis`) — de `ach.md` § 1, sem reabrir discussão.
> **Data:** 2026-07-18

## 1. Approach em 3 frases

Estende o Gateway `viewCounter` (ADR-0013) pra bufferizar, junto do `INCR` já existente, um evento leve por view nova (bucket de origem + user agent bruto) num Redis List; `readDashboard` drena esse buffer (mesmo gatilho lazy que já drena `pendingCounts`) e persiste os eventos numa nova tabela `PostView`, de onde lê os breakdowns de período/origem/UA e descarta linhas com mais de 30 dias. Duas classificações puras novas (`referrerClassifier`, `userAgentClassifier`) entram como Helper-like (`src/lib/`, sem I/O), a primeira aplicada na escrita (bucket já resolvido antes de bufferizar) e a segunda na leitura (categoriza a string bruta salva, sem persistir categoria). Nenhum componente-tipo novo é introduzido (Model/Gateway/Domain/Helper/Procedure já existem no projeto) — só novas instâncias e extensões dos tipos existentes.

## 2. Componentes afetados

| Componente-tipo | Arquivo / módulo | Novo ou edita | Por quê |
| --- | --- | --- | --- |
| Model (schema) | `prisma/schema.prisma` | edita | novo model `PostView` + enum `ReferrerBucket` |
| Model-like | `src/server/models/postView.ts` | novo | `create`, `readBreakdown(sinceDays)`, `deleteOlderThan(sinceDays)` — mesmo padrão de `src/server/models/post.ts` |
| Helper-like | `src/lib/referrerClassifier/adapter.ts` + `implementations/regex.ts` | novo | `classify(referrerHeader: string \| null): ReferrerBucket`, puro, sem I/O |
| Helper-like | `src/lib/userAgentClassifier/adapter.ts` + `implementations/regex.ts` | novo | `classify(userAgent: string): { browser: string; os: string }`, puro, sem I/O |
| Gateway-like | `src/server/integrations/gateway/viewCounter/adapter.ts` | edita | `recordView` ganha 3º parâmetro `event: { referrerBucket, userAgent }`; novo método `drainPendingEvents()` |
| Gateway-like | `.../viewCounter/implementations/{redis,inMemory}.ts` | edita | `redis.ts`: `RPUSH viewcounter:<postId>:events` (JSON por item) + `drainPendingEvents()` via `LRANGE`+`DEL`; `inMemory.ts`: espelha em array por post |
| Test gateway | `src/test/gateways/viewCounter.ts` (`FakeViewCounterGateway`) | edita | mesma extensão, pra manter `TestContext` funcionando sem Redis real |
| Container | `src/server/infra/container/repositories.ts` | edita | registra `postView: PostViewModel` |
| Domain | `src/server/features/analytics/domain/recordView.ts` | edita | resolve `referrerBucket` via `ctx.helpers.referrerClassifier`, passa `{ referrerBucket, userAgent }` pro gateway |
| Domain | `src/server/features/analytics/domain/readDashboard.ts` | edita | drena `pendingEvents`, persiste em lote via `repositories.postView.create`, chama `repositories.postView.deleteOlderThan(30)`, lê breakdown via `repositories.postView.readBreakdown(7)`/`readBreakdown(30)` e agrega navegador/SO com `ctx.helpers.userAgentClassifier` |
| Procedure | `src/server/features/analytics/procedures/recordView.ts` | edita | extrai `ctx.headers.get("referer")` / `.get("user-agent")`, passa pro domain |
| Schema | `src/server/features/analytics/schema.ts` | edita | `readDashboardOutputSchema` ganha `viewsLast7Days`, `viewsLast30Days`, `trafficOrigin[]`, `browsers[]` |
| Container helpers | `src/server/infra/container/helpers.ts` | edita | registra `referrerClassifier`/`userAgentClassifier` (puros → `TestContext` usa a implementação real, sem fake, mesmo padrão de `rateLimit`) |
| UI | `src/app/(half)/analytics/page.client.tsx` | edita | cards de "últimos 7/30 dias" + listas de origem e navegador/SO |

## 3. Modelo de dados (delta)

```prisma
model PostView {
  id             String         @id @default(cuid())
  postId         String
  post           Post           @relation(fields: [postId], references: [id], onDelete: Cascade)
  referrerBucket ReferrerBucket
  userAgent      String
  createdAt      DateTime       @default(now())

  @@index([postId, createdAt])
  @@index([createdAt])
}

enum ReferrerBucket {
  DIRECT
  SEARCH
  SOCIAL
  OTHER
}
```

Sem coluna de IP (decisão do dono, `spec.md § 7`). `userAgent` guarda a string bruta do header; navegador/SO são derivados na leitura (`userAgentClassifier`), não persistidos como coluna própria.

## 4. Decisões arquiteturais

- **Decisão:** bufferizar o evento bruto no Redis (junto do `INCR`/`SADD` já existentes) e só persistir em `PostView` no flush lazy disparado por `readDashboard`. **Alternativa rejeitada:** `INSERT` direto no Postgres a cada `recordView`. **Por quê:** `017-post-view-analytics/spec.md § 2` já fixou como critério de sucesso que registrar view não pode "bloquear/atrasar perceptivelmente o carregamento" — escrever no Postgres a cada request pública reintroduziria exatamente a latência que o buffer Redis (ADR-0013) foi desenhado pra evitar. Mesmo padrão, só estendido pra carregar mais campos por evento.
- **Decisão:** retenção de 30 dias via deleção lazy (`deleteOlderThan` chamado dentro do próprio `readDashboard`, antes de ler o breakdown). **Alternativa rejeitada:** job/cron de limpeza agendado. **Por quê:** `afm.md § 3` regra 12 — não há componente Task-like no projeto hoje; o mesmo princípio já usado pra posts `SCHEDULED` (checar `scheduledAt <= now` na leitura, sem scheduler) se aplica aqui.
- **Decisão:** origem de tráfego é resolvida (bucket) no momento da escrita; user agent é guardado bruto e resolvido (categoria) no momento da leitura. **Alternativa rejeitada:** resolver os dois no mesmo momento (ambos na escrita ou ambos na leitura). **Por quê:** decisão explícita do dono (`spec.md § 7`) — bucket de referrer é uma classificação grosseira e estável (4 valores fixos, sem perda de informação relevante ao gravar já classificado), enquanto categorizar UA na leitura evita fixar uma taxonomia de navegador/SO no schema antes de validar as strings reais em produção.
- **Decisão:** `referrerClassifier`/`userAgentClassifier` são Helper-like (`src/lib/`), não Gateway-like. **Alternativa rejeitada:** colocar como parte do Gateway `viewCounter`. **Por quê:** são funções puras sem I/O (só regex sobre uma string) — ADR-0013 já formalizou a distinção "puro/local vai em `IHelpers`, I/O real vai em `IGateways`"; `TestContext` usa a implementação real desses helpers sem precisar de fake, igual `rateLimit`/`permissions`.

## 5. Contratos (boundaries externos)

### Boundary `analytics.readDashboard` (edita output existente)

```ts
// input
{} // sem mudança

// output (sucesso) — estende o shape atual
{
  totalViews: number,
  posts: { id: string, title: string, slug: string, viewCount: number }[], // já existia
  viewsLast7Days: number,
  viewsLast30Days: number,
  trafficOrigin: { bucket: "DIRECT" | "SEARCH" | "SOCIAL" | "OTHER", count: number }[],
  browsers: { name: string, count: number }[],
}

// errors (sem mudança)
"FORBIDDEN" (papel insuficiente)
```

### Boundary `analytics.recordView` (sem mudança de shape, input/output idênticos)

Extração de `referer`/`user-agent` acontece no boundary a partir de `ctx.headers` (já disponível no contexto tRPC), não como novo campo de input — o cliente não envia nada a mais.

## 6. Complexity tracking

| Complexidade aceita | Alternativa simples rejeitada | Por quê não foi simples |
| --- | --- | --- |
| Buffer de eventos no Redis (2ª estrutura além do `pendingCounts`) | `INSERT` direto no Postgres por view | Reintroduziria latência no caminho de leitura pública — já rejeitado uma vez em `017` pelo mesmo motivo |
| Deleção lazy dentro do `readDashboard` | Cron/job de limpeza agendado | Regra dura 12 — sem componente Task-like hoje; precedente de `SCHEDULED` posts já resolve o mesmo tipo de problema sem scheduler |

## 7. Validação contra invariantes

- [x] Não viola regras duras de `afm.md` § 3 — regra 1 (teste por componente novo, cada task nasce RED), regra 7 (`postView.ts` não é `domain/`, é Model-like — sem restrição de export único), regra 12 (retenção lazy, sem Task-like novo), regra 15/16 (domain não importa `TRPCError`; Zod só em `schema.ts` de boundary), regra 32 (branch `feature/020-view-analytics-breakdown` criado a partir de `develop`).
- [x] Princípios universais de `PRINCIPLES.md` respeitados — discovery resolveu os 4 irredutíveis via `AskUserQuestion` batched (1 rodada, dentro do cap de 2); nada chutado sem evidência.
- [x] `[NEEDS CLARIFICATION:]` zerado — as 4 premissas de `spec.md § 5` foram todas resolvidas em `spec.md § 7`, sem marker aberto.

## 8. Riscos

- **Redis List de eventos crescendo sem limite se o dashboard não for lido por muito tempo.** Mitigação: mesmo perfil de risco que `pendingCounts` já tem hoje (aceito em `017`); se virar problema real, drenar por TTL/cron fica candidato a Fase 9/10 (observabilidade), não bloqueia esta entrega.
- **Classificação por regex de UA/referrer é aproximada** (bots, navegadores raros caem em "OTHER"/"Unknown"). Mitigação: aceitável pra dashboard interno de baixo tráfego — não é analytics de billing/compliance.

## 9. Open questions

*(nenhuma — as 4 decisões load-bearing desta feature já foram resolvidas em `spec.md § 7`)*

---

*Plan NÃO contém: lista granular de tasks (vai pro `tasks.md`). Plan NÃO escolhe stack — lê de `ach.md`. Se camada relevante de `ach.md` está como `[A DEFINIR]`, marca aqui e bloqueia tasks até resolver.*
