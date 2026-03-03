import "dotenv/config";

import { user } from "@portal/db/schema/auth";
import { ircAccount } from "@portal/db/schema/irc";
import { xmppAccount } from "@portal/db/schema/xmpp";
import { sql } from "drizzle-orm";

import { db } from "./lib/db";

// ============================================================================
// Database Seeding Script
// ============================================================================
// This script inserts mock users and IRC/XMPP accounts for testing.
// drizzle-seed is not used due to instanceof incompatibility with drizzle-orm 1.0 beta.
//
// Usage:
//   pnpm tsx scripts/seed.ts          - Seed database with default options
//   pnpm tsx scripts/seed.ts reset    - Reset database before seeding
//
const XMPP_DOMAIN = "xmpp.atl.chat";
const IRC_SERVER = "irc.atl.chat";
const IRC_PORT = 6697;

/** All Portal tables (for TRUNCATE CASCADE). Bypasses drizzle-seed reset due to drizzle-orm 1.0 beta instanceof incompatibility. Reserved words quoted. */
const TABLE_NAMES = [
  "oauth_access_token",
  "oauth_refresh_token",
  "oauth_consent",
  "oauth_client",
  "session",
  "account",
  "passkey",
  "two_factor",
  "verification",
  "apikey",
  "jwks",
  "integration_accounts",
  "irc_account",
  "xmpp_account",
  '"user"',
] as const;

async function resetDatabase() {
  const tables = TABLE_NAMES.join(", ");
  await db.execute(sql.raw(`TRUNCATE ${tables} CASCADE`));
}

/** Insert IRC and XMPP accounts for existing users (mock data for testing) */
async function seedIntegrationAccounts() {
  const users = await db.select({ id: user.id }).from(user).limit(8);

  const statuses = ["active", "suspended", "deleted"] as const;
  const ircStatuses = ["active", "pending", "suspended", "deleted"] as const;

  for (let i = 0; i < users.length; i++) {
    const u = users[i];
    if (!u?.id) {
      continue;
    }

    const suffix = `seed${i + 1}`;
    const nick = `atl_${suffix}`;
    const xmppUsername = `atl_${suffix}`;
    const jid = `${xmppUsername}@${XMPP_DOMAIN}`;
    const status = statuses[i % statuses.length];
    const ircStatus = ircStatuses[i % ircStatuses.length];

    await db.insert(ircAccount).values({
      userId: u.id,
      nick,
      server: IRC_SERVER,
      port: IRC_PORT,
      status: ircStatus,
    });

    await db.insert(xmppAccount).values({
      id: crypto.randomUUID(),
      userId: u.id,
      jid,
      username: xmppUsername,
      status,
    });
  }

  console.log(`Seeded ${users.length} IRC and XMPP accounts.`);
}

const MOCK_NAMES = [
  "Alice Johnson",
  "Bob Smith",
  "Carol Williams",
  "David Brown",
  "Eve Davis",
  "Frank Miller",
  "Grace Wilson",
  "Henry Moore",
  "Ivy Taylor",
  "Jack Anderson",
] as const;

/** Insert mock users for testing (minimal required fields) */
async function seedUsers() {
  const now = new Date();
  const users = MOCK_NAMES.map((name, i) => {
    const id = crypto.randomUUID();
    const email = `user${i + 1}@example.com`;
    return {
      id,
      name,
      email,
      emailVerified: false,
      image: null,
      createdAt: now,
      updatedAt: now,
      twoFactorEnabled: null,
      role: i === 0 ? "admin" : "user",
      banned: false,
      banReason: null,
      banExpires: null,
    };
  });
  await db.insert(user).values(users);
  console.log(`Seeded ${users.length} users.`);
}

async function main() {
  const args = process.argv.slice(2);
  const shouldReset = args.includes("reset");

  if (shouldReset) {
    console.log("Resetting database...");
    await resetDatabase();
    console.log("Database reset complete.");
  }

  console.log("Seeding database...");

  await seedUsers();
  await seedIntegrationAccounts();

  console.log("Database seeding complete.");
  process.exit(0);
}

main().catch((error) => {
  console.error("Error seeding database:", error);
  process.exit(1);
});
