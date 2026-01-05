"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminStats } from "./admin-stats";
import { SessionManagement } from "./session-management";
import { UserManagement } from "./user-management";

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-semibold text-2xl">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage users, sessions, and system settings.
        </p>
      </div>

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
