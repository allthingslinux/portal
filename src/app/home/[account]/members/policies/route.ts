import { NextResponse } from 'next/server';

import { z } from 'zod';

import { enhanceRouteHandler } from '~/shared/next/routes';
import { getSupabaseServerClient } from '~/core/database/supabase/clients/server-client';
import {
  createInvitationContextBuilder,
  createInvitationsPolicyEvaluator,
} from '~/features/team-accounts/server/policies';

export const GET = enhanceRouteHandler(
  async function ({ params, user }) {
    const client = getSupabaseServerClient();
    const { account } = z.object({ account: z.string() }).parse(params);

    try {
      // Evaluate with standard evaluator
      const evaluator = createInvitationsPolicyEvaluator();
      const hasPolicies = await evaluator.hasPoliciesForStage('preliminary');

      if (!hasPolicies) {
        return NextResponse.json({
          allowed: true,
          reasons: [],
          metadata: {
            policiesEvaluated: 0,
            timestamp: new Date().toISOString(),
            noPoliciesConfigured: true,
          },
        });
      }

      // Build context for policy evaluation (empty invitations for testing)
      const contextBuilder = createInvitationContextBuilder(client);

      const context = await contextBuilder.buildContext(
        {
          invitations: [],
          accountSlug: account,
        },
        user,
      );

      // validate against policies
      const result = await evaluator.canInvite(context, 'preliminary');

      return NextResponse.json(result);
    } catch (error) {
      return NextResponse.json(
        {
          allowed: false,
          reasons: [
            error instanceof Error ? error.message : 'Unknown error occurred',
          ],
          metadata: {
            error: true,
            originalError:
              error instanceof Error ? error.message : String(error),
          },
        },
        { status: 500 },
      );
    }
  },
  {
    auth: true,
  },
);
