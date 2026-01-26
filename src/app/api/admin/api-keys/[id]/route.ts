import type { NextRequest } from "next/server";
import { eq } from "drizzle-orm";

import { handleAPIError, requireAdminOrStaff } from "@/shared/api/utils";
import { db } from "@/shared/db";
import { apikey } from "@/shared/db/schema/api-keys";
import { user } from "@/shared/db/schema/auth";

// Route handlers are dynamic by default, but we explicitly mark them as such
// since they access database and request headers
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/api-keys/[id]">
) {
  try {
    await requireAdminOrStaff(request);
    const params = await ctx.params;
    const id = typeof params.id === "string" ? params.id : params.id[0];

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
    const id = typeof params.id === "string" ? params.id : params.id[0];

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
