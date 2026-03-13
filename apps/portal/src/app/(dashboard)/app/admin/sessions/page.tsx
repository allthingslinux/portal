import type { Metadata } from "next";
import { getServerQueryClient } from "@portal/api/hydration";
import { queryKeys } from "@portal/api/query-keys";
import { fetchSessionsServer } from "@portal/api/server-queries";
import { PageHeader } from "@portal/ui/layout/page/page-header";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { verifyAdminOrStaffSession } from "@/auth/dal";
import { SessionManagement } from "@/features/admin/components/session-management";
import { getServerRouteResolver, routeConfig } from "@/features/routing/lib";

const SESSIONS_PATH = "/app/admin/sessions" as const;

export async function generateMetadata(): Promise<Metadata> {
  const adminRoute = routeConfig.protected.find((r) => r.id === "admin");
  const child = adminRoute?.navigation?.children?.find(
    (c) => c.id === "admin-sessions"
  );
  const base = child
    ? {
        title: child.metadata?.title ?? "Session Management",
        description:
          child.metadata?.description ?? "View and manage active user sessions",
      }
    : {};
  return {
    ...base,
    alternates: {
      canonical: SESSIONS_PATH,
    },
  };
}

export default async function AdminSessionsPage() {
  await verifyAdminOrStaffSession();

  const queryClient = getServerQueryClient();
  const resolver = await getServerRouteResolver();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.sessions.list({ limit: 100 }),
    queryFn: () => fetchSessionsServer({ limit: 100 }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-6">
        <PageHeader pathname={SESSIONS_PATH} resolver={resolver} />
        <SessionManagement />
      </div>
    </HydrationBoundary>
  );
}
