import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { PageHeader } from "@/components/layout/page/page-header";
import { verifySession } from "@/auth/dal";
import { IntegrationsContent } from "./integrations-content";
import { getServerRouteResolver, routeConfig } from "@/features/routing/lib";
import { getServerQueryClient } from "@/shared/api/hydration";
import { getRouteMetadata } from "@/shared/seo";

// Metadata is automatically generated from route config
export async function generateMetadata(): Promise<Metadata> {
  const resolver = await getServerRouteResolver();
  return getRouteMetadata("/app/integrations", routeConfig, resolver);
}

// ============================================================================
// Integrations Page
// ============================================================================
// Page for managing all integrations

export default async function IntegrationsPage() {
  // Verify user session
  await verifySession();

  // Create QueryClient for this request (isolated per request)
  const queryClient = getServerQueryClient();

  // Note: We don't prefetch integration data here because:
  // 1. It requires authentication cookies which aren't available server-side
  // 2. Prefetching with null would mark the query as successful and block refetch for 30s
  // The client-side hook will fetch the data when the component mounts

  const resolver = await getServerRouteResolver();

  // Empty dehydrate kept for consistency with other app pages; integrations fetch client-side.
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="space-y-6">
          <PageHeader pathname="/app/integrations" resolver={resolver} />
          <IntegrationsContent />
        </div>
      </div>
    </HydrationBoundary>
  );
}
