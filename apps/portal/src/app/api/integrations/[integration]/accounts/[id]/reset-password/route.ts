import type { NextRequest } from "next/server";
import { z } from "zod";
import {
  APIError,
  handleAPIError,
  parseRouteId,
  requireAuth,
} from "@portal/api/utils";

import { isAdmin } from "@/auth/check-role";
import { registerIntegrations } from "@/features/integrations/lib";
import { getIntegrationRegistry } from "@/features/integrations/lib/core/registry";
import { ircIntegration } from "@/features/integrations/lib/irc/implementation";
import { xmppIntegration } from "@/features/integrations/lib/xmpp/implementation";

const ResetPasswordSchema = z.object({
  password: z.string().min(1, "Password is required").max(512),
});

/**
 * POST /api/integrations/[integration]/accounts/[id]/reset-password
 * Reset the service-side password for an integration account.
 *
 * - XMPP: User provides a new password in the request body.
 * - IRC: Atheme generates a random password (no admin command to set a specific one).
 *        The generated password is returned in the response.
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

    if (integrationId !== "xmpp" && integrationId !== "irc") {
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
      throw new APIError("Integration account not found", 404);
    }

    const isAdminUser = await isAdmin(userId);
    if (account.userId !== userId && !isAdminUser) {
      throw new APIError("Forbidden - Access denied", 403);
    }

    if (integrationId === "xmpp") {
      // XMPP: user picks their own password
      const body = await request.json();
      const parsed = ResetPasswordSchema.safeParse(body);
      if (!parsed.success) {
        const msg = parsed.error.issues[0]?.message ?? "Invalid password";
        throw new APIError(msg, 400);
      }
      await xmppIntegration.resetPassword(id, parsed.data.password);
      return Response.json({
        ok: true,
        message: "XMPP password reset successfully",
      });
    }

    // IRC: If user provided a password, use two-step (RESETPASS → SET PASSWORD).
    // Otherwise, just RESETPASS and return the random password.
    let ircBody: { password?: string } = {};
    try {
      ircBody = await request.json();
    } catch {
      // No body or invalid JSON — that's fine, we'll just do random reset
    }
    const ircPassword =
      typeof ircBody.password === "string" && ircBody.password.trim()
        ? ircBody.password
        : undefined;

    const newPassword = await ircIntegration.resetPassword(id, ircPassword);
    return Response.json({
      ok: true,
      message: "IRC password reset successfully",
      // Only include temporaryPassword if the user didn't choose their own
      ...(ircPassword ? {} : { temporaryPassword: newPassword }),
    });
  } catch (error) {
    return handleAPIError(error);
  }
}
