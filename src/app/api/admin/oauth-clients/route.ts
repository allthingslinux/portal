import type { NextRequest } from "next/server";
import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { oauthClient } from "@/db/schema/oauth";
import { handleAPIError, requireAdminOrStaff } from "@/shared/api/utils";

// With cacheComponents, route handlers are dynamic by default.

export async function GET(request: NextRequest) {
  try {
    await requireAdminOrStaff(request);

    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get("userId");
    const disabled = searchParams.get("disabled");
    const limit = Number.parseInt(searchParams.get("limit") || "100", 10);
    const offset = Number.parseInt(searchParams.get("offset") || "0", 10);

    // Build where conditions
    const conditions: ReturnType<typeof eq>[] = [];
    if (userIdParam) {
      conditions.push(eq(oauthClient.userId, userIdParam));
    }
    if (disabled !== null) {
      conditions.push(eq(oauthClient.disabled, disabled === "true"));
    }
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Fetch OAuth clients with user information
    const clientsData = await db
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
      .where(whereClause)
      .orderBy(desc(oauthClient.createdAt))
      .limit(limit)
      .offset(offset);

    // Transform to match expected format (exclude client secret from response)
    const clients = clientsData.map((row) => ({
      ...row.oauthClient,
      user: row.user?.id ? row.user : undefined,
      // Don't expose client secret in list view
      clientSecret: undefined,
    }));

    return Response.json({ clients });
  } catch (error) {
    return handleAPIError(error);
  }
}
