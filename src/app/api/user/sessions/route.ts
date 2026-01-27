import type { NextRequest } from "next/server";
import { and, desc, eq, gt } from "drizzle-orm";

import { db } from "@/db";
import { session } from "@/db/schema/auth";
import { handleAPIError, requireAuth } from "@/shared/api/utils";

// Route handlers are dynamic by default, but we explicitly mark them as such
// since they access database and request headers
export const dynamic = "force-dynamic";

/**
 * GET /api/user/sessions
 * Get current authenticated user's sessions
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const active = searchParams.get("active");
    const limit = Number.parseInt(searchParams.get("limit") || "100", 10);
    const offset = Number.parseInt(searchParams.get("offset") || "0", 10);

    // Build where conditions - always filter by current user
    const conditions: ReturnType<typeof eq | typeof gt>[] = [
      eq(session.userId, userId),
    ];
    if (active === "true") {
      conditions.push(gt(session.expiresAt, new Date()));
    }
    const whereClause = and(...conditions);

    // Fetch user's sessions
    const sessions = await db
      .select()
      .from(session)
      .where(whereClause)
      .orderBy(desc(session.createdAt))
      .limit(limit)
      .offset(offset);

    return Response.json({ sessions });
  } catch (error) {
    return handleAPIError(error);
  }
}
