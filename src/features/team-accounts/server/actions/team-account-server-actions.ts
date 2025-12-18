"use server";

import { redirect } from "next/navigation";
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
import { UpdateTeamPictureSchema } from "../../schema/update-team-picture.schema";
import { createCreateTeamAccountService } from "../services/create-team-account.service";
import { createDeleteTeamAccountService } from "../services/delete-team-account.service";
import { createLeaveTeamAccountService } from "../services/leave-team-account.service";
import { createUpdateTeamAccountService } from "../services/update-team-account.service";

/**
 * Update team account picture URL
 */
export const updateTeamAccountPictureUrlAction = enhanceAction(
  async (params, user) => {
    await updateAccountPictureInDatabase(
      params.accountId,
      params.pictureUrl,
      user.id
    );
    revalidateTeamAccountSettings();
  },
  {
    schema: UpdateTeamPictureSchema,
  }
);

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
    const enableTeamAccountDeletion =
      process.env.NEXT_PUBLIC_ENABLE_TEAM_ACCOUNTS_DELETION === "true";

    const { success, data } = DeleteTeamAccountSchema.safeParse(
      Object.fromEntries(formData.entries())
    );

    if (!success) {
      throw new Error("Invalid request");
    }

    if (!enableTeamAccountDeletion) {
      logger.warn({ userId: user.id }, "Team account deletion is disabled");
      throw new Error("Team account deletion is not enabled");
    }

    const service = createDeleteTeamAccountService();

    await service.deleteTeamAccount({
      accountId: data.accountId,
      userId: user.id,
    });

    redirect("/home");
  },
  {}
);

/**
 * Leave a team account
 */
export const leaveTeamAccountAction = enhanceAction(
  async (formData: FormData, user) => {
    const logger = await getLogger();

    const { success, data } = LeaveTeamAccountSchema.safeParse(
      Object.fromEntries(formData.entries())
    );

    if (!success) {
      throw new Error("Invalid request");
    }

    const ctx = {
      name: "team-accounts.leave",
      userId: user.id,
      accountId: data.accountId,
    };

    logger.info(ctx, "User leaving team account...");

    const service = createLeaveTeamAccountService();

    await service.leaveTeamAccount({
      accountId: data.accountId,
      userId: user.id,
    });

    logger.info(ctx, "User left team account");

    revalidateAccountLayout();

    return redirect("/home");
  },
  {}
);
