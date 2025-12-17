"use client";

import {
  Turnstile,
  type TurnstileInstance,
  type TurnstileProps,
} from "@marsidev/react-turnstile";
import { useRef } from "react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { useController } from "react-hook-form";

type BaseCaptchaFieldProps = {
  siteKey: string | undefined;
  options?: TurnstileProps;
  nonce?: string;
};

interface StandaloneCaptchaFieldProps extends BaseCaptchaFieldProps {
  onTokenChange: (token: string) => void;
  onInstanceChange?: (instance: TurnstileInstance | null) => void;
  control?: never;
  name?: never;
}

interface ReactHookFormCaptchaFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseCaptchaFieldProps {
  control: Control<TFieldValues>;
  name: TName;
  onTokenChange?: never;
  onInstanceChange?: never;
}

type CaptchaFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> =
  | StandaloneCaptchaFieldProps
  | ReactHookFormCaptchaFieldProps<TFieldValues, TName>;

/**
 * @name CaptchaField
 * @description Self-contained captcha component with two modes:
 *
 * **Standalone mode** - For use outside react-hook-form:
 * ```tsx
 * <CaptchaField
 *   siteKey={siteKey}
 *   onTokenChange={setToken}
 * />
 * ```
 *
 * **React Hook Form mode** - Automatic form integration:
 * ```tsx
 * <CaptchaField
 *   siteKey={siteKey}
 *   control={form.control}
 *   name="captchaToken"
 * />
 * ```
 */
export function CaptchaField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: CaptchaFieldProps<TFieldValues, TName>) {
  const { siteKey, options, nonce } = props;
  const instanceRef = useRef<TurnstileInstance | null>(null);

  const control = props.control;

  const defaultOptions: Partial<TurnstileProps> = {
    options: {
      size: "invisible",
    },
  };

  if (!control) {
    if (!siteKey) {
      return null;
    }

    return (
      <Turnstile
        onSuccess={(token) => {
          props.onTokenChange(token);
        }}
        ref={(instance) => {
          if (instance) {
            instanceRef.current = instance;
            props.onInstanceChange?.(instance);
          }
        }}
        scriptOptions={{
          nonce,
        }}
        siteKey={siteKey}
        {...defaultOptions}
        {...options}
      />
    );
  }

  // React Hook Form integration
  // biome-ignore lint/correctness/useHookAtTopLevel: hook only used in controlled mode
  const controller = useController({
    control,
    name: props.name,
  });

  if (!siteKey) {
    return null;
  }

  const handleSuccess = (token: string) => {
    if (controller) {
      // React Hook Form mode - use setValue from controller
      controller.field.onChange(token);
    }
  };

  const handleInstanceChange = (instance: TurnstileInstance | null) => {
    instanceRef.current = instance;

    // Standalone mode handles onInstanceChange above
  };

  return (
    <Turnstile
      onSuccess={handleSuccess}
      ref={(instance) => {
        if (instance) {
          handleInstanceChange(instance);
        }
      }}
      scriptOptions={{
        nonce,
      }}
      siteKey={siteKey}
      {...defaultOptions}
      {...options}
    />
  );
}
