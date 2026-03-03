import type { NextRequest } from "next/server";
import { handleAPIError, requireAdminOrStaff } from "@portal/api/utils";
import { db } from "@portal/db/client";
import { user } from "@portal/db/schema/auth";
import { mailcowAccount } from "@portal/db/schema/mailcow";
import { and, count, desc, eq } from "drizzle-orm";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

export async function GET(request: NextRequest) {
  try {
    await requireAdminOrStaff(request);

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const rawLimit = Number.parseInt(searchParams.get("limit") ?? "", 10);
    const rawOffset = Number.parseInt(searchParams.get("offset") ?? "", 10);
    const limit =
      Number.isFinite(rawLimit) && rawLimit > 0
        ? Math.min(rawLimit, MAX_LIMIT)
        : DEFAULT_LIMIT;
    const offset = Number.isFinite(rawOffset) && rawOffset >= 0 ? rawOffset : 0;

    const validStatuses = ["active", "suspended", "deleted"] as const;
    const statusFilter =
      statusParam &&
      validStatuses.includes(statusParam as (typeof validStatuses)[number])
        ? (statusParam as (typeof validStatuses)[number])
        : undefined;

    const conditions: ReturnType<typeof eq>[] = [];
    if (statusFilter) {
      conditions.push(eq(mailcowAccount.status, statusFilter));
    }
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, [totalResult]] = await Promise.all([
      db
        .select({
          mailcowAccount,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
        })
        .from(mailcowAccount)
        .leftJoin(user, eq(mailcowAccount.userId, user.id))
        .where(whereClause)
        .orderBy(desc(mailcowAccount.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: count() }).from(mailcowAccount).where(whereClause),
    ]);

    const total = Number(totalResult?.count ?? 0);

    const mailcowAccounts = rows.map((row) => ({
      ...row.mailcowAccount,
      user: row.user?.id ? row.user : undefined,
    }));

    return Response.json({
      mailcowAccounts,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    return handleAPIError(error);
  }
}
