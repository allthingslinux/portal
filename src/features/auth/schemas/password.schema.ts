import { z } from "zod";

import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "~/shared/constants";

/**
 * Password requirements
 * These are the requirements for the password when signing up or changing the password
 */
const requirements = {
  minLength: PASSWORD_MIN_LENGTH,
  maxLength: PASSWORD_MAX_LENGTH,
  specialChars:
    process.env.NEXT_PUBLIC_PASSWORD_REQUIRE_SPECIAL_CHARS === "true",
  numbers: process.env.NEXT_PUBLIC_PASSWORD_REQUIRE_NUMBERS === "true",
  uppercase: process.env.NEXT_PUBLIC_PASSWORD_REQUIRE_UPPERCASE === "true",
};

const SPECIAL_CHARS_REGEX = /[!@#$%^&*(),.?":{}|<>]/g;
const NUMERIC_REGEX = /\d/g;
const UPPERCASE_REGEX = /[A-Z]/;

/**
 * Password schema
 * This is used to validate the password on sign in (for existing users when requirements are not enforced)
 */
export const PasswordSchema = z
  .string()
  .min(requirements.minLength)
  .max(requirements.maxLength);

/**
 * Refined password schema with additional requirements
 * This is required to validate the password requirements on sign up and password change
 */
export const RefinedPasswordSchema = PasswordSchema.superRefine((val, ctx) =>
  validatePassword(val, ctx)
);

export function refineRepeatPassword(
  data: { password: string; repeatPassword: string },
  ctx: z.RefinementCtx
) {
  if (data.password !== data.repeatPassword) {
    ctx.addIssue({
      message: "auth:errors.passwordsDoNotMatch",
      path: ["repeatPassword"],
      code: "custom",
    });
  }
}

function validatePassword(password: string, ctx: z.RefinementCtx) {
  if (requirements.specialChars) {
    const specialCharsCount = password.match(SPECIAL_CHARS_REGEX)?.length ?? 0;

    if (specialCharsCount < 1) {
      ctx.addIssue({
        message: "auth:errors.minPasswordSpecialChars",
        code: "custom",
      });
    }
  }

  if (requirements.numbers) {
    const numbersCount = password.match(NUMERIC_REGEX)?.length ?? 0;

    if (numbersCount < 1) {
      ctx.addIssue({
        message: "auth:errors.minPasswordNumbers",
        code: "custom",
      });
    }
  }

  if (requirements.uppercase && !UPPERCASE_REGEX.test(password)) {
    ctx.addIssue({
      message: "auth:errors.uppercasePassword",
      code: "custom",
    });
  }
}
