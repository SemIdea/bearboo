-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "previousSlug" TEXT,
ADD COLUMN     "seoTitle" TEXT,
ADD COLUMN     "seoDescription" TEXT,
ADD COLUMN     "canonicalUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Post_previousSlug_key" ON "Post"("previousSlug");
