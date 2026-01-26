import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { AdminDashboard } from "@/features/admin/components/admin/admin-dashboard";
import { verifyAdminOrStaffSession } from "@/features/auth/lib/auth/dal";
import { getServerRouteResolver, routeConfig } from "@/features/routing/lib";
import { getServerQueryClient } from "@/shared/api/hydration";
import { queryKeys } from "@/shared/api/query-keys";
import {
  fetchAdminStatsServer,
  fetchSessionsServer,
  fetchUsersServer,
} from "@/shared/api/server-queries";
import { getRouteMetadata } from "@/shared/seo";

// Metadata is automatically generated from route config
export async function generateMetadata(): Promise<Metadata> {
  const resolver = await getServerRouteResolver();
  return getRouteMetadata("/app/admin", routeConfig, resolver);
}

export default async function AdminPage() {
  // Use DAL to verify session and check admin/staff role
  // verifyAdminOrStaffSession() uses React's cache() and handles redirects
  await verifyAdminOrStaffSession();

  // Create QueryClient for this request (isolated per request)
  const queryClient = getServerQueryClient();

  // Prefetch all admin data in parallel for SSR
  // With streaming support, we can await these to ensure they're ready,
  // or kick them off without awaiting to stream results as they resolve.
  await Promise.all([
    // Prefetch admin stats
    queryClient.prefetchQuery({
      queryKey: queryKeys.admin.stats(),
      queryFn: fetchAdminStatsServer,
    }),
    // Prefetch users list (first page)
    // Match the filters used in UserManagement component
    queryClient.prefetchQuery({
      queryKey: queryKeys.users.list({ limit: 50 }),
      queryFn: () => fetchUsersServer({ limit: 50 }),
    }),
    // Prefetch sessions (first page)
    queryClient.prefetchQuery({
      queryKey: queryKeys.sessions.list(),
      queryFn: () => fetchSessionsServer({ limit: 100 }),
    }),
  ]);

  // Note: With streaming enabled, you could also start prefetches without awaiting:
  // queryClient.prefetchQuery(...) // No await - will stream when ready
  // This is useful for non-critical data that can load progressively

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <AdminDashboard />
      </div>
    </HydrationBoundary>
  );
}
