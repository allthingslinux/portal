import "server-only";
import { randomUUID } from "node:crypto";
import type { z } from "zod";
import { and, eq, ne } from "drizzle-orm";

import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { xmppAccount } from "@/db/schema/xmpp";
import {
  checkProsodyAccountExists,
  createProsodyAccount,
  deleteProsodyAccount,
  ProsodyAccountNotFoundError,
  ProsodyApiError,
  resetProsodyPassword,
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
import { APIError } from "@/shared/api/utils";
import {
  CreateXmppAccountRequestSchema,
  UpdateXmppAccountRequestSchema,
  XmppAccountSchema,
} from "@/shared/schemas/integrations/xmpp";

// Schemas are now imported from @/shared/schemas/integrations/xmpp

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
      createAccountSchema: CreateXmppAccountRequestSchema,
      updateAccountSchema: UpdateXmppAccountRequestSchema,
      // Cast is safe as XmppAccountSchema matches XmppAccount
      accountSchema: XmppAccountSchema as unknown as z.ZodType<XmppAccount>,
    });
  }

  /**
   * Determine username from request input or user email.
   */
  private determineUsername(
    providedUsername: string | undefined,
    userEmail: string
  ): { username: string } | { error: APIError } {
    if (providedUsername) {
      if (!isValidXmppUsername(providedUsername)) {
        return {
          error: new APIError(
            "Invalid username format. Username must be alphanumeric with underscores, hyphens, or dots, and start with a letter or number.",
            400
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
          error instanceof APIError
            ? error
            : new APIError(
                "Could not generate username from email. Please provide a custom username.",
                400
              ),
      };
    }
  }

  /**
   * Check if username is available in both database and Prosody.
   */
  private async checkUsernameAvailability(
    username: string
  ): Promise<{ available: true } | { available: false; error: APIError }> {
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
        error: new APIError("Username already taken", 409),
      };
    }

    try {
      const prosodyAccountExists = await checkProsodyAccountExists(username);
      if (prosodyAccountExists) {
        return {
          available: false,
          error: new APIError("Username already taken in XMPP server", 409),
        };
      }
    } catch (error) {
      // Network errors, auth failures (401), etc. from Prosody
      if (error instanceof ProsodyApiError) {
        return {
          available: false,
          error: new APIError(
            `Failed to check XMPP username availability: ${error.message}`,
            502
          ),
        };
      }
      return {
        available: false,
        error: new APIError("Failed to check XMPP username availability", 502),
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
  ): Promise<XmppAccount & { temporaryPassword?: string }> {
    if (!this.enabled) {
      throw new APIError("XMPP integration is not configured", 503);
    }

    const parsed = CreateXmppAccountRequestSchema.safeParse(input);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Invalid input";
      throw new APIError(msg, 400);
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
      throw new APIError("User already has an XMPP account", 409);
    }
    const [userData] = await db
      .select({ email: user.email })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!userData) {
      throw new APIError("User not found", 404);
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
    const userPassword =
      "password" in input
        ? (input as { password?: string }).password
        : undefined;
    const passwordUsed = await this.provisionProsodyAccount(
      username,
      userPassword
    );

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
      throw new APIError("Failed to create XMPP account record", 500);
    }

    const account = rowToAccount(newAccount);
    return passwordUsed
      ? { ...account, temporaryPassword: passwordUsed }
      : account;
  }

  /**
   * Provision a Prosody account, returning the password used (if generated).
   */
  private async provisionProsodyAccount(
    username: string,
    userPassword: string | undefined
  ): Promise<string | undefined> {
    try {
      const result = await createProsodyAccount(username, userPassword);
      return userPassword ? undefined : result.passwordUsed;
    } catch (error) {
      if (error instanceof ProsodyApiError) {
        if (error.status === 409) {
          throw new APIError("Username already taken in XMPP server", 409);
        }
        throw new APIError(
          `Failed to create XMPP account in Prosody: ${error.message}`,
          502
        );
      }
      throw new APIError(
        error instanceof Error
          ? `Failed to create XMPP account in Prosody: ${error.message}`
          : "Failed to create XMPP account in Prosody",
        502
      );
    }
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
    const parsed = UpdateXmppAccountRequestSchema.safeParse(input);
    if (!parsed.success) {
      throw new APIError("Invalid update request", 400);
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
      throw new APIError("XMPP account not found", 404);
    }

    if (data.username && data.username !== account.username) {
      throw new APIError(
        "Username cannot be changed. Please delete your account and create a new one with the desired username.",
        400
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
      throw new APIError("No valid updates provided", 400);
    }

    const [updated] = await db
      .update(xmppAccount)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(
        and(eq(xmppAccount.id, accountId), ne(xmppAccount.status, "deleted"))
      )
      .returning();

    if (!updated) {
      throw new APIError("Failed to update XMPP account", 500);
    }

    return rowToAccount(updated);
  }

  /**
   * Delete an XMPP account (soft delete + Prosody cleanup).
   */
  async deleteAccount(accountId: string): Promise<void> {
    if (!this.enabled) {
      throw new APIError("XMPP integration is not configured", 503);
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
        throw new APIError(
          `Failed to delete XMPP account from Prosody: ${error.message}`,
          502
        );
      } else {
        throw new APIError(
          "Failed to delete XMPP account from Prosody: Unknown error",
          502
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
      throw new APIError("Failed to delete XMPP account", 500);
    }
  }

  /**
   * Reset the Prosody password for an XMPP account.
   * The new password is random and not stored — XMPP auth is handled externally.
   */
  async resetPassword(accountId: string, newPassword: string): Promise<void> {
    if (!this.enabled) {
      throw new APIError("XMPP integration is not configured", 503);
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
      throw new APIError("XMPP account not found", 404);
    }

    try {
      await resetProsodyPassword(account.username, newPassword);
    } catch (error) {
      if (error instanceof ProsodyAccountNotFoundError) {
        // Account exists in DB but not in Prosody (orphaned record)
        throw new APIError(
          "XMPP account not found on server. It may have been deleted externally.",
          404
        );
      }
      if (error instanceof ProsodyApiError) {
        throw new APIError(
          `Failed to reset XMPP password: ${error.message}`,
          502
        );
      }
      throw new APIError("Failed to reset XMPP password", 502);
    }
  }
}

const rowToAccount = (row: typeof xmppAccount.$inferSelect): XmppAccount => ({
  ...row,
  integrationId: "xmpp" as const,
  metadata: (row.metadata as Record<string, unknown> | undefined) ?? undefined,
});

export const xmppIntegration = new XmppIntegration();

/**
 * Register the XMPP integration in the registry.
 */
export function registerXmppIntegration(): void {
  getIntegrationRegistry().register(xmppIntegration);
}
