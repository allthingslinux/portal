"use client";

import { type Label as LabelPrimitive, Slot } from "radix-ui";
import * as React from "react";
import type { ControllerProps, FieldPath, FieldValues } from "react-hook-form";
import { Controller, FormProvider, useFormContext } from "react-hook-form";
import { Trans } from "~/components/portal/trans";
import { cn } from "../lib/utils";
import { Label } from "./label";

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => (
  <FormFieldContext.Provider value={{ name: props.name }}>
    <Controller {...props} />
  </FormFieldContext.Provider>
);

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
);

const FormItem: React.FC<React.ComponentPropsWithRef<"div">> = ({
  className,
  ...props
}) => {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div className={cn("flex flex-col gap-y-2", className)} {...props} />
    </FormItemContext.Provider>
  );
};
FormItem.displayName = "FormItem";

const FormLabel: React.FC<
  React.ComponentPropsWithRef<typeof LabelPrimitive.Root>
> = ({ className, ...props }) => {
  const { error, formItemId } = useFormField();

  return (
    <Label
      className={cn(error && "text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  );
};
FormLabel.displayName = "FormLabel";

const FormControl: React.FC<
  React.ComponentPropsWithoutRef<typeof Slot.Root>
> = ({ ...props }) => {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return (
    <Slot.Root
      aria-describedby={
        error ? `${formDescriptionId} ${formMessageId}` : `${formDescriptionId}`
      }
      aria-invalid={!!error}
      id={formItemId}
      {...props}
    />
  );
};
FormControl.displayName = "FormControl";

const FormDescription: React.FC<React.ComponentPropsWithRef<"p">> = ({
  className,
  ...props
}) => {
  const { formDescriptionId } = useFormField();

  return (
    <p
      className={cn("text-[0.8rem] text-muted-foreground", className)}
      id={formDescriptionId}
      {...props}
    />
  );
};
FormDescription.displayName = "FormDescription";

const FormMessage: React.FC<React.ComponentPropsWithRef<"p">> = ({
  className,
  children,
  ...props
}) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message) : children;

  if (!body) {
    return null;
  }

  return (
    <p
      className={cn("font-medium text-[0.8rem] text-destructive", className)}
      id={formMessageId}
      {...props}
    >
      {typeof body === "string" ? (
        <Trans defaults={body} i18nKey={body} />
      ) : (
        body
      )}
    </p>
  );
};
FormMessage.displayName = "FormMessage";

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
};
