import { useState, useTransition } from 'react';
import { isRedirectError } from 'next/dist/client/components/redirect-error';

export function useDialogForm<T>(
  onSubmit: (data: T) => Promise<{ error?: any } | void>,
  options: {
    preventCloseOnSuccess?: boolean;
    onSuccess?: () => void;
    onError?: () => void;
  } = {}
) {
  const [error, setError] = useState<boolean>(false);
  const [pending, startTransition] = useTransition();

  const handleSubmit = async (data: T) => {
    startTransition(async () => {
      try {
        setError(false);
        const result = await onSubmit(data);

        if (result?.error) {
          setError(true);
          options.onError?.();
        } else {
          if (!options.preventCloseOnSuccess) {
            options.onSuccess?.();
          }
        }
      } catch (error) {
        if (!isRedirectError(error)) {
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