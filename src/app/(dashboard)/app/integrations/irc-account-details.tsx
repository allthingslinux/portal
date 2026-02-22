"use client";

import { AlertCircle, CheckCircle2, Copy } from "lucide-react";
import { toast } from "sonner";
import { captureException, startSpan } from "@sentry/nextjs";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { integrationStatusLabels } from "@/features/integrations/lib/core/constants";
import type { IrcAccount } from "@/features/integrations/lib/irc/types";

interface IrcAccountDetailsProps {
  account: IrcAccount;
}

export function IrcAccountDetails({ account }: IrcAccountDetailsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Nick</Label>
        <p className="font-mono text-muted-foreground text-sm">
          {account.nick}
        </p>
      </div>
      <div className="space-y-2">
        <Label>Connect</Label>
        <div className="flex items-center gap-2">
          <code className="rounded-md bg-muted px-2 py-1 text-sm">
            {account.server}:{account.port}
          </code>
          <Button
            aria-label="Copy connect string"
            onClick={async () => {
              await startSpan(
                {
                  name: "Copy IRC connect string",
                  op: "ui.action",
                  attributes: { integrationId: "irc" },
                },
                async () => {
                  try {
                    const text = `${account.server}:${account.port}`;
                    if (navigator.clipboard?.writeText) {
                      await navigator.clipboard.writeText(text);
                    } else {
                      const ta = document.createElement("textarea");
                      ta.value = text;
                      document.body.appendChild(ta);
                      ta.select();
                      if (!document.execCommand("copy")) {
                        throw new Error("execCommand copy failed");
                      }
                      document.body.removeChild(ta);
                    }
                    toast.success("Copied", {
                      description: "Connect string copied",
                    });
                  } catch (err) {
                    captureException(err);
                    toast.error("Failed to copy");
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
        <p className="text-muted-foreground text-xs">
          Use TLS. Identify with /msg NickServ IDENTIFY nick &lt;password&gt;
        </p>
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
    </div>
  );
}
