import type { NextRequest } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { ircAccount } from "@/db/schema/irc";
import { xmppAccount } from "@/db/schema/xmpp";
import { cleanupIntegrationAccounts } from "@/features/integrations/lib/core/user-deletion";
import {
  handleAPIError,
  parseRouteId,
  requireAdminOrStaff,
} from "@/shared/api/utils";

// With cacheComponents, route handlers are dynamic by default.

export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/users/[id]">
) {
  try {
    await requireAdminOrStaff(request);
    const params = await ctx.params;
    const id = parseRouteId(params.id);

    const [userData] = await db
      .select()
      .from(user)
      .where(eq(user.id, id))
      .limit(1);

    if (!userData) {
      return Response.json(
        { ok: false, error: "User not found" },
        { status: 404 }
      );
    }

    const [[ircRow], [xmppRow]] = await Promise.all([
      db.select().from(ircAccount).where(eq(ircAccount.userId, id)).limit(1),
      db.select().from(xmppAccount).where(eq(xmppAccount.userId, id)).limit(1),
    ]);

    return Response.json({
      user: userData,
      ircAccount: ircRow ?? null,
      xmppAccount: xmppRow ?? null,
    });
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/users/[id]">
) {
  try {
    await requireAdminOrStaff(request);
    const params = await ctx.params;
    const id = parseRouteId(params.id);
    const body = await request.json();

    const [updated] = await db
      .update(user)
      .set({
        ...(body.name && { name: body.name }),
        ...(body.email && { email: body.email }),
        ...(body.role && { role: body.role }),
        ...(body.banned !== undefined && { banned: body.banned }),
        ...(body.banReason && { banReason: body.banReason }),
        ...(body.banExpires && { banExpires: new Date(body.banExpires) }),
        updatedAt: new Date(),
      })
      .where(eq(user.id, id))
      .returning();

    if (!updated) {
      return Response.json(
        { ok: false, error: "User not found" },
        { status: 404 }
      );
    }

    return Response.json({ user: updated });
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/users/[id]">
) {
  try {
    await requireAdminOrStaff(request);
    const params = await ctx.params;
    const id = parseRouteId(params.id);

    await cleanupIntegrationAccounts(id);
    await db.delete(user).where(eq(user.id, id));

    return Response.json({ success: true });
  } catch (error) {
    return handleAPIError(error);
  }
}
