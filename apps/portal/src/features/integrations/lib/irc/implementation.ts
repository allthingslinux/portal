import "server-only";
import { randomUUID } from "node:crypto";
import type { z } from "zod";
import { APIError } from "@portal/api/utils";
import { db } from "@portal/db/client";
import { user } from "@portal/db/schema/auth";
import { ircAccount } from "@portal/db/schema/irc";
import {
  CreateIrcAccountRequestSchema,
  IrcAccountSchema,
  UpdateIrcAccountRequestSchema,
} from "@portal/schemas/integrations/irc";
import * as Sentry from "@sentry/nextjs";
import { and, eq, ne } from "drizzle-orm";

import {
  AthemeFaultError,
  fdropNick,
  registerNick,
  resetNickPassword,
  setVhost,
} from "./atheme/client";
import { ircConfig, isAthemeOperConfigured, isIrcConfigured } from "./config";
import type { IrcAccount, UpdateIrcAccountRequest } from "./types";
import { generateIrcPassword } from "./utils";
import { IntegrationBase } from "@/features/integrations/lib/core/base";
import { getIntegrationRegistry } from "@/features/integrations/lib/core/registry";
import type { IntegrationCreateInput } from "@/features/integrations/lib/core/types";

// Schemas are now imported from @portal/schemas/integrations/irc

const IRC_SERVER_PREFIX_RE = /^irc\./;

/**
 * IRC integration implementation (Atheme NickServ provisioning, soft-delete only).
 */
export class IrcIntegration extends IntegrationBase<
  IrcAccount & { temporaryPassword?: string },
  IntegrationCreateInput,
  UpdateIrcAccountRequest
