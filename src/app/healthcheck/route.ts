import { NextResponse } from 'next/server';

import { getSupabaseServerAdminClient } from '~/core/database/supabase/clients/server-admin-client';

/**
 * Healthcheck endpoint for the web app. If this endpoint returns a 200, the web app will be considered healthy.
 * If this endpoint returns a 500, the web app will be considered unhealthy.
 * This endpoint can be used by Docker to determine if the web app is healthy and should be restarted.
 */
export async function GET() {
  const isDbHealthy = await getSupabaseHealthCheck();

  return NextResponse.json({
    services: {
      database: isDbHealthy,
      // add other services here
    },
  });
}

/**
 * Quick check to see if the database is healthy by querying the config table
 * @returns true if the database is healthy, false otherwise
 */
async function getSupabaseHealthCheck() {
  try {
    const client = getSupabaseServerAdminClient();

    const { error } = await client
      .from('config')
      .select('enable_team_accounts')
      .single();

    return !error;
  } catch {
    return false;
  }
}
