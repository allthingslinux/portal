import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/layout/page-header";
import {
  AccountSettingsSkeleton,
  ApiKeysSkeleton,
  SecuritySettingsSkeleton,
} from "@/components/settings/settings-skeleton";

export default function SettingsLoading() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="space-y-6">
        <PageHeader
          description="Manage your account and security settings."
          title="Settings"
        />

        {/* Tabs skeleton matching SettingsContent structure */}
        <div className="max-w-4xl">
          <Tabs defaultValue="account">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="api-keys">API Keys</TabsTrigger>
            </TabsList>

            <TabsContent className="mt-6 space-y-6" value="account">
              <AccountSettingsSkeleton />
            </TabsContent>

            <TabsContent className="mt-6 space-y-6" value="security">
              <SecuritySettingsSkeleton />
            </TabsContent>

            <TabsContent className="mt-6 space-y-6" value="api-keys">
              <ApiKeysSkeleton />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
