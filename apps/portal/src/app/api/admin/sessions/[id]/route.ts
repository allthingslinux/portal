import type { NextRequest } from "next/server";
import {
  handleAPIError,
  parseRouteId,
  requireAdminOrStaff,
} from "@portal/api/utils";
import { db } from "@portal/db/client";
import { session, user } from "@portal/db/schema/auth";
import { eq } from "drizzle-orm";

// With cacheComponents, route handlers are dynamic by default.

export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/sessions/[id]">
) {
  try {
    await requireAdminOrStaff(request);
    const params = await ctx.params;
    const id = parseRouteId(params.id);

    // Fetch session with user information
    const [sessionData] = await db
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
      .where(eq(session.id, id))
      .limit(1);

    if (!sessionData) {
      return Response.json(
        { ok: false, error: "Session not found" },
        { status: 404 }
      );
    }

    // Transform to match expected format
    const sessionResponse = {
      ...sessionData.session,
      user: sessionData.user?.id ? sessionData.user : undefined,
    };

    return Response.json({ session: sessionResponse });
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/sessions/[id]">
) {
  try {
    await requireAdminOrStaff(request);
    const params = await ctx.params;
    const id = parseRouteId(params.id);

    const [deleted] = await db
      .delete(session)
      .where(eq(session.id, id))
      .returning();

    if (!deleted) {
      return Response.json(
        { ok: false, error: "Session not found" },
        { status: 404 }
      );
    }

    return Response.json({ success: true });
  } catch (error) {
    return handleAPIError(error);
  }
}
