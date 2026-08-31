# Feature 021 — Plan

> **Spec:** [`./spec.md`](./spec.md)
> **Status do plan:** approved
> **Stack inferido:** Next.js 15 / tRPC v11 / Prisma 6 / Postgres — de `ach.md` § 1, sem reabrir discussão.
> **Data:** 2026-07-26

## 1. Approach em 3 frases

Upload de arquivo passa pela mesma rota tRPC existente (`/api/trpc/[trpc]`) — tRPC v11 detecta `multipart/form-data` nativamente e entrega o `File` já parseado no `.input()`, então não é criado nenhum route handler novo (evita gatilhar regra dura 11). Um Gateway novo `mediaStorage` (mesmo padrão de `mailer`/`viewCounter` — port + implementação injetada via container) persiste o arquivo; a implementação desta rodada (`LocalMediaStorage`) grava em `public/uploads/` e devolve URL pública, servida diretamente pelo `next start` (sem `output: "standalone"`, `public/` é lido do disco a cada request). O port devolve `{ url, storageKey }` (não só `url`) para não fechar a porta de uma implementação futura tipo Cloudinary, cujo identificador de exclusão/transformação (`public_id`) não é a mesma coisa que a URL pública.

## 2. Componentes afetados

| Componente-tipo | Arquivo / módulo | Novo ou edita | Por quê |
| --- | --- | --- | --- |
| Model (schema) | `prisma/schema.prisma` | edita | novo model `Media`, relação `User.media` |
| Model | `src/server/models/media.ts` | novo | `MediaModel` (`BaseModel<IMediaEntity>` + `readByUser(uploadedById \| null)`), mesmo padrão de `CategoryModel` |
| Gateway-like | `src/server/integrations/gateway/mediaStorage/adapter.ts` | novo | `IMediaStorageGatewayAdapter` — `save({ buffer, filename, mimeType }): Promise<{ url, storageKey }>`, `delete(storageKey): Promise<void>` |
| Gateway-like | `.../mediaStorage/implementations/local.ts` | novo | `LocalMediaStorage` — grava em `public/uploads/<uid>-<filename sanitizado>`, devolve `{ url: "/uploads/<arquivo>", storageKey: "<arquivo>" }` |
| Test gateway | `src/test/gateways/mediaStorage.ts` | novo | `FakeMediaStorageGateway` (`Map` em memória), mesmo molde de `FakeViewCounterGateway`/`FakeMailerGateway` |
| Container | `src/server/infra/container/gateways.ts` | edita | registra `mediaStorage: resolveMediaStorageGateway()` (só `LocalMediaStorage` nesta rodada — sem branch de ambiente, diferente de `mail`/`viewCounter`, porque não há 2ª implementação ainda) |
| Container | `src/server/infra/container/repositories.ts` | edita | registra `media: MediaModel` |
| Env | `src/lib/env/index.ts` | edita | `media: { uploadDir, maxUploadSizeBytes }` (defaults `public/uploads`, `5_000_000`) |
| Helper (permissão) | `src/lib/permissions/adapter.ts` + `implementations/matrix.ts` | edita | nova ação `media:deleteAny` → `["ADMIN", "EDITOR"]`, mesmo padrão de `post:deleteAny` |
| Shared error | `src/shared/error/domainError.ts` | novo | `DomainError<C>` genérico (Opção B de `docs/rubrics/error-classification.md`) — primeiro domain novo desde a adoção forward-only da regra 15, não existe ainda no projeto |
| Shared error | `src/shared/error/media.ts` | novo | `MediaErrorCode.MEDIA_NOT_FOUND` / `MEDIA_DELETE_FORBIDDEN` (mesmo padrão de `PostErrorCode`) |
| Schema | `src/server/features/media/schema.ts` | novo | `uploadMediaSchema` (`z.instanceof(File)` + `.refine()` de mimeType/tamanho), `readOwnMediaOutputSchema`, `deleteMediaSchema` |
| Domain | `src/server/features/media/domain/upload.ts` | novo | grava via `ctx.gateways.mediaStorage.save`, cria o `Media` via `ctx.repositories.media.create` |
| Domain | `src/server/features/media/domain/readOwn.ts` | novo | `can(role, "media:deleteAny")` → `null` (lê de todos) : `userId` (só o próprio) — mesmo padrão de `domain_readOwnPosts` |
| Domain | `src/server/features/media/domain/delete.ts` | novo | dono OU `media:deleteAny`; apaga arquivo físico (`ctx.gateways.mediaStorage.delete`) antes do registro; lança `DomainError` (não `TRPCError` — regra 15 forward-only) |
| Procedure | `src/server/features/media/procedures/{upload,readOwn,delete}.ts` | novo | mapeiam `DomainError` → `TRPCError` no boundary (único ponto que conhece transport) |
| Router | `src/server/features/media/index.ts` | novo | `MediaRouter` |
| Router raiz | `src/server/routers/app.routes.ts` | edita | registra `media: MediaRouter` |
| UI | `src/app/(half)/media/page.tsx` + `page.client.tsx` | novo | grid da biblioteca, form de upload (`altText` opcional), apagar |
| UI | formulário de criar/editar post | edita | opção "usar mídia enviada" que preenche `coverImageUrl` (campo já existente, sem migration em `Post`) |
| Infra | `docker-compose.yml` | edita | volume `uploads:/app/public/uploads` no serviço `app`, pra sobreviver a restart do container (mesmo raciocínio de `pgdata`/`redisdata`) |
| Infra | `.gitignore` | edita | ignora `public/uploads/*` (mantém a pasta via `.gitkeep`) |

