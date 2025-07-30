import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": "/src"
    }
  },

  test: {
    include: ["src/**/*.setup.test.ts", "src/**/*.test.ts"],
    poolOptions: {
      threads: {
        singleThread: true
      }
    }
  }
});
