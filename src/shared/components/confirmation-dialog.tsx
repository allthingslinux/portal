"use client";

import { zodResolver } from "@hookform/resolvers/zod";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { useState, useTransition } from "react";
import type { DefaultValues, SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { If } from "~/components/makerkit/if";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button, type ButtonProps } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";

/**
 * Schema for confirmation field - validates that user typed the confirmation text
 */
function createConfirmationSchema(confirmationText: string) {
  return z.object({
    confirmation: z.custom<string>((value) => value === confirmationText),
  });
}

type ConfirmationDialogProps<
  TData extends Record<string, unknown>,
  TResult = void,
> = {
  /** Trigger element (usually a button) */
  children: React.ReactNode;
  /** Dialog title */
  title: string;
  /** Dialog description */
  description: React.ReactNode;
  /** Action to perform on confirmation */
  onConfirm: (data: TData) => Promise<TResult>;
  /** Schema for additional form fields (beyond confirmation) */
  schema?: z.ZodType<TData>;
  /** Default values for form fields */
  defaultValues?: Partial<TData & { confirmation: string }>;
  /** Confirmation text user must type (default: "CONFIRM") */
  confirmationText?: string;
  /** Label for confirmation field */
  confirmationLabel?: React.ReactNode;
  /** Description for confirmation field */
  confirmationDescription?: React.ReactNode;
  /** Button text */
  buttonText: string;
  /** Button text when pending */
  pendingText?: string;
  /** Button variant */
  buttonVariant?: ButtonProps["variant"];
  /** Error message to display */
  errorMessage?: string;
  /** Test ID for the form */
  testId?: string;
  /** Custom error handler */
  onError?: (error: unknown) => void;
  /** Custom success handler with result */
  onSuccess?: (result: TResult) => void;
};

/**
 * Shared confirmation dialog component for admin actions.
 * Handles confirmation input, error states, and form submission.
 */
export function ConfirmationDialog<
  TData extends Record<string, unknown>,
  TResult = void,
>({
  children,
  title,
  description,
  onConfirm,
  schema,
  defaultValues,
  confirmationText = "CONFIRM",
  confirmationLabel,
  confirmationDescription,
  buttonText,
  pendingText,
  buttonVariant = "destructive",
  errorMessage,
  testId,
  onError,
  onSuccess,
}: ConfirmationDialogProps<TData, TResult>) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<boolean>(false);

  type FormValues = TData & { confirmation: string };

  const confirmationSchema = createConfirmationSchema(confirmationText);
  const finalSchema = (
    schema ? z.intersection(schema, confirmationSchema) : confirmationSchema
  ) as z.ZodType<FormValues>;

  const form = useForm<FormValues>({
    resolver: zodResolver(finalSchema as z.ZodTypeAny),
    defaultValues: {
      confirmation: "",
      ...(defaultValues ?? {}),
    } as DefaultValues<FormValues>,
  });

  const handleSubmit: SubmitHandler<FormValues> = (data) => {
    startTransition(async () => {
      try {
        setError(false);
        const result = await onConfirm(data);
        onSuccess?.(result);
      } catch (err) {
        if (!isRedirectError(err)) {
          setError(true);
          onError?.(err);
        }
      }
    });
  };

  const defaultConfirmationLabel = (
    <>
      Type <b>{confirmationText}</b> to confirm
    </>
  );

  const defaultConfirmationDescription = "Are you sure you want to do this?";

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        <Form {...form}>
          <form
            className={"flex flex-col space-y-8"}
            data-test={testId}
            onSubmit={form.handleSubmit(
              handleSubmit as SubmitHandler<FormValues>
            )}
          >
            <If condition={error}>
              <Alert variant={"destructive"}>
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {errorMessage ||
                    "There was an error. Please check the server logs to see what went wrong."}
                </AlertDescription>
              </Alert>
            </If>

            <FormField
              name={"confirmation"}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {confirmationLabel || defaultConfirmationLabel}
                  </FormLabel>

                  <FormControl>
                    <Input
                      pattern={confirmationText}
                      placeholder={`Type ${confirmationText} to confirm`}
                      required
                      {...field}
                    />
                  </FormControl>

                  <FormDescription>
                    {confirmationDescription || defaultConfirmationDescription}
                  </FormDescription>

                  <FormMessage />
                </FormItem>
              )}
            />

            <AlertDialogFooter>
              <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>

              <Button
                disabled={pending}
                type={"submit"}
                variant={buttonVariant}
              >
                {pending ? pendingText || `${buttonText}...` : buttonText}
              </Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
