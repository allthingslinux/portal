import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { PageHeader } from "@/components/layout/page/page-header";
import { verifySession } from "@/auth/dal";
import { SettingsContent } from "./settings-content";
import { getServerRouteResolver, routeConfig } from "@/features/routing/lib";
import { getServerQueryClient } from "@/shared/api/hydration";
import { getRouteMetadata } from "@/shared/seo";

// Metadata is automatically generated from route config
export async function generateMetadata(): Promise<Metadata> {
  const resolver = await getServerRouteResolver();
  return getRouteMetadata("/app/settings", routeConfig, resolver);
}

// ============================================================================
// Settings Page
// ============================================================================
// This page uses Better Auth UI settings components for account management.
// See: https://better-auth-ui.com/llms.txt
//
// Components:
//   - AccountSettingsCards: Account information, email, profile settings
//   - SecuritySettingsCards: Password, 2FA, passkeys, sessions
//   - ApiKeysCard: API key management (when apiKey prop is enabled in provider)
//
// The SettingsContent component is a Client Component that uses dynamic
// imports with ssr: false to prevent hydration mismatches.
//
// We do not prefetch our user API here. Better Auth UI reads session from
// Better Auth TanStack's useSession at key ["session"]; useCurrentUser /
// queryKeys.users.current() are for other pages (e.g. overview).
//
// Alternative: You can use SettingsCards component with view prop:
//   <SettingsCards view="ACCOUNT" />
//   <SettingsCards view="SECURITY" />
//   <SettingsCards view="API_KEYS" />

export default async function SettingsPage() {
  await verifySession();

  const queryClient = getServerQueryClient();
  const resolver = await getServerRouteResolver();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="space-y-6">
          <PageHeader pathname="/app/settings" resolver={resolver} />
          <SettingsContent />
        </div>
      </div>
    </HydrationBoundary>
  );
}
