"use client";

import { useState } from "react";

import { IrcAccountDetails } from "./irc-account-details";
import {
  IrcPasswordDialog,
  type IrcPasswordDialogData,
} from "./irc-password-dialog";
import { MailcowIntegrationCard } from "./mailcow-integration-card";
import { XmppAccountDetails } from "./xmpp-account-details";
import { IntegrationManagement } from "@/features/integrations/components/integration-management";
import { useIntegrations } from "@/features/integrations/hooks/use-integration";
import type { IrcAccount } from "@/features/integrations/lib/irc/types";
import { IRC_NICK_MAX_LENGTH } from "@/features/integrations/lib/irc/utils";
import type { XmppAccount } from "@/features/integrations/lib/xmpp/types";
import { CreateIrcAccountRequestSchema } from "@/shared/schemas/integrations/irc";
import { CreateXmppAccountRequestSchema } from "@/shared/schemas/integrations/xmpp";

export function IntegrationsContent() {
  const { data: integrations, isPending } = useIntegrations();
  const [ircPasswordDialog, setIrcPasswordDialog] =
    useState<IrcPasswordDialogData | null>(null);

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
        <IrcPasswordDialog
          data={ircPasswordDialog}
          onClose={() => setIrcPasswordDialog(null)}
        />
      ) : null}
      {integrations.map((integration) => {
        if (integration.id === "irc") {
          return (
            <IntegrationManagement<IrcAccount & { temporaryPassword?: string }>
              createInputHelp={`Letters, digits, or [ ] \\ ^ _ \` { | } ~ - (max ${IRC_NICK_MAX_LENGTH} characters).`}
              createInputLabel="Nick (required)"
              createInputName="nick"
              createInputPlaceholder="Enter your IRC nick"
              createLabel="Create IRC Account"
              createSchema={CreateIrcAccountRequestSchema}
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
                <IrcAccountDetails account={account} />
              )}
              title={integration.name}
            />
          );
        }

        if (integration.id === "mailcow") {
          return (
            <MailcowIntegrationCard
              description={integration.description}
              integrationId={integration.id}
              key={integration.id}
              title={integration.name}
            />
          );
        }

        if (integration.id === "xmpp") {
          return (
            <IntegrationManagement<XmppAccount>
              createInputHelp="If left empty, your username will be generated from your email address. Username must be alphanumeric with underscores, hyphens, or dots."
              createInputLabel="Username (optional)"
              createInputName="username"
              createInputPlaceholder="Leave empty to use your email username"
              createLabel="Create XMPP Account"
              createSchema={CreateXmppAccountRequestSchema}
              description={integration.description}
              integrationId={integration.id}
              key={integration.id}
              renderAccountDetails={(account) => (
                <XmppAccountDetails
                  account={account}
                  integrationId={integration.id}
                />
              )}
              title={integration.name}
            />
          );
        }

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
