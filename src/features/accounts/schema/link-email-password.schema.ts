import { z } from 'zod';

export const LinkEmailPasswordSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8).max(99),
    repeatPassword: z.string().min(8).max(99),
  })
  .refine((values) => values.password === values.repeatPassword, {
    path: ['repeatPassword'],
    message: `account:passwordNotMatching`,
  });
