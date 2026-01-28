"use client";

import { useMemo } from "react";
import { debounce } from "nuqs";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { DataTable } from "./data-table";
import { createUserColumns } from "./user-columns";
import { useUsers } from "@/features/admin/hooks/use-admin";
import {
  useBanUser,
  useImpersonateUser,
  useSetUserRole,
  useUnbanUser,
} from "@/features/admin/hooks/use-admin-actions";
import { useUsersListSearchParams } from "@/features/admin/hooks/use-users-list-search-params";
import type { User } from "@/shared/api/types";
import type { UserListResponse } from "@/shared/types/api";

const ROLE_OPTIONS = [
  { value: "user", label: "User" },
  { value: "staff", label: "Staff" },
  { value: "admin", label: "Admin" },
] as const;

export function UserManagement() {
  const [urlState, setUrlState] = useUsersListSearchParams();

  const filters = useMemo(
    () => ({
      role: urlState.role,
      banned: urlState.banned,
      search: urlState.search || undefined,
      limit: urlState.limit,
      offset: urlState.offset,
    }),
    [urlState]
  );

  const { data, error } = useUsers(filters);

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
  const users: User[] =
    (data as UserListResponse<User> | undefined)?.users ?? [];

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
      <CardContent className="space-y-4">
        <search
          aria-label="Filter users"
          className="flex flex-wrap items-end gap-4"
        >
          <div className="min-w-[200px] space-y-2">
            <Label htmlFor="users-search">Search by email</Label>
            <Input
              aria-describedby="users-search-desc"
              autoComplete="off"
              id="users-search"
              onChange={(e) => {
                const { value } = e.target;
                setUrlState(
                  { search: value },
                  {
                    limitUrlUpdates: value === "" ? undefined : debounce(500),
                  }
                );
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const { value } = e.currentTarget;
                  setUrlState({ search: value });
                }
              }}
              placeholder="Search users by email..."
              type="search"
              value={urlState.search}
            />
            <span className="sr-only" id="users-search-desc">
              Filters the list by email; updates on change
            </span>
          </div>
          <div className="min-w-[140px] space-y-2">
            <Label htmlFor="users-role">Role</Label>
            <Select
              onValueChange={(value) =>
                setUrlState({ role: value as "user" | "staff" | "admin" })
              }
              value={urlState.role}
            >
              <SelectTrigger id="users-role">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 space-y-2">
            <Switch
              aria-label="Show banned users only"
              checked={urlState.banned}
              id="users-banned"
              onCheckedChange={(checked) => setUrlState({ banned: checked })}
            />
            <Label className="cursor-pointer" htmlFor="users-banned">
              Banned only
            </Label>
          </div>
        </search>
        <DataTable<User, unknown> columns={columns} data={users} />
      </CardContent>
    </Card>
  );
}
