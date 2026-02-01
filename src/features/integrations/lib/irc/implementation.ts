import "server-only";

import { randomUUID } from "node:crypto";
import * as Sentry from "@sentry/nextjs";
import { and, eq, ne } from "drizzle-orm";

import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { ircAccount } from "@/db/schema/irc";
import { AthemeFaultError, registerNick } from "./atheme/client";
import { ircConfig, isIrcConfigured } from "./config";
import type { IrcAccount, UpdateIrcAccountRequest } from "./types";
import { generateIrcPassword } from "./utils";
import { IntegrationBase } from "@/features/integrations/lib/core/base";
import { getIntegrationRegistry } from "@/features/integrations/lib/core/registry";
import type { IntegrationCreateInput } from "@/features/integrations/lib/core/types";
import {
  CreateIrcAccountRequestSchema,
  UpdateIrcAccountRequestSchema,
} from "@/shared/schemas/integrations/irc";

// Schemas are now imported from @/shared/schemas/integrations/irc

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
      description: "IRC (atl.chat) accounts via NickServ",
      enabled: isIrcConfigured(),
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

    const temporaryPassword = generateIrcPassword();

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
        if (error.code === 8) {
          throw new Error("Nick is already registered on the IRC network");
        }
        if (error.code === 2) {
          throw new Error("Invalid nick or parameters");
        }
        if (error.code === 9) {
          throw new Error("Too many registrations; try again later");
        }
        throw new Error(error.fault.message || "IRC registration failed");
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
   * Soft-delete only; NickServ account remains on Atheme.
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

    const [updated] = await db
      .update(ircAccount)
      .set({ status: "deleted", updatedAt: new Date() })
      .where(eq(ircAccount.id, accountId))
      .returning();

    if (!updated) {
      throw new Error("Failed to delete IRC account");
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
