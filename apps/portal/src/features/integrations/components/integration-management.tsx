"use client";

import type { ComponentType, ReactNode } from "react";
import { useState } from "react";
import {
  AlertCircle,
  Hash,
  Loader2,
  Mail,
  Plug,
  Plus,
  Trash2,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import type { ZodType } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Button } from "@portal/ui/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@portal/ui/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@portal/ui/ui/dialog";
import { Input } from "@portal/ui/ui/input";
import { Label } from "@portal/ui/ui/label";
import { cn } from "@portal/utils/utils";
import * as Sentry from "@sentry/nextjs";

import {
  useCreateIntegrationAccount,
  useDeleteIntegrationAccount,
  useIntegrationAccount,
} from "@/features/integrations/hooks/use-integration";

// ---------------------------------------------------------------------------
// Protocol icon defaults — keyed by integrationId, overridable via prop
// ---------------------------------------------------------------------------

const INTEGRATION_ICONS: Record<
  string,
  ComponentType<{ className?: string }>
> = {
  irc: Hash,
  xmpp: Zap,
  mailcow: Mail,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractCreatedAt(account: Record<string, unknown>): Date | null {
  const raw = account.createdAt;
  if (!raw) {
    return null;
  }
  const d = new Date(raw as string | number | Date);
  return Number.isNaN(d.getTime()) ? null : d;
}

// ---------------------------------------------------------------------------
// EmptyCard — integration not yet configured
// ---------------------------------------------------------------------------

function EmptyCard({
  integrationId,
  title,
  description,
  icon,
  onConfigure,
}: {
  integrationId: string;
  title: string;
  description: string;
  icon?: ComponentType<{ className?: string }>;
  onConfigure: () => void;
}) {
  const Icon = icon ?? INTEGRATION_ICONS[integrationId] ?? Plug;
  return (
    <Card className="flex min-h-[220px] flex-col items-center justify-center border-dashed p-8 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border/60 bg-muted/40">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="font-semibold">{title}</p>
          <p className="max-w-[240px] text-muted-foreground text-sm leading-relaxed">
            {description}
          </p>
        </div>
        <Button onClick={onConfigure} size="sm" variant="outline">
          <Plus className="mr-2 h-3.5 w-3.5" />
          Configure {title}
        </Button>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// AccountCard — integration configured, account details shown inline
// ---------------------------------------------------------------------------

function AccountCard<TAccount extends { id: string }>({
  integrationId,
  title,
  account,
  icon,
  renderAccountDetails,
  renderActions,
}: {
  integrationId: string;
  title: string;
  account: TAccount;
  icon?: ComponentType<{ className?: string }>;
  renderAccountDetails?: (account: TAccount) => ReactNode;
  renderActions?: (account: TAccount) => ReactNode;
}) {
  const status =
    "status" in account && typeof account.status === "string"
      ? account.status
      : null;
  const isActive = status === "active";
  const createdAtDate = extractCreatedAt(account as Record<string, unknown>);
  const Icon = icon ?? INTEGRATION_ICONS[integrationId] ?? Plug;
  const deleteMutation = useDeleteIntegrationAccount(integrationId);

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(account.id);
      toast.success(`${title} account deleted`);
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
    <Card className="flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-muted/40",
                isActive ? "border-success/40" : "border-border/60"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4",
                  isActive ? "text-success" : "text-muted-foreground"
                )}
              />
            </div>
            <p className="font-semibold leading-snug">{title}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 pt-0.5">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                isActive ? "bg-success" : "bg-muted-foreground/30"
              )}
            />
            <span
              className={cn(
                "font-medium text-xs",
                isActive ? "text-success" : "text-muted-foreground"
              )}
            >
              {isActive ? "Active" : (status ?? "Unknown")}
            </span>
          </div>
        </div>
      </CardHeader>

      {renderAccountDetails && (
        <CardContent className="border-border/40 border-t pt-4">
          {renderAccountDetails(account)}
        </CardContent>
      )}

      <CardFooter
        className={cn(
          "border-border/40 border-t pt-4",
          !renderAccountDetails && "mt-auto"
        )}
      >
        <div className="flex w-full items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {renderActions?.(account)}
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
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                    Delete Account
                  </>
                )}
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete {title} Account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your {title} account. This
                    action cannot be undone.
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
          </div>
          {createdAtDate && (
            <span className="text-muted-foreground text-xs">
              {createdAtDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface IntegrationManagementProps<TAccount extends { id: string }> {
  integrationId: string;
  title: string;
  description: string;
  /** Protocol icon — falls back to INTEGRATION_ICONS[integrationId] or Plug */
  icon?: ComponentType<{ className?: string }>;
  /** Renders additional action buttons in the account card footer (e.g. reset password, webmail) */
  renderActions?: (account: TAccount) => ReactNode;
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
   * Call `onSuccess` to close the dialog after creation.
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

// ---------------------------------------------------------------------------
// IntegrationManagement — orchestrates card + setup dialog
// ---------------------------------------------------------------------------

export function IntegrationManagement<TAccount extends { id: string }>({
  integrationId,
  title,
  description,
  icon,
  renderActions,
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

  if (account) {
    return (
      <AccountCard
        account={account}
        icon={icon}
        integrationId={integrationId}
        renderAccountDetails={renderAccountDetails}
        renderActions={renderActions}
        title={title}
      />
    );
  }

  return (
    <>
      <EmptyCard
        description={description}
        icon={icon}
        integrationId={integrationId}
        onConfigure={() => setDialogOpen(true)}
        title={title}
      />
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
        icon={icon}
        integrationId={integrationId}
        onCreateSuccess={onCreateSuccess}
        onOpenChange={setDialogOpen}
        open={dialogOpen}
        renderCreateForm={renderCreateForm}
        title={title}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// SetupDialog — create a new account
// ---------------------------------------------------------------------------

function SetupDialog<TAccount extends { id: string }>({
  open,
  onOpenChange,
  integrationId,
  title,
  icon,
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
  icon?: ComponentType<{ className?: string }>;
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
  const Icon = icon ?? INTEGRATION_ICONS[integrationId] ?? Plug;
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
            <DialogTitle className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-muted/60">
                <Icon className="h-3.5 w-3.5" />
              </div>
              Set up {title}
            </DialogTitle>
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
            <DialogTitle className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-muted/60">
                <Icon className="h-3.5 w-3.5" />
              </div>
              Set up {title}
            </DialogTitle>
            <DialogDescription>
              Create your {title} account to get started.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {createInputLabel && (
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
                {createInputHelp && (
                  <p className="text-muted-foreground text-xs">
                    {createInputHelp}
                  </p>
                )}
              </div>
            )}
            {createSecondInputLabel && createSecondInputName && (
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
                {createSecondInputHelp && (
                  <p className="text-muted-foreground text-xs">
                    {createSecondInputHelp}
                  </p>
                )}
              </div>
            )}
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
