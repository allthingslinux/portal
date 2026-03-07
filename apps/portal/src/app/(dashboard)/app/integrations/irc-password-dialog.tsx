"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@portal/ui/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@portal/ui/ui/dialog";
import { Label } from "@portal/ui/ui/label";
import { captureException, startSpan } from "@sentry/nextjs";

export interface IrcPasswordDialogData {
  nick: string;
  port: number;
  server: string;
  temporaryPassword: string;
}

interface IrcPasswordDialogProps {
  data: IrcPasswordDialogData;
  onClose: () => void;
}

export function IrcPasswordDialog({ data, onClose }: IrcPasswordDialogProps) {
  return (
    <Dialog onOpenChange={(open) => !open && onClose()} open>
      <DialogContent
        aria-describedby="irc-password-description"
        className="sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle>Save your IRC password</DialogTitle>
          <DialogDescription id="irc-password-description">
            This password is shown only once. You need it to identify to
            NickServ on IRC. Save it somewhere safe. Password recovery is done
            on IRC (NickServ SENDPASS).
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
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
                      name: "Copy IRC password",
                      op: "ui.action",
                      attributes: { integrationId: "irc" },
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
          <div className="space-y-2">
            <Label>Connect</Label>
            <p className="text-muted-foreground text-sm">
              Server: {data.server}:{data.port} (TLS). Use /msg NickServ
              IDENTIFY {data.nick} &lt;password&gt; after connecting.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>I&apos;ve saved my password</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
