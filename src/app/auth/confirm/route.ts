import { NextRequest, NextResponse } from 'next/server';

import { createAuthCallbackService } from '~/core/database/supabase/auth';
import { getSupabaseServerClient } from '~/core/database/supabase/clients/server-client';

import pathsConfig from '~/config/paths.config';

export async function GET(request: NextRequest) {
  const service = createAuthCallbackService(getSupabaseServerClient());

  const url = await service.verifyTokenHash(request, {
    joinTeamPath: pathsConfig.app.joinTeam,
    redirectPath: pathsConfig.app.home,
  });

  return NextResponse.redirect(url);
}
