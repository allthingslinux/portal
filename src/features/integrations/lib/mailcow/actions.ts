"use server";

import { revalidatePath } from "next/cache";
import type { z } from "zod";

import { log } from "../../../../shared/observability";
import {
  CreateAliasRequestSchema,
  CreateAppPasswordRequestSchema,
} from "../../../../shared/schemas/integrations/mailcow";
import { mailcowIntegration } from "./implementation";
import type { MailcowAlias, MailcowAppPassword } from "./types";

/**
 * App Passwords
 */

export async function getAppPasswords(
  accountId: string
): Promise<MailcowAppPassword[]> {
  try {
    return await mailcowIntegration.getAppPasswords(accountId);
  } catch (error) {
    log.error("Failed to get app passwords", {
      accountId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

export async function createAppPassword(accountId: string, name: string) {
  try {
    const parsed = CreateAppPasswordRequestSchema.parse({ name });
    const result = await mailcowIntegration.createAppPassword(
      accountId,
      parsed.name
    );
    revalidatePath("/app/mail");
    log.info("App password created", { accountId, name });
    return result;
  } catch (error) {
    log.error("Failed to create app password", {
      accountId,
      name,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

export async function deleteAppPassword(
  accountId: string,
  passwordId: string | number
) {
  try {
    await mailcowIntegration.deleteAppPassword(accountId, passwordId);
    revalidatePath("/app/mail");
    log.info("App password deleted", { accountId, passwordId });
  } catch (error) {
    log.error("Failed to delete app password", {
      accountId,
      passwordId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Aliases
 */

export async function getAliases(accountId: string): Promise<MailcowAlias[]> {
  try {
    return await mailcowIntegration.getAliases(accountId);
  } catch (error) {
    log.error("Failed to get aliases", {
      accountId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

export async function createAlias(
  accountId: string,
  data: z.infer<typeof CreateAliasRequestSchema>
) {
  try {
    const parsed = CreateAliasRequestSchema.parse(data);
    await mailcowIntegration.createAlias(
      accountId,
      parsed.address,
      parsed.goto,
      parsed.active,
      parsed.public_comment
    );
    revalidatePath("/app/mail");
    log.info("Alias created", { accountId, address: data.address });
  } catch (error) {
    log.error("Failed to create alias", {
      accountId,
      address: data.address,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

export async function deleteAlias(
  accountId: string,
  aliasId: string | number
): Promise<void> {
  try {
    await mailcowIntegration.deleteAlias(accountId, aliasId);
    revalidatePath("/app/mail");
    log.info("Alias deleted", { accountId, aliasId });
  } catch (error) {
    log.error("Failed to delete alias", {
      accountId,
      aliasId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

export async function getMailboxUsage(
  accountId: string
): Promise<Record<string, unknown>> {
  try {
    return await mailcowIntegration.getMailboxUsage(accountId);
  } catch (error) {
    log.error("Failed to get mailbox usage", {
      accountId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
