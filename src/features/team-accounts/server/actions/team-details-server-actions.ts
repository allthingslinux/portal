'use server';

import { redirect } from 'next/navigation';

import { enhanceAction } from '~/shared/next/actions';
import { getLogger } from '~/shared/logger';

import { UpdateTeamNameSchema } from '../../schema/update-team-name.schema';
import { createUpdateTeamAccountService } from '../services/update-team-account.service';

export const updateTeamAccountName = enhanceAction(
  async (params) => {
    const service = createUpdateTeamAccountService();
    const logger = await getLogger();
    const { name, path, slug } = params;

    const ctx = {
      name: 'team-accounts.update',
      accountName: name,
    };

    logger.info(ctx, `Updating team name...`);

    const result = await service.updateTeamName({ name, slug });
    const newSlug = result.slug;

    logger.info(ctx, `Team name updated`);

    if (newSlug) {
      const nextPath = path.replace('[account]', newSlug);

      redirect(nextPath);
    }

    return { success: true };
  },
  {
    schema: UpdateTeamNameSchema,
  },
);
