"use client";

import { useState } from "react";
import { BookOpen, Hash, Mail, Zap } from "lucide-react";
import { CreateIrcAccountRequestSchema } from "@portal/schemas/integrations/irc";
import { CreateMediaWikiAccountRequestSchema } from "@portal/schemas/integrations/mediawiki";
import { CreateXmppAccountRequestSchema } from "@portal/schemas/integrations/xmpp";

import { IrcAccountDetails } from "./irc-account-details";
import {
  IrcPasswordDialog,
  type IrcPasswordDialogData,
} from "./irc-password-dialog";
import { MailcowAccountDetails } from "./mailcow-account-details";
import { MailcowDialogCreateFields } from "./mailcow-create-form";
import { MediaWikiAccountDetails } from "./mediawiki-account-details";
import {
  MediaWikiPasswordDialog,
  type MediaWikiPasswordDialogData,
} from "./mediawiki-password-dialog";
import { MediaWikiResetPassword } from "./mediawiki-reset-password";
import { XmppAccountDetails } from "./xmpp-account-details";
import {
  XmppPasswordDialog,
  type XmppPasswordDialogData,
} from "./xmpp-password-dialog";
import { IntegrationManagement } from "@/features/integrations/components/integration-management";
import { ResetPasswordDialog } from "@/features/integrations/components/reset-password-dialog";
import { useIntegrations } from "@/features/integrations/hooks/use-integration";
import type { IrcAccount } from "@/features/integrations/lib/irc/types";
import { IRC_NICK_MAX_LENGTH } from "@/features/integrations/lib/irc/utils";
import type { MailcowAccount } from "@/features/integrations/lib/mailcow/types";
import type { MediaWikiAccount } from "@/features/integrations/lib/mediawiki/types";
import type { XmppAccount } from "@/features/integrations/lib/xmpp/types";

