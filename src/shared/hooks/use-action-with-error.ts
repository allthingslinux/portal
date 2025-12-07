import { useState, useTransition } from 'react';
import { isRedirectError } from 'next/dist/client/components/redirect-error';

/**
 * Hook for handling async actions with error and pending states.
 * Provides a consistent pattern for form submissions and other async operations.
 *
 * @example
 * ```tsx
 * const { pending, error, execute } = useActionWithError();
 *
 * const handleSubmit = async (data) => {
 *   await execute(async () => {
 *     await someAction(data);
 *   });
 * };
 * ```
 */
export function useActionWithError<TResult = void>() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<boolean>(false);

  const execute = async (
    action: () => Promise<TResult>,
    options?: {
      onSuccess?: (result: TResult) => void;
      onError?: (error: unknown) => void;
    },
  ): Promise<TResult | undefined> => {
    return new Promise((resolve) => {
      startTransition(async () => {
        try {
          setError(false);
          const result = await action();
          options?.onSuccess?.(result);
          resolve(result);
        } catch (err) {
          if (!isRedirectError(err)) {
            setError(true);
            options?.onError?.(err);
          }
          resolve(undefined);
        }
      });
    });
  };

  const resetError = () => setError(false);

  return {
    pending,
    error,
    execute,
    resetError,
  };
}

