"use client";

import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { captureException } from "@sentry/nextjs";

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
  useIntegrationAccount,
} from "@/features/integrations/hooks/use-integration";
import type { MailcowAccount } from "@/features/integrations/lib/mailcow/types";
import { CreateMailboxRequestSchema } from "@/shared/schemas/integrations/mailcow";

type FormValues = z.infer<typeof CreateMailboxRequestSchema>;

interface MailcowCreateFormProps {
  integrationId: string;
  title: string;
  description: string;
  onSuccess?: (account: MailcowAccount) => void;
  /** Override button label (default: `Create ${title} Account`) */
  submitLabel?: string;
}

export function MailcowCreateForm({
  integrationId,
  title,
  description,
  onSuccess,
  submitLabel,
}: MailcowCreateFormProps) {
  const createMutation = useCreateIntegrationAccount<
    MailcowAccount,
    FormValues
  >(integrationId);
  const { refetch } = useIntegrationAccount<MailcowAccount>(integrationId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(CreateMailboxRequestSchema),
    defaultValues: {
      local_part: "",
      password: "",
      password2: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const account = await createMutation.mutateAsync(data);
      toast.success(`${title} account created`, {
        description: `Your email ${data.local_part}@... has been created. Use the password you set to log in.`,
      });
      reset();
      await refetch();
      onSuccess?.(account);
    } catch (error) {
      captureException(error);
      toast.error(`Failed to create ${title.toLowerCase()} account`, {
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while creating your account.",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="font-semibold text-lg">{title}</div>
        <p className="text-muted-foreground text-sm">{description}</p>
      </CardHeader>
      <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor={`${integrationId}-local_part`}>
              Email username
            </Label>
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
            <p className="text-muted-foreground text-sm">
              Letters, numbers, dots, hyphens, or underscores. Must start with a
              letter or number.
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
            <Label htmlFor={`${integrationId}-password2`}>
              Confirm password
            </Label>
            <Input
              aria-describedby={
                errors.password2
                  ? `${integrationId}-password2-error`
                  : undefined
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
        </CardContent>
        <CardFooter className="border-border border-t pt-6">
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
              submitLabel ?? `Create ${title} Account`
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
