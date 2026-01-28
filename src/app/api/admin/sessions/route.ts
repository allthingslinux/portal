import type { NextRequest } from "next/server";
import { and, desc, eq, gt } from "drizzle-orm";

import { db } from "@/db";
import { session, user } from "@/db/schema/auth";
import { handleAPIError, requireAdminOrStaff } from "@/shared/api/utils";

// With cacheComponents, route handlers are dynamic by default.

export async function GET(request: NextRequest) {
  try {
    await requireAdminOrStaff(request);

    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get("userId");
    const active = searchParams.get("active");
    const limit = Number.parseInt(searchParams.get("limit") || "100", 10);
    const offset = Number.parseInt(searchParams.get("offset") || "0", 10);

    // Build where conditions for select query
    const conditions: ReturnType<typeof eq | typeof gt>[] = [];
    if (userIdParam) {
      conditions.push(eq(session.userId, userIdParam));
    }
    if (active === "true") {
      conditions.push(gt(session.expiresAt, new Date()));
    }
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Fetch sessions and join with users
    const sessionsData = await db
      .select({
        session,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      })
      .from(session)
      .leftJoin(user, eq(session.userId, user.id))
      .where(whereClause)
      .orderBy(desc(session.createdAt))
      .limit(limit)
      .offset(offset);

    // Transform to match expected format
    const sessions = sessionsData.map((row) => ({
      ...row.session,
      user: row.user?.id ? row.user : undefined,
    }));

    return Response.json({ sessions });
  } catch (error) {
    return handleAPIError(error);
  }
}
