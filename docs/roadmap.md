# Roadmap — Blog/CMS at mid-level

## Overall progress

> Updated on 2026-06-30, from a code audit (not from memory) during AFM adoption. Each phase below has its own checklist in the matching section — this is only the executive summary. Reconcile this table whenever a task changes state (see `CLAUDE.md` § Doutrina).

| Phase | Status | Note |
| --- | --- | --- |
| 0 — Initial setup | ✅ Done | — |
| 1 — Solid public blog | ✅ Done (with 1 residual item) | all checklist items implemented: slug, pagination, status/publishing, tags/categories (`docs/features/002` to `005`), reading time (`006`), related posts (`007`), cover image (`010`); residual item: the HTTP status of `/post/[slug]` is still `200` instead of `404` for a nonexistent slug — framework limitation (Cache Components), accepted as known for now (`docs/features/009-post-404-status/`) |
| 2 — Admin/CMS | ✅ Done (with 1 item deferred) | status selector, draft preview on the real URL (`docs/features/011-post-status-preview/`), "my posts" panel with filters by status/category/tag (`docs/features/012-my-posts-panel/`, scoped without roles — see note in the phase); item deferred: cover-image file upload moves to Phase 8 (owner decision, 2026-07-12) — cover via URL already exists (`docs/features/010-post-cover-image/`) |
| 3 — Authentication and permissions | ✅ Done (with 1 item deferred to Phase 4) | `docs/features/013-role-based-permissions/`: ADMIN/EDITOR/AUTHOR roles, `roleProcedure`, `src/lib/permissions/` (matrix); prerequisite `001-auth-hardening` (2026-07-12) satisfied. The pending item (restrict publish/archive to Admin/Editor) is closed by Phase 4 |
| 4 — Editorial workflow | ✅ Done (with 1 item deferred) | `docs/features/014-post-review-workflow/`: `IN_REVIEW`/`SCHEDULED`, submit/approve/reject (reason required)/publish directly/schedule/archive, `PostReviewComment`; publish/archive restricted to Admin/Editor (closes the Phase 3 item); scheduling via a lazy check on read, no new scheduler. Item deferred: edit diff history (`PostRevision`) — same pattern as Phase 2, which deferred image upload to Phase 8 |
| 5 — SEO and professional publishing | ✅ Done | `docs/features/015-seo-metadata/`: sitemap.xml, robots.txt, RSS feed, canonical, Twitter Card, schema.org — all computed from fields that already existed, no migration. `docs/features/018-seo-overrides-slug-redirect/`: editable SEO override fields (`seoTitle`/`seoDescription`/`canonicalUrl`) and an editable slug with automatic 301 redirect (`previousSlug`, 1 level of history) — the 2 items that had left this phase partial |
| 6 — Search and discovery | ✅ Done | `docs/features/016-search-content/`: search by title/content — now **native full-text** (`tsvector`/`ts_rank`, `portuguese` dictionary, relevance ranking) via `docs/features/027-native-fulltext-search/` (ADR-0027), which replaced the original `contains`/`insensitive` once the feature-026 integration harness unblocked it; header autocomplete; filter by tag/category and related posts already existed from earlier phases. `docs/features/019-search-sort-by-views/`: sort by most viewed (`sortBy: "mostViewed"`), unlocked by `Post.viewCount` from Phase 7 — the item that had left this phase partial |
| 7 — Internal analytics | ✅ Done | `docs/features/017-post-view-analytics/`: record view (dedup per visitor for 24h via Redis/cookie, ADR-0013), count total, most-viewed posts, Admin/Editor dashboard. `docs/features/020-view-analytics-breakdown/`: counts by period (7/30 days), traffic source, and browser/OS — items that had left the phase partial, closed with 30-day retention (lazy deletion) and no IP persisted |
| 8 — Media upload and management | ✅ Done (with 1 item deferred) | `docs/features/021-media-upload/`: real image upload (FormData via tRPC, `ADR-0015`), media library, delete (owner or `media:deleteAny`), alt text, format/size validation, post cover image from uploaded media. Item deferred: image compression/optimization (explicitly optional in the roadmap; goes away on its own if the final storage is an image CDN) |
| 9 — Production quality | 🟡 Partial | Zod, migrations, seed, some tests/error pages already exist; **structured logs done** (`docs/features/025-structured-logging/`, ADR-0022 — canonical log line per call, JSON prod / pretty dev); in-memory rate limiting covers login/register/reset/refresh (`docs/features/001-auth-hardening/`) — not general rate limiting for the whole API; missing: general API rate limiting, e2e tests (backend unit coverage ~90% and integration tests both done — the "~8.6%" figure was whole-repo, dragged by the untested frontend) |
| 10 — CI/CD and deploy | 🟡 Partial | CI pipeline exists (`.github/workflows/ci.yml`: `typecheck`/`lint`/`test`/`build` on Node 20, on PR + push to `develop`/`main`) and PRs deploy via Vercel; missing: infra hardening (the `docker-compose.yml` hardcoded credentials / exposed Postgres port inherited from `001-auth-hardening`), README run instructions, a confirmed stable production environment |
| 11 — Observability | 🟡 Partial | structured logs done (`docs/features/025-structured-logging/`, ADR-0022) and the canonical line carries `durationMs` per call; missing: request ID, `/api/health`, tracing/metrics |

