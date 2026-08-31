-- Native full-text search (feature 027, ADR-0027).
-- A generated STORED tsvector over title+content (english dictionary — the
-- product content is en-US) plus a GIN index. Title is weighted 'A' and content
-- 'B' so a title match outranks a body match under ts_rank. Written by hand
-- because Prisma cannot express GENERATED ALWAYS AS. Postgres keeps the column in
-- sync on every insert/update.

ALTER TABLE "Post"
  ADD COLUMN "searchVector" tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce("title", '')), 'A') ||
    setweight(to_tsvector('english', coalesce("content", '')), 'B')
  ) STORED;

CREATE INDEX "Post_searchVector_idx" ON "Post" USING GIN ("searchVector");
