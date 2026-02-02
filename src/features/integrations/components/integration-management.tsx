"use client";

import type { ReactNode } from "react";
import { AlertCircle, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import type { ZodType } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Sentry from "@sentry/nextjs";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreateIntegrationAccount,
  useDeleteIntegrationAccount,
  useIntegrationAccount,
} from "@/features/integrations/hooks/use-integration";
import { integrationStatusLabels } from "@/features/integrations/lib/core/constants";

interface IntegrationManagementProps<TAccount extends { id: string }> {
  integrationId: string;
  title: string;
  description: string;
  createLabel: string;
  createInputLabel?: string;
  createInputPlaceholder?: string;
  createInputHelp?: string;
  createInputRequired?: boolean;
  createInputToPayload?: (value: string) => Record<string, unknown>;
  onCreateSuccess?: (account: TAccount) => void;

  renderAccountDetails?: (account: TAccount) => ReactNode;
  /** Optional Zod schema for validation */
  // biome-ignore lint/suspicious/noExplicitAny: Generic schema type required for react-hook-form compatibility
  createSchema?: ZodType<any>;
  /** Name of the field in the schema (defaults to 'identifier') */
  createInputName?: string;
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Single component with loading/error/empty/account states
export function IntegrationManagement<TAccount extends { id: string }>({
  integrationId,
  title,
  description,
  createLabel,
  createInputLabel,
  createInputPlaceholder,
  createInputHelp,
  // createInputRequired, // Deprecated in favor of Zod schema
  createInputToPayload,
  onCreateSuccess,
  renderAccountDetails,
  createSchema,
  createInputName = "identifier",
}: IntegrationManagementProps<TAccount>) {
  const {
    data: account,
    isPending,
    error,
  } = useIntegrationAccount<TAccount>(integrationId);
  const createMutation = useCreateIntegrationAccount<TAccount>(integrationId);
  const deleteMutation = useDeleteIntegrationAccount(integrationId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    // biome-ignore lint/suspicious/noExplicitAny: Resolver type mismatch workaround
    resolver: createSchema ? zodResolver(createSchema as any) : undefined,
    defaultValues: {
      [createInputName]: "",
    },
  });

  const onSubmit = async (data: Record<string, string>) => {
    try {
      const rawValue = data[createInputName] || "";
      const trimmed = rawValue.trim();

      // If a payload converter is provided, use it (backward compatibility)
      // Otherwise, use the form data directly if trimmed value exists
      let payload: Record<string, unknown> = {};

      if (createInputToPayload) {
        payload = createInputToPayload(trimmed);
      } else if (trimmed) {
        payload = { [createInputName]: trimmed };
      }

      // If we have a schema but createInputToPayload returned empty object (e.g. empty string),
      // we might want to respect the schema's empty/optional handling.
      // However, createInputToPayload logic in current usages returns {} on empty.

      const createdAccount = await createMutation.mutateAsync(payload);
      toast.success(`${title} account created`, {
        description: `Your ${title} account has been created successfully.`,
      });
      reset();
      onCreateSuccess?.(createdAccount);
    } catch (error) {
      Sentry.captureException(error);
      toast.error(`Failed to create ${title.toLowerCase()} account`, {
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while creating your account.",
      });
    }
  };

  const handleDelete = async () => {
    if (!account) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(account.id);
      toast.success(`${title} account deleted`, {
        description: `Your ${title} account has been deleted successfully.`,
      });
    } catch (error) {
      Sentry.captureException(error);
      toast.error(`Failed to delete ${title.toLowerCase()} account`, {
        description:
          error instanceof Error
            ? error.message
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
      <Card>
        <CardHeader>
          <div className="font-semibold text-lg">{title}</div>
          <p className="text-muted-foreground text-sm">{description}</p>
        </CardHeader>
        {/* Wrap content in form for Enter key submission */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {createInputLabel ? (
              <div className="space-y-2">
                <Label htmlFor={`${integrationId}-${createInputName}`}>
                  {createInputLabel}
                </Label>
                <Input
                  disabled={createMutation.isPending}
                  id={`${integrationId}-${createInputName}`}
                  placeholder={createInputPlaceholder}
                  {...register(createInputName)}
                />
                {errors[createInputName]?.message && (
                  <p className="font-medium text-destructive text-sm">
                    {String(errors[createInputName]?.message)}
                  </p>
                )}
                {createInputHelp ? (
                  <p className="text-muted-foreground text-sm">
                    {createInputHelp}
                  </p>
                ) : null}
              </div>
            ) : null}
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              disabled={createMutation.isPending}
              type="submit"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                createLabel
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
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
        {renderAccountDetails ? renderAccountDetails(account) : null}
      </CardContent>
      <CardFooter className="flex justify-end">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button disabled={deleteMutation.isPending} variant="destructive">
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
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {title} Account?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete your {title} account. This action
                cannot be undone. You will need to create a new account if you
                want to use {title} again.
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
