# ADR-0015 — Gateway `mediaStorage` pluggável: local nesta rodada, port pronto pra CDN de imagem

> **Status:** Aceita e implementada
> **Data:** 2026-07-26
> **Decidido por:** dono do produto

## Contexto

A feature 021 (Upload e gerenciamento de mídia, RF-13/US-016) precisa persistir arquivo de imagem enviado por usuário autenticado. O projeto não tem S3/R2/MinIO configurado (`docker-compose.yml` só tem `postgres`/`cache`/`nginx`), e o roadmap (Fase 8) já recomendava "comece com armazenamento local em desenvolvimento". O dono confirmou no gate desta entrega que o destino real é Cloudinary, mas sem conta/credencial configurada ainda — a implementação concreta desta rodada é só local.

Duas decisões precisavam ficar registradas antes do código, porque mudam depois de implementadas: (1) qual mecanismo de transporte carrega o arquivo do browser pro servidor, e (2) que shape o storage devolve pro domain guardar.

## Decisão

**`mediaStorage` é um Gateway-like** (mesmo padrão de `mailer`/`viewCounter`, `ADR-0013`), registrado em `IGateways`, com só uma implementação concreta nesta rodada:

- `src/server/integrations/gateway/mediaStorage/adapter.ts` — `IMediaStorageGatewayAdapter`: `save({ buffer, filename, mimeType }): Promise<{ url, storageKey }>`, `delete(storageKey): Promise<void>`.
- `implementations/local.ts` — `LocalMediaStorage`, grava em `env.media.uploadDir` (default `public/uploads`), devolve `{ url: "/uploads/<storageKey>", storageKey }`.
- `src/test/gateways/mediaStorage.ts` — `FakeMediaStorageGateway` (in-memory), injetada em `createFakeGateways()`.

**O port devolve `{ url, storageKey }`, não só `url`.** `Media.storageKey` é um identificador opaco de storage, distinto da URL pública — um storage futuro tipo Cloudinary usa `public_id` pra apagar/transformar, que não é a mesma coisa que a URL. Guardar os dois agora evita uma migration só pra adicionar a coluna quando o storage trocar.

**Upload sobe pela mesma rota tRPC (`/api/trpc`), sem route handler novo.** `media.upload` usa `.input(z.instanceof(FormData).transform(...))` — o content-type handler nativo do tRPC v11 (`fetchRequestHandler`) entrega a `FormData` bruta como raw input quando o `content-type` é `multipart/form-data`, então o schema não pode ser um `z.object()` comum, tem que aceitar `FormData` e extrair os campos no `.transform()`. **Achado tarde, corrigido antes de comitar:** `httpBatchLink` (o link default do client, `src/context/trpc/client.ts`) serializa todo op do batch em JSON — ele não sabe lidar com `FormData`/`File`. Só o `httpLink` não-batched trata isso (`getBody: () => input`, sem JSON). A correção foi adicionar `splitLink`: `isNonJsonSerializable(op.input)` roteia só o upload pro `httpLink`; todo o resto continua no `httpBatchLink`. Esse bug não aparecia nos testes de procedure porque `createCaller` invoca o resolver direto, sem passar pelo client link nem pelo content-type handler — só foi pego rodando um dev server real e testando upload/list/delete via `curl -F` contra o endpoint HTTP de verdade.

## Alternativas consideradas

- **Route handler dedicado (`src/app/api/media/upload/route.ts`) fora do tRPC** — rejeitada. Seria o primeiro boundary HTTP não-tRPC do projeto que escreve dado (os que existem — `sitemap.ts`/`robots.ts`/`feed.xml` — só leem), gatilhando a regra dura 11 sem necessidade real, já que o tRPC v11 já suporta `multipart/form-data` nativamente.
- **Já implementar `CloudinaryMediaStorage` nesta rodada** — rejeitada pelo dono no gate (2026-07-26): sem conta/credencial configurada agora; local bate com a recomendação do próprio roadmap e não bloqueia a entrega.
- **Guardar só a `url`, sem `storageKey`** — rejeitada: suficiente pro `LocalMediaStorage`, mas fecharia a porta de trocar pra um storage cujo identificador de exclusão diverge da URL pública.
- **Base64 do arquivo dentro de um input JSON comum** — rejeitada: evitaria o problema de `httpBatchLink`, mas infla o payload ~33% e não é o mecanismo que o tRPC v11 já oferece de graça.

## Consequência

- **Fica fácil:** trocar `LocalMediaStorage` por `CloudinaryMediaStorage` depois é só um arquivo novo em `implementations/` + credenciais no `env` (mesmo padrão do SMTP do `mailer`) — domain/procedure/schema não mudam.
- **Fica difícil / débito aceito:** sem teste de integração automatizado do `splitLink` (o `vitest` roda via `createCaller`, que não exercita o client link) — a verificação desta rodada foi manual, contra um dev server real. Se o `splitLink` regredir no futuro (ex. upgrade de `@trpc/client`), só um teste e2e pegaria — candidato a Fase 9/10 quando existir suíte e2e real.
- **Precedente pra próximo upload/boundary não-JSON:** qualquer procedure que precise de `File`/`Blob`/`FormData` no input tem que passar pelo `splitLink`, não só declarar o schema — documentado aqui pra não se perder de novo.

## Referências

- US/RF relacionado: US-016 / RF-13.
- Doc canônico: `docs/features/021-media-upload/plan.md` § 4, `docs/features/021-media-upload/spec.md`.
- ADRs relacionados: `docs/adr/0013-gateway-redis-view-counter.md` (padrão Gateway-like pluggável, mesmo raciocínio de "I/O real vai em `IGateways`, não `IHelpers`").
