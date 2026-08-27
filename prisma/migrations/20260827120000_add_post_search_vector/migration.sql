-- Native full-text search (feature 027, ADR-0027).
-- A generated STORED tsvector over title+content (portuguese dictionary) plus a
-- GIN index. Written by hand because Prisma cannot express GENERATED ALWAYS AS.
-- The column is kept in sync by Postgres automatically on every insert/update.

ALTER TABLE "Post"
  ADD COLUMN "searchVector" tsvector
  GENERATED ALWAYS AS (
    to_tsvector('portuguese', coalesce("title", '') || ' ' || coalesce("content", ''))
  ) STORED;

CREATE INDEX "Post_searchVector_idx" ON "Post" USING GIN ("searchVector");
