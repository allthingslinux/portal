"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { AlertCircle, Loader2, Plus, Settings, Trash2 } from "lucide-react";
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
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreateIntegrationAccount,
  useDeleteIntegrationAccount,
  useIntegrationAccount,
} from "@/features/integrations/hooks/use-integration";

interface IntegrationManagementProps<TAccount extends { id: string }> {
  integrationId: string;
  title: string;
  description: string;
  createLabel: string;
  createInputLabel?: string;
  createInputPlaceholder?: string;
  createInputHelp?: string;
  createSecondInputLabel?: string;
  createSecondInputName?: string;
  createSecondInputPlaceholder?: string;
  createSecondInputHelp?: string;
  createSecondInputType?: string;
  onCreateSuccess?: (account: TAccount) => void;
  renderAccountDetails?: (account: TAccount) => ReactNode;
  /**
   * Custom create form rendered inside the setup dialog.
   * When provided, replaces the default input fields entirely.
   * Receives `onSuccess` to close the dialog after creation.
   */
  renderCreateForm?: (props: {
    onSuccess: (account: TAccount) => void;
    isPending: boolean;
  }) => ReactNode;
  createSchema?: ZodType<unknown>;
  createInputName?: string;
  /** @deprecated Use createSchema with required field instead */
  createInputRequired?: boolean;
  /** @deprecated Provide createSchema for validation; payload is derived from form data */
  createInputToPayload?: (value: string) => Record<string, unknown>;
}

