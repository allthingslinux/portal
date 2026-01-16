import type { NextRequest } from "next/server";

import { APIError, handleAPIError, requireAuth } from "@/lib/api/utils";
import { isAdmin } from "@/lib/auth/check-role";
import { registerIntegrations } from "@/lib/integrations";
import { getIntegrationRegistry } from "@/lib/integrations/core/registry";

export const dynamic = "force-dynamic";

/**
 * GET /api/integrations/[integration]/accounts/[id]
 * Get a specific integration account (admin or owner only)
 */
export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/integrations/[integration]/accounts/[id]">
) {
  try {
    const { userId } = await requireAuth(request);
    const { integration: integrationId, id } = await ctx.params;

    registerIntegrations();
    const integration = getIntegrationRegistry().get(integrationId);

    if (!integration) {
      throw new APIError("Unknown integration", 404);
    }

    if (!integration.enabled) {
      throw new APIError("Integration is disabled", 403);
    }

    if (!integration.getAccountById) {
      throw new APIError("Integration does not support account lookup", 400);
    }

    const account = await integration.getAccountById(id);
    if (!account) {
      return Response.json(
        { ok: false, error: "Integration account not found" },
        { status: 404 }
      );
    }

    const isAdminUser = await isAdmin(userId);
    if (account.userId !== userId && !isAdminUser) {
      return Response.json(
        { ok: false, error: "Forbidden - Access denied" },
        { status: 403 }
      );
    }

    return Response.json({ ok: true, account });
  } catch (error) {
    return handleAPIError(error);
  }
}

/**
 * PATCH /api/integrations/[integration]/accounts/[id]
 * Update a specific integration account
 */
export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/integrations/[integration]/accounts/[id]">
) {
  try {
    const { userId } = await requireAuth(request);
    const { integration: integrationId, id } = await ctx.params;

    registerIntegrations();
    const integration = getIntegrationRegistry().get(integrationId);

    if (!integration) {
      throw new APIError("Unknown integration", 404);
    }

    if (!integration.enabled) {
      throw new APIError("Integration is disabled", 403);
    }

    if (!integration.getAccountById) {
      throw new APIError("Integration does not support account lookup", 400);
    }

    const account = await integration.getAccountById(id);
    if (!account) {
      return Response.json(
        { ok: false, error: "Integration account not found" },
        { status: 404 }
      );
    }

    const isAdminUser = await isAdmin(userId);
    if (account.userId !== userId && !isAdminUser) {
      return Response.json(
        { ok: false, error: "Forbidden - Access denied" },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const updated = await integration.updateAccount(id, body);

    return Response.json({ ok: true, account: updated });
  } catch (error) {
    return handleAPIError(error);
  }
}

/**
 * DELETE /api/integrations/[integration]/accounts/[id]
 * Delete a specific integration account
 */
export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<"/api/integrations/[integration]/accounts/[id]">
) {
  try {
    const { userId } = await requireAuth(request);
    const { integration: integrationId, id } = await ctx.params;

    registerIntegrations();
    const integration = getIntegrationRegistry().get(integrationId);

    if (!integration) {
      throw new APIError("Unknown integration", 404);
    }

    if (!integration.enabled) {
      throw new APIError("Integration is disabled", 403);
    }

    if (!integration.getAccountById) {
      throw new APIError("Integration does not support account lookup", 400);
    }

    const account = await integration.getAccountById(id);
    if (!account) {
      return Response.json(
        { ok: false, error: "Integration account not found" },
        { status: 404 }
      );
    }

    const isAdminUser = await isAdmin(userId);
    if (account.userId !== userId && !isAdminUser) {
      return Response.json(
        { ok: false, error: "Forbidden - Access denied" },
        { status: 403 }
      );
    }

    await integration.deleteAccount(id);

    return Response.json({
      ok: true,
      message: "Integration account deleted successfully",
    });
  } catch (error) {
    return handleAPIError(error);
  }
}
