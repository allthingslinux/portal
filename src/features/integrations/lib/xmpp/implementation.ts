import "server-only";

import { randomUUID } from "node:crypto";
import { z } from "zod";
import { and, eq, ne } from "drizzle-orm";

import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { xmppAccount } from "@/db/schema/xmpp";
import {
  checkProsodyAccountExists,
  createProsodyAccount,
  deleteProsodyAccount,
  ProsodyAccountNotFoundError,
} from "./client";
import { isXmppConfigured, validateXmppConfig, xmppConfig } from "./config";
import type {
  CreateXmppAccountRequest,
  UpdateXmppAccountRequest,
  XmppAccount,
} from "./types";
import {
  formatJid,
  generateUsernameFromEmail,
  isValidXmppUsername,
} from "./utils";
import { IntegrationBase } from "@/features/integrations/lib/core/base";
import { getIntegrationRegistry } from "@/features/integrations/lib/core/registry";

const UpdateXmppAccountSchema = z.object({
  status: z.enum(["active", "suspended"]).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  username: z.string().optional(),
});

/**
 * XMPP integration implementation.
 */
export class XmppIntegration extends IntegrationBase<
  XmppAccount,
  CreateXmppAccountRequest,
  UpdateXmppAccountRequest
> {
  constructor() {
    super({
      id: "xmpp",
      name: "XMPP",
      description: "XMPP chat accounts and provisioning",
      enabled: isXmppConfigured(),
    });
  }

  /**
   * Determine username from request input or user email.
   */
  private determineUsername(
    providedUsername: string | undefined,
    userEmail: string
  ): { username: string } | { error: Error } {
    if (providedUsername) {
      if (!isValidXmppUsername(providedUsername)) {
        return {
          error: new Error(
            "Invalid username format. Username must be alphanumeric with underscores, hyphens, or dots, and start with a letter or number."
          ),
        };
      }
      return { username: providedUsername.toLowerCase() };
    }

    try {
      return { username: generateUsernameFromEmail(userEmail) };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error
            : new Error(
                "Could not generate username from email. Please provide a custom username."
              ),
      };
    }
  }

  /**
   * Check if username is available in both database and Prosody.
   */
  private async checkUsernameAvailability(
    username: string
  ): Promise<{ available: true } | { available: false; error: Error }> {
    const [existingUsername] = await db
      .select()
      .from(xmppAccount)
      .where(
        and(
          eq(xmppAccount.username, username),
          ne(xmppAccount.status, "deleted")
        )
      )
      .limit(1);

    if (existingUsername) {
      return {
        available: false,
        error: new Error("Username already taken"),
      };
    }

    const prosodyAccountExists = await checkProsodyAccountExists(username);
    if (prosodyAccountExists) {
      return {
        available: false,
        error: new Error("Username already taken in XMPP server"),
      };
    }

    return { available: true };
  }

  /**
   * Create a new XMPP account for a user.
   */
  async createAccount(
    userId: string,
    input: CreateXmppAccountRequest
  ): Promise<XmppAccount> {
    if (!this.enabled) {
      throw new Error("XMPP integration is not configured");
    }
    validateXmppConfig();
    const [existingAccount] = await db
      .select()
      .from(xmppAccount)
      .where(
        and(eq(xmppAccount.userId, userId), ne(xmppAccount.status, "deleted"))
      )
      .limit(1);

    if (existingAccount) {
      throw new Error("User already has an XMPP account");
    }

    const [userData] = await db
      .select({ email: user.email })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!userData) {
      throw new Error("User not found");
    }

    const usernameResult = this.determineUsername(
      input.username,
      userData.email
    );
    if ("error" in usernameResult) {
      throw usernameResult.error;
    }
    const { username } = usernameResult;

    const availabilityResult = await this.checkUsernameAvailability(username);
    if (!availabilityResult.available) {
      throw availabilityResult.error;
    }

    try {
      await createProsodyAccount(username);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("already exists")) {
          throw new Error("Username already taken");
        }
        throw new Error(
          `Failed to create XMPP account in Prosody: ${error.message}`
        );
      }
      throw new Error("Failed to create XMPP account in Prosody");
    }

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
      try {
        await deleteProsodyAccount(username);
      } catch {
        // Ignore rollback errors
      }
      throw new Error("Failed to create XMPP account record");
    }

    return rowToAccount(newAccount);
  }

  /**
   * Fetch a user's XMPP account, if one exists.
   */
  async getAccount(userId: string): Promise<XmppAccount | null> {
    const [account] = await db
      .select()
      .from(xmppAccount)
      .where(
        and(eq(xmppAccount.userId, userId), ne(xmppAccount.status, "deleted"))
      )
      .limit(1);

    return account ? rowToAccount(account) : null;
  }

  /**
   * Fetch a specific XMPP account by ID.
   */
  async getAccountById(accountId: string): Promise<XmppAccount | null> {
    const [account] = await db
      .select()
      .from(xmppAccount)
      .where(
        and(eq(xmppAccount.id, accountId), ne(xmppAccount.status, "deleted"))
      )
      .limit(1);

    return account ? rowToAccount(account) : null;
  }

  /**
   * Update an XMPP account (status/metadata only).
   */
  async updateAccount(
    accountId: string,
    input: UpdateXmppAccountRequest
  ): Promise<XmppAccount> {
    const parsed = UpdateXmppAccountSchema.safeParse(input);
    if (!parsed.success) {
      throw new Error("Invalid update request");
    }
    const data = parsed.data;

    const [account] = await db
      .select()
      .from(xmppAccount)
      .where(
        and(eq(xmppAccount.id, accountId), ne(xmppAccount.status, "deleted"))
      )
      .limit(1);

    if (!account) {
      throw new Error("XMPP account not found");
    }

    if (data.username && data.username !== account.username) {
      throw new Error(
        "Username cannot be changed. Please delete your account and create a new one with the desired username."
      );
    }

    const updates: Partial<typeof xmppAccount.$inferInsert> = {};

    if (data.status && data.status !== account.status) {
      updates.status = data.status;
    }

    if (data.metadata !== undefined) {
      updates.metadata = data.metadata;
    }

    if (Object.keys(updates).length === 0) {
      throw new Error("No valid updates provided");
    }

    const [updated] = await db
      .update(xmppAccount)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(xmppAccount.id, accountId))
      .returning();

    if (!updated) {
      throw new Error("Failed to update XMPP account");
    }

    return rowToAccount(updated);
  }

  /**
   * Delete an XMPP account (soft delete + Prosody cleanup).
   */
  async deleteAccount(accountId: string): Promise<void> {
    if (!this.enabled) {
      throw new Error("XMPP integration is not configured");
    }
    validateXmppConfig();
    const [account] = await db
      .select()
      .from(xmppAccount)
      .where(
        and(eq(xmppAccount.id, accountId), ne(xmppAccount.status, "deleted"))
      )
      .limit(1);

    if (!account) {
      return;
    }

    try {
      await deleteProsodyAccount(account.username);
    } catch (error) {
      if (error instanceof ProsodyAccountNotFoundError) {
        // Account doesn't exist in Prosody - continue with soft delete
      } else if (error instanceof Error) {
        throw new Error(
          `Failed to delete XMPP account from Prosody: ${error.message}`
        );
      } else {
        throw new Error(
          "Failed to delete XMPP account from Prosody: Unknown error"
        );
      }
    }

    const [deleted] = await db
      .update(xmppAccount)
      .set({
        status: "deleted",
        updatedAt: new Date(),
      })
      .where(eq(xmppAccount.id, accountId))
      .returning();

    if (!deleted) {
      throw new Error("Failed to delete XMPP account");
    }
  }
}

function rowToAccount(row: typeof xmppAccount.$inferSelect): XmppAccount {
  return {
    ...row,
    integrationId: "xmpp" as const,
    metadata:
      (row.metadata as Record<string, unknown> | undefined) ?? undefined,
  };
}

export const xmppIntegration = new XmppIntegration();

/**
 * Register the XMPP integration in the registry.
 */
export function registerXmppIntegration(): void {
  getIntegrationRegistry().register(xmppIntegration);
}
