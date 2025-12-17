import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://portal:portal@127.0.0.1:5433/portal";

async function runMigrations() {
  console.log("Running database migrations...");

  const sql = postgres(connectionString, { max: 1 });
  const migrationDb = drizzle(sql);

  try {
    await migrate(migrationDb, {
      migrationsFolder: "./src/core/database/drizzle",
    });
    console.log("Migrations completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runMigrations();
