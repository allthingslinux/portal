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
    },
  },
  resolve: {
    alias: {
      "@/auth/client": path.resolve(
        import.meta.dirname,
        "./src/features/auth/lib/client.ts"
      ),
      "@/auth": path.resolve(import.meta.dirname, "./src/features/auth/lib"),
      "@/db": path.resolve(import.meta.dirname, "./src/shared/db"),
      "@/config": path.resolve(import.meta.dirname, "./src/shared/config"),
      "@/ui": path.resolve(import.meta.dirname, "./src/components/ui"),
      "@": path.resolve(import.meta.dirname, "./src"),
      "server-only": path.resolve(
        import.meta.dirname,
        "./vitest.server-only-mock.ts"
      ),
    },
  },
});
