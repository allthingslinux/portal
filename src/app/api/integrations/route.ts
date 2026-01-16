import type { NextRequest } from "next/server";

import { handleAPIError, requireAuth } from "@/lib/api/utils";
import { registerIntegrations } from "@/lib/integrations";
import { getIntegrationRegistry } from "@/lib/integrations/core/registry";

export const dynamic = "force-dynamic";

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
