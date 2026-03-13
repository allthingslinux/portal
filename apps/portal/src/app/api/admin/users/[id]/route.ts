import type { NextRequest } from "next/server";
import {
  handleAPIError,
  parseRouteId,
  requireAdminOrStaff,
} from "@portal/api/utils";
import { db } from "@portal/db/client";
import { user } from "@portal/db/schema/auth";
import { ircAccount } from "@portal/db/schema/irc";
import { mailcowAccount } from "@portal/db/schema/mailcow";
import { mediawikiAccount } from "@portal/db/schema/mediawiki";
import { xmppAccount } from "@portal/db/schema/xmpp";
import { AdminUpdateUserSchema } from "@portal/schemas/user";
import { eq } from "drizzle-orm";

import { cleanupIntegrationAccounts } from "@/features/integrations/lib/core/user-deletion";

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

    const [[ircRow], [mailcowRow], [xmppRow], [mediawikiRow]] =
      await Promise.all([
        db.select().from(ircAccount).where(eq(ircAccount.userId, id)).limit(1),
        db
          .select()
          .from(mailcowAccount)
          .where(eq(mailcowAccount.userId, id))
          .limit(1),
        db
          .select()
          .from(xmppAccount)
          .where(eq(xmppAccount.userId, id))
          .limit(1),
        db
          .select()
          .from(mediawikiAccount)
          .where(eq(mediawikiAccount.userId, id))
          .limit(1),
      ]);

    return Response.json({
      user: userData,
      ircAccount: ircRow ?? null,
      mailcowAccount: mailcowRow ?? null,
      xmppAccount: xmppRow ?? null,
      mediawikiAccount: mediawikiRow ?? null,
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
    const body = AdminUpdateUserSchema.parse(await request.json());

    const [updated] = await db
      .update(user)
      .set({
        ...body,
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

    await Promise.all([
      cleanupIntegrationAccounts(id),
      db.delete(user).where(eq(user.id, id)),
    ]);

    return Response.json({ success: true });
  } catch (error) {
    return handleAPIError(error);
  }
}
