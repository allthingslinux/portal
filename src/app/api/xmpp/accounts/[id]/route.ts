import type { NextRequest } from "next/server";
import { and, eq, ne } from "drizzle-orm";

import { APIError, handleAPIError, requireAuth } from "@/lib/api/utils";
import { isAdmin } from "@/lib/auth/check-role";
import { db } from "@/lib/db";
import { xmppAccount } from "@/lib/db/schema/xmpp";
import { deleteProsodyAccount } from "@/lib/xmpp/client";
import { xmppConfig } from "@/lib/xmpp/config";
import type { UpdateXmppAccountRequest } from "@/lib/xmpp/types";
import { formatJid, isValidXmppUsername } from "@/lib/xmpp/utils";

export const dynamic = "force-dynamic";

/**
 * GET /api/xmpp/accounts/[id]
 * Get specific XMPP account details (admin or owner only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await requireAuth(request);
    const { id } = await params;

    const account = await db.query.xmppAccount.findFirst({
      where: eq(xmppAccount.id, id),
    });

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await requireAuth(request);
    const { id } = await params;
    const body = (await request.json()) as UpdateXmppAccountRequest;

    const account = await db.query.xmppAccount.findFirst({
      where: eq(xmppAccount.id, id),
    });

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

    // Update username (requires account recreation in Prosody)
    if (body.username && body.username !== account.username) {
      const newUsername = body.username.toLowerCase();

      if (!isValidXmppUsername(newUsername)) {
        return Response.json(
          {
            ok: false,
            error:
              "Invalid username format. Username must be alphanumeric with underscores, hyphens, or dots, and start with a letter or number.",
          },
          { status: 400 }
        );
      }

      // Check username uniqueness (exclude current account)
      const existingUsername = await db.query.xmppAccount.findFirst({
        where: and(
          eq(xmppAccount.username, newUsername),
          ne(xmppAccount.id, id) // Exclude current account
        ),
      });

      if (existingUsername) {
        return Response.json(
          { ok: false, error: "Username already taken" },
          { status: 409 }
        );
      }

      // Note: Changing username in XMPP typically requires recreating the account
      // This is a limitation of XMPP - usernames are typically immutable
      // For now, we'll update the database but note that Prosody may need manual intervention
      updates.username = newUsername;
      updates.jid = formatJid(newUsername, xmppConfig.domain);
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await requireAuth(request);
    const { id } = await params;

    const account = await db.query.xmppAccount.findFirst({
      where: eq(xmppAccount.id, id),
    });

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
      if (
        error instanceof Error &&
        !error.message.includes("not found") &&
        !error.message.includes("404")
      ) {
        throw new APIError(
          `Failed to delete XMPP account from Prosody: ${error.message}`,
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
