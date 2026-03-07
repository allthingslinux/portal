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

export interface MediaWikiPasswordDialogData {
  temporaryPassword: string;
  wikiUsername: string;
}

interface MediaWikiPasswordDialogProps {
  data: MediaWikiPasswordDialogData;
  onClose: () => void;
}

export function MediaWikiPasswordDialog({
  data,
  onClose,
}: MediaWikiPasswordDialogProps) {
  return (
    <Dialog onOpenChange={(open) => !open && onClose()} open>
      <DialogContent
        aria-describedby="mediawiki-password-description"
        className="sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle>Save your wiki password</DialogTitle>
          <DialogDescription id="mediawiki-password-description">
            This password is shown only once. Use it to log in to atl.wiki. You
            can change it after logging in.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Username</Label>
            <code className="block rounded-md bg-muted px-2 py-2 font-mono text-sm">
              {data.wikiUsername}
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
                      name: "Copy MediaWiki password",
                      op: "ui.action",
                      attributes: { integrationId: "mediawiki" },
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
