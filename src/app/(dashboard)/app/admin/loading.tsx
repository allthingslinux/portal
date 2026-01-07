import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminStatsSkeleton } from "@/components/admin/admin-stats";
import { SessionManagementSkeleton } from "@/components/admin/session-management";
import { UserManagementSkeleton } from "@/components/admin/user-management";
import { PageHeader } from "@/components/layout/page-header";

export default function AdminLoading() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="space-y-6">
        <PageHeader
          description="Manage users, sessions, and system settings."
          title="Admin Dashboard"
        />

        <AdminStatsSkeleton />

        <Tabs className="space-y-4" defaultValue="users">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UserManagementSkeleton />
          </TabsContent>

          <TabsContent value="sessions">
            <SessionManagementSkeleton />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
