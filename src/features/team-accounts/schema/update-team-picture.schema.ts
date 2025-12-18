import { z } from "zod";

export const UpdateTeamPictureSchema = z.object({
  accountId: z.string().uuid(),
  pictureUrl: z.string().url().nullable(),
});
