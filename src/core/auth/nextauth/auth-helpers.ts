import 'server-only';

import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

import { getDrizzleSupabaseAdminClient } from '~/core/database/supabase/clients/drizzle-client';
import { usersInAuth } from '~/core/database/supabase/drizzle/schema';
import { sql } from 'drizzle-orm';

/**
 * Authenticate a user with email and password
 * This queries auth.users directly via Drizzle
 */
export async function authenticateUser(
  email: string,
  password: string,
): Promise<{ id: string; email: string } | null> {
  const db = getDrizzleSupabaseAdminClient();

  // Query auth.users table directly using raw SQL since we need encrypted_password
  // which may not be in the Drizzle schema
  const result = await db.execute<{
    id: string;
    email: string;
    encrypted_password: string;
  }>(
    sql`
      SELECT id, email, encrypted_password
      FROM auth.users
      WHERE email = ${email}
      LIMIT 1
    `,
  );

  if (result.length === 0) {
    return null;
  }

  const user = result[0];

  if (!user.encrypted_password) {
    return null;
  }

  // Verify password using bcrypt
  // Supabase uses bcrypt for password hashing
  const isValid = await bcrypt.compare(password, user.encrypted_password);

  if (!isValid) {
    return null;
  }

  return {
    id: user.id,
    email: user.email || '',
  };
}

/**
 * Get user by email from auth.users
 */
export async function getUserByEmail(email: string) {
  const db = getDrizzleSupabaseAdminClient();

  const result = await db.execute<{
    id: string;
    email: string;
    raw_user_meta_data: Record<string, unknown>;
    raw_app_meta_data: Record<string, unknown>;
  }>(
    sql`
      SELECT id, email, raw_user_meta_data, raw_app_meta_data
      FROM auth.users
      WHERE email = ${email}
      LIMIT 1
    `,
  );

  if (result.length === 0) {
    return null;
  }

  return result[0];
}

/**
 * Get user by ID from auth.users
 */
export async function getUserById(userId: string) {
  const db = getDrizzleSupabaseAdminClient();

  const result = await db.execute<{
    id: string;
    email: string;
    raw_user_meta_data: Record<string, unknown>;
    raw_app_meta_data: Record<string, unknown>;
  }>(
    sql`
      SELECT id, email, raw_user_meta_data, raw_app_meta_data
      FROM auth.users
      WHERE id = ${userId}
      LIMIT 1
    `,
  );

  if (result.length === 0) {
    return null;
  }

  return result[0];
}

