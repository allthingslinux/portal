import 'server-only';

import { redirect } from 'next/navigation';

import { ZodType, z } from 'zod';

import { verifyCaptchaToken } from '@portal/auth/captcha/server';
import { requireUser } from '@portal/supabase/require-user';
import { getSupabaseServerClient } from '@portal/supabase/server-client';
import { JWTUserData } from '@portal/supabase/types';

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
      Config['captcha'] extends true ? Args & { captchaToken: string } : Args,
      z.ZodTypeDef
    >;
  },
>(
  fn: (
    params: Config['schema'] extends ZodType ? z.infer<Config['schema']> : Args,
    user: Config['auth'] extends false ? undefined : JWTUserData,
  ) => Response | Promise<Response>,
  config: Config,
) {
  return async (
    params: Config['schema'] extends ZodType ? z.infer<Config['schema']> : Args,
  ) => {
    type UserParam = Config['auth'] extends false ? undefined : JWTUserData;

    const requireAuth = config.auth ?? true;
    let user: UserParam = undefined as UserParam;

    // validate the schema passed in the config if it exists
    const validateData = async () => {
      if (config.schema) {
        const parsed = await config.schema.safeParseAsync(params);

        if (parsed.success) {
          return parsed.data;
        }

        throw new Error(parsed.error.message || 'Invalid request body');
      }

      return params;
    };

    const data = await validateData();

    // by default, the CAPTCHA token is not required
    const verifyCaptcha = config.captcha ?? false;

    // verify the CAPTCHA token. It will throw an error if the token is invalid.
    if (verifyCaptcha) {
      const token = (data as Args & { captchaToken: string }).captchaToken;

      // Verify the CAPTCHA token. It will throw an error if the token is invalid.
      await verifyCaptchaToken(token);
    }

    // verify the user is authenticated if required
    if (requireAuth) {
      // verify the user is authenticated if required
      const auth = await requireUser(getSupabaseServerClient());

      // If the user is not authenticated, redirect to the specified URL.
      if (!auth.data) {
        redirect(auth.redirectTo);
      }

      user = auth.data as UserParam;
    }

    return fn(data, user);
  };
}
