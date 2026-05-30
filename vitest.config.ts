import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, ".")
    }
  },
  test: {
    environment: "node",
    environmentMatchGlobs: [["tests/**/*.test.tsx", "jsdom"]],
    include: ["tests/**/*.test.{ts,tsx}"],
    setupFiles: ["tests/setup.ts"]
  }
});
