"use client";

import { Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@portal/ui/ui/button";
import { captureException, startSpan } from "@sentry/nextjs";

import { MailboxQuota } from "./mailcow-quota";
import type { MailcowAccount } from "@/features/integrations/lib/mailcow/types";

interface MailcowAccountDetailsProps {
  account: MailcowAccount;
  integrationId: string;
  webmailUrl?: string | null;
}

export function MailcowAccountDetails({
  account,
  integrationId,
  webmailUrl,
}: MailcowAccountDetailsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs">Email</p>
          <div className="flex items-center gap-1">
            <code className="font-mono text-sm">{account.email}</code>
            <Button
              aria-label="Copy email"
              className="h-6 w-6 p-0"
              onClick={async () => {
                await startSpan(
                  {
                    name: "Copy mailcow email",
                    op: "ui.action",
                    attributes: { integrationId },
                  },
                  async () => {
                    try {
                      if (navigator.clipboard?.writeText) {
                        await navigator.clipboard.writeText(account.email);
                        toast.success("Copied", {
                          description: "Email copied to clipboard",
                        });
                      } else {
                        const textArea = document.createElement("textarea");
                        textArea.value = account.email;
                        document.body.appendChild(textArea);
                        textArea.select();
                        if (!document.execCommand("copy")) {
                          throw new Error("execCommand copy failed");
                        }
                        document.body.removeChild(textArea);
                        toast.success("Copied", {
                          description: "Email copied to clipboard",
                        });
                      }
                    } catch (error) {
                      captureException(error);
                      toast.error("Failed to copy", {
                        description: "Could not copy email to clipboard",
                      });
                    }
                  }
                );
              }}
              size="sm"
              variant="ghost"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs">Domain</p>
          <p className="font-mono text-sm">{account.domain}</p>
        </div>
      </div>

      <MailboxQuota accountId={account.id} />

      {webmailUrl && (
        <Button
          render={
            <a
              aria-label="Open webmail"
              href={webmailUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              <ExternalLink className="mr-2 h-3.5 w-3.5" />
              Open Webmail
            </a>
          }
          size="sm"
          variant="outline"
        />
      )}
    </div>
  );
}
