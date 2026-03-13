"use client";

import { memo, useMemo, useState } from "react";
import type { UserWithIntegrations } from "@portal/api/types";
import type { UserListWithIntegrationsResponse } from "@portal/types/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@portal/ui/ui/card";
import { Input } from "@portal/ui/ui/input";
import { Label } from "@portal/ui/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@portal/ui/ui/select";
import type { ColumnDef } from "@tanstack/react-table";

import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { DataTable } from "./data-table";
import { createUnifiedUserColumns } from "./unified-user-columns";
import { UserDetailSheet } from "./user-detail-sheet";
import { useUsers } from "@/features/admin/hooks/use-admin";
import {
  useBanUser,
  useSetUserRole,
  useUnbanUser,
} from "@/features/admin/hooks/use-admin-actions";
import { useUsersListSearchParams } from "@/features/admin/hooks/use-users-list-search-params";

const ROLE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "user", label: "User" },
  { value: "staff", label: "Staff" },
  { value: "admin", label: "Admin" },
] as const;

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "banned", label: "Banned" },
] as const;

type RoleValue = (typeof ROLE_OPTIONS)[number]["value"];
type StatusValue = (typeof STATUS_OPTIONS)[number]["value"];

const SEARCH_DEBOUNCE_MS = 300;

function UnifiedUserManagementInner() {
  const [detailUserId, setDetailUserId] = useState<string | null>(null);
  const [urlState, setUrlState] = useUsersListSearchParams();
  const debouncedSearch = useDebouncedValue(
    urlState.search,
    SEARCH_DEBOUNCE_MS
  );

  const filters = useMemo(
    () => ({
      role: urlState.role === "all" ? undefined : urlState.role,
      banned:
        urlState.status === "all" ? undefined : urlState.status === "banned",
      search: debouncedSearch || undefined,
      limit: urlState.limit,
      offset: urlState.offset,
      expandIntegrations: true,
    }),
    [
      urlState.role,
      urlState.status,
      urlState.limit,
      urlState.offset,
      debouncedSearch,
    ]
  );

  const { data, error, isPending } = useUsers(filters);

  const setRole = useSetUserRole();
  const banUser = useBanUser();
  const unbanUser = useUnbanUser();

  const columns = useMemo(
    () =>
      createUnifiedUserColumns({
        setRole,
        banUser,
        unbanUser,
        onViewDetails: (id) => setDetailUserId(id),
      }),
    [setRole, banUser, unbanUser]
  );

  const users = useMemo(
    () => (data as UserListWithIntegrationsResponse | undefined)?.users ?? [],
    [data]
  );

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Manage user accounts, roles, and integration accounts (IRC, XMPP,
            Mailcow, MediaWiki).
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

  if (isPending && !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Manage user accounts, roles, and integration accounts (IRC, XMPP,
            Mailcow, MediaWiki).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            Loading users…
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Manage user accounts, roles, and integration accounts (IRC, XMPP,
            Mailcow, MediaWiki).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <DataTable<UserWithIntegrations, unknown>
            columns={columns as ColumnDef<UserWithIntegrations, unknown>[]}
            data={users}
            toolbarContent={
              <search
                aria-label="Filter users"
                className="grid gap-x-4 gap-y-2 sm:grid-cols-[minmax(180px,1fr)_140px_140px]"
              >
                <Label className="self-end" htmlFor="users-search">
                  Search
                </Label>
                <Label className="self-end" htmlFor="users-role">
                  Role
                </Label>
                <Label className="self-end" htmlFor="users-status">
                  Status
                </Label>
                <div className="min-w-0">
                  <Input
                    aria-describedby="users-search-desc"
                    autoComplete="off"
                    className="h-9 w-full"
                    id="users-search"
                    onChange={(e) => setUrlState({ search: e.target.value })}
                    placeholder="Search users by email or name..."
                    type="search"
                    value={urlState.search}
                  />
                  <span className="sr-only" id="users-search-desc">
                    Filters the list by email or name; updates on change
                  </span>
                </div>
                <Select
                  onValueChange={(value) =>
                    setUrlState({ role: value as RoleValue })
                  }
                  value={urlState.role}
                >
                  <SelectTrigger className="h-9 w-full" id="users-role">
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
                <Select
                  onValueChange={(value) =>
                    setUrlState({ status: value as StatusValue })
                  }
                  value={urlState.status}
                >
                  <SelectTrigger className="h-9 w-full" id="users-status">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </search>
            }
          />
        </CardContent>
      </Card>
      <UserDetailSheet
        onOpenChange={(open) => !open && setDetailUserId(null)}
        open={!!detailUserId}
        userId={detailUserId}
      />
    </>
  );
}

export const UnifiedUserManagement = memo(UnifiedUserManagementInner);
