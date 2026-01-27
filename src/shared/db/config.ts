import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// ============================================================================
// Drizzle Kit Configuration
// ============================================================================
// This file configures Drizzle Kit for schema management, migrations, and introspection.
// See: https://orm.drizzle.team/docs/drizzle-config-file
//
// Available commands:
//   pnpm db:generate  - Generate migration files from schema changes
//   pnpm db:migrate   - Run migrations against the database
//   pnpm db:push      - Push schema changes directly to database (dev only)
//   pnpm db:studio    - Open Drizzle Studio for database visualization
//
// Configuration options:
//   - dialect: Database type (postgresql, mysql, sqlite, etc.)
//   - schema: Glob-based path(s) to schema files
//   - out: Output folder for migrations and snapshots
//   - dbCredentials: Database connection credentials
//   - verbose: Print all SQL statements during operations
//   - strict: Prompt confirmation before running SQL (push command)
//   - breakpoints: Embed statement breakpoints in migrations (default: true)
//   - tablesFilter: Filter tables to manage (glob pattern)
//   - schemaFilter: Filter schemas to manage (array of schema names)
//   - extensionsFilters: Ignore tables created by extensions (e.g., postgis)

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not defined.");
}

export default defineConfig({
  // Database dialect
  // Options: "postgresql" | "mysql" | "sqlite" | "turso" | "singlestore" | "mssql" | "cockroachdb"
  dialect: "postgresql",

  // Database connection credentials
  // For PostgreSQL, you can also specify: host, port, user, password, database, ssl
  dbCredentials: {
    url: process.env.DATABASE_URL,
    // Additional connection options (uncomment if needed):
    // host: process.env.DB_HOST,
    // port: parseInt(process.env.DB_PORT || "5432"),
    // user: process.env.DB_USER,
    // password: process.env.DB_PASSWORD,
    // database: process.env.DB_NAME,
    // ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  },

  // Schema file paths (glob-based)
  // Can be a string, array of strings, or glob pattern
  // Examples:
  //   "./src/shared/db/schema.ts"       - Single file
  //   "./src/shared/db/schema/*"        - All files in schema folder
  //   ["./src/shared/db/schema/*.ts"]  - Array of glob patterns
  //   "./src/**/schema.ts"               - All schema.ts files recursively
  schema: "./src/shared/db/schema/*",

  // Output folder for migrations, snapshots, and pulled schemas
  // Default: "./drizzle"
  // Contains:
  //   - Migration folders with SQL files
  //   - JSON snapshots of schema state
  //   - Generated schema.ts from drizzle-kit pull
  out: "./drizzle",

  // Print all SQL statements during operations
  // Useful for debugging and understanding what Drizzle Kit is doing
  verbose: true,

  // Prompt confirmation before running SQL statements (push command)
  // When true, Drizzle Kit will ask for confirmation before executing SQL
  // Recommended: true for production, false for development
  strict: true,

  // Embed statement breakpoints in generated SQL migrations
  // Required for databases that don't support multiple DDL statements in one transaction
  // (MySQL and SQLite). Default: true
  // breakpoints: true,

  // Filter tables to manage (glob pattern)
  // Useful when multiple projects share one database
  // Examples: ["users", "posts"] or "portal_*"
  // tablesFilter: ["*"],

  // Filter schemas to manage (array of schema names)
  // Default: ["public"] for 0.x, all schemas for 1.0.0-beta.1+
  // Examples: ["public", "auth", "tenant_*"]
  // schemaFilter: ["public"],

  // Ignore tables created by database extensions
  // Some extensions (like PostGIS) create their own tables
  // Examples: ["postgis", "pg_trgm"]
  // extensionsFilters: [],

  // Entity management configuration
  // entities: {
  //   // Role management (if using database roles)
  //   roles: {
  //     // Provider-specific role exclusions
  //     // provider: "neon" | "supabase",
  //     // Exclude specific roles from management
  //     // exclude: ["admin", "readonly"],
  //     // Include only specific roles for management
  //     // include: ["app_user", "app_admin"],
  //   },
  // },

  // Migration configuration
  // migrations: {
  //   // Migration table name (default: "__drizzle_migrations__")
  //   // table: "__drizzle_migrations__",
  //   // Schema for migration table (default: "public")
  //   // schema: "public",
  //   // Migration file prefix (default: "timestamp")
  //   // prefix: "timestamp",
  // },

  // Introspection configuration (for drizzle-kit pull)
  // introspect: {
  //   // Column name casing (default: "snake")
  //   // Options: "snake" | "camel" | "preserve"
  //   // casing: "snake",
  // },
});