## 3. Modelo de dados (delta)

```prisma
model Media {
  id           String   @id
  url          String
  storageKey   String
  filename     String
  mimeType     String
  size         Int
  altText      String?
  uploadedById String
  uploadedBy   User     @relation(fields: [uploadedById], references: [id], onDelete: Cascade)
  createdAt    DateTime @default(now())

  @@index([uploadedById])
}
```

`User` ganha `media Media[]` na lista de relações (mesmo padrão de `Post`/`Session`/`comments`).

## 4. Decisões arquiteturais

- **Decisão:** upload via `FormData`/`File` no `.input()` da mesma rota tRPC existente. **Alternativa rejeitada:** route handler dedicado (`src/app/api/media/upload/route.ts`) fora do tRPC. **Por quê:** tRPC v11 (`^11.0.0-rc.789`, já no `package.json`) já detecta `multipart/form-data` no `fetchRequestHandler` e entrega o `File` parseado (confirmado no bundle: `resolveResponse` checa `content-type.startsWith("multipart/form-data")`; `@trpc/client` exporta `isFormData`/`isNonJsonSerializable`). Um route handler novo introduziria o primeiro boundary HTTP não-tRPC do projeto pra escrita (os que existem hoje — `sitemap.ts`/`robots.ts`/`feed.xml` — são só leitura), gatilhando regra dura 11 sem necessidade.
- **Decisão:** storage local (`public/uploads/`) nesta rodada, port pronto pra trocar depois. **Alternativa rejeitada:** já implementar contra Cloudinary. **Por quê:** decisão do dono no gate desta entrega (2026-07-26) — sem conta/credencial Cloudinary configurada agora; local bate com a própria recomendação do roadmap ("comece com armazenamento local em desenvolvimento") e o Dockerfile não usa `output: "standalone"`, então `public/` é servido direto do disco em runtime sem precisar de um route handler de streaming.
- **Decisão:** o port devolve `{ url, storageKey }`, não só `url`. **Alternativa rejeitada:** guardar só a URL pública (suficiente pro `LocalMediaStorage`). **Por quê:** discussão explícita com o dono no gate — `Media.url` sozinho não seria suficiente pra apagar num storage cujo identificador de exclusão difere da URL pública (Cloudinary usa `public_id`, não a URL). Guardar os dois agora evita migration futura só pra adicionar a coluna quando o storage trocar.
- **Decisão:** `DomainError<C>` genérico novo em `src/shared/error/domainError.ts`, e `media/domain/*.ts` não importa `TRPCError`. **Alternativa rejeitada:** seguir o padrão predominante hoje (17/30 arquivos de domain lançam `TRPCError` direto). **Por quê:** regra dura 15 é forward-only (`afm.md § 3.1`) — aplica a partir de 2026-06-30 pra código novo. `media` é feature nova, não há exceção de boy-scope aqui: a rubrica `docs/rubrics/error-classification.md` já prescrevia esse desenho (Opção B), só não havia sido usado ainda.
- **Decisão:** apagar mídia de terceiros é uma ação nova na matriz de permissões (`media:deleteAny`), não uma matriz separada. **Alternativa rejeitada:** helper de permissão dedicado só pra mídia. **Por quê:** mesmo padrão já estabelecido de `post:deleteAny`/`category:manage` — `IPermissionAction` já é uma união de ações de domínios diferentes na mesma matriz fixa; introduzir um 2º helper de permissão pra um caso que se encaixa perfeitamente no existente seria duplicação, não separação de responsabilidade.

