# Feature 027 — Native Postgres full-text search (tsvector/ts_rank)

> **Spec:** the what and the why. Technology decision in the plan + a new ADR.
> **Related:** Roadmap Phase 6 (search) — closes the deferred native-search item. Uses the feature-026 integration harness (ADR-0026).
> **Status:** done
> **Opened:** 2026-08-26

## 1. Problem (from the roadmap)

Phase 6 shipped search with Prisma `contains`/`insensitive` (substring, no stemming, no relevance) because `prisma-mock` has no SQL engine for `tsvector` (ADR-0011). Feature 026 delivered the integration harness (real Postgres) that unblocks the native approach. Native full-text gives **relevance ranking** and **stemming** — the actual point of a search feature.

## 2. Scope

**In:**
- A generated `tsvector` column on `Post` (over `title` + `content`, `portuguese` dictionary) + GIN index (custom migration).
- Rewrite `PostModel.search` to match by `searchVector @@ websearch_to_tsquery` and order by `ts_rank` (relevance), `createdAt` (recent), or `viewCount` (mostViewed) — matching is now **consistent** across sorts. `$queryRaw` stays in the model (rule 30); rank-then-hydrate preserves relations and the return shape.
- `sortBy` gains `"relevance"` (the default when a query is present).
- Integration tests (026 harness) for ranking, stemming, filters, and pagination. The unit search tests move to integration (the mock cannot run `tsvector`).

**Out:** Meilisearch/Typesense/Elasticsearch (roadmap: start with Postgres native); full-text over fields other than title/content; frontend changes beyond the preserved contract.

## 3. Acceptance criteria

- `post.search` matches by native full-text (stemming: `programação` matches `programar`), ranks title matches above body matches, and keeps the existing filters (category/tag/visibility) and cursor pagination + the `recent`/`mostViewed` sorts.
- The endpoint contract (`searchPostsSchema` in / paginated out with `nextCursor`) is preserved; `sortBy` adds `"relevance"` (default with a query).
- Integration suite (`*.integration.ts`) proves ranking/stemming/filters against real Postgres. `npm test` (unit) stays green (search cases moved to integration, not lost).
- `tsc --noEmit` + `biome check` clean; migration applies cleanly (`migrate deploy`).

## 4. Notes

- Migration is forward-compatible: an additive generated column + index, no destructive change (afm.md § 1.3).
- The `portuguese` dictionary fits the blog's pt-BR content; English/code terms still match as tokens (no wrong English stemming).
