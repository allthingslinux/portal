"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getLogger } from "~/shared/logger";
import { enhanceAction } from "~/shared/next/actions";
import { revalidateAccountSettings } from "~/shared/next/actions/revalidate-account-paths";
import { updateAccountPictureInDatabase } from "~/shared/next/actions/update-account-picture";

import { DeletePersonalAccountSchema } from "../schema/delete-personal-account.schema";
import { createDeletePersonalAccountService } from "./services/delete-personal-account.service";
import { createPersonalAccountsService } from "./services/personal-accounts.service";

const enableAccountDeletion =
  process.env.NEXT_PUBLIC_ENABLE_PERSONAL_ACCOUNT_DELETION === "true";

/**
 * Update account picture URL
 */
export const updateAccountPictureUrlAction = enhanceAction(
  async (params, user) => {
    await updateAccountPictureInDatabase(
      params.accountId,
      params.pictureUrl,
      user.id
    );
    revalidateAccountSettings();
  },
  {
    schema: z.object({
      accountId: z.string().uuid(),
      pictureUrl: z.string().url().nullable(),
    }),
  }
);

/**
 * Update account data (name, public_data, etc.)
 */
export const updateAccountDataAction = enhanceAction(
  async (params, user) => {
    const service = createPersonalAccountsService();

    await service.updateAccount(params.accountId, user.id, {
      name: params.name ?? undefined,
      publicData: params.public_data ?? undefined,
    });

    revalidateAccountSettings();
  },
  {
    schema: z.object({
      accountId: z.string().uuid(),
      name: z.string().min(2).max(100).optional(),
      public_data: z.record(z.string(), z.any()).optional(),
    }),
  }
);

/**
 * Get personal account data
 */
export const getPersonalAccountDataAction = enhanceAction(
  async (_, user) => {
    const service = createPersonalAccountsService();
    return service.getAccount(user.id);
  },
  {
    schema: z.any(),
  }
);

/**
 * Delete personal account
 */
export const deletePersonalAccountAction = enhanceAction(
  async (formData: FormData, user) => {
    const logger = await getLogger();

    const { success } = DeletePersonalAccountSchema.safeParse(
      Object.fromEntries(formData.entries())
    );

    if (!(success && enableAccountDeletion)) {
      throw new Error("Invalid request or deletion disabled");
    }

    const service = createDeletePersonalAccountService();

    await service.deletePersonalAccount({
      account: { id: user.id, email: user.email ?? null },
    });

    logger.info({ userId: user.id }, "Account deletion request sent");

    revalidatePath("/", "layout");
    redirect("/");
  },
  {}
);
