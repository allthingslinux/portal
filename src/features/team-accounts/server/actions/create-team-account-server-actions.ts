'use server';

import { redirect } from 'next/navigation';

import { enhanceAction } from '~/shared/next/actions';
import { getLogger } from '~/shared/logger';

import { CreateTeamSchema } from '../../schema/create-team.schema';
import { createCreateTeamAccountService } from '../services/create-team-account.service';

export const createTeamAccountAction = enhanceAction(
  async ({ name }, user) => {
    const logger = await getLogger();
    const service = createCreateTeamAccountService();

    const ctx = {
      name: 'team-accounts.create',
      userId: user.id,
      accountName: name,
    };

    logger.info(ctx, `Creating team account...`);

    const { data, error } = await service.createNewOrganizationAccount({
      name,
      userId: user.id,
    });

    if (error) {
      logger.error({ ...ctx, error }, `Failed to create team account`);

      return {
        error: true,
      };
    }

    logger.info(ctx, `Team account created`);

    const accountHomePath = '/home/' + data.slug;

    redirect(accountHomePath);
  },
  {
    schema: CreateTeamSchema,
  },
);
