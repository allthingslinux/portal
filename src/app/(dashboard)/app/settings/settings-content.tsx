"use client";

// ============================================================================
// Settings Content (Client Component)
// ============================================================================
// Client Component wrapper for Better Auth UI settings components.
// Uses dynamic imports with ssr: false to prevent hydration mismatches.
// This component must be a Client Component because Next.js doesn't allow
// ssr: false with dynamic imports in Server Components.

import dynamic from "next/dynamic";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ============================================================================
// Settings Loading Fallback
// ============================================================================
// Skeleton loader that matches the structure of Better Auth UI settings cards
function SettingsCardsSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="mt-2 h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="mt-2 h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// Dynamic Imports with SSR Disabled
// ============================================================================
// Better Auth UI components are Client Components that fetch data on the client.
// Disabling SSR prevents hydration mismatches by ensuring they only render on the client.
// See: https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading#with-no-ssr

const AccountSettingsCards = dynamic(
  () =>
    import("@daveyplate/better-auth-ui").then((mod) => ({
      default: mod.AccountSettingsCards,
    })),
  {
    ssr: false,
    loading: () => <SettingsCardsSkeleton />,
  }
);

const SecuritySettingsCards = dynamic(
  () =>
    import("@daveyplate/better-auth-ui").then((mod) => ({
      default: mod.SecuritySettingsCards,
    })),
  {
    ssr: false,
    loading: () => <SettingsCardsSkeleton />,
  }
);

const ApiKeysCard = dynamic(
  () =>
    import("@daveyplate/better-auth-ui").then((mod) => ({
      default: mod.ApiKeysCard,
    })),
  {
    ssr: false,
    loading: () => <SettingsCardsSkeleton />,
  }
);

// ============================================================================
// Settings Content Component
// ============================================================================
// This component contains the tabs and Better Auth UI settings components.
// It's a Client Component to allow dynamic imports with ssr: false.
//
// The dynamic imports use loading states to show skeletons immediately while
// components load, preventing flicker when navigating to this page.
export function SettingsContent() {
  return (
    <div className="max-w-4xl">
      <Tabs defaultValue="account">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
        </TabsList>

        <TabsContent className="mt-6 space-y-6" value="account">
          {/* Loading skeleton shows while component loads */}
          <AccountSettingsCards />
        </TabsContent>

        <TabsContent className="mt-6 space-y-6" value="security">
          {/* Loading skeleton shows while component loads */}
          <SecuritySettingsCards />
        </TabsContent>

        <TabsContent className="mt-6 space-y-6" value="api-keys">
          {/* Loading skeleton shows while component loads */}
          <ApiKeysCard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
