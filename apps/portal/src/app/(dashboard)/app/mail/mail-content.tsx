"use client";

import {
  AlertCircle,
  ArrowUpRight,
  AtSign,
  Info,
  Key,
  Loader2,
  Mail,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@portal/ui/ui/alert-dialog";
import { Button, buttonVariants } from "@portal/ui/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@portal/ui/ui/card";
import { Separator } from "@portal/ui/ui/separator";
import { captureException } from "@sentry/nextjs";

import { MailcowAccountDetails } from "@/app/(dashboard)/app/integrations/mailcow-account-details";
import { AliasManager } from "@/app/(dashboard)/app/integrations/mailcow-aliases";
import { AppPasswordManager } from "@/app/(dashboard)/app/integrations/mailcow-app-passwords";
import { MailcowCreateForm } from "@/app/(dashboard)/app/integrations/mailcow-create-form";
import {
  useDeleteIntegrationAccount,
  useIntegrationAccount,
  useIntegrations,
} from "@/features/integrations/hooks/use-integration";
import type { MailcowAccount } from "@/features/integrations/lib/mailcow/types";

const MAIL_INTEGRATION_ID = "mailcow";

interface MailContentProps {
  /** Webmail UI URL for "Open webmail" link. When undefined, the link is hidden. */
  webmailUrl?: string | null;
}

export function MailContent({ webmailUrl }: MailContentProps) {
  const { data: integrations, isPending: integrationsPending } =
    useIntegrations();
  const {
    data: account,
    isPending: accountPending,
    error: accountError,
  } = useIntegrationAccount<MailcowAccount>(MAIL_INTEGRATION_ID);
  const deleteMutation = useDeleteIntegrationAccount(MAIL_INTEGRATION_ID);

  const mailcowIntegration = integrations?.find(
    (i) => i.id === MAIL_INTEGRATION_ID
  );
  const isMailcowEnabled = !!mailcowIntegration?.enabled;

  if (integrationsPending || accountPending) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isMailcowEnabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email
          </CardTitle>
          <CardDescription>
            The email service is not currently available. Check back later or
            contact support.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (accountError) {
    return (
      <Card>
        <CardContent className="flex items-center gap-2 py-8 text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>Failed to load your email account. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  if (!account) {
    return (
      <div className="space-y-6">
        <MailcowCreateForm
          description="Get an @atl.tools email address for community use."
          integrationId={MAIL_INTEGRATION_ID}
          submitLabel="Register account"
          title="Register"
        />
      </div>
    );
  }

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(account.id);
      toast.success("Email account deleted", {
        description: "Your mailbox has been permanently deleted.",
      });
    } catch (err) {
      captureException(err);
      toast.error("Failed to delete account", {
        description: err instanceof Error ? err.message : "An error occurred.",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Account details */}
      <Card>
        <CardHeader>
          <CardTitle>Account details</CardTitle>
          <CardDescription>
            Your mailbox configuration and metadata.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MailcowAccountDetails
            account={account}
            integrationId={MAIL_INTEGRATION_ID}
            webmailUrl={webmailUrl}
          />
        </CardContent>
      </Card>

      {/* Alias management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AtSign className="h-5 w-5" />
            Email Aliases
          </CardTitle>
          <CardDescription>
            Receive email at different addresses that forward to your main
            account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AliasManager accountId={account.id} email={account.email} />
        </CardContent>
      </Card>

      {/* App passwords / Mail clients */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            App Passwords & Clients
          </CardTitle>
          <CardDescription>
            Generate unique passwords to use your @atl.tools address with mail
            clients (IMAP/SMTP).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg bg-muted p-4">
            <h4 className="mb-2 flex items-center gap-2 font-semibold text-sm">
              <Info className="h-4 w-4" />
              Connection Settings
            </h4>
            <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
              <div className="space-y-1">
                <p className="font-medium">Incoming (IMAP)</p>
                <p className="family-mono text-muted-foreground">
                  Server: mail.atl.tools
                </p>
                <p className="family-mono text-muted-foreground">
                  Port: 993 (SSL/TLS)
                </p>
              </div>
              <div className="space-y-1">
                <p className="font-medium">Outgoing (SMTP)</p>
                <p className="family-mono text-muted-foreground">
                  Server: mail.atl.tools
                </p>
                <p className="family-mono text-muted-foreground">
                  Port: 465 (SSL/TLS)
                </p>
              </div>
            </div>
            <p className="mt-3 text-muted-foreground text-xs italic">
              Use your full email as the username. Use an App Password
              (generated below) as the password.
            </p>
          </div>

          <Separator />

          <AppPasswordManager accountId={account.id} />
        </CardContent>
      </Card>

      {/* Manage in Integrations */}
      <Card>
        <CardContent className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium">Need more integrations?</p>
            <p className="text-muted-foreground text-sm">
              Manage IRC, XMPP, and other services from the Integrations page.
            </p>
          </div>
          <Link
            className={buttonVariants({ variant: "outline" })}
            href="/app/integrations"
          >
            <ArrowUpRight className="mr-2 h-4 w-4" />
            Go to Integrations
          </Link>
        </CardContent>
      </Card>

      <Separator />

      {/* Danger zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger zone</CardTitle>
          <CardDescription>
            Permanently delete your email account and mailbox. This action
            cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  disabled={deleteMutation.isPending}
                  variant="destructive"
                />
              }
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete email account
                </>
              )}
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete email account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete <strong>{account.email}</strong>{" "}
                  and all its mail. You will not be able to recover this
                  mailbox. You can create a new account later if needed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={handleDelete}
                >
                  Delete account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
