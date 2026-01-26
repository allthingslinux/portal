import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["tests/**/*.test.ts"],
    exclude: [
      "node_modules/**",
      "**/node_modules/**",
      "**/.next/**",
      "**/coverage/**",
      "**/references/**",
      "**/*.config.*",
      "src/**/*.test.*",
      "src/**/*.spec.*",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      include: ["src/**/*.ts", "src/**/*.tsx"],
      exclude: [
        "node_modules/",
        "src/components/ui/**",
        "tests/**",
        "**/*.d.ts",
        "**/*.config.*",
        "**/mockData/**",
        "**/__tests__/**",
        ".next/**",
        "coverage/**",
        "references/**",
      ],
      thresholds: {
        lines: 40,
        functions: 40,
        branches: 40,
        statements: 40,
      },
    },
  },
  resolve: {
    alias: {
      "@/auth/client": path.resolve(__dirname, "./src/lib/auth/client.ts"),
      "@/auth": path.resolve(__dirname, "./src/lib/auth/index.ts"),
      "@/db": path.resolve(__dirname, "./src/lib/db"),
      "@/config": path.resolve(__dirname, "./src/lib/config"),
      "@/ui": path.resolve(__dirname, "./src/components/ui"),
      "@": path.resolve(__dirname, "./src"),
      "server-only": path.resolve(__dirname, "./vitest.server-only-mock.ts"),
    },
  },
});
