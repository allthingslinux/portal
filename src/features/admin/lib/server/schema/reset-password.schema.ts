import { z } from 'zod';

/**
 * Schema for resetting a user's password
 */
export const ResetPasswordSchema = z.object({
  userId: z.string().uuid(),
  confirmation: z.custom<string>((value) => value === 'CONFIRM'),
});
