import { z } from "zod";

import { PASSWORD_MIN_LENGTH } from "~/shared/constants";

export const CreateUserSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(PASSWORD_MIN_LENGTH, {
    message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
  }),
  emailConfirm: z.boolean().default(false).optional(),
});

export type CreateUserSchemaType = z.infer<typeof CreateUserSchema>;
