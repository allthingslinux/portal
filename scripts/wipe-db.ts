#!/usr/bin/env tsx
/**
 * Wipe the database by dropping and recreating the public schema.
 * Use before running migrations on a database that already has schema applied.
 *
 * DESTRUCTIVE: Deletes all tables, types, and data in the public schema.
 * Dev only. Never run against production.
 *
 * Usage:
 *   pnpm db:wipe
 */
import "dotenv/config";

import { Pool } from "pg";

import { keys } from "@/db/keys";

const env = keys();
const connectionString = env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL is required. Set it in .env");
  process.exit(1);
}

async function wipe() {
  const pool = new Pool({ connectionString });

  try {
    await pool.query("DROP SCHEMA public CASCADE");
    await pool.query("CREATE SCHEMA public");
    await pool.query("GRANT ALL ON SCHEMA public TO public");
    console.log("✅ Database wiped. Run pnpm db:migrate to apply migrations.");
  } catch (err) {
    console.error("❌ Wipe failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

wipe();
