"use client";

import { AlertCircle, CheckCircle2, Copy } from "lucide-react";
import { toast } from "sonner";
import { captureException, startSpan } from "@sentry/nextjs";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { IntegrationManagement } from "@/features/integrations/components/integrations/integration-management";
import { useIntegrations } from "@/features/integrations/hooks/use-integration";
import { integrationStatusLabels } from "@/features/integrations/lib/integrations/core/constants";
import type { XmppAccount } from "@/features/integrations/lib/integrations/xmpp/types";

// ============================================================================
// Integrations Content Component
// ============================================================================
// Client component to render all integrations

export function IntegrationsContent() {
  const { data: integrations, isLoading } = useIntegrations();

  if (isLoading) {
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
      {integrations.map((integration) => {
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
