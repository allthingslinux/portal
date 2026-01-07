"use client";

import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDeleteSession, useSessions } from "@/hooks/use-admin";

export function SessionManagement() {
  const { data, isPending, error } = useSessions();
  const deleteSession = useDeleteSession();

  // Data is prefetched on the server, so it should be available immediately
  const sessions = data?.sessions ?? [];

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await deleteSession.mutateAsync(sessionId);
      toast.success("Session revoked");
    } catch {
      toast.error("Failed to revoke session");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Session Management</CardTitle>
        <CardDescription>
          View and manage active user sessions across the platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>User Agent</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {error && (
                <TableRow>
                  <TableCell
                    className="text-center text-destructive"
                    colSpan={7}
                  >
                    Failed to load sessions: {error.message}
                  </TableCell>
                </TableRow>
              )}
              {!(isPending || error) && sessions.length === 0 && (
                <TableRow>
                  <TableCell className="text-center" colSpan={7}>
                    No active sessions found.
                  </TableCell>
                </TableRow>
              )}
              {!(isPending || error) &&
                sessions.length > 0 &&
                sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-mono text-sm">
                          {session.userId.slice(0, 8)}...
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {session.user?.email || session.user?.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{session.ipAddress || "Unknown"}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {session.userAgent || "Unknown"}
                    </TableCell>
                    <TableCell>
                      {new Date(session.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(session.expiresAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {session.impersonatedBy ? (
                        <Badge variant="outline">Impersonated</Badge>
                      ) : (
                        <Badge variant="secondary">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        disabled={deleteSession.isPending}
                        onClick={() => handleRevokeSession(session.id)}
                        size="sm"
                        variant="outline"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
