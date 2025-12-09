import { z } from "zod";

/**
 * @name RESERVED_NAMES_ARRAY
 * @description Array of reserved names for team accounts
 * This is a list of names that cannot be used for team accounts as they are reserved for other purposes.
 * Please include any new reserved names here.
 */
const RESERVED_NAMES_ARRAY = [
  "settings",
  // please add more reserved names here
];

const SPECIAL_CHARACTERS_REGEX = /[!@#$%^&*()+=[\]{};':"\\|,.<>/?]/;

/**
 * @name TeamNameSchema
 */
export const TeamNameSchema = z
  .string({
    description: "The name of the team account",
  })
  .min(2)
  .max(50)
  .refine((name) => !SPECIAL_CHARACTERS_REGEX.test(name), {
    message: "teams:specialCharactersError",
  })
  .refine((name) => !RESERVED_NAMES_ARRAY.includes(name.toLowerCase()), {
    message: "teams:reservedNameError",
  });

/**
 * @name CreateTeamSchema
 * @description Schema for creating a team account
 */
export const CreateTeamSchema = z.object({
  name: TeamNameSchema,
});
