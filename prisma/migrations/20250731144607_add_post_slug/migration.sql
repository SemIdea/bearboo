-- AlterTable (nullable first — existing rows get backfilled below before NOT NULL)
ALTER TABLE "Post" ADD COLUMN "slug" TEXT;

-- Backfill: sem slug amigável ainda gerado pra linhas existentes (dev/seed).
-- Não há banco de produção hoje (docs/roadmap.md Fase 10 não iniciada), então
-- usar o próprio "id" como slug provisório é suficiente — é único por construção
-- e evita colidir com o gerador determinístico usado pelo app daqui pra frente.
UPDATE "Post" SET "slug" = "id" WHERE "slug" IS NULL;

-- AlterTable (agora sim NOT NULL, com todas as linhas já preenchidas)
ALTER TABLE "Post" ALTER COLUMN "slug" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");
