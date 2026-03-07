"use client";

import { PageHeader } from "@portal/ui/layout/page/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@portal/ui/ui/tabs";

import { AdminStats } from "./admin-stats";
import { IrcAccountsManagement } from "./irc-accounts-management";
import { MailcowAccountsManagement } from "./mailcow-accounts-management";
import { MediawikiAccountsManagement } from "./mediawiki-accounts-management";
import { SessionManagement } from "./session-management";
import { UserManagement } from "./user-management";
import { XmppAccountsManagement } from "./xmpp-accounts-management";
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
          <TabsTrigger value="xmpp-accounts">XMPP Accounts</TabsTrigger>
          <TabsTrigger value="mailcow-accounts">Mailcow Accounts</TabsTrigger>
          <TabsTrigger value="mediawiki-accounts">
            MediaWiki Accounts
          </TabsTrigger>
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

        <TabsContent value="xmpp-accounts">
          <XmppAccountsManagement />
        </TabsContent>

        <TabsContent value="mailcow-accounts">
          <MailcowAccountsManagement />
        </TabsContent>

        <TabsContent value="mediawiki-accounts">
          <MediawikiAccountsManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
