"use client";

// ============================================================================
// Settings Content (Client Component)
// ============================================================================
// Client Component wrapper for Better Auth UI settings components.
// Uses dynamic imports with ssr: false to prevent hydration mismatches.
// This component must be a Client Component because Next.js doesn't allow
// ssr: false with dynamic imports in Server Components.

import {
  AccountSettingsCards,
  ApiKeysCard,
  SecuritySettingsCards,
} from "@daveyplate/better-auth-ui";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
