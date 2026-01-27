"use client";

import { Ban, Shield, UserCheck, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminStats } from "@/features/admin/hooks/use-admin";

export function AdminStats() {
  const { data: stats, isError, error } = useAdminStats();

  if (isError) {
    return (
      <div className="text-center text-destructive">
        Failed to load statistics: {error.message}
      </div>
    );
  }

  // Data is prefetched on the server, so it should be available immediately
  // Display 0 or empty if data isn't available yet (shouldn't happen with SSR prefetch)
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">{stats?.users.total ?? 0}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Admin Users</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">{stats?.users.admins ?? 0}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Active Sessions</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">
            {stats?.sessions.active ?? 0}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Banned Users</CardTitle>
          <Ban className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">{stats?.users.banned ?? 0}</div>
        </CardContent>
      </Card>
    </div>
  );
}
