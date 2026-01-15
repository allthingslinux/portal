import "server-only";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool, type PoolConfig } from "pg";

import { keys } from "./keys";
import { relations } from "./relations";
import { schema } from "./schema";

// ============================================================================
// Database Connection Configuration
// ============================================================================
// Using node-postgres (pg) driver with Drizzle ORM
// Drizzle ORM runs SQL queries via database drivers (node-postgres in this case)
//
// Connection patterns (both are equivalent):
//   1. Pass connection string: drizzle(process.env.DATABASE_URL)
//   2. Pass client instance: drizzle({ client: pool }) <- We use this pattern
//
// For better performance, consider installing pg-native:
//   pnpm add pg-native
// This can boost speed by approximately 10%
//
// Database connection URL format:
//   postgresql://username:password@hostname:port/database
//   Example: postgresql://alex:mypassword@localhost:5432/mydb

const env = keys();

// Pool configuration options
// You can specify any property from node-postgres connection options
// See: https://node-postgres.com/features/connecting
const poolConfig: PoolConfig = {
  connectionString: env.DATABASE_URL,
  // SSL configuration (uncomment and configure for production)
  // ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  // Connection pool settings (optional)
  // max: 20, // Maximum number of clients in the pool
  // idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  // connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection cannot be established
};

const pool = new Pool(poolConfig);

// ============================================================================
// Drizzle Database Instance
// ============================================================================
// The drizzle instance is configured with:
// - client: The node-postgres Pool instance (accessible via db.$client if needed)
// - schema: All database table schemas
// - relations: Relational schema definitions (for experimental joins support)
//
// Access the underlying driver:
//   const pool = db.$client; // Returns the node-postgres Pool instance
//
// Usage examples:
//   import { db } from "@/db";
//   import { user } from "@/db/schema";
//
//   // Basic query
//   const users = await db.select().from(user);
//
//   // Relational query (when experimental.joins is enabled)
//   const userWithAccounts = await db.query.user.findFirst({
//     with: { accounts: true }
//   });
//
//   // Count query
//   const count = await db.$count(user);

export const db = drizzle({ client: pool, schema, relations });
