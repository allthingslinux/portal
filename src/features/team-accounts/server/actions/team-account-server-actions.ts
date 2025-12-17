"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "~/core/database/client";
import { accounts } from "~/core/database/schema";
import { getLogger } from "~/shared/logger";
import { enhanceAction } from "~/shared/next/actions";
import {
  revalidateAccountLayout,
  revalidateTeamAccountSettings,
} from "~/shared/next/actions/revalidate-account-paths";
import { updateAccountPictureInDatabase } from "~/shared/next/actions/update-account-picture";

import { CreateTeamSchema } from "../../schema/create-team.schema";
import { DeleteTeamAccountSchema } from "../../schema/delete-team-account.schema";
import { LeaveTeamAccountSchema } from "../../schema/leave-team-account.schema";
import { UpdateTeamNameSchema } from "../../schema/update-team-name.schema";
import { createCreateTeamAccountService } from "../services/create-team-account.service";
import { createDeleteTeamAccountService } from "../services/delete-team-account.service";
import { createLeaveTeamAccountService } from "../services/leave-team-account.service";
import { createUpdateTeamAccountService } from "../services/update-team-account.service";

/**
 * Update team account picture URL
 */
export async function updateTeamAccountPictureUrlAction(
  accountId: string,
  pictureUrl: string | null
) {
  await updateAccountPictureInDatabase(accountId, pictureUrl);
  revalidateTeamAccountSettings();
}

/**
 * Update team account name
 */
export const updateTeamAccountName = enhanceAction(
  async (params) => {
    const service = createUpdateTeamAccountService();
    const logger = await getLogger();
    const { name, path, slug } = params;

    const ctx = {
      name: "team-accounts.update",
      accountName: name,
    };

    logger.info(ctx, "Updating team name...");

    const result = await service.updateTeamName({ name, slug });
    const newSlug = result.slug;

    logger.info(ctx, "Team name updated");

    if (newSlug) {
      const nextPath = path.replace("[account]", newSlug);

      redirect(nextPath);
    }

    return { success: true };
  },
  {
    schema: UpdateTeamNameSchema,
  }
);

/**
 * Create a new team account
 */
export const createTeamAccountAction = enhanceAction(
  async ({ name }, user) => {
    const logger = await getLogger();
    const service = createCreateTeamAccountService();

    const ctx = {
      name: "team-accounts.create",
      userId: user.id,
      accountName: name,
    };

    logger.info(ctx, "Creating team account...");

    const { data, error } = await service.createNewOrganizationAccount({
      name,
      userId: user.id,
    });

    if (error) {
      logger.error({ ...ctx, error }, "Failed to create team account");

      return {
        error: true,
      };
    }

    logger.info(ctx, "Team account created");

    const accountHomePath = `/home/${data.slug}`;

    redirect(accountHomePath);
  },
  {
    schema: CreateTeamSchema,
  }
);

/**
 * Delete a team account
 */
export const deleteTeamAccountAction = enhanceAction(
  async (formData: FormData, user) => {
    const logger = await getLogger();

    const params = DeleteTeamAccountSchema.parse(
      Object.fromEntries(formData.entries())
    );

    const ctx = {
      name: "team-accounts.delete",
      userId: user.id,
      accountId: params.accountId,
    };

    const enableTeamAccountDeletion =
      process.env.NEXT_PUBLIC_ENABLE_TEAM_ACCOUNTS_DELETION === "true";

    if (!enableTeamAccountDeletion) {
      logger.warn(ctx, "Team account deletion is not enabled");

      throw new Error("Team account deletion is not enabled");
    }

    logger.info(ctx, "Deleting team account...");

    await deleteTeamAccount({
      accountId: params.accountId,
      userId: user.id,
    });

    logger.info(ctx, "Team account request successfully sent");

    return redirect("/home");
  },
  {
    auth: true,
  }
);

/**
 * Leave a team account
 */
export const leaveTeamAccountAction = enhanceAction(
  async (formData: FormData, user) => {
    const body = Object.fromEntries(formData.entries());
    const params = LeaveTeamAccountSchema.parse(body);

    const service = createLeaveTeamAccountService();

    await service.leaveTeamAccount({
      accountId: params.accountId,
      userId: user.id,
    });

    revalidateAccountLayout();

    return redirect("/home");
  },
  {}
);

async function deleteTeamAccount(params: {
  accountId: string;
  userId: string;
}) {
  const service = createDeleteTeamAccountService();

  // verify that the user has the necessary permissions to delete the team account
  await assertUserPermissionsToDeleteTeamAccount(
    params.accountId,
    params.userId
  );

  // delete the team account
  await service.deleteTeamAccount(params);
}

async function assertUserPermissionsToDeleteTeamAccount(
  accountId: string,
  userId: string
) {
  const result = await db
    .select({ count: accounts.id })
    .from(accounts)
    .where(
      and(eq(accounts.id, accountId), eq(accounts.primaryOwnerUserId, userId))
    )
    .limit(1);

  const isOwner = result.length > 0;

  if (!isOwner) {
    throw new Error("You do not have permission to delete this account");
  }

  return isOwner;
}