**Outside the numbered roadmap, done (2026-07-12):** `docs/features/001-auth-hardening/` — security hardening of the current session/auth (prerequisite for Phase 3, not a new phase). The application layer is closed; infra hardening (TLS/HTTPS via nginx+certificate, removing hardcoded credentials from `docker-compose.yml`, the Postgres port exposed to the host without need) was scoped out of this round — different operational nature (depends on a domain/certificate, not testable with `vitest`), owner decision on 2026-07-12 (`docs/features/001-auth-hardening/spec.md` § 7). Natural candidate: Phase 10 (CI/CD and deploy) when that phase starts.

**Sequencing note (2026-07-11):** the back end already went through a large refactor (models with a pluggable delegate, domain/procedure layer, etc. — see `docs/adr/`). An equivalent refactor is planned for the front end, but the design does not exist yet. Until then, the focus is delivering **back-end** functionality (e.g., pagination); front-end changes are still accepted when a feature requires them (e.g., rendering pagination controls), but new structural decisions on the front-end side (state-management pattern, new component layer, folder reorganization) are avoided, since the future refactor would have to undo them.

---

## Final goal

Build a **technical publishing platform** with:

* public blog;
* admin panel;
* authentication;
* permissions;
* editorial workflow;
* SEO;
* internal analytics;
* search;
* tests;
* Docker;
* CI/CD;
* deploy.

The idea is not to build "just another blog," but an application that shows you can build, organize, secure, publish, and maintain a real system.

## Phase 0 — Initial setup ✅ Done

### Objective

Turn the current project into a minimally organized base to grow from.

### Tasks

* [x] review the current CRUD;
* [x] define the final stack;
* [x] organize the folder structure;
* [x] create an initial README;
* [x] set up `.env.example`;
* [x] set up Docker with PostgreSQL;
* [x] set up Prisma;
* [x] set up lint/format;
* [x] set up basic scripts.

### Suggested stack

> **Decision (2026-06-30, see `docs/adr/0005-manter-auth-propria.md`):** Auth.js/Better Auth was **not adopted** — the existing custom auth is kept, with incremental hardening. Playwright/GitHub Actions also have not been adopted so far (`vitest` without CI).

```txt
Next.js
TypeScript
PostgreSQL
Prisma
Zod
Auth.js or Better Auth
Docker
Vitest
Playwright
GitHub Actions
```

### Suggested initial structure

```txt
src/
  app/
    (public)/
    admin/
    api/

  modules/
    post/
    auth/
    user/
    media/
    analytics/
```

### Completion criterion

This phase is done when another person can clone the project, run one command, and get the application running locally.

Example:

```bash
docker compose up -d
pnpm install
pnpm dev
```

## Phase 1 — Solid public blog ✅ Done (with 1 residual item)

### Objective

Get the public part of the blog working well.

### Features

