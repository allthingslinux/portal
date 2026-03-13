"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Ban,
  MoreHorizontal,
  UserCircle,
} from "lucide-react";
import type { UserWithIntegrations } from "@portal/api/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@portal/ui/ui/alert-dialog";
import { Badge } from "@portal/ui/ui/badge";
import { Button } from "@portal/ui/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@portal/ui/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@portal/ui/ui/select";
import type { UseMutationResult } from "@tanstack/react-query";
import { type ColumnDef, createColumnHelper } from "@tanstack/react-table";

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
  banUser: UseMutationResult<unknown, Error, { userId: string }, unknown>;
  onViewDetails?: (userId: string) => void;
  setRole: UseMutationResult<
    unknown,
    Error,
    { userId: string; role: "user" | "staff" | "admin" },
    unknown
  >;
  unbanUser: UseMutationResult<unknown, Error, string, unknown>;
}

function UserActionsCell({
  user,
  mutations,
}: {
  user: UserWithIntegrations;
  mutations: UserMutations;
}) {
  const [pendingBanUser, setPendingBanUser] =
    useState<UserWithIntegrations | null>(null);
  const isBanUnbanPending =
    mutations.banUser.isPending || mutations.unbanUser.isPending;

  const handleBanConfirm = () => {
    if (pendingBanUser) {
      mutations.banUser.mutate({ userId: pendingBanUser.id });
      setPendingBanUser(null);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="User actions"
          disabled={isBanUnbanPending}
          render={<Button size="sm" variant="ghost" />}
        >
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {mutations.onViewDetails && (
            <>
              <DropdownMenuItem
                onClick={() => mutations.onViewDetails?.(user.id)}
              >
                <UserCircle className="h-4 w-4" />
                View details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          {user.banned ? (
            <DropdownMenuItem
              disabled={mutations.unbanUser.isPending}
              onClick={() => mutations.unbanUser.mutate(user.id)}
            >
              Unban user
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              disabled={mutations.banUser.isPending}
              onClick={() => setPendingBanUser(user)}
              variant="destructive"
            >
              <Ban className="h-4 w-4" />
              Ban user
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        onOpenChange={(open) => !open && setPendingBanUser(null)}
        open={!!pendingBanUser}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader className="gap-3">
            <AlertDialogTitle>Ban user?</AlertDialogTitle>
            <AlertDialogDescription className="text-[15px] leading-relaxed">
              {pendingBanUser && (
                <span className="block">
                  This will ban{" "}
                  <span className="font-medium">
                    {pendingBanUser.name || pendingBanUser.email}
                  </span>
                  .
                </span>
              )}
              {pendingBanUser && (
                <span className="mt-2 block">
                  They will not be able to sign in until unbanned.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleBanConfirm}
            >
              Ban user
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

const EMPTY = "—";

export function createUnifiedUserColumns(
  mutations: UserMutations
): ColumnDef<UserWithIntegrations>[] {
  const columnHelper = createColumnHelper<UserWithIntegrations>();

  return [
    columnHelper.accessor("email", {
      size: 220,
      minSize: 180,
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
      size: 120,
      minSize: 100,
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
            <SelectTrigger className="w-[120px]">
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
      size: 90,
      minSize: 80,
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
    columnHelper.accessor((row) => row.ircAccount?.nick ?? null, {
      id: "irc",
      size: 110,
      minSize: 90,
      header: "IRC",
      cell: ({ row }) => (
        <span className="font-mono text-sm">
          {row.original.ircAccount?.nick ?? EMPTY}
        </span>
      ),
    }),
    columnHelper.accessor(
      (row) => row.xmppAccount?.jid ?? row.xmppAccount?.username ?? null,
      {
        id: "xmpp",
        size: 140,
        minSize: 110,
        header: "XMPP",
        cell: ({ row }) => (
          <span className="font-mono text-sm">
            {row.original.xmppAccount?.username ??
              row.original.xmppAccount?.jid ??
              EMPTY}
          </span>
        ),
      }
    ),
    columnHelper.accessor((row) => row.mailcowAccount?.email ?? null, {
      id: "mailcow",
      size: 160,
      minSize: 120,
      header: "Mailcow",
      cell: ({ row }) => (
        <span className="font-mono text-sm">
          {row.original.mailcowAccount?.email ?? EMPTY}
        </span>
      ),
    }),
    columnHelper.accessor((row) => row.mediawikiAccount?.wikiUsername ?? null, {
      id: "mediawiki",
      size: 120,
      minSize: 100,
      header: "MediaWiki",
      cell: ({ row }) => (
        <span className="font-mono text-sm">
          {row.original.mediawikiAccount?.wikiUsername ?? EMPTY}
        </span>
      ),
    }),
    columnHelper.accessor("createdAt", {
      size: 100,
      minSize: 90,
      sortingFn: "datetime",
      meta: { align: "right" },
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
      cell: ({ getValue }) => new Date(getValue()).toLocaleDateString(),
    }),
    columnHelper.display({
      id: "actions",
      size: 80,
      minSize: 70,
      meta: { align: "right" },
      header: "Actions",
      cell: ({ row }) => (
        <UserActionsCell mutations={mutations} user={row.original} />
      ),
    }),
  ] as ColumnDef<UserWithIntegrations>[];
}
