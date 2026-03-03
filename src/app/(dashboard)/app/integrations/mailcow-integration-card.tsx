"use client";

import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { captureException } from "@sentry/nextjs";

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MailcowAccountDetails } from "./mailcow-account-details";
import { IntegrationManagement } from "@/features/integrations/components/integration-management";
import { useCreateIntegrationAccount } from "@/features/integrations/hooks/use-integration";
import type { MailcowAccount } from "@/features/integrations/lib/mailcow/types";
import { CreateMailboxRequestSchema } from "@/shared/schemas/integrations/mailcow";

type FormValues = z.infer<typeof CreateMailboxRequestSchema>;

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
  return (
    <IntegrationManagement<MailcowAccount>
      createLabel="Create Email Account"
      description={description}
      integrationId={integrationId}
      renderAccountDetails={(account) => (
        <MailcowAccountDetails
          account={account}
          integrationId={integrationId}
        />
      )}
      renderCreateForm={({ onSuccess }) => (
        <MailcowCreateFields
          integrationId={integrationId}
          onSuccess={onSuccess}
          title={title}
        />
      )}
      title={title}
    />
  );
}

function MailcowCreateFields({
  integrationId,
  title,
  onSuccess,
}: {
  integrationId: string;
  title: string;
  onSuccess: (account: MailcowAccount) => void;
}) {
  const createMutation = useCreateIntegrationAccount<
    MailcowAccount,
    FormValues
  >(integrationId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(CreateMailboxRequestSchema),
    defaultValues: { local_part: "", password: "", password2: "" },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const account = await createMutation.mutateAsync(data);
      toast.success(`${title} account created`);
      reset();
      onSuccess(account);
    } catch (err) {
      captureException(err);
      toast.error(
        err instanceof Error
          ? err.message
          : `Failed to create ${title.toLowerCase()} account`
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor={`${integrationId}-local_part`}>Email username</Label>
          <Input
            aria-describedby={
              errors.local_part
                ? `${integrationId}-local_part-error`
                : undefined
            }
            aria-invalid={!!errors.local_part}
            autoComplete="username"
            disabled={createMutation.isPending}
            id={`${integrationId}-local_part`}
            placeholder="e.g. john.doe"
            {...register("local_part")}
          />
          {errors.local_part?.message && (
            <p
              className="font-medium text-destructive text-sm"
              id={`${integrationId}-local_part-error`}
              role="alert"
            >
              {errors.local_part.message}
            </p>
          )}
          <p className="text-muted-foreground text-xs">
            Letters, numbers, dots, hyphens, or underscores.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${integrationId}-password`}>Password</Label>
          <Input
            aria-describedby={
              errors.password ? `${integrationId}-password-error` : undefined
            }
            aria-invalid={!!errors.password}
            autoComplete="new-password"
            disabled={createMutation.isPending}
            id={`${integrationId}-password`}
            placeholder="Min 8 characters"
            type="password"
            {...register("password")}
          />
          {errors.password?.message && (
            <p
              className="font-medium text-destructive text-sm"
              id={`${integrationId}-password-error`}
              role="alert"
            >
              {errors.password.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${integrationId}-password2`}>Confirm password</Label>
          <Input
            aria-describedby={
              errors.password2 ? `${integrationId}-password2-error` : undefined
            }
            aria-invalid={!!errors.password2}
            autoComplete="new-password"
            disabled={createMutation.isPending}
            id={`${integrationId}-password2`}
            placeholder="Re-enter password"
            type="password"
            {...register("password2")}
          />
          {errors.password2?.message && (
            <p
              className="font-medium text-destructive text-sm"
              id={`${integrationId}-password2-error`}
              role="alert"
            >
              {errors.password2.message}
            </p>
          )}
        </div>
      </div>
      <DialogFooter>
        <Button disabled={createMutation.isPending} type="submit">
          {createMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            `Create ${title} Account`
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}
