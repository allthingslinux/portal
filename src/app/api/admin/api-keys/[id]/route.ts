import type { NextRequest } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { apikey } from "@/db/schema/api-keys";
import { user } from "@/db/schema/auth";
import {
  handleAPIError,
  parseRouteId,
  requireAdminOrStaff,
} from "@/shared/api/utils";

// With cacheComponents, route handlers are dynamic by default.

export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/api-keys/[id]">
) {
  try {
    await requireAdminOrStaff(request);
    const params = await ctx.params;
    const id = parseRouteId(params.id);

    // Fetch API key with user information
    const [apiKeyData] = await db
      .select({
        apikey,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      })
      .from(apikey)
      .leftJoin(user, eq(apikey.userId, user.id))
      .where(eq(apikey.id, id))
      .limit(1);

    if (!apiKeyData) {
      return Response.json(
        { ok: false, error: "API key not found" },
        { status: 404 }
      );
    }

    // Exclude hashed key from response
    const apiKeyResponse = {
      ...apiKeyData.apikey,
      user: apiKeyData.user?.id ? apiKeyData.user : undefined,
    };

    return Response.json({ apiKey: apiKeyResponse });
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/api-keys/[id]">
) {
  try {
    await requireAdminOrStaff(request);
    const params = await ctx.params;
    const id = parseRouteId(params.id);

    const [deleted] = await db
      .delete(apikey)
      .where(eq(apikey.id, id))
      .returning();

    if (!deleted) {
      return Response.json(
        { ok: false, error: "API key not found" },
        { status: 404 }
      );
    }

    return Response.json({ success: true });
  } catch (error) {
    return handleAPIError(error);
  }
}
