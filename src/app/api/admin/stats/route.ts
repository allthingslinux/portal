import type { NextRequest } from "next/server";
import { count, sql } from "drizzle-orm";

import { handleAPIError, requireAdminOrStaff } from "@/lib/api/utils";
import { db } from "@/lib/db";
import { apikey } from "@/lib/db/schema/api-keys";
import { session, user } from "@/lib/db/schema/auth";
import { oauthClient } from "@/lib/db/schema/oauth";

// Route handlers are dynamic by default, but we explicitly mark them as such
// since they access database and request headers
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requireAdminOrStaff(request);

    // Get user stats
    const [userStats] = await db
      .select({
        total: count(user.id),
        admins: sql<number>`COUNT(*) FILTER (WHERE ${user.role} = 'admin')`,
        staff: sql<number>`COUNT(*) FILTER (WHERE ${user.role} = 'staff')`,
        banned: sql<number>`COUNT(*) FILTER (WHERE ${user.banned} = true)`,
      })
      .from(user);

    // Get active sessions count
    const [sessionStats] = await db
      .select({
        total: count(session.id),
        active: sql<number>`COUNT(*) FILTER (WHERE ${session.expiresAt} > NOW())`,
      })
      .from(session);

    // Get API keys count
    const [apiKeyStats] = await db
      .select({
        total: count(apikey.id),
        enabled: sql<number>`COUNT(*) FILTER (WHERE ${apikey.enabled} = true)`,
      })
      .from(apikey);

    // Get OAuth clients count
    const [oauthClientStats] = await db
      .select({
        total: count(oauthClient.id),
        disabled: sql<number>`COUNT(*) FILTER (WHERE ${oauthClient.disabled} = true)`,
      })
      .from(oauthClient);

    return Response.json({
      users: {
        total: Number(userStats.total),
        admins: Number(userStats.admins),
        staff: Number(userStats.staff),
        banned: Number(userStats.banned),
        regular:
          Number(userStats.total) -
          Number(userStats.admins) -
          Number(userStats.staff),
      },
      sessions: {
        total: Number(sessionStats.total),
        active: Number(sessionStats.active),
      },
      apiKeys: {
        total: Number(apiKeyStats.total),
        enabled: Number(apiKeyStats.enabled),
      },
      oauthClients: {
        total: Number(oauthClientStats.total),
        disabled: Number(oauthClientStats.disabled),
      },
    });
  } catch (error) {
    return handleAPIError(error);
  }
}