* [x] list published posts (`readRecent`, paginated, filtered by `status: PUBLISHED` — `docs/features/004-post-status/`);
* [x] view a post by slug — code written and verified (`docs/features/002-post-slug/`, public route `/post/[slug]`, unique `Post.slug` generated on `create` via `src/lib/slug/`); `tsc --noEmit` and `vitest` (111/111) green; **2026-07-11: migration applied to a real Postgres and `/post/<slug>` tested live in the browser** — closed. Found during verification: the seed (`prisma/seed.ts`) was broken by an `src/lib/slug` import incompatible with native `node` execution, and a nonexistent slug fell through to a generic `error.tsx` instead of `notFound()` — both fixed (commit `a620cde`). Residual item: the HTTP status of the `notFound()` response is still `200`, not `404` (streaming/`Suspense` — see `docs/ust.md` § Pendências Técnicas);
* [x] pagination — cursor-based (`Post.id`), default page size 10, `post.readRecent({ cursor?, limit? })` returns `{ posts, nextCursor }`; the front end (`postFeed.client.tsx`) has a "Load more" button (`docs/features/003-post-pagination/`);
* [x] post status — `enum PostStatus { DRAFT PUBLISHED ARCHIVED }`, default `PUBLISHED` (decided in the domain, not the database); `post.create`/`post.update` accept an optional `status`; public reads (`readRecent`, `user.readPosts`, `readBySlug`) expose only `PUBLISHED` (`docs/features/004-post-status/`). No status-selector UI yet — moves to Phase 2 (Admin/CMS);
* [x] tags — `Tag`/`PostTag` (N:N), `tag.create`/`tag.readAll` features; `post.create`/`post.update` accept optional `tagIds`; `post.readRecent` filters by `tagId`, `post.readBySlug` returns the post's tags (`docs/features/005-tags-categorias/`);
* [x] categories — `Category` (`Post.categoryId?`, N:1), `category.create`/`category.readAll` features; `post.create`/`post.update` accept an optional `categoryId`; `post.readRecent` filters by `categoryId`, `post.readBySlug` returns the post's category (`docs/features/005-tags-categorias/`). No selector UI yet — moves to Phase 2 (Admin/CMS);
* [x] author (post/comment show the related `user`);
* [x] cover image — `Post.coverImageUrl?` (migration `add_post_cover_image`); `post.create`/`post.update` accept an optional URL (validated with `z.string().url()`); shown on the listing card and at the top of the post page (a plain `<img>`, not `next/image` — the repo does not use it, avoiding the need to configure `images.remotePatterns` for an arbitrary user URL) (`docs/features/010-post-cover-image/`). No file upload — moves to Phase 2 (Admin/CMS);
* [x] estimated reading time — `readingTimeMinutes` computed on the fly from `content` (200 words/minute, minimum 1 min), via `z.transform()` in the post output schema; appears on every endpoint that returns a post (`create`, `read`, `readBySlug`, `update`, `revalidate`, `readRecent`, `user.readPosts`) without touching domain/model (`docs/features/006-tempo-leitura/`). No UI showing the value yet — moves to after the front-end refactor;
* [x] related posts — `post.readRelated` (same category OR at least one shared tag, excludes the post itself, only `PUBLISHED`, ordered by most recent); "Related posts" section on the post page (`docs/features/007-posts-relacionados/`). No weighted ranking — moves to Phase 6 (search/discovery);
* [x] public author page (`src/app/(half)/user/[id]/`).

### Main models

```ts
User
Post
Category
Tag
PostTag
```

### Example initial post status

