import 'server-only';

import { DrizzleConfig, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import { JwtPayload, jwtDecode } from 'jwt-decode';
import postgres from 'postgres';
import { z } from 'zod';

import * as schema from '../drizzle/schema';
import { getSupabaseServerClient } from './server-client';

const SUPABASE_DATABASE_URL = z
  .string({
    description: `The URL of the Supabase database. Please provide the variable DATABASE_URL or SUPABASE_DATABASE_URL.`,
    required_error:
      'The environment variable DATABASE_URL or SUPABASE_DATABASE_URL is required',
  })
  .url()
  .optional()
  .parse(process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL);

const config = {
  casing: 'snake_case',
  schema,
} satisfies DrizzleConfig<typeof schema>;

function getDatabaseUrl(): string {
  if (!SUPABASE_DATABASE_URL) {
    throw new Error(
      'DATABASE_URL or SUPABASE_DATABASE_URL environment variable is required for Drizzle operations',
    );
  }
  return SUPABASE_DATABASE_URL;
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
  const client = getSupabaseServerClient();
  const { data } = await client.auth.getSession();
  const accessToken = data.session?.access_token ?? '';
  const token = decode(accessToken);

  const runTransaction = (
    transaction: (tx: ReturnType<typeof drizzle>) => Promise<unknown>,
    config?: unknown,
  ) => {
    const client = getRlsClient();
    return client.transaction(async (tx: any) => {
      try {
        // Set up Supabase auth context
        await tx.execute(sql`
          select set_config('request.jwt.claims', '${sql.raw(
            JSON.stringify(token),
          )}', TRUE);
          select set_config('request.jwt.claim.sub', '${sql.raw(
            token.sub ?? '',
          )}', TRUE);
          set local role ${sql.raw(token.role ?? 'anon')};
        `);

        return await transaction(tx as any);
      } finally {
        // Clean up - wrap in try-catch to handle aborted transactions
        try {
          await tx.execute(sql`
            select set_config('request.jwt.claims', NULL, TRUE);
            select set_config('request.jwt.claim.sub', NULL, TRUE);
            reset role;
          `);
        } catch (cleanupError) {
          // Ignore cleanup errors if transaction is already aborted
          // This is expected when the main transaction fails
        }
      }
    }, config as any);
  };

  return {
    runTransaction,
  };
}

function decode(accessToken: string) {
  try {
    return jwtDecode<JwtPayload & { role: string }>(accessToken);
  } catch {
    return { role: 'anon' } as JwtPayload & { role: string };
  }
}
