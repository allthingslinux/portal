"use client";

import type { ComponentType, ReactNode } from "react";
import { useState } from "react";
import {
  AlertCircle,
  BookOpen,
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
import { Card } from "@portal/ui/ui/card";
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
  mediawiki: BookOpen,
};

// Brand color classes per integration (bg for icon container)
const INTEGRATION_COLORS: Record<string, string> = {
  irc: "bg-indigo-500",
  xmpp: "bg-amber-500",
  mailcow: "bg-blue-500",
  mediawiki: "bg-emerald-500",
};

// Subtle tint for the card top section background
const INTEGRATION_TINTS: Record<string, string> = {
  irc: "bg-indigo-500/10",
  xmpp: "bg-amber-500/10",
  mailcow: "bg-blue-500/10",
  mediawiki: "bg-emerald-500/10",
};

function getIntegrationColor(integrationId: string): string {
  return INTEGRATION_COLORS[integrationId] ?? "bg-violet-500";
}

function getIntegrationTint(integrationId: string): string {
  return INTEGRATION_TINTS[integrationId] ?? "bg-violet-500/10";
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
  const colorClass = getIntegrationColor(integrationId);
  const tintClass = getIntegrationTint(integrationId);
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-dashed bg-card text-card-foreground text-sm shadow-xs">
      {/* Tinted header */}
      <div
        className={cn("flex items-center justify-between px-6 py-5", tintClass)}
      >
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl",
            colorClass
          )}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
        <span className="rounded-full border border-muted-foreground/30 bg-muted-foreground/10 px-3 py-1 font-semibold text-muted-foreground text-xs uppercase tracking-widest">
          Not Connected
        </span>
      </div>
      {/* Body */}
      <div className="flex-1 px-6 py-5">
        <p className="font-bold text-xl leading-tight">{title}</p>
        <p className="mt-1.5 text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
      </div>
      {/* Footer */}
      <div className="border-border/40 border-t px-6 pt-4 pb-5">
        <Button className="w-full" onClick={onConfigure} variant="secondary">
          <Plus className="mr-2 h-4 w-4" />
          Connect {title}
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AccountCard — integration configured, account details shown inline
// ---------------------------------------------------------------------------

function AccountCard<TAccount extends { id: string }>({
  integrationId,
  title,
  description,
  account,
  icon,
  renderAccountDetails,
  renderActions,
}: {
  integrationId: string;
  title: string;
  description?: string;
  account: TAccount;
  icon?: ComponentType<{ className?: string }>;
  renderAccountDetails?: (account: TAccount) => ReactNode;
  renderActions?: (account: TAccount) => ReactNode;
}) {
  const status =
    "status" in account && typeof account.status === "string"
      ? account.status
      : null;
  const isActive = status === "active" || status === null;
  const Icon = icon ?? INTEGRATION_ICONS[integrationId] ?? Plug;
  const colorClass = getIntegrationColor(integrationId);
  const tintClass = getIntegrationTint(integrationId);
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
    <div className="flex flex-col overflow-hidden rounded-xl bg-card text-card-foreground text-sm shadow-xs ring-1 ring-foreground/10">
      {/* Tinted header */}
      <div
        className={cn("flex items-center justify-between px-6 py-5", tintClass)}
      >
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl",
            colorClass
          )}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
        <span
          className={cn(
            "rounded-full border px-3 py-1 font-semibold text-xs uppercase tracking-widest",
            isActive
              ? "border-green-500/40 bg-green-500/10 text-green-400"
              : "border-muted-foreground/30 bg-muted-foreground/10 text-muted-foreground"
          )}
        >
          {isActive ? "Connected" : (status ?? "Unknown")}
        </span>
      </div>

      {/* Title + description */}
      <div className="px-6 py-5">
        <p className="font-bold text-xl leading-tight">{title}</p>
        {description && (
          <p className="mt-1.5 text-muted-foreground text-sm leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Account details */}
      {renderAccountDetails && (
        <div className="border-border/40 border-t px-6 pt-4 pb-5">
          {renderAccountDetails(account)}
        </div>
      )}

      {/* Footer actions */}
      <div className="mt-auto flex flex-row gap-2 border-border/40 border-t px-6 pt-4 pb-5">
        {renderActions && (
          <div className="flex-1">{renderActions(account)}</div>
        )}
        <div className={renderActions ? "flex-1" : "w-full"}>
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  className="w-full"
                  disabled={deleteMutation.isPending}
                  size="sm"
                  variant="outline"
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
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface IntegrationManagementProps<TAccount extends { id: string }> {
  createInputHelp?: string;
  createInputLabel?: string;
  createInputName?: string;
  createInputPlaceholder?: string;
  /** @deprecated Use createSchema with required field instead */
  createInputRequired?: boolean;
  /** @deprecated Provide createSchema for validation; payload is derived from form data */
  createInputToPayload?: (value: string) => Record<string, unknown>;
  createLabel: string;
  createSchema?: ZodType<unknown>;
  createSecondInputHelp?: string;
  createSecondInputLabel?: string;
  createSecondInputName?: string;
  createSecondInputPlaceholder?: string;
  createSecondInputType?: string;
  description: string;
  /** Protocol icon — falls back to INTEGRATION_ICONS[integrationId] or Plug */
  icon?: ComponentType<{ className?: string }>;
  integrationId: string;
  onCreateSuccess?: (account: TAccount) => void;
  renderAccountDetails?: (account: TAccount) => ReactNode;
  /** Renders additional action buttons in the account card footer (e.g. reset password, webmail) */
  renderActions?: (account: TAccount) => ReactNode;
  /**
   * Custom create form rendered inside the setup dialog.
   * When provided, replaces the default input fields entirely.
   * Call `onSuccess` to close the dialog after creation.
   */
  renderCreateForm?: (props: {
    onSuccess: (account: TAccount) => void;
    isPending: boolean;
  }) => ReactNode;
  title: string;
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
        description={description}
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
