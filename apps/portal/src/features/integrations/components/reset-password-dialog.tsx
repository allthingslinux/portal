"use client";

import { useState } from "react";
import { Copy, KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@portal/ui/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@portal/ui/ui/dialog";
import { Input } from "@portal/ui/ui/input";
import { Label } from "@portal/ui/ui/label";
import * as Sentry from "@sentry/nextjs";

import { useResetIntegrationPassword } from "@/features/integrations/hooks/use-integration";

interface ResetPasswordDialogProps {
  integrationId: string;
  integrationName: string;
  accountId: string;
  /**
   * "user-chosen" — user enters a new password (XMPP).
   * "generated" — server generates a random password and returns it (IRC).
   */
  mode: "user-chosen" | "generated";
}

export function ResetPasswordDialog({
  integrationId,
  integrationName,
  accountId,
  mode,
}: ResetPasswordDialogProps) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(
    null
  );
  const resetMutation = useResetIntegrationPassword(integrationId);

  const resetForm = () => {
    setPassword("");
    setConfirmPassword("");
    setGeneratedPassword(null);
  };

  const handleUserChosenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password.trim()) {
      toast.error("Password is required");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await resetMutation.mutateAsync({ id: accountId, password });
      toast.success(`${integrationName} password updated`);
      setOpen(false);
      resetForm();
    } catch (error) {
      Sentry.captureException(error);
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to reset ${integrationName} password`
      );
    }
  };

  const handleGeneratedReset = async () => {
    try {
      const result = await resetMutation.mutateAsync({ id: accountId });
      if (result.temporaryPassword) {
        setGeneratedPassword(result.temporaryPassword);
      } else {
        toast.success(`${integrationName} password reset`);
        setOpen(false);
        resetForm();
      }
    } catch (error) {
      Sentry.captureException(error);
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to reset ${integrationName} password`
      );
    }
  };

  const renderDialogBody = () => {
    if (mode === "user-chosen") {
      return (
        <form onSubmit={handleUserChosenSubmit}>
          <DialogHeader>
            <DialogTitle>Reset {integrationName} Password</DialogTitle>
            <DialogDescription>
              Enter a new password for your {integrationName} account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                autoComplete="new-password"
                disabled={resetMutation.isPending}
                id="new-password"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                type="password"
                value={password}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                autoComplete="new-password"
                disabled={resetMutation.isPending}
                id="confirm-password"
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                type="password"
                value={confirmPassword}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              disabled={resetMutation.isPending}
              onClick={() => setOpen(false)}
              type="button"
              variant="ghost"
            >
              Cancel
            </Button>
            <Button disabled={resetMutation.isPending} type="submit">
              {resetMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </DialogFooter>
        </form>
      );
    }

    if (generatedPassword) {
      return (
        <>
          <DialogHeader>
            <DialogTitle>New {integrationName} Password</DialogTitle>
            <DialogDescription>
              Save this password now. It will not be shown again.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-2">
              <code className="flex-1 break-all rounded-md bg-muted px-3 py-2 font-mono text-sm">
                {generatedPassword}
              </code>
              <Button
                aria-label="Copy password"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(generatedPassword);
                    toast.success("Password copied");
                  } catch {
                    toast.error("Failed to copy");
                  }
                }}
                size="sm"
                variant="ghost"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setOpen(false);
                resetForm();
              }}
            >
              I&apos;ve saved my password
            </Button>
          </DialogFooter>
        </>
      );
    }

    return (
      <>
        <DialogHeader>
          <DialogTitle>Reset {integrationName} Password</DialogTitle>
          <DialogDescription>
            A new random password will be generated for your {integrationName}{" "}
            account. Your current password will stop working immediately.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            disabled={resetMutation.isPending}
            onClick={() => setOpen(false)}
            type="button"
            variant="ghost"
          >
            Cancel
          </Button>
          <Button
            disabled={resetMutation.isPending}
            onClick={handleGeneratedReset}
          >
            {resetMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </DialogFooter>
      </>
    );
  };

  return (
    <Dialog
      onOpenChange={(v: boolean) => {
        setOpen(v);
        if (!v) {
          resetForm();
        }
      }}
      open={open}
    >
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        <KeyRound className="mr-2 h-4 w-4" />
        Reset Password
      </DialogTrigger>
      <DialogContent>{renderDialogBody()}</DialogContent>
    </Dialog>
  );
}
