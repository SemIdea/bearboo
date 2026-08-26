# ACH — Architecture Guide

> Living architecture guide for Bearboo.
> **Author:** the architecture owner. Changes go through validation before merge.
>
> This doc answers: "where do I put this logic?", "how do I structure this new module?", "how far do I take testing for this change?".
>
> **Related docs:** [`/docs/afm.md`](./afm.md) (process + hard rules), [`/docs/gotchas.md`](./gotchas.md) (counterintuitive surprises), [`/docs/adr/`](./adr/) (versioned decisions).

> **Refactor state on 2026-07-04.** ADR-0006 to ADR-0010 have landed in the code: server by feature (`domain/` + `procedures/`), Prisma entities centralized in `src/server/models/`, `src/lib/` vs `src/server/infra/` split, removal of the old Redis implementation, and Zod input/output schemas at the boundary. Redis stays a technology decision for a future rebuild (ADR-0003/0009), but today there is no Redis adapter/cache in `src/server/`.

---

## 1. Macro Architecture

```
Browser
  │
  ▼
Next.js App Router (src/app/**)  ──── SSR/ISR/PPR ────►  React (client components)
  │                                                          │
  ▼                                                          ▼
tRPC route handler (src/app/api/trpc/[trpc]/route.ts)   tRPC client (src/context/trpc/*)
  │
  ▼
tRPC Router (src/server/features/<feature>/index.ts)  — Procedure-like, the feature aggregator
  │
  ▼
Procedure (src/server/features/<feature>/procedures/<action>.ts)  — orchestrates
  │
  ▼
Domain (src/server/features/<feature>/domain/<action>.ts)  — Domain-like
  │
  ▼
Model (src/server/models/<entity>.ts)  — encapsulates Prisma access per entity
  │
  ▼
Prisma driver (src/server/infra/drivers/prisma.ts) ──► Postgres

Cross-cutting integrations (typed adapters, injected via a DI container):
  - Pure helpers: uidGenerator, passwordHashing (src/lib/*)
  - Gateway: mailer (src/server/integrations/gateway/mailer/*)
  - Env: src/lib/env
  - Composition root: src/server/infra/container/{gateways,helpers,repositories}.ts
  - Drivers (singleton clients): src/server/infra/drivers/prisma.ts
```

**Canonical entities** (from `prisma/schema.prisma`):
- **User** — an authenticatable account; owner of posts, comments, and sessions.
- **Session** — a User's auth session (`accessToken`/`refreshToken`).
- **Post** — content published by a User.
- **Comment** — a User's comment on a Post.
- **VerificationToken** — a User's email verification token.
- **ResetToken** — a User's password reset token.

**Mini-ER (relations declared in the schema):**
```
User 1───N Session
User 1───N Post
User 1───N Comment
Post 1───N Comment
User 1───N VerificationToken   (userId with no @relation declared in the schema)
User 1───N ResetToken          (userId with no @relation declared in the schema)
```

**Dataflow:**
- **Postgres (Prisma)** — source of truth for every entity (User, Session, Post, Comment, VerificationToken, ResetToken).
- **Redis** — the old cache implementation was removed by ADR-0009. Redis stays an accepted technology for a future rebuild, but the current code neither queries Redis nor keeps an active cache port.

---

## 2. Folder Architecture

```
src/
├── app/                        # Next.js App Router — routes, layouts, route groups
│   ├── (half)/                 # Route group: post/user pages (wide layout) — inherited name, do not redocument the semantics without confirming with the team
│   ├── (smal)/                 # Route group: auth pages (narrow layout) — idem
│   └── api/trpc/[trpc]/        # The single tRPC HTTP handler
├── components/                 # Reusable React components + components/ui (shadcn-style)
├── config/                     # site.ts, fonts.ts, featureFlags.ts
├── context/                    # React providers (auth, trpc client)
├── lib/                        # pure libs with no ORM/framework: env, error, featureFlags, utils, validation, helpers, log
│   ├── env/                    # typed env var reading via dotenv
│   ├── log/                    # structured logging: scalar-only LogFields, JSON/pretty renderers, per-call logger (ADR-0022)
│   ├── passwordHashing/        # adapter + bcrypt implementation
│   └── uidGenerator/           # adapter + uuid implementation
├── server/                     # Backend layer
│   ├── routers/app.routes.ts   # Root aggregator — imports each feature's router (not a feature)
│   ├── features/<feature>/     # index.ts (router) + schema.ts + domain/ + procedures/
│   │   ├── index.ts            # the feature's tRPC router — aggregates procedures/<action>.ts
│   │   ├── schema.ts           # the feature's Zod input/output schemas (1 file per feature)
│   │   ├── procedures/<action>.ts        # orchestrates: validates via schema, calls domain/, returns
│   │   ├── procedures/<action>.test.ts   # neighbor test, no __tests__/
│   │   └── domain/<action>.ts             # business rule — ONE function per file (hard rule 7)
│   ├── models/                 # base.ts + a model per Prisma entity
│   ├── infra/
│   │   ├── container/           # Composition root — wires concrete implementations
│   │   └── drivers/             # Singleton clients (prisma.ts)
│   ├── integrations/
│   │   └── gateway/<name>/      # adapter.ts + implementations/  (mailer)
│   └── createContext.ts, createRouter.ts, caller.ts   # createRouter mounts withCanonicalLog — one wide log line per call (ADR-0022)
├── shared/error/               # machinery at the root (registry, domainError, index, boundaryLog, validation)
│   └── catalog/<domain>.ts     # the 8 per-domain catalogs (auth/comment/media/post/resetToken/session/user/verifyToken)
├── test/
│   ├── context/                 # TestContext — setup helper for procedure tests
│   ├── gateways/                # in-memory fake gateways
│   ├── prisma/                  # prisma-mock client (schema-driven fake of PrismaClient) + reset
│   └── setup.ts                 # vitest setupFiles — mocks the Prisma driver and resets state per test
└── utils/                       # authStorage, error, validation (client-side helpers)
```

