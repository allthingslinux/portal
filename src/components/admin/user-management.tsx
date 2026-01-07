"use client";

import { useMemo, useState } from "react";
import { Ban, Eye } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useBanUser,
  useImpersonateUser,
  useSetUserRole,
  useUnbanUser,
  useUsers,
} from "@/hooks";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";

export function UserManagementSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          Manage user accounts, roles, and permissions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Input
            className="max-w-sm"
            disabled
            placeholder="Search users by email..."
          />
          <Select disabled value="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton array
                <TableRow key={i}>
                  <TableCell>
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-9 w-[140px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Skeleton className="h-9 w-9" />
                      <Skeleton className="h-9 w-16" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Fetch users with search filter
  const { data, isPending, error } = useUsers({
    search: searchTerm || undefined,
    limit: 50,
  });

  // Mutations
  const setRole = useSetUserRole();
  const banUser = useBanUser();
  const unbanUser = useUnbanUser();
  const impersonateUser = useImpersonateUser();

  // Filter users by role (client-side filtering)
  const filteredUsers = useMemo(() => {
    const users = data?.users ?? [];
    if (roleFilter === "all") {
      return users;
    }
    return users.filter((user) => user.role === roleFilter);
  }, [data?.users, roleFilter]);

  if (isPending) {
    return <UserManagementSkeleton />;
  }

  const hasData = !error;

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          Manage user accounts, roles, and permissions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Input
            className="max-w-sm"
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users by email..."
            value={searchTerm}
          />
          <Select onValueChange={setRoleFilter} value={roleFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!isPending && error && (
                <TableRow>
                  <TableCell
                    className="text-center text-destructive"
                    colSpan={5}
                  >
                    Failed to load users: {error.message}
                  </TableCell>
                </TableRow>
              )}
              {hasData && filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell className="text-center" colSpan={5}>
                    No users found
                  </TableCell>
                </TableRow>
              )}
              {hasData &&
                filteredUsers.length > 0 &&
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-muted-foreground text-sm">
                          {user.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        disabled={setRole.isPending}
                        onValueChange={(role) =>
                          setRole.mutate({
                            userId: user.id,
                            role: role as "user" | "staff" | "admin",
                          })
                        }
                        value={user.role || "user"}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="staff">Staff</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {user.banned ? (
                        <Badge variant="destructive">Banned</Badge>
                      ) : (
                        <Badge variant="secondary">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          disabled={impersonateUser.isPending}
                          onClick={() => impersonateUser.mutate(user.id)}
                          size="sm"
                          variant="outline"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {user.banned ? (
                          <Button
                            disabled={unbanUser.isPending}
                            onClick={() => unbanUser.mutate(user.id)}
                            size="sm"
                            variant="outline"
                          >
                            Unban
                          </Button>
                        ) : (
                          <Button
                            disabled={banUser.isPending}
                            onClick={() => banUser.mutate({ userId: user.id })}
                            size="sm"
                            variant="outline"
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
