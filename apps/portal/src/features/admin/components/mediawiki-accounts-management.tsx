"use client";

import { memo, useMemo, useState } from "react";
import type { MediawikiAccountWithUser } from "@portal/api/types";
import { Badge } from "@portal/ui/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@portal/ui/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@portal/ui/ui/select";
import { formatDate } from "@portal/utils/date";
import { type ColumnDef, createColumnHelper } from "@tanstack/react-table";

import { DataTable } from "./data-table";
import { useAdminMediawikiAccounts } from "@/features/admin/hooks/use-admin";
import { integrationStatusLabels } from "@/features/integrations/lib/core/constants";

const columnHelper = createColumnHelper<MediawikiAccountWithUser>();

function createMediawikiAccountColumns() {
  return [
    columnHelper.accessor((row) => row.user?.email ?? row.userId, {
      id: "user",
      header: "User",
      cell: ({ row }) => {
        const user = row.original.user;
        if (!user) {
          return (
            <span className="font-mono text-muted-foreground text-sm">
              {row.original.userId.slice(0, 8)}…
            </span>
          );
        }
        return (
          <div>
            <div className="font-medium">{user.name ?? "—"}</div>
            <div className="text-muted-foreground text-sm">{user.email}</div>
          </div>
        );
      },
    }),
    columnHelper.accessor("wikiUsername", {
      header: "Wiki Username",
      cell: ({ getValue }) => <span className="font-mono">{getValue()}</span>,
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: ({ getValue }) => (
        <Badge variant="outline">
          {integrationStatusLabels[
            getValue() as keyof typeof integrationStatusLabels
          ] ?? getValue()}
        </Badge>
      ),
    }),
    columnHelper.accessor("createdAt", {
      header: "Created",
      sortingFn: "datetime",
      cell: ({ getValue }) => formatDate(getValue() as string),
    }),
  ] as ColumnDef<MediawikiAccountWithUser, unknown>[];
}

const MEDIAWIKI_STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "suspended", label: "Suspended" },
  { value: "deleted", label: "Deleted" },
] as const;

function MediawikiAccountsManagementInner() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const filters = useMemo(
    () => ({ status: statusFilter === "all" ? undefined : statusFilter }),
    [statusFilter]
  );
  const { data, error, isPending } = useAdminMediawikiAccounts(filters);
  const columns = useMemo(() => createMediawikiAccountColumns(), []);
  const mediawikiAccounts = useMemo(
    () => data?.mediawikiAccounts ?? [],
    [data]
  );

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>MediaWiki Accounts</CardTitle>
          <CardDescription>
            All MediaWiki accounts provisioned via Portal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-destructive">
            Failed to load MediaWiki accounts: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isPending && !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>MediaWiki Accounts</CardTitle>
          <CardDescription>
            All MediaWiki accounts provisioned via Portal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            Loading MediaWiki accounts…
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>MediaWiki Accounts</CardTitle>
        <CardDescription>
          All MediaWiki accounts provisioned via Portal.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable<MediawikiAccountWithUser, unknown>
          columns={columns}
          data={mediawikiAccounts}
          toolbarContent={
            <Select
              onValueChange={(value) => setStatusFilter(value ?? "")}
              value={statusFilter}
            >
              <SelectTrigger className="max-w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {MEDIAWIKI_STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          }
        />
      </CardContent>
    </Card>
  );
}

export const MediawikiAccountsManagement = memo(
  MediawikiAccountsManagementInner
);
