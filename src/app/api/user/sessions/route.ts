import type { NextRequest } from "next/server";
import { and, desc, eq, gt } from "drizzle-orm";

import { db } from "@/db";
import { session } from "@/db/schema/auth";
import { handleAPIError, requireAuth } from "@/shared/api/utils";

// With cacheComponents, route handlers are dynamic by default.

/**
 * GET /api/user/sessions
 * Get current authenticated user's sessions (token field excluded for security).
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const active = searchParams.get("active");
    const limit = Number.parseInt(searchParams.get("limit") || "100", 10);
    const offset = Number.parseInt(searchParams.get("offset") || "0", 10);

    const conditions: ReturnType<typeof eq | typeof gt>[] = [
      eq(session.userId, userId),
    ];
    if (active === "true") {
      conditions.push(gt(session.expiresAt, new Date()));
    }
    const whereClause = and(...conditions);

    const rows = await db
      .select({
        id: session.id,
        expiresAt: session.expiresAt,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        userId: session.userId,
        impersonatedBy: session.impersonatedBy,
      })
      .from(session)
      .where(whereClause)
      .orderBy(desc(session.createdAt))
      .limit(limit)
      .offset(offset);

    return Response.json({ sessions: rows });
  } catch (error) {
    return handleAPIError(error);
  }
}
