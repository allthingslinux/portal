import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

import { getDrizzleSupabaseAdminClient } from '~/core/database/supabase/clients/drizzle-client';
import { sql } from 'drizzle-orm';

const SignUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  captchaToken: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, captchaToken } = SignUpSchema.parse(body);

    // TODO: Verify captcha token if provided

    const db = getDrizzleSupabaseAdminClient();

    // Check if user already exists
    const existingUser = await db.execute<{ id: string }>(
      sql`
        SELECT id FROM auth.users WHERE email = ${email} LIMIT 1
      `,
    );

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'User already registered' },
        { status: 400 },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

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
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 },
    );
  }
}

