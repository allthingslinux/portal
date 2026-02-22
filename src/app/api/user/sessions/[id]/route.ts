import type { NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { session } from "@/db/schema/auth";
import { handleAPIError, parseRouteId, requireAuth } from "@/shared/api/utils";

// With cacheComponents, route handlers are dynamic by default.

/**
 * DELETE /api/user/sessions/[id]
 * Revoke one of the current user's sessions (cannot revoke other users' sessions).
 */
export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<"/api/user/sessions/[id]">
) {
  try {
    const { userId } = await requireAuth(request);
    const params = await ctx.params;
    const id = parseRouteId(params.id);

    const [deleted] = await db
      .delete(session)
      .where(and(eq(session.id, id), eq(session.userId, userId)))
      .returning();

    if (!deleted) {
      return Response.json(
        { ok: false, error: "Session not found" },
        { status: 404 }
      );
    }

    return Response.json({ ok: true });
  } catch (error) {
    return handleAPIError(error);
  }
}
