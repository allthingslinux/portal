import "server-only";

import { type DrizzleConfig, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { z } from "zod";
import * as schema from "../drizzle/schema";
import type { getServerSession as GetServerSession } from "~/core/auth/better-auth/session";

const SUPABASE_DATABASE_URL = z
  .string({
    description:
      "The URL of the Supabase database. Please provide the variable DATABASE_URL or SUPABASE_DATABASE_URL.",
    required_error:
      "The environment variable DATABASE_URL or SUPABASE_DATABASE_URL is required",
  })
  .url()
  .optional()
  .parse(process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL);

const config = {
  casing: "snake_case",
  schema,
} satisfies DrizzleConfig<typeof schema>;

type DrizzleClient = ReturnType<typeof drizzle>;

let getServerSessionRef: GetServerSession | null = null;

function getDatabaseUrl(): string {
  if (!SUPABASE_DATABASE_URL) {
    throw new Error(
      "DATABASE_URL or SUPABASE_DATABASE_URL environment variable is required for Drizzle operations"
    );
  }
  return SUPABASE_DATABASE_URL;
}

/**
 * Lazily resolve Better Auth session getter to avoid circular dependencies.
 */
async function resolveServerSession(): Promise<GetServerSession> {
  if (!getServerSessionRef) {
    const module = await import("~/core/auth/better-auth/session");
    getServerSessionRef = module.getServerSession;
  }

  return getServerSessionRef;
}

// Admin client bypasses RLS - created lazily
let adminClient: ReturnType<typeof drizzle> | null = null;

export function getDrizzleSupabaseAdminClient() {
  if (!adminClient) {
    adminClient = drizzle({
      client: postgres(getDatabaseUrl(), { prepare: false }),
      ...config,
    });
  }
  return adminClient;
}

// RLS protected client - created lazily
let rlsClient: ReturnType<typeof drizzle> | null = null;

function getRlsClient() {
  if (!rlsClient) {
    rlsClient = drizzle({
      client: postgres(getDatabaseUrl(), { prepare: false }),
      ...config,
    });
  }
  return rlsClient;
}

export async function getDrizzleSupabaseClient() {
  const getServerSession = await resolveServerSession();
  const session = await getServerSession();

  // Build JWT claims from NextAuth session
  const userId = session?.user?.id ?? "";
  const email = session?.user?.email ?? "";
  const role = session?.user ? "authenticated" : "anon";

  // Create a token-like object for RLS context
  const token = {
    sub: userId,
    email,
    role,
    aud: role, // aud should match role: 'authenticated' or 'anon'
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
    iat: Math.floor(Date.now() / 1000),
  };

  /**
   * Helper to set up RLS context for a database operation
   */
  async function setupRlsContext(client: ReturnType<typeof drizzle>) {
    await client.execute(sql`
      select set_config('request.jwt.claims', '${sql.raw(
        JSON.stringify(token)
      )}', TRUE);
      select set_config('request.jwt.claim.sub', '${sql.raw(
        token.sub ?? ""
      )}', TRUE);
      set local role ${sql.raw(token.role ?? "anon")};
    `);
  }

  /**
   * Helper to clean up RLS context after a database operation
   */
  async function cleanupRlsContext(client: ReturnType<typeof drizzle>) {
    try {
      await client.execute(sql`
        select set_config('request.jwt.claims', NULL, TRUE);
        select set_config('request.jwt.claim.sub', NULL, TRUE);
        reset role;
      `);
    } catch {
      // Ignore cleanup errors if connection is already closed
    }
  }

  /**
   * Execute a single query with RLS context.
   * Use this for simple read operations that don't need transaction guarantees.
   */
  async function query<T>(
    queryFn: (client: DrizzleClient) => Promise<T>
  ): Promise<T> {
    const client = getRlsClient();
    try {
      await setupRlsContext(client);
      return await queryFn(client);
    } finally {
      await cleanupRlsContext(client);
    }
  }

  /**
   * Execute a transaction with RLS context.
   * Use this for operations that need ACID guarantees (multiple related queries).
   */
  const runTransaction = (
    transaction: (tx: DrizzleClient) => Promise<unknown>,
    _config?: unknown
  ) => {
    const client = getRlsClient();
    return client.transaction(async (tx) => {
      try {
        await setupRlsContext(tx);
        return await transaction(tx);
      } finally {
        // Clean up - wrap in try-catch to handle aborted transactions
        try {
          await cleanupRlsContext(tx);
        } catch {
          // Ignore cleanup errors if transaction is already aborted
          // This is expected when the main transaction fails
        }
      }
    });
  };

  return {
    query,
    runTransaction,
  };
}
