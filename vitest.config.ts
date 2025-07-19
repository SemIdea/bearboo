import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": "/src"
    }
  },

  test: {
    include: ["**.setup.test.ts", "**.test.ts"],
    poolOptions: {
      threads: {
        singleThread: true
      }
    }
  }
});
