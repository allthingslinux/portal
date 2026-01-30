"use client";

import { memo, useMemo } from "react";
import { type ColumnDef, createColumnHelper } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "./data-table";
import { useAdminIrcAccounts } from "@/features/admin/hooks/use-admin";
import { integrationStatusLabels } from "@/features/integrations/lib/core/constants";
import type { IrcAccountWithUser } from "@/shared/api/types";
import { formatDate } from "@/shared/utils/date";

const columnHelper = createColumnHelper<IrcAccountWithUser>();

function createIrcAccountColumns() {
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
    columnHelper.accessor("nick", {
      header: "Nick",
      cell: ({ getValue }) => <span className="font-mono">{getValue()}</span>,
    }),
    columnHelper.accessor("server", {
      header: "Server",
      cell: ({ row }) => `${row.original.server}:${row.original.port}`,
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
  ] as ColumnDef<IrcAccountWithUser, unknown>[];
}

function IrcAccountsManagementInner() {
  const { data, error, isPending } = useAdminIrcAccounts();
  const columns = useMemo(() => createIrcAccountColumns(), []);
  const ircAccounts = useMemo(() => data?.ircAccounts ?? [], [data]);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>IRC Accounts</CardTitle>
          <CardDescription>
            All IRC (NickServ) accounts provisioned via Portal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-destructive">
            Failed to load IRC accounts: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isPending && !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>IRC Accounts</CardTitle>
          <CardDescription>
            All IRC (NickServ) accounts provisioned via Portal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            Loading IRC accounts…
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>IRC Accounts</CardTitle>
        <CardDescription>
          All IRC (NickServ) accounts provisioned via Portal.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable<IrcAccountWithUser, unknown>
          columns={columns}
          data={ircAccounts}
        />
      </CardContent>
    </Card>
  );
}

export const IrcAccountsManagement = memo(IrcAccountsManagementInner);
