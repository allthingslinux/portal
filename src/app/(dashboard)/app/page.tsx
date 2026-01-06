import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { getServerQueryClient } from "@/lib/api/hydration";
import { queryKeys } from "@/lib/api/query-keys";
import { fetchCurrentUserServer } from "@/lib/api/server-queries";
import { getUser } from "@/lib/dal";
import { createPageMetadata } from "../../metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Dashboard",
  description:
    "Your portal dashboard - manage your All Things Linux services and account.",
  robots: {
    index: false,
    follow: false,
  },
});

export default async function AppPage() {
  // Use DAL to verify session and get user data
  // verifySession() is called inside getUser() and uses React's cache()
  await getUser();

  // Create QueryClient for this request (isolated per request)
  const queryClient = getServerQueryClient();

  // Prefetch current user data for SSR to prevent flicker during navigation
  await queryClient.prefetchQuery({
    queryKey: queryKeys.users.current(),
    queryFn: fetchCurrentUserServer,
  });

  // Get user data for server-side rendering the header
  // This ensures the header text is immediately available
  const user = await getUser();

  if (!user) {
    // getUser() handles redirect internally, but we check for null as safety
    return null;
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="space-y-6">
          <PageHeader
            description="Here's your dashboard overview. Use the sidebar to navigate to account settings."
            title={`Welcome back, ${user.name || user.email}!`}
          />

          <Card>
            <CardHeader>
              <CardTitle>Dashboard Overview</CardTitle>
            </CardHeader>
          </Card>
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
          </div>
          <div className="min-h-screen flex-1 rounded-xl bg-muted/50 md:min-h-min" />
        </div>
      </div>
    </HydrationBoundary>
  );
}
