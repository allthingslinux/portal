import 'server-only';

import { and, count, eq, ilike, or } from 'drizzle-orm';

import { getDrizzleSupabaseAdminClient } from '~/core/database/supabase/clients/drizzle-client';
import { accounts } from '~/core/database/supabase/drizzle/schema';

interface LoadAdminAccountsParams {
  page: number;
  pageSize: number;
  type: 'all' | 'team' | 'personal';
  query?: string;
}

interface LoadAdminAccountsResult {
  data: Array<{
    id: string;
    name: string;
    slug: string | null;
    email: string | null;
    isPersonalAccount: boolean;
    pictureUrl: string | null;
    primaryOwnerUserId: string;
    createdAt: string | null;
    updatedAt: string | null;
  }>;
  pageCount: number;
}

/**
 * Load accounts for admin accounts table with pagination and filters
 */
export async function loadAdminAccounts(
  params: LoadAdminAccountsParams,
): Promise<LoadAdminAccountsResult> {
  const { page, pageSize, type, query } = params;
  const db = getDrizzleSupabaseAdminClient();

  // Build where conditions
  const conditions = [];

  // Filter by account type
  if (type === 'personal') {
    conditions.push(eq(accounts.isPersonalAccount, true));
  } else if (type === 'team') {
    conditions.push(eq(accounts.isPersonalAccount, false));
  }
  // 'all' doesn't add a condition

  // Filter by search query
  if (query && query.trim()) {
    conditions.push(
      or(
        ilike(accounts.name, `%${query}%`),
        ilike(accounts.email, `%${query}%`),
        ilike(accounts.slug, `%${query}%`),
      )!,
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Get total count for pagination
  const countResult = await db
    .select({ count: count() })
    .from(accounts)
    .where(whereClause);

  const totalCount = countResult[0]?.count ?? 0;
  const pageCount = Math.ceil(totalCount / pageSize);

  // Get paginated data
  const offset = (page - 1) * pageSize;
  const data = await db
    .select({
      id: accounts.id,
      name: accounts.name,
      slug: accounts.slug,
      email: accounts.email,
      isPersonalAccount: accounts.isPersonalAccount,
      pictureUrl: accounts.pictureUrl,
      primaryOwnerUserId: accounts.primaryOwnerUserId,
      createdAt: accounts.createdAt,
      updatedAt: accounts.updatedAt,
    })
    .from(accounts)
    .where(whereClause)
    .orderBy(accounts.createdAt)
    .limit(pageSize)
    .offset(offset);

  return {
    data: data.map((item) => ({
      ...item,
      createdAt: item.createdAt ?? null,
      updatedAt: item.updatedAt ?? null,
    })),
    pageCount,
  };
}

