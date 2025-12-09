import { z } from "zod";

export const UpdateEmailSchema = {
  withTranslation: (errorMessage: string) =>
    z
      .object({
        email: z.string().email(),
        repeatEmail: z.string().email(),
      })
      .refine((values) => values.email === values.repeatEmail, {
        path: ["repeatEmail"],
        message: errorMessage,
      }),
};
