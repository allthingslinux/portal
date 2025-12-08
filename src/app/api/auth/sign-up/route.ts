import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

import { getDrizzleSupabaseAdminClient } from '~/core/database/supabase/clients/drizzle-client';
import { sql } from 'drizzle-orm';
import {
  BCRYPT_ROUNDS,
  HTTP_STATUS,
  PASSWORD_MIN_LENGTH,
} from '~/shared/constants';
import { API_ERRORS } from '~/shared/constants/errors';
import { createErrorResponse } from '~/shared/next/actions/error-handlers';
import { verifyCaptchaToken } from '~/features/auth/captcha/server';

const SignUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(PASSWORD_MIN_LENGTH),
  captchaToken: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, captchaToken } = SignUpSchema.parse(body);

    // Verify captcha token if provided
    if (captchaToken) {
      await verifyCaptchaToken(captchaToken);
    }

    const db = getDrizzleSupabaseAdminClient();

    // Check if user already exists
    const existingUser = await db.execute<{ id: string }>(
      sql`
        SELECT id FROM auth.users WHERE email = ${email} LIMIT 1
      `,
    );

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: API_ERRORS.USER_ALREADY_REGISTERED },
        { status: HTTP_STATUS.BAD_REQUEST },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Create user in auth.users table
    // Note: This is a simplified version. In production, you might want to
    // use Supabase Auth REST API or create a more complete user record
    const userId = crypto.randomUUID();

    await db.execute(
      sql`
        INSERT INTO auth.users (id, email, encrypted_password, aud, role, created_at, updated_at)
        VALUES (${userId}, ${email}, ${hashedPassword}, 'authenticated', 'authenticated', NOW(), NOW())
      `,
    );

    return NextResponse.json({ success: true, userId });
  } catch (error) {
    return createErrorResponse(error, API_ERRORS.FAILED_TO_CREATE_USER);
  }
}

