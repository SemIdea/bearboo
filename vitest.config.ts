import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
	resolve: {
		alias: {
			"@": "/src",
		},
	},

	test: {
		include: ["src/**/__test__/**/*.ts"],
		poolOptions: {
			threads: {
				singleThread: true,
			},
		},
	},
});
