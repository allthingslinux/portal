import { NextRequest, NextResponse } from 'next/server';

import { createAuthCallbackService } from '@portal/supabase/auth';
import { getSupabaseServerClient } from '@portal/supabase/server-client';

import pathsConfig from '~/config/paths.config';

export async function GET(request: NextRequest) {
  const service = createAuthCallbackService(getSupabaseServerClient());

  const url = await service.verifyTokenHash(request, {
    joinTeamPath: pathsConfig.app.joinTeam,
    redirectPath: pathsConfig.app.home,
  });

  return NextResponse.redirect(url);
}
