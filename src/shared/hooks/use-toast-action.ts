import { useCallback } from "react";
import { toast } from "~/components/ui/sonner";

/**
 * Hook for handling async actions with toast notifications.
 * Provides a consistent pattern for form submissions with loading, success, and error states.
 *
 * @example
 * ```tsx
 * const { execute } = useToastAction({
 *   success: 'Saved successfully',
 *   error: 'Failed to save',
 *   loading: 'Saving...',
 * });
 *
 * const handleSubmit = async (data) => {
 *   await execute(async () => {
 *     await someAction(data);
 *   });
 * };
 * ```
 */
export function useToastAction(messages: {
  success: string;
  error: string;
  loading: string;
}) {
  const execute = useCallback(
    async <TResult = void>(
      action: () => Promise<TResult>
    ): Promise<TResult | undefined> =>
      toast.promise(action, {
        success: messages.success,
        error: messages.error,
        loading: messages.loading,
      }),
    [messages]
  );

  return { execute };
}
