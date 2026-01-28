import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { PageHeader } from "@/components/layout/page/page-header";
import { verifySession } from "@/auth/dal";
import { SettingsContent } from "./settings-content";
import { getServerRouteResolver, routeConfig } from "@/features/routing/lib";
import { getServerQueryClient } from "@/shared/api/hydration";
import { getRouteMetadata } from "@/shared/seo";

const SETTINGS_PATH = "/app/settings" as const;

// Metadata is automatically generated from route config.
// Canonical omits query params so crawlers index the base path (nuqs tab is local-only).
export async function generateMetadata(): Promise<Metadata> {
  const resolver = await getServerRouteResolver();
  const base = getRouteMetadata(SETTINGS_PATH, routeConfig, resolver);
  return {
    ...base,
    alternates: {
      ...base.alternates,
      canonical: SETTINGS_PATH,
    },
  };
}

// ============================================================================
// Settings Page
// ============================================================================
// Custom account settings per https://better-auth-ui.com/advanced/custom-settings:
// we use "Build custom layouts" with individual card components and our own
// tab layout. account.basePath is "/app/settings"; /app/settings/[segment]
// redirects to this page with ?tab= so UserButton and other Better Auth UI
// account links work.
//
// Components (dynamic, ssr: false):
//   - AccountSettingsCards: Account information, email, profile settings
//   - SecuritySettingsCards: Password, 2FA, passkeys, sessions
//   - ApiKeysCard: API key management (when apiKey prop is enabled in provider)
//
// Tab state is synced via nuqs (?tab=account|security|api-keys). Protection
// is server-side via verifySession(); the doc’s RedirectToSignIn/SignedIn
// pattern is optional for client-only protection.

export default async function SettingsPage() {
  await verifySession();

  const queryClient = getServerQueryClient();
  const resolver = await getServerRouteResolver();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="space-y-6">
          <PageHeader pathname={SETTINGS_PATH} resolver={resolver} />
          <SettingsContent />
        </div>
      </div>
    </HydrationBoundary>
  );
}
