import type { NextRequest } from "next/server";
import {
  APIError,
  handleAPIError,
  parseRouteId,
  requireAdminOrStaff,
} from "@portal/api/utils";
import { db } from "@portal/db/client";
import { user } from "@portal/db/schema/auth";
import { mailcowAccount } from "@portal/db/schema/mailcow";
import { and, eq } from "drizzle-orm";

import { mailcowIntegration } from "@/features/integrations/lib/mailcow/implementation";

export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/mailcow-accounts/[id]">
) {
  try {
    await requireAdminOrStaff(request);
    const params = await ctx.params;
    const id = parseRouteId(params.id);

    const [row] = await db
      .select({
        mailcowAccount,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      })
      .from(mailcowAccount)
      .leftJoin(user, eq(mailcowAccount.userId, user.id))
      .where(eq(mailcowAccount.id, id))
      .limit(1);

    if (!row) {
      return Response.json(
        { ok: false, error: "Mailcow account not found" },
        { status: 404 }
      );
    }

    return Response.json({
      ok: true,
      mailcowAccount: {
        ...row.mailcowAccount,
        user: row.user?.id ? row.user : undefined,
      },
    });
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/mailcow-accounts/[id]">
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

    const updated = await mailcowIntegration.updateAccount(id, body);

    return Response.json({ ok: true, mailcowAccount: updated });
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/mailcow-accounts/[id]">
) {
  try {
    await requireAdminOrStaff(request);
    const params = await ctx.params;
    const id = parseRouteId(params.id);

    const [existing] = await db
      .select({ id: mailcowAccount.id })
      .from(mailcowAccount)
      .where(and(eq(mailcowAccount.id, id)))
      .limit(1);

    if (!existing) {
      return Response.json(
        { ok: false, error: "Mailcow account not found" },
        { status: 404 }
      );
    }

    await mailcowIntegration.deleteAccount(id);

    return Response.json({ ok: true });
  } catch (error) {
    return handleAPIError(error);
  }
}