### Import rules

```
routers/app.routes.ts     → may import: features/<feature> (each feature's index.ts)
                             NEVER imports: models/*, infra/*, integrations/* directly

features/<feature>/index.ts        → may import: procedures/*, schema.ts
                                      NEVER imports: models/*, infra/*, integrations/* directly (delegates to the procedure)

features/<feature>/procedures/*.ts → may import: domain/* (same feature or another), schema.ts, createContext/createRouter types
                                      NEVER imports: Prisma/driver directly (receives it via ctx.repositories)

features/<feature>/domain/*.ts     → may import: createDomain, types inferred from the schema, another domain/* (same feature)
                                      NEVER imports: zod runtime, Prisma/driver, or a concrete implementation

integrations/**/adapter.ts → a pure interface (typed port), zero import of a concrete implementation
integrations/**/implementations/* → implements the port; may receive config/env via the constructor; does not read the container
```

**Cross-feature import confirmed in the code:** `features/user/procedures/login.ts` imports `features/auth/domain/createAuthSession`; `features/user/procedures/register.ts` imports `features/auth/domain/createToken` and `features/mail/domain/sendMail`; `features/auth/procedures/*.ts` imports `features/mail/domain/*`. Domain-to-domain cross-feature is accepted today (no isolated module forces a boundary) — revisit if hard rule 11 (architectural change) shows a need for explicit ports between features.

**Promotion to `domain/shared/`:** no observed need yet (Rule of Three) — no logic duplicated across 3+ modules found in the scan. It grows on demand.

---

## 3. Components

### 3.1 First-class components

#### Procedure-like — sync request/response handler

- **Implementation in the stack:** a tRPC router in `src/server/features/<feature>/index.ts`, aggregating the feature's own procedures.
- **Naming convention:** router `<Feature>Router`; procedure = a verb (`create`, `read`, `update`, `delete`, `readRecent`, `revalidate`, `login`, `register`).
- **Canonical example:** `src/server/features/post/index.ts`.
- **Note:** `login`/`register` are exposed by `features/user/index.ts` (`trpc.user.login`/`trpc.user.register`) — they physically live in `user/` even though they are conceptually "auth", a decision taken during ADR-0006 to remove the cross-routing that existed before (`auth.routes.ts` calling `user/` controllers).

#### Procedure — thin orchestrator

- **Concept:** the layer between the tRPC router and the Domain — applies `.input()`/`.output()`, receives `input` + `ctx`, calls the domain function with `DomainInput<T>`, and returns the result.
- **Implementation:** `src/server/features/<feature>/procedures/<action>.ts`, export `procedure_<action>`.
- **When NOT to use:** real business logic → delegate to `domain/`.
- **Canonical example:** `src/server/features/post/procedures/create.ts`.

#### Domain-like — a pure business-rule function

