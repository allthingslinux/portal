import "server-only";
import type { z } from "zod";
import { APIError } from "@portal/api/utils";
import { db } from "@portal/db/client";
import { mediawikiAccount } from "@portal/db/schema/mediawiki";
import {
  CreateMediaWikiAccountRequestSchema,
  MediaWikiAccountSchema,
  UpdateMediaWikiAccountRequestSchema,
} from "@portal/schemas/integrations/mediawiki";
import * as Sentry from "@sentry/nextjs";
import { and, eq, ne } from "drizzle-orm";

import { mediawikiBotClient } from "./bot-client";
import { isMediaWikiConfigured } from "./keys";
import type { MediaWikiAccount, UpdateMediaWikiAccountRequest } from "./types";
import { IntegrationBase } from "@/features/integrations/lib/core/base";
import { getIntegrationRegistry } from "@/features/integrations/lib/core/registry";
import type { IntegrationCreateInput } from "@/features/integrations/lib/core/types";

function rowToAccount(
  row: typeof mediawikiAccount.$inferSelect
): MediaWikiAccount {
  return {
    id: row.id,
    userId: row.userId,
    integrationId: "mediawiki",
    wikiUsername: row.wikiUsername,
    wikiUserId: row.wikiUserId,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    metadata:
      (row.metadata as Record<string, unknown> | undefined) ?? undefined,
  };
}

export class MediaWikiIntegration extends IntegrationBase<
  MediaWikiAccount & { temporaryPassword?: string },
  IntegrationCreateInput,
  UpdateMediaWikiAccountRequest
