import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/core/database/schema.ts",
  out: "./src/core/database/drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // This will use local development DB by default
    url:
      process.env.DATABASE_URL ??
      "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
  },
  schemaFilter: ["public"],
  verbose: true,
  strict: true,
});
