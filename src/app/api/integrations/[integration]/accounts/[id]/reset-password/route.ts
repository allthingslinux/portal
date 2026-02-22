import type { NextRequest } from "next/server";

import { isAdmin } from "@/auth/check-role";
import { registerIntegrations } from "@/features/integrations/lib";
import { getIntegrationRegistry } from "@/features/integrations/lib/core/registry";
import { xmppIntegration } from "@/features/integrations/lib/xmpp/implementation";
import {
  APIError,
  handleAPIError,
  parseRouteId,
  requireAuth,
} from "@/shared/api/utils";

// With cacheComponents, route handlers are dynamic by default.

/**
 * POST /api/integrations/[integration]/accounts/[id]/reset-password
 * Reset the service-side password for an integration account.
 * Currently only supported for XMPP (Prosody).
 */
export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/integrations/[integration]/accounts/[id]/reset-password">
) {
  try {
    const { userId } = await requireAuth(request);
    const params = await ctx.params;
    const integrationId =
      typeof params.integration === "string"
        ? params.integration
        : params.integration[0];
    const id = parseRouteId(params.id);

    registerIntegrations();
    const integration = getIntegrationRegistry().get(integrationId);

    if (!integration) {
      throw new APIError("Unknown integration", 404);
    }

    if (!integration.enabled) {
      throw new APIError("Integration is disabled", 403);
    }

    // Only XMPP supports password reset
    if (integrationId !== "xmpp") {
      throw new APIError(
        "Password reset is not supported for this integration",
        400
      );
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

    await xmppIntegration.resetPassword(id);

    return Response.json({
      ok: true,
      message: "XMPP password reset successfully",
    });
  } catch (error) {
    return handleAPIError(error);
  }
}