> {
  constructor() {
    super({
      id: "mediawiki",
      name: "MediaWiki",
      description:
        "Create an account on atl.wiki and access the community wiki.",
      enabled: isMediaWikiConfigured(),
      createAccountSchema: CreateMediaWikiAccountRequestSchema,
      updateAccountSchema: UpdateMediaWikiAccountRequestSchema,
      accountSchema: MediaWikiAccountSchema as unknown as z.ZodType<
        MediaWikiAccount & { temporaryPassword?: string }
      >,
    });
  }

  /**
   * Create a MediaWiki account: validate username, generate password,
   * create via bot, insert record.
   * Returns account with temporaryPassword (one-time; not stored).
   */
  async createAccount(
    userId: string,
    input: IntegrationCreateInput
  ): Promise<MediaWikiAccount & { temporaryPassword?: string }> {
    if (!this.enabled) {
      throw new Error("MediaWiki integration is not configured");
    }

    const parsed = CreateMediaWikiAccountRequestSchema.safeParse(input);
    if (!parsed.success) {
      const msg =
        parsed.error.issues[0]?.message ??
        "Invalid input: wiki username is required and must be valid";
      throw new Error(msg);
    }
    const { wikiUsername, password: userPassword } = parsed.data;

    // Check no existing active account for this user
    const [existingActive] = await db
      .select()
      .from(mediawikiAccount)
      .where(
        and(
          eq(mediawikiAccount.userId, userId),
          ne(mediawikiAccount.status, "deleted")
        )
      )
      .limit(1);

    if (existingActive) {
      throw new Error("You already have a wiki account");
    }

    // Check wiki username not taken locally
    const [existingUsername] = await db
      .select()
      .from(mediawikiAccount)
      .where(
        and(
          eq(mediawikiAccount.wikiUsername, wikiUsername),
          ne(mediawikiAccount.status, "deleted")
        )
      )
      .limit(1);

    if (existingUsername) {
      throw new Error("This wiki username is already in use");
    }

    // Use user-provided password or generate a temporary one
    const password =
      userPassword?.trim() ||
      `${crypto.randomUUID()}${crypto.randomUUID().slice(0, 8)}`;
    const isUserChosen = !!userPassword?.trim();

    // Insert pending record
    let accountRow: typeof mediawikiAccount.$inferSelect | undefined;

    try {
      [accountRow] = await db
        .insert(mediawikiAccount)
        .values({ userId, wikiUsername, status: "pending" })
        .returning();
    } catch (dbError) {
      Sentry.captureException(dbError, {
        tags: { integration: "mediawiki", step: "db_insert_pending" },
        extra: { userId, wikiUsername },
      });
      throw new Error("Failed to initialize wiki account record");
    }

    if (!accountRow) {
      throw new Error("Failed to initialize wiki account record");
    }

    // Call bot client to create account on MediaWiki
    let botResult: { username: string; userId: number };
    try {
      botResult = await mediawikiBotClient.createAccount(
        wikiUsername,
        password
      );
    } catch (botError) {
      // Cleanup the pending record on bot failure
      try {
        await db
          .delete(mediawikiAccount)
          .where(eq(mediawikiAccount.id, accountRow.id));
      } catch (cleanupError) {
        Sentry.captureException(cleanupError, {
          tags: { integration: "mediawiki", step: "cleanup_after_bot_failure" },
          extra: { userId, accountId: accountRow.id, originalError: botError },
        });
      }

      Sentry.captureException(botError, {
        tags: { integration: "mediawiki", step: "bot_create_account" },
        extra: { userId, wikiUsername },
      });

      if (botError instanceof APIError) {
        throw botError;
      }
      throw new Error("Failed to create wiki account. Please try again.");
    }

    // Update to active with wiki user ID
    const [finalRow] = await db
      .update(mediawikiAccount)
      .set({
        status: "active",
        wikiUserId: botResult.userId,
        updatedAt: new Date(),
      })
      .where(eq(mediawikiAccount.id, accountRow.id))
      .returning();

    if (!finalRow) {
      Sentry.captureException(
        new Error("Failed to activate MediaWiki account"),
        {
          tags: { integration: "mediawiki", step: "db_activate" },
          extra: { userId, wikiUsername, accountId: accountRow.id },
        }
      );
      throw new Error(
        "Wiki account creation partially succeeded but failed to activate. Please contact an administrator."
      );
    }

    return {
      ...rowToAccount(finalRow),
      ...(isUserChosen ? {} : { temporaryPassword: password }),
    };
  }

  async getAccount(userId: string): Promise<MediaWikiAccount | null> {
    const [row] = await db
      .select()
      .from(mediawikiAccount)
      .where(
        and(
          eq(mediawikiAccount.userId, userId),
          ne(mediawikiAccount.status, "deleted")
        )
      )
      .limit(1);

    return row ? rowToAccount(row) : null;
  }

  async getAccountById(accountId: string): Promise<MediaWikiAccount | null> {
    const [row] = await db
      .select()
      .from(mediawikiAccount)
      .where(
        and(
          eq(mediawikiAccount.id, accountId),
          ne(mediawikiAccount.status, "deleted")
        )
      )
      .limit(1);

    return row ? rowToAccount(row) : null;
  }

  async updateAccount(
    accountId: string,
    input: UpdateMediaWikiAccountRequest
  ): Promise<MediaWikiAccount> {
    const parsed = UpdateMediaWikiAccountRequestSchema.safeParse(input);
    if (!parsed.success) {
      throw new Error("Invalid update request");
    }
    const data = parsed.data;

    const [account] = await db
      .select()
      .from(mediawikiAccount)
      .where(
        and(
          eq(mediawikiAccount.id, accountId),
          ne(mediawikiAccount.status, "deleted")
        )
      )
      .limit(1);

    if (!account) {
      throw new Error("Wiki account not found");
    }

    const updates: Partial<typeof mediawikiAccount.$inferInsert> = {};

    if (data.status != null && data.status !== account.status) {
      await this.handleStatusTransition(account, data.status);
      updates.status = data.status;
    }

    if (data.metadata !== undefined) {
      updates.metadata = data.metadata;
    }

    if (
      data.wikiUsername != null &&
      data.wikiUsername.trim() !== account.wikiUsername
    ) {
      throw new Error(
        "Wiki username cannot be changed. Delete your account and create a new one with the desired username."
      );
    }

    if (Object.keys(updates).length === 0) {
      return rowToAccount(account);
    }

    const [updated] = await db
      .update(mediawikiAccount)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(mediawikiAccount.id, accountId))
      .returning();

    if (!updated) {
      throw new Error("Failed to update wiki account");
    }

    return rowToAccount(updated);
  }

  /**
   * Handle MediaWiki block/unblock when account status changes.
   */
  private async handleStatusTransition(
    account: typeof mediawikiAccount.$inferSelect,
    newStatus: string
  ): Promise<void> {
    if (newStatus === "suspended" && account.status === "active") {
      try {
        await mediawikiBotClient.blockUser(
          account.wikiUsername,
          "Account suspended via ATL Portal",
          { autoblock: true }
        );
      } catch (blockError) {
        Sentry.captureException(blockError, {
          tags: { integration: "mediawiki", step: "block_on_suspend" },
          extra: {
            accountId: account.id,
            wikiUsername: account.wikiUsername,
          },
        });
      }
    } else if (newStatus === "active" && account.status === "suspended") {
      try {
        await mediawikiBotClient.unblockUser(
          account.wikiUsername,
          "Account reactivated via ATL Portal"
        );
      } catch (unblockError) {
        Sentry.captureException(unblockError, {
          tags: { integration: "mediawiki", step: "unblock_on_reactivate" },
          extra: {
            accountId: account.id,
            wikiUsername: account.wikiUsername,
          },
        });
      }
    }
  }

  /**
   * Delete a MediaWiki account: attempt block on MediaWiki (non-fatal),
   * then soft-delete the DB record.
   */
  async deleteAccount(accountId: string): Promise<void> {
    const [account] = await db
      .select()
      .from(mediawikiAccount)
      .where(eq(mediawikiAccount.id, accountId))
      .limit(1);

    if (!account) {
      return;
    }

    // Attempt to block the wiki account. Failure is non-fatal.
    try {
      await mediawikiBotClient.blockUser(
        account.wikiUsername,
        "Account deleted via ATL Portal",
        { nocreate: true, autoblock: true }
      );
    } catch (error) {
      Sentry.captureException(error, {
        tags: { integration: "mediawiki", step: "block_on_delete" },
        extra: { accountId, wikiUsername: account.wikiUsername },
      });
    }

    const [updated] = await db
      .update(mediawikiAccount)
      .set({ status: "deleted", updatedAt: new Date() })
      .where(eq(mediawikiAccount.id, accountId))
      .returning();

    if (!updated) {
      throw new Error("Failed to delete wiki account");
    }
  }

  /**
   * Reset the wiki password for a MediaWiki account.
   * Sends a password reset email via the MediaWiki API.
   */
  async resetPassword(accountId: string): Promise<void> {
    if (!this.enabled) {
      throw new APIError("MediaWiki integration is not configured", 503);
    }

    const [account] = await db
      .select()
      .from(mediawikiAccount)
      .where(
        and(
          eq(mediawikiAccount.id, accountId),
          ne(mediawikiAccount.status, "deleted")
        )
      )
      .limit(1);

    if (!account) {
      throw new APIError("Wiki account not found", 404);
    }

    try {
      await mediawikiBotClient.resetPassword(account.wikiUsername);
    } catch (error) {
      Sentry.captureException(error, {
        tags: { integration: "mediawiki", operation: "resetPassword" },
        extra: { accountId, wikiUsername: account.wikiUsername },
      });

      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError("Failed to reset wiki password", 502);
    }
  }
}

export const mediawikiIntegration = new MediaWikiIntegration();

export function registerMediaWikiIntegration(): void {
  getIntegrationRegistry().register(mediawikiIntegration);
}