export function IntegrationsContent() {
  const { data: integrations, isPending } = useIntegrations();
  const [ircPasswordDialog, setIrcPasswordDialog] =
    useState<IrcPasswordDialogData | null>(null);
  const [xmppPasswordDialog, setXmppPasswordDialog] =
    useState<XmppPasswordDialogData | null>(null);
  const [mediawikiPasswordDialog, setMediawikiPasswordDialog] =
    useState<MediaWikiPasswordDialogData | null>(null);

  if (isPending) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <p className="text-muted-foreground">Loading integrations...</p>
      </div>
    );
  }

  if (!integrations || integrations.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <p className="text-muted-foreground">
          No integrations are currently available.
        </p>
      </div>
    );
  }

  return (
    <>
      {ircPasswordDialog && (
        <IrcPasswordDialog
          data={ircPasswordDialog}
          onClose={() => setIrcPasswordDialog(null)}
        />
      )}
      {xmppPasswordDialog && (
        <XmppPasswordDialog
          data={xmppPasswordDialog}
          onClose={() => setXmppPasswordDialog(null)}
        />
      )}
      {mediawikiPasswordDialog && (
        <MediaWikiPasswordDialog
          data={mediawikiPasswordDialog}
          onClose={() => setMediawikiPasswordDialog(null)}
        />
      )}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {integrations.map((integration) => {
          if (integration.id === "irc") {
            return (
              <IntegrationManagement<
                IrcAccount & { temporaryPassword?: string }
              >
                createInputHelp={
                  "Letters, digits, or [ ] \\ ^ _ ` { | } ~ - (max " +
                  String(IRC_NICK_MAX_LENGTH) +
                  " characters)."
                }
                createInputLabel="Nick (required)"
                createInputName="nick"
                createInputPlaceholder="Enter your IRC nick"
                createLabel="Create IRC Account"
                createSchema={CreateIrcAccountRequestSchema}
                createSecondInputHelp="If left empty, a random password will be generated and shown once."
                createSecondInputLabel="Password (optional)"
                createSecondInputName="password"
                createSecondInputPlaceholder="Leave empty to generate a random password"
                createSecondInputType="password"
                description={integration.description}
                icon={Hash}
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
                      port: account.port,
                      server: account.server,
                      temporaryPassword: account.temporaryPassword,
                    });
                  }
                }}
                renderAccountDetails={(account) => (
                  <IrcAccountDetails account={account} />
                )}
                renderActions={(account) => (
                  <ResetPasswordDialog
                    accountId={account.id}
                    integrationId="irc"
                    integrationName="IRC"
                    mode="user-chosen"
                  />
                )}
                title={integration.name}
              />
            );
          }

          if (integration.id === "xmpp") {
            return (
              <IntegrationManagement<
                XmppAccount & { temporaryPassword?: string }
              >
                createInputHelp="If left empty, your username will be generated from your email address. Username must be alphanumeric with underscores, hyphens, or dots."
                createInputLabel="Username (optional)"
                createInputName="username"
                createInputPlaceholder="Leave empty to use your email username"
                createLabel="Create XMPP Account"
                createSchema={CreateXmppAccountRequestSchema}
                createSecondInputHelp="If left empty, a random password will be generated and shown once."
                createSecondInputLabel="Password (optional)"
                createSecondInputName="password"
                createSecondInputPlaceholder="Leave empty to generate a random password"
                createSecondInputType="password"
                description={integration.description}
                icon={Zap}
                integrationId={integration.id}
                key={integration.id}
                onCreateSuccess={(account) => {
                  if (
                    "temporaryPassword" in account &&
                    typeof account.temporaryPassword === "string" &&
                    "jid" in account
                  ) {
                    setXmppPasswordDialog({
                      jid: account.jid,
                      temporaryPassword: account.temporaryPassword,
                    });
                  }
                }}
                renderAccountDetails={(account) => (
                  <XmppAccountDetails
                    account={account}
                    integrationId={integration.id}
                  />
                )}
                renderActions={(account) => (
                  <ResetPasswordDialog
                    accountId={account.id}
                    integrationId={integration.id}
                    integrationName="XMPP"
                    mode="user-chosen"
                  />
                )}
                title={integration.name}
              />
            );
          }

          if (integration.id === "mailcow") {
            return (
              <IntegrationManagement<MailcowAccount>
                createLabel="Create Email Account"
                description={integration.description}
                icon={Mail}
                integrationId={integration.id}
                key={integration.id}
                renderAccountDetails={(account) => (
                  <MailcowAccountDetails
                    account={account}
                    integrationId={integration.id}
                  />
                )}
                renderCreateForm={({ onSuccess }) => (
                  <MailcowDialogCreateFields
                    integrationId={integration.id}
                    onSuccess={onSuccess}
                    title={integration.name}
                  />
                )}
                title={integration.name}
              />
            );
          }

          if (integration.id === "mediawiki") {
            return (
              <IntegrationManagement<
                MediaWikiAccount & { temporaryPassword?: string }
              >
                createInputHelp="Letters, digits, spaces, hyphens, or underscores (max 85 characters)."
                createInputLabel="Wiki Username"
                createInputName="wikiUsername"
                createInputPlaceholder="Enter your wiki username"
                createLabel="Create Wiki Account"
                createSchema={CreateMediaWikiAccountRequestSchema}
                createSecondInputHelp="If left empty, a random password will be generated and shown once."
                createSecondInputLabel="Password (optional)"
                createSecondInputName="password"
                createSecondInputPlaceholder="Leave empty to generate a random password"
                createSecondInputType="password"
                description={integration.description}
                icon={BookOpen}
                integrationId={integration.id}
                key={integration.id}
                onCreateSuccess={(account) => {
                  if (
                    "temporaryPassword" in account &&
                    typeof account.temporaryPassword === "string" &&
                    "wikiUsername" in account
                  ) {
                    setMediawikiPasswordDialog({
                      wikiUsername: account.wikiUsername,
                      temporaryPassword: account.temporaryPassword,
                    });
                  }
                }}
                renderAccountDetails={(account) => (
                  <MediaWikiAccountDetails account={account} />
                )}
                renderActions={(account) => (
                  <MediaWikiResetPassword accountId={account.id} />
                )}
                title={integration.name}
              />
            );
          }

          // Generic fallback for future integrations
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
    </>
  );
}
