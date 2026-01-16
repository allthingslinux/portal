"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreateXmppAccount,
  useDeleteXmppAccount,
  useXmppAccount,
} from "@/hooks/use-xmpp-account";
import type { XmppAccountStatus } from "@/lib/integrations/xmpp/types";

export function XmppAccountManagement() {
  const { data: account, isLoading, error } = useXmppAccount();
  const createMutation = useCreateXmppAccount();
  const deleteMutation = useDeleteXmppAccount();
  const [username, setUsername] = useState("");

  const handleCreate = async () => {
    try {
      await createMutation.mutateAsync({
        username: username.trim() || undefined,
      });
      toast.success("XMPP account created", {
        description: "Your XMPP account has been created successfully.",
      });
      setUsername("");
    } catch (error) {
      toast.error("Failed to create account", {
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while creating your XMPP account.",
      });
    }
  };

  const handleDelete = async () => {
    if (!account) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(account.id);
      toast.success("XMPP account deleted", {
        description: "Your XMPP account has been deleted successfully.",
      });
    } catch (error) {
      toast.error("Failed to delete account", {
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while deleting your XMPP account.",
      });
    }
  };

  const getStatusBadge = (status: XmppAccountStatus) => {
    const variants: Record<
      XmppAccountStatus,
      "default" | "secondary" | "destructive"
    > = {
      active: "default",
      suspended: "secondary",
      deleted: "destructive",
    };

    return (
      <Badge variant={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>Failed to load XMPP account information.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // User doesn't have an XMPP account - show create form
  if (!account) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>XMPP Account</CardTitle>
          <CardDescription>
            Create an XMPP account to use our XMPP chat service. You can connect
            using any XMPP-compatible client.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username (optional)</Label>
            <Input
              disabled={createMutation.isPending}
              id="username"
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Leave empty to use your email username"
              value={username}
            />
            <p className="text-muted-foreground text-sm">
              If left empty, your username will be generated from your email
              address. Username must be alphanumeric with underscores, hyphens,
              or dots.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            disabled={createMutation.isPending}
            onClick={handleCreate}
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create XMPP Account"
            )}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // User has an XMPP account - show account info
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>XMPP Account</CardTitle>
            <CardDescription>
              Manage your XMPP account settings and information.
            </CardDescription>
          </div>
          {getStatusBadge(account.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>JID (Full Address)</Label>
          <div className="flex items-center gap-2">
            <code className="rounded-md bg-muted px-2 py-1 text-sm">
              {account.jid}
            </code>
            <Button
              onClick={async () => {
                try {
                  if (navigator.clipboard?.writeText) {
                    await navigator.clipboard.writeText(account.jid);
                    toast.success("Copied", {
                      description: "JID copied to clipboard",
                    });
                  } else {
                    // Fallback for older browsers
                    const textArea = document.createElement("textarea");
                    textArea.value = account.jid;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand("copy");
                    document.body.removeChild(textArea);
                    toast.success("Copied", {
                      description: "JID copied to clipboard",
                    });
                  }
                } catch {
                  toast.error("Failed to copy", {
                    description: "Could not copy JID to clipboard",
                  });
                }
              }}
              size="sm"
              variant="ghost"
            >
              Copy
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Username</Label>
          <p className="text-muted-foreground text-sm">{account.username}</p>
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <div className="flex items-center gap-2">
            {account.status === "active" ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">Active</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm capitalize">{account.status}</span>
              </>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Created</Label>
          <p className="text-muted-foreground text-sm">
            {new Date(account.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="rounded-lg bg-muted p-4">
          <h4 className="mb-2 font-semibold text-sm">How to Connect</h4>
          <ol className="space-y-1 text-muted-foreground text-sm">
            <li>
              1. Download an XMPP client (e.g., Gajim, Conversations, Pidgin)
            </li>
            <li>2. Add a new account with JID: {account.jid}</li>
            <li>
              3. Use your Portal password for authentication (legacy clients)
            </li>
            <li>
              4. Or use OAuth token authentication (modern clients with
              OAUTHBEARER support)
            </li>
          </ol>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button disabled={deleteMutation.isPending} variant="destructive">
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </>
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete XMPP Account?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete your XMPP account ({account.jid}).
                This action cannot be undone. You will need to create a new
                account if you want to use XMPP again.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={handleDelete}
              >
                Delete Account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
