import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
	resolve: {
		alias: {
			"@": "/src",
		},
	},

	test: {
		setupFiles: ["src/test/setup.ts"],
		include: ["src/**/__test__/**/*.ts"],
		pool: "threads",
		maxWorkers: 1,
		fileParallelism: false,
	},
});
