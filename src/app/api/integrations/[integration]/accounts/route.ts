import type { NextRequest } from "next/server";

import { APIError, handleAPIError, requireAuth } from "@/lib/api/utils";
import { registerIntegrations } from "@/lib/integrations";
import { getIntegrationRegistry } from "@/lib/integrations/core/registry";

export const dynamic = "force-dynamic";

/**
 * GET /api/integrations/[integration]/accounts
 * Get current user's integration account
 */
export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/integrations/[integration]/accounts">
) {
  try {
    const { userId } = await requireAuth(request);
    const { integration: integrationId } = await ctx.params;

    registerIntegrations();
    const integration = getIntegrationRegistry().get(integrationId);

    if (!integration) {
      throw new APIError("Unknown integration", 404);
    }

    if (!integration.enabled) {
      throw new APIError("Integration is disabled", 403);
    }

    const account = await integration.getAccount(userId);
    if (!account) {
      return Response.json(
        { ok: false, error: "Integration account not found" },
        { status: 404 }
      );
    }

    return Response.json({ ok: true, account });
  } catch (error) {
    return handleAPIError(error);
  }
}

/**
 * POST /api/integrations/[integration]/accounts
 * Create an integration account for the current user
 */
export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/integrations/[integration]/accounts">
) {
  try {
    const { userId } = await requireAuth(request);
    const { integration: integrationId } = await ctx.params;

    registerIntegrations();
    const integration = getIntegrationRegistry().get(integrationId);

    if (!integration) {
      throw new APIError("Unknown integration", 404);
    }

    if (!integration.enabled) {
      throw new APIError("Integration is disabled", 403);
    }

    const body = await request.json().catch(() => ({}));
    const account = await integration.createAccount(userId, body);

    return Response.json({ ok: true, account }, { status: 201 });
  } catch (error) {
    return handleAPIError(error);
  }
}
