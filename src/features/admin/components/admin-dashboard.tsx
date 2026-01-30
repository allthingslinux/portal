"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/layout/page/page-header";
import { AdminStats } from "./admin-stats";
import { IrcAccountsManagement } from "./irc-accounts-management";
import { SessionManagement } from "./session-management";
import { UserManagement } from "./user-management";
import { useTranslatedRoutes } from "@/features/routing/hooks/use-translated-routes";

export function AdminDashboard() {
  // Get translated route config for client components
  // The translated config already has all translations resolved
  const translatedConfig = useTranslatedRoutes();

  // Find the route in the translated config
  const route = [
    ...translatedConfig.public,
    ...translatedConfig.protected,
  ].find((r) => r.path === "/app/admin");

  const title = route?.ui?.title ?? route?.metadata.title;
  const description = route?.ui?.description ?? route?.metadata.description;

  return (
    <div className="space-y-6">
      <PageHeader
        description={description}
        pathname="/app/admin"
        title={title}
      />

      <AdminStats />

      <Tabs className="space-y-4" defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="irc-accounts">IRC Accounts</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="sessions">
          <SessionManagement />
        </TabsContent>

        <TabsContent value="irc-accounts">
          <IrcAccountsManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
