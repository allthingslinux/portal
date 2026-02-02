import type { NextRequest } from "next/server";
import { z } from "zod";
import { captureException } from "@sentry/nextjs";

import { registerIntegrations } from "@/features/integrations/lib";
import { getIntegrationRegistry } from "@/features/integrations/lib/core/registry";
import { APIError, handleAPIError, requireAuth } from "@/shared/api/utils";

// With cacheComponents, route handlers are dynamic by default.
// [integration] is validated via getIntegrationRegistry().get() (allowlist).

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

    let data = account;
    if (integration.accountSchema) {
      // Validate outgoing data against schema (ensure no leaks)
      const parsed = integration.accountSchema.safeParse(account);
      if (parsed.success) {
        data = parsed.data as typeof account;
      } else {
        // Log the mismatch but don't fail the request (defensive output validation)
        captureException(
          new Error(`Account schema validation failed for ${integrationId}`),
          {
            extra: { integrationId, userId, issues: parsed.error.issues },
          }
        );
      }
    }

    return Response.json({ ok: true, account: data });
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

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      throw new APIError("Invalid JSON body", 400);
    }
    let body: unknown = rawBody;

    if (integration.createAccountSchema) {
      const parsed = integration.createAccountSchema.safeParse(rawBody);
      if (!parsed.success) {
        const error = parsed.error;
        const errorMessage = error.issues[0]?.message ?? "Validation failed";
        throw new APIError(errorMessage, 400, {
          issues: error.issues,
          flattened: error.flatten(),
        });
      }
      body = parsed.data;
    } else {
      // Fallback for integrations without schemas
      const fallbackSchema = z.record(z.string(), z.unknown());
      const parsed = fallbackSchema.safeParse(rawBody);
      if (!parsed.success) {
        throw new APIError("Invalid request body", 400);
      }
      body = parsed.data;
    }

    // Cast body to expected input type (validated by schema or fallback)
    const account = await integration.createAccount(userId, body as object);

    let data = account;
    if (integration.accountSchema) {
      // Validate outgoing data against schema (ensure no leaks)
      const parsed = integration.accountSchema.safeParse(account);
      if (parsed.success) {
        data = parsed.data as typeof account;
      } else {
        // Log the mismatch but don't fail the request (defensive output validation)
        captureException(
          new Error(`Account schema validation failed for ${integrationId}`),
          {
            extra: { integrationId, userId, issues: parsed.error.issues },
          }
        );
      }
    }

    return Response.json({ ok: true, account: data }, { status: 201 });
  } catch (error) {
    return handleAPIError(error);
  }
}
