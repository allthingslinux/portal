import "server-only";
import { randomUUID } from "node:crypto";
import type { z } from "zod";
import { and, eq, ne } from "drizzle-orm";

import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { mailcowAccount } from "@/db/schema/mailcow";
import {
  createMailbox,
  deleteMailbox,
  getDomain,
  getMailbox,
  updateMailbox,
} from "./client";
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
import { IntegrationBase } from "@/features/integrations/lib/core/base";
import { getIntegrationRegistry } from "@/features/integrations/lib/core/registry";
import type { IntegrationCreateInput } from "@/features/integrations/lib/core/types";
import {
  CreateMailboxRequestSchema,
  MailcowAccountSchema,
  UpdateMailboxRequestSchema,
} from "@/shared/schemas/integrations/mailcow";

async function syncStatusToMailcow(
  email: string,
  status: "active" | "suspended"
): Promise<void> {
  const active = status === "active" ? "1" : "0";
  try {
    await updateMailbox(email, { active });
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
  constructor() {
    super({
      id: "mailcow",
      name: "mailcow",
      description: "Email mailboxes (mailcow)",
      enabled: isMailcowConfigured(),
      createAccountSchema: CreateMailboxRequestSchema,
      updateAccountSchema: UpdateMailboxRequestSchema,
      accountSchema:
        MailcowAccountSchema as unknown as z.ZodType<MailcowAccountType>,
    });
  }

  async createAccount(
    userId: string,
    input: IntegrationCreateInput
  ): Promise<MailcowAccountType> {
    if (!this.enabled) {
      throw new Error("mailcow integration is not configured");
    }

    const parsed = CreateMailboxRequestSchema.safeParse(input);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Invalid input";
      throw new Error(msg);
    }

    validateMailcowConfig();
    const domain = mailcowConfig.domain;
    if (!domain) {
      throw new Error("MAILCOW_DOMAIN is not configured");
    }
    const { local_part, password } = parsed.data;

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
      throw new Error("User already has a mailcow account");
    }

    const email = formatEmail(local_part, domain);

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
      throw new Error("This email address is already taken");
    }

    const mailboxExists = await getMailbox(email);
    if (mailboxExists) {
      throw new Error("This email address already exists in mailcow");
    }

    const domainCheck = await getDomain(domain);
    const hasDomain =
      domainCheck &&
      (Array.isArray(domainCheck) ? domainCheck.length > 0 : true);
    if (!hasDomain) {
      throw new Error(`Domain ${domain} does not exist in mailcow`);
    }

    const [userData] = await db
      .select({ email: user.email, name: user.name })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!userData) {
      throw new Error("User not found");
    }

    const name = userData.name ?? userData.email?.split("@")[0] ?? local_part;

    try {
      await createMailbox(domain, local_part, password, name);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Failed to create mailbox in mailcow: ${error.message}`
        );
      }
      throw new Error("Failed to create mailbox in mailcow");
    }

    const id = randomUUID();
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
      try {
        await deleteMailbox(email);
      } catch {
        // Ignore rollback errors
      }
      throw new Error("Failed to create mailcow account record");
    }

    return rowToAccount(newAccount);
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

    return account ? rowToAccount(account) : null;
  }

  async getAccountById(accountId: string): Promise<MailcowAccountType | null> {
    const [account] = await db
      .select()
      .from(mailcowAccount)
      .where(
        and(
          eq(mailcowAccount.id, accountId),
          ne(mailcowAccount.status, "deleted")
        )
      )
      .limit(1);

    return account ? rowToAccount(account) : null;
  }

  async updateAccount(
    accountId: string,
    input: UpdateMailboxRequest
  ): Promise<MailcowAccountType> {
    const parsed = UpdateMailboxRequestSchema.safeParse(input);
    if (!parsed.success) {
      throw new Error("Invalid update request");
    }
    const data = parsed.data;

    const [account] = await db
      .select()
      .from(mailcowAccount)
      .where(
        and(
          eq(mailcowAccount.id, accountId),
          ne(mailcowAccount.status, "deleted")
        )
      )
      .limit(1);

    if (!account) {
      throw new Error("mailcow account not found");
    }

    const updates: Partial<typeof mailcowAccount.$inferInsert> = {};
    if (data.status && data.status !== account.status) {
      updates.status = data.status;
      await syncStatusToMailcow(account.email, data.status);
    }

    if (data.metadata !== undefined) {
      updates.metadata = data.metadata;
    }

    if (Object.keys(updates).length === 0) {
      throw new Error("No valid updates provided");
    }

    const [updated] = await db
      .update(mailcowAccount)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(mailcowAccount.id, accountId),
          ne(mailcowAccount.status, "deleted")
        )
      )
      .returning();

    if (!updated) {
      throw new Error("Failed to update mailcow account");
    }

    return rowToAccount(updated);
  }

  async deleteAccount(accountId: string): Promise<void> {
    if (!this.enabled) {
      throw new Error("mailcow integration is not configured");
    }
    validateMailcowConfig();

    const [account] = await db
      .select()
      .from(mailcowAccount)
      .where(
        and(
          eq(mailcowAccount.id, accountId),
          ne(mailcowAccount.status, "deleted")
        )
      )
      .limit(1);

    if (!account) {
      return;
    }

    try {
      await deleteMailbox(account.email);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Failed to delete mailbox from mailcow: ${error.message}`
        );
      }
      throw new Error("Failed to delete mailbox from mailcow");
    }

    await db
      .update(mailcowAccount)
      .set({
        status: "deleted",
        updatedAt: new Date(),
      })
      .where(eq(mailcowAccount.id, accountId));
  }
}

function rowToAccount(
  row: typeof mailcowAccount.$inferSelect
): MailcowAccountType {
  return {
    ...row,
    integrationId: "mailcow" as const,
    metadata:
      (row.metadata as Record<string, unknown> | undefined) ?? undefined,
  };
}

export const mailcowIntegration = new MailcowIntegration();

export function registerMailcowIntegration(): void {
  getIntegrationRegistry().register(mailcowIntegration);
}
