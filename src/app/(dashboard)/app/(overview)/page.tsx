import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/layout/page/page-header";
import { getServerQueryClient } from "@/lib/api/hydration";
import { queryKeys } from "@/lib/api/query-keys";
import { fetchCurrentUserServer } from "@/lib/api/server-queries";
import { verifySession } from "@/lib/auth/dal";
import { getServerRouteResolver, routeConfig } from "@/lib/routes";
import { getRouteMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const resolver = await getServerRouteResolver();
  return getRouteMetadata("/app", routeConfig, resolver);
}

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
