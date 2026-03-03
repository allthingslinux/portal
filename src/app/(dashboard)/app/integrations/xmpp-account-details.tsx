"use client";

import { AlertCircle, CheckCircle2, Copy } from "lucide-react";
import { toast } from "sonner";
import { captureException, startSpan } from "@sentry/nextjs";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ResetPasswordDialog } from "@/features/integrations/components/reset-password-dialog";
import { integrationStatusLabels } from "@/features/integrations/lib/core/constants";
import type { XmppAccount } from "@/features/integrations/lib/xmpp/types";

interface XmppAccountDetailsProps {
  account: XmppAccount;
  integrationId: string;
}

export function XmppAccountDetails({
  account,
  integrationId,
}: XmppAccountDetailsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>JID (Full Address)</Label>
        <div className="flex items-center gap-2">
          <code className="rounded-md bg-muted px-2 py-1 text-sm">
            {account.jid}
          </code>
          <Button
            aria-label="Copy JID"
            onClick={async () => {
              await startSpan(
                {
                  name: "Copy XMPP JID",
                  op: "ui.action",
                  attributes: { integrationId },
                },
                async () => {
                  try {
                    if (navigator.clipboard?.writeText) {
                      await navigator.clipboard.writeText(account.jid);
                      toast.success("Copied", {
                        description: "JID copied to clipboard",
                      });
                    } else {
                      const textArea = document.createElement("textarea");
                      textArea.value = account.jid;
                      document.body.appendChild(textArea);
                      textArea.select();
                      if (!document.execCommand("copy")) {
                        throw new Error("execCommand copy failed");
                      }
                      document.body.removeChild(textArea);
                      toast.success("Copied", {
                        description: "JID copied to clipboard",
                      });
                    }
                  } catch (error) {
                    captureException(error);
                    toast.error("Failed to copy", {
                      description: "Could not copy JID to clipboard",
                    });
                  }
                }
              );
            }}
            size="sm"
            variant="ghost"
          >
            <Copy className="h-4 w-4" />
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
              <span className="text-sm">
                {integrationStatusLabels[account.status]}
              </span>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">
                {account.status in integrationStatusLabels
                  ? integrationStatusLabels[
                      account.status as keyof typeof integrationStatusLabels
                    ]
                  : account.status}
              </span>
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

      <div className="pt-2">
        <ResetPasswordDialog
          accountId={account.id}
          integrationId={integrationId}
          integrationName="XMPP"
          mode="user-chosen"
        />
      </div>
    </div>
  );
}
