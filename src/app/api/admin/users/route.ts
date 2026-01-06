import type { NextRequest } from "next/server";
import { and, desc, eq, ilike, or } from "drizzle-orm";

import { handleAPIError, requireAdminOrStaff } from "@/lib/api/utils";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema/auth";

// Route handlers are dynamic by default, but we explicitly mark them as such
// since they access database and request headers
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requireAdminOrStaff(request);

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const banned = searchParams.get("banned");
    const search = searchParams.get("search");
    const limit = Number.parseInt(searchParams.get("limit") || "50", 10);
    const offset = Number.parseInt(searchParams.get("offset") || "0", 10);

    // Build where conditions
    const conditions: ReturnType<typeof eq | typeof or>[] = [];
    if (role) {
      conditions.push(eq(user.role, role));
    }
    if (banned !== null) {
      conditions.push(eq(user.banned, banned === "true"));
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