> {
  constructor() {
    super({
      id: "irc",
      name: "IRC",
      description:
        "Register a nick on irc.atl.chat and connect to our community IRC network.",
      enabled: isIrcConfigured(),
      createAccountSchema: CreateIrcAccountRequestSchema,
      updateAccountSchema: UpdateIrcAccountRequestSchema,
      // Cast is safe as IrcAccountSchema matches IrcAccount
      accountSchema: IrcAccountSchema as unknown as z.ZodType<
        IrcAccount & { temporaryPassword?: string }
      >,
    });
  }

  /**
   * Create an IRC account: validate nick, generate password, REGISTER with Atheme, insert irc_account.
   * Returns account with temporaryPassword (one-time; not stored).
   */
  async createAccount(
    userId: string,
    input: IntegrationCreateInput
  ): Promise<IrcAccount & { temporaryPassword: string }> {
    if (!this.enabled) {
      throw new Error("IRC integration is not configured");
    }

    const parsed = CreateIrcAccountRequestSchema.safeParse(input);
    if (!parsed.success) {
      const msg =
        parsed.error.issues[0]?.message ??
        "Invalid input: nick is required and must be valid";
      throw new Error(msg);
    }
    const { nick } = parsed.data;

    await this.ensureUserCanCreateIrcAccount(userId, nick);

    const [userRow] = await db
      .select({ email: user.email })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!userRow?.email) {
      throw new Error("User not found");
    }

    const userProvidedPassword =
      "password" in parsed.data ? parsed.data.password : undefined;
    const temporaryPassword = userProvidedPassword ?? generateIrcPassword();

    const [deletedAccount] = await db
      .select()
      .from(ircAccount)
      .where(
        and(eq(ircAccount.userId, userId), eq(ircAccount.status, "deleted"))
      )
      .limit(1);

    let accountRow: typeof ircAccount.$inferSelect | undefined;

    // 1. Initial DB entry (pending)
    try {
      if (deletedAccount) {
        [accountRow] = await db
          .update(ircAccount)
          .set({
            nick,
            server: ircConfig.server,
            port: ircConfig.port,
            status: "pending",
            updatedAt: new Date(),
          })
          .where(eq(ircAccount.id, deletedAccount.id))
          .returning();
      } else {
        [accountRow] = await db
          .insert(ircAccount)
          .values({
            id: randomUUID(),
            userId,
            nick,
            server: ircConfig.server,
            port: ircConfig.port,
            status: "pending",
          })
          .returning();
      }
    } catch (dbError) {
      Sentry.captureException(dbError, {
        tags: { integration: "irc", step: "db_insert_pending" },
        extra: { userId, nick },
      });
      throw new Error("Failed to initialize IRC account record");
    }

    if (!accountRow) {
      throw new Error("Failed to initialize IRC account record");
    }

    // 2. Atheme registration
    try {
      await this.registerNickWithAtheme(nick, temporaryPassword, userRow.email);
    } catch (athemeError) {
      // Cleanup the pending record on Atheme failure
      try {
        await db.delete(ircAccount).where(eq(ircAccount.id, accountRow.id));
      } catch (cleanupError) {
        Sentry.captureException(cleanupError, {
          tags: { integration: "irc", step: "cleanup_after_atheme_failure" },
          extra: {
            userId,
            accountId: accountRow.id,
            originalError: athemeError,
          },
        });
      }
      throw athemeError;
    }

    // 2b. Set HostServ vhost (non-fatal — account works without vanity vhost)
    if (isAthemeOperConfigured()) {
      try {
        const domain =
          ircConfig.server.replace(IRC_SERVER_PREFIX_RE, "") || "atl.chat";
        await setVhost(nick, `${nick}@${domain}`);
      } catch (vhostError) {
        Sentry.captureException(vhostError, {
          tags: { integration: "irc", step: "set_vhost" },
          extra: { userId, nick },
        });
      }
    }

    // 3. Update to active
    const [finalRow] = await db
      .update(ircAccount)
      .set({
        status: "active",
        updatedAt: new Date(),
      })
      .where(eq(ircAccount.id, accountRow.id))
      .returning();

    if (!finalRow) {
      // This is a rare edge case where Atheme succeeded but final update failed.
      // The account is now orphaned on Atheme but exists in Portal as 'pending'.
      Sentry.captureException(new Error("Failed to activate IRC account"), {
        tags: { integration: "irc", step: "db_activate" },
        extra: { userId, nick, accountId: accountRow.id },
      });
      throw new Error(
        "IRC account registration partially succeeded but failed to activate. Please contact an administrator."
      );
    }

    const account = rowToAccount(finalRow);

    return { ...account, temporaryPassword };
  }

  private async ensureUserCanCreateIrcAccount(
    userId: string,
    nick: string
  ): Promise<void> {
    const [existingActiveAccount] = await db
      .select()
      .from(ircAccount)
      .where(
        and(eq(ircAccount.userId, userId), ne(ircAccount.status, "deleted"))
      )
      .limit(1);

    if (existingActiveAccount) {
      throw new Error("You already have an IRC account");
    }

    const [existingNick] = await db
      .select()
      .from(ircAccount)
      .where(and(eq(ircAccount.nick, nick), ne(ircAccount.status, "deleted")))
      .limit(1);

    if (existingNick) {
      throw new Error("Nick is already taken");
    }
  }

  private async registerNickWithAtheme(
    nick: string,
    password: string,
    email: string
  ): Promise<void> {
    try {
      await Sentry.startSpan(
        {
          op: "rpc.client",
          name: "Atheme registerNick",
          attributes: {
            "irc.server": ircConfig.server,
            "irc.nick_length": String(nick.length),
          },
        },
        async () => {
          await registerNick(nick, password, email);
        }
      );
    } catch (error) {
      Sentry.captureException(error, {
        tags: { integration: "irc", operation: "registerNick" },
        extra: {
          nick,
          faultCode: error instanceof AthemeFaultError ? error.code : undefined,
        },
      });
      if (error instanceof AthemeFaultError) {
        // Map Atheme fault codes to user-friendly 400 errors.
        // Atheme's first command_fail message is what we receive (subsequent
        // messages are dropped by the JSONRPC transport's sent_reply flag).
        const msg = error.fault.message || "IRC registration failed";
        switch (error.code) {
          case 8:
            throw new APIError(
              "Nick is already registered on the IRC network",
              409
            );
          case 2:
            // Atheme returns specific messages for code 2 (e.g. "You cannot
            // use your nickname as a password", "The account name is invalid")
            // — pass them through instead of a generic fallback.
            throw new APIError(msg, 400);
          case 9:
            throw new APIError("Too many registrations; try again later", 429);
          case 6:
            throw new APIError(
              "Account is frozen or you don't have permission to register",
              403
            );
          case 10:
            throw new APIError(
              "Failed to send verification email; please try again later",
              502
            );
          case 11:
            throw new APIError(
              "Account requires email verification before it can be used",
              400
            );
          default:
            throw new APIError(msg, 400);
        }
      }
      throw error instanceof Error
        ? error
        : new Error("Failed to register nick with IRC services");
    }
  }

  async getAccount(userId: string): Promise<IrcAccount | null> {
    const [row] = await db
      .select()
      .from(ircAccount)
      .where(
        and(eq(ircAccount.userId, userId), ne(ircAccount.status, "deleted"))
      )
      .limit(1);

    return row ? rowToAccount(row) : null;
  }

  async getAccountById(accountId: string): Promise<IrcAccount | null> {
    const [row] = await db
      .select()
      .from(ircAccount)
      .where(
        and(eq(ircAccount.id, accountId), ne(ircAccount.status, "deleted"))
      )
      .limit(1);

    return row ? rowToAccount(row) : null;
  }

  async updateAccount(
    accountId: string,
    input: UpdateIrcAccountRequest
  ): Promise<IrcAccount> {
    const parsed = UpdateIrcAccountRequestSchema.safeParse(input);
    if (!parsed.success) {
      throw new Error("Invalid update request");
    }
    const data = parsed.data;

    const [account] = await db
      .select()
      .from(ircAccount)
      .where(
        and(eq(ircAccount.id, accountId), ne(ircAccount.status, "deleted"))
      )
      .limit(1);

    if (!account) {
      throw new Error("IRC account not found");
    }

    const updates: Partial<typeof ircAccount.$inferInsert> = {};

    if (data.status != null && data.status !== account.status) {
      updates.status = data.status;
    }
    if (data.metadata !== undefined) {
      updates.metadata = data.metadata;
    }
    if (data.nick != null && data.nick.trim() !== account.nick) {
      throw new Error(
        "Nick cannot be changed. Delete your account and create a new one with the desired nick."
      );
    }

    if (Object.keys(updates).length === 0) {
      return rowToAccount(account);
    }

    const [updated] = await db
      .update(ircAccount)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(ircAccount.id, accountId))
      .returning();

    if (!updated) {
      throw new Error("Failed to update IRC account");
    }

    return rowToAccount(updated);
  }

  /**
   * Delete an IRC account: attempt Atheme FDROP if oper credentials are configured,
   * then soft-delete the DB record.
   */
  async deleteAccount(accountId: string): Promise<void> {
    const [account] = await db
      .select()
      .from(ircAccount)
      .where(eq(ircAccount.id, accountId))
      .limit(1);

    if (!account) {
      return;
    }

    // Attempt to drop the NickServ registration if oper creds are available.
    // Failure is non-fatal — we still soft-delete the portal record.
    if (isAthemeOperConfigured()) {
      try {
        await fdropNick(account.nick);
      } catch (error) {
        Sentry.captureException(error, {
          tags: { integration: "irc", step: "fdrop_on_delete" },
          extra: { accountId, nick: account.nick },
        });
      }
    }

    const [updated] = await db
      .update(ircAccount)
      .set({ status: "deleted", updatedAt: new Date() })
      .where(eq(ircAccount.id, accountId))
      .returning();

    if (!updated) {
      throw new Error("Failed to delete IRC account");
    }
  }

  /**
   * Reset the NickServ password for an IRC account.
   * If `newPassword` is provided, uses a two-step approach (RESETPASS → login as target → SET PASSWORD).
   * If omitted, just does RESETPASS and returns the random password Atheme generates.
   * Requires IRC_ATHEME_OPER_ACCOUNT + IRC_ATHEME_OPER_PASSWORD to be configured.
   *
   * @returns The final password (user-chosen or random)
   */
  async resetPassword(
    accountId: string,
    newPassword?: string
  ): Promise<string> {
    if (!this.enabled) {
      throw new APIError("IRC integration is not configured", 503);
    }

    if (!isAthemeOperConfigured()) {
      throw new APIError(
        "IRC password reset requires oper credentials to be configured",
        503
      );
    }

    const [account] = await db
      .select()
      .from(ircAccount)
      .where(
        and(eq(ircAccount.id, accountId), ne(ircAccount.status, "deleted"))
      )
      .limit(1);

    if (!account) {
      throw new APIError("IRC account not found", 404);
    }

    try {
      return await resetNickPassword(account.nick, newPassword);
    } catch (error) {
      Sentry.captureException(error, {
        tags: { integration: "irc", operation: "resetPassword" },
        extra: { accountId, nick: account.nick },
      });
      if (error instanceof AthemeFaultError) {
        const msg = error.fault.message || "Failed to reset IRC password";
        switch (error.code) {
          case 3:
            throw new APIError(
              "Nick is not registered on the IRC network",
              404
            );
          case 2:
            throw new APIError(msg, 400);
          default:
            throw new APIError(msg, 400);
        }
      }
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError("Failed to reset IRC password", 502);
    }
  }
}

function rowToAccount(row: typeof ircAccount.$inferSelect): IrcAccount {
  return {
    id: row.id,
    userId: row.userId,
    integrationId: "irc",
    nick: row.nick,
    server: row.server,
    port: row.port,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    metadata:
      (row.metadata as Record<string, unknown> | undefined) ?? undefined,
  };
}

export const ircIntegration = new IrcIntegration();

export function registerIrcIntegration(): void {
  getIntegrationRegistry().register(ircIntegration);
}
