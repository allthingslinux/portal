import type { NextRequest } from "next/server";
import { handleAPIError, requireAdminOrStaff } from "@portal/api/utils";
import { db } from "@portal/db/client";
import { apikey } from "@portal/db/schema/api-keys";
import { session, user } from "@portal/db/schema/auth";
import { oauthClient } from "@portal/db/schema/oauth";
import { count, sql } from "drizzle-orm";

// With cacheComponents, route handlers are dynamic by default.

export async function GET(request: NextRequest) {
  try {
    await requireAdminOrStaff(request);

    const [[userStats], [sessionStats], [apiKeyStats], [oauthClientStats]] =
      await Promise.all([
        db
          .select({
            total: count(user.id),
            admins: sql<number>`COUNT(*) FILTER (WHERE ${user.role} = 'admin')`,
            staff: sql<number>`COUNT(*) FILTER (WHERE ${user.role} = 'staff')`,
            banned: sql<number>`COUNT(*) FILTER (WHERE ${user.banned} = true)`,
          })
          .from(user),
        db
          .select({
            total: count(session.id),
            active: sql<number>`COUNT(*) FILTER (WHERE ${session.expiresAt} > NOW())`,
          })
          .from(session),
        db
          .select({
            total: count(apikey.id),
            enabled: sql<number>`COUNT(*) FILTER (WHERE ${apikey.enabled} = true)`,
          })
          .from(apikey),
        db
          .select({
            total: count(oauthClient.id),
            disabled: sql<number>`COUNT(*) FILTER (WHERE ${oauthClient.disabled} = true)`,
          })
          .from(oauthClient),
      ]);

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
