import { redirect } from 'next/navigation';
import type { NextRequest } from 'next/server';

import pathsConfig from '~/config/paths.config';

/**
 * Auth callback route
 * NextAuth handles OAuth callbacks automatically via /api/auth/callback/[provider]
 * This route is kept for backward compatibility and can handle additional logic if needed
 */
export async function GET(request: NextRequest) {
  // NextAuth handles OAuth callbacks via its own route
  // If we need custom callback logic, we can add it here
  // For now, redirect to home
  const searchParams = request.nextUrl.searchParams;
  const next = searchParams.get('next') || pathsConfig.app.home;

  return redirect(next);
}
