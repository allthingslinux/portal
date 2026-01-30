"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Copy } from "lucide-react";
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
import { IntegrationManagement } from "@/features/integrations/components/integration-management";
import { useIntegrations } from "@/features/integrations/hooks/use-integration";
import { integrationStatusLabels } from "@/features/integrations/lib/core/constants";
import type { IrcAccount } from "@/features/integrations/lib/irc/types";
import { IRC_NICK_MAX_LENGTH } from "@/features/integrations/lib/irc/utils";
import type { XmppAccount } from "@/features/integrations/lib/xmpp/types";

// ============================================================================
// Integrations Content Component
// ============================================================================
// Client component to render all integrations

interface IrcPasswordDialog {
  nick: string;
  server: string;
  port: number;
  temporaryPassword: string;
}

export function IntegrationsContent() {
  const { data: integrations, isPending } = useIntegrations();
  const [ircPasswordDialog, setIrcPasswordDialog] =
    useState<IrcPasswordDialog | null>(null);

  if (isPending) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">Loading integrations...</p>
      </div>
    );
  }

  if (!integrations || integrations.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          No integrations are currently available.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {ircPasswordDialog ? (
        <Dialog
          onOpenChange={(open) => !open && setIrcPasswordDialog(null)}
          open={!!ircPasswordDialog}
        >
          <DialogContent
            aria-describedby="irc-password-description"
            className="sm:max-w-md"
          >
            <DialogHeader>
              <DialogTitle>Save your IRC password</DialogTitle>
              <DialogDescription id="irc-password-description">
                This password is shown only once. You need it to identify to
                NickServ on IRC. Save it somewhere safe. Password recovery is
                done on IRC (NickServ SENDPASS).
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Password</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 break-all rounded-md bg-muted px-2 py-2 font-mono text-sm">
                    {ircPasswordDialog.temporaryPassword}
                  </code>
                  <Button
                    aria-label="Copy password"
                    onClick={async () => {
                      try {
                        if (navigator.clipboard?.writeText) {
                          await navigator.clipboard.writeText(
                            ircPasswordDialog.temporaryPassword
                          );
                        } else {
                          const ta = document.createElement("textarea");
                          ta.value = ircPasswordDialog.temporaryPassword;
                          document.body.appendChild(ta);
                          ta.select();
                          document.execCommand("copy");
                          document.body.removeChild(ta);
                        }
                        toast.success("Copied", {
                          description: "Password copied to clipboard",
                        });
                      } catch (err) {
                        captureException(err);
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
              <div className="space-y-2">
                <Label>Connect</Label>
                <p className="text-muted-foreground text-sm">
                  Server: {ircPasswordDialog.server}:{ircPasswordDialog.port}{" "}
                  (TLS). Use /msg NickServ IDENTIFY {ircPasswordDialog.nick}{" "}
                  &lt;password&gt; after connecting.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setIrcPasswordDialog(null)}>
                I've saved my password
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
      {integrations.map((integration) => {
        // IRC-specific rendering
        if (integration.id === "irc") {
          return (
            <IntegrationManagement<IrcAccount & { temporaryPassword?: string }>
              createInputHelp={`Letters, digits, or [ ] \\ ^ _ \` { | } ~ - (max ${IRC_NICK_MAX_LENGTH} characters).`}
              createInputLabel="Nick (required)"
              createInputPlaceholder="Enter your IRC nick"
              createInputRequired
              createInputToPayload={(value) =>
                value.trim() ? { nick: value.trim() } : {}
              }
              createLabel="Create IRC Account"
              description={integration.description}
              integrationId={integration.id}
              key={integration.id}
              onCreateSuccess={(account) => {
                if (
                  "temporaryPassword" in account &&
                  typeof account.temporaryPassword === "string" &&
                  "nick" in account &&
                  "server" in account &&
                  "port" in account
                ) {
                  setIrcPasswordDialog({
                    nick: account.nick,
                    server: account.server,
                    port: account.port,
                    temporaryPassword: account.temporaryPassword,
                  });
                }
              }}
              renderAccountDetails={(account) => (
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
                          try {
                            const text = `${account.server}:${account.port}`;
                            if (navigator.clipboard?.writeText) {
                              await navigator.clipboard.writeText(text);
                            } else {
                              const ta = document.createElement("textarea");
                              ta.value = text;
                              document.body.appendChild(ta);
                              ta.select();
                              document.execCommand("copy");
                              document.body.removeChild(ta);
                            }
                            toast.success("Copied", {
                              description: "Connect string copied",
                            });
                          } catch (err) {
                            captureException(err);
                            toast.error("Failed to copy");
                          }
                        }}
                        size="sm"
                        variant="ghost"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      Use TLS. Identify with /msg NickServ IDENTIFY nick
                      &lt;password&gt;
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
              )}
              title={integration.name}
            />
          );
        }

        // XMPP-specific rendering
        if (integration.id === "xmpp") {
          return (
            <IntegrationManagement<XmppAccount>
              createInputHelp="If left empty, your username will be generated from your email address. Username must be alphanumeric with underscores, hyphens, or dots."
              createInputLabel="Username (optional)"
              createInputPlaceholder="Leave empty to use your email username"
              createInputToPayload={(value) =>
                value.trim() ? { username: value.trim() } : {}
              }
              createLabel="Create XMPP Account"
              description={integration.description}
              integrationId={integration.id}
              key={integration.id}
              renderAccountDetails={(account) => (
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
                              attributes: { integrationId: integration.id },
                            },
                            async () => {
                              try {
                                if (navigator.clipboard?.writeText) {
                                  await navigator.clipboard.writeText(
                                    account.jid
                                  );
                                  toast.success("Copied", {
                                    description: "JID copied to clipboard",
                                  });
                                } else {
                                  // Fallback for older browsers
                                  const textArea =
                                    document.createElement("textarea");
                                  textArea.value = account.jid;
                                  document.body.appendChild(textArea);
                                  textArea.select();
                                  document.execCommand("copy");
                                  document.body.removeChild(textArea);
                                  toast.success("Copied", {
                                    description: "JID copied to clipboard",
                                  });
                                }
                              } catch (error) {
                                captureException(error);
                                toast.error("Failed to copy", {
                                  description:
                                    "Could not copy JID to clipboard",
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
                    <p className="text-muted-foreground text-sm">
                      {account.username}
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
              )}
              title={integration.name}
            />
          );
        }

        // Generic integration rendering
        return (
          <IntegrationManagement
            createLabel={`Create ${integration.name} Account`}
            description={integration.description}
            integrationId={integration.id}
            key={integration.id}
            title={integration.name}
          />
        );
      })}
    </div>
  );
}
