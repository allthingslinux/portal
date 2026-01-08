"use client";

import { useMemo } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDeleteSession, useSessions } from "@/hooks/use-admin";
import { DataTable } from "./data-table";
import { createSessionColumns } from "./session-columns";

export function SessionManagement() {
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

  // Get sessions data
  const sessions = data?.sessions ?? [];

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
      <CardContent>
        <DataTable
          columns={columns}
          data={sessions}
          searchKey="userId"
          searchPlaceholder="Search sessions by user ID..."
        />
      </CardContent>
    </Card>
  );
}
