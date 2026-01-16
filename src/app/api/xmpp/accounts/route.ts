import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";

import { APIError, handleAPIError, requireAuth } from "@/lib/api/utils";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema/auth";
import { xmppAccount } from "@/lib/db/schema/xmpp";
import {
  checkProsodyAccountExists,
  createProsodyAccount,
  deleteProsodyAccount,
} from "@/lib/integrations/xmpp/client";
import { xmppConfig } from "@/lib/integrations/xmpp/config";
import {
  formatJid,
  generateUsernameFromEmail,
  isValidXmppUsername,
} from "@/lib/integrations/xmpp/utils";

// Zod schema for create request validation
const createXmppAccountSchema = z.object({
  username: z.string().optional(),
});

export const dynamic = "force-dynamic";

/**
 * Determine username from request body or user email
 */
function determineUsername(
  providedUsername: string | undefined,
  userEmail: string
): { username: string } | { error: Response } {
  if (providedUsername) {
    if (!isValidXmppUsername(providedUsername)) {
      return {
        error: Response.json(
          {
            ok: false,
            error:
              "Invalid username format. Username must be alphanumeric with underscores, hyphens, or dots, and start with a letter or number.",
          },
          { status: 400 }
        ),
      };
    }
    return { username: providedUsername.toLowerCase() };
  }

  try {
    return { username: generateUsernameFromEmail(userEmail) };
  } catch {
    return {
      error: Response.json(
        {
          ok: false,
          error:
            "Could not generate username from email. Please provide a custom username.",
        },
        { status: 400 }
      ),
    };
  }
}

/**
 * Check if username is available in both database and Prosody
 */
async function checkUsernameAvailability(
  username: string
): Promise<{ available: true } | { available: false; error: Response }> {
  // Check database
  const [existingUsername] = await db
    .select()
    .from(xmppAccount)
    .where(eq(xmppAccount.username, username))
    .limit(1);

  if (existingUsername) {
    return {
      available: false,
      error: Response.json(
        { ok: false, error: "Username already taken" },
        { status: 409 }
      ),
    };
  }

  // Check Prosody
  const prosodyAccountExists = await checkProsodyAccountExists(username);
  if (prosodyAccountExists) {
    return {
      available: false,
      error: Response.json(
        { ok: false, error: "Username already taken in XMPP server" },
        { status: 409 }
      ),
    };
  }

  return { available: true };
}

/**
 * POST /api/xmpp/accounts
 * Create a new XMPP account for the authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request);

    // Validate request body with Zod
    const parseResult = createXmppAccountSchema.safeParse(await request.json());
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

    // Check if user already has an XMPP account (one per user)
    const [existingAccount] = await db
      .select()
      .from(xmppAccount)
      .where(eq(xmppAccount.userId, userId))
      .limit(1);

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
    const usernameResult = determineUsername(body.username, userData.email);
    if ("error" in usernameResult) {
      return usernameResult.error;
    }
    const { username } = usernameResult;

    // Check username availability
    const availabilityResult = await checkUsernameAvailability(username);
    if (!availabilityResult.available) {
      return availabilityResult.error;
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
 * GET /api/xmpp/accounts
 * Get current user's XMPP account information
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request);

    const [account] = await db
      .select()
      .from(xmppAccount)
      .where(eq(xmppAccount.userId, userId))
      .limit(1);

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
