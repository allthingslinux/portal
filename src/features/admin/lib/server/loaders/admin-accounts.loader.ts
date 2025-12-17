import "server-only";

import { and, count, eq, ilike, or, type SQL } from "drizzle-orm";

import { db } from "~/core/database/client";
import { accounts } from "~/core/database/schema";

type LoadAdminAccountsParams = {
  page: number;
  pageSize: number;
  type: "all" | "team" | "personal";
  query?: string;
};

export type AdminAccountRow = {
  id: string;
  name: string | null;
  slug: string | null;
  email: string | null;
  isPersonalAccount: boolean;
  pictureUrl: string | null;
  primaryOwnerUserId: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
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
  const { page, pageSize, type, query } = params;

  // Build where conditions
  const conditions: SQL[] = [];

  // Filter by account type
  if (type === "personal") {
    conditions.push(eq(accounts.isPersonalAccount, true));
  } else if (type === "team") {
    conditions.push(eq(accounts.isPersonalAccount, false));
  }
  // 'all' doesn't add a condition

  // Filter by search query
  if (query?.trim()) {
    const searchCondition = or(
      ilike(accounts.name, `%${query}%`),
      ilike(accounts.email, `%${query}%`),
      ilike(accounts.slug, `%${query}%`)
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
      slug: accounts.slug,
      email: accounts.email,
      isPersonalAccount: accounts.isPersonalAccount,
      pictureUrl: accounts.pictureUrl,
      primaryOwnerUserId: accounts.primaryOwnerUserId,
      createdAt: accounts.createdAt,
      updatedAt: accounts.updatedAt,
      createdBy: accounts.createdBy,
      updatedBy: accounts.updatedBy,
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
      createdBy: item.createdBy ?? null,
      updatedBy: item.updatedBy ?? null,
      email: item.email ?? null,
      slug: item.slug ?? null,
      pictureUrl: item.pictureUrl ?? null,
      publicData: (item.publicData as Record<string, unknown> | null) ?? null,
    })),
    pageCount,
  };
}
