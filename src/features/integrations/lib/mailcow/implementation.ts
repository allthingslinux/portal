import "server-only";
import { randomUUID } from "node:crypto";
import type { z } from "zod";
import { and, eq, ne } from "drizzle-orm";

import { APIError } from "../../../../shared/api/utils";
import { db } from "../../../../shared/db";
import { user } from "../../../../shared/db/schema/auth";
import { mailcowAccount } from "../../../../shared/db/schema/mailcow";
import { log } from "../../../../shared/observability";
import {
  CreateMailboxRequestSchema,
  MailcowAccountSchema,
  UpdateMailboxRequestSchema,
} from "../../../../shared/schemas/integrations/mailcow";
import { IntegrationBase } from "../core/base";
import { getIntegrationRegistry } from "../core/registry";
import type { IntegrationCreateInput } from "../core/types";
import * as client from "./client";
import {
  isMailcowConfigured,
  mailcowConfig,
  validateMailcowConfig,
} from "./config";
import type {
  MailcowAccount as MailcowAccountType,
  UpdateMailboxRequest,
} from "./types";
import { formatEmail } from "./utils";

async function syncStatusToMailcow(
  email: string,
  status: "active" | "suspended"
): Promise<void> {
  const active = status === "active" ? "1" : "0";
  try {
    await client.updateMailbox(email, { active });
  } catch (error) {
    const action = status === "active" ? "activate" : "suspend";
    const msg = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to ${action} mailbox in mailcow: ${msg}`);
  }
}

/**
 * mailcow integration implementation.
 */
export class MailcowIntegration extends IntegrationBase<
  MailcowAccountType,
  IntegrationCreateInput,
  UpdateMailboxRequest
> {
  readonly enabled: boolean;

  constructor() {
    super({
      id: "mailcow",
      name: "Mailcow",
      description: "Email mailboxes (mailcow)",
      enabled: isMailcowConfigured(),
      createAccountSchema: CreateMailboxRequestSchema,
      updateAccountSchema: UpdateMailboxRequestSchema,
      accountSchema:
        MailcowAccountSchema as unknown as z.ZodType<MailcowAccountType>,
    });
    this.enabled = isMailcowConfigured();
  }

  async createAccount(
    userId: string,
    input: IntegrationCreateInput
  ): Promise<MailcowAccountType> {
    if (!this.enabled) {
      log.warn("Mailcow integration attempt while disabled", { userId });
      throw new APIError("mailcow integration is not configured", 403);
    }

    const { local_part, password } = this.validateCreateInput(userId, input);

    validateMailcowConfig();
    const domain = mailcowConfig.domain;
    if (!domain) {
      throw new APIError("Mailcow domain is not configured", 500);
    }

    const email = formatEmail(local_part, domain);

    await this.checkAvailability(userId, email, domain);

    const name = await this.getUserDisplayName(userId, local_part);

    try {
      await client.createMailbox(domain, local_part, password, name);
    } catch (error) {
      log.error("Mailcow API mailbox creation failed", {
        userId,
        email,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new APIError(
        `Failed to create mailbox in mailcow: ${
          error instanceof Error ? error.message : "Internal error"
        }`,
        500
      );
    }

    const id = randomUUID();
    log.debug("Inserting mailcow account into database", { userId, email });
    const [newAccount] = await db
      .insert(mailcowAccount)
      .values({
        id,
        userId,
        email,
        domain,
        localPart: local_part,
        status: "active",
      })
      .returning();

    if (!newAccount) {
      log.error("Failed to insert mailcow account into DB", { userId, email });
      try {
        await client.deleteMailbox(email);
      } catch (error) {
        log.error("Failed to rollback mailcow mailbox creation", {
          email,
          error: error instanceof Error ? error.message : String(error),
        });
      }
      throw new APIError("Failed to create mailcow account record", 500);
    }

    log.info("Mailcow account created successfully", { userId, email });
    return this.rowToAccount(newAccount);
  }

  private validateCreateInput(userId: string, input: unknown) {
    const inputData = input as { local_part?: string };
    log.info("Creating mailcow account", {
      userId,
      local_part: inputData.local_part,
    });

    const parsed = CreateMailboxRequestSchema.safeParse(input);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Invalid input";
      log.warn("Mailcow account creation validation failed", {
        userId,
        issues: parsed.error.issues,
      });
      throw new APIError(msg, 400, { issues: parsed.error.issues });
    }
    return parsed.data;
  }

  private async checkAvailability(
    userId: string,
    email: string,
    domain: string
  ) {
    const [existingAccount] = await db
      .select()
      .from(mailcowAccount)
      .where(
        and(
          eq(mailcowAccount.userId, userId),
          ne(mailcowAccount.status, "deleted")
        )
      )
      .limit(1);

    if (existingAccount) {
      throw new APIError("User already has a mailcow account", 400);
    }

    const [existingEmail] = await db
      .select()
      .from(mailcowAccount)
      .where(
        and(
          eq(mailcowAccount.email, email),
          ne(mailcowAccount.status, "deleted")
        )
      )
      .limit(1);

    if (existingEmail) {
      throw new APIError("This email address is already taken", 400);
    }

    const mailbox = await client.getMailbox(email);
    log.info("Availability check: getMailbox result", {
      email,
      exists: !!mailbox,
      mailboxStructure: mailbox ? Object.keys(mailbox) : null,
      mailboxType: mailbox?.type,
    });

    if (mailbox) {
      throw new APIError(
        "This email address already exists in mailcow. Please try a different one.",
        400
      );
    }

    const domainCheck = await client.getDomain(domain);
    log.info("Availability check: getDomain result", {
      domain: mailcowConfig.domain,
      exists: !!domainCheck,
      domainStructure: domainCheck ? Object.keys(domainCheck) : null,
    });

    if (!domainCheck) {
      throw new APIError(
        "Mailcow domain configuration is invalid or the domain does not exist.",
        500
      );
    }
  }

  private async getUserDisplayName(userId: string, localPart: string) {
    const [userData] = await db
      .select({ email: user.email, name: user.name })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!userData) {
      throw new APIError("User not found", 404);
    }

    return userData.name ?? userData.email?.split("@")[0] ?? localPart;
  }

  async getAccount(userId: string): Promise<MailcowAccountType | null> {
    const [account] = await db
      .select()
      .from(mailcowAccount)
      .where(
        and(
          eq(mailcowAccount.userId, userId),
          ne(mailcowAccount.status, "deleted")
        )
      )
      .limit(1);

    if (!account) {
      return null;
    }

    return this.rowToAccount(account);
  }

  async updateAccount(
    accountId: string,
    input: UpdateMailboxRequest
  ): Promise<MailcowAccountType> {
    const parsed = UpdateMailboxRequestSchema.safeParse(input);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Invalid input";
      throw new APIError(msg, 400, { issues: parsed.error.issues });
    }

    const [account] = await db
      .select()
      .from(mailcowAccount)
      .where(eq(mailcowAccount.id, accountId))
      .limit(1);

    if (!account) {
      throw new APIError("Mailcow account not found", 404);
    }

    const { status, password } = parsed.data;

    // Sync status if changed
    if (status && status !== account.status) {
      await syncStatusToMailcow(account.email, status);
    }

    // Sync password if provided
    if (password) {
      try {
        await client.updateMailbox(account.email, { password });
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        throw new APIError(`Failed to update password in mailcow: ${msg}`, 500);
      }
    }

    const [updated] = await db
      .update(mailcowAccount)
      .set({
        status: status ?? account.status,
        updatedAt: new Date(),
      })
      .where(eq(mailcowAccount.id, accountId))
      .returning();

    if (!updated) {
      throw new APIError("Failed to update mailcow account record", 500);
    }

    return this.rowToAccount(updated);
  }

  async deleteAccount(accountId: string): Promise<void> {
    const [account] = await db
      .select()
      .from(mailcowAccount)
      .where(eq(mailcowAccount.id, accountId))
      .limit(1);

    if (!account) {
      throw new APIError("Mailcow account not found", 404);
    }

    try {
      await client.deleteMailbox(account.email);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      // If mailbox is already gone, we can continue
      if (!msg.toLowerCase().includes("not found")) {
        throw new APIError(
          `Failed to delete mailbox from mailcow: ${msg}`,
          500
        );
      }
    }

    await db
      .update(mailcowAccount)
      .set({
        status: "deleted",
        updatedAt: new Date(),
      })
      .where(eq(mailcowAccount.id, accountId));
  }

  private rowToAccount(
    row: typeof mailcowAccount.$inferSelect
  ): MailcowAccountType {
    return {
      id: row.id,
      userId: row.userId,
      integrationId: "mailcow",
      email: row.email,
      domain: row.domain,
      localPart: row.localPart,
      status: row.status as MailcowAccountType["status"],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  /**
   * App Passwords
   */
  async getAppPasswords(accountId: string) {
    const account = await this.getAccountById(accountId);
    if (!account) {
      throw new APIError("Account not found", 404);
    }
    return await client.getAppPasswords(account.email);
  }

  async createAppPassword(accountId: string, name: string) {
    const account = await this.getAccountById(accountId);
    if (!account) {
      throw new APIError("Account not found", 404);
    }
    return await client.createAppPassword(account.email, name);
  }

  async deleteAppPassword(accountId: string, passwordId: string | number) {
    const account = await this.getAccountById(accountId);
    if (!account) {
      throw new APIError("Account not found", 404);
    }
    return await client.deleteAppPassword(account.email, passwordId);
  }

  /**
   * Aliases
   */
  async getAliases(accountId: string) {
    const account = await this.getAccountById(accountId);
    if (!account) {
      throw new APIError("Account not found", 404);
    }
    return await client.getAliases(account.email);
  }

  async createAlias(
    accountId: string,
    address: string,
    goto: string,
    active = true,
    publicComment?: string
  ) {
    const account = await this.getAccountById(accountId);
    if (!account) {
      throw new APIError("Account not found", 404);
    }

    // Security check: ensure alias is created for the correct user/mailbox domain
    if (!address.endsWith(`@${account.domain}`)) {
      throw new APIError(
        `Alias must be in your domain (@${account.domain})`,
        400
      );
    }

    return await client.createAlias(address, goto, active, publicComment);
  }

  async deleteAlias(accountId: string, aliasId: string | number) {
    const account = await this.getAccountById(accountId);
    if (!account) {
      throw new APIError("Account not found", 404);
    }
    // Security check could be added here to verify alias belongs to account
    return await client.deleteAlias(aliasId);
  }

  async getMailboxUsage(accountId: string) {
    const account = await this.getAccountById(accountId);
    if (!account) {
      throw new APIError("Account not found", 404);
    }
    return await client.getMailboxUsage(account.email);
  }

  async getAccountById(accountId: string): Promise<MailcowAccountType | null> {
    const [acc] = await db
      .select()
      .from(mailcowAccount)
      .where(eq(mailcowAccount.id, accountId))
      .limit(1);

    if (!acc) {
      return null;
    }

    return this.rowToAccount(acc);
  }
}

export const mailcowIntegration = new MailcowIntegration();

export function registerMailcowIntegration() {
  getIntegrationRegistry().register(mailcowIntegration);
}
