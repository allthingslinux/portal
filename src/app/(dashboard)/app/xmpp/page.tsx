import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { PageHeader } from "@/components/layout/page/page-header";
import { XmppAccountManagement } from "@/components/xmpp/xmpp-account-management";
import { getServerQueryClient } from "@/lib/api/hydration";
import { queryKeys } from "@/lib/api/query-keys";
import { verifySession } from "@/lib/auth/dal";
import { getServerRouteResolver, routeConfig } from "@/lib/routes";
import { getRouteMetadata } from "@/lib/seo";

// Metadata is automatically generated from route config
export async function generateMetadata(): Promise<Metadata> {
  const resolver = await getServerRouteResolver();
  return getRouteMetadata("/app/xmpp", routeConfig, resolver);
}

// ============================================================================
// XMPP Account Management Page
// ============================================================================
// Page for managing XMPP accounts - create, view, update, and delete

export default async function XmppPage() {
  // Verify user session
  await verifySession();

  // Create QueryClient for this request (isolated per request)
  const queryClient = getServerQueryClient();

  // Prefetch XMPP account data for SSR
  // This reduces loading flash by populating the cache before components mount
  await queryClient.prefetchQuery({
    queryKey: queryKeys.xmppAccounts.current(),
    queryFn: async () => {
      // We'll fetch on the client side since this is a user-specific endpoint
      // that requires authentication cookies
      return null;
    },
  });

  const resolver = await getServerRouteResolver();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="space-y-6">
          <PageHeader pathname="/app/xmpp" resolver={resolver} />
          <XmppAccountManagement />
        </div>
      </div>
    </HydrationBoundary>
  );
}
