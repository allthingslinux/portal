import "server-only";

import { type NextRequest, NextResponse } from "next/server";

import type { z } from "zod";
import type { BetterAuthUser } from "~/lib/auth/types";
import { requireUser } from "~/lib/database/require-user";
import { HTTP_STATUS } from "~/shared/constants";
import { API_ERRORS } from "~/shared/constants/errors";

type Config<Schema> = {
  auth?: boolean;
  schema?: Schema;
};

type HandlerParams<
  Schema extends z.ZodType | undefined,
  RequireAuth extends boolean | undefined,
> = {
  request: NextRequest;
  user: RequireAuth extends false ? undefined : BetterAuthUser;
  body: Schema extends z.ZodType ? z.infer<Schema> : undefined;
  params: Record<string, string>;
};

/**
 * Enhanced route handler function.
 */
export const enhanceRouteHandler = <Params extends Config<z.ZodTypeAny>>(
  handler:
    | ((
        context: HandlerParams<Params["schema"], Params["auth"]>
      ) => NextResponse | Response)
    | ((
        context: HandlerParams<Params["schema"], Params["auth"]>
      ) => Promise<NextResponse | Response>),
  params?: Params
) => {
  return async function routeHandler(
    request: NextRequest,
    routeParams: { params: Promise<Record<string, string>> }
  ) {
    type UserParam = Params["auth"] extends false ? undefined : BetterAuthUser;

    let user: UserParam = undefined as UserParam;
    const shouldVerifyAuth = params?.auth ?? true;

    if (shouldVerifyAuth) {
      user = (await requireUser()) as UserParam;
    }

    let body: Params["schema"] extends z.ZodType
      ? z.infer<Params["schema"]>
      : undefined;

    if (params?.schema) {
      const json = await request.clone().json();
      const parsedBody = await params.schema.safeParseAsync(json);

      if (parsedBody.success) {
        body = parsedBody.data as Params["schema"] extends z.ZodType
          ? z.infer<Params["schema"]>
          : undefined;
      } else {
        return NextResponse.json(
          {
            error: parsedBody.error.message || API_ERRORS.INVALID_REQUEST_BODY,
          },
          { status: HTTP_STATUS.BAD_REQUEST }
        );
      }
    } else {
      // biome-ignore lint/suspicious/noExplicitAny: Zod v4 schema type compatibility workaround
      body = undefined as any;
    }

    return handler({
      request,
      body,
      user,
      params: await routeParams.params,
    });
  };
};
