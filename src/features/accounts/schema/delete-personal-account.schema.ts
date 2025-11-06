import { z } from 'zod';

export const DeletePersonalAccountSchema = z.object({
  otp: z.string().min(6),
});
