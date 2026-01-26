import type { NextRequest } from "next/server";
import { eq } from "drizzle-orm";

import { handleAPIError, requireAdminOrStaff } from "@/lib/api/utils";
import { db } from "@/lib/db";
import { session, user } from "@/lib/db/schema/auth";

// Route handlers are dynamic by default, but we explicitly mark them as such
// since they access database and request headers
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/sessions/[id]">
) {
  try {
    await requireAdminOrStaff(request);
    const params = await ctx.params;
    const id = typeof params.id === "string" ? params.id : params.id[0];

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
    const id = typeof params.id === "string" ? params.id : params.id[0];

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
