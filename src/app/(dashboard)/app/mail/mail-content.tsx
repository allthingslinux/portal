"use client";

import {
  AlertCircle,
  ArrowUpRight,
  Copy,
  ExternalLink,
  Info,
  Loader2,
  Mail,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { captureException } from "@sentry/nextjs";

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
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MailcowAccountDetails } from "@/app/(dashboard)/app/integrations/mailcow-account-details";
import { MailcowCreateForm } from "@/app/(dashboard)/app/integrations/mailcow-create-form";
import {
  useDeleteIntegrationAccount,
  useIntegrationAccount,
  useIntegrations,
} from "@/features/integrations/hooks/use-integration";
import { integrationStatusLabels } from "@/features/integrations/lib/core/constants";
import type { MailcowAccount } from "@/features/integrations/lib/mailcow/types";
import { formatDate } from "@/shared/utils/date";

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

  const statusLabel =
    account.status in integrationStatusLabels
      ? integrationStatusLabels[
          account.status as keyof typeof integrationStatusLabels
        ]
      : account.status;

  const handleCopyEmail = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(account.email);
        toast.success("Copied", {
          description: "Email copied to clipboard",
        });
      } else {
        const el = document.createElement("textarea");
        el.value = account.email;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
        toast.success("Copied", { description: "Email copied to clipboard" });
      }
    } catch (error) {
      captureException(error);
      toast.error("Failed to copy");
    }
  };

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
      {/* Hero / Account overview */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                {account.email}
              </CardTitle>
              <CardDescription>
                Status: {statusLabel} · Created{" "}
                {formatDate(account.createdAt as unknown as string)}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleCopyEmail} size="sm" variant="outline">
                <Copy className="mr-2 h-4 w-4" />
                Copy email
              </Button>
              {webmailUrl && (
                <a
                  className={buttonVariants({ size: "sm" })}
                  href={webmailUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open webmail
                </a>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

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
          />
        </CardContent>
      </Card>

      {/* App passwords / Mail clients */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Mail clients & app passwords
          </CardTitle>
          <CardDescription>
            Use Thunderbird, Outlook, or other mail clients with your @atl.tools
            address.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            To use external mail clients (IMAP, SMTP), log in to webmail first,
            then go to <strong>Mailbox Settings → App Passwords</strong> to
            generate an app-specific password. Use your email and that password
            in your mail client.
          </p>
          {webmailUrl && (
            <a
              className={buttonVariants({
                className: "mt-4",
                variant: "outline",
              })}
              href={webmailUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              Open Mailbox Settings
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </a>
          )}
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
