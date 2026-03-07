import type { NextRequest } from "next/server";
import { handleAPIError, requireAuth } from "@portal/api/utils";
import { captureException } from "@sentry/nextjs";

import { registerIntegrations } from "@/features/integrations/lib";
import { getIntegrationRegistry } from "@/features/integrations/lib/core/registry";
import { mediawikiBotClient } from "@/features/integrations/lib/mediawiki/bot-client";
import type { MediaWikiAccount } from "@/features/integrations/lib/mediawiki/types";

/**
 * GET /api/integrations/mediawiki/user-stats
 * Fetch wiki user info (edit count, registration) and recent contributions
 * for the current user's linked wiki account.
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request);

    registerIntegrations();
    const integration = getIntegrationRegistry().get("mediawiki");

    if (!integration?.enabled) {
      return Response.json(
        { ok: false, error: "MediaWiki integration is not available" },
        { status: 503 }
      );
    }

    const account = (await integration.getAccount(
      userId
    )) as MediaWikiAccount | null;

    if (!account) {
      return Response.json(
        { ok: false, error: "No wiki account found" },
        { status: 404 }
      );
    }

    const [userInfo, contribs] = await Promise.all([
      mediawikiBotClient.getUserInfo(account.wikiUsername),
      mediawikiBotClient.getUserContribs(account.wikiUsername, 10),
    ]);

    return Response.json({
      ok: true,
      userInfo,
      contribs,
    });
  } catch (error) {
    captureException(error, {
      tags: { integration: "mediawiki", step: "user_stats" },
    });
    return handleAPIError(error);
  }
}
