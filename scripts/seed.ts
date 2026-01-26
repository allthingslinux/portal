import "dotenv/config";
import { reset, seed } from "drizzle-seed";

import { db } from "@/shared/db/client";
import { schema } from "@/shared/db/schema";

// ============================================================================
// Database Seeding Script
// ============================================================================
// This script uses drizzle-seed to generate deterministic, realistic fake data.
// See: https://orm.drizzle.team/docs/seed-overview#drizzle-seed
//
// Features:
// - Deterministic data generation (same seed = same data)
// - Realistic fake data using pseudorandom number generator (pRNG)
// - Consistent across different runs
//
// Usage:
//   pnpm tsx scripts/seed.ts          - Seed database with default options
//   pnpm tsx scripts/seed.ts reset    - Reset database before seeding
//
// Options:
//   - count: Number of entities to create per table (default: 10)
//   - seed: Seed number for pRNG (default: random)
//
// Example with custom options:
//   await seed(db, schema, { count: 100, seed: 12345 });

async function main() {
  const args = process.argv.slice(2);
  const shouldReset = args.includes("reset");

  if (shouldReset) {
    console.log("Resetting database...");
    await reset(db, schema);
    console.log("Database reset complete.");
  }

  console.log("Seeding database...");

  // Basic seeding with default options (10 entities per table)
  // Note: Better Auth tables (user, session, account, etc.) may require
  // specific data formats (e.g., hashed passwords, valid tokens).
  // Consider using Better Auth's built-in user creation methods for auth tables.
  await seed(db, schema, { count: 10, seed: 12_345 });

  // Example: Custom seeding with refinements
  // await seed(db, schema, { count: 50, seed: 12_345 }).refine((funcs) => ({
  //   user: {
  //     count: 100,
  //     columns: {
  //       name: funcs.fullName(),
  //       email: funcs.email(),
  //       // Note: For Better Auth user table, you may want to:
  //       // - Use Better Auth's signUp methods for proper password hashing
  //       // - Generate valid email verification tokens if needed
  //       // - Set appropriate role values ("user", "staff", "admin")
  //     },
  //   },
  //   // OAuth tables may need specific client IDs, secrets, etc.
  //   // Consider seeding these manually or with custom logic
  //   oauthClient: {
  //     count: 5,
  //     columns: {
  //       name: funcs.companyName(),
  //       // Add other required OAuth client fields
  //     },
  //   },
  //   // Add more table refinements as needed
  // }));

  console.log("Database seeding complete.");
  process.exit(0);
}

main().catch((error) => {
  console.error("Error seeding database:", error);
  process.exit(1);
});
