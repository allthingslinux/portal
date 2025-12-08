import { z } from 'zod';

import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from '~/shared/constants';

export const PasswordUpdateSchema = {
  withTranslation: (errorMessage: string) => {
    return z
      .object({
        newPassword: z
          .string()
          .min(PASSWORD_MIN_LENGTH)
          .max(PASSWORD_MAX_LENGTH),
        repeatPassword: z
          .string()
          .min(PASSWORD_MIN_LENGTH)
          .max(PASSWORD_MAX_LENGTH),
      })
      .refine(
        (values) => {
          return values.newPassword === values.repeatPassword;
        },
        {
          path: ['repeatPassword'],
          message: errorMessage,
        },
      );
  },
};
