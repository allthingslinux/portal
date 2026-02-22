"use client";

import { AlertCircle, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { MailcowAccountDetails } from "./mailcow-account-details";
import { MailcowCreateForm } from "./mailcow-create-form";
import {
  useDeleteIntegrationAccount,
  useIntegrationAccount,
} from "@/features/integrations/hooks/use-integration";
import { integrationStatusLabels } from "@/features/integrations/lib/core/constants";
import type { MailcowAccount } from "@/features/integrations/lib/mailcow/types";

interface MailcowIntegrationCardProps {
  integrationId: string;
  title: string;
  description: string;
}

export function MailcowIntegrationCard({
  integrationId,
  title,
  description,
}: MailcowIntegrationCardProps) {
  const {
    data: account,
    isPending,
    error,
  } = useIntegrationAccount<MailcowAccount>(integrationId);
  const deleteMutation = useDeleteIntegrationAccount(integrationId);

  const handleDelete = async () => {
    if (!account) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(account.id);
      toast.success(`${title} account deleted`, {
        description: `Your ${title} account has been deleted successfully.`,
      });
    } catch (err) {
      captureException(err);
      toast.error(`Failed to delete ${title.toLowerCase()} account`, {
        description:
          err instanceof Error
            ? err.message
            : "An error occurred while deleting your account.",
      });
    }
  };

  if (isPending) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>Failed to load integration account information.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!account) {
    return (
      <MailcowCreateForm
        description={description}
        integrationId={integrationId}
        title={title}
      />
    );
  }

  const status =
    "status" in account && typeof account.status === "string"
      ? account.status
      : null;
  const statusLabel =
    status && status in integrationStatusLabels
      ? integrationStatusLabels[status as keyof typeof integrationStatusLabels]
      : status;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-lg">{title}</div>
            <p className="text-muted-foreground text-sm">{description}</p>
          </div>
          {status ? (
            <Badge variant={status === "deleted" ? "destructive" : "default"}>
              {statusLabel}
            </Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <MailcowAccountDetails
          account={account}
          integrationId={integrationId}
        />
      </CardContent>
      <CardFooter className="flex justify-end">
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
                Delete Account
              </>
            )}
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {title} Account?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete your {title} account and mailbox.
                This action cannot be undone. You will need to create a new
                account if you want to use {title} again.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={handleDelete}
              >
                Delete Account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
