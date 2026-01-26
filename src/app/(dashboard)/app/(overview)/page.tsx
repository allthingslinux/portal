import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/layout/page/page-header";
import { verifySession } from "@/features/auth/lib/auth/dal";
import { getServerRouteResolver, routeConfig } from "@/features/routing/lib";
import { getServerQueryClient } from "@/shared/api/hydration";
import { queryKeys } from "@/shared/api/query-keys";
import { fetchCurrentUserServer } from "@/shared/api/server-queries";
import { getRouteMetadata } from "@/shared/seo";

export async function generateMetadata(): Promise<Metadata> {
  const resolver = await getServerRouteResolver();
  return getRouteMetadata("/app", routeConfig, resolver);
}

export default async function AppPage() {
  // Verify session (returns session data)
  const sessionData = await verifySession();

  // Create QueryClient for this request (isolated per request)
  const queryClient = getServerQueryClient();

  // Prefetch current user data
  // Pass session from verifySession to avoid duplicate getSession call
  // This populates the TanStack Query cache and gives us user data for SSR
  const user = await queryClient.fetchQuery({
    queryKey: queryKeys.users.current(),
    queryFn: () => fetchCurrentUserServer(sessionData.session),
  });

  const resolver = await getServerRouteResolver();
  const t = await getTranslations();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="space-y-6">
          <PageHeader
            description={t("routes.dashboard.ui.description")}
            pathname="/app"
            resolver={resolver}
            title={t("routes.dashboard.ui.title", {
              name: user.name || user.email,
            })}
          />

          {/* Dashboard content will be added here */}
        </div>
      </div>
    </HydrationBoundary>
  );
}