export function IntegrationManagement<TAccount extends { id: string }>({
  integrationId,
  title,
  description,
  createLabel,
  createInputLabel,
  createInputPlaceholder,
  createInputHelp,
  createInputToPayload,
  onCreateSuccess,
  renderAccountDetails,
  renderCreateForm,
  createSchema,
  createInputName = "identifier",
  createSecondInputLabel,
  createSecondInputName,
  createSecondInputPlaceholder,
  createSecondInputHelp,
  createSecondInputType,
}: IntegrationManagementProps<TAccount>) {
  const {
    data: account,
    isPending,
    error,
  } = useIntegrationAccount<TAccount>(integrationId);
  const [dialogOpen, setDialogOpen] = useState(false);

  if (isPending) {
    return (
      <Card className="flex min-h-[120px] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-5">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm">Failed to load integration info.</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <IntegrationCard
        account={account}
        description={description}
        onAction={() => setDialogOpen(true)}
        title={title}
      />
      {account ? (
        <ManageDialog
          account={account}
          description={description}
          integrationId={integrationId}
          onOpenChange={setDialogOpen}
          open={dialogOpen}
          renderAccountDetails={renderAccountDetails}
          title={title}
        />
      ) : (
        <SetupDialog
          createInputHelp={createInputHelp}
          createInputLabel={createInputLabel}
          createInputName={createInputName}
          createInputPlaceholder={createInputPlaceholder}
          createInputToPayload={createInputToPayload}
          createLabel={createLabel}
          createSchema={createSchema}
          createSecondInputHelp={createSecondInputHelp}
          createSecondInputLabel={createSecondInputLabel}
          createSecondInputName={createSecondInputName}
          createSecondInputPlaceholder={createSecondInputPlaceholder}
          createSecondInputType={createSecondInputType}
          integrationId={integrationId}
          onCreateSuccess={onCreateSuccess}
          onOpenChange={setDialogOpen}
          open={dialogOpen}
          renderCreateForm={renderCreateForm}
          title={title}
        />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Compact card — always visible in the grid
// ---------------------------------------------------------------------------

function IntegrationCard<TAccount extends { id: string }>({
  title,
  description,
  account,
  onAction,
}: {
  title: string;
  description: string;
  account: TAccount | null | undefined;
  onAction: () => void;
}) {
  const hasAccount = !!account;
  const status =
    hasAccount && "status" in account && typeof account.status === "string"
      ? account.status
      : null;

  return (
    <Card
      className="flex cursor-pointer flex-col justify-between p-5 transition-colors hover:bg-accent/50"
      onClick={onAction}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onAction();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold leading-tight">{title}</p>
          <p className="mt-1 text-muted-foreground text-sm">{description}</p>
        </div>
        {hasAccount && status ? (
          <Badge
            className="shrink-0"
            variant={status === "active" ? "default" : "destructive"}
          >
            {status === "active" ? "Active" : status}
          </Badge>
        ) : (
          <Badge className="shrink-0" variant="outline">
            Not set up
          </Badge>
        )}
      </div>
      <div className="mt-4">
        {hasAccount ? (
          <Button size="sm" variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Manage
          </Button>
        ) : (
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Set up
          </Button>
        )}
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Setup dialog — create a new account
// ---------------------------------------------------------------------------

function SetupDialog<TAccount extends { id: string }>({
  open,
  onOpenChange,
  integrationId,
  title,
  createLabel,
  createInputLabel,
  createInputPlaceholder,
  createInputHelp,
  createInputToPayload,
  createSchema,
  createInputName = "identifier",
  createSecondInputLabel,
  createSecondInputName,
  createSecondInputPlaceholder,
  createSecondInputHelp,
  createSecondInputType,
  onCreateSuccess,
  renderCreateForm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  integrationId: string;
  title: string;
  createLabel: string;
  createInputLabel?: string;
  createInputPlaceholder?: string;
  createInputHelp?: string;
  createInputToPayload?: (value: string) => Record<string, unknown>;
  createSchema?: ZodType<unknown>;
  createInputName?: string;
  createSecondInputLabel?: string;
  createSecondInputName?: string;
  createSecondInputPlaceholder?: string;
  createSecondInputHelp?: string;
  createSecondInputType?: string;
  onCreateSuccess?: (account: TAccount) => void;
  renderCreateForm?: (props: {
    onSuccess: (account: TAccount) => void;
    isPending: boolean;
  }) => ReactNode;
}) {
  const createMutation = useCreateIntegrationAccount<TAccount>(integrationId);

  interface FormValues {
    [key: string]: string;
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm<FormValues>({
    // biome-ignore lint/suspicious/noExplicitAny: Resolver type mismatch workaround
    resolver: createSchema ? zodResolver(createSchema as any) : undefined,
    defaultValues: {
      [createInputName]: "",
      ...(createSecondInputName ? { [createSecondInputName]: "" } : {}),
    } as FormValues,
  });

  const onSubmit = async (data: Record<string, string>) => {
    try {
      const rawValue = data[createInputName] || "";
      const trimmed = rawValue.trim();

      if (!(createSchema || createInputToPayload) && trimmed === "") {
        setError(createInputName, {
          type: "manual",
          message: `${createInputLabel || "Input"} is required`,
        });
        return;
      }

      let payload: Record<string, unknown> = {};

      if (createSchema) {
        payload = Object.fromEntries(
          Object.entries(data).map(([k, v]) => [
            k,
            typeof v === "string" ? v.trim() : v,
          ])
        );
      } else if (createInputToPayload) {
        payload = createInputToPayload(trimmed);
      } else if (trimmed) {
        payload = { [createInputName]: trimmed };
      }

      const createdAccount = await createMutation.mutateAsync(payload);
      toast.success(`${title} account created`);
      reset();
      onOpenChange(false);
      onCreateSuccess?.(createdAccount);
    } catch (err) {
      Sentry.captureException(err);
      toast.error(
        err instanceof Error
          ? err.message
          : `Failed to create ${title.toLowerCase()} account`
      );
    }
  };

  if (renderCreateForm) {
    const handleCustomSuccess = (account: TAccount) => {
      onOpenChange(false);
      onCreateSuccess?.(account);
    };
    return (
      <Dialog onOpenChange={onOpenChange} open={open}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set up {title}</DialogTitle>
            <DialogDescription>
              Create your {title} account to get started.
            </DialogDescription>
          </DialogHeader>
          {renderCreateForm({
            onSuccess: handleCustomSuccess,
            isPending: false,
          })}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog
      onOpenChange={(v: boolean) => {
        onOpenChange(v);
        if (!v) {
          reset();
        }
      }}
      open={open}
    >
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Set up {title}</DialogTitle>
            <DialogDescription>
              Create your {title} account to get started.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {createInputLabel ? (
              <div className="space-y-2">
                <Label htmlFor={`${integrationId}-${createInputName}`}>
                  {createInputLabel}
                </Label>
                <Input
                  aria-describedby={
                    errors[createInputName]
                      ? `${integrationId}-${createInputName}-error`
                      : undefined
                  }
                  aria-invalid={!!errors[createInputName]}
                  disabled={createMutation.isPending}
                  id={`${integrationId}-${createInputName}`}
                  placeholder={createInputPlaceholder}
                  {...register(createInputName)}
                />
                {errors[createInputName]?.message && (
                  <p
                    className="font-medium text-destructive text-sm"
                    id={`${integrationId}-${createInputName}-error`}
                    role="alert"
                  >
                    {String(errors[createInputName]?.message)}
                  </p>
                )}
                {createInputHelp ? (
                  <p className="text-muted-foreground text-xs">
                    {createInputHelp}
                  </p>
                ) : null}
              </div>
            ) : null}
            {createSecondInputLabel && createSecondInputName ? (
              <div className="space-y-2">
                <Label htmlFor={`${integrationId}-${createSecondInputName}`}>
                  {createSecondInputLabel}
                </Label>
                <Input
                  aria-describedby={
                    errors[createSecondInputName]
                      ? `${integrationId}-${createSecondInputName}-error`
                      : undefined
                  }
                  aria-invalid={!!errors[createSecondInputName]}
                  disabled={createMutation.isPending}
                  id={`${integrationId}-${createSecondInputName}`}
                  placeholder={createSecondInputPlaceholder}
                  type={createSecondInputType ?? "text"}
                  {...register(createSecondInputName)}
                />
                {errors[createSecondInputName]?.message && (
                  <p
                    className="font-medium text-destructive text-sm"
                    id={`${integrationId}-${createSecondInputName}-error`}
                    role="alert"
                  >
                    {String(errors[createSecondInputName]?.message)}
                  </p>
                )}
                {createSecondInputHelp ? (
                  <p className="text-muted-foreground text-xs">
                    {createSecondInputHelp}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
          <DialogFooter>
            <Button
              disabled={createMutation.isPending}
              onClick={() => onOpenChange(false)}
              type="button"
              variant="ghost"
            >
              Cancel
            </Button>
            <Button disabled={createMutation.isPending} type="submit">
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                createLabel
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Manage dialog — view account details, reset password, delete
// ---------------------------------------------------------------------------

function ManageDialog<TAccount extends { id: string }>({
  open,
  onOpenChange,
  integrationId,
  title,
  description,
  account,
  renderAccountDetails,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  integrationId: string;
  title: string;
  description: string;
  account: TAccount;
  renderAccountDetails?: (account: TAccount) => ReactNode;
}) {
  const deleteMutation = useDeleteIntegrationAccount(integrationId);

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(account.id);
      toast.success(`${title} account deleted`);
      onOpenChange(false);
    } catch (err) {
      Sentry.captureException(err);
      toast.error(
        err instanceof Error
          ? err.message
          : `Failed to delete ${title.toLowerCase()} account`
      );
    }
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="py-2">
          {renderAccountDetails ? renderAccountDetails(account) : null}
        </div>
        <DialogFooter className="gap-2 sm:justify-between">
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  disabled={deleteMutation.isPending}
                  size="sm"
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
                  This will permanently delete your {title} account. This action
                  cannot be undone.
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
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
