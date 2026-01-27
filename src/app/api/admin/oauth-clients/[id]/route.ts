import type { NextRequest } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { oauthClient } from "@/db/schema/oauth";
import { handleAPIError, requireAdminOrStaff } from "@/shared/api/utils";

// Route handlers are dynamic by default, but we explicitly mark them as such
// since they access database and request headers
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/oauth-clients/[id]">
) {
  try {
    await requireAdminOrStaff(request);
    const params = await ctx.params;
    const id = typeof params.id === "string" ? params.id : params.id[0];

    // Fetch OAuth client with user information
    // Note: id here is the database id, not clientId
    // You may want to search by clientId instead depending on your needs
    const [clientData] = await db
      .select({
        oauthClient,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      })
      .from(oauthClient)
      .leftJoin(user, eq(oauthClient.userId, user.id))
      .where(eq(oauthClient.id, id))
      .limit(1);

    if (!clientData) {
      return Response.json(
        { error: "OAuth client not found" },
        { status: 404 }
      );
    }

    // Exclude client secret from response (or only show it for admins if needed)
    const clientResponse = {
      ...clientData.oauthClient,
      user: clientData.user?.id ? clientData.user : undefined,
      // Don't expose client secret by default
      clientSecret: undefined,
    };

    return Response.json({ client: clientResponse });
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/oauth-clients/[id]">
) {
  try {
    await requireAdminOrStaff(request);
    const params = await ctx.params;
    const id = typeof params.id === "string" ? params.id : params.id[0];

    const [deleted] = await db
      .delete(oauthClient)
      .where(eq(oauthClient.id, id))
      .returning();

    if (!deleted) {
      return Response.json(
        { error: "OAuth client not found" },
        { status: 404 }
      );
    }

    return Response.json({ success: true });
  } catch (error) {
    return handleAPIError(error);
  }
}
