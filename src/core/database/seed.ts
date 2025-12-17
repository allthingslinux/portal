import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { roles } from "~/core/database/schema";

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://portal:portal@127.0.0.1:5433/portal";

async function seedDatabase() {
  console.log("Seeding database with initial data...");

  const sql = postgres(connectionString, { max: 1 });
  const db = drizzle(sql);

  try {
    // Seed roles table with default roles
    // These are required for accounts_memberships foreign key constraint
    await db
      .insert(roles)
      .values([
        { name: "owner", hierarchyLevel: 1 },
        { name: "member", hierarchyLevel: 2 },
      ])
      .onConflictDoNothing();

    // Seed config table with default values
    // The config table has a single row with team accounts enabled by default
    // Using raw SQL since config table doesn't have a primary key for onConflictDoNothing
    const configExists = await sql`
      SELECT 1 FROM config LIMIT 1
    `.execute();

    if (configExists.length === 0) {
      await sql`
        INSERT INTO config (enable_team_accounts)
        VALUES (true)
      `.execute();
    }

    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

seedDatabase();

