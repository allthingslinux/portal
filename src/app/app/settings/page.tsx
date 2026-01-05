import {
  AccountSettingsCards,
  ApiKeysCard,
  SecuritySettingsCards,
} from "@daveyplate/better-auth-ui";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppHeader } from "@/components/layout/app-header";

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
// Alternative: You can use SettingsCards component with view prop:
//   <SettingsCards view="ACCOUNT" />
//   <SettingsCards view="SECURITY" />
//   <SettingsCards view="API_KEYS" />

export default function SettingsPage() {
  return (
    <>
      <AppHeader
        breadcrumbs={[{ label: "App", href: "/app" }, { label: "Settings" }]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div>
          <h1 className="font-semibold text-2xl">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and security settings.
          </p>
        </div>

        <Tabs className="max-w-4xl" defaultValue="account">
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
    </>
  );
}
