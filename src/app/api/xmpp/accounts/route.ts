import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";
import { eq } from "drizzle-orm";

import { APIError, handleAPIError, requireAuth } from "@/lib/api/utils";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema/auth";
import { xmppAccount } from "@/lib/db/schema/xmpp";
import {
  checkProsodyAccountExists,
  createProsodyAccount,
  deleteProsodyAccount,
} from "@/lib/xmpp/client";
import { xmppConfig } from "@/lib/xmpp/config";
import type { CreateXmppAccountRequest } from "@/lib/xmpp/types";
import {
  formatJid,
  generateUsernameFromEmail,
  isValidXmppUsername,
} from "@/lib/xmpp/utils";

export const dynamic = "force-dynamic";

/**
 * POST /api/xmpp/accounts
 * Create a new XMPP account for the authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request);
    const body = (await request.json()) as CreateXmppAccountRequest;

    // Check if user already has an XMPP account (one per user)
    const existingAccount = await db.query.xmppAccount.findFirst({
      where: eq(xmppAccount.userId, userId),
    });

    if (existingAccount) {
      return Response.json(
        { ok: false, error: "User already has an XMPP account" },
        { status: 409 }
      );
    }

    // Get user email to generate username if not provided
    const [userData] = await db
      .select({ email: user.email })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!userData) {
      return Response.json(
        { ok: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Determine username
    let username: string;
    if (body.username) {
      // Validate provided username
      if (!isValidXmppUsername(body.username)) {
        return Response.json(
          {
            ok: false,
            error:
              "Invalid username format. Username must be alphanumeric with underscores, hyphens, or dots, and start with a letter or number.",
          },
          { status: 400 }
        );
      }
      username = body.username.toLowerCase();
    } else {
      // Generate username from email
      try {
        username = generateUsernameFromEmail(userData.email);
      } catch (_error) {
        return Response.json(
          {
            ok: false,
            error:
              "Could not generate username from email. Please provide a custom username.",
          },
          { status: 400 }
        );
      }
    }

    // Check username uniqueness in database
    const existingUsername = await db.query.xmppAccount.findFirst({
      where: eq(xmppAccount.username, username),
    });

    if (existingUsername) {
      return Response.json(
        { ok: false, error: "Username already taken" },
        { status: 409 }
      );
    }

    // Check username uniqueness in Prosody
    const prosodyAccountExists = await checkProsodyAccountExists(username);
    if (prosodyAccountExists) {
      return Response.json(
        { ok: false, error: "Username already taken in XMPP server" },
        { status: 409 }
      );
    }

    // Create account in Prosody (no password - authentication via OAuth)
    try {
      await createProsodyAccount(username);
    } catch (error) {
      if (error instanceof Error) {
        // Check if account creation failed due to existing account
        if (error.message.includes("already exists")) {
          return Response.json(
            { ok: false, error: "Username already taken" },
            { status: 409 }
          );
        }
        throw new APIError(
          `Failed to create XMPP account in Prosody: ${error.message}`,
          500
        );
      }
      throw new APIError("Failed to create XMPP account in Prosody", 500);
    }

    // Create account record in database
    const jid = formatJid(username, xmppConfig.domain);
    const [newAccount] = await db
      .insert(xmppAccount)
      .values({
        id: randomUUID(),
        userId,
        jid,
        username,
        status: "active",
      })
      .returning();

    if (!newAccount) {
      // Rollback: Try to delete Prosody account if database insert fails
      try {
        await deleteProsodyAccount(username);
      } catch {
        // Ignore rollback errors
      }
      throw new APIError("Failed to create XMPP account record", 500);
    }

    return Response.json(
      {
        ok: true,
        account: {
          id: newAccount.id,
          jid: newAccount.jid,
          username: newAccount.username,
          status: newAccount.status,
          createdAt: newAccount.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleAPIError(error);
  }
}

/**
 * Retrieve the authenticated user's XMPP account record.
 *
 * Returns the user's XMPP account details if one exists for the authenticated user,
 * or an error response when no account is found.
 *
 * @returns A JSON Response:
 * - Success (200): `{ ok: true, account: { id, jid, username, status, createdAt, updatedAt, metadata } }`
 * - Not found (404): `{ ok: false, error: "XMPP account not found" }`
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request);

    const account = await db.query.xmppAccount.findFirst({
      where: eq(xmppAccount.userId, userId),
    });

    if (!account) {
      return Response.json(
        { ok: false, error: "XMPP account not found" },
        { status: 404 }
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