- **Universal concept:** a function that applies a business rule, receiving already-resolved repositories/helpers (explicit injection, not direct IO).
- **Implementation in the stack:** `src/server/features/<feature>/domain/<action>.ts`, single export `domain_<action>`.
- **ONE exported function per file — compliant across all of `src/server/features/` since ADR-0006 (2026-07-01).** The original audit (retroactive, `/afm:refactor`) had reported "compliant" by mistake, on a grep that counted `export {...}` lines instead of symbols — the real violation (`auth/resetToken`, `auth/session`, `auth/verifyToken`, `user/profile`, `mail` bundling 2-3 functions per file) was fixed during this ADR's implementation, splitting each multi-export file into one file per function.
- **When NOT to use:** schema validation (stays in the feature's `schema.ts`, the boundary), transport glue (stays in the procedure).
- **Canonical example:** `src/server/features/post/domain/create.ts`.

#### Model — encapsulates Prisma access per entity (a local layer, not universal vocabulary)

- **Concept:** a class that extends `BaseModel<Entity>` (`src/server/models/base.ts`), giving generic CRUD (`create/read/update/delete`) + entity-specific extra methods (e.g. `PostModel.readRecents`, `PostModel.readUserPosts`, `PostModel.readBySlug`, `UserModel.readByEmail`).
- **Implementation:** `src/server/models/<entity>.ts`, an exported singleton instance (`const <Entity>Model = new <Entity>ModelClass()`).
- **When to use:** every `prisma/schema.prisma` entity that needs data access + specific read/write logic.
- **Note:** the Domain accesses data via `ctx.repositories.<entity>`; runtime and tests use the **same models** — in tests the Prisma driver is replaced by a `prisma-mock` client generated from `schema.prisma` (ADR-0011, seam in `src/test/setup.ts` + `src/test/prisma/`).

#### Adapter-like — a typed-port implementation

- **Universal concept:** a concrete implementation of a port (`adapter.ts`) — the same return shape across implementations (LSP).
- **Implementation in the stack:**
  - Data models: `src/server/models/<entity>.ts`.
  - Pure helper: `src/lib/<name>/adapter.ts` + `implementations/<concrete>.ts` (e.g. `uidGenerator`, `passwordHashing`, `slug` — a deterministic slug generator from a title, used in `domain_createPost`; `rateLimit` — added in `001-auth-hardening`, `IRateLimitHelperAdapter` + `InMemoryRateLimit`, an opaque key prefixed by endpoint at the call site, no Redis dependency; `permissions` — added in `013-role-based-permissions`, `IPermissionHelperAdapter` + `MatrixPermission`, a pure `can(role, action)` against the fixed Phase 3 matrix, no I/O; it gained the `post:publish` action in `014-post-review-workflow` — Phase 4, gates `submitForReview`/`publish`/`reject`/`archive`).
  - External gateway: `src/server/integrations/gateway/<name>/adapter.ts` + `implementations/<concrete>.ts` (e.g. `mailer`).
- **OCP in action:** a new provider (e.g. another mailer) = a new file in `implementations/`, with no `switch (provider)` scattered around.

#### Composition root — wiring of concrete implementations (a local layer)

- **Implementation:** `src/server/infra/container/{gateways,helpers,repositories}.ts` — resolves which concrete `implementations/*` each adapter uses and injects config/env when needed.
- **Drivers:** `src/server/infra/drivers/prisma.ts` — a raw singleton client, consumed only by infra/model.

#### Response cookie jar — a new piece from `001-auth-hardening` (2026-07-12)

- **Concept:** `src/server/http/cookieJar.ts` (`class CookieJar`) — accumulates pending `Set-Cookie` during the request; `src/server/http/serializeCookie.ts` — a pure function that formats each cookie (`HttpOnly`, `SameSite=Lax`, `Secure` conditional on `NODE_ENV=production`).
- **Contract:** `createContext.ts` instantiates one `CookieJar` per request (`ctx.resCookies`); procedures call `ctx.resCookies.set(...)`/`.clear(...)`; `src/app/api/trpc/[trpc]/route.ts` captures the created `ctx` and uses `responseMeta` of the `fetchRequestHandler` to emit the `set-cookie` headers after the batch resolves.
- **Why it exists:** the tRPC adapter (`@trpc/server/adapters/fetch`) has, by default, no way for a procedure to influence response headers — an architecture decision validated at a gate (`docs/features/001-auth-hardening/plan.md` § 4.1), not a pre-existing stack pattern.

#### Role guard (`roleProcedure`) — a new piece from `013-role-based-permissions` (2026-07-12)

- **Concept:** `src/server/createRouter.ts` — `roleProcedure(allowed: IRole[])`, the 4th layer of the tRPC guard chain (`public` → `protected` → `verified` → `role`), parameterized by a role allowlist instead of fixed (each call site passes the roles it accepts, e.g. `roleProcedure(["ADMIN","EDITOR"])`). Throws `FORBIDDEN`/`AuthErrorCode.INSUFFICIENT_ROLE` if `ctx.user.role` is not in the allowlist.
- **When to use:** an action that **never** depends on the resource owner (`category.create`, `user.updateRole`). Conditional ownership (post update/delete: "owner OR has a bypass permission") stays in `verifiedProcedure` + a domain check via `ctx.helpers.permissions.can(role, action)` — `roleProcedure` does not serve this because the decision depends on the data (who the owner is), not only the caller's role (`013-role-based-permissions/plan.md` § 4.2).
- **`IRole`:** a hand-rolled literal union (`"ADMIN" | "EDITOR" | "AUTHOR"`) in `src/server/models/user.ts`, the same pattern as `IPostStatus`/`PostStatus` — do not import the Prisma-client-generated enum in app code (only `infra/drivers/prisma.ts`/`test/prisma/` import `@prisma/client` directly).

#### Status workflow (a state machine in domain, no new component) — a new piece from `014-post-review-workflow` (2026-07-14)

- **Concept:** `Post.status` transitions (`submitForReview`/`publish`/`reject`/`archive`) become 4 dedicated domain functions instead of accepting a free `status` in `post.update` — each validates the source state + permission before writing. `updatePostSchema` **no longer** accepts `status` (hard rule 16 — boundary validation stays in `schema.ts`, but the *state machine* itself lives in the domain).
- **`SCHEDULED` with no scheduler:** the public visibility of a `SCHEDULED` post is resolved with `scheduledAt <= now` at query time (`PostModel.readRecents`/`readRelated`/`readUserPosts`/`readBySlug`), not by a job that flips the status in the database — it avoids introducing the project's first Task-like component (`afm.md` § 3 rule 12) just for this (`014-post-review-workflow/plan.md` § 4.1).
- **`PostReviewComment`:** a new model (`src/server/models/reviewComment.ts`), the same pattern as `Comment` — stores an approval reason (optional) or a rejection reason (mandatory), read via `post.readReviewComments` (the post owner or whoever has `post:publish`).

#### Public non-tRPC HTTP surface (App Router special files) — a new piece from `015-seo-metadata` (2026-07-14)

- **Concept:** `sitemap.xml`, `robots.txt`, and `feed.xml` are not tRPC endpoints — they are Next.js special-file conventions (`src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/feed.xml/route.ts`), at the same level as the existing `page.tsx`/`layout.tsx`. It is not a new architectural layer: all 3 call `createCaller()` (the same caller used by `generateMetadata`) to read data via tRPC, and `sitemap.ts`/`feed.xml/route.ts` use the same triad `"use cache"` + `cacheLife("hours")` + `cacheTag("posts")` already established in `post/[slug]/page.tsx` (`014-post-review-workflow/plan.md`).
- **Gotcha:** `"use cache"` cannot wrap a function that returns a `NextResponse`/`Response` (a class, not serializable) — the cached data read stays in a separate function that returns a plain value (string/array), and the `Response` is built outside the cache, in the handler (`src/app/feed.xml/route.ts`: cached `readFeedXml()` returns `string`; non-cached `GET()` builds the `NextResponse`).
- **`src/server/http/` is no longer just the cookie jar:** it gained `buildRssXml.ts` (hand-rolled RSS 2.0) and `buildArticleJsonLd.ts` (JSON-LD `schema.org/Article`, with `<` escaping so it does not break the `<script>` tag) — pure output-formatting functions, the same criterion as `serializeCookie.ts` (transport glue, not a business rule — that is why they do not live in `domain/`).
- **`post.readSitemapEntries`:** a new lean public procedure (only `slug`+`updatedAt`, no relation `include`, no pagination) — it does not reuse `post.readRecent` for the sitemap, to not pay the full-include cost nor generalize a procedure already used in production (`015-seo-metadata/plan.md` § 4.1).

#### `viewCounter` — the first Gateway-like with real I/O beyond `mailer` — a new piece from `017-post-view-analytics` (2026-07-16, `ADR-0013`)

- **Concept:** `src/server/integrations/gateway/viewCounter/adapter.ts` (`IViewCounterGatewayAdapter`) — `recordView(postId, visitorId, event)` (dedup per visitor in a 24h window + count + raw-event buffer, one call), `drainPendingCounts()` (flush the count to Postgres) and `drainPendingEvents()` (flush the raw event to `PostView`, an extension from `020-view-analytics-breakdown`, `ADR-0014`). Two concrete implementations, the same dev/prod pattern as `mailer` (`ConsoleMailTransport` vs `NodemailerMailTransport`): `implementations/inMemory.ts` (`InMemoryViewCounterGateway`, a fallback when `env.disableRedis`) and `implementations/redis.ts` (`RedisViewCounterGateway`, via `ioredis` — the first real use of the lib in app runtime; until here it was only in `package.json`). Registered in `IGateways` (`src/server/infra/container/gateways.ts`), **not** in `IHelpers` — full reason in `ADR-0013`.
- **Why a Gateway and not a Helper:** every helper today (`hashing`/`uid`/`slug`/`rateLimit`/`permissions`/`referrerClassifier`/`userAgentClassifier`) is pure/local, with no network I/O, so `TestContext.helpers` uses the real implementation without an override even in tests. A real Redis registered as a helper would break any test that touched the feature (`ach.md § 4.1`: tests run without Postgres/Redis). `IGateways` already solves this — `viewCounter` reuses `FakeViewCounterGateway` (`src/test/gateways/viewCounter.ts`) via `createFakeGateways()`, the same mold as `FakeMailerGateway`.
- **Lazy flush, no scheduler:** `domain_readDashboard` drains the gateway's pending counts and events and applies them to Postgres (`PostModel.applyViewIncrements` + `PostViewModel.create`) every time the dashboard is read — the same trick already used for `SCHEDULED` visibility (`014-post-review-workflow`), avoiding the project's first Task-like component (`afm.md § 3` rule 12).
- **Visitor cookie:** `src/server/createContext.ts` reads the `visitorId` cookie (the same `parseCookie` already used for `accessToken`/`refreshToken`); `analytics.recordView` generates a new one via `ctx.helpers.uid.generate()` and sets it via `ctx.resCookies` (the same mechanism as `001-auth-hardening`) when absent.

#### Analytics breakdown (`PostView` + `referrerClassifier`/`userAgentClassifier`) — a new piece from `020-view-analytics-breakdown` (2026-07-18, `ADR-0014`)

- **`PostView` (new model):** `src/server/models/postView.ts` (`PostViewModel`, extends `BaseModel`) — a raw per-view event (`postId`, `referrerBucket`, `userAgent`, `createdAt`), no IP (a privacy decision, `ADR-0014`). Extra methods: `countSince(days)`, `readReferrerBreakdown(days)` (Prisma `groupBy`), `readUserAgents(days)`, `deleteOlderThan(days)` (30-day retention, lazy on read).
- **Two new pure Helper-like:** `src/lib/referrerClassifier/` (classifies the `Referer` header into `DIRECT`/`SEARCH`/`SOCIAL`/`OTHER` — resolved on write) and `src/lib/userAgentClassifier/` (categorizes `User-Agent` into browser/OS by regex — resolved on read, over the saved raw string). The same pattern as `slug`/`rateLimit`/`permissions`: `adapter.ts` + `implementations/regex.ts`, registered in `IHelpers` (`src/server/infra/container/helpers.ts`), no fake in tests (pure, `TestContext` uses the real implementation).
- **`analytics.readDashboard` (extended boundary, not a new procedure):** it gained `viewsLast7Days`/`viewsLast30Days`/`trafficOrigin`/`browsers` in the same output schema — a conscious decision to not create a 2nd procedure, to avoid fragmenting the dashboard read into several round-trips.

#### Editable slug + redirect and a shared domain helper — a new piece from `018-seo-overrides-slug-redirect` (2026-07-18)

- **`domain_resolveAvailableSlug`:** `src/server/features/post/domain/resolveAvailableSlug.ts` — the incremental numeric-suffix algorithm (`titulo`, `titulo-2`, ...) extracted from `domain_createPost` to be reused by `domain_updatePost` (slug editing), with an optional `excludePostId` param to ignore a collision with the post being edited itself. The same shared-domain-helper pattern within a feature already used in `user/domain/getUserOrThrow.ts` (hard rule 7 — 1 export per domain file, so an extraction becomes a new file, not an extra function in the same file).
- **`previousSlug` (1 column, not a history table):** `Post.previousSlug` stores only the immediately previous slug — a conscious decision to cover "I fixed a slug once" and not repeated rewrites (YAGNI, the same reasoning as avoiding a Task-like component just for `SCHEDULED` in `014-post-review-workflow`). The redirect is resolved by `domain_readRedirectSlug` → `post.readRedirectSlug` (a lean public procedure, the same pattern as `post.readSitemapEntries`), called in `PostContent` (`post/[slug]/page.tsx`) in the `POST_NOT_FOUND` catch, before the `OwnerPreview` fallback; if it resolves, `permanentRedirect()` (`next/navigation`). The redirect runs only on render, not in `generateMetadata` (`018-seo-overrides-slug-redirect/plan.md § 4`).
- **SEO overrides (`seoTitle`/`seoDescription`/`canonicalUrl`):** nullable on `Post`, read in `generateMetadata` with a fallback to the previous computed behavior (`post.seoTitle ?? post.title`, etc.) — zero regression for a post with no override.

#### `mediaStorage` — the second Gateway-like with real I/O, the first that writes to the filesystem — a new piece from `021-media-upload` (2026-07-26, `ADR-0015`)

- **Concept:** `src/server/integrations/gateway/mediaStorage/adapter.ts` (`IMediaStorageGatewayAdapter`) — `save({ buffer, filename, mimeType }): Promise<{ url, storageKey }>`, `delete(storageKey): Promise<void>`. The same dev/prod pattern as `mailer`/`viewCounter`, but only one concrete implementation this round: `implementations/local.ts` (`LocalMediaStorage`) writes to `env.media.uploadDir` (default `public/uploads`) and returns `{ url: "/uploads/<storageKey>", storageKey }`. Without `output: "standalone"` in `next.config.ts`, `next start` serves `public/` straight from disk on each request — a file written at runtime in `public/uploads/` is servable at `/uploads/<file>` with no new route handler. Registered in `IGateways` (`src/server/infra/container/gateways.ts`); the test uses `FakeMediaStorageGateway` (`src/test/gateways/mediaStorage.ts`, an in-memory `Map`), the same mold as `FakeMailerGateway`/`FakeViewCounterGateway`.
- **`{ url, storageKey }`, not just `url`:** a decision from `ADR-0015` — a future storage (Cloudinary/S3) has a deletion identifier that is not the public URL (`public_id`, not the URL). Storing both now in `Media.storageKey`/`Media.url` avoids a migration just for this when the storage changes.
- **The upload comes through the same tRPC route, not a new route handler:** `media.upload` uses `.input()` with a Zod schema that accepts `z.instanceof(FormData)` and does `.transform()` to validate/extract `{ file, altText }` — the native content-type handler of `fetchRequestHandler` (tRPC v11) hands the raw `FormData` as raw input when the request is `multipart/form-data`, so the schema **must** accept `FormData`, not an already-destructured object. Client-side, `httpBatchLink` (the project's default link) does **not** support `FormData`/`File` — it serializes every batch op into JSON. `src/context/trpc/client.ts` uses `splitLink` to route only the `isNonJsonSerializable` inputs (checked via `@trpc/client`) to `httpLink` (non-batched, which does a raw `getBody: () => input`); everything else stays on `httpBatchLink`. Found and fixed only after testing against a real dev server — `createCaller` (used in procedure tests) does not pass through the link or the content-type handler, so it does not catch this kind of bug.
- **New permission action:** `media:deleteAny` (`src/lib/permissions/adapter.ts` + `implementations/matrix.ts`) → `["ADMIN", "EDITOR"]`, the same pattern as `post:deleteAny`. `domain_readOwnMedia` reuses this same action (not a separate `media:readAny`) to decide whether the read is scoped to the user or site-wide — the same trick as `domain_readOwnPosts` with `post:editAny`.
- **Generic `AppError` — the first use of the forward-only rule 15:** `src/shared/error/appError.ts` (`class AppError<C extends string>`), a design already prescribed in `docs/rubrics/error-classification.md` (Option B) but never used until here — every existing domain throws `TRPCError` directly (debt tracked in `afm.md § 3.1`). `media/domain/{upload,readOwn,delete}.ts` do not import `TRPCError`; the delete procedure (`media/procedures/delete.ts`) maps `AppError` → `TRPCError` at the boundary (`NOT_FOUND`/`FORBIDDEN`), the only point that knows transport.

### 3.2 Support components (second-class)

#### Schema — validation at the boundary

`src/server/features/<feature>/schema.ts` — Zod input and output schemas of a procedure, one file per feature. Procedures apply `.input()` and `.output()` at the boundary; the domain receives `DomainInput<T>` with types inferred via `z.TypeOf`, without validating at runtime again. Confirmed in the scan: zero `import zod` inside `models/*` or `features/*/domain/*.ts` (hard rule 16 already respected).

#### Shared error — ErrorRegistry (`ADR-0017`, migration closed in `022-error-registry`; centralized and inverted in `ADR-0019`/`024`)

`src/shared/error/registry.ts` — `defineDomainErrors(domain, errors)` namespaces each catalog by domain (`"auth.invalid_credentials"` etc.) and validates against a duplicate domain at runtime (`Set`). `src/shared/error/index.ts` aggregates the 8 catalogs from `src/shared/error/catalog/` (`auth`, `comment`, `media`, `post`, `resetToken`, `session`, `user`, `verifyToken`) into a central `Errors`/`ErrorCode` **and exposes `resolveErrorEntry(code)`** — the lookup the registry lacked: until feature 024 the catalogs were only written, never read, because `AppError` copied the fields to itself and everyone read the copy. The lookup returns `message`/`retryable`/`level` with the defaults already applied (once, at the lookup — not `?? false` in each consumer).

**`AppError` carries only the `code`** (`ADR-0019`). `httpCode`/`message`/`retryable`/`level` were copies of a static function of the code; consumers resolve them via `resolveErrorEntry` (policy) or `appErrorTransport` (transport). `super(code)` makes the code the `Error` message — the human text is resolved at the boundary, which is where i18n will live.

**The translation is a middleware, not a per-procedure block.** `src/server/http/appErrorToTRPCError.ts` (a pure function) is mounted in `createRouter.ts` as the first `.use()` of a `baseProcedure`, so it wraps guards **and** resolver. No procedure builds a `TRPCError` — `rg -l "new TRPCError" src/server/features/*/procedures/*.ts` returns empty (it was 26 copies + 6 in the guards). The middleware inspects `result.ok` instead of `try/catch`: tRPC catches the resolver's throw and returns it as `{ ok: false, error }` already wrapped by `getTRPCErrorFromUnknown`, so there is nothing to catch — there is a result to remap. **Gotcha:** a procedure built outside the chain (a bare `t.procedure`) does not get the translation; that was the `refreshSession` case, which uses `baseProcedure` to skip the expired-session guard without losing the translation.

**Transport outside the domain vocabulary (hard rule 35).** `src/server/http/appErrorTransport.ts` holds `Record<ErrorCode, TRPC_ERROR_CODE_KEY>` — the projection of the 29 domain codes onto 7 tRPC codes. It is total, so a new code with no mapping breaks `tsc`, not becomes a 500. `src/shared/error/**` does not import `@trpc/*`. A new consumer (job, CLI, webhook) gets its own table instead of a column in the catalog.

**Hard rule 15 closed:** `rg -l "TRPCError" src/server/features/*/domain/*.ts` returns empty — the 23 files that threw `TRPCError` directly (count at the start of `022-error-registry`) migrated to `AppError`. It is no longer forward-only (removed from `afm.md` § 3.1).

**Cutover complete (2026-07-30):** all 8 catalogs had the old enum (`<Feature>ErrorCode`/`<Feature>ErrorMessages`) removed — `defineDomainErrors` embeds the human text inline, with no enum indirection. `auth`/`session`/`post` were the last to close because they had a legitimate consumer outside the domain layer: `createRouter.ts` guards (`publicProcedure`/`assertRateLimit`/`protectedProcedure`/`verifiedProcedure`/`roleProcedure`), `refreshSession.ts` (missing token), `src/server/caller.ts`, `src/context/trpc/sessionRefreshLink.ts`, and `analytics/procedures/recordView.ts`. All migrated to synthesize `new AppError("<code>")` at the detection point (there is no separate domain function to throw/catch in these cases — the check already lives at the boundary) and rethrow via `{code: error.httpCode, message: error.message, cause: error}`. No `TRPCError` built with a bare enum `message` is left anywhere in the code (verified via `grep -rn "message: .*ErrorCode\." src` → empty). *(Historical record of the 2026-07-30 cutover: this manual rethrow was removed from all these points in feature 024 — today the middleware is what rethrows.)*

**Two ways to read the domain code at the boundary:** `createCaller()`/in-process callers (`post/[slug]/page.tsx`, `src/server/caller.ts`) read `error.cause instanceof AppError && error.cause.code` directly, with no network round-trip. The client-side over HTTP (`sessionRefreshLink.ts`) has no access to the original object's `.cause` — the `errorFormatter` of `createRouter.ts` propagates the namespaced `code` via `data.domainCode` (its own field, not to be confused with tRPC's native `data.code`, which is already the HTTP code).

`src/lib/error.ts` (`getErrorMessage`) kept only the lookup of `ValidationErrorMessages` (client-only validation codes, from `utils/validation.ts` — they never touch the server) with a pass-through for the rest (`?? code`). No domain catalog (`Auth`/`Post`/`Session`) is left in this function — every `error.message` coming from the server is already final text, always.

**Metadata + bug/recoverable convention (feature 023, ADR-0018):** the catalog's `ErrorEntry` carries `message` and the optional `retryable?: boolean` and `level?: ErrorLevel` (`fatal|error|warn|info`); `resolveErrorEntry` resolves them with defaults `retryable=false`/`level=warn`. *(Until feature 024 the `ErrorEntry` also carried `httpCode` and `AppError` was what resolved it — see ADR-0019.)* The boundary distinguishes **recoverable** (is/has-cause `AppError`) from **bug** (any other throw): `src/shared/error/boundaryLog.ts` (pure `classifyBoundaryError` + `logBoundaryError`) is the single point; activated in the fetch adapter's `onError` (`app/api/trpc/[trpc]/route.ts`) and in `src/server/caller.ts`. A bug logs `error` with a stack; a recoverable logs at its `level`. The `errorFormatter` stays pure (only shaping — `domainCode`/`zodError`); logging lives in `onError`. Formalized in hard rule 33. `retryable`/`level` are **server-side only** today (not exposed to the client — YAGNI, no consumer). `Result<T,E>` was evaluated and rejected (ADR-0018 § alternatives).

#### UI primitives

`src/components/ui/` — Radix + `class-variance-authority` components (shadcn style). No direct fetch; data via tRPC + React Query (`src/context/trpc/`).

---

## 4. Testing Strategy

### 4.1 Observed levels

| Level | What it tests | Where it lives | Current state |
| ----- | ----------- | --------- | ------------- |
| **Unit/Procedure** | Procedure + Domain + Model via `TestContext` | `src/server/features/**/procedures/*.test.ts` | 23 test files (`vitest`) |
| **Integration** | [A DEFINIR — not found in the scan] | — | — |
| **E2E** | [A DEFINIR — not found in the scan] | — | — |

Current coverage (proxy `tests/src`): 23 test files / 205 `.ts`/`.tsx` files in `src/` (~11.2%). See `afm.md` § 3.1 forward-only.

Procedure tests run without Postgres/Redis: vitest mocks the Prisma driver globally (`src/test/setup.ts`) with a **`prisma-mock`** client generated from `schema.prisma` (`src/test/prisma/` — ADR-0011), so production models run intact against an in-memory database with unique constraints enforced; `createTestContext()` injects only the fake gateways (`src/test/gateways/`). Per-test isolation via `resetPrismaMock()` (do not use `$clear()` — see the comment in the seam). The pre-push hook runs `yarn test` directly.

### 4.2 Hard TDD + types-as-test

Runner: `vitest run --reporter verbose` (the `test` script). `tsconfig.json` has `strict: true`.

### 4.3 Regression

Pattern observed in `git log`: several `test:` commits accompany `fix:`/`refactor:` in the same area (e.g. "add error handling tests for non-existent posts and unauthorized updates"). Keep this pattern.

### 4.4 Types as test

`grep -rn ': any' src/` → 2 occurrences. `grep '@ts-ignore\|@ts-expect-error' src/` → 0. See `afm.md` § 3.1.

### 4.5 Target coverage per layer

[A DEFINIR — no threshold defined today.]

---

## 5. Cross-cutting principles

- **XP + Pragmatic** — DRY, YAGNI, KISS, Broken Windows, Design by Contract, Rubber Duck. Daily practices in [`/docs/afm.md`](./afm.md).
- **Postgres = source of truth for every entity.** The old Redis cache was removed; a future rebuild goes through a new ADR / a continuation of ADR-0009.
- **Types in place of comments.** Name + type carry the *what*. A comment is only to justify a surprising *why*.
- **Explicit injection via `ctx`/`DomainInput`**, never direct driver access inside Domain/Procedure — it keeps the layer testable without real infra (in tests the driver becomes an in-memory `prisma-mock` client, ADR-0011).
- **Error classified by domain, never generic** — every domain has its own `<Domínio>ErrorCode` in `src/shared/error/`.

---

## 6. Code conventions (cheat-sheet)

### Decision rubrics

Consult the rubrics in [`docs/rubrics/`](./rubrics/) **before** you choose where something goes: `when-to-create-lib.md`, `when-to-create-module.md`, `when-to-create-dsl.md`, `enum-vs-union-vs-branded.md`, `error-classification.md`, `failure-classification.md`, `episodic-vs-semantic-boundary.md`, `negative-filters.md`, `solid-triggers.md`, `validation-boundary.md`, `when-to-evolve-methodology.md`, `template-vs-streaming-precedence.md`.

### Naming (observed in the code)

| Layer | Export pattern | File pattern |
| ----- | ---- | ---- |
| Router (Procedure-like) | `<Feature>Router` | `features/<feature>/index.ts` |
| Procedure | `procedure_<action>` | `features/<feature>/procedures/<action>.ts` |
| Domain-like | `domain_<action>` | `features/<feature>/domain/<action>.ts` |
| Domain input | `DomainInput<T>` | `server/createDomain.ts` |
| Model | `<Entity>Model` (instance) | `server/models/<entity>.ts` |
| Adapter (port) | `I<Name>Adapter` (type) | `adapter.ts` |
| Test file | same name (no `.test.ts` suffix) | a neighbor `__test__/` folder (singular) next to the code — **fixed on 2026-07-11**: the previous version of this line ("no `__tests__/`") diverged from the real `vitest.config.ts` (`include: ["src/**/__test__/**/*.ts"]`) and from all existing code (`procedures/__test__/<action>.ts`, `src/lib/slug/__test__/kebabCase.ts`) |

### Size and responsibility

- ≤ 300 lines per file (no known production exception in the 2026-07-04 scan).
- One responsibility per file.

### Types: explicit at boundaries, inference elsewhere

- **Explicit:** the return of exported domain/procedure functions, boundary schemas/types, exported component props.
- **Never `any` / `unknown` in your own helper** (5 known occurrences today — see `afm.md` § 3.1).

---

*Changes here follow hard rule 11 (an architectural change stops and asks).*
