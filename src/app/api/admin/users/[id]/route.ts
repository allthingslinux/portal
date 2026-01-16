import type { NextRequest } from "next/server";
import { eq } from "drizzle-orm";

import { handleAPIError, requireAdminOrStaff } from "@/lib/api/utils";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema/auth";
import { cleanupIntegrationAccounts } from "@/lib/integrations/core/user-deletion";

// Route handlers are dynamic by default, but we explicitly mark them as such
// since they access database and request headers
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/users/[id]">
) {
  try {
    await requireAdminOrStaff(request);
    const { id } = await ctx.params;

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

    return Response.json({ user: userData });
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
    const { id } = await ctx.params;
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
    const { id } = await ctx.params;

    await cleanupIntegrationAccounts(id);
    await db.delete(user).where(eq(user.id, id));

    return Response.json({ success: true });
  } catch (error) {
    return handleAPIError(error);
  }
}
