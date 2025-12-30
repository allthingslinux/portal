import "server-only";

import { and, count, ilike, or, type SQL } from "drizzle-orm";

import { db } from "~/lib/database/client";
import { accounts } from "~/lib/database/schema";

type LoadAdminAccountsParams = {
  page: number;
  pageSize: number;
  query?: string;
};

export type AdminAccountRow = {
  id: string;
  name: string | null;
  email: string | null;
  pictureUrl: string | null;
  primaryOwnerUserId: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  publicData: Record<string, unknown> | null;
};

type LoadAdminAccountsResult = {
  data: AdminAccountRow[];
  pageCount: number;
};

/**
 * Load accounts for admin accounts table with pagination and filters
 */
export async function loadAdminAccounts(
  params: LoadAdminAccountsParams
): Promise<LoadAdminAccountsResult> {
  const { page, pageSize, query } = params;

  // Build where conditions
  const conditions: SQL[] = [];

  // All accounts are personal now - no type filtering needed

  // Filter by search query
  if (query?.trim()) {
    const searchCondition = or(
      ilike(accounts.name, `%${query}%`),
      ilike(accounts.email, `%${query}%`)
    );

    if (searchCondition) {
      conditions.push(searchCondition);
    }
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
      email: accounts.email,
      pictureUrl: accounts.pictureUrl,
      primaryOwnerUserId: accounts.primaryOwnerUserId,
      createdAt: accounts.createdAt,
      updatedAt: accounts.updatedAt,
      publicData: accounts.publicData,
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
      email: item.email ?? null,
      pictureUrl: item.pictureUrl ?? null,
      publicData: (item.publicData as Record<string, unknown> | null) ?? null,
    })),
    pageCount,
  };
}
