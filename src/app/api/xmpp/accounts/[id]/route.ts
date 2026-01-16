import type { NextRequest } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";

import { APIError, handleAPIError, requireAuth } from "@/lib/api/utils";
import { isAdmin } from "@/lib/auth/check-role";
import { db } from "@/lib/db";
import { xmppAccount } from "@/lib/db/schema/xmpp";
import {
  deleteProsodyAccount,
  ProsodyAccountNotFoundError,
} from "@/lib/integrations/xmpp/client";

// Zod schema for update request validation
const updateXmppAccountSchema = z.object({
  username: z.string().optional(),
  status: z.enum(["active", "suspended", "deleted"]).optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

export const dynamic = "force-dynamic";

/**
 * GET /api/xmpp/accounts/[id]
 * Get specific XMPP account details (admin or owner only)
 */
export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/xmpp/accounts/[id]">
) {
  try {
    const { userId } = await requireAuth(request);
    const { id } = await ctx.params;

    const [account] = await db
      .select()
      .from(xmppAccount)
      .where(eq(xmppAccount.id, id))
      .limit(1);

    if (!account) {
      return Response.json(
        { ok: false, error: "XMPP account not found" },
        { status: 404 }
      );
    }

    // Check authorization: user owns account or is admin
    const isAdminUser = await isAdmin(userId);

    if (account.userId !== userId && !isAdminUser) {
      return Response.json(
        { ok: false, error: "Forbidden - Access denied" },
        { status: 403 }
      );
    }

    return Response.json({
      ok: true,
      account: {
        id: account.id,
        jid: account.jid,
        username: account.username,
        status: account.status,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
        metadata: account.metadata,
      },
    });
  } catch (error) {
    return handleAPIError(error);
  }
}

/**
 * PATCH /api/xmpp/accounts/[id]
 * Update XMPP account (username, status, metadata)
 * Note: Changing username may require recreating the Prosody account
 */
export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/xmpp/accounts/[id]">
) {
  try {
    const { userId } = await requireAuth(request);
    const { id } = await ctx.params;

    // Validate request body with Zod
    const parseResult = updateXmppAccountSchema.safeParse(await request.json());
    if (!parseResult.success) {
      return Response.json(
        {
          ok: false,
          error: "Invalid request body",
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }
    const body = parseResult.data;

    const [account] = await db
      .select()
      .from(xmppAccount)
      .where(eq(xmppAccount.id, id))
      .limit(1);

    if (!account) {
      return Response.json(
        { ok: false, error: "XMPP account not found" },
        { status: 404 }
      );
    }

    // Check authorization: user owns account or is admin
    const isAdminUser = await isAdmin(userId);

    if (account.userId !== userId && !isAdminUser) {
      return Response.json(
        { ok: false, error: "Forbidden - Access denied" },
        { status: 403 }
      );
    }

    const updates: Partial<typeof xmppAccount.$inferInsert> = {};

    // Update username - REJECTED: Username changes require Prosody account recreation
    // which would cause authentication failures. Users must delete and recreate account.
    if (body.username && body.username !== account.username) {
      return Response.json(
        {
          ok: false,
          error:
            "Username cannot be changed. Please delete your account and create a new one with the desired username.",
        },
        { status: 400 }
      );
    }

    // Update status
    if (body.status && body.status !== account.status) {
      updates.status = body.status;
    }

    // Update metadata
    if (body.metadata !== undefined) {
      updates.metadata = body.metadata;
    }

    if (Object.keys(updates).length === 0) {
      return Response.json(
        { ok: false, error: "No valid updates provided" },
        { status: 400 }
      );
    }

    // Update account in database
    const [updated] = await db
      .update(xmppAccount)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(xmppAccount.id, id))
      .returning();

    if (!updated) {
      throw new APIError("Failed to update XMPP account", 500);
    }

    return Response.json({
      ok: true,
      account: {
        id: updated.id,
        jid: updated.jid,
        username: updated.username,
        status: updated.status,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
        metadata: updated.metadata,
      },
    });
  } catch (error) {
    return handleAPIError(error);
  }
}

/**
 * DELETE /api/xmpp/accounts/[id]
 * Delete/suspend XMPP account (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<"/api/xmpp/accounts/[id]">
) {
  try {
    const { userId } = await requireAuth(request);
    const { id } = await ctx.params;

    const [account] = await db
      .select()
      .from(xmppAccount)
      .where(eq(xmppAccount.id, id))
      .limit(1);

    if (!account) {
      return Response.json(
        { ok: false, error: "XMPP account not found" },
        { status: 404 }
      );
    }

    // Check authorization: user owns account or is admin
    const isAdminUser = await isAdmin(userId);

    if (account.userId !== userId && !isAdminUser) {
      return Response.json(
        { ok: false, error: "Forbidden - Access denied" },
        { status: 403 }
      );
    }

    // Delete account from Prosody
    try {
      await deleteProsodyAccount(account.username);
    } catch (error) {
      // If account doesn't exist in Prosody, that's okay - continue with soft delete
      if (error instanceof ProsodyAccountNotFoundError) {
        // Account doesn't exist in Prosody - continue with soft delete
      } else if (error instanceof Error) {
        throw new APIError(
          `Failed to delete XMPP account from Prosody: ${error.message}`,
          500
        );
      } else {
        throw new APIError(
          "Failed to delete XMPP account from Prosody: Unknown error",
          500
        );
      }
    }

    // Soft delete: mark as deleted in database
    const [deleted] = await db
      .update(xmppAccount)
      .set({
        status: "deleted",
        updatedAt: new Date(),
      })
      .where(eq(xmppAccount.id, id))
      .returning();

    if (!deleted) {
      throw new APIError("Failed to delete XMPP account", 500);
    }

    return Response.json({
      ok: true,
      message: "XMPP account deleted successfully",
    });
  } catch (error) {
    return handleAPIError(error);
  }
}
