import { afterAll, beforeEach } from "vitest";
import { prisma } from "@/server/infra/drivers/prisma";

// Real-Postgres reset between tests — the integration analogue of
// `resetPrismaMock`. TRUNCATE every table (except Prisma's own migration ledger)
// so each test starts from a clean schema-preserving state. No driver mock here:
// the real `prisma` connects to the Testcontainers Postgres via DATABASE_URL.
beforeEach(async () => {
	const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
		SELECT tablename FROM pg_tables
		WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'
	`;

	if (tables.length === 0) return;

	const list = tables.map((table) => `"${table.tablename}"`).join(", ");
	await prisma.$executeRawUnsafe(`TRUNCATE ${list} RESTART IDENTITY CASCADE`);
});

afterAll(async () => {
	await prisma.$disconnect();
});
