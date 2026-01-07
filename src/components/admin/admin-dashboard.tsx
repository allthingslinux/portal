"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/layout/page-header";
import { AdminStats } from "./admin-stats";
import { SessionManagement } from "./session-management";
import { UserManagement } from "./user-management";

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        description="Manage users, sessions, and system settings."
        title="Admin Dashboard"
      />

      <AdminStats />

      <Tabs className="space-y-4" defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="sessions">
          <SessionManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
