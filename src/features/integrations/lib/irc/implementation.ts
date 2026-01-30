import "server-only";

import { randomUUID } from "node:crypto";
import { captureException } from "@sentry/nextjs";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { ircAccount } from "@/db/schema/irc";
import { AthemeFaultError, registerNick } from "./atheme/client";
import { ircConfig, isIrcConfigured } from "./config";
import type {
  CreateIrcAccountRequest,
  IrcAccount,
  UpdateIrcAccountRequest,
} from "./types";
import {
  generateIrcPassword,
  IRC_NICK_MAX_LENGTH,
  isValidIrcNick,
} from "./utils";
import { IntegrationBase } from "@/features/integrations/lib/core/base";
import { getIntegrationRegistry } from "@/features/integrations/lib/core/registry";
import type { IntegrationCreateInput } from "@/features/integrations/lib/core/types";

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

    const nick = (input as CreateIrcAccountRequest)?.nick?.trim();
    if (!nick) {
      throw new Error("Nick is required");
    }
    if (!isValidIrcNick(nick)) {
      throw new Error(
        `Invalid nick. Use letters, digits, or [ ] \\ ^ _ \` { | } ~ - (max ${IRC_NICK_MAX_LENGTH} characters).`
      );
    }

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
    await this.registerNickWithAtheme(nick, temporaryPassword, userRow.email);

    let newRow: typeof ircAccount.$inferSelect | undefined;
    try {
      [newRow] = await db
        .insert(ircAccount)
        .values({
          id: randomUUID(),
          userId,
          nick,
          server: ircConfig.server,
          port: ircConfig.port,
          status: "active",
        })
        .returning();
    } catch (dbError) {
      // DB insert failed after Atheme registration; nick is orphaned on Atheme.
      // Atheme has no unauthenticated DROP API; user must contact admin to recover.
      captureException(dbError, {
        tags: { integration: "irc", step: "db_insert_after_atheme" },
        extra: { userId, nick },
      });
      throw new Error(
        "Failed to create IRC account record. The nick may have been registered—please contact an administrator if you cannot retry."
      );
    }

    if (!newRow) {
      throw new Error("Failed to create IRC account record");
    }

    const account: IrcAccount = {
      id: newRow.id,
      userId: newRow.userId,
      integrationId: "irc",
      nick: newRow.nick,
      server: newRow.server,
      port: newRow.port,
      status: newRow.status,
      createdAt: newRow.createdAt,
      updatedAt: newRow.updatedAt,
      metadata:
        (newRow.metadata as Record<string, unknown> | undefined) ?? undefined,
    };

    return { ...account, temporaryPassword };
  }

  private async ensureUserCanCreateIrcAccount(
    userId: string,
    nick: string
  ): Promise<void> {
    const [existingAccount] = await db
      .select()
      .from(ircAccount)
      .where(eq(ircAccount.userId, userId))
      .limit(1);

    if (existingAccount) {
      throw new Error("You already have an IRC account");
    }

    const [existingNick] = await db
      .select()
      .from(ircAccount)
      .where(eq(ircAccount.nick, nick))
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
      await registerNick(nick, password, email);
    } catch (error) {
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
      .where(eq(ircAccount.userId, userId))
      .limit(1);

    return row ? rowToAccount(row) : null;
  }

  async getAccountById(accountId: string): Promise<IrcAccount | null> {
    const [row] = await db
      .select()
      .from(ircAccount)
      .where(eq(ircAccount.id, accountId))
      .limit(1);

    return row ? rowToAccount(row) : null;
  }

  async updateAccount(
    accountId: string,
    input: UpdateIrcAccountRequest
  ): Promise<IrcAccount> {
    const [account] = await db
      .select()
      .from(ircAccount)
      .where(eq(ircAccount.id, accountId))
      .limit(1);

    if (!account) {
      throw new Error("IRC account not found");
    }

    const updates: Partial<typeof ircAccount.$inferInsert> = {};

    if (input.status != null && input.status !== account.status) {
      updates.status = input.status;
    }
    if (input.metadata !== undefined) {
      updates.metadata = input.metadata;
    }
    if (input.nick != null && input.nick.trim() !== account.nick) {
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
