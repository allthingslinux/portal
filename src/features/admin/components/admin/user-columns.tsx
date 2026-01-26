"use client";

import { ArrowDown, ArrowUp, ArrowUpDown, Ban, Eye } from "lucide-react";
import type { UseMutationResult } from "@tanstack/react-query";
import { type ColumnDef, createColumnHelper } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { User } from "@/shared/api/types";

function getSortIcon(sorted: false | "asc" | "desc") {
  if (sorted === "asc") {
    return <ArrowUp className="ml-2 h-4 w-4" />;
  }
  if (sorted === "desc") {
    return <ArrowDown className="ml-2 h-4 w-4" />;
  }
  return <ArrowUpDown className="ml-2 h-4 w-4" />;
}

interface UserMutations {
  setRole: UseMutationResult<
    unknown,
    Error,
    { userId: string; role: "user" | "staff" | "admin" },
    unknown
  >;
  banUser: UseMutationResult<unknown, Error, { userId: string }, unknown>;
  unbanUser: UseMutationResult<unknown, Error, string, unknown>;
  impersonateUser: UseMutationResult<unknown, Error, string, unknown>;
}

export function createUserColumns(mutations: UserMutations): ColumnDef<User>[] {
  const columnHelper = createColumnHelper<User>();

  return [
    columnHelper.accessor("email", {
      size: 250,
      minSize: 200,
      header: ({ column }) => {
        const sorted = column.getIsSorted();
        return (
          <Button onClick={column.getToggleSortingHandler()} variant="ghost">
            Email
            {getSortIcon(sorted)}
          </Button>
        );
      },
      cell: ({ row, getValue }) => {
        const email = getValue();
        const user = row.original;
        return (
          <div>
            <div className="font-medium">{user.name || "N/A"}</div>
            <div className="text-muted-foreground text-sm">{email}</div>
          </div>
        );
      },
    }),
    columnHelper.accessor("role", {
      size: 150,
      minSize: 120,
      header: ({ column }) => {
        const sorted = column.getIsSorted();
        return (
          <Button onClick={column.getToggleSortingHandler()} variant="ghost">
            Role
            {getSortIcon(sorted)}
          </Button>
        );
      },
      cell: ({ row, getValue }) => {
        const role = getValue() || "user";
        const user = row.original;

        return (
          <Select
            disabled={mutations.setRole.isPending}
            onValueChange={(newRole) =>
              mutations.setRole.mutate({
                userId: user.id,
                role: newRole as "user" | "staff" | "admin",
              })
            }
            value={role}
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
        );
      },
    }),
    columnHelper.accessor("banned", {
      size: 120,
      minSize: 100,
      header: "Status",
      cell: ({ getValue }) => {
        const banned = getValue();
        return banned === true ? (
          <Badge variant="destructive">Banned</Badge>
        ) : (
          <Badge variant="secondary">Active</Badge>
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
    columnHelper.display({
      id: "actions",
      size: 150,
      minSize: 120,
      meta: {
        align: "right",
      },
      header: "Actions",
      cell: ({ row }) => {
        const user = row.original;

        return (
          <div className="flex justify-end gap-2">
            <Button
              disabled={mutations.impersonateUser.isPending}
              onClick={() => mutations.impersonateUser.mutate(user.id)}
              size="sm"
              variant="outline"
            >
              <Eye className="h-4 w-4" />
            </Button>
            {user.banned ? (
              <Button
                disabled={mutations.unbanUser.isPending}
                onClick={() => mutations.unbanUser.mutate(user.id)}
                size="sm"
                variant="outline"
              >
                Unban
              </Button>
            ) : (
              <Button
                disabled={mutations.banUser.isPending}
                onClick={() => mutations.banUser.mutate({ userId: user.id })}
                size="sm"
                variant="outline"
              >
                <Ban className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      },
    }),
  ] as unknown as ColumnDef<User>[];
}
