import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { PageHeader } from "@/components/layout/page-header";
import { getServerQueryClient } from "@/lib/api/hydration";
import { queryKeys } from "@/lib/api/query-keys";
import { fetchCurrentUserServer } from "@/lib/api/server-queries";
import { verifySession } from "@/lib/dal";
import { createPageMetadata } from "../../../metadata";
import { SettingsContent } from "./settings-content";

export const metadata: Metadata = createPageMetadata({
  title: "Settings",
  description: "Manage your account, security settings, and API keys.",
  robots: {
    index: false,
    follow: false,
  },
});

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
// We prefetch user data on the server to reduce loading flash and improve UX.
// This populates the TanStack Query cache that Better Auth UI components use.
//
// Alternative: You can use SettingsCards component with view prop:
//   <SettingsCards view="ACCOUNT" />
//   <SettingsCards view="SECURITY" />
//   <SettingsCards view="API_KEYS" />

export default async function SettingsPage() {
  // Use DAL to verify session
  await verifySession();

  // Create QueryClient for this request (isolated per request)
  const queryClient = getServerQueryClient();

  // Prefetch current user data for SSR
  // This reduces loading flash by populating the cache before Better Auth UI
  // components mount and fetch data
  await queryClient.prefetchQuery({
    queryKey: queryKeys.users.current(),
    queryFn: fetchCurrentUserServer,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="space-y-6">
          <PageHeader
            description="Manage your account and security settings."
            title="Settings"
          />
          {/* SettingsContent uses dynamic imports with loading states built-in */}
          <SettingsContent />
        </div>
      </div>
    </HydrationBoundary>
  );
}
