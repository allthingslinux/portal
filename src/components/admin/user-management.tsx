"use client";

import { useMemo } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useBanUser,
  useImpersonateUser,
  useSetUserRole,
  useUnbanUser,
  useUsers,
} from "@/hooks";
import { DataTable } from "./data-table";
import { createUserColumns } from "./user-columns";

export function UserManagement() {
  // Fetch users
  const { data, error } = useUsers({
    limit: 100,
  });

  // Mutations
  const setRole = useSetUserRole();
  const banUser = useBanUser();
  const unbanUser = useUnbanUser();
  const impersonateUser = useImpersonateUser();

  // Create columns with mutations
  const columns = useMemo(
    () =>
      createUserColumns({
        setRole,
        banUser,
        unbanUser,
        impersonateUser,
      }),
    [setRole, banUser, unbanUser, impersonateUser]
  );

  // Get users data
  const users = data?.users ?? [];

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Manage user accounts, roles, and permissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-destructive">
            Failed to load users: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          Manage user accounts, roles, and permissions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={users}
          searchKey="email"
          searchPlaceholder="Search users by email..."
        />
      </CardContent>
    </Card>
  );
}
