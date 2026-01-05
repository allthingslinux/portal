"use client";

import { useEffect, useState } from "react";
import { Ban, Shield, UserCheck, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/auth/client";

export function AdminStats() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    adminUsers: 0,
    bannedUsers: 0,
    activeUsers: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch all users to calculate stats
        const { data: allUsers } = await authClient.admin.listUsers({
          query: {
            limit: 1000, // Adjust based on your needs
          },
        });

        if (allUsers) {
          const totalUsers = allUsers.users.length;
          const adminUsers = allUsers.users.filter(
            (user) => user.role === "admin" || user.role?.includes("admin")
          ).length;
          const bannedUsers = allUsers.users.filter(
            (user) => user.banned
          ).length;
          const activeUsers = totalUsers - bannedUsers;

          setStats({
            totalUsers,
            adminUsers,
            bannedUsers,
            activeUsers,
          });
        }
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">{stats.totalUsers}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Admin Users</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">{stats.adminUsers}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Active Users</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">{stats.activeUsers}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Banned Users</CardTitle>
          <Ban className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">{stats.bannedUsers}</div>
        </CardContent>
      </Card>
    </div>
  );
}
