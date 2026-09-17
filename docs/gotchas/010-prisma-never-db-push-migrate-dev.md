---
type: gotcha
description: 'Prisma — never `db push` / `migrate dev` on a model with an `Unsupported` generated column'
load: warm
fires_on: event
fires_when: 'if you are editing `prisma/schema.prisma` for a model that has an `Unsupported(...)` column backed by a raw-SQL `GENERATED ALWAYS AS ... STORED` migration (toda'
---

# Prisma — never `db push` / `migrate dev` on a model with an `Unsupported` generated column

**Trigger:** if you are editing `prisma/schema.prisma` for a model that has an `Unsupported(...)` column backed by a raw-SQL `GENERATED ALWAYS AS ... STORED` migration (today: `Post.searchVector`, ADR-0027), or you are about to run `prisma db push` / `prisma migrate dev`.

**Behavior:** the schema declares the column as `Unsupported("tsvector")?` (no generation info), but the real column is `GENERATED ALWAYS AS (...) STORED`. Prisma reads this as drift and tries to reconcile it, emitting an `ALTER COLUMN` that Postgres rejects (`column "searchVector" ... is a generated column, HINT: Use ALTER TABLE ... DROP EXPRESSION`). `db push` fails outright; `migrate dev` fails **and leaves a failed phantom migration** in `_prisma_migrations` (an empty-named record, not on disk) that then blocks every later `migrate deploy` with **P3009**. Both bit on 2026-08-29: `db push` on first apply, then `migrate dev` created the phantom.

**Solution:**
- Apply migrations with **`prisma migrate deploy`** only — it runs the migration files as written, no schema diffing. Never `db push` / `migrate dev` on this schema.
- To change the schema, hand-write the migration SQL (`migrate dev --create-only` then edit the `migration.sql`, or write it directly) and `migrate deploy` — as feature `027` did for the generated column.
- If a phantom already blocks you (P3009): `prisma migrate resolve --rolled-back <failed_migration_name>`, then `migrate deploy` is clean.

**Ref:** ADR-0027 (native full-text search). Migration: `prisma/migrations/20260827120000_add_post_search_vector/`.
