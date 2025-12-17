import "server-only";

import type { ZodType, z } from "zod";
import type { BetterAuthUser } from "~/core/auth/better-auth/types";
import { requireUser } from "~/core/database/require-user";
import { verifyCaptchaToken } from "~/features/auth/captcha/server";

/**
 * @name enhanceAction
 * @description Enhance an action with captcha, schema and auth checks
 */
export function enhanceAction<
  Args,
  Response,
  Config extends {
    auth?: boolean;
    captcha?: boolean;
    schema?: z.ZodType<
      Config["captcha"] extends true ? Args & { captchaToken: string } : Args,
      z.ZodTypeDef
    >;
  },
>(
  fn: (
    params: Config["schema"] extends ZodType ? z.infer<Config["schema"]> : Args,
    user: Config["auth"] extends false ? undefined : BetterAuthUser
  ) => Response | Promise<Response>,
  config: Config
) {
  return async (
    params: Config["schema"] extends ZodType ? z.infer<Config["schema"]> : Args
  ) => {
    type UserParam = Config["auth"] extends false ? undefined : BetterAuthUser;

    const requireAuth = config.auth ?? true;
    let user: UserParam = undefined as UserParam;

    const validateData = async () => {
      if (config.schema) {
        const parsed = await config.schema.safeParseAsync(params);

        if (parsed.success) {
          return parsed.data;
        }

        throw new Error(parsed.error.message || "Invalid request body");
      }

      return params;
    };

    const data = await validateData();

    const verifyCaptcha = config.captcha ?? false;

    if (verifyCaptcha) {
      const token = (data as Args & { captchaToken: string }).captchaToken;
      await verifyCaptchaToken(token);
    }

    if (requireAuth) {
      user = (await requireUser()) as UserParam;
    }

    return fn(data, user);
  };
}
