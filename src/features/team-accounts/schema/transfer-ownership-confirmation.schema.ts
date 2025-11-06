import { z } from 'zod';

export const TransferOwnershipConfirmationSchema = z.object({
  accountId: z.string().uuid(),
  userId: z.string().uuid(),
  otp: z.string().min(6),
});

export type TransferOwnershipConfirmationData = z.infer<
  typeof TransferOwnershipConfirmationSchema
>;
