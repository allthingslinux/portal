import type { NextRequest } from "next/server";
import {
  APIError,
  handleAPIError,
  parseRouteId,
  requireAdminOrStaff,
} from "@portal/api/utils";
import { db } from "@portal/db/client";
import { user } from "@portal/db/schema/auth";
import { ircAccount } from "@portal/db/schema/irc";
import { and, eq } from "drizzle-orm";

import { ircIntegration } from "@/features/integrations/lib/irc/implementation";

// With cacheComponents, route handlers are dynamic by default.

export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/irc-accounts/[id]">
) {
  try {
    await requireAdminOrStaff(request);
    const params = await ctx.params;
    const id = parseRouteId(params.id);

    const [row] = await db
      .select({
        ircAccount,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      })
      .from(ircAccount)
      .leftJoin(user, eq(ircAccount.userId, user.id))
      .where(eq(ircAccount.id, id))
      .limit(1);

    if (!row) {
      return Response.json(
        { ok: false, error: "IRC account not found" },
        { status: 404 }
      );
    }

    return Response.json({
      ok: true,
      ircAccount: {
        ...row.ircAccount,
        user: row.user?.id ? row.user : undefined,
      },
    });
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/irc-accounts/[id]">
) {
  try {
    await requireAdminOrStaff(request);
    const params = await ctx.params;
    const id = parseRouteId(params.id);

    let body: Record<string, unknown>;
    try {
      const raw = await request.json();
      if (typeof raw !== "object" || raw === null) {
        throw new APIError("Invalid request body", 400);
      }
      body = raw as Record<string, unknown>;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError("Invalid JSON body", 400);
    }

    const updated = await ircIntegration.updateAccount(id, body);

    return Response.json({ ok: true, ircAccount: updated });
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/irc-accounts/[id]">
) {
  try {
    await requireAdminOrStaff(request);
    const params = await ctx.params;
    const id = parseRouteId(params.id);

    const [existing] = await db
      .select({ id: ircAccount.id })
      .from(ircAccount)
      .where(and(eq(ircAccount.id, id)))
      .limit(1);

    if (!existing) {
      return Response.json(
        { ok: false, error: "IRC account not found" },
        { status: 404 }
      );
    }

    await ircIntegration.deleteAccount(id);

    return Response.json({ ok: true });
  } catch (error) {
    return handleAPIError(error);
  }
}
