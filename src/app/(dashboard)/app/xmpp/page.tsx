import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { PageHeader } from "@/components/layout/page/page-header";
import { XmppAccountManagement } from "@/components/xmpp/xmpp-account-management";
import { getServerQueryClient } from "@/lib/api/hydration";
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

  // Note: We don't prefetch XMPP account data here because:
  // 1. It requires authentication cookies which aren't available server-side
  // 2. Prefetching with null would mark the query as successful and block refetch for 30s
  // The client-side hook will fetch the data when the component mounts

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
