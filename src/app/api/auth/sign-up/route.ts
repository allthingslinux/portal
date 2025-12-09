import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "~/core/auth/better-auth";
import { verifyCaptchaToken } from "~/features/auth/captcha/server";
import { HTTP_STATUS, PASSWORD_MIN_LENGTH } from "~/shared/constants";
import { API_ERRORS } from "~/shared/constants/errors";
import { createErrorResponse } from "~/shared/next/actions/error-handlers";

const SignUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(PASSWORD_MIN_LENGTH),
  name: z.string().optional(),
  captchaToken: z.string().optional(),
});

/**
 * Sign-up route - now uses Better Auth API
 * Better Auth handles user creation, password hashing, and email verification
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, captchaToken } = SignUpSchema.parse(body);

    // Verify captcha token if provided
    if (captchaToken) {
      await verifyCaptchaToken(captchaToken);
    }

    // Use Better Auth's sign-up API
    const result = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: name || email.split("@")[0] || "User",
      },
      headers: await headers(),
    });

    // Better Auth returns data directly, not wrapped in error property
    if (!result.data) {
      return NextResponse.json(
        { error: API_ERRORS.FAILED_TO_CREATE_USER },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    return NextResponse.json({
      success: true,
      userId: result.data.user?.id,
    });
  } catch (error) {
    return createErrorResponse(error, API_ERRORS.FAILED_TO_CREATE_USER);
  }
}
