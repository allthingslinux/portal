/**
 * Script-only database client.
 * Does not import "server-only", so it can be used by tsx scripts (create-admin, etc.)
 * without pulling in Next.js server-only modules.
 */
import "dotenv/config";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { keys } from "@/db/keys";
import { relations } from "@/db/relations";
import { schema } from "@/db/schema";

const env = keys();
const connectionString = env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is required. Set it in .env or pass it when running the script."
  );
}

const pool = new Pool({ connectionString });

export const db = drizzle({ client: pool, schema, relations });
