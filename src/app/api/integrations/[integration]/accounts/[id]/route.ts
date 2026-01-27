import type { NextRequest } from "next/server";

import { isAdmin } from "@/auth/check-role";
import { registerIntegrations } from "@/features/integrations/lib";
import { getIntegrationRegistry } from "@/features/integrations/lib/core/registry";
import { APIError, handleAPIError, requireAuth } from "@/shared/api/utils";

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
    const params = await ctx.params;
    const integrationId =
      typeof params.integration === "string"
        ? params.integration
        : params.integration[0];
    const id = typeof params.id === "string" ? params.id : params.id[0];

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
    const params = await ctx.params;
    const integrationId =
      typeof params.integration === "string"
        ? params.integration
        : params.integration[0];
    const id = typeof params.id === "string" ? params.id : params.id[0];

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

    if (!integration.updateAccount) {
      throw new APIError("Integration does not support account updates", 400);
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

    let body: Record<string, unknown>;
    try {
      const rawBody = await request.json();
      if (typeof rawBody !== "object" || rawBody === null) {
        throw new APIError("Invalid request body", 400);
      }
      body = rawBody as Record<string, unknown>;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError("Invalid JSON body", 400);
    }

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
    const params = await ctx.params;
    const integrationId =
      typeof params.integration === "string"
        ? params.integration
        : params.integration[0];
    const id = typeof params.id === "string" ? params.id : params.id[0];

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

    if (!integration.deleteAccount) {
      throw new APIError("Integration does not support account deletion", 400);
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
