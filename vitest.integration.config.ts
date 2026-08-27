import { defineConfig } from "vitest/config";

// Integration suite — real Postgres via Testcontainers (ADR-0026). Kept separate
// from the fast unit suite (`vitest.config.ts`, prisma-mock): different setup, no
// driver mock, and a Docker daemon required. Run with `npm run test:integration`.
export default defineConfig({
	resolve: {
		alias: {
			"@": "/src",
		},
	},

	test: {
		globalSetup: ["src/test/integration/globalSetup.ts"],
		setupFiles: ["src/test/integration/setup.ts"],
		include: ["src/**/*.integration.ts"],
		// Forks (not threads) so DATABASE_URL set in globalSetup reaches the worker;
		// a single serial worker so tests share the one container without racing on
		// the TRUNCATE reset.
		pool: "forks",
		maxWorkers: 1,
		fileParallelism: false,
		testTimeout: 30_000,
		hookTimeout: 120_000,
	},
});
