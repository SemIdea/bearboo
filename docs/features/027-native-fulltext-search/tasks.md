# Feature 027 — Tasks

> **Spec:** [`./spec.md`](./spec.md) · **Plan:** [`./plan.md`](./plan.md)
> Each task is a § 2 cycle. Refs Phase 6 (search) / Phase 9.

## Setup / migration

- [X] **T001** `prisma/schema.prisma` — add `searchVector Unsupported("tsvector")?` + `@@index([searchVector], type: Gin)` to `Post`.
- [X] **T002** `prisma/migrations/<ts>_add_post_search_vector/migration.sql` — hand-written: `ADD COLUMN "searchVector" tsvector GENERATED ALWAYS AS (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(content,''))) STORED;` + `CREATE INDEX ... USING GIN`. Verify it applies against a real container.

## Boundary

- [X] **T003** `src/server/features/post/schema.ts` — `sortBy` enum += `"relevance"`.

## Core — the query rewrite

- [X] **T004** `src/server/models/post.ts` — rewrite `search`: `$queryRaw` ranked ids (`@@ websearch_to_tsquery('english', q)` + visibility + category/tag + keyset by cursor row's sort key), then hydrate via `findMany({ id: in }, include)` re-sorted to the ranked order. Default sort `relevance`.

## Tests (integration — the mock cannot run tsvector)

- [X] **T005** `src/server/features/post/__itest__/search.integration.ts` — title-over-body ranking (title weighted `'A'`), english stemming (`debugging` ~ `debug`), category/tag/visibility filters, `recent`/`mostViewed` sorts, cursor pagination. RED→GREEN against the container.
- [X] **T006** Remove `src/server/features/post/procedures/__test__/search.ts` (coverage moved to T005). Confirm `npm test` green without it and `npm run test:integration` green.

## Reconciliation (§ 8.5)

- [X] **T007** ADR-0027 (native full-text; extends ADR-0011's deferred note, uses ADR-0026 harness); this feature folder.
- [X] **T008** `roadmap.md` Phase 6 — native search done. Boy-scout: re-apply the coverage figures lost in the #226 merge (roadmap 18/522, afm.md 207 → ~90% backend). `ach.md`/`ust.md` if the search contract note changed.
