-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'EDITOR', 'AUTHOR');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'AUTHOR';

-- Promote the product owner's account (only non-seed user in dev DB, decided at gate 2026-07-12)
UPDATE "User" SET "role" = 'ADMIN' WHERE "email" = 'codorkman@gmail.com';
