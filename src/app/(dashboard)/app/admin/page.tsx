import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { verifyAdminOrStaffSession } from "@/auth/dal";
import { AdminDashboard } from "@/features/admin/components/admin-dashboard";
import { loadUsersListSearchParams } from "@/features/admin/lib/search-params";
import { getServerRouteResolver, routeConfig } from "@/features/routing/lib";
import { getServerQueryClient } from "@/shared/api/hydration";
import { queryKeys } from "@/shared/api/query-keys";
import {
  fetchAdminStatsServer,
  fetchSessionsServer,
  fetchUsersServer,
} from "@/shared/api/server-queries";
import { getRouteMetadata } from "@/shared/seo";

const ADMIN_PATH = "/app/admin" as const;

// Metadata is automatically generated from route config.
// Canonical URL omits query params so crawlers index the base path (nuqs “local-only state”).
export async function generateMetadata(): Promise<Metadata> {
  const resolver = await getServerRouteResolver();
  const base = getRouteMetadata(ADMIN_PATH, routeConfig, resolver);
  return {
    ...base,
    alternates: {
      ...base.alternates,
      canonical: ADMIN_PATH,
    },
  };
}

interface AdminPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  // Use DAL to verify session and check admin/staff role
  // verifyAdminOrStaffSession() uses React's cache() and handles redirects
  await verifyAdminOrStaffSession();

  // Create QueryClient for this request (isolated per request)
  const queryClient = getServerQueryClient();

  // Parse URL search params so prefetch matches UserManagement useQueryStates(usersListParsers)
  const urlState = await loadUsersListSearchParams(searchParams);
  const usersListFilters = {
    role: urlState.role,
    banned: urlState.banned,
    search: urlState.search || undefined,
    limit: urlState.limit,
    offset: urlState.offset,
  };

  // Prefetch all admin data in parallel for SSR
  // With streaming support, we can await these to ensure they're ready,
  // or kick them off without awaiting to stream results as they resolve.
  await Promise.all([
    // Prefetch admin stats
    queryClient.prefetchQuery({
      queryKey: queryKeys.admin.stats(),
      queryFn: fetchAdminStatsServer,
    }),
    // Prefetch users list; filters from URL so hydration matches UserManagement
    queryClient.prefetchQuery({
      queryKey: queryKeys.users.list(usersListFilters),
      queryFn: () => fetchUsersServer(usersListFilters),
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
