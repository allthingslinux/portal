"use client";

import { memo, useMemo } from "react";
import type { Session } from "@portal/api/types";
import type { SessionListResponse } from "@portal/types/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@portal/ui/ui/card";

import { DataTable } from "./data-table";
import { createSessionColumns } from "./session-columns";
import {
  useDeleteSession,
  useSessions,
} from "@/features/admin/hooks/use-admin";

function SessionManagementInner() {
  const { data, error } = useSessions();
  const deleteSession = useDeleteSession();

  // Create columns with mutations
  const columns = useMemo(
    () =>
      createSessionColumns({
        deleteSession,
      }),
    [deleteSession]
  );

  // Stable data reference for table (TanStack Table: memoize data to prevent unnecessary re-renders)
  const sessions = useMemo(
    () => (data as SessionListResponse<Session> | undefined)?.sessions ?? [],
    [data]
  );

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Session Management</CardTitle>
          <CardDescription>
            View and manage active user sessions across the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-destructive">
            Failed to load sessions: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Session Management</CardTitle>
        <CardDescription>
          View and manage active user sessions across the platform.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <DataTable<Session, unknown>
          columns={columns}
          data={sessions}
          searchKey="userId"
          searchLabel="Search"
          searchPlaceholder="Search sessions by user ID..."
        />
      </CardContent>
    </Card>
  );
}

export const SessionManagement = memo(SessionManagementInner);
