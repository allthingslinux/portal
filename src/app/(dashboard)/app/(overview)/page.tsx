import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { PageHeader } from "@/components/layout/page/page-header";
import { getServerQueryClient } from "@/lib/api/hydration";
import { queryKeys } from "@/lib/api/query-keys";
import { fetchCurrentUserServer } from "@/lib/api/server-queries";
import { verifySession } from "@/lib/auth/dal";
import { getRouteMetadata, routeConfig } from "@/lib/navigation";

export const metadata: Metadata = getRouteMetadata("/app", routeConfig);

export default async function AppPage() {
  // Verify session (lightweight - just checks auth, doesn't fetch user)
  await verifySession();

  // Create QueryClient for this request (isolated per request)
  const queryClient = getServerQueryClient();

  // Prefetch current user data in parallel with session verification
  // This populates the TanStack Query cache and gives us user data for SSR
  const user = await queryClient.fetchQuery({
    queryKey: queryKeys.users.current(),
    queryFn: fetchCurrentUserServer,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="space-y-6">
          <PageHeader
            description="Here's your dashboard overview. Use the sidebar to navigate to account settings."
            pathname="/app"
            title={`Welcome back, ${user.name || user.email}!`}
          />

          {/* Dashboard content will be added here */}
        </div>
      </div>
    </HydrationBoundary>
  );
}
