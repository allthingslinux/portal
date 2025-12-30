"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getLogger } from "~/shared/logger";
import { enhanceAction } from "~/shared/next/actions";

import {
  BanUserSchema,
  DeleteAccountSchema,
  DeleteUserSchema,
  ImpersonateUserSchema,
  ReactivateUserSchema,
} from "./schema/admin-actions.schema";
import { createAdminAccountsService } from "./services/admin-accounts.service";
import { createAdminAuthUserService } from "./services/admin-auth-user.service";
import { adminAction } from "./utils/admin-action";

export type ImpersonationTokens = {
  accessToken: string;
  refreshToken: string;
};

/**
 * @name banUserAction
 * @description Ban a user from the system.
 */
export const banUserAction = adminAction(
  enhanceAction(
    async ({ userId }) => {
      const service = getAdminAuthService();
      const logger = await getLogger();

      logger.info({ userId }, "Super Admin is banning user...");

      try {
        await service.banUser(userId);
      } catch (error) {
        logger.error({ error }, "Error banning user");
        return { success: false };
      }

      revalidateAdmin();
      logger.info({ userId }, "Super Admin has successfully banned user");
    },
    { schema: BanUserSchema }
  )
);

/**
 * @name reactivateUserAction
 * @description Reactivate a user in the system.
 */
export const reactivateUserAction = adminAction(
  enhanceAction(
    async ({ userId }) => {
      const service = getAdminAuthService();
      const logger = await getLogger();

      logger.info({ userId }, "Super Admin is reactivating user...");

      try {
        await service.reactivateUser(userId);
      } catch (error) {
        logger.error({ error }, "Error reactivating user");
        return { success: false };
      }

      revalidateAdmin();
      logger.info({ userId }, "Super Admin has successfully reactivated user");
    },
    { schema: ReactivateUserSchema }
  )
);

/**
 * @name impersonateUserAction
 * @description Impersonate a user in the system.
 */
export const impersonateUserAction = adminAction(
  enhanceAction(
    async ({ userId }): Promise<ImpersonationTokens> => {
      const service = getAdminAuthService();
      const logger = await getLogger();

      logger.info({ userId }, "Super Admin is impersonating user...");

      try {
        return await service.impersonateUser(userId);
      } catch (error) {
        logger.error({ error }, "Error impersonating user");
        throw error;
      }
    },
    { schema: ImpersonateUserSchema }
  )
);

/**
 * @name deleteUserAction
 * @description Delete a user from the system.
 */
export const deleteUserAction = adminAction(
  enhanceAction(
    async ({ userId }) => {
      const service = getAdminAuthService();
      const logger = await getLogger();

      logger.info({ userId }, "Super Admin is deleting user...");
      await service.deleteUser(userId);
      logger.info({ userId }, "Super Admin has successfully deleted user");

      return redirect("/admin/accounts");
    },
    { schema: DeleteUserSchema }
  )
);

/**
 * @name deleteAccountAction
 * @description Delete an account from the system.
 */
export const deleteAccountAction = adminAction(
  enhanceAction(
    async ({ accountId }) => {
      const service = getAdminAccountsService();
      const logger = await getLogger();

      logger.info({ accountId }, "Super Admin is deleting account...");
      await service.deleteAccount(accountId);
      revalidateAdmin();
      logger.info(
        { accountId },
        "Super Admin has successfully deleted account"
      );

      return redirect("/admin/accounts");
    },
    { schema: DeleteAccountSchema }
  )
);

function revalidateAdmin() {
  revalidatePath("/admin/accounts/[id]", "page");
}

function getAdminAuthService() {
  return createAdminAuthUserService();
}

function getAdminAccountsService() {
  return createAdminAccountsService();
}
