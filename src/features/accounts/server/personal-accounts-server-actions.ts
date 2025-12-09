"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDrizzleSupabaseClient } from "~/core/database/supabase/clients/drizzle-client";
import { accounts } from "~/core/database/supabase/drizzle/schema";
import { getLogger } from "~/shared/logger";
import { enhanceAction } from "~/shared/next/actions";
import { revalidateAccountSettings } from "~/shared/next/actions/revalidate-account-paths";
import { updateAccountPictureInDatabase } from "~/shared/next/actions/update-account-picture";

import { DeletePersonalAccountSchema } from "../schema/delete-personal-account.schema";
import { createDeletePersonalAccountService } from "./services/delete-personal-account.service";

const enableAccountDeletion =
  process.env.NEXT_PUBLIC_ENABLE_PERSONAL_ACCOUNT_DELETION === "true";

export async function refreshAuthSession() {
  // NextAuth handles session refresh automatically
  return {};
}

/**
 * Update account picture URL
 */
export async function updateAccountPictureUrlAction(
  accountId: string,
  pictureUrl: string | null
) {
  await updateAccountPictureInDatabase(accountId, pictureUrl);
  revalidateAccountSettings();
}

/**
 * Update account data (name, public_data, etc.)
 */
export async function updateAccountDataAction(
  accountId: string,
  data: {
    name?: string | null;
    public_data?: Record<string, unknown> | null;
  }
) {
  const drizzleClient = await getDrizzleSupabaseClient();

  await drizzleClient.runTransaction(async (tx) => {
    const updateData: {
      name?: string;
      publicData?: Record<string, unknown>;
    } = {};

    if (data.name !== undefined) {
      updateData.name = data.name ?? undefined;
    }
    if (data.public_data !== undefined) {
      updateData.publicData = data.public_data ?? undefined;
    }

    await tx.update(accounts).set(updateData).where(eq(accounts.id, accountId));
  });

  revalidateAccountSettings();
}

/**
 * Get personal account data
 */
export async function getPersonalAccountDataAction(userId: string) {
  const drizzleClient = await getDrizzleSupabaseClient();

  const result = (await drizzleClient.runTransaction(
    async (tx) =>
      await tx
        .select({
          id: accounts.id,
          name: accounts.name,
          pictureUrl: accounts.pictureUrl,
          publicData: accounts.publicData,
        })
        .from(accounts)
        .where(eq(accounts.primaryOwnerUserId, userId))
        .where(eq(accounts.isPersonalAccount, true))
        .limit(1)
  )) as Array<{
    id: string;
    name: string | null;
    pictureUrl: string | null;
    publicData: Record<string, unknown> | null;
  }>;

  if (result.length === 0) {
    return null;
  }

  const account = result[0];
  if (!account) {
    return null;
  }

  return {
    id: account.id,
    name: account.name,
    picture_url: account.pictureUrl,
    public_data: account.publicData,
  };
}

export const deletePersonalAccountAction = enhanceAction(
  async (formData: FormData, user) => {
    const logger = await getLogger();

    // validate the form data
    const { success } = DeletePersonalAccountSchema.safeParse(
      Object.fromEntries(formData.entries())
    );

    if (!success) {
      throw new Error("Invalid form data");
    }

    const ctx = {
      name: "account.delete",
      userId: user.id,
    };

    if (!enableAccountDeletion) {
      logger.warn(ctx, "Account deletion is not enabled");

      throw new Error("Account deletion is not enabled");
    }

    logger.info(ctx, "Deleting account... (OTP verification removed)");

    // create a new instance of the personal accounts service
    const service = createDeletePersonalAccountService();

    // delete the user's account and cancel all subscriptions
    await service.deletePersonalAccount({
      account: {
        id: user.id,
        email: user.email ?? null,
      },
    });

    // sign out the user after deleting their account
    // NextAuth will handle sign out via redirect

    logger.info(ctx, "Account request successfully sent");

    // clear the cache for all pages
    revalidatePath("/", "layout");

    // redirect to the home page
    redirect("/");
  },
  {}
);
