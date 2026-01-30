import type { NextRequest } from "next/server";
import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { ircAccount } from "@/db/schema/irc";
import { handleAPIError, requireAdminOrStaff } from "@/shared/api/utils";

// With cacheComponents, route handlers are dynamic by default.

export async function GET(request: NextRequest) {
  try {
    await requireAdminOrStaff(request);

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const limit = Number.parseInt(searchParams.get("limit") || "50", 10);
    const offset = Number.parseInt(searchParams.get("offset") || "0", 10);

    const validStatuses = ["active", "suspended", "deleted"] as const;
    const statusFilter =
      statusParam &&
      validStatuses.includes(statusParam as (typeof validStatuses)[number])
        ? (statusParam as (typeof validStatuses)[number])
        : undefined;

    const conditions: ReturnType<typeof eq>[] = [];
    if (statusFilter) {
      conditions.push(eq(ircAccount.status, statusFilter));
    }
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const rows = await db
      .select({
        ircAccount,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      })
      .from(ircAccount)
      .leftJoin(user, eq(ircAccount.userId, user.id))
      .where(whereClause)
      .orderBy(desc(ircAccount.createdAt))
      .limit(limit)
      .offset(offset);

    const total = await db
      .select({ id: ircAccount.id })
      .from(ircAccount)
      .where(whereClause);

    const ircAccounts = rows.map((row) => ({
      ...row.ircAccount,
      user: row.user?.id ? row.user : undefined,
    }));

    return Response.json({
      ircAccounts,
      pagination: {
        total: total.length,
        limit,
        offset,
        hasMore: offset + limit < total.length,
      },
    });
  } catch (error) {
    return handleAPIError(error);
  }
}
