import type { NextRequest } from "next/server";
import { z } from "zod";

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
    const params = await ctx.params;
    const integrationId =
      typeof params.integration === "string"
        ? params.integration
        : params.integration[0];

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
    const params = await ctx.params;
    const integrationId =
      typeof params.integration === "string"
        ? params.integration
        : params.integration[0];

    registerIntegrations();
    const integration = getIntegrationRegistry().get(integrationId);

    if (!integration) {
      throw new APIError("Unknown integration", 404);
    }

    if (!integration.enabled) {
      throw new APIError("Integration is disabled", 403);
    }

    let body: Record<string, unknown>;
    try {
      const rawBody = await request.json();
      const bodySchema = z.record(z.string(), z.unknown());
      body = bodySchema.parse(rawBody);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new APIError(`Invalid request body: ${error.message}`, 400);
      }
      throw new APIError("Invalid JSON body", 400);
    }

    const account = await integration.createAccount(userId, body);

    return Response.json({ ok: true, account }, { status: 201 });
  } catch (error) {
    return handleAPIError(error);
  }
}
