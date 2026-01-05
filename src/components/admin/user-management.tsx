"use client";

import { useCallback, useEffect, useState } from "react";
import { Ban, Eye } from "lucide-react";
import { toast } from "sonner";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { authClient } from "@/auth/client";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  banned?: boolean | null;
  banReason?: string | null;
  createdAt: string | Date;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await authClient.admin.listUsers({
        query: {
          searchValue: searchTerm || undefined,
          searchField: "email",
          limit: 50,
        },
      });

      if (data) {
        setUsers(data.users);
      }
    } catch (error) {
      toast.error("Failed to fetch users");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSetRole = async (
    userId: string,
    role: "user" | "staff" | "admin"
  ) => {
    try {
      await authClient.admin.setRole({
        userId,
        role,
      });
      toast.success("User role updated");
      fetchUsers();
    } catch (_error) {
      toast.error("Failed to update user role");
    }
  };

  const handleBanUser = async (userId: string) => {
    try {
      await authClient.admin.banUser({
        userId,
        banReason: "Banned by admin",
      });
      toast.success("User banned");
      fetchUsers();
    } catch (_error) {
      toast.error("Failed to ban user");
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      await authClient.admin.unbanUser({
        userId,
      });
      toast.success("User unbanned");
      fetchUsers();
    } catch (_error) {
      toast.error("Failed to unban user");
    }
  };

  const handleImpersonateUser = async (userId: string) => {
    try {
      await authClient.admin.impersonateUser({
        userId,
      });
      toast.success("Now impersonating user");
      window.location.href = "/app";
    } catch (_error) {
      toast.error("Failed to impersonate user");
    }
  };

  const filteredUsers = users.filter((user) => {
    if (roleFilter !== "all" && user.role !== roleFilter) {
      return false;
    }
    return true;
  });

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
              {loading && (
                <TableRow>
                  <TableCell className="text-center" colSpan={5}>
                    Loading...
                  </TableCell>
                </TableRow>
              )}
              {!loading && filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell className="text-center" colSpan={5}>
                    No users found
                  </TableCell>
                </TableRow>
              )}
              {!loading &&
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
                        onValueChange={(role) =>
                          handleSetRole(
                            user.id,
                            role as "user" | "staff" | "admin"
                          )
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
                          onClick={() => handleImpersonateUser(user.id)}
                          size="sm"
                          variant="outline"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {user.banned ? (
                          <Button
                            onClick={() => handleUnbanUser(user.id)}
                            size="sm"
                            variant="outline"
                          >
                            Unban
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleBanUser(user.id)}
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
