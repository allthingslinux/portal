import type { Metadata } from "next";
import { getServerQueryClient } from "@portal/api/hydration";
import { fetchUsersServer } from "@portal/api/server-queries";
import { PageHeader } from "@portal/ui/layout/page/page-header";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { verifyAdminOrStaffSession } from "@/auth/dal";
import { UnifiedUserManagement } from "@/features/admin/components/unified-user-management";
import { loadUsersListSearchParams } from "@/features/admin/lib/search-params";
import { usersListQueryOptions } from "@/features/admin/lib/users-query-options";
import { getServerRouteResolver } from "@/features/routing/lib";

const USERS_PATH = "/app/admin/users" as const;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "User Management",
    description:
      "Manage users and integration accounts (IRC, XMPP, Mailcow, MediaWiki)",
    alternates: {
      canonical: USERS_PATH,
    },
  };
}

interface AdminUsersPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  await verifyAdminOrStaffSession();

  const queryClient = getServerQueryClient();
  const resolver = await getServerRouteResolver();

  const urlState = await loadUsersListSearchParams(searchParams);
  const filters = {
    role: urlState.role === "all" ? undefined : urlState.role,
    banned:
      urlState.status === "all" ? undefined : urlState.status === "banned",
    search: urlState.search || undefined,
    limit: urlState.limit,
    offset: urlState.offset,
    expandIntegrations: true,
  };

  await queryClient.prefetchQuery({
    ...usersListQueryOptions(filters),
    queryFn: () => fetchUsersServer(filters),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-6">
        <PageHeader pathname={USERS_PATH} resolver={resolver} />
        <UnifiedUserManagement />
      </div>
    </HydrationBoundary>
  );
}
