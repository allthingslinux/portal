"use client";

// ============================================================================
// Settings Content (Client Component)
// ============================================================================
// Client Component wrapper for Better Auth UI settings components.
// Uses dynamic imports with ssr: false to prevent hydration mismatches.

import dynamic from "next/dynamic";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ============================================================================
// Settings Content Component
// ============================================================================
// This component contains the tabs and Better Auth UI settings components.
// It's a Client Component because we disable SSR for Better Auth UI components.

const AccountSettingsCards = dynamic(
  () =>
    import("@daveyplate/better-auth-ui").then((m) => ({
      default: m.AccountSettingsCards,
    })),
  {
    ssr: false,
  }
);

const SecuritySettingsCards = dynamic(
  () =>
    import("@daveyplate/better-auth-ui").then((m) => ({
      default: m.SecuritySettingsCards,
    })),
  {
    ssr: false,
  }
);

const ApiKeysCard = dynamic(
  () =>
    import("@daveyplate/better-auth-ui").then((m) => ({
      default: m.ApiKeysCard,
    })),
  {
    ssr: false,
  }
);

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
          <AccountSettingsCards />
        </TabsContent>

        <TabsContent className="mt-6 space-y-6" value="security">
          <SecuritySettingsCards />
        </TabsContent>

        <TabsContent className="mt-6 space-y-6" value="api-keys">
          <ApiKeysCard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
