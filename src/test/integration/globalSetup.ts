import { execSync } from "node:child_process";
import {
	PostgreSqlContainer,
	StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";

// Boots ONE real Postgres container for the whole integration run, applies the
// project's real migrations against it, and exposes its URL via DATABASE_URL so
// the unchanged Prisma driver (`src/server/infra/drivers/prisma.ts`) connects to
// it. Testcontainers tears the container down in `teardown` (and via Ryuk if the
// process dies). This is the integration counterpart to `src/test/prisma` — real
// SQL engine instead of `prisma-mock`. See ADR-0026.
let container: StartedPostgreSqlContainer | undefined;

async function setup(): Promise<void> {
	container = await new PostgreSqlContainer("postgres:16").start();
	const databaseUrl = container.getConnectionUri();
	process.env.DATABASE_URL = databaseUrl;

	execSync("npx prisma migrate deploy", {
		env: { ...process.env, DATABASE_URL: databaseUrl },
		stdio: "inherit",
	});
}

async function teardown(): Promise<void> {
	await container?.stop();
}

export { setup, teardown };
