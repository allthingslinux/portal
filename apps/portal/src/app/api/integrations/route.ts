import type { NextRequest } from "next/server";
import { handleAPIError, requireAuth } from "@portal/api/utils";

import { registerIntegrations } from "@/features/integrations/lib";
import { getIntegrationRegistry } from "@/features/integrations/lib/core/registry";

// With cacheComponents, route handlers are dynamic by default.

/**
 * GET /api/integrations
 * List available integrations
 */
export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);

    registerIntegrations();
    const integrations = getIntegrationRegistry().getPublicInfo();

    return Response.json({ ok: true, integrations });
  } catch (error) {
    return handleAPIError(error);
  }
}
