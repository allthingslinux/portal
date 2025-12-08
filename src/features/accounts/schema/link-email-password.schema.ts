import { z } from 'zod';

import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from '~/shared/constants';

export const LinkEmailPasswordSchema = z
  .object({
    email: z.string().email(),
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH)
      .max(PASSWORD_MAX_LENGTH),
    repeatPassword: z
      .string()
      .min(PASSWORD_MIN_LENGTH)
      .max(PASSWORD_MAX_LENGTH),
  })
  .refine((values) => values.password === values.repeatPassword, {
    path: ['repeatPassword'],
    message: `account:passwordNotMatching`,
  });
