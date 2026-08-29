# ADR-0027 — Native Postgres full-text search (tsvector/ts_rank)

> **Status:** Accepted and implemented
> **Date:** 2026-08-26
> **Decided by:** product owner
> **Extends:** [ADR-0011](./0011-prisma-mock-para-testes.md) (deferred native search) · uses [ADR-0026](./0026-integration-tests-testcontainers.md) (integration harness)

## Context

Phase 6 shipped `post.search` with Prisma `contains`/`insensitive` — substring matching, no stemming, no relevance ranking. Native full-text (`tsvector`) was deferred because `prisma-mock` has no SQL engine to test it (ADR-0011). Feature 026 delivered the integration harness (real Postgres), removing that blocker. Full-text with relevance ranking and stemming is the actual point of a search feature.

## Decision

Adopt **native Postgres full-text search** on `Post`:

- **Generated column + GIN index.** A `searchVector tsvector GENERATED ALWAYS AS (setweight(to_tsvector('english', title), 'A') || setweight(to_tsvector('english', content), 'B')) STORED` column, kept in sync by Postgres, with a GIN index. Created in a hand-written migration (Prisma cannot express `GENERATED ALWAYS AS`); declared `Unsupported("tsvector")?` in the schema so Prisma tracks it and does not drop it on drift.
- **`english` dictionary; title weighted above content.** The product content is en-US (a future i18n system will add pt-BR — see `afm.md` § 1.3), so the dictionary is `english` (stems `debugging`↔`debug`, drops English stop-words). Title is `setweight(... 'A')` and content `'B'`, so a title match outranks a body match under `ts_rank` — a flat `title || content` vector would rank them by document length alone (which passed the ranking test only by luck).
- **Query in the model (rule 30).** `PostModel.search` runs a `$queryRaw` CTE that matches by `searchVector @@ websearch_to_tsquery('english', q)`, ranks by `ts_rank`, applies the existing filters (visibility/category/tag), paginates by keyset, and returns ordered ids; a second `findMany({ id: in }, include)` hydrates the relations and the order is restored. Raw SQL stays in the data layer; the domain and the `post.search` contract are unchanged.
- **Consistent matching across sorts.** All sorts (`relevance`/`recent`/`mostViewed`) match via `@@`; only the ORDER differs. `sortBy` gains `"relevance"` (the default when a query is present). The cursor stays an opaque post id — keyset compares against the cursor row's own sort key via a subselect.
- **Tests move to integration.** The tsvector query cannot run on `prisma-mock`, so the search matching/ranking/filter/pagination tests live in `*.integration.ts` (real Postgres, ADR-0026). Only the boundary validation (Zod min-length, no DB) stays a unit test.

## Alternatives considered

- **Keep `contains`/`insensitive`** — rejected: no ranking, no stemming; the roadmap's Phase 6 native-search item stays open.
- **Additive `sortBy: "relevance"` only, leaving other sorts on `contains`** — rejected: two matching semantics (substring vs stemmed) would return different result sets per sort, confusing users.
- **Meilisearch/Typesense/Elasticsearch** — rejected (roadmap): start with Postgres native; less infra, and enough for this scale.
- **Query-time `to_tsvector` (no stored column)** — rejected: recomputes the vector per query and cannot use a plain GIN index efficiently; a generated STORED column is indexed and maintained automatically.

## Consequence

- **Easy now:** relevance-ranked, stemmed search; a title match outranks a body match; filters and cursor pagination preserved. Native ranking primitives are exercised against real Postgres in CI.
- **Harder / watch out:**
  - **Only `prisma migrate deploy` works on this schema.** The column is declared `Unsupported("tsvector")` (no generation info) but the real column is `GENERATED ALWAYS AS (...) STORED`, so Prisma reads a permanent drift: `prisma db push` fails outright, and `prisma migrate dev` fails **and leaves a failed phantom migration** that then blocks every later `migrate deploy` with P3009. Change the schema only via hand-written migrations + `migrate deploy`; recover from a phantom with `prisma migrate resolve --rolled-back <name>`. Bit twice on 2026-08-29 — see `docs/gotchas.md` (Prisma — `Unsupported` generated column).
  - Dictionary choice is baked into the stored column: changing it (e.g. when i18n adds pt-BR) needs a migration to recompute the column.
  - Search behavior is now integration-tested (needs Docker), not unit-tested — by design (the mock cannot run tsvector).