## 5. Contratos (boundaries externos)

### Boundary `media.upload`

```ts
// input (multipart/form-data — via FormData no client)
{ file: File, altText?: string }
// validação no schema: mimeType em [image/jpeg, image/png, image/webp, image/gif]; size <= MAX_UPLOAD_SIZE_BYTES (default 5_000_000)

// output (sucesso)
{ id: string, url: string, filename: string, mimeType: string, size: number, altText: string | null, uploadedById: string, createdAt: Date }

// errors
"BAD_REQUEST" (zodError — formato/tamanho inválido, mapeado automático pelo errorFormatter existente)
"UNAUTHORIZED" (não logado)
```

### Boundary `media.readOwn`

```ts
// input
{}

// output (sucesso)
Array<{ id, url, filename, mimeType, size, altText, uploadedById, createdAt }>
// Admin/Editor recebem mídia de todos os usuários; Author só a própria (mesmo padrão de post.readOwn)

// errors
"UNAUTHORIZED" (não logado)
```

### Boundary `media.delete`

```ts
// input
{ id: string }

// output (sucesso)
{ success: boolean }

// errors
"NOT_FOUND" (MEDIA_NOT_FOUND)
"FORBIDDEN" (MEDIA_DELETE_FORBIDDEN — não é dono nem tem media:deleteAny)
"UNAUTHORIZED" (não logado)
```

## 6. Complexity tracking

| Complexidade aceita | Alternativa simples rejeitada | Por quê não foi simples |
| --- | --- | --- |
| Gateway novo (`mediaStorage`) em vez de escrever direto no domain | `fs.writeFile` chamado direto de `domain_uploadMedia` | Domain não deve fazer I/O direto (mesmo critério de `viewCounter`/`mailer`); sem o port, trocar pra Cloudinary depois exigiria reescrever o domain, não só trocar uma implementação |
| `DomainError` genérico novo | Continuar lançando `TRPCError` direto no domain, igual ao legado | Regra dura 15 é forward-only — código novo não herda a dívida do código legado |

## 7. Validação contra invariantes

- [x] Não viola regras duras de `afm.md` § 3 — regra 7 (1 export por arquivo de domain), regra 11 (decisão de boundary/storage validada com o dono no gate desta sessão), regra 15 (domain novo não importa `TRPCError`), regra 16 (validação de formato/tamanho só no `schema.ts`), regra 32 (branch `feature/021-media-upload` criado a partir de `develop`).
- [x] Princípios universais de `PRINCIPLES.md` respeitados — discovery resolveu storage/transporte via scan antes do gate; as 2 decisões irredutíveis (implementação concreta do storage, shape do retorno do port) foram ao dono no gate único.
- [x] `[NEEDS CLARIFICATION:]` zerado.

## 8. Riscos

- **`public/uploads/` sem volume Docker persiste só enquanto o container não reiniciar.** Mitigação: volume `uploads:` adicionado ao `docker-compose.yml` nesta mesma rodada (mesmo padrão de `pgdata`/`redisdata`).
- **Sem teste de integração real contra Postgres** (mesma limitação já documentada em `008-trpc-error-link`/`010-post-cover-image` — sandbox sem `DATABASE_URL` funcional). Migration gerada mas não aplicada contra Postgres ao vivo nesta sessão; mitigação: `prisma migrate diff` schema-to-schema, mesmo processo já usado nas features anteriores.

## 9. Open questions

*(nenhuma — as decisões load-bearing desta feature foram resolvidas no gate de `deliver`, 2026-07-26)*

---

*Plan NÃO contém: lista granular de tasks (vai pro `tasks.md`). Plan NÃO escolhe stack — lê de `ach.md`. Se camada relevante de `ach.md` está como `[A DEFINIR]`, marca aqui e bloqueia tasks até resolver.*
