"use client";

import { memo, useMemo, useState } from "react";
import type { MailcowAccountWithUser } from "@portal/api/types";
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
import { useAdminMailcowAccounts } from "@/features/admin/hooks/use-admin";
import { integrationStatusLabels } from "@/features/integrations/lib/core/constants";

const columnHelper = createColumnHelper<MailcowAccountWithUser>();

function createMailcowAccountColumns() {
  return [
    columnHelper.accessor((row) => row.user?.email ?? row.userId, {
      id: "user",
      header: "User",
      cell: ({ row }) => {
        const { user } = row.original;
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
    columnHelper.accessor("email", {
      header: "Email",
      cell: ({ getValue }) => <span className="font-mono">{getValue()}</span>,
    }),
    columnHelper.accessor("domain", {
      header: "Domain",
      cell: ({ getValue }) => <span className="font-mono">{getValue()}</span>,
    }),
    columnHelper.accessor("localPart", {
      header: "Local part",
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
  ] as ColumnDef<MailcowAccountWithUser, unknown>[];
}

const MAILCOW_STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "deleted", label: "Deleted" },
] as const;

function MailcowAccountsManagementInner() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const filters = useMemo(
    () => ({ status: statusFilter === "all" ? undefined : statusFilter }),
    [statusFilter]
  );
  const { data, error, isPending } = useAdminMailcowAccounts(filters);
  const columns = useMemo(() => createMailcowAccountColumns(), []);
  const mailcowAccounts = useMemo(() => data?.mailcowAccounts ?? [], [data]);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mailcow Accounts</CardTitle>
          <CardDescription>
            All Mailcow email accounts provisioned via Portal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-destructive">
            Failed to load Mailcow accounts: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isPending && !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mailcow Accounts</CardTitle>
          <CardDescription>
            All Mailcow email accounts provisioned via Portal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            Loading Mailcow accounts…
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mailcow Accounts</CardTitle>
        <CardDescription>
          All Mailcow email accounts provisioned via Portal.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable<MailcowAccountWithUser, unknown>
          columns={columns}
          data={mailcowAccounts}
          toolbarContent={
            <Select
              onValueChange={(value) => setStatusFilter(value ?? "")}
              value={statusFilter}
            >
              <SelectTrigger className="max-w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {MAILCOW_STATUS_OPTIONS.map((opt) => (
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

export const MailcowAccountsManagement = memo(MailcowAccountsManagementInner);