```ts
enum PostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

### Important rules

* only `PUBLISHED` posts appear on the public blog — implemented (`docs/features/004-post-status/`): `readRecent`, `user.readPosts` filter in the query, `readBySlug` treats a non-`PUBLISHED` post as not found;
* the slug must be unique;
* an archived post does not appear in public listings — implemented together with the item above;
* a post without a title cannot be published;
* a post without content cannot be published.

### Completion criterion

This phase is done when the user can access the public blog, view posts, browse by tags/categories, and open individual posts.

## Phase 2 — Own Admin/CMS ✅ Done (with 1 item deferred)

### Objective

Build an admin panel to manage posts.

### Features

* [x] login (exists, but there is no separate `/admin` area — it is the general auth);
* [x] create post (`src/app/(half)/post/create/`);
* [x] edit post (`src/app/(half)/post/edit/[id]/`);
* [x] delete post;
* [x] publish post / save as draft / archive — status selector (`<select>`) in the create/edit forms; `PostStatus` already existed in the schema (`docs/features/004-post-status/`) (`docs/features/011-post-status-preview/`);
* [ ] cover-image file upload — deferred to Phase 8 (owner decision, 2026-07-12): cover via URL already exists (`docs/features/010-post-cover-image/`), real file upload requires a storage decision that belongs to Phase 8 (Upload and media), it does not make sense to decide that just for posts;
* [x] preview before publishing — the owner can open the post's real URL (`/post/<slug>`) even in DRAFT/ARCHIVED and sees a "only you can see this" banner; anyone else still gets a 404 (`docs/features/011-post-status-preview/`);
* [x] post listing in admin — scoped as a **"my posts"** panel (`/post/mine`), not site-wide: without roles (Phase 3 not started yet), the only authorization rule today is "owner edits/deletes their own post," so the panel lists only the logged-in user's posts; when Phase 3 brings roles, an `ADMIN` may gain access to see other users' posts as an extension of this screen (`docs/features/012-my-posts-panel/`);
* [x] filters by status — the "my posts" panel filters by any status, not only `PUBLISHED` (`docs/features/012-my-posts-panel/`);
* [x] filters by category/tag — same, in the same panel (`docs/features/012-my-posts-panel/`).

### Screens

```txt
/admin/login
/admin/posts
/admin/posts/new
/admin/posts/:id/edit
/admin/posts/:id/preview
/admin/categories
/admin/tags
```

### Important rules

* an unauthenticated user cannot access `/admin`;
* only an authorized user can create a post;
* only admin/editor can publish;
* an author can edit their own drafts;
* a published post must pass validation.

### Completion criterion

This phase is done when you can manage all content through the admin, without touching the database directly.

## Phase 3 — Authentication and permissions ✅ Done (with 1 item deferred to Phase 4)

> **Prerequisite (2026-06-30):** before stacking roles/permissions on top of the current session, see `docs/features/001-auth-hardening/spec.md` — session with no server-side expiration, cookies without `HttpOnly`/CSRF, no rate limiting. Adding roles on top of that base would propagate the same attack surface to every new role. **Satisfied (2026-07-12)** — `001-auth-hardening` done.
>
> **Implementation:** `docs/features/013-role-based-permissions/` (RF-08). "Publish post"/"Archive post" in the table below are still allowed for the Author on their own post in this round — restricting them to Admin/Editor would require the review workflow from Phase 4 (`submit for review` → `approve`), which does not exist yet; applying the restriction without that workflow would trap any Author without Admin/Editor with posts stuck in `DRAFT`. Owner decision, 2026-07-12 (`013-role-based-permissions/spec.md` § 4/§ 7).

### Objective

Add real access control.

### Suggested roles

```ts
enum UserRole {
  ADMIN
  EDITOR
  AUTHOR
}
```

### Permissions

| Action                | Admin | Editor | Author |
| --------------------- | ----: | -----: | -----: |
| Create post            |   Yes |    Yes |    Yes |
| Edit any post          |   Yes |    Yes |     No |
| Edit own post           |   Yes |    Yes |    Yes |
| Publish post            |   Yes |    Yes |     No |
| Archive post            |   Yes |    Yes |     No |
| Manage users            |   Yes |     No |     No |
| Manage categories       |   Yes |    Yes |     No |

### Tasks

* [x] set up authentication (exists — no roles yet, see `docs/adr/0005-manter-auth-propria.md`);
* [x] protect admin routes — `roleProcedure(allowed)` (`src/server/createRouter.ts`) gates `category.create` and `user.updateRole` to `ADMIN`/`EDITOR`; editing/deleting another user's post is allowed for `ADMIN`/`EDITOR` via an ownership bypass (013);
* [x] create an authorization middleware — `roleProcedure`, a tRPC guard layer (the same level as `verifiedProcedure`), not `src/middleware.tsx`/Edge (the role check depends on the DB, see `013-role-based-permissions/spec.md` § 5);
* [x] create a permissions helper — `src/lib/permissions/` (`MatrixPermission`, same adapter+implementation pattern as `rateLimit`/`slug`);
* [x] add tests for the permission rules — `src/lib/permissions/__test__/matrix.ts` plus bypass tests in the `post`/`category`/`user` procedures.

### Completion criterion

This phase is done when the system prevents improper actions both in the frontend and the backend.

Important point: **do not rely only on a hidden button in the frontend**. The rule must also be enforced in the backend.

## Phase 4 — Editorial workflow ✅ Done (with 1 item deferred)

> **Implementation:** `docs/features/014-post-review-workflow/` (RF-09). Closes the item left by Phase 3 (`013-role-based-permissions/spec.md` § 4): an Author no longer publishes/archives their own post directly, they must go through the review workflow. "Change history" (a diff of each edit, `PostRevision`) is deferred — owner decision, 2026-07-14 (`014-post-review-workflow/spec.md` § 4), the same pattern as Phase 2 (image upload deferred to Phase 8).

### Objective

Bring the blog closer to a real publishing platform.

### New statuses

```ts
enum PostStatus {
  DRAFT
  IN_REVIEW
  SCHEDULED
  PUBLISHED
  ARCHIVED
}
```

### Features

* [x] submit post for review — `post.submitForReview` (owner, only from `DRAFT`);
* [x] approve post — `post.publish` from `IN_REVIEW` (Admin/Editor);
* [x] reject post — `post.reject`, reason required, goes back to `DRAFT` (Admin/Editor);
* [x] publish immediately — `post.publish` from `DRAFT`, skipping review (Admin/Editor);
* [x] schedule publication — `post.publish` with a future `scheduledAt` → `SCHEDULED`; public visibility is resolved via a lazy check on read (`scheduledAt <= now`), no new scheduler/job;
* [x] archive post — `post.archive`, any status except already archived (Admin/Editor; the Author loses the bypass they had in Phase 3);
* [ ] change history — deferred (diff of each edit, `PostRevision`), see note above;
* [x] internal review comments — `PostReviewComment`, read via `post.readReviewComments` (post owner or Admin/Editor).

### New models

```ts
PostRevision
PostReviewComment
```

### Important rules

* an author creates a post as `DRAFT`;
* an author can submit for `IN_REVIEW`;
* an editor/admin can approve;
* an editor/admin can publish;
* a scheduled post appears publicly only after the date;
* important changes generate a revision.

### Completion criterion

This phase is done when there is a real flow:

```txt
DRAFT -> IN_REVIEW -> SCHEDULED/PUBLISHED
```

At this point the project starts to look mid-level, because it stops being plain CRUD and starts having **business rules**.

## Phase 5 — SEO and professional publishing ✅ Done

> **Implementation:** `docs/features/015-seo-metadata/` (RF-10). Automatic SEO — sitemap/robots/RSS/canonical/Twitter Card/schema.org — all computed from fields the post already had (`title`/`content`/`slug`/`coverImageUrl`/`createdAt`/`updatedAt`), no migration. Owner decision, 2026-07-14 (`015-seo-metadata/spec.md` § 4/§ 7): editable override fields (`seoTitle`/`seoDescription`/`canonicalUrl`) and "friendly slug + redirect when the slug changes" were deferred for lack of demand — closed in `docs/features/018-seo-overrides-slug-redirect/` (2026-07-18, US-015): the slug is now editable (Author/Editor, same rule as `post.update`), with collision resolution via a numeric suffix (same algorithm as create) and an automatic 301 redirect from the old slug to the new one (`Post.previousSlug`, 1 level of history — see `docs/ach.md § 3.1`); `seoTitle`/`seoDescription`/`canonicalUrl` are editable in the edit form, falling back to the computed behavior when empty.

### Objective

Make the blog indexable and well presented when shared.

### Features

* [x] dynamic metadata per post (`generateMetadata` in `src/app/(half)/post/[slug]/page.tsx`);
* [x] title and description per post;
* [x] Open Graph (title/description/type/image — `coverImageUrl` already wired as `ogImageUrl`, `015`);
* [x] Twitter Card (`summary_large_image` with a cover, `summary` without one, `015`);
* [x] canonical URL (self-referential via `alternates.canonical` + `metadataBase`, `015`);
* [x] dynamic sitemap.xml (`src/app/sitemap.ts`, only publicly visible posts, `015`);
* [x] robots.txt (`src/app/robots.ts`, blocks private routes, points to the sitemap, `015`);
* [x] RSS feed (`src/app/feed.xml/route.ts`, hand-rolled RSS 2.0, `015`);
* [x] schema.org for the article (JSON-LD `Article` embedded in `PostView`, `015`);
* [x] friendly slug (editable by Author/Editor, `018`);
* [x] redirect when the slug changes (automatic 301 via `previousSlug`, `018`).

### New post fields

```ts
seoTitle
seoDescription
canonicalUrl
ogImageUrl
publishedAt
updatedAt
```

> **Note (`015`, 2026-07-14):** none of these fields were added to the schema in this round — `ogImageUrl` reuses the existing `coverImageUrl` (`010`); `seoTitle`/`seoDescription`/`canonicalUrl` as editable columns were deferred (no request for UI to customize SEO differently from the post content); `publishedAt` was not needed — `lastModified`/`pubDate` use the existing `updatedAt`/`createdAt`.
>
> **Note (`018`, 2026-07-18):** `seoTitle`/`seoDescription`/`canonicalUrl` added to the schema (nullable) and made editable in the post edit form; `Post.previousSlug` (nullable, `@unique`) added to support the redirect — not listed above because the decision on how to implement the redirect (single column vs. history table) was made only in this round (see `018-seo-overrides-slug-redirect/plan.md § 4`).

### Important rules

* every published post must have metadata — ✅ (`generateMetadata` runs for any slug read);
* an old slug must redirect to the new slug — ✅ (`018`, `previousSlug` + `post.readRedirectSlug` + `permanentRedirect` in `PostContent`; only 1 level of history — see `018-seo-overrides-slug-redirect/spec.md § 4`);
* the sitemap includes only published posts — ✅ (reuses `publicVisibilityFilter()` from `014`, includes `SCHEDULED` that has already elapsed);
* archived posts do not enter the sitemap — ✅ (same rule).

### Completion criterion

This phase is done when every post has full SEO and can be shared correctly on Discord, LinkedIn, WhatsApp, etc. **Satisfied** — automatic items (`015`) and friendly slug + redirect + editable SEO overrides (`018`).

## Phase 6 — Search and content discovery ✅ Done

> **Implementation:** `docs/features/016-search-content/` (RF-11). `post.search` searches by title/content (Prisma `contains`/`insensitive`, not native `tsvector` — see note below), with suggestions as you type in the header, reusing the same endpoint. `docs/features/019-search-sort-by-views/` (2026-07-18): `post.search` gained `sortBy: "recent" | "mostViewed"` (default `"recent"`, unchanged behavior), with a tiebreak by `id` in `orderBy` to keep cursor-based pagination deterministic under a `viewCount` tie; a `<select>` on `/search` lets the reader choose. This closed the item that Phase 7 (view counter) unblocked.

### Objective

Improve navigation and discovery of posts.

### Features

* [x] search by title (`post.search`, `016`);
* [x] search by content (`post.search`, `016`);
* [x] filter by tag (already existed via `readRecent`/`readOwn`/`readRelated`; `016` extends the same parameter to `search`);
* [x] filter by category (same);
* [x] sort by most recent (`readRecent` already sorts this way; `post.search` also has this as the default — `019`);
* [x] sort by most viewed (`post.search` with `sortBy: "mostViewed"`, `019-search-sort-by-views`, 2026-07-18 — unlocked by `Post.viewCount` from Phase 7);
* [x] related posts (`post.readRelated`, already implemented in Phase 1 — `007-posts-relacionados`);
* [x] optional autocomplete (`016` — suggestions in the header `SearchBox`, reusing `post.search` with a small `limit`, no dedicated endpoint).

### First implementation

Use PostgreSQL full-text search.

Later, if you want to evolve it:

```txt
Meilisearch
Typesense
Elasticsearch
```

But starting with Postgres itself is the way to go. Less infra, more chance of finishing.

> **Note (`016`, 2026-07-14):** the search in this round uses Prisma `contains`/`insensitive`, not native Postgres `tsvector`/`ts_rank`. The project's test harness (`ADR-0011`) runs against `prisma-mock`, a JS fake with no SQL parser — `$queryRaw`/`to_tsvector` would end up without automated test coverage (hard rule 1). Native full-text search (with relevance ranking) is deferred until there is an integration test against a real Postgres (already considered in `ADR-0011` as a Phase 9/10 candidate).
>
> **Resolved (`027`, 2026-08-26):** the integration harness landed in feature 026 (Testcontainers + real Postgres, ADR-0026), so native full-text shipped in `docs/features/027-native-fulltext-search/` (ADR-0027): a generated `tsvector` column + GIN index, `ts_rank` relevance ordering (default when a query is present), `portuguese` stemming, consistent matching across sorts. The search tests moved to `*.integration.ts` (the mock cannot run tsvector).

### Completion criterion

This phase is done when the user can find posts easily without relying only on the chronological listing.

## Phase 7 — Internal analytics ✅ Done

> **Implementation:** `docs/features/017-post-view-analytics/` (RF-12). `analytics.recordView` records a view of a public post (dedup per visitor for 24h via a first-party cookie plus Redis, `ADR-0013`), `analytics.readDashboard` (Admin/Editor) shows total views and a most-viewed ranking. `docs/features/020-view-analytics-breakdown/` (2026-07-18) closed the item deferred in `017-post-view-analytics/spec.md § 4`: breakdown by period (last 7/30 days), traffic source (classified from the `Referer` header), and browser/OS (classified from the raw `User-Agent`). Retention/privacy decision (owner, 2026-07-18): raw events kept for 30 days with lazy deletion on read (no cron), no IP persisted.

### Objective

Build a dashboard to track post performance.

### Features

* [x] record a post view (`017`, dedup per visitor for 24h);
* [x] count total views (`017`);
* [x] count views by period (last 7/30 days, `020-view-analytics-breakdown`, 2026-07-18);
* [x] most-viewed posts (`017`);
* [x] traffic source (classified from the `Referer` header into direct/search/social/other, `020-view-analytics-breakdown`, 2026-07-18);
* [x] user agent (categorized into browser/OS by regex on read, no new library, `020-view-analytics-breakdown`, 2026-07-18);
* [x] referrer (same mechanism as the "traffic source" item above — a single breakdown, not two separate ones);
* [x] admin dashboard (`/analytics`, restricted to Admin/Editor via `roleProcedure`, `017`).

### Initial model

```ts
PostView {
  id
  postId
  visitorId
  ipHash
  userAgent
  referrer
  createdAt
}
```

> Original phase sketch, prior to implementation — kept for history. The real model (`020-view-analytics-breakdown/plan.md § 3`) differs by owner privacy decision: no `ipHash`/`visitorId` in the table (dedup already solved via Redis, `ADR-0013`), `referrer` becomes `referrerBucket` (classified into DIRECT/SEARCH/SOCIAL/OTHER on write, does not store the raw URL), and 30-day retention with lazy deletion on read.

### Dashboard

```txt
/admin/analytics
/admin/analytics/posts/:id
```

### Metrics

* total views;
* views in the last 7 days;
* views in the last 30 days;
* most-viewed posts;
* traffic sources;
* growth by period.

### Completion criterion

This phase is done when you can open the admin and see which posts are performing best.

This part is very good for a portfolio because it shows you think beyond CRUD.

## Phase 8 — Media upload and management ✅ Done (with 1 item deferred)

> **Implementation:** `docs/features/021-media-upload/` (RF-13, US-016). Real file upload via `media.upload` (FormData through the same tRPC route — `ADR-0015`), a "my media" library (`media.readOwn`, Admin/Editor see everyone's), delete (`media.delete`, owner or `media:deleteAny`), optional alt text, format validation (jpeg/png/webp/gif) and size (5MB default) at the boundary. A post's cover image can now come from uploaded media — the UI just fills in the existing `coverImageUrl` (`010-post-cover-image`), no migration on `Post`. Item deferred: automatic image compression/optimization (owner decision, 2026-07-26, `021-media-upload/spec.md § 4`) — explicitly optional in the roadmap; if the final storage turns out to be an image CDN with native transformation (Cloudinary is being considered), compression stops being necessary and the item closes on its own.

### Objective

Let the system handle images in an organized way.

### Features

* [x] image upload (`021`);
* [x] media listing (`021`, `/media`);
* [x] remove media (`021`);
* [x] cover image for a post (`021`, reuses `coverImageUrl` from `010`);
* [x] alt text (`021`);
* [x] size validation (`021`, 5MB default via `MEDIA_MAX_UPLOAD_SIZE_BYTES`);
* [x] format validation (`021`, jpeg/png/webp/gif);
* [ ] optional compression/optimization — deferred, see note above.

### Suggested implementation

Start with local storage in development.

Then move to:

```txt
Cloudflare R2
AWS S3
MinIO local
```

> **Note (`021`, 2026-07-26):** local storage implemented (`public/uploads/`, Docker volume to persist across restarts). The `mediaStorage` gateway (`ADR-0015`) is pluggable — swapping in Cloudinary/S3/R2 later is just a new implementation, without touching domain/procedure.

### Model

```ts
Media {
  id
  url
  storageKey
  filename
  mimeType
  size
  altText
  uploadedById
  createdAt
}
```

> **Note (`021`, 2026-07-26):** `storageKey` was added to the original sketch — an opaque storage identifier (a local path today, a `public_id` on an image CDN later), distinct from the public `url`. Decision recorded in `ADR-0015`.

### Completion criterion

This phase is done when posts can use images managed by the system itself. **Satisfied** — upload, library, removal, and use as cover (`021`); compression/optimization is deferred until there is real demand or the final storage handles it natively.

## Phase 9 — Production quality 🟡 Partial

### Objective

Add practices companies expect from a serious project.

### Tasks

* [x] structured logs — canonical log line per procedure call, JSON prod / pretty dev by `env.nodeEnv`, allowlist redaction (`docs/features/025-structured-logging/`, `ADR-0022`, RF-14);
* [x] standardized error handling — `ErrorRegistry` (`ADR-0017`, `022-error-registry`, RF-14): namespaced `DomainError` resolves `httpCode`/`message` on its own, closing hard rule 15 (`docs/afm.md` § 3);
* [x] error page (`src/app/error.tsx`, `src/app/not-found.tsx`);
* [ ] loading states (no App Router `loading.tsx`; not audited as a systematic convention);
* [~] empty states — confirmed in `src/components/postFeed.tsx` ("No posts found."), not audited across all components;
* [x] validation with Zod (`src/server/schema/*.schema.ts`);
* [x] unit tests (86 `vitest` files, 411 tests — backend coverage ~90% via v8, measured 2026-08-25; whole-repo ~52% is dragged down by the untested frontend, deferred with the frontend refactor — see `docs/afm.md` § 3.1); plus an integration suite against real Postgres (`026`, ADR-0026);
* [x] integration tests — harness via Testcontainers + real Postgres (`docs/features/026-integration-test-harness/`, ADR-0026): boots `postgres:16`, applies the real migrations, runs the domain/repository layer against a real engine (raw SQL / `to_tsvector` — what `prisma-mock` cannot). Unblocks native full-text search (Phase 6, feature 027);
* [ ] basic e2e tests;
* [x] development seed (`prisma/seed.ts` — 3 users, posts, comments, verify/reset tokens);
* [x] organized migrations (`prisma/migrations/`);
* [ ] rate limiting on sensitive endpoints (see `docs/features/001-auth-hardening/spec.md`).

### Important tests

* create post;
* edit post;
* publish post;
* prevent an author from publishing;
* prevent access to admin without login;
* generate a unique slug;
* search posts;
* record a view;
* generate the sitemap.

### Completion criterion

This phase is done when the project has minimal coverage of the most important rules and does not depend on manual testing for everything.

## Phase 10 — CI/CD and deploy 🟡 Partial

### Objective

Get the project live with an at-least-minimally professional pipeline. **Update (2026-08-25):** the CI pipeline now exists — `.github/workflows/ci.yml` runs `typecheck` (`tsc --noEmit`), `lint` (`biome check`), `test` (`npm test`), and `build` (`npm run build` against a Postgres service) on every PR and push to `develop`/`main`, on Node 20; PRs also deploy via Vercel. Local `.husky/` validation still runs as the pre-commit layer (see `docs/afm.md` § 6). What is still missing to close the phase: the infra-hardening item below, README run instructions, and a confirmed stable production environment.

### Suggested pipeline

On opening a PR or pushing:

```txt
install
lint
typecheck
test
build
```

### Deploy

Good options:

```txt
Vercel + external PostgreSQL
Railway
Render
Fly.io
VPS with Docker
```

For a portfolio, Vercel + an external database is the simplest path.

To show more infra, a VPS with Docker is more interesting.

### Final Docker Compose

```txt
app
postgres
redis
minio optional
```

**Item inherited from `001-auth-hardening` (2026-07-12):** the production `docker-compose.yml` today has hardcoded Postgres credentials (`postgres`/`postgres`) and exposes the Postgres port to the host without need (the app and Postgres are already on the same Docker network). Address this along with the infra hardening in this phase — not a new regression, it is pre-existing debt that the application hardening (feature 001) deliberately did not cover (out of scope, owner decision).

### Completion criterion

This phase is done when:

* the project is online;
* the README explains how to run it;
* the pipeline validates the code;
* the database has migrations;
* a minimally stable production environment exists.

## Phase 11 — Observability 🟡 Partial

### Objective

Show technical maturity.

### Features

* [x] structured logs — delivered early in Phase 9 (`docs/features/025-structured-logging/`, `ADR-0022`);
* [ ] request ID;
* [x] route response time — the canonical line carries `durationMs` per call (`ADR-0022`);
* [ ] basic tracing with OpenTelemetry;
* [ ] simple metrics;
* [ ] health check;
* [ ] `/api/health` endpoint (today only `/api/trpc/[trpc]` exists).

### Example

```txt
GET /api/health
```

Response:

```json
{
  "status": "ok",
  "database": "connected",
  "version": "1.0.0"
}
```

### Completion criterion

This phase is done when you can understand what is happening in the system without resorting to random `console.log` calls.

## Recommended order

I would follow exactly this order:

```txt
Phase 0 — Initial setup
Phase 1 — Public blog
Phase 2 — Admin/CMS
Phase 3 — Auth and permissions
Phase 4 — Editorial workflow
Phase 5 — SEO
Phase 6 — Search
Phase 7 — Analytics
Phase 8 — Media/upload
Phase 9 — Production quality
Phase 10 — CI/CD and deploy
Phase 11 — Observability
```

## Minimal MVP

To stay focused, the first big goal should be:

```txt
Public blog + Admin + Auth + Publishing
```

In other words:

* the user logs in;
* creates a post;
* edits a post;
* publishes a post;
* the post appears publicly;
* the slug works;
* the database works;
* the project runs with Docker.

That is already a closed delivery.

## Portfolio-ready version

After the MVP, aim for this:

```txt
Public blog
Admin/CMS
Auth
Roles
Editorial workflow
Full SEO
Search
Analytics
Image upload
Tests
CI/CD
Deploy
Technical README
```

This version is already quite strong for a mid-level role.

## Excellent version

To stand out above average:

```txt
OpenTelemetry
Structured logs
Post preview
Publication scheduling
Revision history
Old-slug redirect
RSS feed
Analytics dashboard
Rate limiting
Production-ready Docker
```

This gives a much better impression than a plain CRUD.

## What to put in the README

When the project is more mature, the README needs to sell the project well.

Good structure:

```txt
# Project name

## About
## Features
## Stack
## Architecture
## Technical decisions
## How to run locally
## Environment variables
## Available scripts
## Tests
## Deploy
## Roadmap
## Screenshots
```

The most important part is **Technical decisions**.

Example:

```txt
I decided to separate publishing rules into a domain layer to prevent important rules from being scattered across routes, components, and direct Prisma calls.
```

This shows maturity.

## Direct recommendation

Do not try to do everything at once.

First, deliver this:

```txt
1. Public blog working
2. Admin working
3. Auth working
4. Publishing working
5. Decent README
6. Deploy online
```

Then add SEO, search, analytics, workflow, tests, and observability.

The project starts simple, but can become an application very close to production. The differentiator will not be the idea. It will be the execution.
</content>
