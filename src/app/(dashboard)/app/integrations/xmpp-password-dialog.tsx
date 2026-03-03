"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";
import { captureException, startSpan } from "@sentry/nextjs";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export interface XmppPasswordDialogData {
  jid: string;
  temporaryPassword: string;
}

interface XmppPasswordDialogProps {
  data: XmppPasswordDialogData;
  onClose: () => void;
}

export function XmppPasswordDialog({ data, onClose }: XmppPasswordDialogProps) {
  return (
    <Dialog onOpenChange={(open) => !open && onClose()} open>
      <DialogContent
        aria-describedby="xmpp-password-description"
        className="sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle>Save your XMPP password</DialogTitle>
          <DialogDescription id="xmpp-password-description">
            This password is shown only once. You need it to log in to your XMPP
            account with any XMPP client. Save it somewhere safe.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>JID</Label>
            <code className="block rounded-md bg-muted px-2 py-2 font-mono text-sm">
              {data.jid}
            </code>
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <div className="flex items-center gap-2">
              <code className="flex-1 break-all rounded-md bg-muted px-2 py-2 font-mono text-sm">
                {data.temporaryPassword}
              </code>
              <Button
                aria-label="Copy password"
                onClick={async () => {
                  await startSpan(
                    {
                      name: "Copy XMPP password",
                      op: "ui.action",
                      attributes: { integrationId: "xmpp" },
                    },
                    async () => {
                      try {
                        if (navigator.clipboard?.writeText) {
                          await navigator.clipboard.writeText(
                            data.temporaryPassword
                          );
                        } else {
                          const ta = document.createElement("textarea");
                          ta.value = data.temporaryPassword;
                          document.body.appendChild(ta);
                          ta.select();
                          const success = document.execCommand("copy");
                          document.body.removeChild(ta);
                          if (!success) {
                            throw new Error("execCommand copy failed");
                          }
                        }
                        toast.success("Copied", {
                          description: "Password copied to clipboard",
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
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>I&apos;ve saved my password</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
