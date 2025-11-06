import { z } from 'zod';

import { TeamNameSchema } from './create-team.schema';

export const TeamNameFormSchema = z.object({
  name: TeamNameSchema,
});

export const UpdateTeamNameSchema = TeamNameFormSchema.merge(
  z.object({
    slug: z.string().min(1).max(255),
    path: z.string().min(1).max(255),
  }),
);
