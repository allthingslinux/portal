"use client";

import { ArrowDown, ArrowUp, ArrowUpDown, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { UseMutationResult } from "@tanstack/react-query";
import { type ColumnDef, createColumnHelper } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import type { Session } from "@/shared/api/types";

function getSortIcon(sorted: false | "asc" | "desc") {
  if (sorted === "asc") {
    return <ArrowUp className="ml-2 h-4 w-4" />;
  }
  if (sorted === "desc") {
    return <ArrowDown className="ml-2 h-4 w-4" />;
  }
  return <ArrowUpDown className="ml-2 h-4 w-4" />;
}

interface SessionMutations {
  deleteSession: UseMutationResult<unknown, Error, string, unknown>;
}

export function createSessionColumns(
  mutations: SessionMutations
): ColumnDef<Session>[] {
  const columnHelper = createColumnHelper<Session>();

  return [
    columnHelper.accessor("userId", {
      size: 280,
      minSize: 220,
      header: ({ column }) => {
        const sorted = column.getIsSorted();
        return (
          <Button onClick={column.getToggleSortingHandler()} variant="ghost">
            User
            {getSortIcon(sorted)}
          </Button>
        );
      },
      cell: ({ row, getValue }) => {
        const userId = getValue();
        const session = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-mono text-sm">{userId.slice(0, 8)}...</span>
            <span className="text-muted-foreground text-xs">
              {session.user?.email || session.user?.name || "Unknown"}
            </span>
          </div>
        );
      },
    }),
    columnHelper.accessor("ipAddress", {
      size: 150,
      minSize: 120,
      header: "IP Address",
      cell: ({ getValue }) => {
        const ipAddress = getValue();
        return ipAddress || "Unknown";
      },
    }),
    columnHelper.accessor("userAgent", {
      header: "User Agent",
      size: 400,
      minSize: 200,
      maxSize: 600,
      meta: {
        align: "left",
        wrap: true,
      },
      cell: ({ getValue }) => {
        const userAgent = getValue();
        return (
          <div className="wrap-break-word min-w-0">
            {userAgent || "Unknown"}
          </div>
        );
      },
    }),
    columnHelper.accessor("createdAt", {
      size: 120,
      minSize: 100,
      sortingFn: "datetime",
      meta: {
        align: "right",
      },
      header: ({ column }) => {
        const sorted = column.getIsSorted();
        return (
          <Button
            className="ml-auto"
            onClick={column.getToggleSortingHandler()}
            variant="ghost"
          >
            Created
            {getSortIcon(sorted)}
          </Button>
        );
      },
      cell: ({ getValue }) => {
        const date = getValue();
        return new Date(date).toLocaleDateString();
      },
    }),
    columnHelper.accessor("expiresAt", {
      size: 120,
      minSize: 100,
      sortingFn: "datetime",
      meta: {
        align: "right",
      },
      header: ({ column }) => {
        const sorted = column.getIsSorted();
        return (
          <Button
            className="ml-auto"
            onClick={column.getToggleSortingHandler()}
            variant="ghost"
          >
            Expires
            {getSortIcon(sorted)}
          </Button>
        );
      },
      cell: ({ getValue }) => {
        const date = getValue();
        return new Date(date).toLocaleDateString();
      },
    }),
    columnHelper.display({
      id: "actions",
      size: 100,
      minSize: 80,
      meta: {
        align: "right",
      },
      header: "Actions",
      cell: ({ row }) => {
        const session = row.original;

        const handleRevokeSession = async () => {
          try {
            await mutations.deleteSession.mutateAsync(session.id);
            toast.success("Session revoked");
          } catch {
            toast.error("Failed to revoke session");
          }
        };

        return (
          <Button
            disabled={mutations.deleteSession.isPending}
            onClick={handleRevokeSession}
            size="sm"
            variant="outline"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        );
      },
    }),
  ] as ColumnDef<Session>[];
}
