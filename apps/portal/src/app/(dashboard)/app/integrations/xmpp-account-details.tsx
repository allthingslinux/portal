"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@portal/ui/ui/button";
import { captureException, startSpan } from "@sentry/nextjs";

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
      <div className="space-y-1">
        <p className="text-muted-foreground text-xs">JID</p>
        <div className="flex items-center gap-1">
          <code className="font-mono text-sm">{account.jid}</code>
          <Button
            aria-label="Copy JID"
            className="h-6 w-6 p-0"
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
            <Copy className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
