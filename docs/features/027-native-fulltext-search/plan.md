# Feature 027 — Plan

> **Spec:** [`./spec.md`](./spec.md) · **ADR:** ADR-0027

## 1. Approach

Generated `tsvector` column + GIN index (custom migration; column declared `Unsupported("tsvector")?` in schema so Prisma tracks it). `PostModel.search` runs a `$queryRaw` that ranks matching post ids (all filters + visibility + keyset pagination in SQL), then hydrates full posts with the existing `findMany({ id: in }, include)` and re-sorts to the ranked order — relations and return shape unchanged. Raw SQL stays in the model (rule 30); the domain (`domain_searchPosts`) and the endpoint contract are untouched.

## 2. Components

| Component | File | Kind |
| --- | --- | --- |
| Generated column + GIN | `prisma/migrations/<ts>_add_post_search_vector/migration.sql` | migration |
| Schema tracking | `prisma/schema.prisma` (`searchVector Unsupported("tsvector")?` + GIN index) | schema |
| Sort option | `src/server/features/post/schema.ts` (`sortBy` += `"relevance"`) | boundary |
| Search rewrite | `src/server/models/post.ts` (`search`) | model |
| Integration tests | `src/server/features/post/__itest__/search.integration.ts` | test |
| Unit search test | `src/server/features/post/procedures/__test__/search.ts` — removed (moved to integration) | test |

## 3. Key decisions

- **`portuguese` dictionary** — matches the blog's pt-BR content; the generated column and `websearch_to_tsquery` both use it (must agree).
- **`websearch_to_tsquery`** — user-friendly query syntax (quotes, `or`, `-`); tolerant of arbitrary input.
- **rank-then-hydrate** — `$queryRaw` returns ordered ids; `findMany(..., include)` hydrates; re-sort by id order. Keeps relations + `IPostEntityWithRelations` shape without hand-mapping every column in SQL.
- **Cursor stays a post id** — the model does keyset pagination by looking up the cursor row's sort key in a subquery (`ts_rank`/`createdAt`/`viewCount` + id tiebreak), so `domain_searchPosts` (nextCursor = last id) is unchanged.
- **default `sortBy = "relevance"`** when a query is present (the point of search); `recent`/`mostViewed` still available.
- **All sorts match via `@@`** (consistent stemming); only the ORDER differs.

## 4. Validation against afm.md § 3

- Rule 30: `$queryRaw` lives in the **model** (data layer); domain/procedure still use `ctx.repositories`.
- Rule 16: validation stays in `searchPostsSchema` (procedure boundary); the model receives typed args.
- Rule 6: `post.ts` is already >300 (416, forward-only debt); the rewrite replaces the search body without net growth where avoidable — watch the line count.
- Rule 1: new code (the query) is covered by the integration tests; the unit cases move there (not lost).
- Migration forward-compatible (additive column + index).
