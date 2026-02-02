import type { NextRequest } from "next/server";
import { and, desc, eq, ilike, or } from "drizzle-orm";

import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { handleAPIError, requireAdminOrStaff } from "@/shared/api/utils";
import { UserSearchSchema } from "@/shared/schemas/user";

// With cacheComponents, route handlers are dynamic by default.

export async function GET(request: NextRequest) {
  try {
    await requireAdminOrStaff(request);

    const { searchParams } = new URL(request.url);
    const { role, banned, search, limit, offset } = UserSearchSchema.parse(
      Object.fromEntries(searchParams)
    );

    // Build where conditions
    const conditions: ReturnType<typeof eq | typeof or>[] = [];
    if (role) {
      conditions.push(eq(user.role, role));
    }
    if (banned !== undefined) {
      conditions.push(eq(user.banned, banned));
    }
    if (search) {
      const searchCondition = or(
        ilike(user.email, `%${search}%`),
        ilike(user.name, `%${search}%`)
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const users = await db
      .select()
      .from(user)
      .where(whereClause)
      .orderBy(desc(user.createdAt))
      .limit(limit)
      .offset(offset);

    const total = await db
      .select({ count: user.id })
      .from(user)
      .where(whereClause);

    return Response.json({
      users,
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
