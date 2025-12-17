import { z } from "zod";

export const TransferOwnershipConfirmationSchema = z.object({
  accountId: z.string().uuid(),
  userId: z.string().uuid(),
  otp: z.string().optional(), // OTP is now optional - removed OTP requirement
});

export type TransferOwnershipConfirmationData = z.infer<
  typeof TransferOwnershipConfirmationSchema
>;
