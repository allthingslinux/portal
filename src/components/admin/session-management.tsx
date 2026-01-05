"use client";

import { useCallback, useEffect, useState } from "react";
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
import { authClient } from "@/auth/client";

interface Session {
  id: string;
  userId: string;
  userAgent?: string;
  ipAddress?: string;
  createdAt: string;
  expiresAt: string;
  impersonatedBy?: string;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}

export function SessionManagement() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/sessions");
      if (!response.ok) {
        throw new Error("Failed to fetch sessions");
      }
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      toast.error("Failed to fetch sessions");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleRevokeSession = async (sessionToken: string) => {
    try {
      await authClient.admin.revokeUserSession({
        sessionToken,
      });
      toast.success("Session revoked");
      fetchSessions();
    } catch (_error) {
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
              {loading && (
                <TableRow>
                  <TableCell className="text-center" colSpan={7}>
                    Loading...
                  </TableCell>
                </TableRow>
              )}
              {!loading && sessions.length === 0 && (
                <TableRow>
                  <TableCell className="text-center" colSpan={7}>
                    No active sessions found.
                  </TableCell>
                </TableRow>
              )}
              {!loading &&
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
