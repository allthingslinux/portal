import { isRedirectError } from "next/dist/client/components/redirect-error";
import { useState, useTransition } from "react";

export function useDialogForm<T>(
  onSubmit: (formValues: T) => Promise<{ error?: unknown } | undefined>,
  options: {
    preventCloseOnSuccess?: boolean;
    onSuccess?: () => void;
    onError?: () => void;
  } = {}
) {
  const [error, setError] = useState<boolean>(false);
  const [pending, startTransition] = useTransition();

  const handleSubmit = async (formValues: T) => {
    startTransition(async () => {
      try {
        setError(false);
        const result = await onSubmit(formValues);

        if (result?.error) {
          setError(true);
          options.onError?.();
        } else if (!options.preventCloseOnSuccess) {
          options.onSuccess?.();
        }
      } catch (caughtError) {
        if (!isRedirectError(caughtError)) {
          setError(true);
          options.onError?.();
        }
      }
    });
  };

  const resetError = () => setError(false);

  return {
    error,
    pending,
    handleSubmit,
    resetError,
  };
}
